# AI Spend Audit

A free tool that audits your team's AI tool subscriptions and identifies cost savings opportunities.

## What it does

Paste in your AI tools, plans, and monthly spend — the audit engine analyzes each tool against official pricing data and recommends:
- Downgrades when you're on an overkill plan for your team size
- Cheaper alternatives with comparable features
- Billing errors where you're overpaying vs official pricing

Results are shareable via a unique URL and can be emailed as a report.

## Features

- Audit engine with pricing data for Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, Windsurf
- Shareable results page via unique URL
- Email report delivery via Resend
- PDF export
- Confetti for optimal spenders 🎉

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (result storage)
- Resend (transactional email)
- Anthropic Claude API (audit insights)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
RESEND_API_KEY=your_resend_api_key
```

## Running Tests

```bash
npm test
```

5 unit tests covering the core audit engine logic.

## CI

GitHub Actions runs tests on every push and pull request to `main`. See `.github/workflows/ci.yml`.

## Pricing Data

See `PRICING_DATA.md` for sources and citations for all pricing used in the audit engine.