import React, { useState, useEffect, useCallback, useRef } from 'react';

const API = 'http://localhost:3001/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const fmt = n => Number(n || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Mapping wilaya → zone ─────────────────────────────────────────────────────
const WILAYAS_EST   = ['05','04','12','25','19','23','21','41','43','24','40','36','06','10'];
const WILAYAS_OUEST = ['13','22','31','29','46','27','20','26','45','48','38','02','44'];
const WILAYAS_SUD   = ['01','03','07','08','11','17','30','32','33','37','39','47','49','50','51','52','53','54','55','56','57','58'];

function getZone(wilaya) {
  if (!wilaya) return 'Inconnu';
  const code = String(wilaya).split('-')[0].trim().padStart(2, '0');
  if (WILAYAS_SUD.includes(code))   return 'Sud';
  if (WILAYAS_EST.includes(code))   return 'Est';
  if (WILAYAS_OUEST.includes(code)) return 'Ouest';
  return 'Nord';
}

// ── Calcul âge conducteur ─────────────────────────────────────────────────────
function getAge(contenu) {
  if (contenu?.conducteur?.dob) {
    const dob = new Date(contenu.conducteur.dob);
    if (!isNaN(dob)) return new Date().getFullYear() - dob.getFullYear();
  }
  if (contenu?.age) return parseInt(contenu.age);
  if (contenu?.conducteurAge) return parseInt(contenu.conducteurAge);
  return null;
}

// ── Ancienneté véhicule ───────────────────────────────────────────────────────
function getAnciennete(contenu) {
  const mec = contenu?.vehiculeA?.dateMEC || contenu?.dateMEC || contenu?.vehicule?.dateMEC;
  if (!mec) return null;
  const d = new Date(mec);
  if (isNaN(d)) return null;
  return new Date().getFullYear() - d.getFullYear();
}

// ── Composants UI ─────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, color }) => {
  const colors = {
    red:    { bg: '#FCEBEB', text: '#A32D2D', border: '#F7C1C1' },
    blue:   { bg: '#E6F1FB', text: '#185FA5', border: '#B5D4F4' },
    green:  { bg: '#EAF3DE', text: '#3B6D11', border: '#C0DD97' },
    amber:  { bg: '#FAEEDA', text: '#854F0B', border: '#FAC775' },
    slate:  { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0' },
  };
  const c = colors[color] || colors.slate;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 16, padding: '1rem 1.25rem' }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: c.text, margin: '0 0 6px', opacity: 0.8 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: c.text, margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: c.text, opacity: 0.6, margin: '4px 0 0', fontWeight: 600 }}>{sub}</p>}
    </div>
  );
};

const BarGroup = ({ label, a, b, labelA, labelB, colorA, colorB, maxVal }) => {
  const pctA = maxVal > 0 ? Math.round((a / maxVal) * 100) : 0;
  const pctB = maxVal > 0 ? Math.round((b / maxVal) * 100) : 0;
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#94a3b8', width: 80, flexShrink: 0 }}>{labelA}</span>
        <div style={{ flex: 1, height: 20, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${pctA}%`, height: '100%', background: colorA, borderRadius: 4, transition: 'width 0.8s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>
            {pctA > 10 && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{a}</span>}
          </div>
        </div>
        {pctA <= 10 && <span style={{ fontSize: 10, fontWeight: 700, color: colorA, width: 16 }}>{a}</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#94a3b8', width: 80, flexShrink: 0 }}>{labelB}</span>
        <div style={{ flex: 1, height: 20, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${pctB}%`, height: '100%', background: colorB, borderRadius: 4, transition: 'width 0.8s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>
            {pctB > 10 && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{b}</span>}
          </div>
        </div>
        {pctB <= 10 && <span style={{ fontSize: 10, fontWeight: 700, color: colorB, width: 16 }}>{b}</span>}
      </div>
    </div>
  );
};

// ── Camembert SVG ─────────────────────────────────────────────────────────────
const DonutChart = ({ data, size = 160 }) => {
  const [hovered, setHovered] = useState(null);
  const cx = size / 2, cy = size / 2, r = size * 0.38, ri = size * 0.24;
  const total = data.reduce((s, d) => s + d.value, 0);

  let cumul = 0;
  const sectors = data.filter(d => d.value > 0).map(d => {
    const pct = total > 0 ? d.value / total : 0;
    const start = cumul; cumul += pct;
    return { ...d, pct, start, end: cumul };
  });

  const toXY = (pct, radius) => {
    const a = pct * 2 * Math.PI - Math.PI / 2;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  };

  const arc = (start, end, isH) => {
    if (end - start >= 1) return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
    const ro = isH ? r + 6 : r;
    const p1 = toXY(start, ro), p2 = toXY(end, ro);
    const p3 = toXY(end, ri),   p4 = toXY(start, ri);
    const lg = end - start > 0.5 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${ro} ${ro} 0 ${lg} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${ri} ${ri} 0 ${lg} 0 ${p4.x} ${p4.y} Z`;
  };

  const hd = hovered !== null ? sectors[hovered] : null;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {sectors.map((s, i) => (
        <path key={i} d={arc(s.start, s.end, hovered === i)}
          fill={s.color} stroke="#fff" strokeWidth="2"
          style={{ cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
      ))}
      <text x={cx} y={cy - 6}  textAnchor="middle" fontSize="13" fontWeight="800" fill="#1e293b">
        {hd ? `${Math.round(hd.pct * 100)}%` : total}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9"  fontWeight="600" fill={hd?.color || '#94a3b8'}>
        {hd ? hd.label : 'total'}
      </text>
    </svg>
  );
};

// ── Matrice de risque ─────────────────────────────────────────────────────────
const MatriceRisque = ({ data }) => {
  const zones = ['Nord', 'Est', 'Ouest', 'Sud'];
  const tranches = [
    { label: '— 35 ans · — 5 ans', age: false, veh: false },
    { label: '— 35 ans · + 5 ans', age: false, veh: true  },
    { label: '+ 35 ans · — 5 ans', age: true,  veh: false },
    { label: '+ 35 ans · + 5 ans', age: true,  veh: true  },
  ];

  const getCellValue = (zone, agePlus, vehPlus) => {
    return data.filter(s => {
      const c = s._parsed;
      return c.zone === zone &&
             (agePlus ? c.age >= 35 : c.age < 35) &&
             (vehPlus ? c.anciennete >= 5 : c.anciennete < 5);
    }).length;
  };

  const maxVal = Math.max(1, ...tranches.flatMap(t =>
    zones.map(z => getCellValue(z, t.age, t.veh))
  ));

  const cellColor = (v) => {
    if (v === 0) return { bg: '#f8fafc', text: '#94a3b8' };
    const pct = v / maxVal;
    if (pct >= 0.7) return { bg: '#FCA5A5', text: '#7F1D1D' };
    if (pct >= 0.4) return { bg: '#FCD34D', text: '#78350F' };
    return { bg: '#BBF7D0', text: '#14532D' };
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr>
            <th style={{ padding: '6px 8px', textAlign: 'left', color: '#94a3b8', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Profil</th>
            {zones.map(z => (
              <th key={z} style={{ padding: '6px 8px', textAlign: 'center', color: '#475569', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>{z}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tranches.map((t, i) => (
            <tr key={i}>
              <td style={{ padding: '6px 8px', color: '#475569', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>{t.label}</td>
              {zones.map(z => {
                const v = getCellValue(z, t.age, t.veh);
                const clr = cellColor(v);
                return (
                  <td key={z} style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ background: clr.bg, color: clr.text, borderRadius: 8, padding: '4px 8px', fontWeight: 800, fontSize: 13 }}>
                      {v}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
        {[
          { color: '#FCA5A5', text: '#7F1D1D', label: 'Risque élevé' },
          { color: '#FCD34D', text: '#78350F', label: 'Risque moyen' },
          { color: '#BBF7D0', text: '#14532D', label: 'Risque faible' },
          { color: '#f8fafc', text: '#94a3b8', label: 'Aucun sinistre' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color, border: `1px solid ${l.text}33` }} />
            <span style={{ fontSize: 10, color: '#64748b' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────
const VueAnalytique = () => {
  const [sinistres, setSinistres] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filtre,    setFiltre]    = useState('tous'); // tous | valides | en_cours

  const fetchData = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/sinistres/all`, { headers: authHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) {
        const enrichis = data.map(s => {
          let c = {};
          try { c = JSON.parse(typeof s.contenu === 'string' ? s.contenu : '{}'); } catch {}
          const age        = getAge(c) ?? getAge(s) ?? 30;
          const anciennete = getAnciennete(c) ?? 5;
          const wilaya     = c?.wilaya || c?.adresseAssure?.wilaya || s.user?.wilaya || '16-Alger';
          const zone       = getZone(wilaya);
          return { ...s, _parsed: { age, anciennete, zone, wilaya, montant: s.montant || 0 } };
        });
        setSinistres(enrichis);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filtrage ──
  const sins = sinistres.filter(s => {
    if (filtre === 'valides')   return s.statut === 'TRAITE';
    if (filtre === 'en_cours')  return s.statut === 'EN_COURS';
    if (filtre === 'refuses')   return s.statut === 'REFUSE';
    return true;
  });

  // ── Stats âge ──
  const ageMoins35 = sins.filter(s => s._parsed.age < 35).length;
  const agePlus35  = sins.filter(s => s._parsed.age >= 35).length;

  // ── Stats véhicule ──
  const vehMoins5  = sins.filter(s => s._parsed.anciennete < 5).length;
  const vehPlus5   = sins.filter(s => s._parsed.anciennete >= 5).length;

  // ── Stats zone ──
  const zones = ['Nord', 'Est', 'Ouest', 'Sud'];
  const zoneStats = zones.map(z => ({
    zone: z,
    count:   sins.filter(s => s._parsed.zone === z).length,
    montant: sins.filter(s => s._parsed.zone === z).reduce((acc, s) => acc + (s._parsed.montant || 0), 0),
  }));
  const topZone = [...zoneStats].sort((a, b) => b.count - a.count)[0];

  // ── KPIs ──
  const tauxJeunes   = sins.length > 0 ? Math.round((ageMoins35 / sins.length) * 100) : 0;
  const tauxAnciens  = sins.length > 0 ? Math.round((vehMoins5  / sins.length) * 100) : 0;
  const maxZoneCount = Math.max(...zoneStats.map(z => z.count), 1);

  // ── Données donut ──
  const donutAge  = [
    { label: '— 35 ans', value: ageMoins35, color: '#E24B4A' },
    { label: '+ 35 ans', value: agePlus35,  color: '#378ADD' },
  ];
  const donutVeh  = [
    { label: '— 5 ans',  value: vehMoins5,  color: '#E24B4A' },
    { label: '+ 5 ans',  value: vehPlus5,   color: '#378ADD' },
  ];
  const donutZone = [
    { label: 'Nord',   value: zoneStats[0]?.count || 0, color: '#E24B4A' },
    { label: 'Est',    value: zoneStats[1]?.count || 0, color: '#378ADD' },
    { label: 'Ouest',  value: zoneStats[2]?.count || 0, color: '#EF9F27' },
    { label: 'Sud',    value: zoneStats[3]?.count || 0, color: '#1D9E75' },
  ];

  if (loading) return (
    <div className="p-16 text-center">
      <p className="text-slate-400 font-black uppercase animate-pulse">Analyse des données en cours…</p>
    </div>
  );

  return (
    <div className="p-8 space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Tableau <span className="text-orange-500">Analytique</span>
          </h1>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
            Analyse des sinistres · Âge · Véhicule · Zone — données pour l'IA
          </p>
        </div>
        {/* Filtres */}
        <div className="flex gap-2">
          {[
            { key: 'tous',      label: 'Tous'       },
            { key: 'valides',   label: 'Validés'    },
            { key: 'en_cours',  label: 'En cours'   },
            { key: 'refuses',   label: 'Refusés'    },
          ].map(f => (
            <button key={f.key} onClick={() => setFiltre(f.key)}
              className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filtre === f.key ? 'bg-orange-500 text-white' : 'bg-white border-2 border-slate-200 text-slate-500 hover:border-orange-300'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total analysés"   value={sins.length}           sub="sinistres"             color="slate" />
        <KpiCard label="Conducteurs — 35" value={`${tauxJeunes}%`}      sub={`${ageMoins35} sinistres`} color="red"   />
        <KpiCard label="Véhicules — 5 ans" value={`${tauxAnciens}%`}   sub={`${vehMoins5} sinistres`}  color="amber" />
        <KpiCard label="Zone à risque"    value={topZone?.zone || '—'}  sub={`${topZone?.count || 0} sinistres`} color="blue" />
      </div>

      {/* ── CRITÈRE 1 — ÂGE ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">
            🧑 Critère 1 — Âge du conducteur
          </h3>
          <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-red-100 text-red-700">
            Seuil : 35 ans
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-bold mb-5">Les conducteurs de moins de 35 ans sont-ils plus accidentogènes ?</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Donut */}
          <div className="flex flex-col items-center gap-3">
            <DonutChart data={donutAge} size={160} />
            <div className="flex gap-4">
              {donutAge.map(d => (
                <div key={d.label} className="flex items-center gap-1.5">
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{d.label} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Barres détail */}
          <div className="md:col-span-2 space-y-4">
            <BarGroup
              label="Répartition globale"
              a={ageMoins35} b={agePlus35}
              labelA="— 35 ans" labelB="+ 35 ans"
              colorA="#E24B4A" colorB="#378ADD"
              maxVal={Math.max(ageMoins35, agePlus35, 1)}
            />
            {/* Détail par zone */}
            {zones.map(z => {
              const a = sins.filter(s => s._parsed.zone === z && s._parsed.age < 35).length;
              const b = sins.filter(s => s._parsed.zone === z && s._parsed.age >= 35).length;
              return (
                <BarGroup key={z}
                  label={`Zone ${z}`}
                  a={a} b={b}
                  labelA="— 35 ans" labelB="+ 35 ans"
                  colorA="#E24B4A" colorB="#378ADD"
                  maxVal={Math.max(ageMoins35, agePlus35, 1)}
                />
              );
            })}
          </div>
        </div>

        {/* Insight */}
        <div className={`mt-5 p-4 rounded-2xl border-2 ${ageMoins35 > agePlus35 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">💡 Insight IA</p>
          <p className="text-sm font-bold text-slate-700">
            {ageMoins35 > agePlus35
              ? `Les conducteurs de moins de 35 ans représentent ${tauxJeunes}% des sinistres. → Suggère une majoration tarifaire pour cette tranche.`
              : ageMoins35 === agePlus35
              ? `Répartition égale entre les deux tranches. → Pas de différenciation tarifaire significative recommandée.`
              : `Les conducteurs de 35 ans et plus représentent ${100 - tauxJeunes}% des sinistres. → Étudier les causes (fatigue, longues distances ?).`
            }
          </p>
        </div>
      </div>

      {/* ── CRITÈRE 2 — ANCIENNETÉ VÉHICULE ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">
            🚗 Critère 2 — Ancienneté du véhicule
          </h3>
          <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
            Seuil : 5 ans
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-bold mb-5">Les véhicules récents (— 5 ans) sont-ils plus ou moins sujets aux sinistres ?</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col items-center gap-3">
            <DonutChart data={donutVeh} size={160} />
            <div className="flex gap-4">
              {donutVeh.map(d => (
                <div key={d.label} className="flex items-center gap-1.5">
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{d.label} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <BarGroup
              label="Répartition globale"
              a={vehMoins5} b={vehPlus5}
              labelA="— 5 ans" labelB="+ 5 ans"
              colorA="#E24B4A" colorB="#378ADD"
              maxVal={Math.max(vehMoins5, vehPlus5, 1)}
            />
            {zones.map(z => {
              const a = sins.filter(s => s._parsed.zone === z && s._parsed.anciennete < 5).length;
              const b = sins.filter(s => s._parsed.zone === z && s._parsed.anciennete >= 5).length;
              return (
                <BarGroup key={z}
                  label={`Zone ${z}`}
                  a={a} b={b}
                  labelA="— 5 ans" labelB="+ 5 ans"
                  colorA="#E24B4A" colorB="#378ADD"
                  maxVal={Math.max(vehMoins5, vehPlus5, 1)}
                />
              );
            })}
          </div>
        </div>

        <div className={`mt-5 p-4 rounded-2xl border-2 ${vehMoins5 > vehPlus5 ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">💡 Insight IA</p>
          <p className="text-sm font-bold text-slate-700">
            {vehMoins5 > vehPlus5
              ? `Les véhicules récents (— 5 ans) concentrent ${tauxAnciens}% des sinistres. → Valeur vénale élevée = coûts de réparation plus importants. Envisager une garantie "tous risques" obligatoire.`
              : vehMoins5 === vehPlus5
              ? `Répartition équilibrée. → Les deux catégories présentent un risque similaire.`
              : `Les véhicules anciens (+ 5 ans) sont plus sujets aux sinistres. → Suggère un contrôle technique renforcé ou une majoration pour les véhicules vieillissants.`
            }
          </p>
        </div>
      </div>

      {/* ── CRITÈRE 3 — ZONE GÉOGRAPHIQUE ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">
            📍 Critère 3 — Zone géographique
          </h3>
          <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
            Nord · Est · Ouest · Sud
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-bold mb-5">Quelle zone concentre le plus de sinistres et de remboursements ?</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center gap-3">
            <DonutChart data={donutZone} size={180} />
            <div className="grid grid-cols-2 gap-2 w-full">
              {donutZone.map(d => (
                <div key={d.label} className="flex items-center gap-1.5">
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{d.label} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {zoneStats.map(z => {
              const pct = sins.length > 0 ? Math.round((z.count / sins.length) * 100) : 0;
              const colors = { Nord: '#E24B4A', Est: '#378ADD', Ouest: '#EF9F27', Sud: '#1D9E75' };
              const color = colors[z.zone] || '#94a3b8';
              return (
                <div key={z.zone}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Zone {z.zone}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{z.count} sinistres</span>
                      <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 8 }}>{fmt(z.montant)} DZD</span>
                    </div>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 p-4 rounded-2xl border-2 bg-blue-50 border-blue-200">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">💡 Insight IA</p>
          <p className="text-sm font-bold text-slate-700">
            {topZone && topZone.count > 0
              ? `La zone ${topZone.zone} concentre le plus de sinistres (${topZone.count}). → Priorité d'ouverture d'agence et de renforcement de couverture dans cette région.`
              : 'Pas encore assez de données pour établir une zone prioritaire.'
            }
          </p>
        </div>
      </div>

      {/* ── MATRICE COMBINÉE ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 mb-1">
          🔢 Matrice de risque combinée
        </h3>
        <p className="text-[10px] text-slate-400 font-bold mb-5">
          Croisement des 3 critères — profil le plus à risque par zone
        </p>
        <MatriceRisque data={sins} />
      </div>

      {/* ── BANNIÈRE IA ── */}
      <div style={{ background: '#0b1120', borderRadius: 20, padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.1)', top: -60, right: -40, pointerEvents: 'none' }} />
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#10b981', margin: '0 0 8px' }}>
          Données prêtes pour l'IA
        </p>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', margin: '0 0 12px', lineHeight: 1.3 }}>
          Ces 3 critères alimenteront le modèle IA
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: '🧑', label: 'Formules tarifaires', desc: 'Tarifs adaptés selon âge + zone + ancienneté véhicule' },
            { icon: '🏢', label: 'Ouverture d\'agences', desc: 'Zones prioritaires identifiées par concentration de sinistres' },
            { icon: '📋', label: 'Nouvelles garanties', desc: 'Formules ciblées pour les profils les plus exposés' },
          ].map(item => (
            <div key={item.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 16, margin: '0 0 4px' }}>{item.icon}</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default VueAnalytique;