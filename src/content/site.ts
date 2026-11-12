// Site copy lives here so it can be edited in one place.

export type Fact = { label: string; value: string };

export type AboutContent = {
  index: string;
  /** One entry per displayed line. */
  statement: string[];
  lead: string;
  body: string[];
  facts: Fact[];
};

export const about: AboutContent = {
  index: "02 / ABOUT",
  statement: ["Only the intent", "stays human."],
  lead: "I design and build systems — from the first sketch on paper to software running in production.",
  body: [
    "I work across the whole line: product thinking, interface design, front-end, back-end, databases and deployment. One person, one continuous act, no hand-offs where intent gets lost.",
    "I've built operations platforms, B2B catalogues, mobile apps, e-commerce stores and brand identities — tools that real teams use every day, not just pages that look good.",
    "AI is now part of how I build. People decide what matters; machines help carry it out faster. That balance is the work.",
  ],
  facts: [
    { label: "Based in", value: "Noida, India" },
    { label: "Working", value: "Worldwide, remote" },
    { label: "Focus", value: "Systems · Interfaces · Brands" },
    { label: "Status", value: "Open for projects" },
  ],
};

export const marquee: string[] = ["SKETCH", "→", "SYSTEM", "✳"];
