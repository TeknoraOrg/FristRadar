import { useState, useEffect } from "react";

const APP_PASSWORD = "frist2026";
const AUTH_KEY = "fristradar_auth";

function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === APP_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "1");
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "#FAFAFA", fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    }}>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }`}</style>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>F</span>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A", margin: "0 0 4px", letterSpacing: "-0.5px" }}>FristRadar</h1>
      <p style={{ fontSize: 13, color: "#888", margin: "0 0 32px" }}>Enter password to continue</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 260, animation: shake ? "shake 0.4s ease" : "none" }}>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{
            width: "100%", padding: "14px 16px", fontSize: 15, border: `1.5px solid ${error ? "#C41E3A" : "#DDD"}`,
            borderRadius: 10, outline: "none", background: "#fff", boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
        />
        <button type="submit" style={{
          width: "100%", padding: 14, background: "#1A1A1A", color: "#fff", border: "none", borderRadius: 10,
          fontSize: 15, fontWeight: 600, cursor: "pointer",
        }}>Unlock</button>
        {error && <span style={{ fontSize: 13, color: "#C41E3A", fontWeight: 500 }}>Wrong password</span>}
      </form>
    </div>
  );
}

const DEMO_LETTERS = [
  {
    id: 1,
    absender: "Finanzamt Berlin-Mitte",
    aktenzeichen: "St.-Nr. 21/815/04711",
    betreff: "Aufforderung zur Abgabe der Einkommensteuererklärung 2024",
    datum: "05.02.2026",
    frist: "19.03.2026",
    frist_iso: "2026-03-19",
    tage_verbleibend: 15,
    risiko: "hoch",
    zusammenfassung: "Das Finanzamt fordert Sie auf, Ihre Einkommensteuererklärung für das Jahr 2024 einzureichen. Bei Nichtabgabe droht ein Verspätungszuschlag.",
    konsequenz: "Verspätungszuschlag ab 0,25 % der festgesetzten Steuer pro Monat, mindestens 25 € pro Monat. Zusätzlich kann ein Zwangsgeld festgesetzt werden.",
    todos: [
      { schritt: 1, text: "Steuerunterlagen zusammenstellen (Lohnsteuerbescheinigung, Spendenquittungen, Belege)", done: false },
      { schritt: 2, text: "Steuererklärung über ELSTER oder Steuer-Software erstellen", done: false },
      { schritt: 3, text: "Erklärung elektronisch übermitteln oder per Post senden", done: false },
      { schritt: 4, text: "Eingangsbestätigung / Sendeprotokoll sichern", done: false },
    ],
    antwort_vorlage: `Max Mustermann
Musterstraße 12
10115 Berlin

Finanzamt Berlin-Mitte
Steuerverwaltung
10001 Berlin

Datum: __.__._____

Steuernummer: 21/815/04711

Betreff: Einkommensteuererklärung 2024

Sehr geehrte Damen und Herren,

in der Anlage übersende ich Ihnen meine Einkommensteuererklärung für das Veranlagungsjahr 2024.

Ich bitte um Eingangsbestätigung.

Mit freundlichen Grüßen


Max Mustermann

Anlagen:
- Einkommensteuererklärung 2024
- Lohnsteuerbescheinigung
- [weitere Belege]`,
    versand_optionen: ["ELSTER (elektronisch)", "Einschreiben mit Rückschein", "Persönliche Abgabe mit Empfangsbestätigung"],
  },
  {
    id: 2,
    absender: "Bußgeldstelle Köln",
    aktenzeichen: "OWi 2026-KL-00482",
    betreff: "Anhörung im Ordnungswidrigkeitenverfahren – Geschwindigkeitsüberschreitung",
    datum: "12.02.2026",
    frist: "26.03.2026",
    frist_iso: "2026-03-26",
    tage_verbleibend: 22,
    risiko: "mittel",
    zusammenfassung: "Ihnen wird eine Geschwindigkeitsüberschreitung von 23 km/h innerorts vorgeworfen. Sie haben die Möglichkeit, sich innerhalb der Frist zu äußern.",
    konsequenz: "Ohne Stellungnahme ergeht der Bußgeldbescheid in der Regel ohne Berücksichtigung Ihrer Sicht. Bußgeld: voraussichtlich 115 € + 1 Punkt in Flensburg.",
    todos: [
      { schritt: 1, text: "Anhörungsbogen sorgfältig lesen, Tatvorwurf prüfen", done: false },
      { schritt: 2, text: "Entscheiden: Einspruch oder Zahlung", done: false },
      { schritt: 3, text: "Bei Einspruch: schriftliche Stellungnahme verfassen", done: false },
      { schritt: 4, text: "Fristgerecht absenden und Versandnachweis sichern", done: false },
    ],
    antwort_vorlage: `Max Mustermann
Musterstraße 12
50667 Köln

Bußgeldstelle der Stadt Köln
50679 Köln

Datum: __.__._____

Aktenzeichen: OWi 2026-KL-00482

Betreff: Stellungnahme zum Anhörungsbogen

Sehr geehrte Damen und Herren,

hiermit nehme ich zu dem oben genannten Verfahren wie folgt Stellung:

[Ihre Stellungnahme hier einfügen]

Ich bitte um Berücksichtigung meiner Angaben.

Mit freundlichen Grüßen


Max Mustermann`,
    versand_optionen: ["Einschreiben (Einwurf)", "Fax mit Sendebericht", "Persönliche Abgabe mit Empfangsbestätigung"],
  },
  {
    id: 3,
    absender: "Jobcenter München",
    aktenzeichen: "JC-M-2026-09831",
    betreff: "Aufforderung zur Mitwirkung – Weiterbewilligungsantrag",
    datum: "20.02.2026",
    frist: "10.04.2026",
    frist_iso: "2026-04-10",
    tage_verbleibend: 37,
    risiko: "niedrig",
    zusammenfassung: "Das Jobcenter fordert Sie auf, den Weiterbewilligungsantrag für Bürgergeld einzureichen, inkl. aktueller Einkommensnachweise.",
    konsequenz: "Bei Fristversäumnis droht eine Leistungskürzung oder vorläufige Einstellung der Zahlungen.",
    todos: [
      { schritt: 1, text: "Weiterbewilligungsantrag ausfüllen", done: false },
      { schritt: 2, text: "Einkommensnachweise der letzten 3 Monate beifügen", done: false },
      { schritt: 3, text: "Mietbescheinigung aktualisieren", done: false },
      { schritt: 4, text: "Antrag persönlich oder per Post einreichen", done: false },
    ],
    antwort_vorlage: `Max Mustermann\nMusterstraße 12\n80331 München\n\nJobcenter München\n80333 München\n\nDatum: __.__._____\n\nAktenzeichen: JC-M-2026-09831\n\nBetreff: Weiterbewilligungsantrag\n\nSehr geehrte Damen und Herren,\n\nanbei übersende ich Ihnen den ausgefüllten Weiterbewilligungsantrag nebst Anlagen.\n\nMit freundlichen Grüßen\n\nMax Mustermann`,
    versand_optionen: ["Persönliche Abgabe mit Empfangsbestätigung", "Einschreiben mit Rückschein"],
  },
];

// Letters revealed one-by-one each time the user scans
const BACKLOG_LETTERS = [
  {
    id: 101,
    absender: "Amtsgericht Hamburg",
    aktenzeichen: "AG HH 341 C 1029/26",
    betreff: "Mahnbescheid – Forderung aus Kaufvertrag",
    datum: "01.03.2026",
    frist: "15.03.2026",
    frist_iso: "2026-03-15",
    tage_verbleibend: 11,
    risiko: "hoch",
    zusammenfassung: "Ihnen wurde ein Mahnbescheid über 1.240 € zugestellt. Sie können innerhalb von zwei Wochen Widerspruch einlegen.",
    konsequenz: "Ohne Widerspruch wird der Mahnbescheid rechtskräftig. Der Gläubiger kann dann einen Vollstreckungsbescheid beantragen.",
    todos: [
      { schritt: 1, text: "Mahnbescheid prüfen: Forderung berechtigt?", done: false },
      { schritt: 2, text: "Bei Einwand: Widerspruch beim Amtsgericht einlegen", done: false },
      { schritt: 3, text: "Widerspruch fristgerecht absenden", done: false },
    ],
    antwort_vorlage: "Max Mustermann\nMusterstraße 12\n20095 Hamburg\n\nAmtsgericht Hamburg\n20355 Hamburg\n\nDatum: __.__._____\n\nAktenzeichen: 341 C 1029/26\n\nBetreff: Widerspruch gegen Mahnbescheid\n\nSehr geehrte Damen und Herren,\n\nhiermit lege ich gegen den Mahnbescheid vom 01.03.2026 fristgerecht Widerspruch ein.\n\nMit freundlichen Grüßen\n\nMax Mustermann",
    versand_optionen: ["Einschreiben mit Rückschein", "Fax mit Sendebericht"],
  },
  {
    id: 102,
    absender: "Rundfunkbeitrag (ARD ZDF)",
    aktenzeichen: "RB-2026-4839201",
    betreff: "Festsetzungsbescheid – Rückständige Rundfunkbeiträge",
    datum: "25.02.2026",
    frist: "25.03.2026",
    frist_iso: "2026-03-25",
    tage_verbleibend: 21,
    risiko: "mittel",
    zusammenfassung: "Der Beitragsservice fordert rückständige Rundfunkbeiträge in Höhe von 220,50 € zzgl. Säumniszuschlag.",
    konsequenz: "Bei Nichtzahlung wird der Bescheid vollstreckbar. Pfandung oder Gerichtsvollzieher möglich.",
    todos: [
      { schritt: 1, text: "Bescheid prüfen: Zeitraum und Betrag korrekt?", done: false },
      { schritt: 2, text: "Bei Fehler: Widerspruch innerhalb 4 Wochen einlegen", done: false },
      { schritt: 3, text: "Zahlung leisten oder Ratenzahlung beantragen", done: false },
    ],
    antwort_vorlage: "Max Mustermann\nMusterstraße 12\n10115 Berlin\n\nARD ZDF Deutschlandradio Beitragsservice\n50656 Köln\n\nDatum: __.__._____\n\nBeitragsnummer: RB-2026-4839201\n\nBetreff: Widerspruch gegen Festsetzungsbescheid\n\nSehr geehrte Damen und Herren,\n\n[Ihr Widerspruch hier]\n\nMit freundlichen Grüßen\n\nMax Mustermann",
    versand_optionen: ["Einschreiben (Einwurf)", "Online über Beitragsservice-Portal"],
  },
  {
    id: 103,
    absender: "Zulassungsstelle Stuttgart",
    aktenzeichen: "ZS-S-2026-07744",
    betreff: "Aufforderung zur Vorlage der HU-Bescheinigung",
    datum: "28.02.2026",
    frist: "31.03.2026",
    frist_iso: "2026-03-31",
    tage_verbleibend: 27,
    risiko: "mittel",
    zusammenfassung: "Ihre Hauptuntersuchung (TÜV) ist seit 2 Monaten überfällig. Legen Sie die HU-Bescheinigung vor, andernfalls droht Stilllegung.",
    konsequenz: "Zwangsstilllegung des Fahrzeugs, Bußgeld bis 60 €, Eintrag in Flensburg.",
    todos: [
      { schritt: 1, text: "TÜV-Termin vereinbaren", done: false },
      { schritt: 2, text: "Fahrzeug zur HU bringen", done: false },
      { schritt: 3, text: "HU-Bescheinigung bei der Zulassungsstelle vorlegen", done: false },
    ],
    antwort_vorlage: "Max Mustermann\nMusterstraße 12\n70173 Stuttgart\n\nZulassungsstelle Stuttgart\n70174 Stuttgart\n\nDatum: __.__._____\n\nAktenzeichen: ZS-S-2026-07744\n\nBetreff: Vorlage HU-Bescheinigung\n\nSehr geehrte Damen und Herren,\n\nin der Anlage übersende ich die HU-Bescheinigung meines Fahrzeugs.\n\nMit freundlichen Grüßen\n\nMax Mustermann",
    versand_optionen: ["Persönliche Abgabe", "Einschreiben (Einwurf)"],
  },
  {
    id: 104,
    absender: "Auslanderbüro Frankfurt",
    aktenzeichen: "ABH-FFM-2026-22190",
    betreff: "Verlängerung der Aufenthaltserlaubnis – Mitwirkungspflicht",
    datum: "03.03.2026",
    frist: "17.04.2026",
    frist_iso: "2026-04-17",
    tage_verbleibend: 44,
    risiko: "hoch",
    zusammenfassung: "Sie werden aufgefordert, Unterlagen zur Verlängerung Ihrer Aufenthaltserlaubnis einzureichen (Arbeitsvertrag, Mietvertrag, Krankenversicherungsnachweis).",
    konsequenz: "Ohne rechtzeitige Verlängerung kann eine Duldung oder Ausreisepflicht eintreten.",
    todos: [
      { schritt: 1, text: "Arbeitsvertrag und Gehaltsabrechnungen zusammenstellen", done: false },
      { schritt: 2, text: "Mietvertrag und Anmeldebestatigung kopieren", done: false },
      { schritt: 3, text: "Krankenversicherungsnachweis besorgen", done: false },
      { schritt: 4, text: "Persönlich beim Ausländeramt vorsprechen", done: false },
    ],
    antwort_vorlage: "Max Mustermann\nMusterstraße 12\n60311 Frankfurt\n\nAusländerbehörde Frankfurt\n60313 Frankfurt\n\nDatum: __.__._____\n\nAktenzeichen: ABH-FFM-2026-22190\n\nBetreff: Verlängerung Aufenthaltserlaubnis\n\nSehr geehrte Damen und Herren,\n\nanbei die angeforderten Unterlagen.\n\nMit freundlichen Grüßen\n\nMax Mustermann",
    versand_optionen: ["Persönliche Abgabe mit Empfangsbestätigung"],
  },
  {
    id: 105,
    absender: "Finanzamt Düsseldorf-Süd",
    aktenzeichen: "St.-Nr. 133/5214/0815",
    betreff: "Umsatzsteuer-Voranmeldung Q4/2025 – Erinnerung",
    datum: "02.03.2026",
    frist: "10.04.2026",
    frist_iso: "2026-04-10",
    tage_verbleibend: 37,
    risiko: "hoch",
    zusammenfassung: "Die Umsatzsteuer-Voranmeldung für Q4/2025 wurde noch nicht eingereicht. Bei weiterem Versäumnis wird ein Verspätungszuschlag festgesetzt.",
    konsequenz: "Verspätungszuschlag bis zu 10 % der angemeldeten Steuer. Zwangsgeld bis 25.000 € möglich.",
    todos: [
      { schritt: 1, text: "Buchhaltung für Q4/2025 abschließen", done: false },
      { schritt: 2, text: "Umsatzsteuer-Voranmeldung über ELSTER erstellen", done: false },
      { schritt: 3, text: "Voranmeldung elektronisch übermitteln", done: false },
    ],
    antwort_vorlage: "Max Mustermann\nMusterstraße 12\n40215 Düsseldorf\n\nFinanzamt Düsseldorf-Süd\n40210 Düsseldorf\n\nDatum: __.__._____\n\nSteuernummer: 133/5214/0815\n\nBetreff: Umsatzsteuer-Voranmeldung Q4/2025\n\nSehr geehrte Damen und Herren,\n\nin der Anlage die Umsatzsteuer-Voranmeldung für Q4/2025.\n\nMit freundlichen Grüßen\n\nMax Mustermann",
    versand_optionen: ["ELSTER (elektronisch)"],
  },
  {
    id: 106,
    absender: "Ordnungsamt Berlin-Neukölln",
    aktenzeichen: "OA-NK-2026-03991",
    betreff: "Verwarnung wegen Ruhestörung – Stellungnahme",
    datum: "27.02.2026",
    frist: "20.03.2026",
    frist_iso: "2026-03-20",
    tage_verbleibend: 16,
    risiko: "niedrig",
    zusammenfassung: "Gegen Sie liegt eine Beschwerde wegen Ruhestörung vor. Sie haben Gelegenheit zur Stellungnahme.",
    konsequenz: "Bei wiederholten Verstößen Bußgeld bis 5.000 €. Erste Verwarnung bleibt ohne Bußgeld bei Stellungnahme.",
    todos: [
      { schritt: 1, text: "Sachverhalt prüfen: Datum und Uhrzeit des Vorfalls", done: false },
      { schritt: 2, text: "Stellungnahme verfassen", done: false },
      { schritt: 3, text: "Fristgerecht einreichen", done: false },
    ],
    antwort_vorlage: "Max Mustermann\nMusterstraße 12\n12043 Berlin\n\nOrdnungsamt Berlin-Neukölln\n12040 Berlin\n\nDatum: __.__._____\n\nAktenzeichen: OA-NK-2026-03991\n\nBetreff: Stellungnahme zur Verwarnung\n\nSehr geehrte Damen und Herren,\n\n[Ihre Stellungnahme]\n\nMit freundlichen Grüßen\n\nMax Mustermann",
    versand_optionen: ["Einschreiben (Einwurf)", "Persönliche Abgabe"],
  },
  {
    id: 107,
    absender: "Krankenkasse AOK Bayern",
    aktenzeichen: "AOK-BY-2026-881204",
    betreff: "Beitragsrückstand – Zahlungsaufforderung",
    datum: "04.03.2026",
    frist: "18.03.2026",
    frist_iso: "2026-03-18",
    tage_verbleibend: 14,
    risiko: "hoch",
    zusammenfassung: "Rückständige Krankenversicherungsbeiträge in Höhe von 847,20 €. Zahlungsfrist bereits einmal verlängert.",
    konsequenz: "Säumniszuschlag 1 % pro Monat. Leistungseinschränkung auf Notfallversorgung bei weiterem Verzug.",
    todos: [
      { schritt: 1, text: "Kontostand prüfen und Zahlung veranlassen", done: false },
      { schritt: 2, text: "Falls Zahlung nicht möglich: Ratenzahlung beantragen", done: false },
      { schritt: 3, text: "Zahlungseingang bestätigen lassen", done: false },
    ],
    antwort_vorlage: "Max Mustermann\nMusterstraße 12\n80331 München\n\nAOK Bayern\n80788 München\n\nDatum: __.__._____\n\nVersichertennummer: AOK-BY-2026-881204\n\nBetreff: Ratenzahlung Beitragsrückstand\n\nSehr geehrte Damen und Herren,\n\nich bitte um Einräumung einer Ratenzahlung.\n\nMit freundlichen Grüßen\n\nMax Mustermann",
    versand_optionen: ["Einschreiben mit Rückschein", "Online über Meine AOK"],
  },
  {
    id: 108,
    absender: "Bauamt Leipzig",
    aktenzeichen: "BA-L-2026-05520",
    betreff: "Aufforderung zum Rückbau – ungenehmigter Carport",
    datum: "26.02.2026",
    frist: "26.04.2026",
    frist_iso: "2026-04-26",
    tage_verbleibend: 53,
    risiko: "niedrig",
    zusammenfassung: "Das Bauamt stellt fest, dass ein Carport ohne Baugenehmigung errichtet wurde. Sie werden zum Rückbau oder zur nachträglichen Genehmigung aufgefordert.",
    konsequenz: "Zwangsgeld bis 10.000 € bei Nichtbefolgung. Ersatzvornahme (Rückbau auf Ihre Kosten) möglich.",
    todos: [
      { schritt: 1, text: "Prüfen ob nachträgliche Genehmigung möglich", done: false },
      { schritt: 2, text: "Bauantrag vorbereiten oder Rückbau planen", done: false },
      { schritt: 3, text: "Stellungnahme fristgerecht einreichen", done: false },
    ],
    antwort_vorlage: "Max Mustermann\nMusterstraße 12\n04109 Leipzig\n\nBauamt Leipzig\n04092 Leipzig\n\nDatum: __.__._____\n\nAktenzeichen: BA-L-2026-05520\n\nBetreff: Stellungnahme zum Rückbaubescheid\n\nSehr geehrte Damen und Herren,\n\n[Ihre Stellungnahme]\n\nMit freundlichen Grüßen\n\nMax Mustermann",
    versand_optionen: ["Einschreiben mit Rückschein", "Persönliche Abgabe"],
  },
];

const RISK_MAP = {
  hoch: { color: "#C41E3A", bg: "#FFF0F0", label: "Hohes Risiko", icon: "!!" },
  mittel: { color: "#CC7A00", bg: "#FFF8EC", label: "Mittleres Risiko", icon: "!" },
  niedrig: { color: "#2D7D46", bg: "#F0FFF4", label: "Geringes Risiko", icon: "i" },
};

// Reusable Components

function Header({ onBack, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E5E5E5", background: "#FAFAFA" }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", marginRight: 12, color: "#1A1A1A", padding: 4 }}>{"←"}</button>
      )}
      <span style={{ fontSize: 17, fontWeight: 600, color: "#1A1A1A", letterSpacing: "-0.2px" }}>{title}</span>
    </div>
  );
}

function Badge({ risiko }) {
  const r = RISK_MAP[risiko];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: r.color, background: r.bg, padding: "3px 10px", borderRadius: 4, letterSpacing: "0.3px" }}>
      <span style={{ width: 16, height: 16, borderRadius: "50%", background: r.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{r.icon}</span>
      {r.label}
    </span>
  );
}

function CountdownBadge({ tage }) {
  const urgent = tage <= 7;
  return (
    <span style={{
      fontSize: 13, fontWeight: 700, color: urgent ? "#C41E3A" : "#1A1A1A",
      fontVariantNumeric: "tabular-nums",
    }}>
      {tage} {tage === 1 ? "Tag" : "Tage"} verbleibend
    </span>
  );
}

function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { key: "briefe", label: "Briefe", icon: "\uD83D\uDCE8" },
    { key: "kalender", label: "Kalender", icon: "\uD83D\uDCC5" },
    { key: "nachweise", label: "Nachweise", icon: "\uD83D\uDCC1" },
  ];
  return (
    <div style={{ borderTop: "1px solid #E5E5E5", padding: "10px 20px", display: "flex", justifyContent: "space-around", background: "#FAFAFA", flexShrink: 0 }}>
      {tabs.map(({ key, label, icon }) => {
        const active = activeTab === key;
        return (
          <button key={key} onClick={() => onTabChange(key)} style={{
            background: "none", border: "none", cursor: "pointer", textAlign: "center", padding: "4px 12px",
          }}>
            <div style={{ fontSize: 20 }}>{icon}</div>
            <div style={{ fontSize: 11, color: active ? "#1A1A1A" : "#999", fontWeight: active ? 700 : 500 }}>{label}</div>
          </button>
        );
      })}
    </div>
  );
}

// Screens

function HomeScreen({ onScan, onSelectLetter, letters }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div style={{ padding: "24px 20px 12px", background: "#FAFAFA", borderBottom: "1px solid #E5E5E5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>F</span>
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.5px" }}>FristRadar</span>
        </div>
        <p style={{ fontSize: 13, color: "#666", margin: "6px 0 0 0" }}>Behördenpost im Griff. Fristen erkennen, handeln, nachweisen.</p>
      </div>

      <div style={{ padding: "20px 20px 8px" }}>
        <button onClick={onScan} style={{
          width: "100%", padding: "18px", background: "#1A1A1A", color: "#fff", border: "none", borderRadius: 10,
          fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)", letterSpacing: "-0.2px",
        }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#fff" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#fff" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#fff" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#fff" strokeWidth="2"/></svg>
          Brief scannen
        </button>
      </div>

      <div style={{ padding: "16px 20px 8px" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "1px" }}>Letzte Briefe</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
        {letters.map((l) => (
          <button key={l.id} onClick={() => onSelectLetter(l)} style={{
            width: "100%", textAlign: "left", background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10,
            padding: "14px 16px", marginBottom: 10, cursor: "pointer", transition: "border-color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#B0B0B0"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E5E5"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", lineHeight: 1.3, maxWidth: "65%" }}>{l.absender}</span>
              <CountdownBadge tage={l.tage_verbleibend} />
            </div>
            <p style={{ fontSize: 13, color: "#555", margin: "0 0 8px", lineHeight: 1.4 }}>{l.betreff}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Badge risiko={l.risiko} />
              <span style={{ fontSize: 12, color: "#999" }}>Frist: {l.frist}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CalendarScreen({ letters, reminders, onSelectLetter }) {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
  const firstDow = (new Date(viewDate.year, viewDate.month, 1).getDay() + 6) % 7; // Mon=0
  const monthName = new Date(viewDate.year, viewDate.month).toLocaleString("de-DE", { month: "long", year: "numeric" });

  const prevMonth = () => setViewDate(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const nextMonth = () => setViewDate(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });

  // Build a map of date -> deadlines for the viewed month
  const deadlineMap = {};
  const reminderMap = {};
  letters.forEach(l => {
    if (l.frist_iso) {
      const d = l.frist_iso;
      if (!deadlineMap[d]) deadlineMap[d] = [];
      deadlineMap[d].push(l);
    }
    if (l.frist_iso && reminders?.[l.id]) {
      const lr = reminders[l.id];
      const frist = new Date(l.frist_iso + "T00:00:00");
      [{ key: "t7", days: 7 }, { key: "t3", days: 3 }, { key: "t1", days: 1 }].forEach(({ key, days }) => {
        if (lr[key]) {
          const rd = new Date(frist);
          rd.setDate(rd.getDate() - days);
          const rStr = `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, "0")}-${String(rd.getDate()).padStart(2, "0")}`;
          if (!reminderMap[rStr]) reminderMap[rStr] = [];
          reminderMap[rStr].push(l);
        }
      });
    }
  });

  // Upcoming deadlines sorted by date
  const upcoming = [...letters]
    .filter(l => l.frist_iso)
    .sort((a, b) => a.frist_iso.localeCompare(b.frist_iso));

  const getReminderLabel = (letter) => {
    if (!letter.frist_iso) return null;
    const frist = new Date(letter.frist_iso);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.round((frist - now) / (1000 * 60 * 60 * 24));
    if (diff === 1) return "T-1";
    if (diff === 3) return "T-3";
    if (diff === 7) return "T-7";
    if (diff <= 7 && diff > 0) return `T-${diff}`;
    return null;
  };

  const dayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div style={{ padding: "20px 20px 12px", background: "#FAFAFA", borderBottom: "1px solid #E5E5E5" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={prevMonth} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: "4px 12px", color: "#1A1A1A" }}>{"‹"}</button>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#1A1A1A", textTransform: "capitalize" }}>{monthName}</span>
          <button onClick={nextMonth} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: "4px 12px", color: "#1A1A1A" }}>{"›"}</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Calendar grid */}
        <div style={{ padding: "12px 16px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center" }}>
            {dayNames.map(d => (
              <div key={d} style={{ fontSize: 11, fontWeight: 600, color: "#999", padding: "4px 0" }}>{d}</div>
            ))}
            {[...Array(firstDow)].map((_, i) => <div key={`e${i}`} />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = dateStr === todayStr;
              const deadlines = deadlineMap[dateStr] || [];
              const dayReminders = reminderMap[dateStr] || [];
              const hasDeadline = deadlines.length > 0;
              const hasReminder = dayReminders.length > 0;
              const hasDot = hasDeadline || hasReminder;

              return (
                <div key={day} style={{
                  position: "relative", padding: "6px 0", cursor: hasDot ? "pointer" : "default",
                }} onClick={() => {
                  if (hasDeadline) onSelectLetter(deadlines[0]);
                  else if (hasReminder) onSelectLetter(dayReminders[0]);
                }}>
                  <div style={{
                    width: 32, height: 32, margin: "0 auto", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: isToday ? "#1A1A1A" : "transparent", color: isToday ? "#fff" : "#1A1A1A",
                    fontSize: 13, fontWeight: isToday ? 700 : 400,
                  }}>
                    {day}
                  </div>
                  {hasDot && (
                    <div style={{ display: "flex", gap: 3, justifyContent: "center", marginTop: 2 }}>
                      {hasDeadline && (
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: RISK_MAP[deadlines[0].risiko]?.color || "#999" }} />
                      )}
                      {hasReminder && (
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6" }} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 14, padding: "12px 20px", justifyContent: "center", flexWrap: "wrap" }}>
          {[["hoch", "Hohes R."], ["mittel", "Mittleres R."], ["niedrig", "Geringes R."]].map(([key, label]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#666" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: RISK_MAP[key].color }} />
              {label}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#666" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6" }} />
            Erinnerung
          </div>
        </div>

        {/* Upcoming deadlines list */}
        <div style={{ padding: "4px 20px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
            Anstehende Fristen
          </div>
          {upcoming.map(l => {
            const reminder = getReminderLabel(l);
            return (
              <button key={l.id} onClick={() => onSelectLetter(l)} style={{
                width: "100%", textAlign: "left", background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10,
                padding: "12px 14px", marginBottom: 8, cursor: "pointer", transition: "border-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#B0B0B0"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E5E5"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>{l.absender}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {reminder && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: "#fff", background: RISK_MAP[l.risiko].color,
                        padding: "2px 6px", borderRadius: 3,
                      }}>{reminder}</span>
                    )}
                    <Badge risiko={l.risiko} />
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#555", margin: "0 0 6px", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.betreff}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#999" }}>Frist: {l.frist}</span>
                  <CountdownBadge tage={l.tage_verbleibend} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NachweiseScreen({ letters, onSelectLetter }) {
  const [nachweise, setNachweise] = useState(() => {
    const map = {};
    letters.forEach(l => { map[l.id] = { status: "offen", belege: [] }; });
    return map;
  });

  const markSent = (id) => {
    setNachweise(prev => ({
      ...prev,
      [id]: { ...prev[id], status: "versendet" },
    }));
  };

  const addBeleg = (id) => {
    setNachweise(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: "nachgewiesen",
        belege: [...prev[id].belege, {
          type: "Einschreiben",
          datum: new Date().toLocaleDateString("de-DE"),
          beleg: true,
        }],
      },
    }));
  };

  const statusConfig = {
    offen: { label: "Offen", color: "#C41E3A", bg: "#FFF0F0" },
    versendet: { label: "Versendet", color: "#CC7A00", bg: "#FFF8EC" },
    nachgewiesen: { label: "Nachgewiesen", color: "#2D7D46", bg: "#F0FFF4" },
  };

  const counts = { offen: 0, versendet: 0, nachgewiesen: 0 };
  letters.forEach(l => { counts[nachweise[l.id]?.status || "offen"]++; });

  const summaryParts = [];
  if (counts.versendet > 0) summaryParts.push(`${counts.versendet} versendet`);
  if (counts.nachgewiesen > 0) summaryParts.push(`${counts.nachgewiesen} nachgewiesen`);
  if (counts.offen > 0) summaryParts.push(`${counts.offen} offen`);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div style={{ padding: "20px 20px 14px", background: "#FAFAFA", borderBottom: "1px solid #E5E5E5" }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#1A1A1A" }}>Nachweise</span>
        <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>Versandnachweise für Ihre Behördenpost</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 20px" }}>
        {/* Summary bar */}
        <div style={{
          background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10, padding: "12px 16px", marginBottom: 16,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>{letters.length} Briefe</span>
          <span style={{ fontSize: 12, color: "#666" }}>{summaryParts.join(", ")}</span>
        </div>

        {/* Letter cards */}
        {letters.map(l => {
          const nw = nachweise[l.id] || { status: "offen", belege: [] };
          const sc = statusConfig[nw.status];
          return (
            <div key={l.id} style={{
              background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10,
              padding: 16, marginBottom: 12,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 2 }}>{l.absender}</div>
                  <div style={{ fontSize: 12, color: "#555", lineHeight: 1.3 }}>{l.betreff}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: sc.color, background: sc.bg,
                  padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap", marginLeft: 8,
                }}>{sc.label}</span>
              </div>

              {/* Proof items */}
              {nw.belege.length > 0 && (
                <div style={{ marginBottom: 10, borderTop: "1px solid #F0F0F0", paddingTop: 10 }}>
                  {nw.belege.map((b, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, fontSize: 12 }}>
                      <div style={{
                        width: 32, height: 32, background: "#F0F0F0", borderRadius: 6,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                      }}>{"\uD83D\uDCCE"}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#1A1A1A" }}>{b.type}</div>
                        <div style={{ color: "#999" }}>{b.datum}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {nw.status === "offen" && (
                  <button onClick={() => markSent(l.id)} style={{
                    flex: 1, padding: "10px 0", background: "#1A1A1A", color: "#fff", border: "none",
                    borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>Als versendet markieren</button>
                )}
                {nw.status !== "nachgewiesen" && (
                  <button onClick={() => addBeleg(l.id)} style={{
                    flex: 1, padding: "10px 0", background: "#fff", color: "#1A1A1A",
                    border: "1px solid #DDD", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>Beleg hinzufügen</button>
                )}
                {nw.status === "nachgewiesen" && (
                  <div style={{
                    flex: 1, padding: "10px 0", textAlign: "center",
                    fontSize: 12, fontWeight: 600, color: "#2D7D46",
                  }}>{"✓"} Vollständig nachgewiesen</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CameraScreen({ onCapture, onClose }) {
  const [flash, setFlash] = useState(false);
  const [scanY, setScanY] = useState(0);

  useEffect(() => {
    let frame;
    let start = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - start) % 2400;
      setScanY(elapsed / 2400);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const capture = () => {
    setFlash(true);
    setTimeout(() => onCapture(), 500);
  };

  return (
    <div style={{ position: "relative", height: "100%", background: "#0A0A0A", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes grain { 0%,100%{transform:translate(0,0)} 10%{transform:translate(-1%,-1%)} 20%{transform:translate(1%,0.5%)} 30%{transform:translate(-0.5%,1%)} 40%{transform:translate(0.5%,-0.5%)} 50%{transform:translate(-1%,0.5%)} 60%{transform:translate(1%,1%)} 70%{transform:translate(0,-1%)} 80%{transform:translate(-0.5%,0.5%)} 90%{transform:translate(0.5%,0%)} }
        @keyframes focusPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
      `}</style>

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(170deg, #1a1c1e 0%, #0d0e10 40%, #14161a 70%, #0a0b0d 100%)",
        }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.12 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              top: `${15 + i * 14}%`, left: "12%", right: "12%",
              height: 1, background: `rgba(255,255,255,${0.08 + Math.random() * 0.06})`,
            }} />
          ))}
        </div>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-1.2deg)",
          width: "70%", aspectRatio: "1/1.414", background: "rgba(255,255,255,0.06)",
          borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)",
        }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              position: "absolute", top: `${14 + i * 9}%`, left: "12%",
              width: `${45 + (i % 3) * 15}%`, height: 3,
              background: "rgba(255,255,255,0.05)", borderRadius: 1,
            }} />
          ))}
          <div style={{
            position: "absolute", top: "6%", right: "8%",
            width: "28%", height: "10%", background: "rgba(255,255,255,0.04)", borderRadius: 2,
          }} />
        </div>
        <div style={{
          position: "absolute", inset: -10, opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: 128, animation: "grain 0.5s steps(1) infinite",
        }} />

        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{
            position: "relative", width: "82%", aspectRatio: "1/1.414",
            border: "2px solid rgba(255,255,255,0.5)", borderRadius: 12,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
          }}>
            {[[false,false],[true,false],[false,true],[true,true]].map(([right,bottom],i)=>(
              <div key={i} style={{
                position:"absolute",
                ...(bottom ? {bottom:-2} : {top:-2}),
                ...(right ? {right:-2} : {left:-2}),
                width:28, height:28,
                borderTop: bottom ? "none" : "3px solid #fff",
                borderBottom: bottom ? "3px solid #fff" : "none",
                borderLeft: right ? "none" : "3px solid #fff",
                borderRight: right ? "3px solid #fff" : "none",
                borderRadius: 4,
              }}/>
            ))}
            <div style={{
              position: "absolute", left: 8, right: 8,
              top: `${scanY * 100}%`, height: 2,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 70%, transparent 100%)",
              boxShadow: "0 0 12px rgba(255,255,255,0.3)",
              transition: "top 0.05s linear",
            }} />
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              width: 40, height: 40, border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: 2,
              animation: "focusPulse 2s ease-in-out infinite",
            }} />
          </div>
        </div>

        {flash && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: 0.9, transition: "opacity 0.4s" }} />}

        <div style={{ position: "absolute", top: 20, left: 0, right: 0, textAlign: "center", zIndex: 2 }}>
          <span style={{ background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 13, padding: "6px 18px", borderRadius: 20, fontWeight: 500, backdropFilter: "blur(8px)" }}>
            Brief in den Rahmen halten
          </span>
        </div>
      </div>

      <div style={{ background: "#0A0A0A", padding: "20px 0 32px", display: "flex", justifyContent: "center", alignItems: "center", gap: 48 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", padding: 8 }}>Abbrechen</button>
        <button onClick={capture} style={{
          width: 68, height: 68, borderRadius: "50%", background: "#fff", border: "4px solid rgba(255,255,255,0.25)",
          cursor: "pointer", transition: "transform 0.1s",
        }}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.9)"}
        onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        />
        <div style={{ width: 62 }} />
      </div>
    </div>
  );
}

function AnalyzingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = ["Text wird erkannt …", "Absender identifiziert …", "Fristen extrahiert …", "Handlungsplan erstellt …"];
  useEffect(() => {
    const timers = steps.map((_, i) => setTimeout(() => setStep(i), i * 700));
    const done = setTimeout(onDone, steps.length * 700 + 400);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FAFAFA", padding: 40 }}>
      <div style={{ width: 48, height: 48, border: "3px solid #E5E5E5", borderTopColor: "#1A1A1A", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 32 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ textAlign: "center" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ fontSize: 14, color: i <= step ? "#1A1A1A" : "#CCC", fontWeight: i === step ? 600 : 400, marginBottom: 8, transition: "color 0.3s, font-weight 0.3s" }}>
            {i < step ? "✓ " : i === step ? "● " : "○ "}{s}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailScreen({ letter, onBack, onGoToCalendar, reminders, onToggleReminder }) {
  const [tab, setTab] = useState("uebersicht");
  const [todos, setTodos] = useState(letter.todos);
  const [sent, setSent] = useState(false);
  const [showVorlage, setShowVorlage] = useState(false);

  const toggleTodo = (i) => setTodos(prev => prev.map((t, j) => j === i ? { ...t, done: !t.done } : t));
  const progress = Math.round((todos.filter(t => t.done).length / todos.length) * 100);

  const tabs = [
    { key: "uebersicht", label: "Übersicht" },
    { key: "todo", label: "To-do" },
    { key: "antwort", label: "Antwort" },
    { key: "nachweis", label: "Nachweis" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header onBack={onBack} title={letter.absender} />

      <div style={{ display: "flex", borderBottom: "1px solid #E5E5E5", background: "#FAFAFA" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "10px 0", background: "none", border: "none", borderBottom: tab === t.key ? "2px solid #1A1A1A" : "2px solid transparent",
            fontWeight: tab === t.key ? 600 : 400, fontSize: 13, color: tab === t.key ? "#1A1A1A" : "#888", cursor: "pointer", transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {tab === "uebersicht" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Badge risiko={letter.risiko} />
              <CountdownBadge tage={letter.tage_verbleibend} />
            </div>

            <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Aktenzeichen</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", fontFamily: "monospace" }}>{letter.aktenzeichen}</div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Betreff</div>
              <div style={{ fontSize: 14, color: "#1A1A1A", lineHeight: 1.5 }}>{letter.betreff}</div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Zusammenfassung</div>
              <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>{letter.zusammenfassung}</div>
            </div>

            <div style={{ background: RISK_MAP[letter.risiko].bg, border: `1px solid ${RISK_MAP[letter.risiko].color}33`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: RISK_MAP[letter.risiko].color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Was passiert bei Fristversäumnis?</div>
              <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>{letter.konsequenz}</div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#999", fontWeight: 600, marginBottom: 4 }}>EINGANG</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{letter.datum}</div>
              </div>
              <div style={{ flex: 1, background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#999", fontWeight: 600, marginBottom: 4 }}>FRIST</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: RISK_MAP[letter.risiko].color }}>{letter.frist}</div>
              </div>
            </div>

            {/* Erinnerungen panel */}
            {(() => {
              const lr = reminders?.[letter.id] || { t7: true, t3: true, t1: true };
              const frist = new Date(letter.frist_iso + "T00:00:00");
              const fmt = (d) => `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
              const sub = (days) => { const d = new Date(frist); d.setDate(d.getDate() - days); return d; };
              const rows = [
                { key: "t7", label: "7 Tage vorher", date: sub(7) },
                { key: "t3", label: "3 Tage vorher", date: sub(3) },
                { key: "t1", label: "1 Tag vorher", date: sub(1) },
              ];
              return (
                <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10, padding: 16, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <span style={{ fontSize: 16 }}>{"\uD83D\uDD14"}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.8px" }}>Erinnerungen</span>
                  </div>
                  {rows.map(r => (
                    <div key={r.key} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 0", borderTop: "1px solid #F0F0F0",
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "#1A1A1A" }}>{r.label}</div>
                        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{fmt(r.date)}</div>
                      </div>
                      <button
                        onClick={() => onToggleReminder(letter.id, r.key)}
                        style={{
                          width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                          background: lr[r.key] ? "#1A1A1A" : "#D1D5DB", position: "relative", transition: "background 0.2s",
                          padding: 0, flexShrink: 0,
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%", background: "#fff",
                          position: "absolute", top: 3,
                          left: lr[r.key] ? 23 : 3,
                          transition: "left 0.2s",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                        }} />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}

            <button onClick={onGoToCalendar} style={{
              width: "100%", padding: 14, background: "#1A1A1A", color: "#fff", border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>{"\uD83D\uDCC5"} Im Kalender anzeigen</button>
          </div>
        )}

        {tab === "todo" && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Fortschritt</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{progress}%</span>
              </div>
              <div style={{ height: 6, background: "#EAEAEA", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: progress === 100 ? "#2D7D46" : "#1A1A1A", borderRadius: 3, transition: "width 0.3s" }} />
              </div>
            </div>
            {todos.map((t, i) => (
              <button key={i} onClick={() => toggleTodo(i)} style={{
                width: "100%", display: "flex", alignItems: "flex-start", gap: 12, background: "#fff", border: "1px solid #E5E5E5",
                borderRadius: 10, padding: 14, marginBottom: 8, cursor: "pointer", textAlign: "left", transition: "border-color 0.15s",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, border: t.done ? "none" : "2px solid #CCC", background: t.done ? "#1A1A1A" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s",
                }}>
                  {t.done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{"✓"}</span>}
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#999" }}>Schritt {t.schritt}</span>
                  <p style={{ margin: "2px 0 0", fontSize: 14, color: t.done ? "#999" : "#1A1A1A", textDecoration: t.done ? "line-through" : "none", lineHeight: 1.5 }}>{t.text}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === "antwort" && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Versandoptionen</div>
              {letter.versand_optionen.map((opt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < letter.versand_optionen.length - 1 ? "1px solid #F0F0F0" : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1A1A1A" }} />
                  <span style={{ fontSize: 14, color: "#333" }}>{opt}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setShowVorlage(!showVorlage)} style={{
              width: "100%", padding: 14, background: showVorlage ? "#F5F5F5" : "#1A1A1A", color: showVorlage ? "#1A1A1A" : "#fff",
              border: showVorlage ? "1px solid #DDD" : "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 14,
            }}>
              {showVorlage ? "Vorlage ausblenden" : "\uD83D\uDCC4 Antwortvorlage anzeigen"}
            </button>

            {showVorlage && (
              <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10, padding: 16, marginBottom: 14 }}>
                <pre style={{ fontSize: 12.5, fontFamily: "'Courier New', monospace", whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#1A1A1A", margin: 0 }}>
                  {letter.antwort_vorlage}
                </pre>
              </div>
            )}

            <button style={{
              width: "100%", padding: 14, background: "#fff", color: "#1A1A1A", border: "1px solid #DDD", borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>
              {"↗"} Als PDF exportieren (DIN 5008)
            </button>
          </div>
        )}

        {tab === "nachweis" && (
          <div>
            <div style={{ background: "#F8F8F8", border: "1px solid #E5E5E5", borderRadius: 10, padding: 16, marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.5, margin: 0 }}>
                Dokumentieren Sie Ihren Versand: Foto vom Einlieferungsbeleg, Sendungsnummer, Fax-Protokoll oder Empfangsbestätigung.
              </p>
            </div>

            {!sent ? (
              <div>
                <button onClick={() => setSent(true)} style={{
                  width: "100%", padding: 14, background: "#1A1A1A", color: "#fff", border: "none", borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 10,
                }}>
                  {"✓"} Ich habe es abgeschickt
                </button>
                <button style={{
                  width: "100%", padding: 14, background: "#fff", color: "#1A1A1A", border: "1px solid #DDD", borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>
                  {"\uD83D\uDCF7"} Beleg fotografieren
                </button>
              </div>
            ) : (
              <div style={{ background: "#F0FFF4", border: "1px solid #2D7D4633", borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{"✓"}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#2D7D46" }}>Als versendet markiert</div>
                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>19.02.2026 {"–"} Beleg noch hinzufügen?</div>
                <button style={{
                  marginTop: 12, padding: "10px 20px", background: "#fff", border: "1px solid #DDD", borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>{"\uD83D\uDCF7"} Beleg hinzufügen</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// App

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem(AUTH_KEY) === "1");
  const [screen, setScreen] = useState("home");
  const [activeTab, setActiveTab] = useState("briefe");
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [backlogIndex, setBacklogIndex] = useState(0);
  const [scannedLetters, setScannedLetters] = useState([]);
  const [reminders, setReminders] = useState(() => {
    const init = {};
    [...DEMO_LETTERS, ...BACKLOG_LETTERS].forEach(l => {
      init[l.id] = { t7: true, t3: true, t1: true };
    });
    return init;
  });

  const toggleReminder = (letterId, type) => {
    setReminders(prev => ({
      ...prev,
      [letterId]: { ...prev[letterId], [type]: !prev[letterId]?.[type] },
    }));
  };

  // All visible letters = initial DEMO_LETTERS + scanned ones
  const allLetters = [...DEMO_LETTERS, ...scannedLetters];

  if (!authed) return <LockScreen onUnlock={() => setAuthed(true)} />;

  const handleCapture = () => {
    setScreen("analyzing");
  };

  const handleAnalyzed = () => {
    const nextLetter = BACKLOG_LETTERS[backlogIndex % BACKLOG_LETTERS.length];
    setScannedLetters(prev => [...prev, nextLetter]);
    setSelectedLetter(nextLetter);
    setBacklogIndex(prev => prev + 1);
    setScreen("detail");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "briefe") setScreen("home");
    else if (tab === "kalender") setScreen("calendar");
    else if (tab === "nachweise") setScreen("nachweise");
  };

  const handleSelectLetter = (l) => {
    setSelectedLetter(l);
    setScreen("detail");
  };

  const handleBack = () => {
    if (activeTab === "kalender") setScreen("calendar");
    else if (activeTab === "nachweise") setScreen("nachweise");
    else setScreen("home");
  };

  const handleGoToCalendar = () => {
    setActiveTab("kalender");
    setScreen("calendar");
  };

  const showBottomNav = screen === "home" || screen === "calendar" || screen === "nachweise";

  return (
    <div style={{
      maxWidth: 420, margin: "0 auto", height: "100vh", background: "#FAFAFA",
      fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden",
      boxShadow: "0 0 40px rgba(0,0,0,0.08)",
    }}>
      {screen === "home" && (
        <HomeScreen
          letters={allLetters}
          onScan={() => setScreen("camera")}
          onSelectLetter={handleSelectLetter}
        />
      )}
      {screen === "calendar" && (
        <CalendarScreen
          letters={allLetters}
          reminders={reminders}
          onSelectLetter={handleSelectLetter}
        />
      )}
      {screen === "nachweise" && (
        <NachweiseScreen
          letters={allLetters}
          onSelectLetter={handleSelectLetter}
        />
      )}
      {screen === "camera" && (
        <CameraScreen onCapture={handleCapture} onClose={() => handleTabChange(activeTab)} />
      )}
      {screen === "analyzing" && (
        <AnalyzingScreen onDone={handleAnalyzed} />
      )}
      {screen === "detail" && selectedLetter && (
        <DetailScreen letter={selectedLetter} onBack={handleBack} onGoToCalendar={handleGoToCalendar} reminders={reminders} onToggleReminder={toggleReminder} />
      )}
      {showBottomNav && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}
