# ARCHITECTURE — SpendLensAI

## Overview

SpendLensAI is a full-stack web application that audits AI tool spending for engineering teams. Users input their current AI subscriptions; a Claude-powered engine analyses the stack and returns a structured cost breakdown, redundancy flags, and ROI recommendations.

**Live URL:** https://ai-spend-audit-lovat.vercel.app/

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR + client components in one framework |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Backend / API | Next.js Route Handlers (`/api/audit`) | Co-located with frontend, no separate server |
| AI Engine | Anthropic API (`claude-sonnet-4`) | Best-in-class reasoning for cost analysis |
| Database | Supabase (Postgres) | Managed Postgres, free tier, easy REST API |
| Deployment | Vercel | Zero-config Next.js deployment |

---

## Directory Structure

```
src/
  app/
    page.tsx              # Main audit form + Tools tab
    layout.tsx            # Root layout, dark mode toggle
    results/
      [id]/
        page.tsx          # Shareable results page (SSR)
    api/
      audit/
        route.ts          # POST: calls Anthropic API, stores result in Supabase
      lead/
        route.ts          # POST: stores lead capture form submissions
  components/
    AuditForm.tsx         # Multi-row spend input form
    ResultCard.tsx        # Single tool result card
    WhatIfCalc.tsx        # What-If calculator
    ROICalc.tsx           # ROI calculator
    APIEstimator.tsx      # Token → cost estimator
  lib/
    supabase.ts           # Supabase client singleton
    anthropic.ts          # Anthropic client + prompt template
```

---

## Data Flow

```
User fills form
      ↓
POST /api/audit
      ↓
Anthropic API (claude-sonnet)
  → Structured JSON: { summary, tools[], recommendations[] }
      ↓
Store result in Supabase (audits table)
  → Returns UUID
      ↓
Redirect to /results/[uuid]
      ↓
Results page fetches from Supabase by UUID
  → Renders audit + lead capture form
```

---

## Database Schema

### `audits` table
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Shareable result ID |
| created_at | timestamptz | Auto-set |
| input_data | jsonb | Raw form submission |
| audit_result | jsonb | Claude's structured response |

### `leads` table
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto |
| created_at | timestamptz | Auto-set |
| audit_id | uuid (FK → audits) | Which audit triggered this |
| name | text | |
| email | text | |
| trap | text | Honeypot — should always be empty |

---

## Key Design Decisions

**Why Route Handlers instead of a separate backend?**
Keeps the project to a single repo and single Vercel deployment. For this scale (personal/assignment project), no benefit to a separate API server.

**Why Supabase over a local SQLite?**
Results need to be shareable via URL. That requires a remote store accessible from both the server and from any browser loading the results page.

**Why UUID-based shareable links?**
No auth needed. The UUID is unguessable, so sharing is opt-in and private by default.

**Honeypot anti-spam:**
The lead capture form contains a hidden `_trap` field. Any submission with `_trap` populated is silently discarded server-side — no real CAPTCHA needed for this volume.