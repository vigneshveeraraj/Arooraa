-- A8: retention, and the one schema change it needs.
--
-- V6 hung aura_events off aura_conversations with ON DELETE CASCADE, on the reasoning that
-- retention should be decided once, on the conversation, and everything else should follow. That is
-- right for a brief, for messages and for feedback — each is only meaningful as part of the
-- conversation it belongs to, and none of them can be read at all once that is gone.
--
-- It is wrong for events. An event holds no words: a mode, an evidence level, a language, a page
-- subject, a latency. It is the only record that lets anyone say whether Aura is getting better or
-- worse, and that question is asked across seasons, not weeks. Cascading meant the answer could
-- never reach further back than a conversation is kept — ninety days — which is not long enough to
-- compare one quarter with the last.
--
-- So the link is severed rather than the row deleted. An event whose conversation has been removed
-- keeps its counts and loses its grouping, which is also the more private of the two outcomes: once
-- the conversation is gone there is nothing to group it back to, and nothing should pretend
-- otherwise.

ALTER TABLE aura_events DROP CONSTRAINT aura_events_conversation_id_fkey;

ALTER TABLE aura_events
    ADD CONSTRAINT aura_events_conversation_id_fkey
    FOREIGN KEY (conversation_id) REFERENCES aura_conversations(id) ON DELETE SET NULL;

-- Retention deletes by age, and both deletes are the only queries in this service that scan a
-- whole table. These are what keep them from doing so.
CREATE INDEX idx_aura_conversations_updated_at ON aura_conversations (updated_at);
CREATE INDEX idx_aura_events_occurred_at_retention ON aura_events (occurred_at);
