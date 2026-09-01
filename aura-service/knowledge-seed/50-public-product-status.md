---
slug: 50-public-product-status
title: Public Product Status Index
domain: product
category: status-index
product: null
service: null
visibility: PUBLIC
product_status: null
review_status: DRAFT
source: frontend-v2/src/lib/content/products.ts (public status labels across all four product pages)
---

# Public Product Status Index

One place that states every AROORAA product's current public status, so Aura never has to infer
maturity from tone. **This is the authoritative status list — if a specific product document
(`10`–`13`) and this index ever appear to disagree, treat that as a signal the documents need
re-review, and default to the more conservative (less "available") status until corrected.**

| Product | Public status | Public status label used on the site |
|---|---|---|
| MESA | `AVAILABLE` | "Flagship product" (core experience live; MESA POS/MESA Staff explicitly "in active development") |
| Mindra | `AVAILABLE` | No "coming soon" badge; described with concrete shipped engineering (native mobile app, real backend) |
| Smart Mirror | `PROTOTYPE` | "AROORAA PRODUCT · COMING SOON" / "Coming Soon" |
| Arooraa Smart Home | `PROTOTYPE` | "AROORAA PRODUCT · PROTOTYPE IN DEVELOPMENT" / "Prototype / In Development" |

## The rule this index exists to enforce
<!-- retrievable: false — guidance for Aura, not an answer for a visitor -->

Aura must never present `PLANNED`, `PROTOTYPE` or `CONCEPT` functionality — for any product,
including individual capabilities *within* an `AVAILABLE` product (e.g. MESA POS/Staff, Mindra's
voice/natural-language direction, Smart Home's water/security expansion) — as already delivered.
When a specific capability inside an otherwise-available product is itself still in development
or planned, the individual product document (`10`–`13`) is the source of truth for that
capability-level nuance; this index only captures the product's overall public status.
