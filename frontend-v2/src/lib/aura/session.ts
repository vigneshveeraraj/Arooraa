/**
 * Where a conversation id lives between renders and reloads.
 *
 * <p>`sessionStorage`, deliberately: the id survives a refresh of the same tab, which is what a
 * visitor expects when they accidentally reload mid-conversation, and disappears when the tab
 * closes. There is no account, no cookie and no cross-session memory — Aura remembers a
 * conversation, never a person.
 *
 * <p>Every access is guarded. A browser with site data blocked throws on the first read, and a
 * chat panel that cannot open because storage is disabled would be a worse failure than one that
 * simply starts a new conversation each time.
 */
const STORAGE_KEY = "arooraa.aura.conversationId";

export function readStoredConversationId(): string | null {
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY);
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export function storeConversationId(conversationId: string): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, conversationId);
  } catch {
    // Storage unavailable: the conversation still works for this page view.
  }
}

export function clearStoredConversationId(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — see above.
  }
}
