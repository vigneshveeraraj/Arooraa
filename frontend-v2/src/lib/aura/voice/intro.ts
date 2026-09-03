/**
 * Whether this browser has already met Aura's microphone.
 *
 * <p>The owner's finding was that "Speak naturally — English · தமிழ் · Tanglish" sat permanently in
 * the panel, taking conversation space from every visitor in order to tell them something that only
 * matters at one moment: the first time they reach for the microphone. So the guidance moved to
 * that moment, and this is the one bit of memory it needs.
 *
 * <p>Deliberately not a preference and deliberately not a store. It is written once, read once per
 * recording, and nothing subscribes to it — so unlike the "read answers aloud" preference it needs
 * no cross-tab synchronisation and no server snapshot, because it is never read during a render.
 * It is read inside the click handler that starts recording, which cannot run on a server.
 *
 * <p>Nothing about it reaches the backend. There is no account, no cookie and no identifier: a
 * visitor is not tracked in order to be shown one sentence once.
 */
const STORAGE_KEY = "arooraa.aura.voice-intro-seen";

/**
 * False when storage cannot be read at all — a private window, site data blocked, a browser that
 * throws on the first access. The consequence is that the introduction appears again, which is a
 * small repetition rather than a failure; voice itself never depends on this answer.
 */
export function hasSeenVoiceIntro(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markVoiceIntroSeen(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // Storage unavailable. The visitor sees the guidance again next time, and can still speak.
  }
}
