# DEVLOG — SpendLensAI

A daily record of what was built, broken, and shipped.

---

## Day 1 — 2026-05-07

**Hours worked:** 0

**What I did:** Assignment received. Read the brief twice, took notes on the rubric. Did not write any code — wanted to think through the product before touching the keyboard.

**What I learned:** The brief is asking for a real product, not a coding exercise. Spent the evening thinking about what "Mint for AI spend" actually means from a user's perspective.

**Blockers / what I'm stuck on:** Nothing technical yet. Still deciding on the stack.

**Plan for tomorrow:** Rest day. Start fresh on May 9 with a clear plan.

---

## Day 2 — 2026-05-08

**Hours worked:** 0

**What I did:** Off day. Rested and mentally planned the architecture — form → audit engine → results page → shareable URL. Decided on Next.js + Supabase + Anthropic API.

**What I learned:** Thinking before building saves time. Knowing the data model ahead of time would have saved me a rewrite later (spoiler: it didn't fully save me).

**Blockers / what I'm stuck on:** None.

**Plan for tomorrow:** Initialize repo, scaffold Next.js app, get first end-to-end flow working by end of day.

---

## Day 3 — 2026-05-09

**Hours worked:** 5

**What I did:**
- Initialized Next.js project with App Router and TypeScript
- Connected Supabase (Postgres) for storing audit results
- Wrote first version of `route.ts` — the API route that calls claude-sonnet and returns a structured audit
- Built the spend input form: tool name, seats, monthly cost, use case
- Created the results page with a shareable UUID-based URL
- First successful end-to-end test: form → Claude → results page
- Deployed to Vercel

**What I learned:** Vercel deployment failed twice because `ANTHROPIC_API_KEY` wasn't set in the Vercel environment — not just in `.env.local`. Environment variables in Next.js need to be explicitly added in the Vercel dashboard, they don't sync from the repo.

**Blockers / what I'm stuck on:** Supabase env vars took time to wire up correctly. Supabase insert was throwing a silent error because the table schema didn't match the shape of the object I was inserting — null fields on non-nullable columns. Fixed by updating the schema to allow nulls on optional fields.

**Plan for tomorrow:** Add value-add features — presets, calculators. Make the tool more useful beyond just the raw audit.

---

## Day 4 — 2026-05-10

**Hours worked:** 4

**What I did:**
- Added Quick Presets (Lean Startup / Scale-Ready / Best-in-Class) that auto-fill the form
- Built What-If Calculator — slider to simulate adding N seats with real-time cost delta
- Built ROI Calculator — cost per developer per month and estimated productivity gain
- Built API Usage Estimator — input tokens/day, get projected monthly cost across Claude, GPT-4, Gemini
- Fixed Supabase insert error that was silently failing on Day 3
- Mobile-first UI redesign with progress bars

**What I learned:** The UI was getting cluttered fast. Four calculators on one page is too much. Filed a mental note to split into tabs tomorrow.

**Blockers / what I'm stuck on:** Resend email client was throwing a runtime error — the client was being instantiated at module level instead of inside the handler function, which breaks in Next.js Edge runtime. Fixed by moving the `new Resend()` call inside the POST handler.

**Plan for tomorrow:** Restructure UI into tabs, add reset button, responsive desktop layout.

---

## Day 5 — 2026-05-11

**Hours worked:** 5

**What I did:**
- Moved What-If, ROI, and API Estimator into a separate Tools tab — main page now only shows the Audit form
- Added Reset button (circular arrows icon, top-right of form) to clear all fields
- Full responsive redesign: two-column layout on desktop, single column on mobile
- Added dark/light mode toggle — persists via localStorage
- Lead capture form on results page: name + email, stored to Supabase
- Added honeypot field (`_trap`) on lead capture to block bots
- OG image meta tags for social sharing

**What I learned:** Responsive design isn't automatic with Tailwind — if you only test on mobile, the desktop layout will look cramped. Should have tested on a wide viewport from day one.

**Blockers / what I'm stuck on:** Dark mode had a flash of unstyled content on load. Fixed by reading the localStorage value and applying the class before React hydration using a small inline script in `layout.tsx`.

**Plan for tomorrow:** Lighthouse audit, accessibility fixes, write all required documentation.

---

## Day 6 — 2026-05-12

**Hours worked:** 6

**What I did:**
- Fixed Lighthouse accessibility issues: added `aria-label` to icon buttons, improved color contrast in dark mode
- Performance: lazy-loaded the Tools tab, deferred non-critical scripts → Lighthouse Performance 87, Accessibility 92, Best Practices 91
- Form state now persists across page reloads via localStorage
- Added email report button (sends audit via Resend)
- Fixed Resend client instantiation bug fully (was still appearing in one other route)
- Full mobile redesign of results page — savings numbers now large and readable on small screens
- Wrote Jest tests for the audit engine — 5 tests covering core logic
- Set up GitHub Actions CI (`.github/workflows/ci.yml`) — runs lint + tests on every push to main
- Wrote all required documentation: ARCHITECTURE.md, DEVLOG.md, REFLECTION.md, TESTS.md, PROMPTS.md, GTM.md, ECONOMICS.md, USER_INTERVIEWS.md, LANDING_COPY.md, METRICS.md, PRICING_DATA.md

**What I learned:** Lighthouse mobile scores are harder to hit than desktop. Lazy loading the Tools tab dropped the initial JS bundle enough to push Performance above 85.

**Blockers / what I'm stuck on:** CI took three attempts to go green — the Jest config needed `moduleNameMapper` set up for the `@/` path alias that Next.js uses. Not obvious from the Jest docs.

**Plan for tomorrow:** Final polish, submission prep, verify prod end-to-end one more time.

---

## Day 7 — 2026-05-13

**Hours worked:** 3

**What I did:**
- Verified full end-to-end flow on production (Vercel) — audit engine, email report, lead capture all working
- Confirmed Supabase is recording leads correctly in prod environment
- Minor UI and copy tweaks based on final self-review
- Cleaned up console warnings and unused imports
- Updated all docs to reflect final state of the app
- Confirmed CI is green on latest commit to main
- Submitted

**What I learned:** End-to-end testing on prod still surfaces surprises — Resend and Supabase both behave slightly differently when env vars come from Vercel rather than `.env.local`. Always test on the deployed URL before submitting, not just localhost.

**Blockers / what I'm stuck on:** None. 
