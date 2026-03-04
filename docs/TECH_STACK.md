# FristRadar -- Tech Stack Discussion Document

**Date**: March 4, 2026
**Purpose**: Technical architecture decision for FristRadar
**Audience**: Developer team meeting

---

## 1. MOBILE FRAMEWORK

### Recommendation: React Native with Expo (SDK 54+)

Expo is the officially recommended way to start React Native projects (per React Native's own docs since Jan 2026). The New Architecture (JSI, Fabric, TurboModules) is the default, closing the historical performance gap with Flutter.

**Key advantages for FristRadar**:
- Expo Router for file-based routing across iOS, Android, and Web from a single codebase
- Expo Modules architecture enables clean integration of native OCR modules without ejecting
- Web output via `output: "single"` SPA mode -- critical for freemium funnel (web landing page to app)
- RevenueCat SDK supports iOS, Android, AND web through the same React Native codebase
- Larger hiring pool: React Native job postings outnumber Flutter roughly 6:1

**Alternatives considered**:

| Framework | Pros | Cons | Verdict |
|-----------|------|------|---------|
| **Flutter** | Faster cold start (~400ms vs ~800ms), pixel-identical UI, strong ML Kit plugin ecosystem | Dart hiring is harder, web support still not production-grade for SEO/landing pages | Good option, but doesn't justify ecosystem trade-off |
| **Native (Swift + Kotlin)** | Best OCR integration, best performance | 2x development cost, 2x maintenance | Rejected for a small team |

**Camera and document scanning**: Use `react-native-document-scanner-plugin` (works with Expo, leverages Google ML Kit's Document Scanner on Android and VisionKit on iOS for edge detection, auto-crop, shadow removal).

---

## 2. OCR STRATEGY

### Recommendation: Hybrid -- On-Device First, LLM Vision Fallback

**Informed by Invotract** (our sister project [TeknoraOrg/invotract](https://github.com/TeknoraOrg/invotract)): Invotract skips dedicated OCR entirely for scanned documents and relies on LLM vision capabilities (Claude, GPT-4o, Qwen2.5-VL) to read document images directly. For text-based PDFs it uses **PyMuPDF (fitz)** to extract text natively. This "no-OCR OCR" approach is simpler, more accurate on German government letters, and avoids maintaining a separate OCR pipeline.

**Layer 1 -- On-device text extraction (free, private, fast)**:

Use `expo-text-extractor`, which wraps:
- **Android**: Google ML Kit Text Recognition (~0.05s per frame, supports German umlauts)
- **iOS**: Apple Vision framework (~0.31s, accurate with "language correction" mode)

All processing stays on-device. Zero cloud dependency. Sufficient for clean, printed government letters.

**Layer 2 -- LLM Vision for scanned/complex documents (premium feature)**:

Following the Invotract pattern: send document images directly to vision-capable LLMs instead of a separate cloud OCR service. The LLM performs OCR + extraction in a single pass, eliminating an entire pipeline step.

- **Claude Sonnet**: Native PDF support via `document` content type (base64) -- no preprocessing needed
- **GPT-4o**: Requires PDF-to-PNG conversion first (PyMuPDF at 200 DPI), then sends as `image_url`
- **Qwen2.5-VL 7B** (via Ollama, self-hosted): Local vision model for privacy-sensitive users

**Invotract's smart routing** (adopted for FristRadar):
- If PDF has a text layer (>100 chars extracted by PyMuPDF) → send extracted text to a cheaper text-only model
- If scanned/image-only → convert to PNG → send to vision model
- This saves ~60% on LLM costs for text-based PDFs

**Layer 3 -- Azure Document Intelligence (optional, complex cases)**:

Retained as a specialized fallback for handwritten annotations, faded ink, or documents where LLM vision still struggles:
- EU region (Frankfurt) available
- ~$1.50/1000 pages
- Custom model training for recurring German form types

| Solution | German Text | Handwriting | Privacy | Cost | Verdict |
|----------|-------------|-------------|---------|------|---------|
| **Google ML Kit (on-device)** | Good | No | Excellent | Free | Layer 1 (Android) |
| **Apple Vision (on-device)** | Good | Limited | Excellent | Free | Layer 1 (iOS) |
| **LLM Vision (Claude/GPT-4o)** | Excellent | Good | EU hosting | ~$0.003/page | Layer 2 (primary cloud) |
| **Qwen2.5-VL via Ollama** | Good | Decent | Excellent (local) | GPU cost | Layer 2 (self-hosted) |
| **Azure Doc Intelligence** | Excellent | Good | EU hosting | ~$1.50/1000 pages | Layer 3 (specialist fallback) |
| **Tesseract (on-device)** | Decent | Poor | Excellent | Free | Inferior to ML Kit/Vision; skip |

---

## 3. LLM / AI FOR CLASSIFICATION AND EXTRACTION

### Recommendation: Multi-Backend Architecture (Invotract pattern)

**Informed by Invotract**: Invotract uses a pluggable multi-backend architecture where the LLM performs both OCR (via vision) and structured extraction in a single API call. FristRadar adopts this pattern with a prioritized backend chain and strict JSON schema enforcement.

### Backend Priority Chain

**Primary -- Claude Sonnet 4.6** (via Anthropic API):
- **Native PDF support**: Send base64-encoded PDFs directly as `document` content type -- no preprocessing pipeline
- **Structured output**: `json_schema` format in `output_config` (GA, strict)
- **Best German text quality**: Superior understanding of German legal/bureaucratic language
- **Prompt caching**: Up to 90% cost savings for repeated document patterns
- **Cost**: $3/M input, $15/M output (Sonnet); for high volume, Claude Haiku 4.5 at $1/M input, $5/M output

**Secondary -- Gemini 2.5 Flash** (via Vertex AI EU):
- **Price**: $0.30/M input, $2.50/M output -- cheapest vision model
- **Vision**: Can process document images directly (~$0.0004 per scan)
- **Structured output**: JSON schema enforcement
- **EU data processing**: Available via Vertex AI EU
- **Cost projection**: 100K scans/month = ~$60/month
- **Use case**: High-volume processing, cost-sensitive batch operations

**Tertiary -- GPT-4o** (via OpenAI API):
- Requires PDF-to-PNG preprocessing (no native PDF support, same limitation as in Invotract)
- Strong structured output with `strict=True` validation
- Good fallback if Anthropic/Google have outages

**Self-hosted option -- Ollama + Qwen2.5** (v2 roadmap):
- Following Invotract's dual-model approach:
  - **Qwen2.5-VL 7B**: Vision model for scanned documents
  - **Qwen2.5 3B**: Text-only model for native PDFs (faster, lighter)
- Smart routing: text-layer PDFs → text model, scanned → vision model
- Full privacy: zero data leaves the server
- Requires GPU (NVIDIA) -- suitable for enterprise on-premise deployments

### Smart Document Routing (from Invotract)

```
[Document received]
       ↓
[PyMuPDF text extraction attempt]
       ↓
  extracted_chars >= 100?
    ├── YES → Send text to text model (cheaper, faster)
    └── NO  → Convert to PNG at 200 DPI → Send to vision model
```

This routing saves ~60% on LLM costs for text-based PDFs (majority of German government mail).

### Extraction Schema

```json
{
  "letter_type": "Steuerbescheid | Mahnung | Anh\u00F6rung | ...",
  "sender": { "authority": "string", "department": "string" },
  "dates": {
    "letter_date": "YYYY-MM-DD",
    "deadlines": [
      { "type": "Widerspruchsfrist", "date": "YYYY-MM-DD", "days_remaining": 14 }
    ]
  },
  "reference_number": "string",
  "amount": { "value": 115.00, "currency": "EUR" },
  "urgency": "critical | high | medium | low",
  "suggested_actions": ["string"],
  "summary": "string"
}
```

**Schema enforcement** (adopted from Invotract):
- `additionalProperties: false` prevents hallucinated fields
- Fields not found in document return `null` (not guessed values)
- Currency: European decimal notation (comma) auto-converted to dot notation

### Comparison

| Backend | Vision | Native PDF | German Quality | Cost/1K pages | Latency | Verdict |
|---------|--------|------------|----------------|---------------|---------|---------|
| **Claude Sonnet** | Yes | Yes (base64) | Excellent | ~$4.50 | ~3s | Primary |
| **Claude Haiku** | Yes | Yes | Very Good | ~$1.50 | ~1s | Primary (high volume) |
| **Gemini 2.5 Flash** | Yes | No | Good | ~$0.40 | ~2s | Secondary (cost) |
| **GPT-4o** | Yes | No (needs PNG) | Good | ~$5.00 | ~3s | Tertiary (fallback) |
| **Qwen2.5-VL (Ollama)** | Yes | No (needs PNG) | Decent | GPU cost | ~5s | Self-hosted option |

**On-device LLM (v2 roadmap, not MVP)**: Gemma 3n / Phi-4 mini can run on modern phones, but quality gap is too large for deadline extraction where accuracy is critical.

---

## 4. BACKEND AND INFRASTRUCTURE

### Recommendation: Hono.js on Hetzner VPS + Supabase (Frankfurt)

```
Mobile App (Expo)
     |
     v
Supabase (Frankfurt EU region)
  - Auth (JWT, social login, email/password)
  - PostgreSQL database
  - Edge Functions (for webhooks)
  - Storage (encrypted document images)
     |
     v
Hono.js API Server (Hetzner VPS, Nuremberg)
  - Letter processing pipeline
  - LLM orchestration
  - PDF generation (Typst CLI)
  - Cron jobs (deadline reminders)
  - Push notifications
```

**Why Supabase (Frankfurt)**:
- EU region with GDPR-compliant data residency
- Auth, database, storage, real-time out of the box
- PostgreSQL with Row Level Security
- Free tier generous for MVP; Pro at $25/month

**Why Hono.js on Hetzner (not Cloudflare Workers)**:
- Hetzner VPS EUR 3.79/month: 2 vCPU, 4GB RAM, 40GB SSD
- Direct database connections (no connection pooling headaches)
- Can run Typst CLI for PDF generation (impossible in serverless)
- Can run longer processes (LLM calls take 2-5s; Workers have CPU time limits)
- Hono.js is runtime-agnostic -- easy migration to Workers/fly.io later
- German company, German data centers, full GDPR compliance

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Cloudflare Workers + D1** | Zero ops, global edge | D1 limitations, no long-running tasks, no CLI tools | Wrong for this workload |
| **fly.io (Frankfurt)** | Docker, EU region, auto-scaling | More expensive at low scale | Good for growth stage |
| **Railway** | Easy deploys, EU region | Less predictable costs | Decent alternative |

---

## 5. PDF GENERATION (DIN 5008 GERMAN BUSINESS LETTERS)

### Recommendation: Typst (server-side)

- Modern typesetting system (LaTeX replacement), released 2023
- Single binary (~15MB), no TeX installation
- Built-in programming language for variables, conditionals, loops
- Millisecond rendering (not seconds like LaTeX)
- PDF/UA-1 accessibility support
- Precise DIN 5008 layouts: margins (left 25mm, right 20mm), address window position, fold marks

```typst
#set page(
  paper: "a4",
  margin: (left: 25mm, right: 20mm, top: 27mm, bottom: 20mm),
)
// Address window: 45mm from top, 20mm from left, 85mm wide, 45mm tall
// Fold marks at 105mm and 210mm from top
```

| Solution | Pros | Cons | Verdict |
|----------|------|------|---------|
| **@react-pdf/renderer** | React components | No precise DIN 5008 control | Wrong tool |
| **Puppeteer** | HTML-to-PDF, flexible | ~300MB runtime, slow | Overkill |
| **LaTeX** | Gold standard | ~2GB install, slow compilation | Too heavy |
| **Typst** | Fast, precise, small binary | Newer ecosystem | Best fit |

---

## 6. PAYMENT AND SUBSCRIPTION

### Recommendation: RevenueCat (iOS + Android IAP) + Stripe (Web)

- Unified SDK covering iOS, Android, AND web
- Shared entitlements across platforms
- Free up to $2,500/month tracked revenue
- SEPA Direct Debit support via Stripe (important for German users)
- Handles German 14-day Widerrufsrecht compliance

**Pricing tiers**:

| Feature | Free | Premium (4.99/mo) | Premium (39.99/yr) |
|---------|------|---------------------|---------------------|
| Scans per month | 5 | Unlimited | Unlimited |
| Active deadlines | 3 | Unlimited | Unlimited |
| Calendar export | Manual .ics | Auto-sync | Auto-sync |
| Response templates | View only | Generate + edit | Generate + edit |
| PDF generation (DIN 5008) | No | Yes | Yes |
| Cloud OCR (handwriting) | No | Yes | Yes |

---

## 7. PRIVACY AND GDPR COMPLIANCE

### Architecture: Privacy by Design

1. **On-device first**: OCR runs locally by default. Documents never leave device unless user opts in.
2. **Data minimization**: Store only extracted text and structured data on server, not original images.
3. **EU-only processing**: All cloud services in Frankfurt/EU.
4. **Encryption**: At rest (Supabase storage) and in transit (TLS 1.3).
5. **Data retention**: Auto-delete after configurable period (default: 90 days post-deadline).
6. **Transparency**: Show users which processing mode is active (on-device vs. cloud).

**Data flow**:

```
[User takes photo] --> [On-device OCR] --> [Extracted text only]
                                               |
                                    [User opts in to cloud?]
                                      /                \
                                    No                 Yes
                                    |                   |
                          [On-device only]    [Send to EU cloud API]
                          [Store locally]     [Process, return, delete input]
                                    |                   |
                              [Structured data] <-------+
                                    |
                              [Store in Supabase Frankfurt]
                              [Encrypted, with retention policy]
```

**GDPR checklist**: Privacy policy (DE+EN), DPA with sub-processors, DPIA required (sensitive gov. correspondence), Art. 30 records, right to erasure endpoints, 72-hour breach notification.

---

## 8. COMPLETE STACK SUMMARY

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Mobile** | Expo (SDK 54) + React Native | Official recommendation, web support, largest ecosystem |
| **Navigation** | Expo Router 6 | File-based routing, web + native |
| **State** | TanStack Query + Zustand | Server state + local state |
| **On-device OCR** | expo-text-extractor (ML Kit + Vision) | Free, private, fast |
| **PDF text extraction** | PyMuPDF (fitz) server-side | Smart routing: text PDFs skip vision model |
| **Cloud OCR** | LLM Vision (primary) + Azure Doc Intelligence (fallback) | Single-pass OCR+extraction via Invotract pattern |
| **Document scanning** | react-native-document-scanner-plugin | Auto-crop, edge detection |
| **LLM (primary)** | Claude Sonnet 4.6 via Anthropic API | Native PDF support, best German quality, strict schemas |
| **LLM (high volume)** | Gemini 2.5 Flash via Vertex AI EU | Cheapest vision model with structured output |
| **LLM (fallback)** | GPT-4o via OpenAI API | Strong structured output, availability hedge |
| **LLM (self-hosted)** | Qwen2.5-VL + Qwen2.5 via Ollama | Enterprise on-premise, full privacy (v2) |
| **Auth** | Supabase Auth (Frankfurt) | JWT, social login, email/password |
| **Database** | Supabase PostgreSQL (Frankfurt) | RLS, real-time, managed |
| **Backend API** | Hono.js on Hetzner VPS | EU hosting, long-running tasks, CLI access |
| **PDF generation** | Typst (server-side) | Fast, precise DIN 5008 layout |
| **Calendar** | expo-calendar + ics npm package | Native calendar write + .ics export |
| **Payments (mobile)** | RevenueCat | Unified iOS/Android/Web subscriptions |
| **Payments (web)** | Stripe via RevenueCat Web Billing | SEPA, German invoice compliance |
| **Push** | Expo Push Notifications | Free, managed |
| **Storage** | Supabase Storage (Frankfurt) | Encrypted, EU-hosted |
| **Hosting** | Hetzner VPS (Nuremberg) | EUR 3.79/month, German company, GDPR |
| **CI/CD** | GitHub Actions | Free for public repos |

---

## 9. ESTIMATED MONTHLY COSTS (10,000 users, 50,000 scans/month)

| Service | Cost |
|---------|------|
| Hetzner VPS (CX22) | EUR 5.49 |
| Supabase Pro | $25 |
| Claude Haiku API (~40K text-route scans) | ~$60 |
| Gemini Flash API (~10K high-volume batch) | ~$4 |
| Azure Doc Intelligence (~1K specialist) | ~$1.50 |
| RevenueCat | Free (under $2,500 MTR) |
| Expo Push | Free |
| Domain + DNS | ~$1 |
| **Total** | **~$98/month** |

---

## 10. KEY RISKS

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM misses a critical deadline | Critical | Show raw OCR text; user confirms/edits before saving |
| German letter formats change | Medium | LLM-based extraction is format-agnostic |
| LLM pricing increases | Medium | Multi-backend chain (Claude → Gemini → GPT-4o → Ollama); swap via config |
| On-device OCR insufficient | Low | Cloud fallback layer (premium) |
| Typst lacks DIN 5008 template | Low | DIN 5008 spec is well-documented; 1-2 day task |
