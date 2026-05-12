# PROMPTS — SpendLensAI

Documentation of all prompts used in the application, including iteration history and rationale.

---

## Prompt 1: AI Spend Audit Engine

**Location:** `src/lib/anthropic.ts` (called from `src/app/api/audit/route.ts`)

**Purpose:** Takes a user's AI tool spend data and returns a structured audit with cost analysis, redundancy flags, and recommendations.

---

### Final Prompt (v3)

```
You are an expert AI procurement consultant. Your job is to audit an engineering team's AI tool spending and produce a structured cost analysis.

You will be given a list of AI tools the team is currently paying for, including: tool name, number of seats, monthly cost, and primary use case.

Analyse the stack and return ONLY a JSON object with this exact schema. Do not include any markdown, code fences, preamble, or explanation — only the raw JSON object.

{
  "summary": "2-3 sentence plain-English summary of the overall spend picture",
  "total_monthly_cost": <number>,
  "tools": [
    {
      "name": "<tool name>",
      "monthly_cost": <number>,
      "cost_per_seat": <number>,
      "utilisation_estimate": "<Low | Medium | High>",
      "redundancy_flag": <true | false>,
      "redundant_with": "<other tool name or null>",
      "verdict": "<Keep | Optimise | Cut>",
      "note": "1-sentence justification"
    }
  ],
  "recommendations": [
    "One concrete, actionable recommendation per item"
  ],
  "potential_monthly_savings": <number>
}

Here is the team's current AI tool spend:

{{TOOL_DATA}}
```

---

### Iteration History

**v1 — First attempt**

```
Analyse this AI tool spending data and tell me if it's worth it:
{{TOOL_DATA}}
```

**Problem:** Returned a wall of prose. No consistent structure. Couldn't be reliably parsed.

---

**v2 — Added JSON instruction**

```
Analyse this AI tool spend data. Return your analysis as JSON with fields: summary, tools, recommendations.

{{TOOL_DATA}}
```

**Problem:** Sometimes returned JSON, sometimes wrapped it in ```json fences, sometimes added a preamble sentence before the JSON. Parser broke on ~30% of responses.

---

**v3 — Explicit schema + strict output instruction (current)**

Added the full JSON schema as a contract. Added "Do not include any markdown, code fences, preamble, or explanation — only the raw JSON object." Added a fallback parser that strips code fences before `JSON.parse()`.

**Result:** Consistent JSON output across all test cases.

---

## Prompt 2: System Prompt Context

No separate system prompt is used. The entire instruction is in the user turn. This was a deliberate choice — for this use case, a single well-structured user prompt is simpler and produces equivalent results to a system prompt + user prompt split.

---

## Lessons Learned

1. **Be explicit about output format.** "Return JSON" is not enough. "Return ONLY a JSON object, no markdown, no code fences, no preamble" is.
2. **Provide the exact schema.** When Claude knows the exact shape expected, it conforms to it. Leaving the schema vague produces inconsistent field names.
3. **Always add a fallback parser.** Even with strict instructions, strip ` ```json ` fences before calling `JSON.parse()`. It costs 2 lines and prevents hard crashes.