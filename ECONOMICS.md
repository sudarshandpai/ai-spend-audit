# ECONOMICS — SpendLensAI

---

## What's a Converted Lead Worth to Credex?

Credex sells discounted AI infrastructure credits — Cursor, Claude, ChatGPT Enterprise — at a meaningful discount to retail. To estimate lead value:

**Assumptions:**

- Average startup buying Credex credits spends $2,000/month on AI tools
- Credex discount is ~20–30% off retail → customer saves $400–$600/month
- Credex margin on credits: ~15% of deal value
- Average contract: 6 months before churn or renewal

**Lead value calculation:**

- Monthly deal value to Credex: $2,000 × 15% margin = $300/month
- Average contract length: 6 months
- **LTV per converted customer: $300 × 6 = $1,800**

Conservative estimate: **$1,000–$2,000 LTV per converted Credex customer.**

---

## CAC at Each GTM Channel

| Channel                                | Method             | Estimated CAC |
| -------------------------------------- | ------------------ | ------------- |
| Hacker News "Show HN"                  | Free post, 0 spend | ~$0           |
| r/ExperiencedDevs / r/SideProject      | Free post, 0 spend | ~$0           |
| LinkedIn (organic, EM-targeted post)   | 2 hours of writing | ~$0           |
| Shareable results link (word of mouth) | Built into product | ~$0           |
| Cold DM to CTOs on X                   | 3 hours outreach   | ~$0           |

**All channels in the GTM plan are $0 paid CAC.** The tool itself is the distribution — every shared audit URL is a referral loop.

At scale (Month 3+), if Credex runs paid LinkedIn ads targeting "Engineering Manager" + "Series A":

- LinkedIn CPM: ~$80
- CTR to tool: ~1%
- Audit completion rate: ~60%
- Lead capture rate: ~15%
- Consultation booking rate: ~10%
- Credit purchase rate: ~30%
- **Paid CAC estimate: ~$1,800–$2,500** (still within LTV at $1,800, borderline — organic is the right channel at this stage)

---

## Conversion Funnel & Breakeven

Cold visitor lands on page
↓ 60% complete the audit
Audit completed (1,000/month assumed)
↓ 15% submit email
Lead captured (150/month)
↓ 10% book a Credex consultation
Consultation booked (15/month)
↓ 30% purchase credits
Credit purchase (4–5/month)
↓
Revenue to Credex: 4.5 × $1,800 LTV = ~$8,100/month

At 1,000 audits/month, the tool generates ~$8,100/month in Credex revenue.

Tool operating cost at this volume:

- Anthropic API: ~$11/month
- Vercel + Supabase: ~$0 (free tier)
- **Net contribution: ~$8,089/month**

The tool is profitable from the first converted customer. There is no meaningful cost floor to clear.

---

## What Would Have to Be True for $1M ARR in 18 Months?

$1M ARR = $83,333/month in Credex revenue from this tool.

Working backwards from the funnel:

| Metric                           | Required                       |
| -------------------------------- | ------------------------------ |
| Credit purchases/month           | 83,333 ÷ 1,800 LTV = ~46/month |
| Consultations booked (30% close) | 46 ÷ 0.30 = ~154/month         |
| Leads captured (10% book)        | 154 ÷ 0.10 = ~1,540/month      |
| Audits completed (15% capture)   | 1,540 ÷ 0.15 = ~10,267/month   |
| Page visitors (60% complete)     | 10,267 ÷ 0.60 = ~17,100/month  |

$1M ARR requires ~17,000 monthly visitors completing audits.

What has to be true:

1. **The tool goes viral at least once** — a single HN frontpage post drives 5,000–20,000 visitors in 48 hours
2. **The shareable link mechanic works** — every audit shared by a non-budget-owner to their CTO is a warm referral
3. **Credex's sales team closes 30% of consultations** — realistic for a warm inbound lead who already knows their savings number
4. **Average deal size holds at $2,000/month** — requires targeting companies with real AI spend, not solo devs

Reaching 17,000 monthly visitors by month 18 is achievable with 2–3 viral distribution moments (HN, a popular tweet, a newsletter mention) plus compounding word-of-mouth from the shareable URL mechanic.

---

## Unit Economics Summary

| Metric                      | Value         |
| --------------------------- | ------------- |
| Cost per audit              | ~$0.011       |
| LTV per Credex customer     | ~$1,800       |
| Organic CAC                 | $0            |
| Audits needed for $1M ARR   | ~10,000/month |
| Visitors needed for $1M ARR | ~17,000/month |
| Gross margin at scale       | >95%          |

The economics are strong. The constraint is distribution, not cost structure.
