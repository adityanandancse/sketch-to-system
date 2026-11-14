# Pending — Sketch to System portfolio

## Build steps
- [x] 01 Scaffold, tokens, fonts, Lenis + GSAP, grain
- [x] 02 Hero + top bar (sketch → system inversion, IST clock)
- [x] 03 Fluid dye cursor (WebGL)
- [x] 04 About + marquee
- [x] 05 Works (pinned, WebGL transitions)
- [x] 06 Approach
- [x] 07 Experience, Impact, Contact, Footer (draft content)
- [ ] 08 Menu overlay
- [ ] 09 Case-study pages (/work/[slug], static via generateStaticParams: problem, constraints, role, architecture diagram, data model, key decisions & trade-offs, impact, stack)
- [ ] 10 "How this site was built" page (fluid sim, shader transitions, performance budget)
- [ ] 11 Lite mode toggle (disables WebGL, persisted in localStorage)
- [ ] 12 Sound
- [ ] 13 Preloader + intro sequencing
- [ ] 14 3D avatar
- [ ] 15 SEO + OG + icons + sitemap
- [ ] 16 Performance & accessibility pass (Lighthouse 90+ all categories, keyboard nav, focus states, contrast)
- [ ] 17 Mobile pass
- [ ] 18 Cloudflare static-assets config

## Assets needed
- [x] Vector portrait (public/images/portrait.svg)
- [ ] 3D avatar: textured GLB from Hunyuan3D (HF Space hit free GPU limit → use 3d.hunyuan.tencent.com)
- [ ] Rig + animations in Mixamo (T-pose With Skin; idle/typing/wave Without Skin)
- [ ] Compress GLB (gltf-transform, Draco + WebP, target < 3 MB) → public/models/avatar.glb
- [ ] Work screenshots 01–06 at 1600×1000 WebP → public/images/works/
- [ ] Sound files (ambient loop + UI tick) → public/audio/
- [ ] OG image (1200×630)

## Content to review / decide
- [ ] Review all copy in src/content/site.ts (about, works)
- [ ] Real impact numbers for the data section
- [ ] Contact email + domain name
- [ ] LinkedIn, LeetCode, X URLs
- [ ] Which projects get a public URL; name clients or keep anonymous
- [ ] Remove "3D version in progress" caption once the avatar ships
- [ ] Impact + contact are in draft mode (hidden in production) until real numbers, email and socials are set in site.ts
- [ ] Resume PDF → public/resume/Aditya-Nandan-Resume.pdf
- [ ] Internship bullet points (what you built + outcome)
- [ ] Architecture diagrams for each case study
- [ ] Resume + LinkedIn: GOV title must read "Web Developer" (match offer letter); Aditeraction as "Founder — ownership, team-operated"
- [ ] Aditeraction start date
- [x] Swatch Scanner description
- [x] Encrypted QR description
- [ ] Years for Swatch Scanner and Encrypted QR
- [x] Encrypted QR: list what was extended beyond the original (add as highlights)
- [ ] Encrypted QR fork repo: keep original MIT LICENSE + README credit line

## Housekeeping
- [ ] Move project off A:\ to a local SSD (Next.js slow-filesystem warning) or add a Defender exclusion
- [x] Git: credential.username adityanandancse set for this repo
