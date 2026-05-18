import React, { useState, useEffect, useCallback } from "react";

const API = 'http://localhost:3001/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});
const fmt = n => Number(n || 0).toLocaleString("fr-DZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function getJoursRestants(d) {
  if (!d) return 0;
  return Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000));
}
function getStatutCalcule(d) {
  const j = getJoursRestants(d);
  if (j <= 0)  return "EXPIRÉE";
  if (j <= 30) return "EXPIRE BIENTÔT";
  return "EN COURS";
}
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString('fr-DZ');
}

const STATUT_SINISTRE = {
  EN_COURS: { label: 'En cours',  color: 'amber' },
  TRAITE:   { label: 'Validé ✅', color: 'green' },
  REFUSE:   { label: 'Refusé ❌', color: 'red'   },
};

const GARANTIES_DISPO = [
  { key:'rc',  label:'RC — Responsabilité Civile',   required:true,  prime:0    },
  { key:'dr',  label:'DR — Défense et Recours',      required:true,  prime:0    },
  { key:'bdg', label:'BDG — Bris de Glace',          required:false, prime:4500 },
  { key:'vol', label:'VOL — Vol',                    required:false, prime:8000 },
  { key:'inc', label:'INC — Incendie',               required:false, prime:4000 },
  { key:'dc',  label:'DC — Dommages Collision',      required:false, prime:12000},
  { key:'pt',  label:'PT — Personnes Transportées',  required:false, prime:1250 },
  { key:'ir',  label:'IR — Individuelle Conducteur', required:false, prime:2800 },
  { key:'tc',  label:'TC — Tous Chocs',              required:false, prime:3500 },
];

const DUREES_DISPO = [
  { mois:3,  label:'3 mois',  coef:0.30, desc:'Couverture trimestrielle' },
  { mois:6,  label:'6 mois',  coef:0.55, desc:'Couverture semestrielle'  },
  { mois:12, label:'12 mois', coef:1.00, desc:'Couverture annuelle ★'    },
];

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ children, color = "slate" }) => {
  const c = {
    green: "bg-emerald-100 text-emerald-800", red:   "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-800",     blue:  "bg-blue-100 text-blue-800",
    slate: "bg-slate-100 text-slate-600",     orange:"bg-orange-100 text-orange-700",
  };
  return <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${c[color]||c.slate}`}>{children}</span>;
};

// ─── MODAL MESSAGERIE ─────────────────────────────────────────────────────────
const ModalMessagerie = ({ onClose }) => {
  const [conv, setConv]   = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchConv = useCallback(async () => {
    try {
      const r = await fetch(`${API}/messages/ma-conversation`, { headers: authHeaders() });
      setConv(await r.json());
    } catch(e){console.error(e);}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchConv(); const p = setInterval(fetchConv, 5000); return ()=>clearInterval(p); }, [fetchConv]);

  const send = async () => {
    if (!input.trim() || !conv) return;
    const txt = input.trim(); setInput("");
    try {
      await fetch(`${API}/messages/envoyer`, { method:'POST', headers:authHeaders(),
        body: JSON.stringify({ conversationId:conv.id, contenu:txt, expediteur:'client' }) });
      fetchConv();
    } catch(e){console.error(e);}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{maxHeight:"85vh"}}>
        <div className="bg-slate-900 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-black">S</div>
            <div>
              <p className="text-white font-black text-sm">SAA — Support Client</p>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/><p className="text-emerald-400 text-[9px] font-bold">En ligne</p></div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-400 font-black text-xs px-3 py-1.5 rounded-lg">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {loading ? <p className="text-center text-slate-400 text-xs animate-pulse">Chargement…</p>
          : (conv?.messages||[]).length===0
            ? <div className="text-center py-8"><p className="text-slate-300 text-3xl mb-2">💬</p><p className="text-slate-400 text-xs font-bold">Envoyez un message à votre agent SAA</p></div>
            : (conv?.messages||[]).map(msg=>(
              <div key={msg.id} className={`flex ${msg.expediteur==="client"?"justify-end":"justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.expediteur==="client"?"bg-orange-500 text-white":"bg-white border border-slate-200 text-slate-800 shadow-sm"}`}>
                  <p className="text-sm font-semibold leading-relaxed">{msg.contenu}</p>
                  <p className={`text-[9px] font-bold mt-1 ${msg.expediteur==="client"?"text-orange-200":"text-slate-400"}`}>{new Date(msg.createdAt).toLocaleString('fr-DZ')}</p>
                </div>
              </div>
            ))}
        </div>
        <div className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Votre message…"
            className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-orange-400 transition-all"/>
          <button onClick={send} className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black transition-all active:scale-95">➤</button>
        </div>
      </div>
    </div>
  );
};

// ─── MODAL RENOUVELLEMENT — 3 étapes ─────────────────────────────────────────
const ModalRenouveler = ({ police, onClose, onSuccess }) => {
  const [step,   setStep]   = useState(1);
  const [duree,  setDuree]  = useState(12);
  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  const garantiesInitiales = () => {
    const actives = Array.isArray(police.garanties)
      ? police.garanties.map(g => g.toLowerCase())
      : (police.garanties||'').toLowerCase().split(',');
    return Object.fromEntries(GARANTIES_DISPO.map(g => [g.key, g.required || actives.includes(g.key)]));
  };
  const [garanties, setGaranties] = useState(garantiesInitiales);

  const dureeConf    = DUREES_DISPO.find(d => d.mois === duree) || DUREES_DISPO[2];
  const primeBase    = police.prime || 0;
  const primeOptions = GARANTIES_DISPO.filter(g => !g.required && garanties[g.key]).reduce((s,g) => s + g.prime, 0);
  const primeCalc    = ((primeBase + primeOptions) * dureeConf.coef);
  const primeAffich  = fmt(primeCalc.toFixed(2));

  const calcEcheance = () => {
    const base = new Date(police.dateEcheance) > new Date() ? new Date(police.dateEcheance) : new Date();
    base.setMonth(base.getMonth() + duree);
    return base.toLocaleDateString('fr-DZ');
  };

  const garantiesStr = Object.entries(garanties).filter(([,v])=>v).map(([k])=>k.toUpperCase()).join(',');

  const handleConfirmer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/polices/${police.id}/renouveler`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ modePaiement:method, montant:primeCalc, duree, garanties:garantiesStr }),
      });
      if (!res.ok) throw new Error();
      setStep(4);
      setTimeout(() => { onSuccess(); onClose(); }, 2500);
    } catch { alert('Erreur lors du paiement.'); }
    finally { setLoading(false); }
  };

  const isNonPayee = police.statut === 'EMISE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{maxHeight:'92vh'}}>
        <div className="bg-slate-900 px-6 py-4 shrink-0">
          <p className="text-white font-black text-sm uppercase">{isNonPayee ? '💳 Payer ma Police' : '🔄 Renouveler la Police'}</p>
          <p className="text-orange-400 text-[9px] font-bold uppercase mt-0.5">{police.numeroPolice} · {police.marque} · {police.immatriculation}</p>
        </div>
        {step < 4 && (
          <div className="flex border-b border-slate-100 shrink-0">
            {['Durée','Garanties','Paiement'].map((s,i) => (
              <div key={s} className={`flex-1 py-2.5 text-center text-[9px] font-black uppercase tracking-widest border-b-2 transition-all
                ${step===i+1?'text-orange-600 border-orange-500 bg-orange-50':i<step-1?'text-emerald-600 border-emerald-400':'text-slate-400 border-transparent'}`}>
                {i<step-1?'✓ ':''}{s}
              </div>
            ))}
          </div>
        )}
        <div className="overflow-y-auto flex-1">
          {step === 4 && (
            <div className="p-12 text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-4xl">✅</div>
              <p className="font-black text-emerald-700 text-lg uppercase">Police payée !</p>
              <p className="text-slate-500 text-sm">Nouvelle échéance : <strong>{calcEcheance()}</strong></p>
              <p className="text-slate-400 text-xs">{duree} mois · Garanties : {garantiesStr} · {primeAffich} DZD</p>
            </div>
          )}
          {step === 1 && (
            <div className="p-6 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Choisissez la durée</p>
              {DUREES_DISPO.map(d => (
                <button key={d.mois} onClick={() => setDuree(d.mois)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all text-left ${duree===d.mois?'border-orange-500 bg-orange-50':'border-slate-200 hover:border-orange-200'}`}>
                  <div>
                    <p className={`font-black text-sm uppercase ${duree===d.mois?'text-orange-700':'text-slate-800'}`}>{d.label}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">{d.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${duree===d.mois?'text-orange-600':'text-slate-700'}`}>{fmt(((primeBase+primeOptions)*d.coef).toFixed(2))} DZD</p>
                    {d.mois===12 && <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Meilleur tarif</span>}
                  </div>
                  {duree===d.mois && <span className="ml-3 text-orange-500 font-black">✓</span>}
                </button>
              ))}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between text-xs">
                <span className="text-slate-500 font-bold">Nouvelle échéance</span>
                <span className="font-black text-emerald-600">{calcEcheance()}</span>
              </div>
              <button onClick={() => setStep(2)} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95">
                Choisir les garanties →
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="p-6 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Vos garanties</p>
                <p className="text-[9px] text-slate-400 mb-3">Modifiables à chaque renouvellement — RC et DR obligatoires</p>
                <div className="space-y-2">
                  {GARANTIES_DISPO.map(g => (
                    <label key={g.key}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${garanties[g.key]?'bg-slate-900 border-slate-900':'bg-white border-slate-200 hover:border-slate-300'} ${g.required?'cursor-not-allowed opacity-80':'cursor-pointer'}`}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={garanties[g.key]} disabled={g.required}
                          onChange={() => !g.required && setGaranties(p=>({...p,[g.key]:!p[g.key]}))}
                          className="w-4 h-4 accent-orange-500 shrink-0"/>
                        <div>
                          <p className={`text-xs font-black uppercase ${garanties[g.key]?'text-white':'text-slate-700'}`}>{g.label}</p>
                          {g.required && <p className="text-[8px] font-black text-orange-400 uppercase">Obligatoire</p>}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">{g.prime>0?`+${fmt(g.prime)} DZD`:'Inclus'}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-[#1a3a6b] rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-blue-300 text-[9px] font-black uppercase">Garanties actives</p>
                  <p className="text-orange-400 font-black text-sm">{primeAffich} DZD</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(garanties).filter(([,v])=>v).map(([k])=>(
                    <span key={k} className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-400/30">{k.toUpperCase()}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(1)} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-black text-xs uppercase rounded-2xl hover:border-slate-400 transition-all">← Retour</button>
                <button onClick={()=>setStep(3)} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase rounded-2xl transition-all active:scale-95">Passer au paiement →</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-slate-900 to-[#0f2247] rounded-2xl p-5 border-b-4 border-orange-500">
                <p className="text-blue-300 text-[9px] font-black uppercase mb-3">Récapitulatif</p>
                {[['Durée',`${duree} mois`],['Nouvelle échéance',calcEcheance()],['Garanties',garantiesStr]].map(([k,v])=>(
                  <div key={k} className="flex justify-between text-xs py-1.5 border-b border-white/10">
                    <span className="text-slate-400">{k}</span>
                    <span className="text-white font-bold truncate max-w-[200px] text-right">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/20">
                  <span className="text-blue-300 font-black text-xs uppercase">Total à payer</span>
                  <span className="text-white font-black text-2xl">{primeAffich} DZD</span>
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mode de paiement</p>
              {[{id:'cib',icon:'💳',label:'Carte CIB / Edahabia'},{id:'virement',icon:'🏦',label:'Virement Bancaire'},{id:'cheque',icon:'📄',label:'Chèque'}].map(m=>(
                <button key={m.id} onClick={()=>setMethod(m.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all text-left ${method===m.id?'border-orange-500 bg-orange-50':'border-slate-200 hover:border-orange-300'}`}>
                  <span className="text-2xl">{m.icon}</span>
                  <span className="font-black text-sm text-slate-800 uppercase">{m.label}</span>
                  {method===m.id && <span className="ml-auto text-orange-500 font-black">✓</span>}
                </button>
              ))}
              {(method==="virement"||method==="cheque") && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1">
                  <p className="font-black uppercase text-slate-500 text-[9px]">Coordonnées SAA</p>
                  <p className="font-bold text-slate-700">BNA — Banque Nationale d'Algérie</p>
                  <p className="font-mono text-slate-800 font-black">RIB : 00200150 00000123456 78</p>
                  <p className="text-orange-500 font-black">Réf : {police.numeroPolice}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={()=>setStep(2)} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-black text-xs uppercase rounded-2xl hover:border-slate-400 transition-all">← Retour</button>
                <button onClick={handleConfirmer} disabled={!method||loading}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-black text-xs uppercase rounded-2xl transition-all active:scale-95">
                  {loading?'⏳ Traitement…':'✅ Confirmer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── POLICE CARD ──────────────────────────────────────────────────────────────
const PoliceCard = ({ police, onRenouveler }) => {
  const statut        = getStatutCalcule(police.dateEcheance);
  const joursRestants = getJoursRestants(police.dateEcheance);
  const pct           = Math.min(100, Math.round((joursRestants / ((police.duree||12)*30))*100));
  const isExpired     = statut === "EXPIRÉE";
  const isNonPayee    = police.statut === 'EMISE';
  const isPayee       = police.statut === 'PAYEE';
  const statutColor   = statut==="EN COURS"?"green":statut==="EXPIRE BIENTÔT"?"amber":"red";
  const garantiesArr  = Array.isArray(police.garanties) ? police.garanties : (police.garanties||'').split(',').filter(Boolean);

  return (
    <div className={`rounded-2xl border-2 p-5 transition-all ${
      isNonPayee ? "border-amber-400 bg-gradient-to-br from-amber-950/30 to-slate-900" :
      isExpired  ? "border-slate-200 bg-white" :
                   "border-slate-900 bg-slate-900"}`}>
      {isNonPayee && (
        <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl px-3 py-2 mb-4 flex items-center justify-between">
          <p className="text-amber-400 text-[9px] font-black uppercase tracking-widest">⏳ En attente de paiement</p>
          <span className="text-amber-500 text-[8px] font-bold">Cliquez sur le bouton ci-dessous</span>
        </div>
      )}
      {isPayee && !isExpired && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
          <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">✅ Police active et payée</p>
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className={`text-xs font-black uppercase ${isExpired||isNonPayee?"text-slate-400":"text-slate-300"}`}>Police automobile</p>
          <p className={`text-xl font-black uppercase mt-1 ${isExpired?"text-slate-700":isNonPayee?"text-amber-200":"text-white"}`}>{police.marque}</p>
          <p className="text-[10px] font-mono font-bold mt-0.5 text-slate-400">{police.immatriculation}</p>
        </div>
        <Badge color={statutColor}>{statut}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          ["N° Police",      police.numeroPolice,                     "mono"],
          ["Échéance",       formatDate(police.dateEcheance),          statut!=="EN COURS"?"highlight":""],
          ["Prime / an",     `${fmt(police.prime)} DZD`,              ""],
          ["Jours restants", isExpired?"Expirée":`${joursRestants} j`, isExpired?"highlight":"orange"],
        ].map(([label,val,style])=>(
          <div key={label}>
            <p className={`text-[8px] font-black uppercase tracking-widest ${isExpired||isNonPayee?"text-slate-400":"text-slate-500"}`}>{label}</p>
            <p className={`text-[10px] font-black mt-0.5 ${
              style==="mono"      ? (isExpired||isNonPayee?"text-slate-600 font-mono":"text-slate-300 font-mono") :
              style==="highlight" ? "text-red-400" :
              style==="orange"    ? "text-orange-400" :
              isExpired||isNonPayee?"text-slate-700":"text-slate-200"}`}>{val}</p>
          </div>
        ))}
      </div>
      {!isExpired && !isNonPayee && (
        <div className="mb-4">
          <div className="flex justify-between text-[8px] font-bold mb-1">
            <span className="text-slate-500">Couverture restante</span>
            <span className="text-slate-400">{pct}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${statut==="EXPIRE BIENTÔT"?"bg-amber-400":"bg-emerald-400"}`} style={{width:`${pct}%`}}/>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-1 mb-4">
        {garantiesArr.filter(Boolean).map(g=>(
          <span key={g} className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
            isExpired?"bg-slate-100 text-slate-500":
            isNonPayee?"bg-amber-500/20 text-amber-300 border border-amber-500/30":
                       "bg-white/10 text-slate-300 border border-white/10"}`}>{g}</span>
        ))}
      </div>
      <button onClick={()=>onRenouveler(police)}
        className={`w-full py-2.5 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 ${
          isNonPayee?"bg-amber-500 hover:bg-amber-600 text-white":
          isExpired ?"bg-orange-500 hover:bg-orange-600 text-white":
                     "bg-white/10 hover:bg-white/20 border border-white/20 text-white"}`}>
        {isNonPayee?"💳 Payer ma police":isExpired?"🔄 Renouveler":"🔄 Renouveler / Modifier garanties"}
      </button>
    </div>
  );
};

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────
// onNewDevis  → lance DevisStepByStep ORASS (= nouvelle police)
// onDeclareSinistre → ouvre la déclaration de sinistre
const Dashboard = ({ onLogout, onDeclareSinistre, onNewDevis }) => {
  const [polices,    setPolices]    = useState([]);
  const [sinistres,  setSinistres]  = useState([]);
  const [activePage, setActivePage] = useState("accueil");
  const [user,       setUser]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);
  const [msgNonLus,  setMsgNonLus]  = useState(0);

  const [modalMsg,        setModalMsg]        = useState(false);
  const [modalRenouveler, setModalRenouveler] = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const [pR, sR, nR] = await Promise.all([
        fetch(`${API}/polices/mes-polices`,     {headers:authHeaders()}),
        fetch(`${API}/sinistres/mes-sinistres`, {headers:authHeaders()}),
        fetch(`${API}/messages/non-lus/count`, {headers:authHeaders()}),
      ]);
      const pd = await pR.json(); const sd = await sR.json(); const nd = await nR.json();
      if (Array.isArray(pd)) setPolices(pd);
      if (Array.isArray(sd)) setSinistres(sd.map(s=>({id:s.id,ref:s.ref,date:formatDate(s.createdAt),type:s.type,lieu:s.lieu,statut:s.statut,montant:s.montant})));
      if (nd?.count!==undefined) setMsgNonLus(nd.count);
    } catch(err){console.error(err);}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
    fetchData();
    const poll = setInterval(fetchData, 30000);
    return ()=>clearInterval(poll);
  }, [fetchData]);

  const policesNonPayees  = polices.filter(p=>p.statut==='EMISE');
  const policesPayees     = polices.filter(p=>p.statut==='PAYEE');
  const policesExpBientot = polices.filter(p=>getStatutCalcule(p.dateEcheance)==="EXPIRE BIENTÔT");
  const userDisplay       = user?.fullName||user?.email||'';
  const userInitial       = userDisplay?.[0]?.toUpperCase()||'C';

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-orange-500 p-6 rounded-3xl font-black text-white italic text-3xl animate-bounce shadow-2xl inline-block mb-4">SAA</div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">Chargement…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {modalMsg        && <ModalMessagerie  onClose={()=>{setModalMsg(false);fetchData();}}/>}
      {modalRenouveler && <ModalRenouveler  police={modalRenouveler} onClose={()=>setModalRenouveler(null)} onSuccess={()=>{fetchData();showToast('Police payée avec succès ✅');}}/>}

      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-widest ${toast.type==="success"?"bg-emerald-500 text-white":"bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Bannière non payée */}
      {policesNonPayees.length>0 && (
        <div className="bg-amber-500 text-white px-8 py-2.5 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest">⏳ {policesNonPayees.length} police(s) en attente de paiement</p>
          <button onClick={()=>setActivePage("polices")} className="text-[10px] font-black border border-white/40 px-3 py-1 rounded-lg hover:bg-white/20 uppercase">Payer →</button>
        </div>
      )}
      {policesNonPayees.length===0 && policesExpBientot.length>0 && (
        <div className="bg-orange-500 text-white px-8 py-2.5 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest">⚠ {policesExpBientot.length} police(s) expire(nt) bientôt</p>
          <button onClick={()=>setActivePage("polices")} className="text-[10px] font-black border border-white/40 px-3 py-1 rounded-lg hover:bg-white/20 uppercase">Voir →</button>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="bg-slate-900 border-b-4 border-orange-500 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-white font-black text-2xl tracking-tighter uppercase italic">SAA</div>
            <div className="h-6 w-px bg-white/10"/>
            <div className="hidden md:flex gap-1">
              {[["accueil","Accueil"],["polices","Mes Polices"],["sinistres","Mes Sinistres"]].map(([id,label])=>(
                <button key={id} onClick={()=>setActivePage(id)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activePage===id?"bg-white/10 text-white":"text-slate-400 hover:text-white hover:bg-white/5"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>setModalMsg(true)} className="relative px-3 py-1.5 rounded-lg border border-slate-700 hover:border-orange-500 text-slate-400 hover:text-orange-400 transition-all">
              <span className="text-sm">💬</span>
              {msgNonLus>0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] font-black flex items-center justify-center">{msgNonLus}</span>}
            </button>
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-black">{userInitial}</div>
            <div className="text-right hidden md:block">
              <p className="text-white text-[10px] font-black uppercase">{userDisplay}</p>
              <p className="text-orange-400 text-[8px] font-bold">Espace Client SAA</p>
            </div>
            <button onClick={onLogout} className="text-slate-400 hover:text-red-400 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border border-slate-700 hover:border-red-500 transition-all">Quitter</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* ── ACCUEIL ── */}
        {activePage==="accueil" && (
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden border-b-4 border-orange-500">
              <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",backgroundSize:"20px 20px"}}/>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-orange-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Espace Client</p>
                  <h1 className="text-white text-4xl font-black uppercase italic leading-tight">Bonjour,<br/>{userDisplay}</h1>
                  {polices[0] && <p className="text-slate-400 text-xs font-bold mt-3 font-mono">Police {polices[0].numeroPolice} · {polices[0].marque}</p>}
                </div>
                <div className="flex flex-col gap-3 min-w-[200px]">
                  {/* "Nouvelle Police" = onNewDevis (DevisStepByStep ORASS) */}
                  <button onClick={onNewDevis}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg">
                    + Nouvelle Police
                  </button>
                  <button onClick={onDeclareSinistre}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
                    🚨 Déclarer un Sinistre
                  </button>
                  <button onClick={()=>setModalMsg(true)}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2">
                    💬 Contacter un Agent
                    {msgNonLus>0 && <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{msgNonLus}</span>}
                  </button>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {label:"Polices Payées",      val:policesPayees.length,                                                                   urgent:false},
                {label:"En attente paiement", val:policesNonPayees.length,                                                                urgent:policesNonPayees.length>0},
                {label:"Sinistres Ouverts",   val:sinistres.filter(s=>s.statut==="EN_COURS").length,                                     urgent:false},
                {label:"Prime Totale / An",   val:fmt(polices.filter(p=>p.statut==='PAYEE').reduce((a,p)=>a+(p.prime||0),0)),unit:"DZD", urgent:false},
              ].map(k=>(
                <div key={k.label} className={`border rounded-2xl p-5 transition-all ${k.urgent?"bg-amber-50 border-amber-300":"bg-white border-slate-200 hover:border-slate-400"}`}>
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${k.urgent?"text-amber-600":"text-slate-400"}`}>{k.label}</p>
                  <p className={`text-2xl font-black leading-none ${k.urgent?"text-amber-700":"text-slate-900"}`}>{k.val}</p>
                  {k.unit && <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{k.unit}</p>}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mes Contrats</p>
                  <button onClick={()=>setActivePage("polices")} className="text-[9px] font-black uppercase text-orange-500 hover:text-orange-700">Voir tout →</button>
                </div>
                {polices.length===0 ? (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-3">
                    <p className="text-slate-400 font-bold text-sm">Aucune police trouvée</p>
                    {/* ← même ici : Nouvelle Police = onNewDevis */}
                    <button onClick={onNewDevis} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase transition-all">+ Nouvelle Police</button>
                  </div>
                ) : polices.slice(0,2).map(p=><PoliceCard key={p.id} police={p} onRenouveler={setModalRenouveler}/>)}
              </div>

              <div className="space-y-4">
                {polices[0] && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Détails Police</p>
                    {[
                      ["N° Police",  polices[0].numeroPolice],
                      ["Statut",     polices[0].statut==='PAYEE'?'✅ Payée':polices[0].statut==='EMISE'?'⏳ Non payée':polices[0].statut],
                      ["Agence",     polices[0].agence||"—"],
                      ["Date effet", formatDate(polices[0].dateEffet)],
                      ["Échéance",   formatDate(polices[0].dateEcheance)],
                      ["Durée",      polices[0].duree?`${polices[0].duree} mois`:"—"],
                    ].map(([k,v])=>(
                      <div key={k} className="flex justify-between py-2 border-b border-slate-100 last:border-0 text-xs">
                        <span className="text-slate-400 font-bold uppercase">{k}</span>
                        <span className="text-slate-800 font-black">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Dernier Sinistre</p>
                  {sinistres.length>0 ? (
                    <>
                      <p className="text-xs font-black text-slate-800">{sinistres[0].type}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1">{sinistres[0].date}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge color={STATUT_SINISTRE[sinistres[0].statut]?.color||'slate'}>{STATUT_SINISTRE[sinistres[0].statut]?.label||sinistres[0].statut}</Badge>
                        <p className="text-[9px] font-black text-slate-500 font-mono">{sinistres[0].ref}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center py-4 gap-2">
                      <p className="text-slate-300 text-2xl">🛡️</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase text-center">Aucun sinistre déclaré</p>
                      <button onClick={onDeclareSinistre} className="text-[9px] font-black uppercase text-red-400 hover:text-red-600 mt-1">+ Déclarer →</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MES POLICES ── */}
        {activePage==="polices" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contrats Automobile</p>
                <h2 className="text-2xl font-black uppercase text-slate-900 mt-1">Mes Polices</h2>
              </div>
              {/* ← Nouvelle Police = onNewDevis partout */}
              <button onClick={onNewDevis} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all">
                + Nouvelle Police
              </button>
            </div>
            {polices.length>0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {label:"Payées",         count:policesPayees.length,                                                        cls:"bg-emerald-100 text-emerald-800 border-emerald-200"},
                  {label:"Non payées",     count:policesNonPayees.length,                                                     cls:"bg-amber-100 text-amber-800 border-amber-200"},
                  {label:"Expire bientôt", count:policesExpBientot.length,                                                    cls:"bg-orange-100 text-orange-800 border-orange-200"},
                  {label:"Expirées",       count:polices.filter(p=>getStatutCalcule(p.dateEcheance)==="EXPIRÉE").length,      cls:"bg-red-100 text-red-800 border-red-200"},
                ].map(s=>(
                  <div key={s.label} className={`border rounded-2xl p-4 text-center ${s.cls}`}>
                    <p className="text-2xl font-black">{s.count}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
            {polices.length===0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center space-y-4">
                <p className="font-black uppercase text-slate-400">Aucune police</p>
                <button onClick={onNewDevis} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs transition-all">+ Nouvelle Police</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {polices.map(p=><PoliceCard key={p.id} police={p} onRenouveler={setModalRenouveler}/>)}
              </div>
            )}
          </div>
        )}

        {/* ── MES SINISTRES ── */}
        {activePage==="sinistres" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Réclamations</p>
                <h2 className="text-2xl font-black uppercase text-slate-900 mt-1">Mes Sinistres</h2>
              </div>
              <button onClick={onDeclareSinistre} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-black uppercase text-xs transition-all">🚨 Nouveau Sinistre</button>
            </div>
            {sinistres.length===0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl">🛡️</div>
                <p className="font-black uppercase text-slate-400">Aucun sinistre déclaré</p>
                <button onClick={onDeclareSinistre} className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs transition-all">+ Déclarer un sinistre</button>
              </div>
            ) : (
              <div className="grid gap-4">
                {sinistres.map(s=>{
                  const info = STATUT_SINISTRE[s.statut]||{label:s.statut,color:'slate'};
                  return (
                    <div key={s.ref} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-400 transition-all">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${s.statut==='EN_COURS'?"bg-amber-100 text-amber-700":s.statut==='TRAITE'?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-700"}`}>⚠</div>
                          <div>
                            <p className="text-xs font-black uppercase text-slate-800">{s.type}</p>
                            <p className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">{s.ref} · {s.date}</p>
                            {s.lieu && <p className="text-[9px] font-bold text-slate-400 mt-0.5">📍 {s.lieu}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[9px] font-black uppercase text-slate-400">Remboursement</p>
                            <p className="text-sm font-black text-slate-900">
                              {s.statut==='TRAITE'&&s.montant>0?`${fmt(s.montant)} DZD`:s.statut==='REFUSE'?'Refusé':'En évaluation'}
                            </p>
                          </div>
                          <Badge color={info.color}>{info.label}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center py-8 mt-8 border-t border-slate-200">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">SAA ORASS Suite © 2026 — Direction des Systèmes d'Information</p>
      </div>
    </div>
  );
};

export default Dashboard;