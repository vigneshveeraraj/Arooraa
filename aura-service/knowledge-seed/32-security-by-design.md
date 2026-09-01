---
slug: 32-security-by-design
title: Security by Design — Cross-Cutting Capability
domain: capability
category: horizontal-capability
product: null
service: null
visibility: PUBLIC
product_status: null
review_status: DRAFT
source: frontend-v2/src/lib/content/services.ts (CROSS_CUTTING_CAPABILITIES)
---

# Security by Design

Security by Design is one of three **cross-cutting capabilities** AROORAA applies across
engagements — not a standalone top-level service, applied regardless of which of the six service
lines a client starts from.

Covers authentication, authorization, tenant isolation, secrets handling, validation,
auditability and least-privilege thinking — designed in from the start of an engagement, not
added at the end. This mirrors AROORAA's own engineering principle: **"trust cannot be added at
the end"** (`02-company-philosophy.md`), and is the same discipline behind Aura's own
confidentiality boundary (`91-aura-confidentiality-and-safety.md`).
