# REFLECTION — SpendLensAI

---

## Q1. The hardest bug you hit this week, and how you debugged it

The hardest bug was the Supabase insert failing silently on Day 1... [keep everything you wrote]
A second non-obvious bug was the Resend client instantiation. The transactional email after lead capture was throwing a runtime error in production but not locally. Locally I was loading the API key via .env.local; on Vercel the key was set but I was instantiating the Resend client at the module level (const resend = new Resend(process.env.RESEND_API_KEY)) before the environment was fully hydrated in the serverless function context. Moving the instantiation inside the handler function resolved it. The fix was one line but finding it took 40 minutes of reading Vercel deployment logs.

---

## Q2. A decision you reversed mid-week, and what made you reverse it

On Day 1, I built the audit engine by sending the user's full spend data to Claude and asking it to return a narrative paragraph explaining the audit. The output was readable but unstructured — Claude would write things like "You might want to consider switching from Cursor Pro to a cheaper alternative" in flowing prose. That's fine for a human reader, but it made it impossible to build a structured results page with per-tool breakdowns, savings numbers, and a hero total.

By Day 2 I reversed this completely. I rewrote the prompt to ask Claude to return strict JSON — a specific schema with fields for each tool, a recommended action, a savings amount, and a one-sentence reason. I added "respond ONLY with valid JSON, no markdown, no preamble" to the prompt. The third version of the prompt was the one that worked reliably.

The reversal was triggered by trying to build the results page against the prose output and realising I'd have to parse natural language to extract numbers. That's fragile and wrong. The right call was to make the API contract explicit and push the structure into the prompt, not the parser. Hardcoded audit rules with structured output from Claude is a much more reliable system than asking Claude to do math in prose.

---

## Q3. What you would build in week 2

The biggest gap in the current MVP is that it's stateless — every audit is a one-time snapshot. In week 2 I'd add authentication (Clerk or Supabase Auth) so teams can create an account, save audits over time, and see how their spend changes month over month. A simple dashboard showing "your AI spend in April vs March" and flagging new tools added to the stack would make this genuinely sticky rather than a one-time use tool.

Second priority: utilisation tracking. Right now the audit only knows what you're paying — it has no idea if you're actually using the tools. Every user interview surfaced this. The senior dev at the 80-person startup said his team had three autocomplete tools and nobody knew which ones were being used. The right solution is OAuth integrations with GitHub (for Copilot usage data) and the OpenAI and Anthropic APIs (for token usage). Even a rough "you used 2% of your Claude Pro quota last month" would make the recommendations dramatically more defensible.

Third: a Slack bot that runs a monthly audit automatically and posts the summary to a channel. Zero friction, runs itself, reminds the team every month. That's the distribution mechanism that makes this a habit rather than a one-time tool.

---

## Q4. How you used AI tools

I used Claude (via claude.ai) as my primary tool throughout the week. Cursor was open for the whole build but I used it mostly for autocomplete and inline edits rather than large generations.

For tasks I trusted Claude with: boilerplate scaffolding (Next.js API route structure, Supabase client setup, Tailwind component layouts), debugging error messages I hadn't seen before, and writing the first draft of all the documentation files. It was genuinely fast for these.

For tasks I didn't trust it with: the audit engine logic and the prompt itself. The audit engine is the core of the product — if the recommendations are wrong, the whole thing is wrong. I wrote the pricing data by hand from official vendor pages and wrote the recommendation rules myself. I didn't want Claude hallucinating a price or suggesting a tool switch that doesn't make financial sense.

One specific time the AI was wrong: I asked Claude to help me set up the Jest config for a Next.js project with TypeScript and the `@/` path alias. It gave me a config that looked correct but was missing `moduleNameMapper` for the path alias, which caused every import using `@/` to fail at test time with a "Cannot find module" error. The config it suggested would have worked for a vanilla TypeScript project but not for Next.js specifically. I caught it because the tests were failing with a module resolution error, not a logic error — which made it obvious the config was wrong, not the tests.

---

## Q5. Self-rating

**Discipline — 7/10**
I took two full off days at the start of the window (May 7 and May 8) before writing a single line of code. The build itself was consistent once it started, but starting late added pressure at the end and left less time for polish than I'd have liked.

**Code quality — 7/10**
The core logic is readable and typed correctly, but there are rough edges. The Anthropic prompt is a template string inside `route.ts` instead of a separate `lib/prompt.ts` file. Error states in the UI are basic — a failed API call shows a generic message rather than something actionable. These are fixable but I ran out of time.

**Design sense — 8/10**
The UI is clean, responsive, and works in both dark and light mode. The results page is designed to be screenshotted and shared, which was a deliberate choice. I lost a point because the loading state between form submission and results could be smoother — the transition is abrupt.

**Problem-solving — 8/10**
I debugged two non-obvious issues (the Supabase silent insert failure and the Resend client instantiation bug, both described in Q1) without prior full-stack experience in Next.js. Both required forming multiple hypotheses and ruling them out systematically before finding the real cause. I'd give myself a full 9 if I'd caught the Supabase schema mismatch faster.

**Entrepreneurial thinking — 7/10**
I did three real user interviews, built the shareable link as a distribution mechanism, and designed the results page to be forwarded up the chain to decision-makers. The GTM plan is specific enough to be actionable. I'm docking myself 3 points because I didn't think about the freelancer segment until Interview 3 surfaced it — a sharper founder would have identified that segment earlier and built for it from the start.