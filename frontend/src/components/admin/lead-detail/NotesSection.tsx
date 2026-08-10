"use client";

import { useState, type FormEvent } from "react";
import type { NoteEntry } from "@/lib/admin/types";
import styles from "./panels.module.css";
import notesStyles from "./NotesSection.module.css";

export function NotesSection({
  notes,
  onAddNote,
  saving,
}: {
  notes: NoteEntry[];
  onAddNote: (note: string) => Promise<boolean>;
  saving: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      setError("Enter a note before saving.");
      return;
    }
    setError(null);
    const ok = await onAddNote(trimmed);
    if (ok) {
      setDraft("");
    } else {
      setError("Could not save the note. Please try again.");
    }
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Internal Notes</h2>

      <ul className={notesStyles.list}>
        {notes.length === 0 && <li className={notesStyles.empty}>No notes yet.</li>}
        {notes.map((note) => (
          <li key={note.id} className={notesStyles.note}>
            <div className={notesStyles.noteMeta}>
              <span className={notesStyles.noteAuthor}>{note.adminName}</span>
              <span className={notesStyles.noteDate}>{new Date(note.createdAt).toLocaleString()}</span>
            </div>
            <p className={notesStyles.noteBody}>{note.note}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className={notesStyles.form}>
        <label htmlFor="new-note" className={notesStyles.label}>
          Add a note
        </label>
        <textarea
          id="new-note"
          rows={3}
          maxLength={4000}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={saving}
        />
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btnGhostOnDark" disabled={saving}>
          {saving ? "Saving…" : "Add note"}
        </button>
      </form>
    </div>
  );
}
