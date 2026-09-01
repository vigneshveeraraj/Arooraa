-- A2.1: allow more than one embedding generation per chunk, so a real-provider re-embedding run
-- can be measured against the previous generation instead of ambiguously overwriting it
-- (frozen A2.1 requirement: "do not overwrite historical vectors ambiguously"). Additive only —
-- V1 and V2 are never modified.

-- V1 declared `chunk_id UUID NOT NULL UNIQUE`, which Postgres implements as a generated unique
-- constraint. Look it up rather than assuming the generated name, so this migration doesn't
-- depend on a naming convention it didn't choose.
DO $$
DECLARE
    chunk_id_attnum smallint;
    single_column_unique_constraint text;
BEGIN
    SELECT att.attnum INTO chunk_id_attnum
    FROM pg_attribute att
    JOIN pg_class rel ON rel.oid = att.attrelid
    WHERE rel.relname = 'aura_embeddings' AND att.attname = 'chunk_id';

    SELECT con.conname INTO single_column_unique_constraint
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'aura_embeddings'
      AND con.contype = 'u'
      AND con.conkey = ARRAY[chunk_id_attnum];

    IF single_column_unique_constraint IS NOT NULL THEN
        EXECUTE format('ALTER TABLE aura_embeddings DROP CONSTRAINT %I', single_column_unique_constraint);
    END IF;
END $$;

-- One vector per chunk per generation. Re-embedding the same chunk at the same generation is
-- still rejected by the database, so an ingestion retry can't silently duplicate vectors.
ALTER TABLE aura_embeddings
    ADD CONSTRAINT uq_aura_embeddings_chunk_generation UNIQUE (chunk_id, generation);

-- Retrieval always filters to exactly one active generation (aura.provider.embedding.generation),
-- so that predicate deserves its own index.
CREATE INDEX idx_aura_embeddings_generation ON aura_embeddings (generation);
