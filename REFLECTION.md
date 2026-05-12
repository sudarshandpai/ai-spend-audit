# REFLECTION — SpendLensAI

## What I set out to build

I wanted to build a tool that solves a real problem: engineering teams are paying for 5–10 AI subscriptions simultaneously (Copilot, ChatGPT, Claude, Cursor, Perplexity…) with no clear picture of what they're actually getting per dollar. SpendLensAI is an AI spend auditor — paste in your stack, get back a structured analysis.

---

## What actually got built

The core loop works end-to-end:
- Multi-row spend input form
- Claude-powered audit engine returning structured JSON
- Shareable results page
- Lead capture with honeypot spam protection
- Tools tab: What-If calculator, ROI calculator, API cost estimator
- Fully responsive UI with dark/light mode

That's more than I expected to ship. A week ago I had never built a full-stack app from scratch.

---

## What I learned

**Next.js App Router is opinionated in ways that bite you.** Server Components vs Client Components is not intuitive at first. I spent more time than I'd like to admit debugging "you cannot use hooks in a Server Component" errors.

**Prompt engineering is an actual skill.** The first version of my audit prompt returned a wall of prose. The third version returned clean JSON every time. The difference was being extremely explicit about the output schema and adding a "respond ONLY with JSON, no markdown" instruction.

**Supabase is genuinely fast to set up.** From zero to a working Postgres database with a REST API in under 20 minutes. The free tier is enough for an assignment project.

**UI responsiveness is not automatic.** Tailwind makes it easy to add responsive classes, but if you don't test on a real desktop browser, you end up with a layout that's clearly designed for mobile. I had to do a full layout pass on Day 4.

---

## What I would do differently

**Start with the data model.** I defined the Supabase schema after I'd already written the API route, which meant I had to go back and change the shape of what I was storing. Schema-first would have saved time.

**Build the shareable link earlier.** I almost ran out of time on this feature. It's actually core to the product (the whole point is to share your audit) and should have been prioritised on Day 1.

**Write the prompt in a separate file.** The Anthropic prompt is currently a template string inside `route.ts`. It should be in its own `lib/prompt.ts` so it can be versioned and tested independently.

---

## Honest assessment

This is a working MVP, not a polished product. The Claude audit is genuinely useful — it catches redundant tools and surfaces utilisation gaps that aren't obvious when you're just looking at invoices. The UI is clean but there are rough edges (error states are basic, loading UX could be smoother).

If I were continuing this past the assignment: I'd add authentication so teams can save and compare audits over time, and I'd replace the flat Supabase schema with a proper multi-tenant model.