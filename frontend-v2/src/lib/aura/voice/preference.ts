/**
 * Whether Aura should read its answers out loud, remembered in this browser and nowhere else.
 *
 * <p>`localStorage` rather than `sessionStorage`, which is the opposite of the choice made for the
 * conversation id — and deliberately so. A conversation is a thing in progress and should not
 * outlive the tab; "please speak to me" is a preference about how someone uses a website, and
 * having to set it again on every visit would be the kind of small rudeness that makes an
 * accessibility feature not worth using. It is still only ever this browser: there is no account,
 * no cookie, and nothing about it reaches the server.
 *
 * <p>Exposed as a subscribable store rather than as a plain getter, so React can read it with
 * {@code useSyncExternalStore}. That is not ceremony: this page is statically exported, so
 * `window` does not exist while it is prerendered, and a component that read storage during render
 * would produce one tree on the server and another on the client. A store with a separate server
 * snapshot is React's own answer to exactly that, and it costs an effect and a hydration mismatch
 * less than the alternatives. It also means a second tab turning speech off is honoured here.
 *
 * <p>Every access is guarded. A browser with site data blocked throws on the first read, and voice
 * refusing to work because storage is disabled would be a much worse failure than a preference
 * that resets.
 */
const STORAGE_KEY = "arooraa.aura.speakAnswers";

/**
 * Off unless the visitor has asked for it. Sound that starts on its own is the single most
 * intrusive thing a website can do, so the default is silence and the visitor turns it on — or
 * uses the microphone, which is its own request to be spoken to.
 */
export const SPEAK_ANSWERS_DEFAULT = false;

const listeners = new Set<() => void>();

export function readSpeakAnswersPreference(): boolean {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "true") return true;
    if (value === "false") return false;
    return SPEAK_ANSWERS_DEFAULT;
  } catch {
    return SPEAK_ANSWERS_DEFAULT;
  }
}

export function storeSpeakAnswersPreference(speak: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(speak));
  } catch {
    // Storage unavailable: the preference still holds for this page view.
  }
  listeners.forEach((listener) => listener());
}

/**
 * The snapshot React reads. A boolean, so it compares by value and cannot loop the way a freshly
 * allocated object would.
 */
export function getSpeakAnswersSnapshot(): boolean {
  return readSpeakAnswersPreference();
}

/** What the prerender sees: the default, which is also what a first-time visitor gets. */
export function getSpeakAnswersServerSnapshot(): boolean {
  return SPEAK_ANSWERS_DEFAULT;
}

export function subscribeToSpeakAnswers(listener: () => void): () => void {
  listeners.add(listener);
  // `storage` fires in the *other* tabs, so this is what makes turning speech off in one tab
  // silence the rest of them.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
