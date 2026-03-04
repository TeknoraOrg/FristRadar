# FristRadar — MVP Specification

## Vision

**FristRadar** is a Germany-specific, deadline-oriented workflow app for government letters.

A single photo of a government letter instantly delivers:

1. **Deadline(s)** + "what happens if I miss it" (risk level)
2. **Action plan** (e.g. "file an objection", "submit documents", "book an appointment")
3. **Response pack**: ready-to-send text (German, optionally in plain language) + PDF export in DIN layout + attachment checklist
4. **Proof mode**: reminds to "send with proof of delivery" + stores evidence (posting receipts, screenshots, delivery confirmations, etc.)
5. **Calendar + reminders** (T-7, T-3, T-1) with an "I've sent it" button

---

## Why Germany? (High Impact)

- **Deadline culture**: Many processes revolve around formal deadlines
- **No system tracker**: Citizens often have no tracker for postal mail
- **Digital mailboxes** (e.g. Deutsche Post POSTSCAN) solve digitization, not deadlines → action → response

---

## 3 Hard Differentiators

### 1) Government Domain Knowledge as a Rule Engine

Recognize typical patterns:
- "within X days of notification/delivery"
- "no later than [date]"
- "deadline begins with ..."

Map to category + standard workflows:
- Jobcenter, Immigration Office, Tax Office, Childcare/School, Traffic Fine Authority

### 2) Response Pack, Not Just a Summary

Competitors summarize. FristRadar delivers **action-ready artifacts**:
- Letter template (DIN 5008 format)
- Subject line + reference number auto-filled
- List of attachments
- Optional: delivery method selection (fax / registered mail / De-Mail / email)

### 3) Evidence / "Proof" Folder

- Receipt photos, send date, recipient address, tracking ID — all in one place
- Foolproof: no proof left behind

---

## MVP Scope (1–2 Weeks)

### Input
- Photo or PDF of a letter

### Output (Minimum)
- Detected deadline (date) + confidence score
- 1-sentence "What is being requested?"
- 3-step to-do plan
- Export: calendar (.ics) + one generic response template

### Technical Approach (quick & clean)
- On-device OCR (or server-side)
- LLM only for classification + extraction (strict JSON schema)
- "Rule layer" for deadline logic + patterns (German phrases)

---

## Privacy / Compliance (critical in Germany)

- **Default**: Local processing or EU hosting
- **Automatic redaction** of sensitive data (name, address) for cloud analysis
- **Clear deletion functions**
- Differentiation from "AI scan everything to cloud" apps

---

## Monetization

| Tier | Price | Features |
|------|-------|----------|
| Free | 0 EUR | 5 letters/month |
| Premium | 4–9 EUR/month | Unlimited + templates + family mode |
| B2B light | TBD | Associations/schools/small law firms: "Deadline inbox" |

---

## Government Letter Categories (Top 10)

1. **Tax Office (Finanzamt)** — Tax returns, assessments, back payments
2. **Traffic Fine Authority (Bußgeldstelle)** — Regulatory offenses, hearings
3. **Jobcenter / Employment Agency** — Approvals, cooperation obligations
4. **Immigration Office (Ausländerbehörde)** — Residence permits, renewals
5. **Health Insurance (Krankenkasse)** — Contributions, benefits
6. **Pension Insurance (Rentenversicherung)** — Account clarification, assessments
7. **Building Authority (Bauamt)** — Building permits, conditions
8. **Vehicle Registration (Kfz-Zulassung)** — Inspections, registration/deregistration
9. **Childcare/School (Kita/Schule)** — Enrollment, fees
10. **Court (Gericht)** — Payment orders, summons

---

## Market Analysis

| Competitor | What They Do | What's Missing |
|------------|--------------|----------------|
| LetterMagic | AI letter scanner with deadline highlighting | No German workflow, no response templates |
| POSTSCAN (Deutsche Post) | Digital mailbox | Scan only — no deadline detection or action recommendations |
| General OCR apps | Text recognition | No government domain knowledge |

**FristRadar's opportunity**: The consistent chain of Deadline → To-do → Response Pack → Proof as a focused product.
