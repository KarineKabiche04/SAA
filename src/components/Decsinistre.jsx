import { useState, useRef, useEffect, useCallback } from "react";

// ── styles ────────────────────────────────────────────────────────────────────
const S = {
  wrap: { fontFamily: "sans-serif", maxWidth: 960, margin: "0 auto", padding: "1.5rem 1rem" },
  header: { borderBottom: "2px solid #c0392b", paddingBottom: 8, marginBottom: 4, fontSize: 22, fontWeight: 500 },
  subtitle: { fontSize: 12, color: "#666", marginBottom: "1.5rem" },
  section: { background: "#fff", border: "0.5px solid #ddd", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" },
  sectionTitle: { fontSize: 14, fontWeight: 500, color: "#c0392b", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 },
  num: { background: "#c0392b", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, flexShrink: 0 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 12, color: "#666" },
  input: { width: "100%", border: "0.5px solid #ccc", borderRadius: 8, padding: "6px 10px", fontSize: 13, background: "#fafafa", color: "#1a1a1a", fontFamily: "sans-serif" },
  textarea: { width: "100%", border: "0.5px solid #ccc", borderRadius: 8, padding: "6px 10px", fontSize: 13, background: "#fafafa", color: "#1a1a1a", resize: "vertical", minHeight: 60, fontFamily: "sans-serif" },
  select: { width: "100%", border: "0.5px solid #ccc", borderRadius: 8, padding: "6px 10px", fontSize: 13, background: "#fafafa", color: "#1a1a1a" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  colHeaderA: { background: "#dbeafe", color: "#1e3a5f", fontSize: 13, fontWeight: 500, padding: "6px 10px", borderRadius: 8, textAlign: "center", marginBottom: 10 },
  colHeaderB: { background: "#fce4ec", color: "#7b1a1a", fontSize: 13, fontWeight: 500, padding: "6px 10px", borderRadius: 8, textAlign: "center", marginBottom: 10 },
  checkGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 },
  checkItem: { display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11, padding: "3px 0", lineHeight: 1.4, color: "#1a1a1a" },
  sketchTools: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  toolBtn: (active) => ({ fontSize: 12, padding: "4px 10px", border: active ? "0.5px solid #c0392b" : "0.5px solid #ccc", borderRadius: 8, cursor: "pointer", background: active ? "#fff0f0" : "#fafafa", color: active ? "#c0392b" : "#444" }),
  colorDot: (active) => ({ width: 20, height: 20, borderRadius: "50%", cursor: "pointer", border: active ? "2px solid #1a1a1a" : "2px solid transparent", flexShrink: 0 }),
  canvas: { border: "1.5px dashed #ccc", borderRadius: 8, cursor: "crosshair", background: "#fff", display: "block", width: "100%", touchAction: "none" },
  sigCanvas: { border: "1.5px dashed #ccc", borderRadius: 8, background: "#fff", display: "block", width: "100%", touchAction: "none", cursor: "crosshair", height: 80 },
  submitBtn: { background: "#c0392b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px", fontSize: 14, fontWeight: 500, cursor: "pointer", width: "100%", marginTop: "1rem" },
  clearBtn: { fontSize: 11, marginTop: 4, padding: "2px 8px", border: "0.5px solid #ccc", borderRadius: 8, cursor: "pointer", background: "#fafafa", color: "#666" },
  ynRow: { display: "flex", alignItems: "center", gap: 8, margin: "6px 0" },
  ynLabel: { fontSize: 12, color: "#555", minWidth: 200, flex: 1 },
  ynBtns: { display: "flex", gap: 6 },
  ynBtn: (state, type) => ({
    fontSize: 12, padding: "4px 14px", border: state === type ? (type === "oui" ? "0.5px solid #27ae60" : "0.5px solid #c0392b") : "0.5px solid #ccc",
    borderRadius: 8, cursor: "pointer",
    background: state === type ? (type === "oui" ? "#27ae60" : "#c0392b") : "#fafafa",
    color: state === type ? "#fff" : "#444",
  }),
  divider: { borderTop: "0.5px solid #eee", margin: "12px 0" },
  totalRow: { marginTop: 10, fontSize: 12, color: "#555", display: "flex", gap: 16 },
};

// ── data ──────────────────────────────────────────────────────────────────────
const CIRCUMSTANCES = [
  "1) Heurtait à l'arrière (même sens, même file)",
  "2) Roulait même sens, file différente",
  "3) Roulait en sens inverse",
  "4) Venait d'une chaussée différente",
  "5) Venait de droite (carrefour)",
  "6) S'engageait dans une place à sens giratoire",
  "7) Roulait sur place à sens giratoire",
  "8) En stationnement",
  "9) Quittait un stationnement",
  "10) Prenait un stationnement",
  "11) Reculait",
  "12) Doublait",
  "13) Dépassement irrégulier",
  "14) Changeait de file",
  "15) Virait à droite",
  "16) Virait à gauche",
  "17) S'engageait dans un parking / lieu privé",
  "18) Sortait d'un parking / lieu privé",
  "19) Empiétait sur voie réservée / sens inverse",
  "20) Roulait en sens interdit",
  "21) Inobservation d'un signe de priorité",
  "22) Faisait un demi-tour",
  "23) Ouvrait une portière",
];

const COLORS = ["#1a1a1a", "#c0392b", "#2980b9", "#27ae60", "#f39c12"];

// ── sub-components ────────────────────────────────────────────────────────────

function Field({ label, children, fullWidth }) {
  return (
    <div style={{ ...S.field, gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function YesNo({ label, value, onChange }) {
  return (
    <div style={S.ynRow}>
      <span style={S.ynLabel}>{label}</span>
      <div style={S.ynBtns}>
        <button style={S.ynBtn(value, "oui")} onClick={() => onChange(value === "oui" ? null : "oui")}>Oui</button>
        <button style={S.ynBtn(value, "non")} onClick={() => onChange(value === "non" ? null : "non")}>Non</button>
      </div>
    </div>
  );
}

function VehicleBlock({ label, color, data, onChange }) {
  const hdr = color === "A" ? S.colHeaderA : S.colHeaderB;
  const f = (key) => data[key] || "";
  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value });
  return (
    <div>
      <div style={hdr}>Véhicule {label}</div>
      <div style={S.grid2}>
        <Field label="Marque / Type"><input style={S.input} value={f("marque")} onChange={set("marque")} /></Field>
        <Field label="N° d'immatriculation"><input style={S.input} value={f("immat")} onChange={set("immat")} /></Field>
        <Field label="Venant de"><input style={S.input} value={f("from")} onChange={set("from")} /></Field>
        <Field label="Allant vers"><input style={S.input} value={f("to")} onChange={set("to")} /></Field>
        <Field label="N° attestation assurance"><input style={S.input} value={f("attestation")} onChange={set("attestation")} /></Field>
        <Field label="Compagnie d'assurance"><input style={S.input} value={f("compagnie")} onChange={set("compagnie")} /></Field>
        <Field label="N° de police"><input style={S.input} value={f("police")} onChange={set("police")} /></Field>
        <Field label="Valable du"><input style={S.input} type="date" value={f("valDu")} onChange={set("valDu")} /></Field>
        <Field label="Au"><input style={S.input} type="date" value={f("valAu")} onChange={set("valAu")} /></Field>
        <Field label="Agence"><input style={S.input} value={f("agence")} onChange={set("agence")} /></Field>
        <Field label="Nom du conducteur"><input style={S.input} value={f("condNom")} onChange={set("condNom")} /></Field>
        <Field label="Prénom"><input style={S.input} value={f("condPrenom")} onChange={set("condPrenom")} /></Field>
        <Field label="Adresse" fullWidth><input style={S.input} value={f("condAdresse")} onChange={set("condAdresse")} /></Field>
        <Field label="Dégâts apparents" fullWidth>
          <textarea style={S.textarea} value={f("degats")} onChange={set("degats")} placeholder="Décrire les dégâts visibles..." />
        </Field>
        <Field label="Observations" fullWidth>
          <textarea style={{ ...S.textarea, minHeight: 40 }} value={f("obs")} onChange={set("obs")} />
        </Field>
      </div>
    </div>
  );
}

function CheckboxColumn({ prefix, checks, onChange }) {
  return (
    <div style={S.checkGrid}>
      {CIRCUMSTANCES.map((c, i) => (
        <div key={i} style={S.checkItem}>
          <input
            type="checkbox"
            id={`${prefix}_${i}`}
            checked={!!checks[i]}
            onChange={(e) => onChange(i, e.target.checked)}
            style={{ marginTop: 2, flexShrink: 0, width: 14, height: 14 }}
          />
          <label htmlFor={`${prefix}_${i}`} style={{ fontSize: 11, lineHeight: 1.4 }}>{c}</label>
        </div>
      ))}
    </div>
  );
}

function SketchPad() {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const snapRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0 });
  const [tool, setToolState] = useState("draw");
  const [color, setColorState] = useState("#1a1a1a");
  const [size, setSize] = useState(3);

  const drawGrid = useCallback((ctx, w, h) => {
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth || 860;
    canvas.height = 340;
    drawGrid(canvas.getContext("2d"), canvas.width, 340);
  }, [drawGrid]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - r.left) * (canvas.width / r.width),
      y: (src.clientY - r.top) * (canvas.height / r.height),
    };
  };

  const onDown = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    const p = getPos(e);
    startRef.current = p;
    const ctx = canvasRef.current.getContext("2d");
    if (tool === "draw" || tool === "erase") { ctx.beginPath(); ctx.moveTo(p.x, p.y); }
    if (tool === "line") snapRef.current = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const onMove = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const p = getPos(e);
    if (tool === "draw") {
      ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.lineTo(p.x, p.y); ctx.stroke();
    } else if (tool === "erase") {
      ctx.strokeStyle = "#fff"; ctx.lineWidth = size * 3; ctx.lineCap = "round";
      ctx.lineTo(p.x, p.y); ctx.stroke();
    } else if (tool === "line" && snapRef.current) {
      ctx.putImageData(snapRef.current, 0, 0);
      ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(startRef.current.x, startRef.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
  };

  const onUp = () => { drawingRef.current = false; snapRef.current = null; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
  };

  return (
    <div>
      <div style={S.sketchTools}>
        {["draw", "line", "erase"].map((t) => (
          <button key={t} style={S.toolBtn(tool === t)} onClick={() => setToolState(t)}>
            {t === "draw" ? "✏️ Dessiner" : t === "line" ? "📏 Ligne" : "🧹 Gomme"}
          </button>
        ))}
        <button style={S.toolBtn(false)} onClick={clearCanvas}>🗑 Vider</button>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 6 }}>
          {COLORS.map((c) => (
            <div key={c} style={{ ...S.colorDot(color === c), background: c }} onClick={() => setColorState(c)} />
          ))}
        </div>
        <label style={{ fontSize: 12, color: "#666", display: "flex", alignItems: "center", gap: 4 }}>
          Taille
          <input type="range" min={1} max={20} value={size} onChange={(e) => setSize(Number(e.target.value))}
            style={{ width: 80 }} />
          <span style={{ fontSize: 11 }}>{size}px</span>
        </label>
      </div>
      <canvas
        ref={canvasRef} style={S.canvas} height={340}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
      />
      <p style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
        Indiquer par une flèche → le point de choc initial. Tracer les voies, la direction des véhicules et leur position au moment du choc.
      </p>
    </div>
  );
}

function SignaturePad({ id }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const c = canvasRef.current;
    c.width = c.offsetWidth || 400;
    c.height = 80;
  }, []);

  const getPos = (e) => {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return { x: (s.clientX - r.left) * (c.width / r.width), y: (s.clientY - r.top) * (c.height / r.height) };
  };
  const onDown = (e) => { e.preventDefault(); drawingRef.current = true; const p = getPos(e); const ctx = canvasRef.current.getContext("2d"); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const onMove = (e) => { if (!drawingRef.current) return; e.preventDefault(); const p = getPos(e); const ctx = canvasRef.current.getContext("2d"); ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineTo(p.x, p.y); ctx.stroke(); };
  const onUp = () => { drawingRef.current = false; };
  const clear = () => canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

  return (
    <div>
      <canvas ref={canvasRef} style={S.sigCanvas}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
      />
      <button style={S.clearBtn} onClick={clear}>Effacer</button>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
// onSave : callback reçu depuis App.jsx — appelé au clic "Envoyer"
//          transmet les données du formulaire et redirige vers le dashboard
export default function DecSinistre({ onSave }) {
  // general
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [lieu, setLieu] = useState("");
  const [degTiers, setDegTiers] = useState(null);
  const [temoin, setTemoin] = useState("");
  // assure
  const [nomAssure, setNomAssure] = useState("");
  const [profession, setProfession] = useState("");
  const [tel, setTel] = useState("");
  const [adresseAssure, setAdresseAssure] = useState("");
  // circonstances
  const [circDesc, setCircDesc] = useState("");
  const [pvGend, setPvGend] = useState(null);
  const [pvPolice, setPvPolice] = useState(null);
  // conducteur
  const [condHabituel, setCondHabituel] = useState(null);
  const [condReside, setCondReside] = useState(null);
  const [condDob, setCondDob] = useState("");
  const [condPermis, setCondPermis] = useState("");
  const [condCat, setCondCat] = useState("B");
  const [condDelivre, setCondDelivre] = useState("");
  const [condWilaya, setCondWilaya] = useState("");
  // vehicles
  const [vehi_a, setVehiA] = useState({});
  const [vehi_b, setVehiB] = useState({});
  // checks
  const [checksA, setChecksA] = useState({});
  const [checksB, setChecksB] = useState({});
  // degats tiers
  const [degatsNature, setDegatsNature] = useState("");
  const [degatsProp, setDegatsProp] = useState("");
  // blesse
  const [bNom, setBNom] = useState("");
  const [bAge, setBAage] = useState("");
  const [bAdresse, setBAdresse] = useState("");
  const [bProf, setBProf] = useState("");
  const [bSecu, setBSecu] = useState("");
  const [bBlessures, setBBlessures] = useState("");
  const [bSituation, setBSituation] = useState("");
  const [bHospi, setBHospi] = useState("");
  // final
  const [faitA, setFaitA] = useState("");
  const [faitLe, setFaitLe] = useState("");

  const totalA = Object.values(checksA).filter(Boolean).length;
  const totalB = Object.values(checksB).filter(Boolean).length;

  const handleSubmit = () => {
    // Construire l'objet de données à remonter vers App.jsx
    const data = {
      date,
      heure,
      lieu,
      degTiers,
      temoin,
      nomAssure,
      profession,
      tel,
      adresseAssure,
      circDesc,
      pvGend,
      pvPolice,
      conducteur: {
        habituel: condHabituel,
        reside: condReside,
        dob: condDob,
        permis: condPermis,
        categorie: condCat,
        delivreLe: condDelivre,
        wilaya: condWilaya,
      },
      vehiculeA: vehi_a,
      vehiculeB: vehi_b,
      circonstancesA: Object.keys(checksA).filter(k => checksA[k]).map(Number),
      circonstancesB: Object.keys(checksB).filter(k => checksB[k]).map(Number),
      degatsNature,
      degatsProp,
      blesse: { nom: bNom, age: bAge, adresse: bAdresse, profession: bProf, secu: bSecu, blessures: bBlessures, situation: bSituation, hospi: bHospi },
      faitA,
      faitLe,
    };

    if (onSave) {
      // Remonter vers App.jsx → ajoute à sinistresList et redirige vers dashboard
      onSave(data);
    } else {
      alert("Déclaration prête à être transmise à l'assureur.");
    }
  };

  return (
    <div style={S.wrap}>
      <h1 style={S.header}>📋 Déclaration de sinistre automobile</h1>
      <p style={S.subtitle}>Constat amiable d'accident automobile — à signer obligatoirement par les deux conducteurs</p>

      {/* 1 – Infos générales */}
      <div style={S.section}>
        <div style={S.sectionTitle}><span style={S.num}>1</span> Informations générales</div>
        <div style={S.grid3}>
          <Field label="Date de l'accident"><input style={S.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Heure"><input style={S.input} type="time" value={heure} onChange={(e) => setHeure(e.target.value)} /></Field>
          <Field label="Lieu précis"><input style={S.input} value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="Rue, ville, wilaya..." /></Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <YesNo label="Dégâts matériels autres qu'aux véhicules A et B ?" value={degTiers} onChange={setDegTiers} />
        </div>
        <div style={{ marginTop: 10 }}>
          <Field label="Témoins — Nom, adresse (préciser A ou B)">
            <input style={S.input} value={temoin} onChange={(e) => setTemoin(e.target.value)} placeholder="Nom et adresse du témoin" />
          </Field>
        </div>
      </div>

      {/* 2 – Assuré */}
      <div style={S.section}>
        <div style={S.sectionTitle}><span style={S.num}>2</span> Assuré — Déclarant</div>
        <div style={S.grid2}>
          <Field label="Nom de l'assuré"><input style={S.input} value={nomAssure} onChange={(e) => setNomAssure(e.target.value)} /></Field>
          <Field label="Profession"><input style={S.input} value={profession} onChange={(e) => setProfession(e.target.value)} /></Field>
          <Field label="Téléphone"><input style={S.input} type="tel" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="0X XX XX XX XX" /></Field>
          <Field label="Adresse"><input style={S.input} value={adresseAssure} onChange={(e) => setAdresseAssure(e.target.value)} /></Field>
        </div>
      </div>

      {/* 3 – Circonstances */}
      <div style={S.section}>
        <div style={S.sectionTitle}><span style={S.num}>3</span> Circonstances de l'accident</div>
        <Field label="Description"><textarea style={S.textarea} value={circDesc} onChange={(e) => setCircDesc(e.target.value)} placeholder="Décrire les circonstances..." /></Field>
        <div style={{ marginTop: 10 }}>
          <YesNo label="Un procès-verbal de gendarmerie a-t-il été établi ?" value={pvGend} onChange={setPvGend} />
          <YesNo label="Un rapport de police a-t-il été établi ?" value={pvPolice} onChange={setPvPolice} />
        </div>
      </div>

      {/* 4 – Conducteur */}
      <div style={S.section}>
        <div style={S.sectionTitle}><span style={S.num}>4</span> Conducteur du véhicule assuré</div>
        <YesNo label="Est-il le conducteur habituel du véhicule ?" value={condHabituel} onChange={setCondHabituel} />
        <YesNo label="Réside-t-il habituellement chez l'assuré ?" value={condReside} onChange={setCondReside} />
        <div style={{ ...S.grid3, marginTop: 10 }}>
          <Field label="Date de naissance"><input style={S.input} type="date" value={condDob} onChange={(e) => setCondDob(e.target.value)} /></Field>
          <Field label="Permis de conduire n°"><input style={S.input} value={condPermis} onChange={(e) => setCondPermis(e.target.value)} /></Field>
          <Field label="Catégorie">
            <select style={S.select} value={condCat} onChange={(e) => setCondCat(e.target.value)}>
              {["A1","A","B","C","D","E","F"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Délivré le"><input style={S.input} type="date" value={condDelivre} onChange={(e) => setCondDelivre(e.target.value)} /></Field>
          <Field label="Par la wilaya de"><input style={S.input} value={condWilaya} onChange={(e) => setCondWilaya(e.target.value)} /></Field>
        </div>
      </div>

      {/* 5 – Véhicules */}
      <div style={S.section}>
        <div style={S.sectionTitle}><span style={S.num}>5</span> Véhicules impliqués</div>
        <div style={S.twoCol}>
          <VehicleBlock label="A" color="A" data={vehi_a} onChange={setVehiA} />
          <VehicleBlock label="B" color="B" data={vehi_b} onChange={setVehiB} />
        </div>
      </div>

      {/* 6 – Cases à cocher */}
      <div style={S.section}>
        <div style={S.sectionTitle}><span style={S.num}>6</span> Circonstances — cocher les cases correspondantes</div>
        <div style={S.twoCol}>
          <div>
            <div style={S.colHeaderA}>Véhicule A</div>
            <CheckboxColumn prefix="a" checks={checksA} onChange={(i, v) => setChecksA((p) => ({ ...p, [i]: v }))} />
          </div>
          <div>
            <div style={S.colHeaderB}>Véhicule B</div>
            <CheckboxColumn prefix="b" checks={checksB} onChange={(i, v) => setChecksB((p) => ({ ...p, [i]: v }))} />
          </div>
        </div>
        <div style={S.totalRow}>
          <span>Total cases A : <strong>{totalA}</strong></span>
          <span>Total cases B : <strong>{totalB}</strong></span>
        </div>
      </div>

      {/* 7 – Croquis */}
      <div style={S.section}>
        <div style={S.sectionTitle}><span style={S.num}>7</span> Croquis de l'accident <span style={{ fontSize: 11, fontWeight: 400, color: "#888", marginLeft: 6 }}>— Position des véhicules, tracé des voies, direction</span></div>
        <SketchPad />
      </div>

      {/* 8 – Dégâts tiers */}
      <div style={S.section}>
        <div style={S.sectionTitle}><span style={S.num}>8</span> Dégâts matériels autres qu'aux véhicules A et B</div>
        <div style={S.grid2}>
          <Field label="Nature et importance des dégâts"><textarea style={S.textarea} value={degatsNature} onChange={(e) => setDegatsNature(e.target.value)} /></Field>
          <Field label="Nom et adresse du propriétaire"><textarea style={S.textarea} value={degatsProp} onChange={(e) => setDegatsProp(e.target.value)} /></Field>
        </div>
      </div>

      {/* 9 – Blessé */}
      <div style={S.section}>
        <div style={S.sectionTitle}><span style={S.num}>9</span> Blessé(s)</div>
        <div style={S.grid3}>
          <Field label="Nom et prénom"><input style={S.input} value={bNom} onChange={(e) => setBNom(e.target.value)} /></Field>
          <Field label="Âge"><input style={S.input} type="number" min={0} max={120} value={bAge} onChange={(e) => setBAage(e.target.value)} /></Field>
          <Field label="Adresse"><input style={S.input} value={bAdresse} onChange={(e) => setBAdresse(e.target.value)} /></Field>
          <Field label="Profession"><input style={S.input} value={bProf} onChange={(e) => setBProf(e.target.value)} /></Field>
          <Field label="Caisse sécu / N° immatriculation"><input style={S.input} value={bSecu} onChange={(e) => setBSecu(e.target.value)} /></Field>
          <Field label="Nature et gravité des blessures"><input style={S.input} value={bBlessures} onChange={(e) => setBBlessures(e.target.value)} /></Field>
          <Field label="Situation au moment de l'accident">
            <select style={S.select} value={bSituation} onChange={(e) => setBSituation(e.target.value)}>
              <option value="">Sélectionner...</option>
              {["Piéton","Passager véhicule A","Passager véhicule B","Conducteur véhicule A","Conducteur véhicule B"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="1ers soins / Hospitalisation à"><input style={S.input} value={bHospi} onChange={(e) => setBHospi(e.target.value)} /></Field>
        </div>
      </div>

      {/* 10 – Signatures */}
      <div style={S.section}>
        <div style={S.sectionTitle}><span style={S.num}>10</span> Signatures</div>
        <div style={S.twoCol}>
          <div>
            <p style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Signature conducteur A</p>
            <SignaturePad id="sig_a" />
          </div>
          <div>
            <p style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Signature conducteur B</p>
            <SignaturePad id="sig_b" />
          </div>
        </div>
        <div style={{ ...S.grid2, marginTop: 12 }}>
          <Field label="Fait à"><input style={S.input} value={faitA} onChange={(e) => setFaitA(e.target.value)} /></Field>
          <Field label="Le"><input style={S.input} type="date" value={faitLe} onChange={(e) => setFaitLe(e.target.value)} /></Field>
        </div>
      </div>

      <button style={S.submitBtn} onClick={handleSubmit}>
        📤 Envoyer la déclaration
      </button>
    </div>
  );
}