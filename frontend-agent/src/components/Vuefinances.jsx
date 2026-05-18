import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:3001/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const fmt      = n => Number(n || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = n => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)} K`;
  return fmt(n);
};

// ─── CAMEMBERT SVG ────────────────────────────────────────────────────────────
const PieChart = ({ data, title, total, size = 200 }) => {
  const [hovered, setHovered] = useState(null);
  const cx = size / 2, cy = size / 2, r = size * 0.38, rInner = size * 0.22;

  let cumul = 0;
  const sectors = data.filter(d => d.value > 0).map(d => {
    const pct = total > 0 ? d.value / total : 0;
    const start = cumul; cumul += pct;
    return { ...d, pct, start, end: cumul };
  });

  const toXY = (pct, radius) => {
    const angle = pct * 2 * Math.PI - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const sectorPath = (start, end, isHovered) => {
    if (end - start >= 1) return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
    const ro = isHovered ? r + 8 : r;
    const p1 = toXY(start, ro), p2 = toXY(end, ro);
    const p3 = toXY(end, rInner), p4 = toXY(start, rInner);
    const lg = end - start > 0.5 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${ro} ${ro} 0 ${lg} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${lg} 0 ${p4.x} ${p4.y} Z`;
  };

  const hd = hovered !== null ? sectors[hovered] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', margin: 0 }}>{title}</p>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {sectors.map((s, i) => (
            <path key={i} d={sectorPath(s.start, s.end, hovered === i)}
              fill={s.color} stroke="white" strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
          ))}
          <text x={cx} y={cy - 8}  textAnchor="middle" fontSize="11" fontWeight="800" fill="#1e293b">
            {hd ? `${(hd.pct * 100).toFixed(1)}%` : 'Total'}
          </text>
          <text x={cx} y={cy + 8}  textAnchor="middle" fontSize="9"  fontWeight="700" fill={hd?.color || '#94a3b8'}>
            {hd ? hd.label : fmtShort(total)}
          </text>
          <text x={cx} y={cy + 22} textAnchor="middle" fontSize="8"  fontWeight="600" fill="#94a3b8">
            {hd ? `${fmtShort(hd.value)} DZD` : 'DZD'}
          </text>
        </svg>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sectors.map((s, i) => (
          <div key={i}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 10, cursor: 'pointer', background: hovered === i ? '#f1f5f9' : 'transparent', transition: 'all 0.15s' }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#475569' }}>{s.label}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#1e293b', margin: 0 }}>{fmtShort(s.value)} DZD</p>
              <p style={{ fontSize: 8,  fontWeight: 600, color: '#94a3b8', margin: 0 }}>{(s.pct * 100).toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── GAUGE BAR ────────────────────────────────────────────────────────────────
const GaugeBar = ({ label, value, total, color, icon }) => {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>{label}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{fmtShort(value)}</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', marginLeft: 4 }}>DZD · {pct}%</span>
        </div>
      </div>
      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 100, background: color, transition: 'width 0.7s ease' }} />
      </div>
    </div>
  );
};

// ─── VUE FINANCES ─────────────────────────────────────────────────────────────
const VueFinances = () => {
  const [polices,   setPolices]   = useState([]);
  const [sinistres, setSinistres] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [periode, setPeriode] = useState('tout'); // ← garde 'tout' par défaut

  const fetchData = useCallback(async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        fetch(`${API}/polices/all`,   { headers: authHeaders() }),
        fetch(`${API}/sinistres/all`, { headers: authHeaders() }),
      ]);
      const pData = await pRes.json();
      const sData = await sRes.json();
      if (Array.isArray(pData)) setPolices(pData);
      if (Array.isArray(sData)) setSinistres(sData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filtre période ──
  const now = new Date();
  const filtre = (dateStr) => {
    if (periode === 'tout') return true;
    const d = new Date(dateStr);
    if (periode === 'mois')  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (periode === 'annee') return d.getFullYear() === now.getFullYear();
    return true;
  };

  // ── Calculs ──
  const policesPayees   = polices.filter(p => p.statut === 'PAYEE'  && filtre(p.updatedAt));
  const policesEmises   = polices.filter(p => p.statut === 'EMISE'  && filtre(p.createdAt));
  const policesExpirees = polices.filter(p => p.statut !== 'PAYEE'  && p.statut !== 'EMISE');

  const primesTotales   = policesPayees.reduce((s, p) => s + (p.vehicule?.prime || p.primeNette || p.montantTotal || 0), 0);
  const primesEnAttente = policesEmises.reduce((s, p) => s + (p.vehicule?.prime || p.primeNette || p.montantTotal || 0), 0);

  const sinistresValides = sinistres.filter(s => s.statut === 'TRAITE'   && filtre(s.updatedAt));
  const sinistresEnCours = sinistres.filter(s => s.statut === 'EN_COURS');
  const sinistresRefuses = sinistres.filter(s => s.statut === 'REFUSE');

  const totalRembourses   = sinistresValides.reduce((s, sin) => s + (sin.montant || 0), 0);
  const soldeNet          = primesTotales - totalRembourses;
  const tauxSinistralite  = primesTotales > 0 ? ((totalRembourses / primesTotales) * 100).toFixed(1) : '0.0';
  const pctSante          = primesTotales > 0 ? Math.min(100, Math.round((soldeNet / primesTotales) * 100)) : 0;

  // ── Camemberts ──
  const pieFinancier    = [
  { label: 'Primes encaissées', value: primesTotales,   color: '#10b981' },
  { label: 'Remboursements',    value: totalRembourses, color: '#ef4444' },
];
  const piePortefeuille = [
    { label: 'Payées',        value: policesPayees.length,   color: '#10b981' },
    { label: 'Non payées',    value: policesEmises.length,   color: '#f59e0b' },
    { label: 'Expirées',      value: policesExpirees.length, color: '#64748b' },
  ];
  const pieSinistres    = [
    { label: 'En cours', value: sinistresEnCours.length, color: '#f59e0b' },
    { label: 'Validés',  value: sinistresValides.length, color: '#10b981' },
    { label: 'Refusés',  value: sinistresRefuses.length, color: '#ef4444' },
  ];

  const sante = parseFloat(tauxSinistralite) < 20 ? '✅ Excellente santé' : parseFloat(tauxSinistralite) < 40 ? '🟡 Santé correcte' : '🔴 Attention requise';

  if (loading) return (
    <div className="p-16 text-center">
      <p className="text-slate-400 font-black uppercase animate-pulse">Chargement des données financières…</p>
    </div>
  );

  return (
    <div className="p-8 space-y-6">

      {/* ── EN-TÊTE ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Tableau <span className="text-orange-500">Financier</span>
          </h1>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
            Capital · Primes · Remboursements · Solde
          </p>
        </div>
        <div className="flex gap-2">
          {[{ key:'tout', label:'Tout' }, { key:'annee', label:'Cette année' }, { key:'mois', label:'Ce mois' }].map(p => (
            <button key={p.key} onClick={() => setPeriode(p.key)}
              className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${periode === p.key ? 'bg-orange-500 text-white' : 'bg-white border-2 border-slate-200 text-slate-500 hover:border-orange-300'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── HERO SOLDE ── */}
      <div style={{
        background: '#0b1120',
        borderRadius: 24,
        padding: '2.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Cercles décoratifs */}
        <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', border:'1px solid rgba(16,185,129,0.12)', top:-80, left:-60, pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', border:'1px solid rgba(16,185,129,0.08)', bottom:-60, right:-40, pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:120, height:120, borderRadius:'50%', border:'1px solid rgba(16,185,129,0.15)', top:20, right:60, pointerEvents:'none' }} />

        {/* Label */}
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#10b981', margin:'0 0 1rem', position:'relative' }}>
          Solde Net Disponible — SAA
        </p>

        {/* Grand chiffre */}
        <div style={{ position:'relative', marginBottom:'1.5rem' }}>
          <span style={{ fontSize:60, fontWeight:700, color:'#ffffff', letterSpacing:'-2px', lineHeight:1 }}>
            {fmtShort(soldeNet)}
          </span>
          <span style={{ fontSize:20, fontWeight:500, color:'rgba(255,255,255,0.4)', marginLeft:8, verticalAlign:'bottom', lineHeight:3 }}>DZD</span>
        </div>

        {/* Barre santé */}
        <div style={{ maxWidth:480, margin:'0 auto 2rem', position:'relative' }}>
          <div style={{ height:8, background:'rgba(255,255,255,0.08)', borderRadius:100, overflow:'hidden' }}>
            <div style={{ width:`${pctSante}%`, height:'100%', background:'linear-gradient(to right, #10b981, #34d399)', borderRadius:100, transition:'width 1s ease' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>0 DZD</span>
            <span style={{ fontSize:11, color:'#6ee7b7', fontWeight:700 }}>{pctSante}% — {sante}</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{fmtShort(primesTotales)}</span>
          </div>
        </div>

        {/* 3 métriques */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1px 1fr 1px 1fr', maxWidth:560, margin:'0 auto' }}>
          <div style={{ padding:'0 1rem' }}>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Primes</p>
            <p style={{ fontSize:22, fontWeight:700, color:'#6ee7b7', margin:0 }}>+{fmtShort(primesTotales)}</p>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)', margin:'2px 0 0' }}>DZD encaissés</p>
          </div>
          <div style={{ background:'rgba(255,255,255,0.08)' }} />
          <div style={{ padding:'0 1rem' }}>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Remboursements</p>
            <p style={{ fontSize:22, fontWeight:700, color:'#fca5a5', margin:0 }}>−{fmtShort(totalRembourses)}</p>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)', margin:'2px 0 0' }}>DZD décaissés</p>
          </div>
          <div style={{ background:'rgba(255,255,255,0.08)' }} />
          <div style={{ padding:'0 1rem' }}>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Sinistralité</p>
            <p style={{ fontSize:22, fontWeight:700, color:'#fcd34d', margin:0 }}>{tauxSinistralite}%</p>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)', margin:'2px 0 0' }}>taux actuel</p>
          </div>
        </div>
      </div>

      {/* ── 3 KPI CARDS ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Polices payées',    value:policesPayees.length,    color:'#10b981' },
          { label:'Sinistres validés', value:sinistresValides.length, color:'#ef4444' },
          { label:'Primes en attente', value:policesEmises.length,    color:'#f59e0b' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{k.label}</p>
            <p style={{ fontSize:28, fontWeight:800, color:k.color, margin:0, lineHeight:1 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* ── JAUGES ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Répartition du Capital</h3>
        <GaugeBar icon="✅" label="Primes encaissées"  value={primesTotales}         total={primesTotales + primesEnAttente} color="#10b981" />
        <GaugeBar icon="⏳" label="Primes en attente"  value={primesEnAttente}        total={primesTotales + primesEnAttente} color="#f59e0b" />
        <GaugeBar icon="📤" label="Remboursements"     value={totalRembourses}        total={primesTotales}                   color="#ef4444" />
        <GaugeBar icon="💎" label="Solde disponible"   value={Math.max(0, soldeNet)} total={primesTotales}                   color="#3b82f6" />
      </div>

      {/* ── 3 CAMEMBERTS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <PieChart data={pieFinancier}    title="💰 Capital vs Remboursements" total={Math.max(0, soldeNet) + totalRembourses} size={200} />
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total flux</p>
            <p className="text-xl font-black text-slate-900">{fmtShort(Math.max(0, soldeNet) + totalRembourses)} DZD</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <PieChart data={piePortefeuille} title="📁 Statut du Portefeuille"    total={polices.length}                        size={200} />
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total polices</p>
            <p className="text-xl font-black text-slate-900">{polices.length} police(s)</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <PieChart data={pieSinistres}    title="🚨 Statut des Sinistres"      total={sinistres.length}                      size={200} />
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total sinistres</p>
            <p className="text-xl font-black text-slate-900">{sinistres.length} sinistre(s)</p>
          </div>
        </div>
      </div>

      {/* ── TABLEAU DÉTAIL ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Détail Financier</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-slate-100">
                {['Indicateur','Nombre','Montant (DZD)','Impact'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label:'✅ Primes encaissées',    count:policesPayees.length,    montant:primesTotales,   sign:'+', impact:'green' },
                { label:'⏳ Primes en attente',     count:policesEmises.length,    montant:primesEnAttente, sign:'~', impact:'amber' },
                { label:'🚨 Sinistres remboursés', count:sinistresValides.length, montant:totalRembourses, sign:'−', impact:'red'   },
                { label:'🔄 Sinistres en cours',   count:sinistresEnCours.length, montant:0,               sign:'?', impact:'slate' },
                { label:'❌ Sinistres refusés',    count:sinistresRefuses.length, montant:0,               sign:'0', impact:'slate' },
                { label:'💎 Solde net final',      count:'—',                     montant:soldeNet,        sign:'=', impact: soldeNet >= 0 ? 'green' : 'red' },
              ].map((row, i) => {
                const clr = { green:'text-emerald-600', red:'text-red-600', amber:'text-amber-600', slate:'text-slate-400' };
                const bgClr = { green:'bg-emerald-100 text-emerald-700', red:'bg-red-100 text-red-700', amber:'bg-amber-100 text-amber-700', slate:'bg-slate-100 text-slate-500' };
                const impactLabel = { '+':'Encaissement', '−':'Décaissement', '=':'Solde', '~':'En attente', '?':'En cours', '0':'Neutre' };
                return (
                  <tr key={i} className={`border-b border-slate-50 hover:bg-slate-50 transition-all ${i === 5 ? 'border-t-2 border-slate-200 bg-slate-50 font-black' : ''}`}>
                    <td className="py-3 px-4 font-bold text-slate-800">{row.label}</td>
                    <td className="py-3 px-4 font-black text-slate-600">{row.count}</td>
                    <td className={`py-3 px-4 font-black font-mono ${clr[row.impact]}`}>
                      {row.sign} {fmt(Math.abs(row.montant))}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${bgClr[row.impact]}`}>
                        {impactLabel[row.sign]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-blue-600 text-[10px] font-bold leading-relaxed">
          ℹ️ Capital calculé depuis les polices au statut <strong>PAYÉE</strong>. 
          Remboursements déduits des sinistres au statut <strong>TRAITÉ</strong>.
          Le filtre de période s'applique sur la date de mise à jour des dossiers.
        </p>
      </div>

    </div>
  );
};

export default VueFinances;