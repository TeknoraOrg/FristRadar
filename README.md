# FristRadar

**Government mail under control. Detect deadlines, take action, prove delivery.**

FristRadar is a Germany-specific, deadline-oriented workflow app for government letters. One photo of a letter instantly delivers a deadline, a risk assessment, an action plan, a ready-to-send response, and proof-of-delivery management.

---

## The Problem

German citizens receive critical government mail with legally binding deadlines -- tax assessments, traffic fines, residence permit renewals, court orders. Missing a single deadline can mean penalty fees, license suspensions, or legal consequences.

There is no system tracker for postal mail. Digital mailboxes like Deutsche Post POSTSCAN solve digitization, but not the chain of **Deadline --> Action --> Response --> Proof**.

## What FristRadar Does

A single photo of a government letter delivers:

1. **Deadline detection** + "what happens if I miss it" (risk level)
2. **Action plan** -- step-by-step to-dos (e.g. "file an objection", "submit documents")
3. **Response pack** -- ready-to-send text in DIN 5008 format + PDF export + attachment checklist
4. **Proof mode** -- reminds to send with proof of delivery, stores evidence (posting receipts, tracking IDs, delivery confirmations)
5. **Calendar + reminders** at T-7, T-3, T-1 with an "I've sent it" button

## 3 Hard Differentiators

### 1. Government Domain Knowledge as a Rule Engine
Recognizes German bureaucratic patterns ("innerhalb von X Tagen", "bis spatestens [Datum]") and maps them to category-specific workflows for Finanzamt, Jobcenter, Auslanderbehorde, Bussgeldstelle, and more.

### 2. Response Pack, Not Just a Summary
Competitors summarize. FristRadar delivers action-ready artifacts: DIN 5008 letter template with auto-filled reference number, subject line, attachments list, and delivery method selection.

### 3. Evidence / Proof Folder
Receipt photos, send date, recipient address, tracking ID -- all in one place per letter.

---

## Supported Letter Categories

| # | Authority | Examples |
|---|-----------|----------|
| 1 | **Finanzamt** (Tax Office) | Tax returns, assessments, back payments |
| 2 | **Bussgeldstelle** (Traffic Fine Authority) | Regulatory offenses, hearings |
| 3 | **Jobcenter / Agentur fur Arbeit** | Approvals, cooperation obligations |
| 4 | **Auslanderbehorde** (Immigration Office) | Residence permits, renewals |
| 5 | **Krankenkasse** (Health Insurance) | Contributions, benefits |
| 6 | **Rentenversicherung** (Pension Insurance) | Account clarification, assessments |
| 7 | **Bauamt** (Building Authority) | Building permits, conditions |
| 8 | **Kfz-Zulassung** (Vehicle Registration) | Inspections, registration |
| 9 | **Kita / Schule** (Childcare / School) | Enrollment, fees |
| 10 | **Gericht** (Court) | Payment orders, summons |

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Mobile** | Expo (SDK 54) + React Native | Single codebase for iOS, Android, Web |
| **Navigation** | Expo Router 6 | File-based routing, web + native |
| **State** | TanStack Query + Zustand | Server state + local state |
| **Document Scanning** | react-native-document-scanner-plugin | Auto-crop, edge detection |
| **On-device OCR** | expo-text-extractor (ML Kit + Apple Vision) | Free, private, fast |
| **PDF Text Extraction** | PyMuPDF (fitz) server-side | Smart routing: text PDFs skip vision models |
| **Cloud OCR** | LLM Vision + Azure Doc Intelligence fallback | Single-pass OCR + extraction |
| **LLM (primary)** | Claude Sonnet 4.6 | Native PDF support, best German quality |
| **LLM (high volume)** | Gemini 2.5 Flash (Vertex AI EU) | Cheapest vision model |
| **LLM (fallback)** | GPT-4o | Availability hedge |
| **LLM (self-hosted)** | Qwen2.5-VL + Qwen2.5 via Ollama | Enterprise on-premise (v2) |
| **Backend** | Hono.js on Hetzner VPS (Nuremberg) | EU hosting, GDPR, EUR 5.49/mo |
| **Database + Auth** | Supabase (Frankfurt) | PostgreSQL + RLS, Auth, Storage |
| **PDF Generation** | Typst | DIN 5008 German business letters |
| **Payments** | RevenueCat + Stripe | iOS/Android/Web + SEPA support |
| **Push** | Expo Push Notifications | Free, managed |

### AI Architecture (Invotract Pattern)

The LLM performs OCR and structured extraction in a single API call -- no separate OCR pipeline for cloud processing. Adopted from [Invotract](https://github.com/TeknoraOrg/invotract), our sister invoice extraction project.

```
[Photo/PDF received]
        |
[PyMuPDF: text layer present?]
   YES --> Send extracted text to text model (cheaper, faster)
   NO  --> Convert to PNG at 200 DPI --> Send to vision model
        |
[LLM returns strict JSON schema]
   - letter_type, sender, deadlines, reference_number
   - urgency, amount, suggested_actions, summary
        |
[Rule engine applies German deadline logic]
        |
[User sees: deadline + risk + action plan + response template]
```

---

## Privacy

- **On-device first**: OCR runs locally by default. Documents never leave the device unless the user opts in.
- **EU-only processing**: All cloud services hosted in Frankfurt / Nuremberg.
- **Data minimization**: Only extracted text and structured data stored server-side, not original images.
- **Encryption**: At rest (Supabase Storage) and in transit (TLS 1.3).
- **Auto-deletion**: Configurable retention period (default: 90 days post-deadline).

---

## Pricing

| Feature | Free | Premium (4.99/mo) |
|---------|------|--------------------|
| Scans per month | 5 | Unlimited |
| Active deadlines | 3 | Unlimited |
| Calendar export | Manual .ics | Auto-sync |
| Response templates | View only | Generate + edit |
| PDF generation (DIN 5008) | No | Yes |
| Cloud OCR (handwriting) | No | Yes |

---

## Demo

The `demo-app/` directory contains an interactive prototype built with React + Vite that showcases the core user flow: scanning a letter, viewing the extracted deadline and action plan, calendar view with deadline dots, and proof-of-delivery management.

```bash
cd demo-app
npm install
npm run dev
```

---

## Market

| Competitor | What They Do | Gap |
|------------|--------------|-----|
| LetterMagic | AI letter scanner with deadline highlighting | No German workflow, no response templates |
| POSTSCAN (Deutsche Post) | Digital mailbox | Scan only -- no deadline detection or actions |
| General OCR apps | Text recognition | No government domain knowledge |

**FristRadar's opportunity**: The consistent chain of **Deadline --> To-do --> Response Pack --> Proof** as a focused product for 83 million German residents.

---

## Project Structure

```
FristRadar/
  demo-app/          # Interactive prototype (React + Vite)
  docs/
    MVP.md            # MVP specification
    TECH_STACK.md     # Detailed technical architecture
```

## License

Proprietary. All rights reserved.
