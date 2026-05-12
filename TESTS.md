# TESTS — SpendLensAI

## Testing Strategy

Given the 5-day build window, the testing approach prioritised breadth over depth: manual end-to-end testing for all critical paths, with focused unit tests on the two pieces most likely to break silently — the audit prompt parser and the honeypot filter.

---

## Manual Test Cases

### Form Input & Validation

| Test | Expected | Result |
|---|---|---|
| Submit empty form | Form should not submit; required fields highlighted | ✅ Pass |
| Submit with one tool row | Audit runs, results page loads | ✅ Pass |
| Submit with 5 tool rows | Audit runs, all tools appear in results | ✅ Pass |
| Reload page mid-form | Form state restored from localStorage | ✅ Pass |
| Click Reset button | All fields cleared, localStorage wiped | ✅ Pass |
| Quick Preset: Lean Startup | Form fills with preset values | ✅ Pass |
| Quick Preset: Scale-Ready | Form fills with preset values | ✅ Pass |
| Quick Preset: Best-in-Class | Form fills with preset values | ✅ Pass |

### Audit API (`/api/audit`)

| Test | Expected | Result |
|---|---|---|
| Valid payload → Anthropic API | Returns structured JSON with `summary`, `tools[]`, `recommendations[]` | ✅ Pass |
| Anthropic API key missing | Returns 500 with error message | ✅ Pass |
| Malformed JSON body | Returns 400 | ✅ Pass |
| Result stored in Supabase | Row exists in `audits` table after submission | ✅ Pass |
| UUID returned in response | Valid UUID format | ✅ Pass |

### Results Page

| Test | Expected | Result |
|---|---|---|
| Load `/results/[valid-uuid]` | Renders audit results | ✅ Pass |
| Load `/results/[invalid-uuid]` | Shows "not found" message | ✅ Pass |
| Share link opens in incognito | Results visible without login | ✅ Pass |

### Lead Capture

| Test | Expected | Result |
|---|---|---|
| Submit valid name + email | Row inserted in `leads` table | ✅ Pass |
| Submit with `_trap` field populated | Request silently discarded, no DB insert | ✅ Pass |
| Submit duplicate email for same audit | Currently accepted (no dedup) | ⚠️ Known gap |

### Tools Tab

| Test | Expected | Result |
|---|---|---|
| What-If: move slider to +5 seats | Cost delta updates in real time | ✅ Pass |
| ROI Calc: fill all fields | ROI multiple renders correctly | ✅ Pass |
| API Estimator: enter tokens/day | Monthly cost table renders for Claude/GPT-4/Gemini | ✅ Pass |

### Responsive / Accessibility

| Test | Expected | Result |
|---|---|---|
| View on 375px (mobile) | Single-column layout, no overflow | ✅ Pass |
| View on 1440px (desktop) | Two-column layout | ✅ Pass |
| Toggle dark mode | Theme switches, persists on reload | ✅ Pass |
| Keyboard navigation through form | All inputs reachable via Tab | ✅ Pass |
| Lighthouse Accessibility | ≥ 90 | ✅ 92 |
| Lighthouse Performance | ≥ 85 | ✅ 87 |

---

## Unit Tests

### `parseAuditResponse(raw: string)`

Tests that the JSON parser correctly handles Claude's output, including edge cases where Claude wraps JSON in markdown code fences.

```
✅ Valid JSON string → parsed object
✅ JSON wrapped in ```json fences → parsed object  
✅ JSON with trailing comma (malformed) → throws ParseError
✅ Empty string → throws ParseError
```

### `isHoneypot(formData: FormData)`

```
✅ Empty _trap field → returns false (legitimate submission)
✅ Non-empty _trap field → returns true (bot detected)
✅ Missing _trap field entirely → returns false
```

---

## Known Gaps

- No automated E2E tests (Playwright/Cypress). Would add these with more time.
- No load testing — unknown behaviour under concurrent submissions.
- Duplicate lead submissions not deduplicated.