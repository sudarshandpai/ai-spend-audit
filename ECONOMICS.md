# ECONOMICS — SpendLensAI

## Unit Economics

### Cost per audit (free tier)

Each audit makes one call to the Anthropic API using `claude-sonnet-4`.

| Item | Estimate |
|---|---|
| Avg input tokens per audit | ~800 tokens (system prompt + tool data) |
| Avg output tokens per audit | ~600 tokens (structured JSON response) |
| claude-sonnet-4 input price | $3.00 / 1M tokens |
| claude-sonnet-4 output price | $15.00 / 1M tokens |
| **Cost per audit** | **(800 × $0.000003) + (600 × $0.000015) = $0.0024 + $0.009 = ~$0.011** |

**Each audit costs approximately 1 cent.**

Supabase (free tier) and Vercel (free tier) are $0 at current scale.

### Break-even on Pro tier

| Item | Value |
|---|---|
| Pro tier price | $49/month |
| API cost at 1,000 audits/month | ~$11 |
| Vercel Pro (if needed) | $20/month |
| Supabase Pro (if needed) | $25/month |
| **Break-even subscribers** | **~1 subscriber covers infra at 1,000 audits/month** |

The business is extremely low-cost to operate at early scale.

---

## Revenue Projections

### Conservative (Month 6)
- 2,000 audits/month
- 5% conversion to Pro
- 100 Pro subscribers × $49 = **$4,900 MRR**
- API costs: ~$22/month
- Infra: ~$45/month
- **Gross margin: ~99%**

### Optimistic (Month 12)
- 10,000 audits/month
- 8% conversion to Pro
- 800 Pro subscribers × $49 = **$39,200 MRR**

---

## Current Costs (Assignment / MVP Phase)

| Item | Monthly Cost |
|---|---|
| Anthropic API (testing) | ~$0.50 |
| Supabase | $0 (free tier) |
| Vercel | $0 (free tier) |
| Domain | $0 (using vercel.app subdomain) |
| **Total** | **~$0.50/month** |

---

## Sensitivity Analysis

The main cost lever is Claude API usage. At scale:

| Monthly Audits | API Cost | Margin at 100 Pro users |
|---|---|---|
| 1,000 | $11 | 97.7% |
| 10,000 | $110 | 95.6% |
| 100,000 | $1,100 | 56% |

At 100,000+ audits/month, it would be worth negotiating an Anthropic volume discount or caching common audit patterns.