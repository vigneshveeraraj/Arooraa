# Aura knowledge seed

This directory is the **editorial source of truth** for Aura's public knowledge base — not
code, not auto-ingested. A human (the AROORAA owner) reviews and approves each document before
it is loaded into `aura_documents`/`aura_document_versions` and only then runs through
`IngestionService` to become retrievable. Nothing here is embedded directly; see
`91-aura-confidentiality-and-safety.md` for why that boundary is architectural, not a suggestion.

## Frontmatter schema

Every document starts with YAML frontmatter matching the `AuraDocument`/`AuraDocumentVersion`
fields it will become:

```yaml
slug: 10-mesa                # stable identity -> AuraDocument.slug
title: MESA
domain: product               # -> AuraDocument.domain
category: product-overview    # -> AuraDocument.category
product: MESA                 # -> AuraDocument.product (null if not product-specific)
service: null                 # -> AuraDocument.service (null if not service-specific)
visibility: PUBLIC             # -> AuraDocumentVersion.visibility (PUBLIC | INTERNAL)
product_status: AVAILABLE      # -> AuraDocumentVersion.productStatus (null if not applicable)
review_status: DRAFT           # DRAFT | NEEDS_OWNER_APPROVAL | OWNER_APPROVED — see below
source: frontend-v2/src/lib/content/about.ts   # where the facts came from
```

## `review_status` — every document in this seed starts at DRAFT or NEEDS_OWNER_APPROVAL

- **DRAFT** — content is derived entirely from already-published, approved AROORAA
  material (the live website's own content files) and is a faithful, non-fabricated summary of
  it. Still requires an explicit owner pass before it becomes an `AuraDocumentVersion` in
  `APPROVED` status — this seed does not self-approve.
- **NEEDS_OWNER_APPROVAL** — the document body contains at least one specific claim (a number,
  a named fact, a policy line) that isn't sourced from existing approved material and needs the
  owner to confirm or correct before publishing. These are marked inline with
  `<!-- NEEDS_OWNER_APPROVAL: ... -->`.

No document in this seed was fabricated to fill a gap — where the current site/repository has no
answer, the document says so and is marked `NEEDS_OWNER_APPROVAL` rather than inventing one
(see `95-aura-unknown-answer-policy.md`).

## Layout

- `01`–`03` — company identity and philosophy
- `10`–`13` — the four public products
- `20`–`25` — the six service lines
- `30`–`32` — cross-cutting capabilities (UX/UI, Quality Engineering, Security by Design)
- `40`–`43` — careers, project engagement, contact/support, FAQ
- `50` — the public product-status index (one place that states every product's current status)
- `90`–`95` — Aura's own constitution: personality, confidentiality/safety, conversation policy,
  project-discovery policy, handoff policy, unknown-answer policy
