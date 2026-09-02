/**
 * Playing what Aura says, and — just as importantly — stopping.
 *
 * <p>One utterance at a time, always. Starting a new one ends the previous one first, so a visitor
 * who taps the microphone while Aura is mid-sentence is not talked over by an answer they have
 * already decided to interrupt.
 *
 * <p>Every object URL created here is revoked, on every path out. A blob URL that is not revoked
 * keeps its audio alive in the tab for as long as the page is open, which for a feature that
 * promises not to retain recordings would be a poor thing to leave lying around.
 */
export interface AuraSpeaker {
  /** Resolves when playback finishes, is stopped, or cannot start. Never rejects. */
  play(audio: Blob, onEnded?: () => void): Promise<void>;
  stop(): void;
  isPlaying(): boolean;
  /** Releases everything. Called when the widget unmounts. */
  dispose(): void;
}

export function createAuraSpeaker(): AuraSpeaker {
  let element: HTMLAudioElement | null = null;
  let objectUrl: string | null = null;

  function release() {
    if (element) {
      element.onended = null;
      element.onerror = null;
      element.pause();
      // Detaching the source matters as much as revoking the URL: some browsers hold the decoded
      // buffer against the element, not the URL.
      element.removeAttribute("src");
      element.load?.();
      element = null;
    }
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }

  return {
    async play(audio: Blob, onEnded?: () => void): Promise<void> {
      release();
      objectUrl = URL.createObjectURL(audio);
      const player = new Audio(objectUrl);
      element = player;

      return new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          // Only tear down if this is still the current utterance — a newer play() has already
          // released this one and owns the element now.
          if (element === player) release();
          onEnded?.();
          resolve();
        };

        player.onended = finish;
        player.onerror = finish;

        // Autoplay policy: a browser may refuse this if the visitor has not interacted with the
        // page. Refusal is a rejected promise, not an exception, and it is not an error worth
        // showing anyone — the answer is on screen and can be replayed on a tap, which is itself
        // the interaction the browser was waiting for.
        player.play().catch(finish);
      });
    },

    stop() {
      release();
    },

    isPlaying(): boolean {
      return element !== null && !element.paused;
    },

    dispose() {
      release();
    },
  };
}
