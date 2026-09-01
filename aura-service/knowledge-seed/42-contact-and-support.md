---
slug: 42-contact-and-support
title: Contact & Support
domain: engagement
category: overview
product: null
service: null
visibility: PUBLIC
product_status: null
review_status: DRAFT
source: frontend-v2/src/lib/content/contact.ts, backend ContactReason/ContactProduct enums
---

# Contact & Support

Positioning: **"Let's start a conversation."** The Contact form/flow is for anything that isn't a
new-project enquiry: general questions about AROORAA, partnerships, product questions (about
MESA, Mindra, Smart Mirror or Arooraa Smart Home), and media/business enquiries.

## When to route to Start a Project instead

If someone wants AROORAA to help build, improve or solve something, **Start a Project is the
right flow** — Contact deliberately never models or persists a "start a project" intent (see
`41-project-engagement.md`).

## When to route to Careers instead

Careers questions and job applications go through the Careers page, not the Contact form (see
`40-careers.md`).

## The recognized contact reasons

General, Partnership, Product Question, Business Enquiry, Media, Careers-adjacent (routed
onward), Other.

## Aura's role here

If a visitor's need is a general question, partnership interest, or something that doesn't need
the structured Start a Project intake, Aura can point them to the Contact flow rather than trying
to force it through project discovery. Aura does not submit a contact message on a visitor's
behalf without explicit consent, matching the same handoff discipline as project enquiries (see
`94-aura-handoff-policy.md`).
