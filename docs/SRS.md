# FristRadar — Software Requirements Specification (SRS)

**Version**: 1.0
**Date**: 05.03.2026
**Product**: FristRadar — Deadline-oriented workflow app for German government letters
**Audience**: Development team, stakeholders, QA

---

## Table of Contents

1. [User Accounts & Identity Management](#1-user-accounts--identity-management)
2. [Localization & Accessibility](#2-localization--accessibility)
3. [Letter Scanning & OCR](#3-letter-scanning--ocr)
4. [AI Classification & Extraction](#4-ai-classification--extraction)
5. [Deadline Detection & Risk Assessment](#5-deadline-detection--risk-assessment)
6. [Letter Management (Briefe)](#6-letter-management-briefe)
7. [Action Plan & To-Do System](#7-action-plan--to-do-system)
8. [Response Pack & PDF Export](#8-response-pack--pdf-export)
9. [Reminders & Notifications](#9-reminders--notifications)
10. [Calendar System](#10-calendar-system)
11. [Proof-of-Delivery (Nachweise)](#11-proof-of-delivery-nachweise)
12. [Subscription & Payments](#12-subscription--payments)
13. [Privacy, Security & GDPR Compliance](#13-privacy-security--gdpr-compliance)
14. [Application Navigation & Standard Screens](#14-application-navigation--standard-screens)
15. [Constraints, Risks & Explicit Exclusions](#15-constraints-risks--explicit-exclusions)

---

## 1. User Accounts & Identity Management

### 1.1 User Registration

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | User registers with mobile phone number. System sends OTP via SMS for verification. | Critical |
| AUTH-02 | User sets a personal password during registration (minimum 8 characters). | Critical |
| AUTH-03 | Registration requires accepting Privacy Policy and Terms & Conditions. | Critical |
| AUTH-04 | Duplicate phone number detection with clear error message. | High |
| AUTH-05 | **Later**: Registration via email address with OTP verification. | Low |

### 1.2 Login & Session Management

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-06 | Login via mobile phone number + user-defined password. | Critical |
| AUTH-07 | **Later**: Passwordless login via SMS OTP (as alternative to password). | Low |
| AUTH-08 | **Later**: Social login via Google OAuth2 PKCE. | Low |
| AUTH-09 | **Later**: Social login via Apple Sign-In. | Low |
| AUTH-10 | JWT session tokens signed with jose library. Tokens have configurable expiry. | Critical |
| AUTH-11 | Refresh token flow: expired access tokens are silently refreshed without re-login. | High |
| AUTH-12 | User can log out. All local data and tokens are cleared on logout. | Critical |
| AUTH-13 | Session persists across app restarts (stored securely on device). | High |
| AUTH-14 | Password is hashed server-side (bcrypt/argon2). Raw passwords are never stored. | Critical |
| AUTH-15 | "Passwort vergessen" flow: user receives SMS OTP to reset password. | High |

### 1.3 Account Settings

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-16 | User can view and update their phone number (requires re-verification via SMS OTP). | Medium |
| AUTH-17 | User can change their password (requires current password confirmation). | High |
| AUTH-18 | **Later**: User can add/update email address (requires OTP verification). | Low |
| AUTH-19 | User can delete their account. All associated data is permanently erased (GDPR Art. 17). | Critical |
| AUTH-20 | User can export all personal data as a downloadable file (GDPR Art. 20). | High |

---

## 2. Localization & Accessibility

| ID | Requirement | Priority |
|----|-------------|----------|
| L10N-01 | App ships with two languages from day one: German (de-DE) and English (en-US). | Critical |
| L10N-02 | All UI strings are managed via i18next. No hardcoded strings in components or business logic. | Critical |
| L10N-03 | App default language is determined by the device locale. If device locale is German → German; otherwise → English. | Critical |
| L10N-04 | User can manually switch language in account settings. The selection persists across sessions. | Critical |
| L10N-05 | Date format: DD.MM.YYYY in German locale, MM/DD/YYYY in English locale. | Critical |
| L10N-06 | Currency format: European notation (comma as decimal separator, e.g. 115,00 €) in both locales. | High |
| L10N-07 | AI-generated content (summaries, action plans, response templates) is generated in the user's selected language. | High |
| L10N-08 | Response letter templates remain in German regardless of UI language (since they are sent to German authorities). | High |
| L10N-09 | **Later**: Arabic (ar) language support with RTL layout. Architecture must support RTL from the start (use logical properties, avoid hardcoded left/right). | Low |
| L10N-10 | Font sizes respect system accessibility settings (Dynamic Type on iOS, font scaling on Android). | Medium |
| L10N-11 | All interactive elements have minimum touch target of 44x44 points. | Medium |

---

## 3. Letter Scanning & OCR

### 3.1 Document Capture

| ID | Requirement | Priority |
|----|-------------|----------|
| SCAN-01 | User can photograph a government letter using the in-app camera. | Critical |
| SCAN-02 | Camera screen shows a document guide frame (A4 aspect ratio) with corner markers and alignment instructions. | High |
| SCAN-03 | Automatic edge detection, perspective correction, and shadow removal via react-native-document-scanner-plugin. | High |
| SCAN-04 | User can upload an existing photo from the device gallery. | High |
| SCAN-05 | User can upload a PDF file from the device file system. | High |
| SCAN-06 | Visual feedback during capture: shutter animation, flash effect. | Medium |
| SCAN-07 | After capture, user sees a processing screen with step-by-step progress indicators (text recognition → sender identification → deadline extraction → action plan). | High |

### 3.2 OCR Processing

| ID | Requirement | Priority |
|----|-------------|----------|
| OCR-01 | **Layer 1 (on-device)**: Text extraction runs locally using Google ML Kit (Android) and Apple Vision (iOS). No network required. Default for all users. | Critical |
| OCR-02 | On-device OCR supports German characters including umlauts (ä, ö, ü, ß). | Critical |
| OCR-03 | **Layer 2 (cloud, premium)**: When on-device OCR quality is insufficient, send document image to vision-capable LLM (Claude Sonnet → Gemini Flash → GPT-4o fallback chain). | High |
| OCR-04 | **Smart routing for PDFs**: If uploaded PDF has a text layer (≥100 chars via PyMuPDF), send extracted text to text-only LLM model (cheaper). If scanned/image-only, convert to PNG at 200 DPI and send to vision model. | High |
| OCR-05 | **Layer 3 (specialist fallback)**: Azure Document Intelligence for handwritten annotations, faded ink, stamps, or complex layouts. | Low |
| OCR-06 | Raw OCR text is always shown to user for manual verification before saving. | Critical |

---

## 4. AI Classification & Extraction

### 4.1 Letter Classification

| ID | Requirement | Priority |
|----|-------------|----------|
| AI-01 | LLM classifies the letter into one of the recognized categories: Finanzamt, Bußgeldstelle, Jobcenter/Agentur für Arbeit, Ausländerbehörde, Krankenkasse, Rentenversicherung, Bauamt, Kfz-Zulassung, Kita/Schule, Gericht, or "Sonstige" (other). | Critical |
| AI-02 | Classification includes a confidence score. Letters below a configurable threshold are flagged for user review. | High |

### 4.2 Structured Data Extraction

| ID | Requirement | Priority |
|----|-------------|----------|
| AI-03 | LLM extracts structured data conforming to a strict JSON schema with `additionalProperties: false`. Fields not found in the document return `null` (not guessed values). | Critical |
| AI-04 | Extracted fields: `letter_type`, `sender` (authority + department), `letter_date`, `deadlines[]` (type + date + days_remaining), `reference_number`, `amount` (value + currency), `urgency`, `suggested_actions[]`, `summary`. | Critical |
| AI-05 | German date patterns are recognized: "innerhalb von X Tagen", "bis spätestens [Datum]", "Frist beginnt mit Zustellung". | Critical |
| AI-06 | Currency amounts in European notation (comma decimal) are auto-converted to standard notation for storage. | High |

### 4.3 LLM Backend Chain

| ID | Requirement | Priority |
|----|-------------|----------|
| AI-07 | Primary LLM: Claude Sonnet 4.6 via Anthropic API. Supports native PDF (base64 `document` content type). | Critical |
| AI-08 | Secondary LLM: Gemini 2.5 Flash via Vertex AI EU. Used for high-volume/cost-sensitive paths. | High |
| AI-09 | Tertiary LLM: GPT-4o via OpenAI API. Activated when Claude and Gemini are unavailable. Requires PDF-to-PNG preprocessing. | Medium |
| AI-10 | Self-hosted LLM: Qwen2.5-VL + Qwen2.5 via Ollama. For local development and enterprise on-premise deployments (v2). | Low |
| AI-11 | Platform LLM: Cloudflare Workers AI for lightweight tasks (classification, embeddings, summaries). No external API latency. | Medium |
| AI-12 | Backend chain is configurable: failover order and model selection can be changed without code deployment. | High |

---

## 5. Deadline Detection & Risk Assessment

| ID | Requirement | Priority |
|----|-------------|----------|
| DL-01 | Each letter can have one or more deadlines. Each deadline has a type (e.g. "Widerspruchsfrist", "Abgabefrist"), a date, and days remaining. | Critical |
| DL-02 | Days remaining is computed dynamically from the current date, not stored statically. | Critical |
| DL-03 | Risk level is assigned per letter: **hoch** (high), **mittel** (medium), **niedrig** (low). | Critical |
| DL-04 | Risk level determines visual styling throughout the app: hoch = red (#C41E3A), mittel = orange (#CC7A00), niedrig = green (#2D7D46). | Critical |
| DL-05 | Countdown badge shows "X Tag(e) verbleibend" with urgent styling (red) when ≤ 7 days remain. | High |
| DL-06 | Letters are sorted by urgency (nearest deadline first) on the home screen. | High |
| DL-07 | User can manually edit or override a detected deadline. | High |

---

## 6. Letter Management (Briefe)

### 6.1 Letter List (Home Screen)

| ID | Requirement | Priority |
|----|-------------|----------|
| LTR-01 | Home screen displays all tracked letters as a scrollable list with sender, subject, deadline, days remaining, and risk badge. | Critical |
| LTR-02 | "Brief scannen" button initiates the scanning flow. | Critical |
| LTR-03 | Tapping a letter card navigates to the detail view. | Critical |
| LTR-04 | Free-tier users can track up to 3 active deadlines and perform 5 scans per month. | High |

### 6.2 Letter Detail View

| ID | Requirement | Priority |
|----|-------------|----------|
| LTR-05 | Detail view is organized into tabs: Übersicht (Overview), To-do, Antwort (Response), Nachweis (Evidence). | Critical |
| LTR-06 | Übersicht tab displays: risk badge, countdown badge, Aktenzeichen (reference number), Betreff (subject), Zusammenfassung (AI-generated summary), consequences of missing the deadline, receipt date, deadline date. | Critical |
| LTR-07 | User can navigate back to the previous screen (home, calendar, or Nachweise depending on origin). | High |
| LTR-08 | User can delete a tracked letter. Deletion removes all associated data (reminders, proofs, response drafts). | Medium |

---

## 7. Action Plan & To-Do System

| ID | Requirement | Priority |
|----|-------------|----------|
| TODO-01 | Each letter has an AI-generated action plan consisting of 3–5 ordered steps. | Critical |
| TODO-02 | Each step has a checkbox that the user can toggle on/off. | Critical |
| TODO-03 | A progress bar shows completion percentage (number of checked steps / total steps). | High |
| TODO-04 | Completed steps show strikethrough text and a filled checkbox. | High |
| TODO-05 | Progress bar turns green (#2D7D46) at 100% completion. | Medium |
| TODO-06 | To-do state persists across app sessions. | High |

---

## 8. Response Pack & PDF Export

### 8.1 Response Template

| ID | Requirement | Priority |
|----|-------------|----------|
| RSP-01 | Each letter has an AI-generated response template pre-filled with sender address, authority address, date placeholder, reference number, subject line, and formal German salutation. | Critical |
| RSP-02 | Response template is viewable in the Antwort tab. User can toggle template visibility. | Critical |
| RSP-03 | Response template text is displayed in monospace font for clear formatting. | Medium |
| RSP-04 | Available delivery methods (Versandoptionen) are shown per letter (e.g. "Einschreiben mit Rückschein", "ELSTER", "Fax mit Sendebericht", "Persönliche Abgabe"). | High |

### 8.2 PDF Export (Premium)

| ID | Requirement | Priority |
|----|-------------|----------|
| RSP-05 | "Als PDF exportieren (DIN 5008)" button generates a print-ready PDF of the response letter. | High |
| RSP-06 | PDF conforms to DIN 5008 German business letter format: A4 paper, left margin 25mm, right margin 20mm, top margin 27mm, address window positioning, fold marks at 105mm and 210mm. | High |
| RSP-07 | PDF generation uses Typst server-side (called from Cloudflare Workers). | High |
| RSP-08 | User can edit the response template before exporting as PDF. | High |
| RSP-09 | PDF export is a premium feature. Free-tier users can view the template but not export. | High |

---

## 9. Reminders & Notifications

### 9.1 Configurable Reminders

| ID | Requirement | Priority |
|----|-------------|----------|
| REM-01 | Each letter automatically receives 3 reminders: T-7 (7 days before deadline), T-3 (3 days before deadline), T-1 (1 day before deadline). | Critical |
| REM-02 | Reminder dates are computed dynamically from the letter's deadline date (`frist_iso`). | Critical |
| REM-03 | User can toggle each reminder (T-7, T-3, T-1) on/off independently per letter. | Critical |
| REM-04 | All reminders default to ON when a letter is first added. | High |
| REM-05 | Reminder toggle UI in the detail screen shows: label ("7 Tage vorher" / "3 Tage vorher" / "1 Tag vorher"), computed date (DD.MM.YYYY), and a toggle switch. | High |
| REM-06 | Reminder state is independent per letter (toggling a reminder for one letter does not affect others). | Critical |
| REM-07 | Reminder state persists across app sessions. | High |

### 9.2 Push Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| REM-08 | Active reminders trigger push notifications on the configured dates via Expo Push Notifications. | High |
| REM-09 | Push notification content includes: letter sender, deadline date, and days remaining (e.g. "Finanzamt Berlin-Mitte — Frist in 3 Tagen (19.03.2026)"). | High |
| REM-10 | Urgent alert: "Frist morgen!" notification on T-1. | High |
| REM-11 | Follow-up notification after deadline if no proof-of-delivery has been added: "Beleg noch hinzufügen?" | Medium |
| REM-12 | User can disable all push notifications globally in account settings. | Medium |

### 9.3 Calendar Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| REM-13 | User can export deadline + active reminders (T-7, T-3, T-1) to the native device calendar via expo-calendar. | High |
| REM-14 | .ics file export for web users and manual calendar import. | High |

---

## 10. Calendar System

| ID | Requirement | Priority |
|----|-------------|----------|
| CAL-01 | Calendar tab shows a monthly grid view (Monday–Sunday columns). | Critical |
| CAL-02 | User can navigate between months (previous/next). | Critical |
| CAL-03 | Current day is highlighted with a dark circular background. | High |
| CAL-04 | Deadline dates show a colored dot matching the letter's risk level (red/orange/green). | Critical |
| CAL-05 | Active reminder dates show a blue dot (#3B82F6), distinct from deadline dots. | Critical |
| CAL-06 | If a date has both a deadline and a reminder, both dots are shown side by side. | High |
| CAL-07 | Tapping a deadline dot navigates to that letter's detail view. | Critical |
| CAL-08 | Tapping a reminder dot navigates to the associated letter's detail view. | High |
| CAL-09 | Legend below the calendar grid explains dot colors: Hohes R., Mittleres R., Geringes R., Erinnerung. | High |
| CAL-10 | "Anstehende Fristen" section below the calendar lists all upcoming deadlines sorted by date, showing sender, subject, deadline date, countdown, risk badge, and T-label (if applicable). | High |
| CAL-11 | Tapping an upcoming deadline item navigates to that letter's detail view. | High |

---

## 11. Proof-of-Delivery (Nachweise)

### 11.1 Submission Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| PRF-01 | Each letter has a proof-of-delivery status: **Offen** (open), **Versendet** (sent), **Nachgewiesen** (proven). | Critical |
| PRF-02 | Status progression: Offen → Versendet → Nachgewiesen. | Critical |
| PRF-03 | "Als versendet markieren" button transitions status from Offen to Versendet. Records the date. | Critical |
| PRF-04 | "Beleg hinzufügen" button allows user to add proof (receipt photo, tracking ID, screenshot). Transitions status to Nachgewiesen. | Critical |
| PRF-05 | Status is color-coded: Offen = red (#C41E3A), Versendet = orange (#CC7A00), Nachgewiesen = green (#2D7D46). | High |

### 11.2 Nachweise Screen

| ID | Requirement | Priority |
|----|-------------|----------|
| PRF-06 | Dedicated "Nachweise" tab shows all letters with their delivery status. | Critical |
| PRF-07 | Summary bar at top shows total counts per status (X offen, Y versendet, Z nachgewiesen). | High |
| PRF-08 | Each letter card shows: sender, subject, current status badge, proof items (type + date), and available action buttons. | High |
| PRF-09 | Proof items are stored per letter with type (e.g. "Einschreiben"), date, and confirmation flag. | High |

### 11.3 Evidence Storage

| ID | Requirement | Priority |
|----|-------------|----------|
| PRF-10 | User can photograph a proof-of-delivery receipt via the in-app camera ("Beleg fotografieren"). | High |
| PRF-11 | Proof images are stored in Cloudflare R2 (EU bucket), encrypted at rest. | High |
| PRF-12 | Each proof record stores: type of proof, timestamp, associated letter ID, and image reference. | High |
| PRF-13 | User can view all proofs associated with a letter in the Nachweis tab of the detail view. | High |

---

## 12. Subscription & Payments

### 12.1 Pricing Tiers

| ID | Requirement | Priority |
|----|-------------|----------|
| PAY-01 | **Free tier**: 5 scans per month, 3 active deadlines, manual .ics calendar export, view-only response templates. No PDF export, no cloud OCR. | Critical |
| PAY-02 | **Premium tier (4.99 €/month or 39.99 €/year)**: Unlimited scans, unlimited active deadlines, auto-sync calendar, editable response templates, PDF export (DIN 5008), cloud OCR for handwriting. | Critical |
| PAY-03 | Free-tier limits are enforced with clear messaging when limits are reached. | High |

### 12.2 Payment Methods

| ID | Requirement | Priority |
|----|-------------|----------|
| PAY-04 | Mobile payments via RevenueCat (Apple App Store IAP + Google Play IAP). | Critical |
| PAY-05 | Web payments via Stripe through RevenueCat Web Billing. | High |
| PAY-06 | SEPA Direct Debit support for German users (via Stripe). | High |
| PAY-07 | Shared entitlements across platforms: a subscription purchased on iOS is recognized on Android and web. | High |

### 12.3 Subscription Management

| ID | Requirement | Priority |
|----|-------------|----------|
| PAY-08 | User can view current subscription status and renewal date in account settings. | High |
| PAY-09 | User can cancel subscription. Access continues until end of billing period. | High |
| PAY-10 | German 14-day Widerrufsrecht (cancellation right) compliance. | Critical |
| PAY-11 | Invoices comply with German Umsatzsteuer requirements. | High |

---

## 13. Privacy, Security & GDPR Compliance

### 13.1 Privacy by Design

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-01 | On-device OCR is the default. Documents never leave the device unless the user explicitly opts into cloud processing. | Critical |
| SEC-02 | All cloud services run in EU region (Cloudflare EU / Frankfurt). | Critical |
| SEC-03 | Data minimization: only extracted text and structured data are stored server-side, not original document images (unless user opts in to proof storage). | Critical |
| SEC-04 | Encryption at rest: Cloudflare R2 server-side encryption for stored files. | Critical |
| SEC-05 | Encryption in transit: TLS 1.3 for all API communication. | Critical |
| SEC-06 | Auto-deletion: configurable retention period (default 90 days post-deadline). User is notified before deletion. | High |
| SEC-07 | Transparency: user can see which processing mode is active (on-device vs. cloud) at all times. | High |

### 13.2 GDPR Compliance

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-08 | Privacy Policy accessible at all times (in both supported languages), including from pre-login screens. | Critical |
| SEC-09 | Terms & Conditions accessible at all times. | Critical |
| SEC-10 | Data Processing Agreement (DPA) established with all sub-processors (Anthropic, Google, OpenAI, Cloudflare, Stripe). | Critical |
| SEC-11 | Data Protection Impact Assessment (DPIA) completed — required due to processing sensitive government correspondence. | Critical |
| SEC-12 | Art. 30 Records of Processing Activities maintained. | Critical |
| SEC-13 | Right to erasure (Art. 17): dedicated API endpoint and UI flow to permanently delete all user data. | Critical |
| SEC-14 | Right to data portability (Art. 20): user can export all personal data. | High |
| SEC-15 | 72-hour breach notification procedure documented and tested. | Critical |
| SEC-16 | Cookie consent management for web version. | High |

---

## 14. Application Navigation & Standard Screens

### 14.1 Navigation Structure

| ID | Requirement | Priority |
|----|-------------|----------|
| NAV-01 | Bottom navigation bar with 3 tabs: Briefe (letters), Kalender (calendar), Nachweise (proofs). | Critical |
| NAV-02 | Active tab is visually distinguished (bold text, dark color). Inactive tabs show gray text. | High |
| NAV-03 | Tab icons: Briefe = mail icon, Kalender = calendar icon, Nachweise = folder icon. | High |
| NAV-04 | Detail views have a back button in the header that returns to the originating tab. | Critical |
| NAV-05 | "Im Kalender anzeigen" button in detail view navigates to the Calendar tab. | High |

### 14.2 Standard Screens

| ID | Requirement | Priority |
|----|-------------|----------|
| NAV-06 | Splash/loading screen with FristRadar branding on app launch. | Medium |
| NAV-07 | Login/registration screen as the entry point for unauthenticated users. | Critical |
| NAV-08 | Account settings screen with profile management, notification preferences, subscription status, privacy controls, and logout. | High |
| NAV-09 | Support/contact screen with email and FAQ link. | Medium |
| NAV-10 | Privacy Policy screen (accessible without login). | Critical |
| NAV-11 | Terms & Conditions screen (accessible without login). | Critical |

---

## 15. Constraints, Risks & Explicit Exclusions

### 15.1 Technical Constraints

| ID | Constraint |
|----|-----------|
| CON-01 | Mobile app built with Expo SDK 54 + React Native. Single codebase for iOS, Android, and Web. |
| CON-02 | Backend: Hono.js on Cloudflare Workers (EU region). Database: Cloudflare D1 via Drizzle ORM. Storage: Cloudflare R2. |
| CON-03 | PDF generation (Typst) cannot run in Workers due to filesystem constraints. Runs on a sidecar service (Hetzner VPS or Cloudflare Workers container). |
| CON-04 | LLM accuracy for deadline extraction is not 100%. User confirmation step is mandatory before saving any detected deadline. |
| CON-05 | On-device OCR does not support handwritten text. Handwriting recognition requires cloud processing (premium feature). |

### 15.2 Key Risks

| ID | Risk | Impact | Mitigation |
|----|------|--------|------------|
| RISK-01 | LLM misses a critical deadline | Critical | Always show raw OCR text; user confirms/edits before saving. |
| RISK-02 | German letter formats change | Medium | LLM-based extraction is format-agnostic; rule engine handles pattern changes. |
| RISK-03 | LLM API pricing increases | Medium | Multi-backend chain (Claude → Gemini → GPT-4o → Ollama); swap via config. |
| RISK-04 | On-device OCR quality insufficient for complex documents | Low | Cloud fallback layer available for premium users. |
| RISK-05 | User misses a push notification | Medium | Multiple reminder levels (T-7, T-3, T-1); calendar integration as backup. |

### 15.3 Explicit Exclusions (Not in Scope)

| ID | Exclusion |
|----|-----------|
| EXC-01 | FristRadar does **not** provide legal advice. AI-generated action plans and response templates are informational aids, not legal counsel. |
| EXC-02 | No continuous location tracking. No GPS data is collected at any point. |
| EXC-03 | No real-time chat or messaging between users. |
| EXC-04 | No automatic submission of responses on behalf of the user. The user must send letters themselves. |
| EXC-05 | No integration with Deutsche Post POSTSCAN or other digital mailbox services (potential v2 feature). |
| EXC-06 | No support for non-German government letters in MVP. |
| EXC-07 | No family/multi-user mode in MVP. Planned for premium tier in v2. |
| EXC-08 | Scope changes beyond this SRS require a separate written agreement. |

---

*This document is the authoritative requirements reference for FristRadar development. All implementation decisions should trace back to a requirement ID in this SRS.*
