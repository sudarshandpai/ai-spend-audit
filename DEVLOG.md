# DEVLOG — SpendLensAI

A daily record of what was built, broken, and shipped.

---

## May 9, 2026 — Project Kickoff

**Goal:** Get a working skeleton deployed end-to-end.

Started from scratch. Initialized a Next.js 14 project with the App Router and got it running locally. The core idea: users paste in what they're spending on AI tools, Claude audits it, and gives back a structured breakdown.

**Done today:**
- Scaffolded Next.js app, connected to Supabase (Postgres) for storing audit results
- Wrote the first version of `route.ts` — the API route that calls the Anthropic API (claude-sonnet) and returns a structured audit
- Built the spend input form: tool name, seats, monthly cost, use case
- Created the results page with a shareable URL (UUID-based)
- First successful end-to-end test: form → Claude → results page

**Blockers:** Supabase env vars took a while to wire up correctly. Vercel deployment failed twice due to missing `ANTHROPIC_API_KEY` in environment settings.

**Commit:** `feat: initial scaffold, form, audit API route, results page`

---

## May 10, 2026 — Feature Sprint

**Goal:** Add value-add features that make the tool actually useful.

Spent the day stacking features. Shipped four in one session:

**Done today:**
- **Quick Presets** — 3 buttons (Lean Startup / Scale-Ready / Best-in-Class) that auto-fill the form with realistic configurations
- **What-If Calculator** — slider to simulate "what if we add N seats?" with real-time cost delta
- **ROI Calculator** — calculates cost per developer per month and estimated productivity gain multiple
- **API Usage Estimator** — input tokens/day, get projected monthly cost across Claude, GPT-4, and Gemini

All four added to `page.tsx` as collapsible sections below the main form.

**Notes:** UI was getting cluttered. Filed a mental note to split tools into a separate tab.

**Commit:** `feat: quick presets, what-if calc, ROI calc, API estimator`

---

## May 11, 2026 — UI Overhaul

**Goal:** Make it look good on desktop, not just mobile.

The previous UI was optimized for mobile and looked cramped on a 1440p screen. Rebuilt the layout.

**Done today:**
- Moved What-If, ROI, and API Estimator into a separate **Tools tab** — main page now only has the Audit form
- Added a **Reset button** (circular arrows icon, top-right of form) to clear all fields
- Full responsive redesign: two-column layout on desktop, single column on mobile
- Added **dark/light mode toggle** — persists via `localStorage`
- Lead capture form on results page: name + email, stores to Supabase
- Added **honeypot field** (`_trap`) on lead capture to block bots
- OG image meta tags for social sharing

**Commit:** `feat: tabs, reset button, responsive layout, lead capture + honeypot`

---

## May 12, 2026 — Polish & Docs

**Goal:** Lighthouse scores, final polish, write all required documentation.

**Done today:**
- Fixed Lighthouse accessibility issues: added `aria-label` to icon buttons, improved color contrast on dark mode
- Performance: lazy-loaded the Tools tab, deferred non-critical scripts → Lighthouse Performance 87, Accessibility 92
- Form state now persists across page reloads using `localStorage`
- Wrote all required assignment documentation: ARCHITECTURE.md, DEVLOG.md, REFLECTION.md, TESTS.md, PROMPTS.md, GTM.md, ECONOMICS.md, USER_INTERVIEWS.md, LANDING_COPY.md, METRICS.md

**Commit:** `docs: all required docs, a11y fixes, localStorage form persistence`

--

### Day 5 — May 13, 2026

**Commit:** Final polish, deployment verification & submission prep

**What I did:**
- Reviewed and finalized all required submission documents (DEVLOG, REFLECTION, ARCHITECTURE)
- Verified full end-to-end flow on production (Vercel) — audit engine, email report, lead capture
- Confirmed Supabase logs are recording correctly in prod
- Minor UI/copy tweaks based on final self-review
- Cleaned up any remaining console warnings and unused imports
- Confirmed CI passes on main branch before submission

**Challenges:**
- Making sure all docs accurately reflected the real build journey without retrofitting
- Ensuring dark mode didn't break any edge-case component states

**What I learned:**
- The importance of writing docs *alongside* code, not after — the week's gap made reconstruction harder
- End-to-end testing on prod vs. dev still surfaces surprises (especially with Resend + Supabase env vars)
