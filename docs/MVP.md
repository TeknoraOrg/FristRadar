# FristRadar — MVP Specification

## Vision

**FristRadar** ist eine Deutschland-spezifische, fristen-orientierte Workflow-App für Behördenbriefe.

Ein Foto vom Behördenbrief liefert sofort:

1. **Frist(en)** + "was passiert, wenn ich's verpasse" (Risiko-Stufe)
2. **To-do-Plan** (z.B. "Widerspruch einlegen", "Unterlagen nachreichen", "Termin buchen")
3. **Antwort-Pack**: fertiger Text (Deutsch, optional in einfacher Sprache) + PDF-Export im DIN-Layout + Checkliste der Beilagen
4. **Nachweis-Modus**: erinnert an "versende nachweisbar" + speichert Belege (Einlieferungsbeleg, Screenshot, Empfangsbestätigung etc.)
5. **Kalender + Erinnerungen** (T-7, T-3, T-1) mit "Ich hab's abgeschickt" Button

---

## Warum Deutschland? (High Impact)

- **Fristenkultur**: Viele Prozesse drehen sich um formale Deadlines
- **Kein System-Tracker**: Bürger*innen haben oft keinen Tracker für Briefpost
- **Digitale Briefkästen** (z.B. Deutsche Post POSTSCAN) lösen Digitalisierung, nicht Fristen → Handlung → Antwort

---

## 3 harte Differenzierer

### 1) Behörden-Domänenwissen als Regelwerk

Erkenne typische Muster:
- "innerhalb von X Tagen nach Bekanntgabe/Zustellung"
- "bis spätestens Datum"
- "Frist beginnt mit …"

Mapping auf Kategorie + Standard-Workflows:
- Jobcenter, Ausländerbehörde, Finanzamt, Kita/Schule, Bußgeldstelle

### 2) Antwort-Pack statt Zusammenfassung

Die Konkurrenz fasst zusammen. FristRadar liefert **handlungsfertige Artefakte**:
- Briefvorlage (DIN 5008)
- Betreff + Aktenzeichen automatisch
- Anlagenliste
- Optional: "Fax/Einwurf-Einschreiben/De-Mail/E-Mail" Auswahl

### 3) Beweisführung / "Nachweis"-Ordner

- Beleg-Fotos, Versanddatum, Empfängeradresse, Tracking-ID — alles an einem Ort
- Idiotensicher: kein Nachweis vergessen

---

## MVP Scope (1–2 Wochen)

### Input
- Foto oder PDF vom Brief

### Output (Minimum)
- Erkannte Frist (Datum) + Confidence Score
- 1 Satz "Was wird verlangt?"
- 3-Schritte To-do
- Export: Kalender (.ics) + eine generische Antwortvorlage

### Technik (quick & clean)
- On-device OCR (oder serverseitig)
- LLM nur für Klassifikation + Extraktion (strict JSON schema)
- "Rule layer" für Fristlogik + Muster (deutsche Phrasen)

---

## Datenschutz / Compliance (wichtig in DE)

- **Standard**: Lokale Verarbeitung oder EU-Hosting
- **Automatische Redaktion** sensibler Daten (Name, Adresse) für Cloud-Analyse
- **Klare Löschfunktionen**
- Abhebung von "AI scan everything to cloud"-Apps

---

## Monetarisierung

| Tier | Preis | Features |
|------|-------|----------|
| Free | 0 € | 5 Briefe/Monat |
| Premium | 4–9 €/Monat | Unbegrenzt + Vorlagen + Familienmodus |
| B2B light | TBD | Vereine/Schulen/kleine Kanzleien: "Fristen-Inbox" |

---

## Behördenbrief-Kategorien (Top 10)

1. **Finanzamt** — Steuererklärung, Bescheide, Nachforderungen
2. **Bußgeldstelle** — OWi-Verfahren, Anhörungen
3. **Jobcenter / Arbeitsagentur** — Bewilligungen, Mitwirkungspflichten
4. **Ausländerbehörde** — Aufenthaltstitel, Verlängerungen
5. **Krankenkasse** — Beiträge, Leistungen
6. **Rentenversicherung** — Kontenklärung, Bescheide
7. **Bauamt** — Baugenehmigungen, Auflagen
8. **Kfz-Zulassung** — TÜV, An-/Abmeldung
9. **Kita/Schule** — Anmeldung, Beiträge
10. **Gericht** — Mahnbescheide, Ladungen

---

## Marktanalyse

| Wettbewerber | Was sie tun | Was fehlt |
|--------------|-------------|-----------|
| LetterMagic | AI-Briefscanner mit Deadline-Highlighting | Kein DE-Workflow, keine Antwortvorlagen |
| POSTSCAN (Deutsche Post) | Digitaler Briefkasten | Nur Scan, keine Frist-Erkennung oder Handlungsempfehlung |
| Allgemeine OCR-Apps | Texterkennung | Kein Behörden-Domänenwissen |

**FristRadar's Chance**: Die konsequente Kette Frist → To-do → Antwort-Pack → Nachweis als fokussiertes Produkt.
