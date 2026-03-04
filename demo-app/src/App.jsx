import { useState, useEffect } from "react";

const DEMO_LETTERS = [
  {
    id: 1,
    absender: "Finanzamt Berlin-Mitte",
    aktenzeichen: "St.-Nr. 21/815/04711",
    betreff: "Aufforderung zur Abgabe der Einkommensteuererklärung 2024",
    datum: "05.02.2026",
    frist: "19.03.2026",
    tage_verbleibend: 28,
    risiko: "hoch",
    zusammenfassung: "Das Finanzamt fordert Sie auf, Ihre Einkommensteuererklärung für das Jahr 2024 einzureichen. Bei Nichtabgabe droht ein Verspätungszuschlag.",
    konsequenz: "Verspätungszuschlag ab 0,25 % der festgesetzten Steuer pro Monat, mindestens 25 \u20AC pro Monat. Zusätzlich kann ein Zwangsgeld festgesetzt werden.",
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
    betreff: "Anhörung im Ordnungswidrigkeitenverfahren \u2013 Geschwindigkeitsüberschreitung",
    datum: "12.02.2026",
    frist: "26.02.2026",
    tage_verbleibend: 7,
    risiko: "mittel",
    zusammenfassung: "Ihnen wird eine Geschwindigkeitsüberschreitung von 23 km/h innerorts vorgeworfen. Sie haben die Möglichkeit, sich innerhalb der Frist zu äußern.",
    konsequenz: "Ohne Stellungnahme ergeht der Bußgeldbescheid in der Regel ohne Berücksichtigung Ihrer Sicht. Bußgeld: voraussichtlich 115 \u20AC + 1 Punkt in Flensburg.",
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
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", marginRight: 12, color: "#1A1A1A", padding: 4 }}>\u2190</button>
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

// Screens

function HomeScreen({ onScan, onSelectLetter, letters }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
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

      <div style={{ borderTop: "1px solid #E5E5E5", padding: "10px 20px", display: "flex", justifyContent: "space-around", background: "#FAFAFA" }}>
        {[["Briefe", "\uD83D\uDCE8"], ["Kalender", "\uD83D\uDCC5"], ["Nachweise", "\uD83D\uDCC1"]].map(([label, ico]) => (
          <div key={label} style={{ textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 20 }}>{ico}</div>
            <div style={{ fontSize: 11, color: "#666", fontWeight: 500 }}>{label}</div>
          </div>
        ))}
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
  const steps = ["Text wird erkannt \u2026", "Absender identifiziert \u2026", "Fristen extrahiert \u2026", "Handlungsplan erstellt \u2026"];
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
            {i < step ? "\u2713 " : i === step ? "\u25CF " : "\u25CB "}{s}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailScreen({ letter, onBack }) {
  const [tab, setTab] = useState("uebersicht");
  const [todos, setTodos] = useState(letter.todos);
  const [sent, setSent] = useState(false);
  const [showVorlage, setShowVorlage] = useState(false);

  const toggleTodo = (i) => setTodos(prev => prev.map((t, j) => j === i ? { ...t, done: !t.done } : t));
  const progress = Math.round((todos.filter(t => t.done).length / todos.length) * 100);

  const tabs = [
    { key: "uebersicht", label: "\u00DCbersicht" },
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

            <button style={{
              width: "100%", padding: 14, background: "#1A1A1A", color: "#fff", border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>\uD83D\uDCC5 Erinnerungen im Kalender setzen</button>
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
                  {t.done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>\u2713</span>}
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
              \u2197 Als PDF exportieren (DIN 5008)
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
                  \u2713 Ich habe es abgeschickt
                </button>
                <button style={{
                  width: "100%", padding: 14, background: "#fff", color: "#1A1A1A", border: "1px solid #DDD", borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>
                  \uD83D\uDCF7 Beleg fotografieren
                </button>
              </div>
            ) : (
              <div style={{ background: "#F0FFF4", border: "1px solid #2D7D4633", borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>\u2713</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#2D7D46" }}>Als versendet markiert</div>
                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>19.02.2026 \u2013 Beleg noch hinzufügen?</div>
                <button style={{
                  marginTop: 12, padding: "10px 20px", background: "#fff", border: "1px solid #DDD", borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>\uD83D\uDCF7 Beleg hinzufügen</button>
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
  const [screen, setScreen] = useState("home");
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [demoIndex, setDemoIndex] = useState(0);

  const handleCapture = () => {
    setScreen("analyzing");
  };

  const handleAnalyzed = () => {
    setSelectedLetter(DEMO_LETTERS[demoIndex]);
    setDemoIndex(prev => (prev + 1) % DEMO_LETTERS.length);
    setScreen("detail");
  };

  return (
    <div style={{
      maxWidth: 420, margin: "0 auto", height: "100vh", background: "#FAFAFA",
      fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden",
      boxShadow: "0 0 40px rgba(0,0,0,0.08)",
    }}>
      {screen === "home" && (
        <HomeScreen
          letters={DEMO_LETTERS}
          onScan={() => setScreen("camera")}
          onSelectLetter={(l) => { setSelectedLetter(l); setScreen("detail"); }}
        />
      )}
      {screen === "camera" && (
        <CameraScreen onCapture={handleCapture} onClose={() => setScreen("home")} />
      )}
      {screen === "analyzing" && (
        <AnalyzingScreen onDone={handleAnalyzed} />
      )}
      {screen === "detail" && selectedLetter && (
        <DetailScreen letter={selectedLetter} onBack={() => setScreen("home")} />
      )}
    </div>
  );
}
