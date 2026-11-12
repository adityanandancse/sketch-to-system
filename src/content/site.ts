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

export type Work = {
  no: string;
  title: string;
  kind: string;
  year: string;
  summary: string;
  role: string;
  stack: string[];
  image: string;
  url?: string;
};

export const works: Work[] = [
  {
    no: "01",
    title: "Operations Platform",
    kind: "Enterprise system",
    year: "2025–26",
    summary:
      "An end-to-end operations system: order intake, approvals, production queues, QR-based custody tracking, dispatch and tax invoicing — with role-based screens for every team on the floor.",
    role: "Product, design, full-stack",
    stack: ["React", "TypeScript", "PostgreSQL", "Supabase", "Cloudflare Workers"],
    image: "/images/works/01.webp",
  },
  {
    no: "02",
    title: "Private B2B Catalogue",
    kind: "B2B platform",
    year: "2025",
    summary:
      "An invite-only catalogue for trade buyers — searchable collections, access control and enquiry flows, built to feel like a premium product rather than a spreadsheet.",
    role: "Design, full-stack",
    stack: ["React", "TypeScript", "Supabase", "Cloudflare"],
    image: "/images/works/02.webp",
  },
  {
    no: "03",
    title: "Measurement App",
    kind: "Mobile & web app",
    year: "2025",
    summary:
      "A mobile and web app for capturing measurements and generating printable spec sheets, shipped to Android and the browser from one codebase.",
    role: "Design, development",
    stack: ["React", "Capacitor", "TypeScript"],
    image: "/images/works/03.webp",
  },
  {
    no: "04",
    title: "Commerce Storefronts",
    kind: "E-commerce",
    year: "2024–26",
    summary:
      "Custom storefronts with theme development, payment integration and conversion-focused product pages.",
    role: "Design, theme development",
    stack: ["Shopify", "Liquid", "Razorpay"],
    image: "/images/works/04.webp",
  },
  {
    no: "05",
    title: "Identity Systems",
    kind: "Brand & identity",
    year: "2024–26",
    summary:
      "Brand identities from mark to system — logo, typography, palette, labels and the rules that keep them consistent everywhere.",
    role: "Brand design",
    stack: ["Identity", "Typography", "Print"],
    image: "/images/works/05.webp",
  },
];

export const approach = {
  index: "04 / APPROACH",
  heading: ["Design begins", "with alignment."],
  intro:
    "Good systems don't start with screens. They start with understanding how people actually work — then shaping that into something clear, fast and dependable.",
  pillars: [
    {
      no: "01",
      title: "Understand",
      line: "Map the real workflow before drawing anything.",
      body: "I sit with the people who will use it, trace how work moves today, and find where time and information are lost. The plan comes from the floor, not from assumptions.",
    },
    {
      no: "02",
      title: "Design",
      line: "Turn intent into a form people can use.",
      body: "Interfaces, data models and flows designed together, so what looks simple is simple underneath too. Every screen earns its place.",
    },
    {
      no: "03",
      title: "Engineer",
      line: "Ship it, then keep it running.",
      body: "Typed front-ends, sound databases, edge deployment, and the unglamorous parts — migrations, permissions, audits — done properly so the system holds up in daily use.",
    },
  ],
};

export const flow = {
  index: "05 / FLOW",
  heading: "From sketch to system, in four moves.",
  steps: [
    {
      no: "01",
      title: "Discover",
      body: "Conversations, workflow mapping, and a written plan with scope and price.",
    },
    {
      no: "02",
      title: "Sketch",
      body: "Paper and wireframes first, then a clickable design you approve before code.",
    },
    {
      no: "03",
      title: "System",
      body: "Build in stages, verified at each step, on real devices with real data.",
    },
    {
      no: "04",
      title: "Support",
      body: "Launch, hand-over, and ongoing improvements as the work grows.",
    },
  ],
};

export type Metric = {
  value: number;
  suffix?: string;
  label: string;
  note: string;
  draft: boolean;
};

export const impact = {
  index: "06 / IMPACT",
  heading: "Numbers from systems in daily use.",
  // TODO(AB): replace with real figures, then set draft: false on each.
  metrics: [
    { value: 0, suffix: "+", label: "Production systems shipped", note: "Live and used daily", draft: true },
    { value: 0, suffix: "+", label: "Workflow stages automated", note: "From intake to dispatch", draft: true },
    { value: 0, suffix: "%", label: "Less manual data entry", note: "Measured against the old process", draft: true },
    { value: 0, suffix: "", label: "Years building for the web", note: "Design and engineering", draft: true },
  ] as Metric[],
};

export const contact = {
  index: "07 / CONTACT",
  lines: ["Got a system", "in mind?"],
  email: "hello@example.com", // TODO(AB): real email
  emailDraft: true,
  reply: "I usually reply within a day.",
  status: "Open for new projects",
  socials: [
    // TODO(AB): add real links; empty href entries are hidden
    { label: "GitHub", href: "" },
    { label: "LinkedIn", href: "" },
    { label: "Instagram", href: "" },
    { label: "X", href: "" },
  ],
};

export const nav = [
  { label: "Index", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Works", href: "#works" },
  { label: "Approach", href: "#approach" },
  { label: "Flow", href: "#flow" },
  { label: "Impact", href: "#impact" },
  { label: "Contact", href: "#contact" },
];
