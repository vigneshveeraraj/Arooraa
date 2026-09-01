---
slug: 13-arooraa-smart-home
title: Arooraa Smart Home — Local-First Connected Home
domain: product
category: product-overview
product: Arooraa Smart Home
service: null
visibility: PUBLIC
product_status: PROTOTYPE
review_status: DRAFT
source: frontend-v2/src/lib/content/products.ts (SMART_HOME_PRODUCT_PAGE), about.ts
---

# Arooraa Smart Home

Public name is **"Arooraa Smart Home"** — always use this name, even though the site's own route
is `/products/smart-home-eb` for historical continuity. Publicly labeled **"AROORAA PRODUCT ·
PROTOTYPE IN DEVELOPMENT."** A local-first, retrofit-friendly connected-home direction focused on
reliability, energy visibility, manual control and practical household intelligence. Positioning:
**"A smarter home should keep working — even when the internet does not."**

**This is a prototype-in-development product — never describe any capability as currently
available/purchasable.**

## The problem it addresses

Homes increasingly contain isolated smart devices, but families still deal with unclear
electricity usage, multiple control apps, pumps/tanks that depend on someone remembering to
check them, cloud-only devices that stop working when connectivity fails, fragmented safety
information, and installations that take away manual control.

## Product vision

Essential controls and safety alarms run inside the home, not in the cloud — physical switches
stay usable, and a cloud outage should only reduce convenience, never basic home operation.
Retrofit-first: designed to adopt gradually into existing homes rather than requiring full
rewiring (retrofit suitability depends on the home's actual electrical/installation conditions).

## What it can become (prototype focus and planned expansion)

- **Smart Energy** — understand consumption, spot unusual usage. *Current prototype focus.*
- **Smart Control** — coordinate selected lights/fans/approved loads without losing manual
  control. *Current prototype focus.*
- **Smart Water** — monitor tank levels, protect water-motor operation. *Planned expansion.*
- **Smart Safety** — smoke/LPG/water-leak information with local-first alerting. *Beginning
  within current focus.*
- **Smart Security** — selected door/motion/camera information in one view. *Planned expansion.*
- **Home Care** — maintenance/warranty/renewal tracking. *Longer-term direction.*

## Safety (non-negotiable)

Certified mains equipment required, qualified electrician required, manual override always
retained, local alarms for safety-critical detection, fail-safe behavior required, low-voltage
prototype work kept isolated from mains.

## Engineering direction

Raspberry Pi 5 / local gateway, ESP32 low-voltage prototyping, local-first processing, a Zigbee
device direction, an energy-meter integration direction, a secure mobile experience, optional
cloud history/remote access, modular backend/API evolution.

## Status

Starting with one smart room and whole-home energy visibility, retained manual control and
useful alerts, run through a real reliability pilot before anything expands. Water protection and
selected safety integrations come next, proven room by room. Broader home coordination, deeper
maintenance intelligence and carefully governed AI assistance (that explains usage/suggests
actions without ever replacing manual control or safety behavior) are long-term direction only.
