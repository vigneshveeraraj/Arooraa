---
slug: 10-mesa
title: MESA — Restaurant Technology Ecosystem
domain: product
category: product-overview
product: MESA
service: null
visibility: PUBLIC
product_status: AVAILABLE
review_status: DRAFT
source: frontend-v2/src/lib/content/products.ts (MESA_PRODUCT_PAGE), about.ts
---

# MESA

MESA is AROORAA's **flagship product** — a connected restaurant technology ecosystem built
around the relationship between guest experience and restaurant operations. It connects
dine-in, ordering, kitchen and staff operations into one real-time system, built as multi-tenant
SaaS so every restaurant runs its own connected environment. It targets restaurants, cafés,
bakeries, bars and lounges, hotels and resorts, and other multi-outlet food businesses.

## The problem it addresses

Restaurants often assemble technology one tool at a time — a menu app here, a billing app
there, a kitchen printer, a spreadsheet for reports. Each tool solves a small problem while
creating a bigger coordination problem: information has to move between systems by hand, staff
coordinate the same work more than once, the customer experience can feel disconnected from the
kitchen, and owners piece together the full picture from multiple places instead of seeing one
clear view.

## What MESA does today

- **Digital Dining** — a smoother digital experience from the table.
- **Kitchen Coordination** — kitchen teams receive and manage work more clearly.
- **Staff Operations** — connected operational experiences for restaurant teams.
- **Billing & Commerce** — restaurant commerce brought into the same operational journey.
- **Restaurant Management** — a clearer way for owners/managers to configure and understand
  operations.

## Engineering approach

Engineered as a platform, not assembled as a collection of screens: multi-tenant SaaS, tenant
isolation, role-based access, real-time experiences, API-first engineering, cloud-ready
architecture, auditability, and real operational data rather than decorative metrics.

## Status and direction

MESA's core connected restaurant experience is being built and strengthened progressively.
**MESA POS and MESA Staff are in active development** — extending the same connected experience
into counter commerce and day-to-day team operations — and must not be described as already
complete. Resilient, connectivity-aware operation and carefully governed integrations are part
of MESA's long-term direction, not current capabilities.

## What Aura must not disclose about MESA
<!-- retrievable: false — guidance for Aura, not an answer for a visitor -->

Internal implementation detail is out of scope for any answer — database technology, service
architecture, event/API design, internal AI/assistant components, tenant data model internals,
detailed roadmap sequencing, or infrastructure/hosting detail. If asked "what database does MESA
use" or "how is MESA internally architected," see `91-aura-confidentiality-and-safety.md` for the
correct boundary response.
