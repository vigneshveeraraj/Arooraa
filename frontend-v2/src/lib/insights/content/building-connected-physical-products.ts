import type { InsightArticle } from "../types";

export const buildingConnectedPhysicalProducts: InsightArticle = {
  slug: "building-connected-physical-products",
  title: "Building Connected Physical Products Requires Different Thinking",
  excerpt:
    "A bug in a web app is a bad afternoon. A bug in a connected physical product is sitting in someone's living room, failing in the physical world, in front of them.",
  category: "CONNECTED_PRODUCTS",
  publishedDate: "2026-08-30",
  featured: false,
  authorLabel: "AROORAA Team",
  seoTitle: "Building Connected Physical Products Requires Different Thinking | AROORAA Insights",
  seoDescription:
    "Software, hardware, edge computing, privacy, reliability and failure modes — how building a connected physical product like a smart mirror or smart-home device differs from building an app.",
  content: [
    {
      paragraphs: [
        "Most modern software has a convenient property: when something breaks, you push a fix and it's largely resolved. A connected physical product doesn't get that convenience nearly as easily. It's sitting in someone's home, wired into their electrical system or sharing counter space with their morning routine, and a bug in that context isn't an abstract error in a log file — it's a mirror that won't turn on, or a device that stopped responding, physically present and physically failing in front of the person who bought it.",
        "That difference in consequence is the real reason building connected physical products — the kind of thinking behind concepts like Smart Mirror and Arooraa Smart Home — requires genuinely different discipline than building a web or mobile app, even when a lot of the same software skills are involved.",
      ],
    },
    {
      heading: "Software and hardware are one product, not two projects",
      paragraphs: [
        "It's tempting to treat the hardware and the software as separate workstreams that get integrated near the end — hardware team ships a device, software team ships an app, and the two meet somewhere in a spec document. That approach reliably produces friction, because decisions made early in hardware design constrain what's realistically possible in software much more than most software teams expect, and decisions made early in software design constrain what the hardware actually needs to support.",
        "Treating it as one product from the start means the same team, or at least the same product thinking, has to reason about both sides together: what does the device need to sense or display, what can realistically run on it versus what has to happen elsewhere, and what does the physical form factor make easy or hard for the software to compensate for. Splitting that too early is one of the most common ways connected-product projects end up with capable hardware and disappointing software, or the reverse.",
      ],
    },
    {
      heading: "The edge changes what's possible and what's required",
      paragraphs: [
        "A connected physical product typically has to make decisions about what runs locally, on the device itself, versus what depends on a network connection to a more capable service elsewhere. That's not just a performance question — it's a reliability and privacy question too. Something that needs to respond instantly, like a physical interaction, generally shouldn't have to wait on a round trip to a remote server. Something that involves sensitive information happening inside someone's home has a real argument for staying local rather than leaving the device at all.",
        "Edge computing constraints — limited processing power, limited memory, needing to run efficiently on modest hardware — also mean that some capabilities that are trivial in a cloud environment become genuinely hard problems on-device. Respecting that constraint honestly, rather than assuming a device can just do whatever a server could, is part of designing the product correctly from the start rather than discovering the limitation after launch.",
      ],
    },
    {
      heading: "Privacy is different when the device lives in someone's home",
      paragraphs: [
        "A device that sits in a living room, a bedroom or a kitchen occupies a fundamentally different trust position than an app someone opens occasionally on their phone. It's physically present during private moments whether or not it's actively being used, which raises the bar considerably for what data it collects, how it's processed, and where it goes. Design decisions about what stays on-device versus what's ever transmitted anywhere aren't just architectural choices — they're the actual privacy commitment the product is making to the person who lives with it.",
        "We think that commitment has to be treated as a first-order product requirement for anything in this category, not a policy paragraph written after the fact. What a connected physical product is capable of sensing, and what it actually chooses to do with that, are two different things, and the gap between them is where trust is either earned or lost.",
      ],
    },
    {
      heading: "Reliability means surviving the physical environment, not just the network",
      paragraphs: [
        "Software running in a data center operates in a remarkably controlled environment — stable power, stable temperature, stable connectivity. A device in someone's home operates in none of that. Power can flicker. Wi-Fi can be inconsistent depending on where in the house the device sits. Temperature and humidity vary by room and by season. None of that is a corner case for a connected physical product — it's the actual operating environment, every day.",
        "Designing for that reality means thinking seriously about failure modes before they happen in someone's home rather than after: what should the device do when connectivity drops, when power is interrupted mid-operation, when it's been unplugged and plugged back in weeks later. A product that only behaves correctly under ideal conditions isn't ready for the physical world its users actually live in.",
      ],
    },
    {
      heading: "What we keep out of public discussion, and why",
      paragraphs: [
        "We deliberately don't publish implementation-level detail about our connected-product work — bill of materials, wiring, pinouts, internal network topology or manufacturing specifics. That's not because those details are mysterious; it's because they're the wrong level of detail for explaining what a product is actually for, and because some of it is genuinely still evolving as prototypes mature. Both Smart Mirror and Arooraa Smart Home remain concept and prototype work today, not finished, deployed products — and we'd rather be precise about that than let a well-written article imply more maturity than currently exists.",
        "What is worth discussing publicly is the thinking: physical products fail differently than software, live in environments software never has to survive, and carry a privacy responsibility that a phone app usually doesn't. Taking that seriously from the earliest design decisions, rather than retrofitting it after a prototype works in a demo, is what building connected physical products well actually requires.",
      ],
    },
  ],
  relatedProductLinks: [{ label: "Our Work", href: "/our-work" }],
  relatedSlugs: [
    "why-smart-homes-should-work-without-internet",
    "good-products-remove-complexity",
    "ai-is-useful-when-it-improves-the-product",
  ],
  closingCta: {
    title: "See our connected-product work.",
    body: "A closer look at how AROORAA approaches software and hardware together.",
    ctaLabel: "View Our Work",
    ctaHref: "/our-work",
  },
};
