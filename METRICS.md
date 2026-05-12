# METRICS — SpendLensAI

## North Star Metric

**Audits completed per week**

An audit completed = form submitted + results page loaded. This is the single number that captures whether the core product is delivering value. Everything else is either a driver of this or a consequence of it.

---

## Acquisition Metrics

| Metric | Definition | Target (Month 1) |
|---|---|---|
| Unique visitors | Sessions from distinct IPs | 2,000 |
| Form starts | Visitors who add at least one tool row | 30% of visitors (600) |
| Audits completed | Form submitted → results page loaded | 70% of form starts (420) |
| Completion rate | Audits completed / form starts | ≥ 70% |

---

## Engagement Metrics

| Metric | Definition | Target |
|---|---|---|
| Results page time-on-page | Avg seconds on `/results/[id]` | ≥ 45s |
| PDF downloads | Clicks on PDF export button | 20% of results viewers |
| Share link opens | Unique opens of results links by non-submitters | 30% of completed audits |
| Tools tab opens | % of users who open the Tools tab | 25% |

---

## Retention / Lead Metrics

| Metric | Definition | Target (Month 1) |
|---|---|---|
| Lead capture rate | Email submissions / results page views | 15% |
| Email open rate | For any follow-up sends | ≥ 40% |
| Return visits | Users who submit a second audit | 10% |

---

## Technical Health Metrics

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 85 |
| Lighthouse Accessibility | ≥ 90 |
| Audit API p95 latency | ≤ 8 seconds |
| Audit API error rate | ≤ 2% |
| Uptime | ≥ 99.5% |

---

## Current Actuals (as of May 12, 2026)

| Metric | Value |
|---|---|
| Lighthouse Performance | 87 |
| Lighthouse Accessibility | 92 |
| Audits completed (testing) | ~15 (all manual test runs) |
| Lead captures | 2 (test submissions) |
| Live URL | https://ai-spend-audit-lovat.vercel.app/ |

---

## What We're Not Tracking Yet

- Per-tool redundancy flag accuracy (would need user feedback loop)
- Actual utilisation of AI tools (would require OAuth integrations with each tool)
- Conversion from free → Pro (Pro tier not built yet)

These become the key metrics in Phase 2.