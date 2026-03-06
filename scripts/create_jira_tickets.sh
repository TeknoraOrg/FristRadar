#!/bin/bash
# FristRadar Jira ticket creation script
# Creates epics and stories in FR project based on SRS.md

JIRA_AUTH=$(echo -n "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64 -w0)
BASE="https://teknora.atlassian.net/rest/api/3"
PROJECT="FR"
COMPONENT_ID="10258"  # Development
EPIC_TYPE="10000"
STORY_TYPE="10012"
SP_FIELD="customfield_10016"
EPIC_NAME_FIELD="customfield_10011"
EPIC_LINK_FIELD="customfield_10014"

create_epic() {
  local name="$1"
  local summary="$2"
  local desc="$3"
  local result=$(curl -s -X POST -H "Authorization: Basic $JIRA_AUTH" -H "Content-Type: application/json" \
    "$BASE/issue" \
    -d "{
      \"fields\": {
        \"project\": {\"key\": \"$PROJECT\"},
        \"issuetype\": {\"id\": \"$EPIC_TYPE\"},
        \"summary\": $(echo "$summary" | python -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))'),
        \"$EPIC_NAME_FIELD\": $(echo "$name" | python -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))'),
        \"description\": {\"type\":\"doc\",\"version\":1,\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":$(echo "$desc" | python -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))')}]}]},
        \"components\": [{\"id\": \"$COMPONENT_ID\"}]
      }
    }")
  local key=$(echo "$result" | python -c "import sys,json; print(json.load(sys.stdin).get('key','ERROR'))" 2>/dev/null)
  if [ "$key" = "ERROR" ] || [ -z "$key" ]; then
    echo "EPIC CREATION FAILED: $result" >&2
    echo "ERROR"
  else
    # Transition to Selected for Development (To Do) - transition ID 21
    curl -s -X POST -H "Authorization: Basic $JIRA_AUTH" -H "Content-Type: application/json" \
      "$BASE/issue/$key/transitions" -d '{"transition":{"id":"21"}}' > /dev/null
    echo "$key"
  fi
}

create_story() {
  local epic_key="$1"
  local summary="$2"
  local desc="$3"
  local sp="$4"
  local labels="$5"  # comma-separated

  # Build labels JSON array
  local labels_json=$(echo "$labels" | python -c "
import sys,json
labels = [l.strip() for l in sys.stdin.read().strip().split(',') if l.strip()]
print(json.dumps(labels))
")

  local desc_json=$(echo "$desc" | python -c "
import sys,json
text = sys.stdin.read().strip()
doc = {
  'type': 'doc', 'version': 1,
  'content': [{'type': 'paragraph', 'content': [{'type': 'text', 'text': text}]}]
}
print(json.dumps(doc))
")

  local result=$(curl -s -X POST -H "Authorization: Basic $JIRA_AUTH" -H "Content-Type: application/json" \
    "$BASE/issue" \
    -d "{
      \"fields\": {
        \"project\": {\"key\": \"$PROJECT\"},
        \"issuetype\": {\"id\": \"$STORY_TYPE\"},
        \"summary\": $(echo "$summary" | python -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))'),
        \"description\": $desc_json,
        \"components\": [{\"id\": \"$COMPONENT_ID\"}],
        \"labels\": $labels_json,
        \"$SP_FIELD\": $sp,
        \"$EPIC_LINK_FIELD\": \"$epic_key\"
      }
    }")
  local key=$(echo "$result" | python -c "import sys,json; print(json.load(sys.stdin).get('key','ERROR'))" 2>/dev/null)
  if [ "$key" = "ERROR" ] || [ -z "$key" ]; then
    echo "  STORY FAILED: $result" >&2
  else
    # Transition to Selected for Development (To Do)
    curl -s -X POST -H "Authorization: Basic $JIRA_AUTH" -H "Content-Type: application/json" \
      "$BASE/issue/$key/transitions" -d '{"transition":{"id":"21"}}' > /dev/null
    echo "  Created: $key ($summary)"
  fi
}

echo "========================================="
echo "Creating FristRadar Jira tickets from SRS"
echo "========================================="

# ============================================================
# EPIC 1: User Accounts & Identity Management
# ============================================================
echo ""
echo "--- Epic 1: User Accounts & Identity Management ---"
EPIC1=$(create_epic \
  "User Accounts & Identity" \
  "User Accounts & Identity Management" \
  "SRS Section 1: User registration, login, session management, and account settings. Covers AUTH-01 through AUTH-15.")
echo "Epic: $EPIC1"

create_story "$EPIC1" \
  "Email registration with OTP verification" \
  "Implement user registration with email address. System sends OTP (one-time password) for email verification. Registration requires accepting Privacy Policy and Terms & Conditions. Duplicate email detection with clear error message.

Acceptance Criteria:
- User enters email, receives OTP, verifies to complete registration
- Privacy Policy + T&C acceptance checkbox required before registration
- Duplicate email returns clear error message
- OTP has configurable expiry

SRS References: AUTH-01, AUTH-03, AUTH-04" \
  5 "Sprint-1"

create_story "$EPIC1" \
  "Phone number registration with SMS OTP" \
  "Implement user registration with mobile phone number. System sends OTP via SMS for verification. Duplicate phone detection with clear error message.

Acceptance Criteria:
- User enters phone number, receives SMS OTP, verifies to complete registration
- Duplicate phone number returns clear error message
- SMS delivery via configured provider

SRS References: AUTH-02, AUTH-04" \
  3 "Sprint-1"

create_story "$EPIC1" \
  "Passwordless login via email or SMS OTP" \
  "Implement passwordless login flow. User enters email or phone number, receives OTP, enters it to log in. No passwords stored.

Acceptance Criteria:
- Login screen with email/phone input
- OTP sent on submit, verification screen displayed
- Successful verification creates session
- Failed OTP shows error

SRS References: AUTH-05" \
  5 "Sprint-1"

create_story "$EPIC1" \
  "JWT session tokens with jose library" \
  "Implement JWT-based session management using the jose library. Access tokens with configurable expiry. Refresh token flow for silent token renewal without re-login. Session persists across app restarts (stored securely on device).

Acceptance Criteria:
- JWT access + refresh tokens issued on login
- Access token has configurable expiry
- Expired access token is silently refreshed using refresh token
- Tokens stored securely on device (SecureStore on mobile)
- Session persists across app restarts

SRS References: AUTH-08, AUTH-09, AUTH-11" \
  5 "Sprint-1"

create_story "$EPIC1" \
  "Logout and session clearing" \
  "Implement logout functionality. All local data and tokens are cleared on logout.

Acceptance Criteria:
- Logout button in account settings
- On logout: clear JWT tokens, clear local cache, navigate to login screen
- Subsequent app opens show login screen

SRS References: AUTH-10" \
  2 "Sprint-1"

create_story "$EPIC1" \
  "Social login via Google OAuth2 PKCE" \
  "Implement Google social login using OAuth2 PKCE flow.

Acceptance Criteria:
- Google Sign-In button on login screen
- OAuth2 PKCE flow (no client secret on device)
- On success: create/link account, issue JWT session
- On failure: clear error message

SRS References: AUTH-06" \
  5 "Sprint-2"

create_story "$EPIC1" \
  "Social login via Apple Sign-In" \
  "Implement Apple Sign-In login flow.

Acceptance Criteria:
- Apple Sign-In button on login screen (iOS required, Android/web optional)
- On success: create/link account, issue JWT session
- Handle Apple's email relay/private email

SRS References: AUTH-07" \
  5 "Sprint-2"

create_story "$EPIC1" \
  "Account settings: email and phone update" \
  "User can view and update their email address and phone number. Each update requires re-verification via OTP.

Acceptance Criteria:
- Account settings screen shows current email and phone
- Edit triggers OTP verification for the new value
- Old value remains until new value is verified

SRS References: AUTH-12, AUTH-13" \
  3 "Sprint-7"

create_story "$EPIC1" \
  "Account deletion (GDPR Art. 17)" \
  "User can delete their account. All associated data is permanently erased: letters, reminders, proofs, response drafts, user profile.

Acceptance Criteria:
- Delete account button in settings with confirmation dialog
- Backend API endpoint permanently erases all user data
- User is logged out after deletion
- Data is irrecoverable

SRS References: AUTH-14" \
  5 "Sprint-7"

create_story "$EPIC1" \
  "Personal data export (GDPR Art. 20)" \
  "User can export all personal data as a downloadable file.

Acceptance Criteria:
- Export button in account settings
- Generates downloadable file containing all user data (profile, letters, deadlines, proofs, reminders)
- Export format allows portability

SRS References: AUTH-15" \
  5 "Sprint-7"

# ============================================================
# EPIC 2: Localization & Accessibility
# ============================================================
echo ""
echo "--- Epic 2: Localization & Accessibility ---"
EPIC2=$(create_epic \
  "Localization & Accessibility" \
  "Localization & Accessibility" \
  "SRS Section 2: German locale defaults, date/currency formatting, accessibility, and future i18n architecture. Covers L10N-01 through L10N-06.")
echo "Epic: $EPIC2"

create_story "$EPIC2" \
  "German locale defaults: language, date, currency" \
  "Set German (de-DE) as the default app language. All UI text, labels, and system messages in German. Date format DD.MM.YYYY throughout the app. Currency format uses European notation (comma as decimal separator, e.g. 115,00 EUR).

Acceptance Criteria:
- All UI strings in German
- Dates rendered as DD.MM.YYYY everywhere
- Currency amounts use comma decimal separator

SRS References: L10N-01, L10N-02, L10N-03" \
  2 "Sprint-1"

create_story "$EPIC2" \
  "i18next architecture for future multi-language support" \
  "Set up i18next framework so that architecture does not hardcode German strings in business logic. All user-facing strings extracted to translation files. Future languages can be added by adding translation files only.

Acceptance Criteria:
- i18next configured with de-DE as default
- All UI strings use translation keys, not hardcoded German
- Adding a new language requires only a new JSON translation file

SRS References: L10N-04" \
  3 "Sprint-8"

create_story "$EPIC2" \
  "Accessibility: Dynamic Type, font scaling, touch targets" \
  "Font sizes respect system accessibility settings (Dynamic Type on iOS, font scaling on Android). All interactive elements have minimum touch target of 44x44 points.

Acceptance Criteria:
- Text scales with OS-level font size settings
- All buttons, toggles, and tappable areas meet 44x44pt minimum
- UI remains usable at largest font scale

SRS References: L10N-05, L10N-06" \
  3 "Sprint-8"

# ============================================================
# EPIC 3: Letter Scanning & OCR
# ============================================================
echo ""
echo "--- Epic 3: Letter Scanning & OCR ---"
EPIC3=$(create_epic \
  "Letter Scanning & OCR" \
  "Letter Scanning & OCR" \
  "SRS Section 3: Document capture (camera, gallery, PDF upload), on-device OCR, cloud OCR, smart PDF routing. Covers SCAN-01 through SCAN-07 and OCR-01 through OCR-06.")
echo "Epic: $EPIC3"

create_story "$EPIC3" \
  "Camera screen with document guide frame" \
  "Implement in-app camera screen for photographing government letters. Camera screen shows a document guide frame (A4 aspect ratio) with corner markers and alignment instructions. Visual feedback during capture: shutter animation, flash effect.

Acceptance Criteria:
- Full-screen camera view
- A4 aspect ratio guide frame with corner markers
- Instruction text: alignment guidance
- Shutter button with animation
- Flash effect on capture

SRS References: SCAN-01, SCAN-02, SCAN-06" \
  5 "Sprint-2"

create_story "$EPIC3" \
  "Auto edge detection and perspective correction" \
  "Integrate react-native-document-scanner-plugin for automatic edge detection, perspective correction, and shadow removal on captured letter photos.

Acceptance Criteria:
- Document edges automatically detected after capture
- Perspective corrected to produce flat, rectangular output
- Shadow removal applied
- User can retake if result is poor

SRS References: SCAN-03" \
  5 "Sprint-2"

create_story "$EPIC3" \
  "Photo gallery upload" \
  "User can upload an existing photo from the device gallery instead of using the camera.

Acceptance Criteria:
- Gallery picker accessible from scan screen
- Selected photo enters same processing pipeline as camera capture
- Supports common image formats (JPEG, PNG)

SRS References: SCAN-04" \
  3 "Sprint-2"

create_story "$EPIC3" \
  "PDF file upload" \
  "User can upload a PDF file from the device file system.

Acceptance Criteria:
- File picker for PDF selection
- PDF enters the processing pipeline
- Multi-page PDFs handled (at minimum first page)

SRS References: SCAN-05" \
  3 "Sprint-2"

create_story "$EPIC3" \
  "Processing screen with progress indicators" \
  "After capture/upload, user sees a processing screen with step-by-step progress indicators: text recognition, sender identification, deadline extraction, action plan creation.

Acceptance Criteria:
- Processing screen with 4 steps shown
- Each step transitions: pending -> current -> completed
- Screen transitions to result when all steps complete

SRS References: SCAN-07" \
  3 "Sprint-2"

create_story "$EPIC3" \
  "On-device OCR with ML Kit and Apple Vision" \
  "Implement Layer 1 on-device text extraction using Google ML Kit (Android) and Apple Vision (iOS). No network required. Supports German characters including umlauts. Default for all users.

Acceptance Criteria:
- Text extracted locally on Android via ML Kit
- Text extracted locally on iOS via Apple Vision
- German umlauts (ae, oe, ue, ss) correctly recognized
- No network calls made during extraction
- Extraction result passed to next pipeline step

SRS References: OCR-01, OCR-02" \
  8 "Sprint-2"

create_story "$EPIC3" \
  "OCR result review screen" \
  "Raw OCR text is always shown to user for manual verification before saving. User can confirm or edit the extracted text.

Acceptance Criteria:
- Screen displays raw extracted text
- User can edit text before proceeding
- Confirm button saves and proceeds to AI extraction
- Mandatory step: user must confirm before saving

SRS References: OCR-06" \
  3 "Sprint-3"

create_story "$EPIC3" \
  "Cloud OCR via LLM vision (premium)" \
  "Layer 2 cloud OCR: when on-device OCR quality is insufficient, send document image to vision-capable LLM. Follows backend chain: Claude Sonnet -> Gemini Flash -> GPT-4o fallback. Premium feature only.

Acceptance Criteria:
- Cloud OCR triggered when on-device result is low quality or user requests it
- Image sent to primary LLM (Claude Sonnet) with vision capability
- Falls back to secondary (Gemini Flash) then tertiary (GPT-4o) on failure
- Premium feature: free-tier users cannot access

SRS References: OCR-03" \
  8 "Sprint-5"

create_story "$EPIC3" \
  "Smart PDF routing for text vs image PDFs" \
  "If uploaded PDF has a text layer (>=100 chars extracted via PyMuPDF server-side), send extracted text to text-only LLM model (cheaper). If scanned/image-only, convert to PNG at 200 DPI and send to vision model.

Acceptance Criteria:
- Server-side PyMuPDF extraction attempt on uploaded PDFs
- If >=100 chars extracted: route to text-only LLM
- If <100 chars (scanned): convert to PNG at 200 DPI, route to vision LLM
- Routing decision logged for debugging

SRS References: OCR-04" \
  5 "Sprint-5"

create_story "$EPIC3" \
  "Azure Document Intelligence fallback" \
  "Layer 3 specialist fallback: Azure Document Intelligence for handwritten annotations, faded ink, stamps, or complex layouts.

Acceptance Criteria:
- Azure Document Intelligence integration (EU region / Frankfurt)
- Triggered when LLM vision OCR fails or for handwritten content
- Results feed into same extraction pipeline

SRS References: OCR-05" \
  5 "Sprint-8"

# ============================================================
# EPIC 4: AI Classification & Extraction
# ============================================================
echo ""
echo "--- Epic 4: AI Classification & Extraction ---"
EPIC4=$(create_epic \
  "AI Classification & Extraction" \
  "AI Classification & Extraction" \
  "SRS Section 4: Letter classification into government categories, structured data extraction with strict JSON schema, German date pattern recognition, multi-backend LLM chain. Covers AI-01 through AI-12.")
echo "Epic: $EPIC4"

create_story "$EPIC4" \
  "Letter classification into government categories" \
  "LLM classifies each letter into one of the recognized categories: Finanzamt, Bussgeldstelle, Jobcenter/Agentur fuer Arbeit, Auslaenderbehoerde, Krankenkasse, Rentenversicherung, Bauamt, Kfz-Zulassung, Kita/Schule, Gericht, or Sonstige (other). Classification includes a confidence score. Letters below a configurable threshold are flagged for user review.

Acceptance Criteria:
- LLM prompt produces category from the defined list
- Confidence score returned alongside classification
- Below-threshold results flagged for user review
- Threshold is configurable (not hardcoded)

SRS References: AI-01, AI-02" \
  5 "Sprint-3"

create_story "$EPIC4" \
  "Structured data extraction with strict JSON schema" \
  "LLM extracts structured data conforming to a strict JSON schema with additionalProperties: false. Fields not found in the document return null (not guessed values).

Extracted fields: letter_type, sender (authority + department), letter_date, deadlines[] (type + date + days_remaining), reference_number, amount (value + currency), urgency, suggested_actions[], summary.

Currency amounts in European notation (comma decimal) are auto-converted to standard notation for storage.

Acceptance Criteria:
- JSON schema defined with additionalProperties: false
- All specified fields extracted
- Missing fields return null
- European currency notation auto-converted (e.g. 1.240,50 -> 1240.50)

SRS References: AI-03, AI-04, AI-06" \
  8 "Sprint-3"

create_story "$EPIC4" \
  "German date pattern recognition" \
  "LLM and rule engine recognize German date patterns in government letters: 'innerhalb von X Tagen', 'bis spaetestens [Datum]', 'Frist beginnt mit Zustellung', and similar bureaucratic phrasing.

Acceptance Criteria:
- Common German deadline phrases recognized and parsed
- Relative deadlines (innerhalb von X Tagen) computed from letter date
- Absolute deadlines (bis spaetestens) parsed directly
- Delivery-based deadlines (Frist beginnt mit Zustellung) handled

SRS References: AI-05" \
  5 "Sprint-3"

create_story "$EPIC4" \
  "Claude Sonnet integration (primary LLM)" \
  "Integrate Claude Sonnet 4.6 via Anthropic API as the primary LLM backend. Supports native PDF via base64 document content type. Used for classification, extraction, and response generation in a single API call.

Acceptance Criteria:
- Anthropic API client configured
- Native PDF support via document content type (base64)
- Single API call performs classification + extraction
- Strict JSON schema enforcement via output_config
- Error handling for API failures

SRS References: AI-07" \
  5 "Sprint-3"

create_story "$EPIC4" \
  "Gemini Flash integration (secondary LLM)" \
  "Integrate Gemini 2.5 Flash via Vertex AI EU as the secondary/cost-sensitive LLM backend. Used for high-volume and batch operations.

Acceptance Criteria:
- Vertex AI EU client configured
- Vision capability for document images
- JSON schema enforcement
- EU data processing

SRS References: AI-08" \
  5 "Sprint-5"

create_story "$EPIC4" \
  "GPT-4o fallback integration (tertiary LLM)" \
  "Integrate GPT-4o via OpenAI API as the tertiary fallback LLM. Activated when Claude and Gemini are unavailable. Requires PDF-to-PNG preprocessing (no native PDF support).

Acceptance Criteria:
- OpenAI API client configured
- PDF-to-PNG conversion pipeline for GPT-4o
- Same extraction schema as primary/secondary
- Activated only on primary+secondary failure

SRS References: AI-09" \
  3 "Sprint-5"

create_story "$EPIC4" \
  "Configurable LLM backend chain with failover" \
  "Backend chain is configurable: failover order and model selection can be changed without code deployment. Chain: Claude Sonnet -> Gemini Flash -> GPT-4o.

Acceptance Criteria:
- Backend chain order defined in configuration (not hardcoded)
- Automatic failover to next backend on failure/timeout
- Model selection changeable via config update (no redeploy)
- Failover events logged

SRS References: AI-12" \
  5 "Sprint-5"

create_story "$EPIC4" \
  "Ollama self-hosted LLM integration" \
  "Integrate Qwen2.5-VL + Qwen2.5 via Ollama for local development and enterprise on-premise deployments (v2).

Acceptance Criteria:
- Ollama client configured
- Qwen2.5-VL for vision (scanned documents)
- Qwen2.5 for text-only (digital PDFs)
- Same extraction schema as cloud backends
- Works fully offline

SRS References: AI-10" \
  5 "Sprint-8"

create_story "$EPIC4" \
  "Cloudflare Workers AI for lightweight tasks" \
  "Integrate Cloudflare Workers AI for lightweight tasks: classification, embeddings, summaries. No external API latency (runs on same edge network as Workers backend).

Acceptance Criteria:
- Workers AI models accessible from Hono.js backend
- Used for supplementary tasks (not primary extraction)
- No external API calls needed

SRS References: AI-11" \
  3 "Sprint-6"

# ============================================================
# EPIC 5: Deadline Detection & Risk Assessment
# ============================================================
echo ""
echo "--- Epic 5: Deadline Detection & Risk Assessment ---"
EPIC5=$(create_epic \
  "Deadline Detection & Risk" \
  "Deadline Detection & Risk Assessment" \
  "SRS Section 5: Deadline model, dynamic days remaining, risk levels, countdown badges, urgency sorting, manual override. Covers DL-01 through DL-07.")
echo "Epic: $EPIC5"

create_story "$EPIC5" \
  "Deadline data model with multiple deadlines per letter" \
  "Each letter can have one or more deadlines. Each deadline has a type (e.g. Widerspruchsfrist, Abgabefrist), a date, and days remaining. Days remaining is computed dynamically from the current date, not stored statically.

Acceptance Criteria:
- Database schema supports multiple deadlines per letter
- Each deadline: type (string), date (ISO date), days_remaining (computed)
- days_remaining recalculated on every access (not stored)

SRS References: DL-01, DL-02" \
  3 "Sprint-3"

create_story "$EPIC5" \
  "Risk level assignment and visual styling" \
  "Risk level assigned per letter: hoch (high), mittel (medium), niedrig (low). Risk level determines visual styling throughout the app: hoch = red (#C41E3A), mittel = orange (#CC7A00), niedrig = green (#2D7D46).

Acceptance Criteria:
- Risk level stored per letter (hoch/mittel/niedrig)
- Risk color map implemented as shared constant
- Badge component renders risk with correct color and label

SRS References: DL-03, DL-04" \
  3 "Sprint-3"

create_story "$EPIC5" \
  "Countdown badge with urgency styling" \
  "Countdown badge shows 'X Tag(e) verbleibend' with urgent styling (red text) when 7 or fewer days remain.

Acceptance Criteria:
- Badge displays dynamic days count
- Red styling when days <= 7
- Singular/plural handled (1 Tag / X Tage)

SRS References: DL-05" \
  2 "Sprint-3"

create_story "$EPIC5" \
  "Letters sorted by urgency on home screen" \
  "Letters are sorted by urgency (nearest deadline first) on the home screen.

Acceptance Criteria:
- Home screen letter list sorted by deadline date ascending
- Letters with nearest deadlines appear first

SRS References: DL-06" \
  2 "Sprint-3"

create_story "$EPIC5" \
  "Manual deadline edit and override" \
  "User can manually edit or override a detected deadline date and type.

Acceptance Criteria:
- Edit button on deadline display in detail view
- Date picker for changing deadline date
- Text input for changing deadline type
- Changes saved and reflected everywhere (calendar, reminders, countdown)

SRS References: DL-07" \
  3 "Sprint-4"

# ============================================================
# EPIC 6: Letter Management
# ============================================================
echo ""
echo "--- Epic 6: Letter Management ---"
EPIC6=$(create_epic \
  "Letter Management" \
  "Letter Management (Briefe)" \
  "SRS Section 6: Home screen letter list, letter detail view with tabs, letter deletion, free-tier limits. Covers LTR-01 through LTR-08.")
echo "Epic: $EPIC6"

create_story "$EPIC6" \
  "Home screen letter list with scan button" \
  "Home screen displays all tracked letters as a scrollable list. Each letter card shows: sender, subject, deadline date, days remaining, and risk badge. 'Brief scannen' button initiates the scanning flow. Tapping a letter card navigates to the detail view.

Acceptance Criteria:
- Scrollable list of all tracked letters
- Each card: sender, subject (truncated), deadline, countdown badge, risk badge
- Scan button at top or prominent position
- Tap card -> navigate to detail view

SRS References: LTR-01, LTR-02, LTR-03" \
  5 "Sprint-3"

create_story "$EPIC6" \
  "Letter detail view with tabbed interface" \
  "Detail view organized into tabs: Uebersicht (Overview), To-do, Antwort (Response), Nachweis (Evidence). Uebersicht tab displays: risk badge, countdown badge, Aktenzeichen (reference number), Betreff (subject), Zusammenfassung (AI-generated summary), consequences of missing the deadline (Was passiert bei Fristversaeumnis?), receipt date (Eingang), deadline date (Frist). User can navigate back to the previous screen.

Acceptance Criteria:
- 4 tabs: Uebersicht, To-do, Antwort, Nachweis
- Uebersicht shows all specified fields
- Back button returns to originating screen (home, calendar, or Nachweise)

SRS References: LTR-05, LTR-06, LTR-07" \
  5 "Sprint-3"

create_story "$EPIC6" \
  "Letter deletion" \
  "User can delete a tracked letter. Deletion removes all associated data: reminders, proofs, response drafts.

Acceptance Criteria:
- Delete action available in detail view
- Confirmation dialog before deletion
- All associated data removed (reminders, proofs, drafts)
- User returned to list after deletion

SRS References: LTR-08" \
  3 "Sprint-4"

create_story "$EPIC6" \
  "Free-tier scan and deadline limits enforcement" \
  "Free-tier users can track up to 3 active deadlines and perform 5 scans per month. Limits enforced with clear messaging when limits are reached.

Acceptance Criteria:
- Scan count tracked per calendar month
- Active deadline count tracked
- At limit: scan button disabled, clear message shown (e.g. 'X/5 Scans diesen Monat')
- Upgrade prompt displayed when limit reached

SRS References: LTR-04" \
  3 "Sprint-6"

# ============================================================
# EPIC 7: Action Plan & To-Do System
# ============================================================
echo ""
echo "--- Epic 7: Action Plan & To-Do System ---"
EPIC7=$(create_epic \
  "Action Plan & To-Do" \
  "Action Plan & To-Do System" \
  "SRS Section 7: AI-generated action plans, checkbox to-do items, progress tracking, state persistence. Covers TODO-01 through TODO-06.")
echo "Epic: $EPIC7"

create_story "$EPIC7" \
  "AI-generated action plan with checkboxes" \
  "Each letter has an AI-generated action plan consisting of 3-5 ordered steps. Each step has a checkbox that the user can toggle on/off. Completed steps show strikethrough text and a filled checkbox.

Acceptance Criteria:
- To-do tab displays ordered steps (Schritt 1, 2, 3...)
- Each step has toggleable checkbox
- Checked items: filled checkbox, strikethrough text
- Unchecked items: empty checkbox, normal text

SRS References: TODO-01, TODO-02, TODO-04" \
  3 "Sprint-4"

create_story "$EPIC7" \
  "Progress bar with completion tracking" \
  "A progress bar shows completion percentage (number of checked steps / total steps). Progress bar turns green (#2D7D46) at 100% completion.

Acceptance Criteria:
- Progress bar at top of to-do tab
- Percentage label (e.g. '75%')
- Bar color: #1A1A1A normally, #2D7D46 at 100%
- Updates in real-time as checkboxes toggle

SRS References: TODO-03, TODO-05" \
  2 "Sprint-4"

create_story "$EPIC7" \
  "To-do state persistence across sessions" \
  "To-do checkbox state persists across app sessions. Reopening a letter shows previously checked/unchecked items.

Acceptance Criteria:
- Checkbox state saved to persistent storage (local DB or backend)
- On letter reopen: previous state restored
- Works across app restarts

SRS References: TODO-06" \
  3 "Sprint-4"

# ============================================================
# EPIC 8: Response Pack & PDF Export
# ============================================================
echo ""
echo "--- Epic 8: Response Pack & PDF Export ---"
EPIC8=$(create_epic \
  "Response Pack & PDF Export" \
  "Response Pack & PDF Export" \
  "SRS Section 8: AI-generated response templates, delivery methods, editable templates, DIN 5008 PDF generation via Typst, premium gating. Covers RSP-01 through RSP-09.")
echo "Epic: $EPIC8"

create_story "$EPIC8" \
  "Response template display in Antwort tab" \
  "Each letter has an AI-generated response template pre-filled with sender address, authority address, date placeholder, reference number, subject line, and formal German salutation. Response template is viewable in the Antwort tab. User can toggle template visibility. Template text displayed in monospace font.

Acceptance Criteria:
- Antwort tab shows toggle button to show/hide template
- Template contains: sender address, authority address, date placeholder, reference number, subject, salutation, body, closing
- Monospace font for template text

SRS References: RSP-01, RSP-02, RSP-03" \
  3 "Sprint-4"

create_story "$EPIC8" \
  "Delivery methods display (Versandoptionen)" \
  "Available delivery methods (Versandoptionen) shown per letter. Examples: Einschreiben mit Rueckschein, ELSTER (elektronisch), Fax mit Sendebericht, Persoenliche Abgabe mit Empfangsbestaetigung.

Acceptance Criteria:
- List of delivery options displayed in Antwort tab
- Options come from AI extraction per letter
- Each option clearly labeled

SRS References: RSP-04" \
  2 "Sprint-4"

create_story "$EPIC8" \
  "Editable response template" \
  "User can edit the response template text before exporting as PDF.

Acceptance Criteria:
- Edit mode for template text
- Changes preserved per letter
- Edited template used for PDF export

SRS References: RSP-08" \
  3 "Sprint-4"

create_story "$EPIC8" \
  "DIN 5008 PDF generation with Typst" \
  "PDF generation using Typst server-side (called from Cloudflare Workers). PDF conforms to DIN 5008 German business letter format: A4 paper, left margin 25mm, right margin 20mm, top margin 27mm, address window positioning, fold marks at 105mm and 210mm.

Acceptance Criteria:
- Typst template for DIN 5008 letter format
- Server-side rendering (Hetzner VPS sidecar or Workers container)
- API endpoint accepts letter data, returns PDF
- Correct margins, address window, fold marks per DIN 5008

SRS References: RSP-05, RSP-06, RSP-07
Technical constraint: Typst cannot run in Workers due to filesystem constraints. Runs on a sidecar service (CON-03)." \
  8 "Sprint-6"

create_story "$EPIC8" \
  "PDF export premium gating" \
  "PDF export is a premium feature. Free-tier users can view the template but not export. Export button shows upgrade prompt for free users.

Acceptance Criteria:
- Free users: export button visible but triggers upgrade prompt
- Premium users: export button generates and downloads PDF
- Clear messaging about premium requirement

SRS References: RSP-09" \
  2 "Sprint-6"

# ============================================================
# EPIC 9: Reminders & Notifications
# ============================================================
echo ""
echo "--- Epic 9: Reminders & Notifications ---"
EPIC9=$(create_epic \
  "Reminders & Notifications" \
  "Reminders & Notifications" \
  "SRS Section 9: Configurable T-7/T-3/T-1 reminders, push notifications, calendar integration, .ics export. Covers REM-01 through REM-14.")
echo "Epic: $EPIC9"

create_story "$EPIC9" \
  "Configurable T-7/T-3/T-1 reminder toggles" \
  "Each letter automatically receives 3 reminders: T-7 (7 days before deadline), T-3 (3 days before deadline), T-1 (1 day before deadline). Reminder dates computed dynamically from the letter's deadline date. User can toggle each reminder on/off independently per letter. All reminders default to ON. Reminder state is independent per letter and persists across sessions.

Reminder toggle UI in the detail screen shows: label (7 Tage vorher / 3 Tage vorher / 1 Tag vorher), computed date (DD.MM.YYYY), and a toggle switch.

Acceptance Criteria:
- 3 reminder rows per letter in detail view
- Each row: label, computed date, toggle switch
- All default ON for new letters
- Toggle state independent per letter
- State persists across app sessions

SRS References: REM-01, REM-02, REM-03, REM-04, REM-05, REM-06, REM-07" \
  5 "Sprint-4"

create_story "$EPIC9" \
  "Push notifications for deadline reminders" \
  "Active reminders trigger push notifications on the configured dates via Expo Push Notifications. Content includes: letter sender, deadline date, and days remaining (e.g. 'Finanzamt Berlin-Mitte -- Frist in 3 Tagen (19.03.2026)'). Urgent alert on T-1: 'Frist morgen!' notification.

Acceptance Criteria:
- Expo Push Notifications configured
- Backend Cron Trigger sends notifications on reminder dates
- Notification body: sender name, deadline date, days remaining
- T-1 notification uses urgent 'Frist morgen!' format
- Only sent for reminders that are toggled ON

SRS References: REM-08, REM-09, REM-10" \
  5 "Sprint-5"

create_story "$EPIC9" \
  "Follow-up notification after missed deadline proof" \
  "Follow-up notification sent after deadline if no proof-of-delivery has been added: 'Beleg noch hinzufuegen?'

Acceptance Criteria:
- Backend checks after deadline date: does letter have proof?
- If no proof: send follow-up push notification
- Notification links to letter's Nachweis tab

SRS References: REM-11" \
  3 "Sprint-5"

create_story "$EPIC9" \
  "Global notification disable setting" \
  "User can disable all push notifications globally in account settings.

Acceptance Criteria:
- Toggle in account settings to disable all push notifications
- When disabled: no reminder or follow-up notifications sent
- Setting persists and syncs to backend

SRS References: REM-12" \
  2 "Sprint-5"

create_story "$EPIC9" \
  "Native calendar export via expo-calendar" \
  "User can export deadline + active reminders (T-7, T-3, T-1) to the native device calendar via expo-calendar.

Acceptance Criteria:
- Export button in detail view
- Creates calendar events: 1 deadline event + up to 3 reminder events
- Only exports reminders that are toggled ON
- Events include letter sender and reference in title
- Requests calendar permission on first use

SRS References: REM-13" \
  5 "Sprint-4"

create_story "$EPIC9" \
  ".ics file export for web users" \
  ".ics file export for web users and manual calendar import. File contains deadline event + active reminder events.

Acceptance Criteria:
- Download button generates .ics file
- File contains deadline + active reminder events
- Compatible with Google Calendar, Outlook, Apple Calendar
- Available for web version users

SRS References: REM-14" \
  3 "Sprint-4"

# ============================================================
# EPIC 10: Calendar System
# ============================================================
echo ""
echo "--- Epic 10: Calendar System ---"
EPIC10=$(create_epic \
  "Calendar System" \
  "Calendar System" \
  "SRS Section 10: Monthly calendar grid, deadline and reminder dot indicators, interactions, legend, upcoming deadlines list. Covers CAL-01 through CAL-11.")
echo "Epic: $EPIC10"

create_story "$EPIC10" \
  "Monthly calendar grid with navigation" \
  "Calendar tab shows a monthly grid view (Monday-Sunday columns). User can navigate between months (previous/next). Current day highlighted with a dark circular background.

Acceptance Criteria:
- Monthly grid with 7 columns (Mo-So)
- Previous/next month navigation buttons
- Month and year displayed as header
- Today highlighted with dark circle
- Correct day alignment (first day of month on correct weekday)

SRS References: CAL-01, CAL-02, CAL-03" \
  5 "Sprint-4"

create_story "$EPIC10" \
  "Deadline and reminder dot indicators" \
  "Deadline dates show a colored dot matching the letter's risk level (red/orange/green). Active reminder dates show a blue dot (#3B82F6), distinct from deadline dots. If a date has both a deadline and a reminder, both dots are shown side by side.

Acceptance Criteria:
- Deadline dates: risk-colored dot (hoch=red, mittel=orange, niedrig=green)
- Reminder dates: blue dot (#3B82F6)
- Dates with both: two dots side by side
- Only active (toggled ON) reminders shown

SRS References: CAL-04, CAL-05, CAL-06" \
  3 "Sprint-4"

create_story "$EPIC10" \
  "Calendar dot click interactions" \
  "Tapping a deadline dot navigates to that letter's detail view. Tapping a reminder dot navigates to the associated letter's detail view.

Acceptance Criteria:
- Tap on date with deadline dot -> open letter detail
- Tap on date with reminder dot -> open associated letter detail
- If multiple letters on same date: open first (by deadline proximity)

SRS References: CAL-07, CAL-08" \
  2 "Sprint-4"

create_story "$EPIC10" \
  "Calendar legend" \
  "Legend below the calendar grid explains dot colors: Hohes R. (red), Mittleres R. (orange), Geringes R. (green), Erinnerung (blue).

Acceptance Criteria:
- Legend row below calendar grid
- 4 items: 3 risk levels + reminder, each with matching colored dot and label

SRS References: CAL-09" \
  1 "Sprint-4"

create_story "$EPIC10" \
  "Upcoming deadlines list below calendar" \
  "'Anstehende Fristen' section below the calendar lists all upcoming deadlines sorted by date. Each item shows: sender, subject, deadline date, countdown badge, risk badge, and T-label if applicable. Tapping an item navigates to that letter's detail view.

Acceptance Criteria:
- List sorted by deadline date ascending
- Each item: sender, subject (truncated), Frist date, countdown, risk badge
- T-label (T-1, T-3, T-7) shown when applicable
- Tap item -> navigate to letter detail

SRS References: CAL-10, CAL-11" \
  3 "Sprint-4"

# ============================================================
# EPIC 11: Proof-of-Delivery (Nachweise)
# ============================================================
echo ""
echo "--- Epic 11: Proof-of-Delivery ---"
EPIC11=$(create_epic \
  "Proof-of-Delivery" \
  "Proof-of-Delivery (Nachweise)" \
  "SRS Section 11: Submission status tracking, Nachweise screen, proof photo capture, evidence storage in R2. Covers PRF-01 through PRF-13.")
echo "Epic: $EPIC11"

create_story "$EPIC11" \
  "Submission status tracking per letter" \
  "Each letter has a proof-of-delivery status: Offen (open), Versendet (sent), Nachgewiesen (proven). Status progression: Offen -> Versendet -> Nachgewiesen. 'Als versendet markieren' button transitions from Offen to Versendet and records the date. 'Beleg hinzufuegen' button allows adding proof and transitions to Nachgewiesen. Status is color-coded: Offen = red (#C41E3A), Versendet = orange (#CC7A00), Nachgewiesen = green (#2D7D46).

Acceptance Criteria:
- Three status states with correct progression
- Mark as sent button records date
- Add proof button transitions to proven
- Color-coded status badges

SRS References: PRF-01, PRF-02, PRF-03, PRF-04, PRF-05" \
  5 "Sprint-5"

create_story "$EPIC11" \
  "Nachweise screen with summary and letter cards" \
  "Dedicated Nachweise tab shows all letters with their delivery status. Summary bar at top shows total counts per status (X offen, Y versendet, Z nachgewiesen). Each letter card shows: sender, subject, current status badge, proof items (type + date), and available action buttons. Proof items stored per letter with type (e.g. Einschreiben), date, and confirmation flag.

Acceptance Criteria:
- Nachweise tab accessible from bottom navigation
- Summary counts at top
- Letter cards with status badge, proof items, action buttons
- Proof items show type and date

SRS References: PRF-06, PRF-07, PRF-08, PRF-09" \
  5 "Sprint-5"

create_story "$EPIC11" \
  "Proof photo capture via in-app camera" \
  "User can photograph a proof-of-delivery receipt via the in-app camera ('Beleg fotografieren').

Acceptance Criteria:
- Camera opens for proof photo capture
- Captured image associated with the letter
- Photo stored as proof record

SRS References: PRF-10" \
  3 "Sprint-5"

create_story "$EPIC11" \
  "Evidence storage in Cloudflare R2" \
  "Proof images stored in Cloudflare R2 (EU bucket), encrypted at rest. Each proof record stores: type of proof, timestamp, associated letter ID, and image reference.

Acceptance Criteria:
- R2 bucket configured in EU region
- Images uploaded via backend API
- Encrypted at rest (R2 server-side encryption)
- Proof record: type, timestamp, letter_id, image_ref

SRS References: PRF-11, PRF-12" \
  5 "Sprint-5"

create_story "$EPIC11" \
  "Proof viewing in letter detail Nachweis tab" \
  "User can view all proofs associated with a letter in the Nachweis tab of the detail view.

Acceptance Criteria:
- Nachweis tab lists all proof records for the letter
- Each proof shows: type, date, thumbnail (if image)
- Tap to view full-size proof image

SRS References: PRF-13" \
  2 "Sprint-5"

# ============================================================
# EPIC 12: Subscription & Payments
# ============================================================
echo ""
echo "--- Epic 12: Subscription & Payments ---"
EPIC12=$(create_epic \
  "Subscription & Payments" \
  "Subscription & Payments" \
  "SRS Section 12: Free/premium tier definitions, RevenueCat mobile payments, Stripe web payments, cross-platform entitlements, subscription management, Widerrufsrecht, invoices. Covers PAY-01 through PAY-11.")
echo "Epic: $EPIC12"

create_story "$EPIC12" \
  "Free and premium tier definitions with limit enforcement" \
  "Free tier: 5 scans per month, 3 active deadlines, manual .ics calendar export, view-only response templates. No PDF export, no cloud OCR. Premium tier (4.99 EUR/month or 39.99 EUR/year): Unlimited scans, unlimited active deadlines, auto-sync calendar, editable response templates, PDF export (DIN 5008), cloud OCR for handwriting. Free-tier limits enforced with clear messaging when limits are reached.

Acceptance Criteria:
- Tier definitions stored in config
- Limit checks on scan and deadline creation
- Clear UI messaging at limit (scan count, deadline count)
- Upgrade prompt when limit hit

SRS References: PAY-01, PAY-02, PAY-03" \
  5 "Sprint-6"

create_story "$EPIC12" \
  "RevenueCat mobile payments integration" \
  "Mobile payments via RevenueCat (Apple App Store IAP + Google Play IAP).

Acceptance Criteria:
- RevenueCat SDK integrated
- Products configured: monthly (4.99 EUR) and yearly (39.99 EUR)
- Purchase flow on iOS and Android
- Entitlement granted on successful purchase
- Receipt validation via RevenueCat

SRS References: PAY-04" \
  8 "Sprint-6"

create_story "$EPIC12" \
  "Stripe web payments via RevenueCat Web Billing" \
  "Web payments via Stripe through RevenueCat Web Billing. SEPA Direct Debit support for German users (via Stripe).

Acceptance Criteria:
- RevenueCat Web Billing configured with Stripe
- SEPA Direct Debit as payment method
- Web purchase flow functional
- Entitlement synced with mobile

SRS References: PAY-05, PAY-06" \
  5 "Sprint-6"

create_story "$EPIC12" \
  "Cross-platform subscription entitlements" \
  "Shared entitlements across platforms: a subscription purchased on iOS is recognized on Android and web.

Acceptance Criteria:
- RevenueCat user identity linked across platforms
- Subscription purchased on one platform unlocks features on all
- Status synced in real-time

SRS References: PAY-07" \
  5 "Sprint-6"

create_story "$EPIC12" \
  "Subscription management UI" \
  "User can view current subscription status and renewal date in account settings. User can cancel subscription. Access continues until end of billing period.

Acceptance Criteria:
- Account settings shows: current plan, renewal date, payment method
- Cancel button with confirmation
- After cancel: access until billing period end, then downgrade to free

SRS References: PAY-08, PAY-09" \
  3 "Sprint-6"

create_story "$EPIC12" \
  "German Widerrufsrecht (14-day cancellation right) compliance" \
  "German 14-day Widerrufsrecht (cancellation right) compliance.

Acceptance Criteria:
- Cancellation/refund within 14 days of purchase honored
- Widerrufsbelehrung (cancellation policy) displayed during purchase
- Process documented and implemented

SRS References: PAY-10" \
  3 "Sprint-7"

create_story "$EPIC12" \
  "Umsatzsteuer-compliant invoices" \
  "Invoices comply with German Umsatzsteuer (VAT) requirements.

Acceptance Criteria:
- Invoices generated with required German tax information
- Correct VAT rate applied
- Invoice accessible to user in account settings

SRS References: PAY-11" \
  3 "Sprint-7"

# ============================================================
# EPIC 13: Privacy, Security & GDPR
# ============================================================
echo ""
echo "--- Epic 13: Privacy, Security & GDPR ---"
EPIC13=$(create_epic \
  "Privacy, Security & GDPR" \
  "Privacy, Security & GDPR Compliance" \
  "SRS Section 13: Privacy by design, EU-only infrastructure, encryption, GDPR compliance (DPA, DPIA, Art. 30, Art. 17, Art. 20, breach notification, cookies). Covers SEC-01 through SEC-16.")
echo "Epic: $EPIC13"

create_story "$EPIC13" \
  "On-device OCR default with cloud opt-in transparency" \
  "On-device OCR is the default. Documents never leave the device unless the user explicitly opts into cloud processing. User can see which processing mode is active (on-device vs. cloud) at all times.

Acceptance Criteria:
- On-device processing used by default (no cloud calls)
- Explicit opt-in required for cloud processing
- UI indicator shows current processing mode
- Clear explanation of what data leaves the device

SRS References: SEC-01, SEC-07" \
  3 "Sprint-2"

create_story "$EPIC13" \
  "EU-only cloud infrastructure setup" \
  "All cloud services run in EU region (Cloudflare EU / Frankfurt). Cloudflare Workers, D1, and R2 configured for EU data locality.

Acceptance Criteria:
- Workers deployed to EU region
- D1 database in EU
- R2 bucket in EU
- No data routed outside EU

SRS References: SEC-02" \
  2 "Sprint-1"

create_story "$EPIC13" \
  "Data minimization and encryption" \
  "Data minimization: only extracted text and structured data stored server-side, not original document images (unless user opts in to proof storage). Encryption at rest: Cloudflare R2 server-side encryption. Encryption in transit: TLS 1.3 for all API communication.

Acceptance Criteria:
- Original images not stored unless user opts in (proof storage)
- R2 encryption at rest enabled
- All API endpoints use HTTPS/TLS 1.3
- No unencrypted data at rest or in transit

SRS References: SEC-03, SEC-04, SEC-05" \
  3 "Sprint-1"

create_story "$EPIC13" \
  "Auto-deletion with configurable retention period" \
  "Configurable retention period (default 90 days post-deadline). User is notified before deletion.

Acceptance Criteria:
- Default retention: 90 days after deadline passes
- Retention period configurable per user in settings
- Notification sent before auto-deletion (e.g. 7 days warning)
- Backend Cron Trigger performs scheduled cleanup

SRS References: SEC-06" \
  5 "Sprint-7"

create_story "$EPIC13" \
  "Privacy Policy and Terms & Conditions screens" \
  "Privacy Policy accessible at all times (German + English), including from pre-login screens. Terms & Conditions accessible at all times.

Acceptance Criteria:
- Privacy Policy screen in German and English
- Terms & Conditions screen
- Both accessible from login screen (before auth)
- Both accessible from account settings (after auth)
- Static content, easily updatable

SRS References: SEC-08, SEC-09" \
  3 "Sprint-7"

create_story "$EPIC13" \
  "Data Processing Agreements with sub-processors" \
  "Data Processing Agreement (DPA) established with all sub-processors: Anthropic, Google, OpenAI, Cloudflare, Stripe.

Acceptance Criteria:
- DPA signed/established with each sub-processor
- Sub-processor list documented and accessible to users
- DPA terms comply with GDPR Art. 28

SRS References: SEC-10" \
  3 "Sprint-7,to-be-refined"

create_story "$EPIC13" \
  "Data Protection Impact Assessment (DPIA)" \
  "DPIA completed. Required due to processing sensitive government correspondence.

Acceptance Criteria:
- DPIA document completed covering all data processing activities
- Risk assessment for government letter processing
- Mitigation measures documented
- Filed with data protection officer

SRS References: SEC-11" \
  5 "Sprint-7,to-be-refined"

create_story "$EPIC13" \
  "Art. 30 Records of Processing Activities" \
  "Art. 30 Records of Processing Activities maintained.

Acceptance Criteria:
- Processing activities register created
- Covers all data categories, purposes, retention periods, recipients
- Maintained and updated as processing changes

SRS References: SEC-12" \
  3 "Sprint-7,to-be-refined"

create_story "$EPIC13" \
  "Right to erasure API and UI (Art. 17)" \
  "Dedicated API endpoint and UI flow to permanently delete all user data (right to erasure).

Acceptance Criteria:
- API endpoint: DELETE /user/data (or equivalent)
- Deletes all: profile, letters, deadlines, reminders, proofs, drafts
- UI flow in account settings with confirmation
- Erasure is complete and irreversible
- Confirmation sent to user

SRS References: SEC-13" \
  5 "Sprint-7"

create_story "$EPIC13" \
  "Data portability export (Art. 20)" \
  "User can export all personal data as a downloadable file.

Acceptance Criteria:
- Export endpoint generates structured data file
- Contains all user data in portable format
- Accessible from account settings

SRS References: SEC-14" \
  3 "Sprint-7"

create_story "$EPIC13" \
  "72-hour breach notification procedure" \
  "72-hour breach notification procedure documented and tested.

Acceptance Criteria:
- Breach notification procedure documented
- Covers: detection, assessment, notification to authority within 72h, user notification
- Tested with simulated breach scenario

SRS References: SEC-15" \
  3 "Sprint-7,to-be-refined"

create_story "$EPIC13" \
  "Cookie consent management for web version" \
  "Cookie usage with consent management for the web version.

Acceptance Criteria:
- Cookie consent banner on web version
- User can accept/reject non-essential cookies
- Consent preference stored and respected
- Only essential cookies used before consent

SRS References: SEC-16" \
  2 "Sprint-7"

# ============================================================
# EPIC 14: Navigation & Standard Screens
# ============================================================
echo ""
echo "--- Epic 14: Navigation & Standard Screens ---"
EPIC14=$(create_epic \
  "Navigation & Standard Screens" \
  "Application Navigation & Standard Screens" \
  "SRS Section 14: Bottom navigation bar, splash screen, login screen, account settings, support screen, legal screens. Covers NAV-01 through NAV-11.")
echo "Epic: $EPIC14"

create_story "$EPIC14" \
  "Bottom navigation bar with 3 tabs" \
  "Bottom navigation bar with 3 tabs: Briefe (letters), Kalender (calendar), Nachweise (proofs). Active tab visually distinguished (bold text, dark color). Inactive tabs show gray text. Tab icons: Briefe = mail icon, Kalender = calendar icon, Nachweise = folder icon. Detail views have a back button in header returning to the originating tab. 'Im Kalender anzeigen' button in detail view navigates to the Calendar tab.

Acceptance Criteria:
- 3-tab bottom bar: Briefe, Kalender, Nachweise
- Active tab: bold, dark; inactive: gray
- Icons per tab
- Back button context-aware (returns to originating tab)
- Calendar navigation from detail view

SRS References: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05" \
  3 "Sprint-1"

create_story "$EPIC14" \
  "Splash/loading screen" \
  "Splash/loading screen with FristRadar branding displayed on app launch.

Acceptance Criteria:
- Displays on app startup
- FristRadar logo and name
- Transitions to login or home screen based on auth state

SRS References: NAV-06" \
  2 "Sprint-1"

create_story "$EPIC14" \
  "Login/registration screen" \
  "Login/registration screen as the entry point for unauthenticated users. Provides email/phone OTP login, social login buttons, and registration flow.

Acceptance Criteria:
- Displayed when user is not authenticated
- Email/phone input with OTP flow
- Google and Apple social login buttons
- Link to registration
- Link to Privacy Policy and Terms

SRS References: NAV-07" \
  3 "Sprint-1"

create_story "$EPIC14" \
  "Account settings screen" \
  "Account settings screen with: profile management (email, phone), notification preferences, subscription status, privacy controls (data export, account deletion), and logout button.

Acceptance Criteria:
- Accessible from home screen
- Sections: Profile, Notifications, Subscription, Privacy, Logout
- Each section links to relevant functionality

SRS References: NAV-08" \
  5 "Sprint-7"

create_story "$EPIC14" \
  "Support/contact screen" \
  "Support/contact screen with email contact and FAQ link.

Acceptance Criteria:
- Email contact (mailto link or form)
- FAQ link
- Accessible from account settings

SRS References: NAV-09" \
  2 "Sprint-8"

echo ""
echo "========================================="
echo "DONE - All epics and stories created"
echo "========================================="
