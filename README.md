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

| Layer | Technology | Used In |
|-------|-----------|---------|
| **Mobile** | Expo (SDK 54) + React Native | Entire app shell -- runs on iOS, Android, and Web from one codebase |
| **Navigation** | Expo Router 6 | Screen transitions: Briefe list --> Letter detail --> Response tab, bottom tab bar routing |
| **State** | TanStack Query + Zustand | TanStack Query for fetching/caching letter data from API; Zustand for local UI state (active tab, scan progress, proof status) |
| **Document Scanning** | react-native-document-scanner-plugin | Camera screen: user photographs a government letter, plugin handles edge detection, perspective correction, shadow removal |
| **On-device OCR** | expo-text-extractor (ML Kit + Apple Vision) | First pass after scan: extracts raw text from the photo on-device, no network needed. Used for all free-tier users |
| **PDF Text Extraction** | PyMuPDF (fitz) server-side | When user uploads a digital PDF instead of a photo: extracts text layer to decide if a cheaper text-only LLM call suffices |
| **Cloud OCR** | LLM Vision + Azure Doc Intelligence fallback | Premium feature: scanned/handwritten letters where on-device OCR fails -- LLM reads the image directly; Azure for specialist cases (faded ink, stamps) |
| **LLM (primary)** | Claude Sonnet 4.6 | Core extraction pipeline: classifies letter type, detects deadlines, generates risk assessment, creates action plan, drafts response template -- all from one API call |
| **LLM (high volume)** | Gemini 2.5 Flash (Vertex AI EU) | Batch processing and cost-sensitive paths: re-classification of previously scanned letters, bulk reminder text generation |
| **LLM (fallback)** | GPT-4o | Activated when Claude/Gemini are unavailable: same extraction pipeline, requires PDF-to-PNG preprocessing |
| **LLM (self-hosted)** | Qwen2.5-VL + Qwen2.5 via Ollama | Local development (no API credits needed) + enterprise/on-premise deployment (v2) |
| **LLM (platform)** | Cloudflare Workers AI | On-platform inference for lightweight tasks: classification, embeddings, summaries |
| **Backend** | Hono.js on Cloudflare Workers (EU) | API server: receives scans, orchestrates LLM calls, Cron Triggers for deadline reminders (T-7/T-3/T-1), sends push notifications |
| **Database** | Cloudflare D1 (SQLite) via Drizzle ORM | Stores extracted letter data, deadlines, user preferences; edge-native, type-safe queries |
| **Auth** | Custom JWT (jose) + OTP (email/SMS) | Passwordless login via email/SMS OTP, JWT sessions, social login (Google, Apple) via OAuth2 PKCE |
| **Storage** | Cloudflare R2 (EU bucket) | Encrypted storage for proof-of-delivery photos (posting receipts, tracking screenshots), original scan images (opt-in) |
| **Calendar** | expo-calendar + ics package | "Erinnerungen im Kalender setzen" button: writes deadline + T-7/T-3/T-1 reminders to native iOS/Android calendar; .ics export for web users |
| **PDF Generation** | Typst (Hetzner PDF sidecar) | "Antwort" tab: generates ready-to-print response letters in DIN 5008 format (Typst CLI needs a VPS, not serverless) |
| **Payments** | RevenueCat + Stripe | Paywall for premium features (unlimited scans, PDF export, cloud OCR); SEPA direct debit for German users, App Store/Play Store IAP for mobile |
| **Push** | Expo Push Notifications | Deadline reminders at T-7, T-3, T-1 days; "Frist morgen!" urgent alerts; proof-of-delivery follow-ups ("Beleg noch hinzufugen?") |
| **Hosting** | Cloudflare Workers (EU) + Hetzner VPS (PDF only) | Workers: API + cron + LLM orchestration; Hetzner (EUR 3.79/mo): Typst PDF rendering |
| **CI/CD** | GitHub Actions | Automated builds, linting, Expo EAS builds for iOS/Android, preview deployments for PRs |

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
- **EU-only processing**: All cloud services on Cloudflare (EU region) and Hetzner (Nuremberg).
- **Data minimization**: Only extracted text and structured data stored server-side, not original images.
- **Encryption**: At rest (Cloudflare R2 server-side encryption) and in transit (TLS 1.3).
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

## Teknora Ecosystem -- Shared Tech Across Projects

FristRadar draws from two sister projects within the Teknora ecosystem: [Invotract](https://github.com/TeknoraOrg/invotract) (invoice extraction API) and Save2Save/MyCareSafe (mobile safety app).

### Cross-Project Tech Stack Comparison

| Layer | FristRadar | Invotract | Save2Save (MyCareSafe) |
|-------|-----------|-----------|----------------------|
| **Product** | Mobile app for German government mail deadlines | Headless invoice extraction API | Mobile safety app: check-ins, digital vault, digital will |
| **Target users** | 83M German citizens | Enterprise: ERP integrators, accounting firms | Individuals + families (safety/care) |
| **Frontend** | Expo SDK 54 + React Native | None (headless API) | Expo SDK 54 + React Native + Vite landing page |
| **Backend** | Hono.js on Cloudflare Workers | FastAPI (Python 3.12) | Hono.js on Cloudflare Workers |
| **Database** | Cloudflare D1 (SQLite) via Drizzle ORM | None (stateless) | Cloudflare D1 (SQLite) via Drizzle ORM |
| **Auth** | Custom JWT (jose) + OTP (email/SMS) | RSA-signed license keys | Custom JWT (jose) + OTP (email/SMS) |
| **LLM primary** | Claude Sonnet 4.6 (native PDF) | Claude Sonnet 4.6 (native PDF) | None |
| **LLM secondary** | Gemini 2.5 Flash (Vertex AI EU) | GPT-4o | None |
| **LLM self-hosted** | Qwen2.5-VL via Ollama (v2) | Qwen2.5-VL via Ollama (production) | None |
| **On-device OCR** | expo-text-extractor (ML Kit + Apple Vision) | N/A | N/A |
| **PDF extraction** | PyMuPDF (fitz) server-side | PyMuPDF (fitz) server-side | N/A |
| **Document scanning** | react-native-document-scanner-plugin | File upload (multipart) | expo-document-picker, expo-image-picker |
| **PDF generation** | Typst (DIN 5008 letters) | None | None |
| **Push** | Expo Push (deadline reminders) | N/A | Expo Push (check-in alerts, escalations) |
| **Email / SMS** | Not yet | N/A | Resend (email) + Twilio (SMS) |
| **Calendar** | expo-calendar + .ics export | N/A | N/A |
| **i18n** | German only (MVP) | N/A | i18next (multi-language) |
| **Mobile payments** | RevenueCat (App Store + Play Store) | License-based (RSA-signed) | react-native-iap (Apple IAP + Google Play) |
| **Web payments** | Stripe (SEPA) | Per-domain license | PayPal Subscriptions |
| **Hosting** | Cloudflare Workers (EU) + Hetzner (PDF sidecar) | Docker Compose / Windows service | Cloudflare Workers (edge) |
| **CI/CD** | GitHub Actions | Not specified | GitHub Actions + EAS Build (fingerprint caching) |
| **Monorepo** | No (single demo-app) | No | Yes (pnpm workspaces) |
| **E2E tests** | Not yet | httpx | Playwright |
| **Encryption** | Cloudflare R2 at-rest + TLS | N/A | AES-256-GCM per vault entry (zero-knowledge) |
| **Privacy** | EU-only (Cloudflare EU / Hetzner Nuremberg) | Stateless (no retention) | Cloudflare edge (global) |

### What FristRadar Reuses From Each Project

| Capability | From Invotract | From Save2Save |
|-----------|---------------|----------------|
| **LLM multi-backend chain** | Claude --> GPT-4o --> Ollama, pluggable backends | -- |
| **PyMuPDF smart routing** | Text layer detection, vision vs. text model routing | -- |
| **Native PDF to LLM** | Claude `document` content type, base64 encoding | -- |
| **Strict JSON schemas** | `additionalProperties: false`, null for missing fields | -- |
| **Self-hosted Ollama** | Qwen2.5-VL 7B + Qwen2.5 3B dual-model setup | -- |
| **Expo + React Native patterns** | -- | Same SDK 54, same Expo Router 6 |
| **Hono.js on Cloudflare Workers** | -- | Same framework + platform, identical deployment model |
| **Cloudflare D1 + Drizzle ORM** | -- | Same database + ORM stack, shared schema patterns |
| **Custom JWT (jose) + OTP** | -- | Same auth architecture, passwordless login flow |
| **TanStack Query** | -- | Server state pattern for data fetching/caching |
| **Push notification escalation** | -- | Expo Push with escalation logic (adaptable for T-7/T-3/T-1 alerts) |
| **Monorepo structure** | -- | pnpm workspaces with shared types |
| **EAS Build + fingerprint CI** | -- | Smart native build caching, skip rebuilds for JS-only changes |
| **OTA updates** | -- | EAS Update for instant patches without app store review |
| **E2E testing** | -- | Playwright setup for auth/subscription flows |
| **Zod + OpenAPI** | -- | Auto-generated API docs, runtime validation |
| **i18n** | -- | i18next setup for future multi-language support |
| **AES-256-GCM encryption** | -- | Adaptable for storing sensitive government letter data client-side |

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
