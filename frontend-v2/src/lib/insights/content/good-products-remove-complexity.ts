import type { InsightArticle } from "../types";

export const goodProductsRemoveComplexity: InsightArticle = {
  slug: "good-products-remove-complexity",
  title: "Good Products Remove Complexity",
  excerpt:
    "Simple to use and simple to build are almost never the same thing. A clean five-second interaction usually means someone absorbed the complexity so the user didn't have to.",
  category: "PRODUCT_ENGINEERING",
  publishedDate: "2026-08-30",
  featured: false,
  authorLabel: "AROORAA Team",
  seoTitle: "Good Products Remove Complexity | AROORAA Insights",
  seoDescription:
    "Why users shouldn't inherit a system's internal complexity, why simple UX often requires sophisticated engineering, and how AROORAA thinks about defaults, steps and resilience.",
  content: [
    {
      paragraphs: [
        "There's a quiet trap in how complexity tends to get distributed inside a product: it's easiest to build the version where the system stays simple and the user absorbs the difficulty — more fields to fill in, more decisions to make, more steps to remember, more edge cases the user has to notice and work around themselves. It's harder, and takes real engineering effort, to build the version where the system absorbs that difficulty instead, and the user experiences something that just works.",
        "We think that second version is the only one worth calling a good product. Complexity doesn't disappear when you push it onto the user — it just becomes their problem instead of yours, and they didn't sign up to solve it.",
      ],
    },
    {
      heading: "Users should not inherit internal system complexity",
      paragraphs: [
        "Every non-trivial system has real complexity somewhere: multiple data sources that need reconciling, edge cases that need handling, states that need to be kept consistent. The question a product has to answer is who deals with that complexity — the engineering behind the scenes, or the person trying to get something done on screen.",
        "A product that makes the user pick the right combination of settings, remember an undocumented order of operations, or manually reconcile information the system already had access to, has made a decision — usually not a conscious one — to export its internal complexity onto the person least equipped to handle it. They didn't build the system. They don't know its internals. Asking them to compensate for that is asking them to do the product team's job for free, one confused session at a time.",
      ],
    },
    {
      heading: "Simple UX is often the harder engineering problem",
      paragraphs: [
        "There's a common misconception that a simple interface reflects a simple underlying system. In our experience it's usually the opposite: a genuinely simple five-second interaction is frequently backed by more engineering work, not less, because someone had to figure out sensible defaults, handle the edge cases invisibly, and collapse what could have been eight decisions into one.",
        "A form with twenty visible fields is, in one sense, the lazy version — it hands every decision straight to the user instead of the team doing the work of figuring out which of those twenty actually need to be asked, which can be inferred, and which can default sensibly for the vast majority of cases. Reducing twenty fields to five isn't a design polish pass. It's real engineering and product work, and it usually happens after the twenty-field version already exists and someone commits to doing the harder job of simplifying it.",
      ],
    },
    {
      heading: "Reducing steps means someone did the reasoning first",
      paragraphs: [
        "Every step you remove from a user's path is a decision your team made instead of asking them to make it. That's a meaningful transfer of responsibility, and it should be treated with the seriousness it deserves — a wrong default that quietly does the wrong thing is worse than no default at all, because at least an explicit question gives the user a chance to catch it.",
        "The discipline here is asking, for every step in a flow: does this genuinely need a human decision, or does it need us to make a good decision on their behalf and only ask when we're not confident enough to? Most flows accumulate steps over time because it's easier to add a question than to do the work of answering it correctly by default. Removing steps responsibly means doing that work, not just deleting the question and hoping for the best.",
      ],
    },
    {
      heading: "Clearer decisions beat more options",
      paragraphs: [
        "More configuration is often mistaken for more power, but for most users in most moments, more options just means more uncertainty about which one is correct for them. A product that offers twelve settings with no guidance about which matter has handed the user a research project. A product that offers three well-reasoned choices, each clearly described in terms of an outcome rather than a technical parameter, has actually made a decision easier.",
        "This is a genuine trade-off, not a free win — power users sometimes do need the twelfth setting, and hiding it entirely is its own kind of failure. The resolution isn't to eliminate depth; it's to make sure depth is available without being the default experience everyone has to wade through to get anything done.",
      ],
    },
    {
      heading: "Resilience and maintainability are part of the same principle",
      paragraphs: [
        "Removing complexity from the user's experience only counts if it's genuinely absorbed, not just hidden until it resurfaces as a bug. A system that looks simple on the surface but is held together by unhandled edge cases will eventually expose that complexity back to the user anyway — as a confusing error, a silent failure, or behavior nobody can explain. Real simplicity requires the underlying system to actually be resilient to the cases it's quietly handling, not just optimistic that they won't come up.",
        "The same discipline extends to maintainability. A product that's simple for the user today but built in a way that's fragile to change will eventually force a choice between staying simple and staying correct — and under deadline pressure, correctness usually loses first, quietly, in ways users notice before anyone on the team does. Absorbing complexity well means absorbing it durably, not just moving it somewhere less visible.",
      ],
    },
    {
      heading: "The standard worth holding",
      paragraphs: [
        "The test we come back to is simple to state and genuinely hard to satisfy: if a user has to think harder than the problem actually deserves, the product hasn't finished its job yet. That's rarely solved by removing features — it's solved by someone on the team doing the harder, less visible work of absorbing the complexity a feature requires, so the person using it doesn't have to.",
      ],
    },
  ],
  relatedSlugs: [
    "second-brain-should-reduce-work",
    "restaurant-technology-works-better-connected",
    "repeated-frustration-is-often-a-product-signal",
  ],
  closingCta: {
    title: "Explore what AROORAA is building.",
    body: "See how this thinking shows up across our products.",
    ctaLabel: "View Products",
    ctaHref: "/products",
  },
};
