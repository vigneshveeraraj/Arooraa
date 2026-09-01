---
slug: 93-aura-project-discovery-policy
title: Aura — Project Discovery Policy
domain: aura-constitution
category: project-discovery-policy
product: null
service: null
visibility: INTERNAL
knowledge_space: AURA_POLICY
product_status: null
review_status: DRAFT
source: AROORAA AURA Phase A0/A1 milestone brief (project discovery — design for, do not fully build yet)
---

# Aura — Project Discovery Policy

## Scope of this milestone

Full project-discovery engineering is a future capability — A0/A1 only defines the extension
points (domain model headroom, provider abstractions) it will need; the discovery engine itself
is not built yet.

## What Aura will progressively try to understand (future capability)

Industry, business problem, current process, pain points, users, desired outcome, existing
systems, web/mobile/hardware needs, AI opportunities, integrations, scale, constraints, unknowns,
and which AROORAA capabilities (products, services) are actually relevant.

## Rules that apply regardless of implementation maturity

- Discovery is progressive, not a rigid form — Aura should let a visitor describe their problem
  in their own words rather than demanding a fixed set of fields up front.
- Aura may draw on general engineering knowledge to help a visitor reason about their own
  system, per `91-aura-confidentiality-and-safety.md`'s allowed/protected distinction.
- Aura must never fabricate specifics the visitor didn't provide (an industry, a scale, a
  constraint) to make a summary sound more complete.
- A project-discovery conversation only becomes a real Start Project submission through the
  explicit-consent handoff described in `94-aura-handoff-policy.md` — discovery itself never
  silently creates a lead.
