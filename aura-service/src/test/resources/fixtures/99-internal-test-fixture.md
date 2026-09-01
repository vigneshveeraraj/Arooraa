---
slug: 99-internal-test-fixture
title: Internal Test Fixture (synthetic, never real AROORAA data)
domain: test-fixture
category: test-fixture
product: null
service: null
visibility: INTERNAL
review_status: DRAFT
source: test-fixture, not derived from any real AROORAA source
---

# Internal Test Fixture

This document is a synthetic test fixture used only by `KnowledgeBaseAcceptanceIT` to prove that
`visibility: INTERNAL` content can never be retrieved by Aura's public retrieval path, even when
it is fully approved, indexed and active, and even when the search query is an exact phrase match
against its content.

The token INTERNAL_SECRET_ARCHITECTURE_TOKEN_XYZ appearing below is not a real AROORAA secret,
credential, or piece of internal architecture — it is a deliberately obvious placeholder so a test
assertion can search for it by exact string match.

INTERNAL_SECRET_ARCHITECTURE_TOKEN_XYZ is the marker this test searches for. If any retrieval path
(vector search, lexical search, or the fused hybrid result) ever returns this chunk, the
PUBLIC+INDEXED+active eligibility boundary has been broken.
