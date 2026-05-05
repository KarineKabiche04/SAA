import React, { useState, useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const WILAYAS_EST   = ['05','04','12','25','19','23','21','41','43','24','40','36','06','10'];
const WILAYAS_OUEST = ['13','22','31','29','46','27','20','26','45','48','38','02','44'];
const WILAYAS_SUD   = ['01','03','07','08','11','17','30','32','33','37','39','47','49','50','51','52','53','54','55','56','57','58'];

function getRegion(wilaya) {
  const code = (wilaya || '').split('-')[0].trim().padStart(2, '0');
  if (WILAYAS_SUD.includes(code))   return 'Sud';
  if (WILAYAS_EST.includes(code))   return 'Est';
  if (WILAYAS_OUEST.includes(code)) return 'Ouest';
  return 'Nord';
}

function formatNum(n) {
  return parseFloat(n || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const DashboardAdmin = ({ dossiers = [], onLogout }) => {
  const [view, setView]               = useState('stats');
  const [admins, setAdmins]           = useState(['admin@saa.dz', 'manager@saa.dz']);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterRegion, setFilterRegion] = useState('Toutes');

  // ── CALCUL STATISTIQUES ───────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = dossiers.length;
    if (total === 0) return null;

    const parSexe    = { H: 0, F: 0 };
    const parAge     = { jeune: 0, adulte: 0, senior: 0 };
    const parRegion  = { Nord: 0, Est: 0, Ouest: 0, Sud: 0 };
    const parWilaya  = {};
    const parGenre   = {};
    let primeTotale  = 0;

    dossiers.forEach(d => {
      parSexe[d.sexe === 'F' ? 'F' : 'H']++;

      const age = parseInt(d.age || 30);
      if (age <= 30) parAge.jeune++;
      else if (age <= 60) parAge.adulte++;
      else parAge.senior++;

      const reg = getRegion(d.wilaya);
      parRegion[reg] = (parRegion[reg] || 0) + 1;

      const w = d.wilaya || 'Non renseigné';
      parWilaya[w] = (parWilaya[w] || 0) + 1;

      const gv = d.genreVehicule || 'VP';
      parGenre[gv] = (parGenre[gv] || 0) + 1;

      primeTotale += parseFloat(d.quittance?.totalAPayer || 0);
    });

    return {
      total, parSexe, parAge, parRegion, parWilaya, parGenre,
      primeTotale,
      primeMoyenne: primeTotale / total,
    };
  }, [dossiers]);

  // ── FILTRAGE ──────────────────────────────────────────────────────────────
  const dossiersFiltres = useMemo(() => dossiers.filter(d => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (d.nomAssure || '').toLowerCase().includes(q) ||
      (d.numPolice || '').toLowerCase().includes(q) ||
      (d.immatriculation || '').toLowerCase().includes(q) ||
      (d.wilaya || '').toLowerCase().includes(q);
    const matchRegion = filterRegion === 'Toutes' || getRegion(d.wilaya) === filterRegion;
    return matchSearch && matchRegion;
  }), [dossiers, searchTerm, filterRegion]);

  const handleAddAdmin = () => {
    const email = newAdminEmail.trim();
    if (email && !admins.includes(email)) {
      setAdmins(p => [...p, email]);
      setNewAdminEmail('');
    }
  };

  const navItems = [
    { key: 'stats',    icon: '📊', label: 'Statistiques' },
    { key: 'dossiers', icon: '📁', label: `Dossiers (${dossiers.length})` },
    { key: 'admins',   icon: '👥', label: 'Gestion Admins' },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex font-sans">

      {/* ════════════════ SIDEBAR ════════════════ */}
      <aside className="w-64 bg-[#0b1120] text-white flex flex-col shadow-2xl shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg">
              SAA
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none">Admin Panel</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">ORASS v2.0</p>
            </div>
          </div>
        </div>

        <nav className="p-4 flex-1 space-y-1">
          {navItems.map(item => (
            <button key={item.key} onClick={() => setView(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-[11px] font-black uppercase tracking-widest ${
                view === item.key ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {stats && (
          <div className="p-4 border-t border-white/5 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Aperçu rapide</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Dossiers', value: stats.total,                                                    color: 'text-orange-400' },
                { label: 'Hommes',   value: `${Math.round(stats.parSexe.H / stats.total * 100)}%`,         color: 'text-blue-400'   },
                { label: 'Femmes',   value: `${Math.round(stats.parSexe.F / stats.total * 100)}%`,         color: 'text-pink-400'   },
                { label: '18-30',    value: `${Math.round(stats.parAge.jeune / stats.total * 100)}%`,      color: 'text-red-400'    },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/5 rounded-xl p-2 text-center">
                  <p className={`text-sm font-black ${color}`}>{value}</p>
                  <p className="text-[8px] font-bold text-slate-600 uppercase">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onLogout}
          className="m-4 p-3 border border-white/10 rounded-xl text-slate-500 hover:text-red-400 hover:border-red-400/30 font-black text-[10px] uppercase tracking-widest transition-all text-center">
          ← Déconnexion
        </button>
      </aside>

      {/* ════════════════ CONTENU ════════════════ */}
      <main className="flex-1 overflow-y-auto">

        {/* ─────────── STATISTIQUES ─────────── */}
        {view === 'stats' && (
          <div className="p-8 space-y-8">
            <header className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                  Aide à la <span className="text-orange-500">Décision</span>
                </h1>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                  Analyse des risques · Segmentation client · SAA-ORASS Decision Tree v4
                </p>
              </div>
              <div className="bg-white px-8 py-4 rounded-2xl shadow border border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total dossiers</p>
                <p className="text-5xl font-black text-slate-900">{stats?.total ?? 0}</p>
              </div>
            </header>

            {!stats ? <EmptyState /> : (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KpiCard icon="💰" label="Prime Totale"   value={`${formatNum(stats.primeTotale)} DZD`}   color="blue"   />
                  <KpiCard icon="📈" label="Prime Moyenne"  value={`${formatNum(stats.primeMoyenne)} DZD`}  color="green"  />
                  <KpiCard icon="👨" label="Conducteurs H"  value={`${stats.parSexe.H} (${Math.round(stats.parSexe.H/stats.total*100)}%)`} color="indigo" />
                  <KpiCard icon="👩" label="Conductrices F" value={`${stats.parSexe.F} (${Math.round(stats.parSexe.F/stats.total*100)}%)`} color="pink"   />
                </div>

                {/* Sexe + Âge */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* SEXE */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <SectionTitle icon="⚤" title="Répartition par Sexe" />
                    <div className="mt-6 space-y-5">
                      <StatBar label="Hommes" count={stats.parSexe.H} total={stats.total} color="bg-blue-500" />
                      <StatBar label="Femmes" count={stats.parSexe.F} total={stats.total} color="bg-pink-500" />
                    </div>
                    <DonutChart h={stats.parSexe.H} total={stats.total} />
                    <AlertCard type={stats.parSexe.F > stats.parSexe.H ? 'success' : 'info'}
                      message={stats.parSexe.F > stats.parSexe.H
                        ? '✅ Profils féminins dominants — prime réductible de 5%'
                        : '📌 Profils masculins dominants — tarification standard'} dark={false} />
                  </div>

                  {/* ÂGE */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <SectionTitle icon="🎂" title="Segmentation par Âge" />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tranches : 18-30 ans · 31-60 ans · +60 ans</p>
                    <div className="mt-5 space-y-5">
                      <StatBar label="18 – 30 ans  (risque élevé)" count={stats.parAge.jeune}  total={stats.total} color="bg-red-500"     />
                      <StatBar label="31 – 60 ans  (standard)"     count={stats.parAge.adulte} total={stats.total} color="bg-orange-400"  />
                      <StatBar label="+ 60 ans  (prudent)"         count={stats.parAge.senior} total={stats.total} color="bg-emerald-500" />
                    </div>
                    <div className={`mt-6 p-4 rounded-2xl border text-[10px] font-bold leading-relaxed ${
                      stats.parAge.jeune > stats.total * 0.3
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-green-50 border-green-100 text-green-700'}`}>
                      {stats.parAge.jeune > stats.total * 0.3
                        ? '⚠️ Taux de jeunes (18-30) > 30% — coefficient majoré 1.7 recommandé'
                        : '✅ Taux de jeunes normal — coefficient standard 1.5 maintenu'}
                    </div>
                  </div>
                </div>

                {/* RÉGIONS */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                  <SectionTitle icon="🗺️" title="Répartition par Région Géographique" />
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'Nord',  color: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100'   },
                      { key: 'Est',   color: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
                      { key: 'Ouest', color: 'bg-teal-500',   bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-100'   },
                      { key: 'Sud',   color: 'bg-amber-500',  bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-100'  },
                    ].map(({ key, color, bg, text, border }) => {
                      const count = stats.parRegion[key] || 0;
                      const pct   = stats.total > 0 ? Math.round(count / stats.total * 100) : 0;
                      return (
                        <div key={key} className={`${bg} ${border} border rounded-2xl p-6 text-center`}>
                          <p className={`text-4xl font-black ${text}`}>{count}</p>
                          <p className={`text-[10px] font-black uppercase ${text} mt-1`}>{key}</p>
                          <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className={`text-[9px] font-black ${text} mt-1`}>{pct}%</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Wilayas */}
                  {Object.keys(stats.parWilaya).length > 0 && (
                    <div className="mt-6">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Détail par Wilaya</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(stats.parWilaya).sort((a, b) => b[1] - a[1]).map(([w, c]) => (
                          <div key={w} className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-xl text-xs">
                            <span className="font-bold text-slate-700 truncate">{w}</span>
                            <span className="font-black text-orange-500 ml-2 shrink-0">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Genre véhicule + Recommandations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <SectionTitle icon="🚗" title="Genre de Véhicule" />
                    <div className="mt-6 space-y-4">
                      {Object.entries(stats.parGenre).sort((a, b) => b[1] - a[1]).map(([genre, count]) => {
                        const cols = { VP:'bg-blue-500', VU:'bg-purple-500', MOTO:'bg-amber-500', TC:'bg-green-500' };
                        return <StatBar key={genre} label={genre} count={count} total={stats.total} color={cols[genre] || 'bg-slate-500'} />;
                      })}
                    </div>
                  </div>

                  <div className="bg-[#0b1120] rounded-3xl p-8 shadow-xl text-white">
                    <SectionTitle icon="🧠" title="Recommandations ORASS" light />
                    <div className="mt-6 space-y-3">
                      {stats.parAge.jeune > stats.total * 0.3 && (
                        <AlertCard type="danger"  message="Taux 18-30 ans > 30% — coefficient 1.7 recommandé sur nouvelles souscriptions." />
                      )}
                      {stats.parSexe.F > stats.parSexe.H && (
                        <AlertCard type="success" message="Majorité de conductrices — réduction de prime 5% applicable." />
                      )}
                      {stats.parRegion.Sud > stats.total * 0.2 && (
                        <AlertCard type="info" message="Présence significative Zone Sud — coefficient 0.80 correctement appliqué." />
                      )}
                      {stats.parAge.jeune <= stats.total * 0.3 && stats.parSexe.F <= stats.parSexe.H && (
                        <AlertCard type="info" message="Profil de risque équilibré — tarification standard recommandée." />
                      )}
                      <p className="text-[9px] text-slate-600 uppercase font-black italic tracking-widest pt-3 border-t border-white/10">
                        SAA-ORASS Decision Tree v4 · Temps réel
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─────────── DOSSIERS ─────────── */}
        {view === 'dossiers' && (
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                  Dossiers <span className="text-orange-500">Clients</span>
                </h1>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                  {dossiersFiltres.length} résultat{dossiersFiltres.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="Rechercher nom, police, immat, wilaya…"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 min-w-[240px] px-5 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-orange-400 transition-all shadow-sm" />
              {['Toutes','Nord','Est','Ouest','Sud'].map(r => (
                <button key={r} onClick={() => setFilterRegion(r)}
                  className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    filterRegion === r ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-orange-300'
                  }`}>
                  {r}
                </button>
              ))}
            </div>

            {dossiers.length === 0 ? <EmptyState /> : dossiersFiltres.length === 0 ? (
              <div className="p-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-black uppercase">Aucun dossier ne correspond.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dossiersFiltres.map((d, i) => (
                  <DossierRow key={i} dossier={d}
                    expanded={selectedIdx === i}
                    onClick={() => setSelectedIdx(selectedIdx === i ? null : i)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────── ADMINS ─────────── */}
        {view === 'admins' && (
          <div className="p-8">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-8">
              Gestion des <span className="text-orange-500">Admins</span>
            </h1>
            <div className="max-w-2xl bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
              <div className="flex gap-3 mb-8">
                <input type="email" placeholder="Email du nouvel admin (@saa.dz)"
                  value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddAdmin()}
                  className="flex-1 px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-orange-500 font-bold text-sm transition-all" />
                <button onClick={handleAddAdmin}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-7 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-md">
                  Ajouter
                </button>
              </div>
              <div className="space-y-3">
                {admins.map((email, i) => (
                  <div key={i} className="flex justify-between items-center px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-sm">
                        {email[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-black uppercase">Accès Total</span>
                      {admins.length > 1 && (
                        <button onClick={() => setAdmins(p => p.filter(a => a !== email))}
                          className="text-slate-300 hover:text-red-500 font-black text-sm transition-all">✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────────────────────

const SectionTitle = ({ icon, title, light }) => (
  <div className="flex items-center gap-2">
    <span className="text-lg">{icon}</span>
    <h2 className={`font-black uppercase tracking-widest text-[11px] ${light ? 'text-orange-400' : 'text-slate-400'}`}>{title}</h2>
  </div>
);

const StatBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? Math.round(count / total * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-black uppercase">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900">{count} · {pct}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const KpiCard = ({ icon, label, value, color }) => {
  const map = {
    blue:   'bg-blue-50   border-blue-100   text-blue-700',
    green:  'bg-green-50  border-green-100  text-green-700',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    pink:   'bg-pink-50   border-pink-100   text-pink-700',
    orange: 'bg-orange-50 border-orange-100 text-orange-700',
  };
  return (
    <div className={`${map[color]} border rounded-2xl p-5`}>
      <div className="flex justify-between items-start">
        <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-base font-black mt-2 leading-tight">{value}</p>
    </div>
  );
};

const DonutChart = ({ h, total }) => {
  if (!total) return null;
  const r = 38, cx = 80, cy = 52, circ = 2 * Math.PI * r;
  const dash = circ * (h / total);
  return (
    <svg width="160" height="104" className="mx-auto mt-4">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fce7f3" strokeWidth="11" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth="11"
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4} strokeLinecap="round" />
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="11" fontWeight="900" fill="#1e293b">
        {Math.round(h / total * 100)}% H
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#94a3b8">
        {Math.round((1 - h / total) * 100)}% F
      </text>
    </svg>
  );
};

const AlertCard = ({ type, message, dark = true }) => {
  const styles = {
    danger:  dark ? 'bg-red-500/10 border-red-500/20 text-red-300'     : 'bg-red-50 border-red-200 text-red-700',
    success: dark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-green-50 border-green-100 text-green-700',
    info:    dark ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'  : 'bg-blue-50 border-blue-100 text-blue-700',
  };
  return (
    <div className={`p-4 border rounded-2xl text-[10px] font-bold leading-relaxed ${styles[type] || styles.info}`}>
      {message}
    </div>
  );
};

const EmptyState = () => (
  <div className="p-20 bg-white rounded-3xl border-4 border-dashed border-slate-200 text-center">
    <p className="text-slate-300 font-black uppercase text-xl">Aucun dossier pour le moment</p>
    <p className="text-slate-300 text-[11px] font-bold uppercase tracking-widest mt-3">
      Les données apparaîtront après les premières souscriptions
    </p>
  </div>
);

const DossierRow = ({ dossier: d, expanded, onClick }) => {
  const region = getRegion(d.wilaya);
  const regionStyle = {
    Nord:   'bg-blue-100   text-blue-700',
    Est:    'bg-purple-100 text-purple-700',
    Ouest:  'bg-teal-100   text-teal-700',
    Sud:    'bg-amber-100  text-amber-700',
    Autres: 'bg-slate-100  text-slate-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button onClick={onClick}
        className="w-full text-left px-6 py-4 flex flex-wrap items-center gap-4 hover:bg-slate-50 transition-all">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${d.sexe === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
          {d.sexe === 'F' ? '♀' : '♂'}
        </div>
        <div className="flex-1 min-w-[140px]">
          <p className="font-black text-slate-900 text-sm">{d.nomAssure || 'Non renseigné'}</p>
          <p className="text-[10px] text-slate-400 font-bold font-mono">{d.numPolice}</p>
        </div>
        <div className="hidden md:block text-[10px] font-bold text-slate-500">
          🚗 {d.marque || 'N/A'} · {d.immatriculation || 'N/A'}
        </div>
        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full shrink-0 ${regionStyle[region]}`}>{region}</span>
        <span className="text-[10px] text-slate-400 font-bold shrink-0 hidden md:block">
          {d.wilaya?.split('-')[1]?.trim() || d.wilaya || '—'}
        </span>
        <div className="text-right shrink-0">
          <p className="font-black text-orange-500 text-sm">{formatNum(d.quittance?.totalAPayer || 0)} DZD</p>
          <p className="text-[9px] text-slate-400 font-bold">Total TTC</p>
        </div>
        <span className={`text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <InfoCell label="Nom complet"     value={d.nomAssure} />
            <InfoCell label="Sexe"            value={d.sexe === 'F' ? 'Femme' : 'Homme'} />
            <InfoCell label="Âge"             value={d.age ? `${d.age} ans` : 'N/A'} />
            <InfoCell label="Profession"      value={d.profession} />
            <InfoCell label="Téléphone"       value={d.telephone} />
            <InfoCell label="Email"           value={d.email} />
            <InfoCell label="Adresse"         value={d.adresse} />
            <InfoCell label="Ville"           value={d.ville} />
            <InfoCell label="Wilaya"          value={d.wilaya} />
            <InfoCell label="Région"          value={region} />
            <InfoCell label="Zone tarifaire"  value={d.zone ? `Zone ${d.zone}` : '—'} />
            <InfoCell label="N° Pièce"        value={d.numPieceIdentite} />
            <InfoCell label="N° Police"       value={d.numPolice} />
            <InfoCell label="Genre véhicule"  value={d.genreVehicule} />
            <InfoCell label="Marque"          value={d.marque} />
            <InfoCell label="Immatriculation" value={d.immatriculation} />
            <InfoCell label="Usage"           value={d.usage} />
            <InfoCell label="Date effet"      value={d.dateEffet} />
            <InfoCell label="Date échéance"   value={d.dateEcheance} />
            <InfoCell label="Réduction"       value={d.reduction} />
            <InfoCell label="Valeur vénale"   value={d.valeurVenale ? `${formatNum(d.valeurVenale)} DZD` : '—'} />
            <InfoCell label="Capital assuré"  value={d.capitalAssure ? `${formatNum(d.capitalAssure)} DZD` : '—'} />
            {d.quittance && <>
              <InfoCell label="Prime nette"   value={`${formatNum(d.quittance.primeNette)} DZD`}       highlight />
              <InfoCell label="Total taxes"   value={`${formatNum(d.quittance.totalTaxes)} DZD`} />
              <InfoCell label="Total TTC"     value={`${formatNum(d.quittance.totalAPayer)} DZD`}      highlight />
              <InfoCell label="Commissions"   value={`${formatNum(d.quittance.totalCommissions)} DZD`} />
            </>}
          </div>
          {d.garanties && (
            <div className="mt-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Garanties souscrites</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(d.garanties).filter(([, v]) => v).map(([k]) => (
                  <span key={k} className="bg-blue-100 text-blue-700 text-[9px] font-black uppercase px-3 py-1 rounded-full">{k.toUpperCase()}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InfoCell = ({ label, value, highlight }) => (
  <div>
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className={`font-bold mt-0.5 text-sm truncate ${highlight ? 'text-orange-500' : 'text-slate-800'}`}>
      {value || '—'}
    </p>
  </div>
);

export default DashboardAdmin;
