import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAuraVoiceApiClient } from "./voice-client";
import { MAX_UPLOAD_BYTES } from "./recorder";
import { recordingBlob } from "./test-support";

/**
 * The voice client's whole job is to keep a browser talking to aura-service and to nobody else,
 * and to turn every way that can fail into one sentence Aura would say.
 */
describe("the Aura voice client", () => {
  const client = createAuraVoiceApiClient();
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  /**
   * Built from raw bytes rather than from a Blob: in this environment `Response` comes from undici
   * and `Blob` from jsdom, and undici does not recognise the other one — it stringifies it to
   * "[object Blob]", which is a 13-byte body and a confusing afternoon.
   */
  function audioResponse(bytes: number): Response {
    return new Response(new Uint8Array(bytes), { status: 200 });
  }

  function recording(bytes = 50_000) {
    return { blob: recordingBlob(bytes), durationMs: 3_142, mimeType: "audio/webm;codecs=opus" };
  }

  // --- where requests go --------------------------------------------------------------------

  it("only ever talks to aura-service", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { text: "Hello" }));
    await client.transcribe(recording());
    await client.speak("conversation-1");
    await client.capabilities();

    for (const [url] of fetchMock.mock.calls) {
      expect(String(url)).toMatch(/^\/api\/aura\/voice\//);
      // The browser has never been told where a provider lives, and could not reach one if it
      // wanted to. Audio goes to our service, which holds the credential.
      expect(String(url)).not.toContain("openai");
      expect(String(url)).not.toContain("api.openai.com");
    }
  });

  it("sends no credential of any kind", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { text: "Hello" }));
    await client.transcribe(recording());

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers ?? {});
    expect(headers.get("Authorization")).toBeNull();
    expect(JSON.stringify(init.headers ?? {})).not.toContain("sk-");
  });

  // --- capabilities -------------------------------------------------------------------------

  it("reports what the backend says voice can do", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { transcription: true, synthesis: true, maxRecordingSeconds: 45 }),
    );

    expect(await client.capabilities()).toEqual({
      transcription: true,
      synthesis: true,
      maxRecordingSeconds: 45,
    });
  });

  it("reports nothing at all when voice is switched off on the backend", async () => {
    // A backend with aura.voice.enabled=false does not register the controller, so the route is a
    // 404 rather than a "false" — which the client has to read as "there is no voice here".
    fetchMock.mockResolvedValue(jsonResponse(404, {}));
    expect(await client.capabilities()).toBeNull();
  });

  it("reports nothing when the backend cannot be reached", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await client.capabilities()).toBeNull();
  });

  // --- transcription ------------------------------------------------------------------------

  it("uploads the recording and the duration it measured", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { text: "What is MESA?" }));
    const result = await client.transcribe(recording());

    expect(result).toEqual({ ok: true, value: "What is MESA?" });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const form = init.body as FormData;
    expect(form.get("durationMs")).toBe("3142");
    expect(form.get("audio")).toBeInstanceOf(Blob);
  });

  it("names the uploaded part for the container the browser recorded in", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { text: "Hello" }));
    await client.transcribe({ blob: recordingBlob(1000, "audio/mp4"), durationMs: 900, mimeType: "audio/mp4" });

    const form = (fetchMock.mock.calls[0]?.[1] as RequestInit).body as FormData;
    expect((form.get("audio") as File).name).toBe("speech.mp4");
  });

  it("refuses an oversize recording before uploading it", async () => {
    // The server would refuse it too, but it refuses by closing the connection mid-upload, which
    // a visitor experiences as a broken feature rather than as a sentence.
    const result = await client.transcribe({
      blob: recordingBlob(MAX_UPLOAD_BYTES + 1),
      durationMs: 300_000,
      mimeType: "audio/webm",
    });

    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps a Tamil transcript in Tamil", async () => {
    const tamil = "MESA பற்றி சொல்லுங்கள்";
    fetchMock.mockResolvedValue(jsonResponse(200, { text: tamil }));

    const result = await client.transcribe(recording());
    expect(result).toEqual({ ok: true, value: tamil });
  });

  it("keeps a Tanglish transcript exactly as it was spoken", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { text: "MESA epdi work aagum?" }));

    const result = await client.transcribe(recording());
    expect(result).toEqual({ ok: true, value: "MESA epdi work aagum?" });
  });

  it("treats an empty transcript as nothing heard", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { text: "   " }));

    const result = await client.transcribe(recording());
    expect(result.ok).toBe(false);
  });

  it.each([
    ["UNSUPPORTED_AUDIO_TYPE", 400, "AUDIO_REJECTED"],
    ["AUDIO_TOO_SHORT", 400, "AUDIO_REJECTED"],
    ["AUDIO_TOO_LARGE", 413, "TOO_LARGE"],
    ["TRANSCRIPTION_UNAVAILABLE", 503, "UNAVAILABLE"],
    ["TRANSCRIPTION_FAILED", 503, "AUDIO_REJECTED"],
  ])("turns a %s from the backend into a %i as kind %s", async (code, status, kind) => {
    fetchMock.mockResolvedValue(jsonResponse(status, { code, message: "ignored" }));

    const result = await client.transcribe(recording());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe(kind);
  });

  it("falls back on the status when the backend sends a code it has never seen", async () => {
    fetchMock.mockResolvedValue(jsonResponse(503, { code: "SOMETHING_NEW" }));

    const result = await client.transcribe(recording());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("UNAVAILABLE");
  });

  it("never renders the backend's own message", async () => {
    // Every visitor-facing sentence is written in this file. A message from a backend — or from a
    // provider that a backend forwarded — is not something to show anyone.
    fetchMock.mockResolvedValue(
      jsonResponse(503, { code: "TRANSCRIPTION_FAILED", message: "OPENAI_RATE_LIMITED at api.openai.com" }),
    );

    const result = await client.transcribe(recording());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).not.toContain("OPENAI");
      expect(result.message).not.toContain("openai");
    }
  });

  it("reports a network failure as one", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const result = await client.transcribe(recording());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("NETWORK");
  });

  // --- speaking -----------------------------------------------------------------------------

  it("asks for an answer by conversation, never by sending text to be spoken", async () => {
    fetchMock.mockResolvedValue(audioResponse(64));
    await client.speak("conversation-1", 3);

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body).toEqual({ conversationId: "conversation-1", sequence: 3 });
    // There is no text field, and the endpoint has none to receive one — which is what stops Aura
    // being a free text-to-speech service for anyone who finds the URL.
    expect(Object.keys(body)).not.toContain("text");
  });

  it("asks for the latest answer when no turn is named", async () => {
    fetchMock.mockResolvedValue(audioResponse(64));
    await client.speak("conversation-1");

    const body = JSON.parse(String((fetchMock.mock.calls[0]?.[1] as RequestInit).body));
    expect(body.sequence).toBeUndefined();
  });

  it("returns the audio to play", async () => {
    fetchMock.mockResolvedValue(audioResponse(64));

    const result = await client.speak("conversation-1");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.size).toBe(64);
  });

  it("reports having nothing to say in a conversation with no answer yet", async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { code: "NOTHING_TO_SPEAK" }));

    const result = await client.speak("conversation-1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("NOTHING_TO_SPEAK");
  });

  it("treats an empty audio body as a failure rather than as silence", async () => {
    fetchMock.mockResolvedValue(audioResponse(0));

    const result = await client.speak("conversation-1");
    expect(result.ok).toBe(false);
  });
});
