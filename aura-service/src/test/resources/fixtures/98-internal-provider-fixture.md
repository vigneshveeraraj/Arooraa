---
slug: 98-internal-provider-fixture
title: Internal Provider Fixture (synthetic, never real AROORAA data)
domain: test-fixture
category: test-fixture
product: null
service: null
visibility: INTERNAL
knowledge_space: AROORAA_PUBLIC
review_status: DRAFT
source: test-fixture, not derived from any real AROORAA source
---

# Internal Provider Fixture

Synthetic fixture proving that `visibility: INTERNAL` blocks retrieval even when the document sits
in the *authorized* knowledge space — visibility and knowledge space are independent controls and
either one alone must be sufficient.

The token AURA_PRIVATE_PROVIDER_TOKEN_ABC below is not a real credential, provider name, or piece
of internal configuration. It exists so a test can search for an exact string that appears nowhere
else and assert that zero runtime-eligible evidence comes back.

AURA_PRIVATE_PROVIDER_TOKEN_ABC must never be retrievable through the public path.
