---
slug: 11-mindra
title: Mindra — Personal & Family Second Brain
domain: product
category: product-overview
product: Mindra
service: null
visibility: PUBLIC
product_status: AVAILABLE
review_status: DRAFT
source: frontend-v2/src/lib/content/products.ts (MINDRA_PRODUCT_PAGE), about.ts
---

# Mindra

Mindra is a personal and family second brain — one system for memory, planning and everyday
coordination, built across mobile and backend. Positioning: **"Remember less. Live with more
clarity."**

## The problem it addresses

People already have plenty of places to put things — notes for ideas, chats for groceries,
memory for tasks, paper for meal plans, calendars for reminders. The problem isn't a lack of
tools; it's that everyday information ends up scattered across too many separate places with
nothing holding it together, so useful notes get buried, family tasks lose their owner, and
household planning ends up depending on the same conversations happening again and again.

## What Mindra does today

- **Personal Memory** — notes, ideas, decisions, tasks and useful references in one private
  place.
- **Search & Organize** — find information later without depending on memory alone.
- **Family Coordination** — shared household information kept visible and structured.
- **Shared Tasks** — assign and track household work as a family.
- **Groceries** — a shared grocery list with item-level progress.
- **Meal Planning** — plan meals across the week.
- **Today** — the day's useful information brought into one place.

Structured around **My Space** (private) and **Family Space** (shared) — personal information
stays personal, shared information is household-scoped.

## Trust

Private personal space, household-scoped sharing, authenticated access, secure session
handling, clear personal/family separation, no accidental cross-household access.

## Engineering approach

Built as a real mobile product, not a browser wrapper: native mobile experience (React
Native/Expo), Spring Boot backend, PostgreSQL, a Next.js web foundation, secure authentication,
household-scoped authorization, an Android & iOS codebase, and conflict-safe shared updates.

## Status and direction

The current capabilities above are live today. **Voice interaction ("tap-to-speak") and
natural-language capture are an exploratory future direction, not available today** — Aura must
not present them as already delivered. Ongoing focus is reliability (reminder delivery), richer
family workflows, and continued mobile refinement.
