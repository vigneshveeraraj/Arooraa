'use strict';
// Sandbox only. Cloudflared must target this listener, never the backend port.
const http = require('node:http');
const PATH = '/api/v1/whatsapp/webhook';
const MAX_BODY = 256 * 1024;
function createWebhookProxy({ backendPort = 8098, port = 8099 } = {}) {
  for (const p of [backendPort, port]) {
    if (!Number.isInteger(p) || p < 1 || p > 65535) throw new Error('Invalid sandbox port');
  }
  const server = http.createServer((req, res) => {
    const reject = (code) => {
      if (res.writableEnded) return;
      if (!res.headersSent) res.writeHead(code, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' });
      res.end(http.STATUS_CODES[code]);
      req.resume();
    };
    if (!req.url || req.url.length > 4096) return reject(414);
    if (req.url.split('?')[0] !== PATH) return reject(404);
    if (req.method !== 'GET' && req.method !== 'POST') return reject(405);
    if (req.headers['content-encoding'] && req.headers['content-encoding'] !== 'identity') return reject(415);
    const chunks = [];
    let size = 0, rejected = false;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY) {
        if (!rejected) { rejected = true; reject(413); }
      } else if (!rejected) chunks.push(chunk);
    });
    req.on('end', () => {
      if (rejected || res.destroyed) return;
      if (req.method === 'GET' && size) return reject(400);
      const body = Buffer.concat(chunks);
      const headers = { 'Content-Length': body.length, 'Content-Type': 'application/json' };
      const signature = req.headers['x-hub-signature-256'];
      if (signature) headers['X-Hub-Signature-256'] = signature;
      const upstream = http.request({
        hostname: '127.0.0.1', port: backendPort, path: req.url, method: req.method, headers,
      }, response => {
        const reply = [];
        let replySize = 0;
        response.on('data', chunk => {
          replySize += chunk.length;
          if (replySize > 65536) { upstream.destroy(); reject(502); }
          else reply.push(chunk);
        });
        response.on('end', () => {
          if (res.writableEnded) return;
          const status = response.statusCode || 502;
          res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
          // Only successful challenge/ack bodies leave the backend.
          res.end(status >= 200 && status < 300 ? Buffer.concat(reply) : (http.STATUS_CODES[status] || 'Error'));
        });
        response.on('error', () => reject(502));
      });
      upstream.setTimeout(15000, () => upstream.destroy());
      upstream.on('error', () => { if (!res.writableEnded) reject(502); });
      res.on('close', () => { if (!res.writableEnded) upstream.destroy(); });
      upstream.end(body);
    });
    req.on('error', () => { if (!res.writableEnded) reject(400); });
  });
  server.requestTimeout = 20000;
  server.headersTimeout = 10000;
  server.maxHeadersCount = 32;
  server.on('clientError', (_, socket) => socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n'));
  return { server, listen: () => server.listen(port, '127.0.0.1') };
}
module.exports = { createWebhookProxy };
if (require.main === module) {
  createWebhookProxy().listen();
  console.log('Sandbox webhook proxy listening on 127.0.0.1:8099; backend 127.0.0.1:8098.');
}
