// Site copy lives here so it can be edited in one place.

export const site = {
  /** Production origin, no trailing slash — for canonical / OG URLs. */
  url: "https://aditya.aditeraction.com",
};

/** Launch flags — controls stay hidden until their step ships (08 menu, 12 sound). */
export const features = { menu: false, sound: false };

export const profile = {
  name: "Aditya Nandan",
  firstName: "Aditya",
  lastName: "Nandan",
  role: "Full-Stack Software Engineer",
  eyebrow: "Full-Stack Software Engineer · SDE / FDE · Noida, India",
  signature: "Sketch to System",
  tagline: "From first sketch to production systems.",
  resumeUrl: "/resume/Aditya-Nandan-Resume.pdf",
  resumeDraft: false,
  status: "Open to SDE · FDE · Founder's Office roles",
};

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
    { label: "Role", value: "Full-Stack SDE" },
    { label: "Stack", value: "TypeScript · React · Node · PostgreSQL" },
    { label: "Status", value: "Open to SDE · FDE · Founder's Office roles" },
  ],
};

export const marquee = {
  label: "Tech stack",
  items: [
    "React",
    "TypeScript",
    "Next.js",
    "TanStack Start",
    "Node.js",
    "Bun",
    "PostgreSQL",
    "Supabase",
    "Cloudflare Workers",
    "Tailwind CSS",
    "Three.js",
    "GSAP",
    "Capacitor",
    "REST APIs",
    "Git",
  ],
};

export type WorkFact = {
  label: string;
  value: string;
  draft?: boolean;
};

export type WorkStat = {
  value: string;
  unit: string;
  /** Shown before the value, e.g. "≤". */
  prefix?: string;
  label: string;
  note: string;
  draft?: boolean;
};

export type WorkOutcome = {
  title: string;
  problem: string;
  fix: string;
  result: string;
};

export type Work = {
  no: string;
  title: string;
  kind: string;
  year: string;
  /** Marks `year` as a placeholder: dev-only, hidden in production. */
  periodDraft?: boolean;
  summary: string;
  role: string;
  stack: string[];
  /** Marks `stack` as a placeholder: dev-only, hidden in production. */
  stackDraft?: boolean;
  /** Omit to use the generated placeholder. */
  image?: string;
  /** Describes the image; falls back to "title — kind". */
  imageAlt?: string;
  url?: string;
  /** A row of small links; when present it replaces the single "visit site" link. */
  links?: { label: string; href: string }[];
  /** Plain-text availability line, shown in place of the link when there is no url. */
  status?: string;
  /** Store listing, shown beside the live link; a draft is dev-only. */
  appStore?: { label: string; href: string; draft?: boolean };
  org?: string;
  draft?: boolean;
  useCases?: string[];
  /** How it was engineered, in one line. */
  practices?: string;
  /** Scale at a glance; drafts are dev-only. */
  facts?: WorkFact[];
  /** Headline numbers; drafts are dev-only. */
  stats?: WorkStat[];
  /** Problem → fix → result. Titles show on the slide; full text is for the case study. */
  outcomes?: WorkOutcome[];
  /** Attribution, shown as one small line under the role. */
  credit?: string;
};

export const works: Work[] = [
  {
    no: "01",
    title: "Operations Platform",
    kind: "Enterprise system",
    year: "Jun 2026 – Present",
    summary:
      "An end-to-end ERP running a two-plant textile business — stock inward, order punch, approvals, cutting, inter-plant shipping, delivery challans and a per-garment retail production line — used daily by 150+ people across Delhi and Noida.",
    role: "Sole engineer — requirements gathered on the shop floor, data model, Postgres RPCs, UI and releases.",
    stack: ["TanStack Start", "React 19", "TypeScript", "PostgreSQL", "Supabase", "Cloudflare Workers", "Bun"],
    practices:
      "Rebuilt stage by stage while both plants ran on it daily — additive, idempotent migrations, a repo-vs-live schema drift check, and an append-only audit trail.",
    facts: [
      { label: "Plants", value: "2" },
      { label: "Daily users", value: "150+" },
      { label: "Orders / month", value: "~300" },
      { label: "Migrations", value: "280+" },
    ],
    stats: [
      { value: "97", unit: "%", label: "Stock mismatches reduced", note: "Holds, availability views and trigger-based deduction replaced manual stock adjustments." },
      { value: "0", unit: "", label: "Challan errors since go-live", note: "Scan-to-challan with an accountant verification gate before goods move." },
      { value: "30", unit: "min", prefix: "≤", label: "Order punch → delivery challan", note: "Single plant; ~1 hour cross-plant. Stock and bundle availability is instant — previously this time went into manually confirming what was in stock." },
      { value: "1,790", unit: "m", label: "Fabric stock recovered", note: "Reconciliation audit put physically present fabric back on the books after silent import failures." },
      { value: "96.5", unit: "m", label: "Double deductions prevented", note: "Repaired an idempotency guard on 13 legacy cuts before stock could be deducted twice." },
      { value: "0", unit: "", label: "Duplicate serials", note: "One trigger-assigned serial per line, carried from order to cutting label to challan, across 1,700+ retail items." },
      { value: "27", unit: "", label: "Role-scoped workflows", note: "Server-enforced permissions from salesman to cutter, tailor and accountant." },
    ],
    outcomes: [
      {
        title: "Inventory that matches the floor",
        problem: "Stock on screen drifted from fabric on the racks — failed bulk imports were swallowed as warnings, and editing an inward bill silently restored fabric that was already cut.",
        fix: "Stock holds reserved at order punch, availability views (on hand / held / available), database triggers that deduct exactly once at cutting, non-negative constraints, and automatic hold release on cancellation.",
        result: "97% fewer stock mismatches; overselling is surfaced before approval instead of at the cutting table; ~1,790 m of real stock reconciled back onto the books.",
      },
      {
        title: "Order to challan in under 30 minutes",
        problem: "Most of an order's processing time went into confirming which stock and bundles were actually available.",
        fix: "Live availability per bundle and location at punch and approval, bundle suggestions for the senior manager, and a cutter queue driven by claims and scans.",
        result: "Punch → delivery challan in ≤ 30 min for one plant, ~1 hour across plants.",
      },
      {
        title: "Approvals that can't half-save",
        problem: "Senior-manager approval was a chain of client-side writes — a dropped connection or double click could leave an order partly approved.",
        fix: "Moved approval, allocation and challan issue into transactional Postgres RPCs with server-side permission checks and idempotency.",
        result: "An approval either fully happens or doesn't; every stage change is audited.",
      },
      {
        title: "One number, end to end",
        problem: "Two identical order lines were indistinguishable at cutting, packing and dispatch.",
        fix: "A per-line serial assigned by a database trigger and never renumbered, carried into the cutting-label QR, shipping units and the delivery challan.",
        result: "Every bundle is traceable from order line to customer document.",
      },
      {
        title: "Scan-to-challan dispatch",
        problem: "Delivery challans were typed by hand and short shipments got lost.",
        fix: "Scan sessions build the challan from what was actually scanned, gap-free DC numbering, pending items tracked in-app, and an accountant verification gate before goods move.",
        result: "Zero challan errors since go-live — the GST document lists only what physically left the building.",
      },
      {
        title: "Paper registers → a live production line",
        problem: "Couture production ran on pen, paper and registers — no one could say where a garment was.",
        fix: "Per-piece job cards and QR garment tags, an append-only stage timeline, role-matched scan stations, approval gates at quality checkpoints, and a shared-terminal mode for the floor.",
        result: "Any garment's full history is one scan away, from order punch to delivery.",
      },
      {
        title: "Built for the shop floor",
        problem: "Most floor staff can't read much and work at a cutting table with only a tablet.",
        fix: "Scan-first screens with 72–88 px buttons, colour + icon states, bilingual labels and at most three actions per screen; thermal label printing from tablets.",
        result: "Cutters and tailors use the system without training manuals.",
      },
    ],
    // No url on purpose: the production address stays private.
    status: "Live · login required — link on request",
    image: "/images/works/01-erp.webp",
    imageAlt:
      "Hand-drawn order-to-challan flow beside the ERP command centre and the cutter's tablet screen.",
  },
  {
    no: "02",
    title: "Private B2B Catalogue",
    kind: "B2B platform",
    year: "Jul – Sep 2026",
    summary:
      "A private B2B fabric catalogue for wholesale buyers — live stock by bundle and cut length, online ordering and instant proforma invoices — wired directly to the ERP so stock is never updated by hand.",
    role: "Sole engineer and designer — product, UI/UX, graphics, web + iOS app, edge workers and release.",
    stack: ["TanStack Start", "React 19", "TypeScript", "Supabase", "PostgreSQL", "Cloudflare Workers", "Capacitor", "Bun"],
    practices:
      "One codebase ships to web and iOS via Capacitor; serverless edge workers handle admin actions, notifications and PDF generation; signed (HMAC) webhooks between the database and the notifier.",
    facts: [
      { label: "Platforms", value: "Web + iOS" },
      { label: "Edge workers", value: "3" },
      { label: "Active buyers", value: "250+" },
    ],
    stats: [
      { value: "250", unit: "+", label: "Active buyers", note: "Approved wholesale buyers on web and iOS." },
      { value: "180", unit: "+", label: "Orders placed in-app / month", note: "Buyers order directly against live stock — no calls, no chat re-typing." },
      { value: "0", unit: "", label: "Manual stock updates", note: "Stock flows straight from the ERP — no more phone calls or WhatsApp messages to confirm availability." },
      { value: "1", unit: "click", label: "Proforma invoice", note: "Generated as a PDF from the order, on demand." },
      { value: "24/7", unit: "", label: "Self-serve stock visibility", note: "Buyers see bundles and cut lengths in real time, any hour, without calling the office." },
      { value: "1", unit: "codebase", label: "Web + iOS app", note: "Shipped to the App Store via Capacitor." },
    ],
    outcomes: [
      {
        title: "Stock without the phone calls",
        problem: "Buyers learned what was in stock by phone call or WhatsApp — slow for them, and a constant interruption for staff who had to check racks and reply by hand.",
        fix: "The catalogue reads live availability from the ERP's stock tables — per bundle and per cut length — so every cut, inward and hold is reflected automatically.",
        result: "Zero manual stock updates; buyers check availability themselves, anytime.",
      },
      {
        title: "Order online, not over chat",
        problem: "Orders arrived as messages that had to be re-typed into the system.",
        fix: "Buyers build orders in the app against real availability; admins can also place orders directly on a buyer's behalf.",
        result: "Orders enter the pipeline structured and correct, with no re-keying.",
      },
      {
        title: "Proforma invoice on demand",
        problem: "Buyers waited for staff to prepare and send a quote before paying or confirming.",
        fix: "A dedicated edge worker renders a branded proforma invoice PDF straight from the order.",
        result: "Buyers get a proforma the moment they need it.",
      },
      {
        title: "Access control from inside the app",
        problem: "A private catalogue needs to stay private — only approved buyers, only the fabrics meant for them.",
        fix: "An in-app admin panel to create buyer and staff accounts, invite links, per-article catalogue visibility and route-level auth guards backed by row-level security.",
        result: "The business controls exactly who sees what, without a developer.",
      },
      {
        title: "Back-in-stock, automatically",
        problem: "Buyers missed fabrics that came back after selling out.",
        fix: "Database events trigger a signed webhook to a notification worker when an article is restocked.",
        result: "Interested buyers are notified the moment stock returns.",
      },
      {
        title: "Web and iOS from one codebase",
        problem: "Buyers work from phones on the go, but a separate native app would double the work for a solo engineer.",
        fix: "Capacitor wraps the same React app for iOS; per-buyer recently-viewed and fast catalogue browsing tuned for mobile.",
        result: "Published on the App Store, maintained alongside the web app.",
      },
    ],
    image: "/images/works/02-brixon.webp",
    imageAlt:
      "Sketch of buyers asking for stock by phone and WhatsApp, crossed out, beside the Brixon app showing live bundles and cut lengths, a proforma invoice and a back-in-stock alert.",
    url: "https://app.brixonitaly.com",
    status: "Shipped · live on web and App Store",
    appStore: { label: "App Store", href: "https://apps.apple.com/us/app/brixon/id6762793013" },
  },
  {
    no: "03",
    title: "Measurement App",
    kind: "AB Measure — bespoke measurement system",
    year: "Aug – Oct 2026",
    summary:
      "A bespoke measurement system for a couture label — garment-ready measurement sheets, mandatory reference photos and voice notes, captured on a phone at the client's side and printed straight onto the production job card.",
    role: "Sole engineer and designer — measurement schema with the master tailors, mobile-first UI, PDF cutting sheets, Android build and ERP integration.",
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "Supabase", "PostgreSQL", "Cloudflare Workers", "Capacitor"],
    practices:
      "Versioned, append-only records enforced by database triggers; an EAV value model so new garments and custom fields need no migration; offline-safe auto-drafts; shares one database with the ERP so the job card reads the latest sheet at print time.",
    facts: [
      { label: "Platforms", value: "Web + Android" },
      { label: "Garment sheets", value: "Menswear + Womenswear" },
      { label: "Records / month", value: "250+" },
    ],
    stats: [
      { value: "250", unit: "+", label: "Records captured / month", note: "Measured on a phone at the client's side, in the fitting room." },
      { value: "1,000", unit: "+", label: "Legacy register entries digitised", note: "Bulk-imported from paper registers with the original serial number kept searchable." },
      { value: "73", unit: "", label: "Structured measurement fields", note: "37 menswear + 36 womenswear — upper body, bottom, lengths and construction specs, plus custom fields." },
      { value: "0", unit: "", label: "Overwritten measurements", note: "Append-only and versioned: a re-measure creates a new version, history is never lost." },
      { value: "24", unit: "", label: "Garment types covered", note: "From kurta, sherwani and coat to lehenga, blouse and corset." },
      { value: "5", unit: "", label: "Mandatory photo plates", note: "Every record carries the same five reference angles — no missing views at cutting." },
    ],
    outcomes: [
      {
        title: "Paper registers → a searchable record",
        problem: "Client measurements lived in handwritten registers — hard to find, easy to misread, and lost when a page was.",
        fix: "Structured sheets on a phone, linked to the client record, with a bulk importer for legacy registers that keeps the original paper serial number searchable.",
        result: "Any client's measurements are one search away, including years-old register entries.",
      },
      {
        title: "No guessing on the cutting floor",
        problem: "Pattern masters had to interpret loose notes, and missing measurements were filled by guesswork.",
        fix: "A fixed schema per section (upper body, bottom, lengths, construction specs), separate body vs trouser-drafting fields, and notes printed verbatim beneath each value.",
        result: "The pattern master works from exact, labelled values — never a guess.",
      },
      {
        title: "Photos and voice, not just numbers",
        problem: "Posture, fit preferences and design intent were lost between the fitting room and the floor.",
        fix: "Five mandatory reference photo plates and voice notes attached to every record.",
        result: "The floor sees the client the way the measurer did.",
      },
      {
        title: "History that can't be overwritten",
        problem: "Re-measuring a client meant crossing out and rewriting — no trace of what changed.",
        fix: "Append-only, versioned records enforced by database triggers.",
        result: "Every change is a new version; the full fitting history stays intact.",
      },
      {
        title: "Straight onto the job card",
        problem: "Measurements were copied by hand from the register onto production paperwork.",
        fix: "Shares one database with the ERP — the job card prints only that garment's measurements from the client's latest sheet, in menswear or womenswear layout.",
        result: "Zero re-copying between measurement and production.",
      },
      {
        title: "Built for the fitting room",
        problem: "Measurements are taken standing next to the client, often with poor connectivity.",
        fix: "Mobile-first UI, auto-saved drafts, an Android app via Capacitor, and an A4 cutting-sheet PDF rendered on-device.",
        result: "Capture anywhere; nothing lost if the app closes mid-fitting.",
      },
    ],
    // No url on purpose: in-house tool, address stays private.
    status: "Shipped · in daily use · link on request",
    image: "/images/works/03-measure.webp",
    imageAlt:
      "Hand-drawn figure with measurement lines beside the AB Measure app capturing a client's sheet with photos and a voice note, and the job card printing the same measurements.",
  },
  {
    no: "04",
    title: "Commerce Storefronts",
    kind: "Shopify storefronts — two couture labels",
    year: "Dec 2024 – Present",
    summary:
      "Two Shopify storefronts for an Indian couture house — a made-to-measure flagship and a contemporary ready-to-wear line — custom-built in Liquid with no third-party apps, mixing price-on-request pieces with direct checkout and feeding custom-size orders into the measurement system.",
    role: "Sole developer and designer — theme architecture, Liquid sections, design system, made-to-measure flow, performance and releases.",
    stack: ["Shopify OS 2.0", "Liquid", "JavaScript", "CSS", "Shopify CLI", "GTM", "Meta Ads"],
    practices:
      "Everything native in the theme — no app scripts on the storefront; tag-driven merchandising so staff switch a product between checkout and enquiry without code; changes previewed locally with Shopify CLI and pushed only once confirmed.",
    facts: [
      { label: "Storefronts", value: "2" },
      { label: "Third-party apps", value: "0" },    ],
    stats: [
      { value: "2", unit: "", label: "Storefronts shipped", note: "A made-to-measure flagship and a separate ready-to-wear line, each with its own design system." },
      { value: "0", unit: "", label: "Third-party apps", note: "Every feature built natively in Liquid — faster pages, no per-app fees, nothing breaking on app updates." },
      { value: "116", unit: "", label: "Products on price-on-request", note: "A tag switches a product from checkout to enquiry — no developer needed." },
      { value: "19", unit: "", label: "Made-to-measure fields", note: "Captured at checkout and matched to the measurement system's schema." },    ],
    outcomes: [
      {
        title: "Price on request, without a plugin",
        problem: "Couture pieces can't show a fixed price, but ready-to-wear needs a normal cart — and enquiry apps add weight and fees.",
        fix: "A tag-driven price-on-request system in Liquid swaps the price and buy button for an enquiry flow, with ready-to-buy and made-to-order pieces kept in separate collections.",
        result: "116 products switched to enquiry by tag; the team changes it without code.",
      },
      {
        title: "Made-to-measure at checkout",
        problem: "Custom-size orders came in as loose messages and had to be re-measured or re-typed.",
        fix: "A custom-size block collects 19 measurements as line-item properties with a custom-size flag, using the same field names as the in-house measurement app.",
        result: "Online custom orders arrive structured and ready for production.",
      },
      {
        title: "Enquiry to conversation in one tap",
        problem: "Most couture clients want to talk before they buy.",
        fix: "WhatsApp enquiry wired into the header, footer and product enquiry button, carrying the product context.",
        result: "A buyer reaches the atelier from any product in one tap.",
      },
      {
        title: "Two brands, one engineering base",
        problem: "The ready-to-wear line needed its own identity without doubling the build effort.",
        fix: "One theme architecture re-skinned with a separate design system — monochrome with Bodoni Moda + Inter for the ready-to-wear line, a dark palette for the flagship.",
        result: "A second storefront launched on a proven base.",
      },
      {
        title: "Fast, app-free pages",
        problem: "Legacy themes had accumulated dead app scripts and third-party code.",
        fix: "Rebuilt on Shopify OS 2.0 sections with no app scripts; analytics through Tag Manager only.",
        result: "Lighter pages that marketing can still measure.",
      },
      {
        title: "Safe releases on a live store",
        problem: "The flagship store is live with ads running — no room for a broken homepage.",
        fix: "Local development with Shopify CLI against the theme, with changes pushed only after preview, and the previous theme kept as an instant rollback.",
        result: "Redesigns shipped to a live store without downtime.",
      },
    ],
    links: [
      { label: "achinbindlish.com", href: "https://www.achinbindlish.com" },
      { label: "abnbeyond.com", href: "https://abnbeyond.com" },
    ],
    status: "Live · actively maintained",
    image: "/images/works/04-storefronts.webp",
    imageAlt:
      "Sketch of a product page with add-to-cart and enquire paths beside the couture storefront showing price on request and custom size, and the ready-to-wear store on a phone.",
  },
  {
    no: "05",
    org: "Aditeraction",
    title: "Swatch Scanner",
    kind: "Mobile web app · Capture pipeline",
    year: "Jul – Aug 2026",
    draft: false,
    summary:
      "A capture-and-catalogue tool for physical samples — photograph a swatch, OCR reads the article number off its label, and the image is saved against that article; works one at a time or in bulk.",
    practices:
      "OCR never blocks the user — a confident read that matches the article-number pattern saves instantly, an uncertain one drops to a pre-filled manual field; uploads are idempotent per article so re-scans replace, not duplicate.",
    stats: [
      { value: "1,000", unit: "+", label: "Swatches catalogued", note: "Each image filed against its article number, single capture or bulk." },
      { value: "1", unit: "shot", label: "Capture → saved", note: "Photograph the swatch; OCR reads the article number off the label and files the image against it." },
      { value: "0", unit: "", label: "Typing when detected", note: "Manual entry only appears when detection is unsure." },
      { value: "Bulk", unit: "", label: "Upload mode", note: "Drop a folder of swatch photos; each is matched to its article in one pass." },
    ],
    outcomes: [
      {
        title: "From photo to filed in one step",
        problem: "Sample photos lived in camera rolls and chat threads, renamed by hand — if at all.",
        fix: "A capture flow that runs OCR on the swatch label to read the article number, then saves the image straight against that article.",
        result: "Every sample image is findable by its article number.",
      },
      {
        title: "Detection with a safety net",
        problem: "Labels get creased, glared or half out of frame — OCR will sometimes misread.",
        fix: "High-confidence OCR reads, matched to a valid article number, save instantly; anything uncertain falls back to a pre-filled manual field instead of guessing.",
        result: "Fast on the happy path, never wrong on the hard one.",
      },
      {
        title: "Bulk when the backlog is big",
        problem: "Existing sample libraries already had hundreds of photos to sort.",
        fix: "Bulk upload that runs the same OCR over a batch and lists anything needing a manual check.",
        result: "A whole backlog catalogued in one session.",
      },
    ],
    useCases: [
      "Digitising a physical sample library into a searchable catalogue",
      "Feeding product images into B2B catalogues and storefronts",
      "Stock audits — photograph and match items against records",
      "Onboarding new inventory batches in minutes instead of hours",
    ],
    role: "Sole engineer and designer — capture flow, detection with manual fallback, storage model, bulk upload and deployment.",
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "Claude API (OCR)", "Cloudflare Workers", "Bun"],
    image: "/images/works/05-swatch-scanner.webp",
    imageAlt:
      "Sketch of the capture, OCR and fallback flow beside the Swatch Scanner camera reading an article number off a swatch label, and a bulk upload grid flagging two images to check.",
    url: "https://swatch-scanner.achinbindlish.workers.dev/",
  },
  {
    no: "06",
    org: "Aditeraction",
    title: "Encrypted QR",
    kind: "Open-source fork · Extended",
    year: "Sep – Oct 2025",
    draft: false,
    summary:
      "Password-protected QR codes — encrypt a message into a QR that only someone with the password can read. An open-source project I forked and redesigned end to end for a cleaner, faster encrypt → share → decrypt experience.",
    facts: [
      { label: "Type", value: "Open-source fork" },
      { label: "Licence", value: "MIT" },
      { label: "My scope", value: "UI + UX" },
    ],
    // Empty on purpose: the facts row takes the stats position.
    stats: [],
    outcomes: [
      {
        title: "A redesigned interface",
        problem: "The original tool worked but felt like a utility demo, not something you'd hand to a non-technical person.",
        fix: "A full visual redesign — clear hierarchy, readable type, and a layout that works the same on phone and desktop.",
        result: "Approachable enough to share with anyone who needs to send a private code.",
      },
      {
        title: "A clearer encrypt → share → decrypt flow",
        problem: "Users had to work out which mode they were in and what to do next.",
        fix: "Customised the flow into distinct, guided steps for creating, sharing and unlocking a code.",
        result: "Fewer wrong turns from first visit to decrypted message.",
      },
      {
        title: "Open source, properly credited",
        problem: "Building on someone else's work needs to respect their licence and authorship.",
        fix: "Kept the original MIT licence and README credit in the fork, and credit the author on this page.",
        result: "A clean, licence-compliant contribution on top of an existing project.",
      },
    ],
    role: "UI redesign and UX customisation on top of an MIT-licensed open-source base — original encryption logic by kangabru, credited.",
    stack: ["Next.js 14", "React 18", "TypeScript", "Tailwind CSS", "Formik", "ZXing / qr-scanner", "Jest", "Vercel"],
    image: "/images/works/06-encrypted-qr.webp",
    imageAlt:
      "Sketch of the original screen redesigned into encrypt, share and decrypt steps, beside two phones creating a password-locked QR and unlocking it.",
    url: "https://encrypt-decryptqr.vercel.app",
    links: [
      { label: "Live", href: "https://encrypt-decryptqr.vercel.app" },
      { label: "Original project", href: "https://github.com/kangabru/encrypt-qr-codes" },
    ],
    credit:
      "Fork of kangabru/encrypt-qr-codes (MIT). Encryption logic is the original author's; the interface and flow are my redesign.",
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

export type Role = {
  title: string;
  org: string;
  type: string;
  period: string;
  points: string[];
  /** Tech by area, each rendered as a labelled row of chips. */
  stackGroups?: { label: string; items: string[] }[];
  /** Older flat chip list; kept for compatibility, no longer rendered. */
  stack?: string[];
  draft: boolean;
};

// Anything starting with "TODO" is stripped from production output.
export const experience = {
  index: "05 / EXPERIENCE",
  heading: "Where I've built.",
  roles: [
    {
      title: "Web Developer",
      org: "Good Omen Ventures",
      type: "Full-time · Sole engineer, leads all software development",
      period: "Dec 2024 – Present",
      points: [
        "Architected and built the company's ERP end-to-end as the sole engineer — the operational backbone used daily by 150+ people, processing ~300 orders a month.",
        "Own the full stack — React + TypeScript front-end, PostgreSQL schema and functions on Supabase, edge deployment on Cloudflare Workers.",
        "Shipped a private B2B catalogue on web and iOS for 250+ trade buyers, a cross-platform measurement app for the atelier, and two Shopify storefronts.",
      ],
      stackGroups: [
        { label: "Frontend", items: ["React 19", "TypeScript", "TanStack Start", "Vite", "Tailwind CSS", "JavaScript"] },
        { label: "Backend & data", items: ["PostgreSQL", "Supabase", "Postgres RPCs & triggers", "Row-level security", "Realtime", "Supabase Storage"] },
        { label: "Edge & infra", items: ["Cloudflare Workers", "Bun", "Git & GitHub"] },
        { label: "Mobile", items: ["Capacitor (iOS + Android)", "App Store release"] },
        { label: "Commerce", items: ["Shopify OS 2.0", "Liquid", "Shopify CLI", "Google Tag Manager"] },
        { label: "Documents & devices", items: ["jsPDF", "html2canvas", "ExcelJS", "QR / barcode scanning", "TSPL thermal label printing", "OCR (Claude API)"] },
      ],
      draft: false,
    },
    {
      title: "Founder",
      org: "Aditeraction",
      type: "Ownership · operated by team",
      period: "Sep 2019 – Present",
      points: [
        "Founded the studio in 2019 as a passion project; it is now run by an independent team and I hold ownership with no operational role.",
        "Personal builds published under it include Swatch Scanner (OCR sample cataloguing) and Encrypted QR (open-source fork, UI/UX redesign).",
      ],
      stackGroups: [
        { label: "Frontend", items: ["Next.js 14", "React", "TypeScript", "Vite", "Tailwind CSS", "Formik"] },
        { label: "Vision & scanning", items: ["OCR", "ZXing / qr-scanner"] },
        { label: "Infra & testing", items: ["Cloudflare Workers", "Vercel", "Bun", "Jest"] },
      ],
      draft: false,
    },
  ] as Role[],
  education: {
    degree: "B.Tech, Computer Science and Engineering",
    school: "Maharishi University of Information Technology",
    period: "2020 – 2024",
    note: "CGPA 8.4",
  },
};

export type Metric = {
  value: number;
  /** Shown before the value, e.g. "~". */
  prefix?: string;
  suffix?: string;
  label: string;
  note: string;
  draft: boolean;
};

export const impact = {
  index: "06 / IMPACT",
  heading: "Systems in production, measured.",
  metrics: [
    { value: 6, label: "Production applications shipped", note: "ERP, B2B catalogue (web + iOS), measurement app, two storefronts, swatch scanner", draft: false },
    { value: 150, suffix: "+", label: "Daily active users across my systems", note: "Floor staff, managers and accounts across two plants", draft: false },
    { value: 300, prefix: "~", label: "Orders processed per month", note: "Through the operations platform", draft: false },
    { value: 280, suffix: "+", label: "PostgreSQL migrations", note: "Written, versioned, idempotent", draft: false },
  ] as Metric[],
};

export const contact = {
  index: "07 / CONTACT",
  lines: ["Let's build", "something real."],
  email: "cse.adityanandan@gmail.com",
  emailDraft: false,
  reply: "Recruiters and engineers welcome — I reply within a day.",
  status: "Open to SDE · FDE · Founder's Office roles",
  socials: [
    { label: "GitHub", href: "https://github.com/adityanandancse" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/theadityanandan/" },
    { label: "LeetCode", href: "https://leetcode.com/u/Adityanandancse/" },
  ],
};

export const nav = [
  { label: "Index", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Works", href: "#works" },
  { label: "Approach", href: "#approach" },
  { label: "Experience", href: "#experience" },
  { label: "Impact", href: "#impact" },
  { label: "Contact", href: "#contact" },
];
