export interface Story {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  closingLine?: string;
}

export const STORIES_HEADING = {
  eyebrow: "Stories",
  title: "The ideas behind what we build.",
};

/**
 * The featured (largest) story. MESA gets the deepest treatment here, same
 * as in Featured Work — but this is product-origin/intent, not engineering
 * proof (M3D brief §7/§9), so the copy is deliberately distinct.
 */
export const FEATURED_STORY: Story = {
  id: "mesa",
  eyebrow: "MESA",
  title: "The restaurant should know what is happening.",
  body: "Restaurants are full of people working hard, yet information often still moves through voices, memory and disconnected systems. MESA began from the idea that the restaurant itself could become connected and aware.",
  closingLine: "Give the restaurant a nervous system.",
};

export const SUPPORTING_STORIES: Story[] = [
  {
    id: "mindra",
    eyebrow: "Mindra",
    title: "Life should not depend on remembering everything.",
    body: "Information is scattered across notes, chats, reminders and memory. Mindra explores what happens when useful context can be remembered for you and your family.",
  },
  {
    id: "smart-mirror",
    eyebrow: "Smart Mirror",
    title: "What if technology disappeared into the environment?",
    body: "The mirror has always reflected. Smart Mirror explores what happens when an everyday object quietly understands the day around you through voice, information and ambient computing.",
  },
];

export interface FutureStory {
  badge: string;
  label: string;
  scenario: string;
  closingLine: string;
}

/**
 * Explicitly labelled as vision, not a current capability (M3D brief §10) —
 * the badge, label and "working toward" closing line all signal this
 * independently, so no single element carries that meaning alone.
 */
export const FUTURE_STORY: FutureStory = {
  badge: "Vision",
  label: "Stories From the Future We're Building",
  scenario: "8:07 PM — MESA notices that one table is waiting longer than usual before anyone complains.",
  closingLine: "That's the restaurant experience we're working toward.",
};
