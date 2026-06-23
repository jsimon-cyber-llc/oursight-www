# OurSight — Marketing Site (`oursight.app`)

The public marketing site for **OurSight** — coach-owned lacrosse film, analysis &
team development. A no-lock-in alternative to Veo and Hudl, built by a head coach.

> This repository contains **only the marketing website**. The product application lives
> in a separate repository. Everything here is a static, dependency-free site.

---

## What this is

A single-page, production-grade static marketing site:

- **Hand-written** `HTML` + `CSS` + a small vanilla-JS interactions module — no framework, no build step.
- **Self-contained product UI mockups** (Film Room, telestration, watch-engagement, AI insights,
  tactical diagram) are drawn in pure HTML/CSS/SVG — never screenshots, never AI-rendered UI — so
  they stay pixel-crisp, on-brand, and accessible.
- **Calm "broadcast-instrument" design system**: ~90% cool gray + white, brand blue (`#2563eb`)
  rationed to emphasis, red reserved exclusively for live/record. Schibsted Grotesk (display),
  Geist (body), Geist Mono (data/labels). Signature device: a viewfinder **crop-frame** reticle.
- **Honest, defensible copy.** Every roadmap feature is labelled (`v1` / `assisted`); competitor
  claims were fact-checked and softened to verifiable framings; all CTAs are pre-launch
  (early access / waitlist / demo).

## Structure

```
site/                     # ← the published site root (served at oursight.app/)
  index.html              # the whole page
  favicon.svg             # reticle logomark
  CNAME                   # custom domain (oursight.app)
  robots.txt
  assets/
    tokens.css            # design tokens (color, type scale, spacing, radius, shadow)
    styles.css            # all component + layout styles
    main.js               # nav, scroll-reveal, tabs, FAQ accordion, scrollspy, waitlist form
    og.html               # source for the social-share card
    img/                  # hero/camera/founder photography + og.jpg
    icons/                # apple-touch-icon + 512 icon
.github/workflows/
    deploy-pages.yml       # deploys ./site to GitHub Pages on push to main
```

## Local preview

No build step. Serve the `site/` folder over HTTP (absolute `/assets/...` paths need a server):

```bash
cd site && python3 -m http.server 8899
# open http://localhost:8899
```

## Deploy

Configured to publish the `site/` folder to **GitHub Pages** via GitHub Actions
(`.github/workflows/deploy-pages.yml`) on every push to `main`. To go live on `oursight.app`:

1. In repo **Settings → Pages**, set **Source: GitHub Actions** (one-time).
2. Point DNS for the apex domain `oursight.app` at GitHub Pages
   (`A`/`AAAA` records to GitHub's Pages IPs) — the `site/CNAME` file already declares the domain.
3. Push to `main`; the workflow builds and deploys.

> Alternative (matches the team's Cloudflare stack): deploy with **Cloudflare Pages** —
> framework preset *None*, build command *(none)*, build output directory `site`.

## Brand / content guardrails (do not regress)

- **Icons only, never emojis.** Lucide-style line icons via an inline SVG sprite.
- **Red is reserved** for live/record/destructive (`--live` / `#e5484d`) — never CTAs, links, or headings.
- **One blue emphasis word** (`.ink`) per headline, maximum.
- **Label every non-shipping feature** with a phase tag (`v1` / `assisted`).
- **Pre-launch CTAs only** — never "Buy now."
- Keep competitor claims to the verifiable framings (see the comparison-table footnote in `index.html`);
  re-verify before any major update.

---

© OurSight · Coach-owned lacrosse film &amp; analysis.
