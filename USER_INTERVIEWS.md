# USER INTERVIEWS — SpendLensAI

## Overview

Conducted 3 informal user interviews during the build week (May 9–12, 2026) with people matching the target profile: engineers and engineering managers who pay for AI tools.

Interviews were conversational, ~15 minutes each, done over WhatsApp voice call or in person.

---

## Interview 1 — Classmate (Software Engineering student, uses Copilot + ChatGPT)

**Background:** 3rd year CS student. Personal subscriptions to GitHub Copilot ($10/mo) and ChatGPT Plus ($20/mo). Not sure if both are worth it.

**Key quotes (paraphrased):**
- "I literally don't know what I'm getting from Copilot that I don't get from ChatGPT. I keep both because I'm scared to cancel one."
- "If someone told me which one to cut, I'd cut it immediately. I just don't want to make the wrong call."
- "A tool that just says 'you're paying twice for the same thing' would be genuinely useful."

**Insight:** Even at personal scale ($30/mo), the redundancy anxiety is real. The value of an audit is confidence to make a decision, not just data.

---

## Interview 2 — Senior Developer at a mid-size startup (~80 engineers)

**Background:** Not the budget owner, but influences tooling decisions. Team uses Copilot (company-wide license), Cursor (individual licenses for ~10 devs), and the company has a ChatGPT Enterprise contract.

**Key quotes (paraphrased):**
- "We have three things that basically do autocomplete. Nobody knows why we have all three."
- "The CFO asked our CTO last quarter to justify the AI spend. He couldn't give a clear answer."
- "A shareable report I could forward to the CTO would be perfect. I don't want to build a spreadsheet."

**Insight:** The **shareable link** feature is not a nice-to-have — it's the core use case for anyone who isn't the final decision-maker. They need something they can forward up the chain.

**Feature request:** "Can it show which tools are actually being used vs just paid for?" (Utilisation tracking — noted as future feature, not in MVP.)

---

## Interview 3 — Freelance developer (solo, uses 4 AI tools)

**Background:** Freelancer billing clients for AI tool costs as a line item. Currently pays for Claude Pro, ChatGPT Plus, Perplexity Pro, and Cursor.

**Key quotes (paraphrased):**
- "I tell clients I use AI tools but I don't actually know my cost per project. This would help me figure that out."
- "The ROI calculator is useful. I'd use that more than the audit itself."
- "Is there a way to export this as a PDF? I'd put it in my client proposals."

**Insight:** Freelancers are an unexpected secondary segment. They want cost-per-project visibility, not just team-level spend. The PDF export feature directly addresses this.

---

## Key Takeaways

| Insight | Design response |
|---|---|
| Users want confidence to cut, not just data | Audit verdict should be direct: "Cut", "Keep", "Optimise" — not wishy-washy |
| Shareable link is core for non-budget-owners | Prioritised UUID-based shareable results page |
| PDF export needed for forwarding to decision-makers | Added PDF export on results page |
| ROI calculator resonates with cost-conscious users | Kept ROI Calc in Tools tab, surfaced it prominently |
| "Which do I actually use?" is the real question | Noted as v2 feature: usage tracking via API integrations |