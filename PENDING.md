# Pending — Sketch to System portfolio

## Build steps
- [x] 01 Scaffold, tokens, fonts, Lenis + GSAP, grain
- [x] 02 Hero + top bar (sketch → system inversion, IST clock)
- [x] 03 Fluid dye cursor (WebGL)
- [x] 04 About + marquee
- [x] 05 Works (pinned, WebGL transitions)
- [ ] 06 Approach (01/02/03) + Flow (horizontal process)
- [ ] 07 Impact / data section (real numbers)
- [ ] 08 Contact + footer (giant email, IST clock, socials, status)
- [ ] 09 Menu overlay (full-screen nav, RollText links, Lenis scrollTo)
- [ ] 10 Sound (Web Audio ambient + UI ticks, SOUND toggle wired)
- [ ] 11 Preloader + intro sequencing (fonts/textures ready → hero intro)
- [ ] 12 3D avatar (GLB, head-follow on cursor, still-image fallback on mobile)
- [ ] 13 Contact form (Cloudflare Worker + email service)
- [ ] 14 SEO: metadata, OG image, favicon/app icons, sitemap, robots
- [ ] 15 Performance + accessibility pass (Lighthouse, keyboard, focus, contrast, reduced motion)
- [ ] 16 Mobile pass (all sections at 390px / 768px)
- [ ] 17 Cloudflare static-assets config (wrangler) — deploy done manually

## Assets needed
- [ ] 3D avatar: textured GLB from Hunyuan3D (HF Space hit free GPU limit → use 3d.hunyuan.tencent.com)
- [ ] Rig + animations in Mixamo (T-pose With Skin; idle/typing/wave Without Skin)
- [ ] Compress GLB (gltf-transform, Draco + WebP, target < 3 MB) → public/models/avatar.glb
- [ ] Work screenshots 01–05 at 1600×1000 WebP → public/images/works/
- [ ] Sound files (ambient loop + UI tick) → public/audio/
- [ ] OG image (1200×630)

## Content to review / decide
- [ ] Review all copy in src/content/site.ts (about, works)
- [ ] Real impact numbers for the data section
- [ ] Contact email + domain name
- [ ] Social links (GitHub, LinkedIn, Instagram, X)
- [ ] Which projects get a public URL; name clients or keep anonymous
- [ ] Remove "3D version in progress" caption once the avatar ships

## Housekeeping
- [ ] Move project off A:\ to a local SSD (Next.js slow-filesystem warning) or add a Defender exclusion
- [x] Git: credential.username adityanandancse set for this repo
