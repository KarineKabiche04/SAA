import React, { useState, useMemo } from 'react';

const DashboardAdmin = ({ dossiers, onLogout }) => {
  const [view, setView] = useState('stats'); // 'stats' ou 'admins'
  const [admins, setAdmins] = useState(['admin@saa.dz', 'manager@saa.dz']);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // --- LOGIQUE D'ANALYSE (Aide à la décision) ---
  const stats = useMemo(() => {
    const total = dossiers.length;
    if (total === 0) return null;

    const parSexe = { H: 0, F: 0 };
    const parAge = { jeune: 0, senior: 0, adulte: 0 };
    const parRegion = {};

    dossiers.forEach(d => {
      // Sexe
      parSexe[d.sexe]++;
      
      // Âge
      const age = parseInt(d.age);
      if (age < 25) parAge.jeune++;
      else if (age > 60) parAge.senior++;
      else parAge.adulte++;

      // Région (Wilaya)
      const w = d.wilaya;
      parRegion[w] = (parRegion[w] || 0) + 1;
    });

    return { total, parSexe, parAge, parRegion };
  }, [dossiers]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex italic font-sans">
      
      {/* SIDEBAR TECHNIQUE */}
      <div className="w-80 bg-[#0f172a] text-white p-8 flex flex-col shadow-2xl">
        <div className="bg-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black mb-10 shadow-lg shadow-orange-500/20">SAA</div>
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-10">Admin Terminal v1.0</h2>
        
        <nav className="space-y-4 flex-1">
          <button onClick={() => setView('stats')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'stats' ? 'bg-orange-500 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
            📊 Statistiques Risques
          </button>
          <button onClick={() => setView('admins')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'admins' ? 'bg-orange-500 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
            👥 Gestion Admins
          </button>
        </nav>

        <button onClick={onLogout} className="mt-auto p-5 text-slate-500 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-all">
          Déconnexion 
        </button>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 p-12 overflow-y-auto">
        
        {view === 'stats' ? (
          <div className="space-y-10 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">Aide à la <span className="text-orange-500">Décision</span></h1>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Analyse des sinistres et segmentation client</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Dossiers</span>
                <span className="text-3xl font-black italic">{stats?.total || 0}</span>
              </div>
            </header>

            {!stats ? (
              <div className="p-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-200 text-center text-slate-400 font-black uppercase italic">
                Aucune donnée à analyser pour le moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* CARTE SEXE */}
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border-b-8 border-blue-500">
                  <h3 className="font-black uppercase text-[11px] text-slate-400 mb-8 tracking-widest">Répartition par Sexe</h3>
                  <div className="space-y-6">
                    <StatBar label="Hommes" count={stats.parSexe.H} total={stats.total} color="bg-blue-500" />
                    <StatBar label="Femmes" count={stats.parSexe.F} total={stats.total} color="bg-pink-500" />
                  </div>
                </div>

                {/* CARTE ÂGE */}
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border-b-8 border-orange-500">
                  <h3 className="font-black uppercase text-[11px] text-slate-400 mb-8 tracking-widest">Segmentation Âge</h3>
                  <div className="space-y-6">
                    <StatBar label="< 25 ans (Risque)" count={stats.parAge.jeune} total={stats.total} color="bg-red-500" />
                    <StatBar label="25 - 60 ans" count={stats.parAge.adulte} total={stats.total} color="bg-orange-500" />
                    <StatBar label="+ 60 ans" count={stats.parAge.senior} total={stats.total} color="bg-emerald-500" />
                  </div>
                </div>

                {/* CARTE AIDE À LA DÉCISION (LE COEUR DU M2) */}
                <div className="bg-[#0f172a] p-10 rounded-[3rem] shadow-xl text-white">
                  <h3 className="font-black uppercase text-[11px] text-orange-400 mb-8 tracking-widest">Recommandation Prix</h3>
                  <div className="space-y-4">
                    {stats.parAge.jeune > stats.total * 0.3 && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px]">
                        ⚠️ <span className="font-black">ALERTE :</span> Taux de jeunes conducteurs élevé. Augmenter le coefficient de 1.5 à 1.7.
                      </div>
                    )}
                    {stats.parSexe.F > stats.parSexe.H && (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px]">
                        ✅ <span className="font-black">OPTIMISATION :</span> Profils féminins dominants. Possibilité de baisser la prime de 5% pour être plus compétitif.
                      </div>
                    )}
                    <div className="pt-6">
                      <p className="text-[9px] text-slate-500 uppercase font-black italic">Basé sur l'algorithme SAA-ORASS Decision Tree v4</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        ) : (
          /* VUE GESTION ADMINS */
          <div className="max-w-2xl animate-in slide-in-from-left duration-500">
            <h2 className="text-4xl font-black italic mb-10">Gestion des <span className="text-orange-500">Admins</span></h2>
            <div className="bg-white p-10 rounded-[3rem] shadow-xl">
              <div className="flex gap-4 mb-10">
                <input 
                  type="email" 
                  placeholder="Email du nouvel admin..." 
                  className="flex-1 p-5 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 font-bold"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
                <button 
                  onClick={() => { if(newAdminEmail) { setAdmins([...admins, newAdminEmail]); setNewAdminEmail(''); }}}
                  className="bg-orange-500 text-white px-8 rounded-2xl font-black uppercase text-[10px]"
                >Ajouter</button>
              </div>
              <div className="space-y-4">
                {admins.map((email, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl">
                    <span className="font-bold text-slate-700">{email}</span>
                    <span className="text-[9px] bg-slate-200 px-3 py-1 rounded-full font-black uppercase">Accès Total</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- PETIT COMPOSANT BARRE DE STAT ---
const StatBar = ({ label, count, total, color }) => {
  const percent = total > 0 ? (count / total * 100).toFixed(0) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase italic">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900">{count} ({percent}%)</span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default DashboardAdmin;