import { afterEach, describe, expect, it } from "vitest";
import { createAuraSpeaker } from "./playback";
import { FakeAudio, installAudio, type AudioHarness } from "./test-support";

describe("the Aura speaker", () => {
  let audio: AudioHarness | null = null;

  afterEach(() => {
    audio?.restore();
    audio = null;
  });

  function clip(): Blob {
    return new Blob([new Uint8Array(64)], { type: "audio/mpeg" });
  }

  it("plays what it is given", async () => {
    audio = installAudio();
    const speaker = createAuraSpeaker();

    const playing = speaker.play(clip());
    FakeAudio.latest().end();
    await playing;

    expect(FakeAudio.instances).toHaveLength(1);
  });

  it("revokes the blob URL when playback finishes", async () => {
    audio = installAudio();
    const speaker = createAuraSpeaker();

    const playing = speaker.play(clip());
    FakeAudio.latest().end();
    await playing;

    expect(audio.revoked).toEqual(audio.created);
  });

  it("revokes the blob URL when playback is stopped part-way", async () => {
    audio = installAudio();
    const speaker = createAuraSpeaker();

    void speaker.play(clip());
    speaker.stop();

    expect(audio.revoked).toEqual(audio.created);
    expect(speaker.isPlaying()).toBe(false);
  });

  it("plays one utterance at a time", async () => {
    // A second answer must not talk over the first. Starting a new one ends the previous one.
    audio = installAudio();
    const speaker = createAuraSpeaker();

    void speaker.play(clip());
    const first = FakeAudio.latest();
    void speaker.play(clip());

    expect(first.paused).toBe(true);
    expect(FakeAudio.instances).toHaveLength(2);
    expect(audio.revoked).toContain(audio.created[0]);
  });

  it("resolves rather than rejecting when a browser refuses to autoplay", async () => {
    audio = installAudio();
    const speaker = createAuraSpeaker();
    FakeAudio.refusePlay = true;

    // Refusal is a browser policy, not an error worth showing anyone: the answer is already on
    // screen, and the tap that replays it is itself the interaction the browser was waiting for.
    await expect(speaker.play(clip())).resolves.toBeUndefined();
    expect(audio.revoked).toEqual(audio.created);
  });

  it("reports whether it is currently speaking", async () => {
    audio = installAudio();
    const speaker = createAuraSpeaker();

    const playing = speaker.play(clip());
    expect(speaker.isPlaying()).toBe(true);

    FakeAudio.latest().end();
    await playing;
    expect(speaker.isPlaying()).toBe(false);
  });

  it("releases everything when disposed", async () => {
    audio = installAudio();
    const speaker = createAuraSpeaker();

    void speaker.play(clip());
    speaker.dispose();

    expect(audio.revoked).toEqual(audio.created);
  });

  it("calls back when an utterance ends on its own", async () => {
    audio = installAudio();
    const speaker = createAuraSpeaker();
    let ended = false;

    const playing = speaker.play(clip(), () => {
      ended = true;
    });
    FakeAudio.latest().end();
    await playing;

    expect(ended).toBe(true);
  });
});
