'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { createWebhookProxy } = require('./whatsapp-webhook-proxy.cjs');
test('sandbox proxy exposes only bounded webhook traffic and preserves signed bytes', async () => {
  const received = [];
  const backend = http.createServer((req,res) => {
    const body=[];
    req.on('data',c=>body.push(c));
    req.on('end',()=>{
      received.push({url:req.url,headers:req.headers,body:Buffer.concat(body)});
      if (req.url.includes('fail=1')) { res.writeHead(401); res.end('private backend detail'); return; }
      res.writeHead(200,{'Set-Cookie':'private=1'});
      res.end(req.method==='GET'?'challenge-123':'OK');
    });
  });
  backend.listen(0,'127.0.0.1'); await once(backend,'listening');
  const proxy = createWebhookProxy({backendPort:backend.address().port}).server;
  proxy.listen(0,'127.0.0.1'); await once(proxy,'listening');
  const request = (path, method='GET', body=Buffer.alloc(0), headers={}) => new Promise((resolve,reject) => {
    const req=http.request({hostname:'127.0.0.1',port:proxy.address().port,path,method,
      headers:{'Content-Length':body.length,...headers}},res=>{
      const parts=[]; res.on('data',c=>parts.push(c)); res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(parts).toString()}));
    });
    req.on('error',reject); req.end(body);
  });
  try {
    assert.equal(proxy.address().address,'127.0.0.1');
    for (const path of ['/','/api/v1/admin/leads','/actuator/health','/api/v1/whatsapp/webhook/','/api/v1/whatsapp/%77ebhook','http://evil.test/api/v1/whatsapp/webhook']) {
      assert.equal((await request(path)).status,404);
    }
    assert.equal(received.length,0,'denied routes must never hit backend');
    const webhook='/api/v1/whatsapp/webhook';
    assert.equal((await request(webhook,'DELETE')).status,405);
    assert.equal((await request(webhook,'POST',Buffer.from('x'),{'Content-Encoding':'gzip'})).status,415);
    assert.equal((await request(webhook,'POST',Buffer.alloc(256*1024+1))).status,413);
    assert.equal((await request(webhook,'GET',Buffer.from('x'))).status,400);
    assert.equal(received.length,0);
    const challenge=await request(webhook+'?hub.mode=subscribe&hub.verify_token=test&hub.challenge=challenge-123');
    assert.equal(challenge.body,'challenge-123');
    assert.equal(challenge.headers['set-cookie'],undefined);
    assert.equal(challenge.headers['cache-control'],'no-store');
    const raw=Buffer.from('{"text":"தமிழ்"}','utf8');
    const signed=await request(webhook,'POST',raw,{'X-Hub-Signature-256':'sha256=fixture','Authorization':'Bearer must-not-forward','Cookie':'private=1','X-Forwarded-For':'spoof'});
    assert.equal(signed.status,200);
    const forwarded=received.at(-1);
    assert.deepEqual(forwarded.body,raw);
    assert.equal(forwarded.headers['x-hub-signature-256'],'sha256=fixture');
    for (const name of ['authorization','cookie','x-forwarded-for']) assert.equal(forwarded.headers[name],undefined);
    assert.equal((await request(webhook+'?fail=1')).body,'Unauthorized');
  } finally {
    await new Promise(r=>proxy.close(r));
    await new Promise(r=>backend.close(r));
  }
});
