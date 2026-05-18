import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ModalNouveauClient from './ModalNouveauClient';
import ModalSinistre from './Modalsinistre';   // ← s minuscule
import VueFinances   from './Vuefinances';      // ← f minuscule
import VueAnalytique from './Vueanalytique';
const API = 'http://localhost:3001/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const EMAILJS_SERVICE_ID  = 'service_abc123';
const EMAILJS_TEMPLATE_ID = 'template_5jmu5uc';
const EMAILJS_PUBLIC_KEY  = 'yPQmD8lAlQH6I9fUo';
const EMAILJS_TEMPLATE_INFOS = 'template_sp3517c';

// ─── MOTEUR DE CALCUL ─────────────────────────────────────────────────────────
const REF_ZONES = [
  { id:'01', label:'ZONE 01 - NORD',  coef:1.00 },
  { id:'02', label:'ZONE 02 - EST',   coef:0.95 },
  { id:'03', label:'ZONE 03 - OUEST', coef:0.95 },
  { id:'04', label:'ZONE 04 - SUD',   coef:0.80 },
];
const REF_GENRES = [
  { id:'VP',   label:'VP - Voiture particulière', base:12500 },
  { id:'VU',   label:'VU - Véhicule utilitaire',  base:19000 },
  { id:'MOTO', label:'MOTO - Deux roues',          base:8500  },
  { id:'TC',   label:'TC - Transport en commun',   base:28000 },
];
const REF_REDUCTIONS = [
  { id:'AUCUNE',      label:'Aucune',          value:0    },
  { id:'FLOTTE',      label:'Flotte 10%',      value:0.10 },
  { id:'MULTIRISQUE', label:'Multi-risque 5%', value:0.05 },
  { id:'ANCIENNETE',  label:'Ancienneté 15%',  value:0.15 },
];
const GARANTIES_META = [
  { key:'rc',  label:'RC – Responsabilité Civile',   required:true,  info:'Illimité'        },
  { key:'dr',  label:'DR – Défense et Recours',      required:true,  info:'Inclus'          },
  { key:'bdg', label:'BDG – Bris de Glace',          required:false, info:'4 500 DZD'       },
  { key:'vol', label:'VOL – Vol du Véhicule',        required:false, info:'V.Vénale × 0.7%' },
  { key:'inc', label:'INC – Incendie',               required:false, info:'V.Vénale × 0.3%' },
  { key:'dc',  label:'DC – Dommages Collision',      required:false, info:'V.Vénale × 1.8%' },
  { key:'pt',  label:'PT – Personnes Transportées', required:false, info:'1 250 DZD'        },
  { key:'ir',  label:'IR – Individuelle Conducteur',required:false, info:'2 800 DZD'        },
  { key:'tc',  label:'TC – Tous Chocs',              required:false, info:'3 500 DZD'        },
];

function computeQuittance(f) {
  const base      = REF_GENRES.find(g => g.id === f.genreVehicule)?.base ?? 12500;
  const coefZone  = REF_ZONES.find(z => z.id === f.zone)?.coef ?? 1.0;
  const age       = parseInt(f.age) || 30;
  const coefAge   = age < 25 ? 1.5 : age > 60 ? 0.9 : 1.0;
  const coefSexe  = f.sexe === 'F' ? 0.95 : 1.05;
  const primeBase = base * coefZone * coefAge * coefSexe;
  const valV      = parseFloat(f.valeurVenale) || 0;
  const g         = f.garanties || {};
  let totalOptions = 0;
  if (g.bdg) totalOptions += 4500;
  if (g.vol) totalOptions += valV * 0.007;
  if (g.inc) totalOptions += valV * 0.003;
  if (g.dc)  totalOptions += valV * 0.018;
  if (g.pt)  totalOptions += 1250;
  if (g.ir)  totalOptions += 2800;
  if (g.tc)  totalOptions += 3500;
  const accessoires         = (parseFloat(f.valeurAutoRadio) || 0) * 0.025;
  const primeAvantReduction = primeBase + totalOptions;
  const tauxRed             = REF_REDUCTIONS.find(r => r.id === f.reduction)?.value ?? 0;
  const montantReduction    = primeAvantReduction * tauxRed;
  const primeApresReduction = primeAvantReduction - montantReduction;
  const totalMajorations    = (parseFloat(f.majPermis) || 0) + (parseFloat(f.majAge) || 0) + (parseFloat(f.majMatieres) || 0);
  const primeNette          = primeApresReduction + totalMajorations;
  const taxesPrime          = primeNette * 0.19;
  const taxeAccessoires     = accessoires * 0.19;
  const totalTaxes          = taxesPrime + taxeAccessoires;
  const timbreDimension     = 150;
  const timbreGradue        = (parseInt(f.nombreDimension) || 1) * 50;
  const totalAPayer         = primeNette + accessoires + totalTaxes + timbreDimension + timbreGradue;
  const apport              = primeNette * 0.12;
  const fmt = n => n.toFixed(2);
  return {
    primeBase: fmt(primeBase), totalOptions: fmt(totalOptions),
    primeAvantReduction: fmt(primeAvantReduction), montantReduction: fmt(montantReduction),
    primeApresReduction: fmt(primeApresReduction), totalMajorations: fmt(totalMajorations),
    primeNette: fmt(primeNette), accessoires: fmt(accessoires),
    taxesPrime: fmt(taxesPrime), taxeAccessoires: fmt(taxeAccessoires),
    totalTaxes: fmt(totalTaxes), timbreDimension: fmt(timbreDimension),
    timbreGradue: fmt(timbreGradue), totalAPayer: fmt(totalAPayer),
    apport: fmt(apport), gestion: '850.00', totalCommissions: fmt(apport + 850),
  };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
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
  return parseFloat(n || 0).toLocaleString('fr-DZ', { minimumFractionDigits:2, maximumFractionDigits:2 });
}
function generateNumPolice() {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `POL-${year}-${rand}`;
}
function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length:10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return "À l'instant";
  if (diff < 3600)  return `Il y a ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff/3600)}h`;
  return new Date(dateStr).toLocaleDateString('fr-DZ');
}
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-DZ');
}

// Mapping statuts sinistre Prisma → affichage
const SINISTRE_STATUT = {
  'EN_COURS': { label:'En cours',   color:'blue'  },
  'TRAITE':   { label:'Validé ✅',  color:'green' },
  'REFUSE':   { label:'Refusé ❌',  color:'red'   },
};

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
const Badge = ({ children, color='slate' }) => {
  const map = {
    green:  'bg-emerald-100 text-emerald-800 border-emerald-200',
    red:    'bg-red-100 text-red-700 border-red-200',
    amber:  'bg-amber-100 text-amber-800 border-amber-200',
    blue:   'bg-blue-100 text-blue-800 border-blue-200',
    teal:   'bg-teal-100 text-teal-700 border-teal-200',
    slate:  'bg-slate-100 text-slate-600 border-slate-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${map[color]||map.slate}`}>{children}</span>;
};

const KpiCard = ({ icon, label, value, color }) => {
  const map = {
    blue:   'bg-blue-50 border-blue-100 text-blue-700',
    green:  'bg-green-50 border-green-100 text-green-700',
    amber:  'bg-amber-50 border-amber-100 text-amber-700',
    teal:   'bg-teal-50 border-teal-100 text-teal-700',
    red:    'bg-red-50 border-red-100 text-red-700',
    orange: 'bg-orange-50 border-orange-100 text-orange-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
  };
  return (
    <div className={`${map[color]||map.blue} border rounded-2xl p-5`}>
      <div className="flex justify-between items-start">
        <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-base font-black mt-2 leading-tight">{value}</p>
    </div>
  );
};

const InfoCell = ({ label, value, highlight, mono }) => (
  <div>
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className={`font-bold mt-0.5 text-sm truncate ${highlight?'text-orange-500':'text-slate-800'} ${mono?'font-mono':''}`}>
      {value || '—'}
    </p>
  </div>
);

const QRow = ({ label, value, accent, large }) => (
  <div className={`flex justify-between items-center py-2 border-b border-white/10 ${large?'py-4':''}`}>
    <span className={`text-xs font-bold uppercase tracking-wider ${accent?'text-orange-300':'text-slate-400'}`}>{label}</span>
    <span className={`font-mono font-black tabular-nums ${large?'text-3xl text-white':accent?'text-orange-300 text-base':'text-slate-300 text-sm'}`}>
      {value} <span className="text-xs font-bold opacity-60">DZD</span>
    </span>
  </div>
);

const StatBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? Math.round((count/total)*100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-black uppercase">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900">{count} · {pct}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width:`${pct}%` }} />
      </div>
    </div>
  );
};

const EmptyState = ({ icon='📭', message, sub }) => (
  <div className="p-16 bg-white rounded-3xl border-4 border-dashed border-slate-200 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <p className="text-slate-400 font-black uppercase text-lg">{message}</p>
    {sub && <p className="text-slate-300 text-[11px] font-bold uppercase tracking-widest mt-2">{sub}</p>}
  </div>
);

// ─── MODAL MESSAGERIE AGENT ────────────────────────────────────────────────────
const ModalMessagerieAgent = ({ conversation, onClose, onRefresh }) => {
  const [input,  setInput]  = useState('');
  const [conv,   setConv]   = useState(conversation);
  const [loading,setLoading]= useState(false);

  const fetchConv = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/messages/${conv.id}`, { headers:authHeaders() });
      const data = await res.json();
      setConv(data);
    } catch(e) { console.error(e); }
  }, [conv.id]);

  useEffect(() => {
    fetchConv();
    const poll = setInterval(fetchConv, 4000);
    return () => clearInterval(poll);
  }, [fetchConv]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const txt = input.trim(); setInput(''); setLoading(true);
    try {
      await fetch(`${API}/messages/envoyer`, {
        method:'POST', headers:authHeaders(),
        body: JSON.stringify({ conversationId:conv.id, contenu:txt, expediteur:'agent' }),
      });
      await fetchConv(); onRefresh();
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const client = conv.user || {};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{maxHeight:'85vh'}}>
        <div className="bg-gradient-to-r from-[#0b1120] to-[#1a3a6b] px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-black text-white text-sm">
              {(client.fullName||client.email||'C')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-white font-black text-sm">{client.fullName||'Client'}</p>
              <p className="text-blue-300 text-[9px] font-bold">{client.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-red-400 font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/5">✕ Fermer</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {(conv.messages||[]).length===0 ? (
            <div className="text-center py-8"><p className="text-slate-300 text-3xl mb-2">💬</p><p className="text-slate-400 text-xs font-bold">Aucun message</p></div>
          ) : (conv.messages||[]).map(msg => (
            <div key={msg.id} className={`flex ${msg.expediteur==='agent'?'justify-end':'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.expediteur==='agent'?'bg-[#1a3a6b] text-white rounded-tr-sm':'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                <p className="text-sm font-semibold">{msg.contenu}</p>
                <p className={`text-[9px] font-bold mt-1 ${msg.expediteur==='agent'?'text-blue-300':'text-slate-400'}`}>
                  {new Date(msg.createdAt).toLocaleString('fr-DZ')}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
            placeholder="Répondre au client…"
            className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-[#1a3a6b] transition-all" />
          <button onClick={send} disabled={loading}
            className="w-12 h-12 bg-[#1a3a6b] hover:bg-[#0f2247] disabled:opacity-50 rounded-2xl flex items-center justify-center text-white font-black transition-all active:scale-95">➤</button>
        </div>
      </div>
    </div>
  );
};

// ─── MODAL POLICE DETAIL ───────────────────────────────────────────────────────
const ModalPoliceDetail = ({ police, onClose }) => {
  const [tab, setTab] = useState('assure');
  const tabs = [
    {id:'assure',icon:'👤',label:'Assuré'},{id:'vehicule',icon:'🚗',label:'Véhicule'},
    {id:'contrat',icon:'📋',label:'Contrat'},{id:'garanties',icon:'🛡️',label:'Garanties'},
  ];
  const garantiesArr = police.vehicule?.garanties?.split(',') || [];
  const joursRestants = Math.max(0, Math.ceil((new Date(police.dateEcheance)-new Date())/(1000*60*60*24)));
  const statutCalcule = joursRestants<=0?'EXPIRÉE':joursRestants<=30?'EXPIRE BIENTÔT':'EN COURS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{maxHeight:'90vh'}}>
        <div className="bg-gradient-to-r from-[#0b1120] to-[#1a3a6b] px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 text-white font-black text-sm px-3 py-1 rounded-lg">📄 POLICE</div>
            <div>
              <p className="text-white font-black text-sm uppercase">{police.nomAssure||'—'}</p>
              <p className="text-blue-300 text-[9px] font-bold uppercase font-mono">{police.numeroPolice}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge color={statutCalcule==='EN COURS'?'green':statutCalcule==='EXPIRE BIENTÔT'?'amber':'red'}>{statutCalcule}</Badge>
            <button onClick={onClose} className="text-white/50 hover:text-red-400 font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/5">✕ Fermer</button>
          </div>
        </div>
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-1.5 ${tab===t.id?'text-orange-600 border-orange-500 bg-white':'text-slate-400 border-transparent hover:bg-white'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-5">
          {tab==='assure'&&(
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoCell label="Nom & Prénom" value={police.nomAssure} highlight />
                <InfoCell label="Qualité" value={police.qualite} />
                <InfoCell label="Code Assuré" value={police.codeAssure} mono />
                <InfoCell label="Email" value={police.email} />
                <InfoCell label="Téléphone" value={police.telephone} />
                <InfoCell label="Type Pièce" value={police.typePiece} />
                <InfoCell label="N° Pièce" value={police.numPieceIdentite} mono />
                <InfoCell label="Profession" value={police.profession} />
                <InfoCell label="Activité" value={police.activite} />
                <InfoCell label="Adresse" value={police.adresse} />
                <InfoCell label="Ville" value={police.ville} />
                <InfoCell label="Wilaya" value={police.wilaya} />
              </div>
              <div className="h-px bg-slate-100"/>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conducteur</h3>
              <div className="grid grid-cols-3 gap-4">
                <InfoCell label="Sexe" value={police.sexe==='F'?'Femme':'Homme'} />
                <InfoCell label="Âge" value={police.conducteurAge?`${police.conducteurAge} ans`:'—'} />
                <InfoCell label="Date Permis" value={formatDate(police.datePermis)} />
              </div>
            </>
          )}
          {tab==='vehicule'&&(
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCell label="Marque" value={police.vehicule?.marque} highlight />
                <InfoCell label="Genre" value={police.genreVehicule} />
                <InfoCell label="Immatriculation" value={police.vehicule?.immatriculation} mono highlight />
                <InfoCell label="Énergie" value={police.vehicule?.energie} />
                <InfoCell label="Usage" value={police.usage} />
                <InfoCell label="Zone Tarifaire" value={REF_ZONES.find(z=>z.id===police.zone)?.label||'—'} />
                <InfoCell label="Wilaya" value={police.wilaya} />
              </div>
              <div className="bg-slate-900 rounded-2xl p-5 mt-2">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-slate-400 text-[9px] font-black uppercase">Couverture restante</p>
                  <p className={`font-black text-sm ${joursRestants<=30?'text-amber-400':'text-emerald-400'}`}>{joursRestants} jours</p>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${joursRestants<=30?'bg-amber-400':'bg-emerald-400'}`}
                    style={{width:`${Math.min(100,Math.round((joursRestants/((police.duree||12)*30))*100))}%`}} />
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-slate-500 text-[9px] font-bold">Effet : {formatDate(police.dateEffet)}</p>
                  <p className="text-slate-500 text-[9px] font-bold">Échéance : {formatDate(police.dateEcheance)}</p>
                </div>
              </div>
            </>
          )}
          {tab==='contrat'&&(
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCell label="N° Police" value={police.numeroPolice} mono highlight />
                <InfoCell label="Agence" value={police.agence} />
                <InfoCell label="Convention" value={police.convention} />
                <InfoCell label="Fractionnement" value={police.fractionnement} />
                <InfoCell label="Date Effet" value={formatDate(police.dateEffet)} />
                <InfoCell label="Date Échéance" value={formatDate(police.dateEcheance)} />
                <InfoCell label="Durée" value={police.duree?`${police.duree} mois`:'—'} />
                <InfoCell label="Type" value={police.type} />
                <InfoCell label="Réduction" value={police.reduction} />
                <InfoCell label="Régime" value={police.regime} />
                <InfoCell label="Tarif" value={police.tarif} />
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-[#0f2247] rounded-2xl p-6 border-b-4 border-orange-500 mt-2">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-4">Tarification</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-slate-400 text-[9px] font-black uppercase mb-1">Prime Nette</p>
                    <p className="text-white font-black text-xl">{formatNum(police.primeNette)} DZD</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[9px] font-black uppercase mb-1">Taxes</p>
                    <p className="text-white font-black text-xl">{formatNum(police.taxes)} DZD</p>
                  </div>
                  <div>
                    <p className="text-orange-400 text-[9px] font-black uppercase mb-1">Total TTC</p>
                    <p className="text-orange-400 font-black text-2xl">{formatNum(police.montantTotal)} DZD</p>
                  </div>
                </div>
              </div>
            </>
          )}
          {tab==='garanties'&&(
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GARANTIES_META.map(gm => {
                const active = garantiesArr.map(g=>g.toLowerCase()).includes(gm.key);
                return (
                  <div key={gm.key} className={`flex items-center justify-between p-4 rounded-xl border-2 ${active?'bg-slate-900 border-slate-900 text-white':'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-base ${active?'text-green-400':'text-slate-300'}`}>{active?'✓':'—'}</span>
                      <div>
                        <p className={`font-black text-xs uppercase ${active?'text-white':'text-slate-500'}`}>{gm.label}</p>
                        {gm.required&&<p className="text-[9px] font-black text-red-400 uppercase">Obligatoire</p>}
                      </div>
                    </div>
                    <span className="text-[9px] font-bold opacity-70">{gm.info}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WILAYAS_LIST = [
  "01-Adrar","02-Chlef","03-Laghouat","04-Oum El Bouaghi","05-Batna","06-Béjaïa",
  "07-Biskra","08-Béchar","09-Blida","10-Bouira","11-Tamanrasset","12-Tébessa",
  "13-Tlemcen","14-Tiaret","15-Tizi Ouzou","16-Alger","17-Djelfa","18-Jijel",
  "19-Sétif","20-Saïda","21-Skikda","22-Sidi Bel Abbès","23-Annaba","24-Guelma",
  "25-Constantine","26-Médéa","27-Mostaganem","28-M'Sila","29-Mascara","30-Ouargla",
  "31-Oran","32-El Bayadh","33-Illizi","34-Bordj Bou Arreridj","35-Boumerdès",
  "36-El Tarf","37-Tindouf","38-Tissemsilt","39-El Oued","40-Khenchela",
  "41-Souk Ahras","42-Tipaza","43-Mila","44-Aïn Defla","45-Naâma",
  "46-Aïn Témouchent","47-Ghardaïa","48-Relizane",
];


const ModalDemandeEnrichie = ({ demande, onClose, onUpdate }) => {
  const [tab,           setTab]           = useState('assure');
  const [statut,        setStatut]        = useState(demande.statut || 'EN ATTENTE');
  const [emitting,      setEmitting]      = useState(false);
  const [emitted,       setEmitted]       = useState(!!demande.numPolice);
  const [policeInfo,    setPoliceInfo]    = useState(demande.numPolice ? { numPolice: demande.numPolice } : null);
  const [infosDemandees,setInfosDemandees]= useState('');
  const [feedback,      setFeedback]     = useState(null);

  // ── State éditable du dossier ──────────────────────────────────────────────
  const [dossier,  setDossier]  = useState({ ...demande });
  const [modified, setModified] = useState(false);

  const updDossier = (e) => {
    const { name, value } = e.target;
    setDossier(prev => ({ ...prev, [name]: value }));
    setModified(true);
  };

  // ── Quittance recalculée en temps réel ─────────────────────────────────────
  const quittance = useMemo(() => computeQuittance(dossier), [
    dossier.genreVehicule, dossier.zone, dossier.age, dossier.sexe,
    dossier.garanties, dossier.valeurVenale, dossier.valeurAutoRadio,
    dossier.reduction, dossier.majPermis, dossier.majAge, dossier.majMatieres,
  ]);

  // ── Sauvegarder modifications dossier ──────────────────────────────────────
  const handleSauvegarder = async () => {
    try {
      await fetch(`${API}/demandes/${demande.id}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify(dossier),
      });
      setModified(false);
      onUpdate({ ...dossier });
      setFeedback({ type: 'success', msg: '✅ Dossier mis à jour avec succès.' });
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  const tabs = [
    { id:'assure',    icon:'👤', label:'Assuré'    },
    { id:'vehicule',  icon:'🚗', label:'Véhicule'  },
    { id:'garanties', icon:'🛡️', label:'Garanties' },
    { id:'quittance', icon:'💰', label:'Quittance' },
    { id:'action',    icon:'⚖️', label:'Décision'  },
  ];

  const statutColor = s =>
    s === 'ÉMISE'          ? 'green' :
    s === 'REFUSÉE'        ? 'red'   :
    s === 'INFOS REQUISES' ? 'amber' :
    s === 'EN COURS'       ? 'blue'  : 'teal';

  // ── Émettre la police ──────────────────────────────────────────────────────
  const handleEmettre = async () => {
    if (emitting) return;
    setEmitting(true); setFeedback(null);
    const numPolice   = generateNumPolice();
    const password    = generatePassword();
    const dateEffet   = dossier.dateEffet || new Date().toISOString().split('T')[0];
    const duree       = parseInt(dossier.duree) || 12;
    const dateEch     = new Date(dateEffet);
    dateEch.setMonth(dateEch.getMonth() + duree);
    const dateEcheance = dateEch.toISOString().split('T')[0];
    try {
      const res = await fetch(`${API}/polices/emettre`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          demandeId: demande.id, numPolice, password,
          dateEffet, dateEcheance,
          email: dossier.email,
          nomAssure: dossier.nom || dossier.nomAssure,
          dossier: { ...dossier, numPolice, dateEcheance, status: 'ÉMIS' },
        }),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      if (!window.emailjs) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
        window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      }
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email:     dossier.email,
        to_name:      dossier.nom || dossier.nomAssure || 'Client',
        num_police:   numPolice,
        password,
        date_effet:   dateEffet,
        date_echeance: dateEcheance,
        marque:       dossier.marque       || '—',
        immat:        dossier.immatriculation || '—',
        prime_ttc:    quittance.totalAPayer,
      });
      setStatut('ÉMISE'); setEmitted(true);
      setPoliceInfo({ numPolice, password, dateEffet, dateEcheance });
      setFeedback({ type: 'success', msg: `Police ${numPolice} émise. Email envoyé à ${dossier.email}` });
      onUpdate({ ...dossier, statut: 'ÉMISE', numPolice, dateEcheance });
    } catch (err) {
      setFeedback({ type: 'error', msg: `Erreur : ${err.message}` });
    } finally { setEmitting(false); }
  };

  // ── Refuser ────────────────────────────────────────────────────────────────
  const handleRefuser = async () => {
    try {
      await fetch(`${API}/demandes/${demande.id}/statut`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ statut: 'REFUSÉE' }),
      });
      setStatut('REFUSÉE');
      onUpdate({ ...dossier, statut: 'REFUSÉE' });
      setFeedback({ type: 'success', msg: 'Demande refusée.' });
    } catch (err) { setFeedback({ type: 'error', msg: err.message }); }
  };

  // ── Demander infos + email ─────────────────────────────────────────────────
  const handleDemandeInfos = async () => {
    if (!infosDemandees.trim()) return;
    try {
      await fetch(`${API}/demandes/${demande.id}/statut`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ statut: 'INFOS REQUISES', infosDemandees: infosDemandees.trim() }),
      });
      if (!window.emailjs) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
        window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      }
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_INFOS, {
        to_email:      dossier.email,
        to_name:       dossier.nom || dossier.nomAssure || 'Client',
        marque:        dossier.marque          || '—',
        immat:         dossier.immatriculation || '—',
        message_agent: infosDemandees.trim(),
      });
      setStatut('INFOS REQUISES');
      onUpdate({ ...dossier, statut: 'INFOS REQUISES' });
      setInfosDemandees('');
      setFeedback({ type: 'success', msg: `📧 Email envoyé à ${dossier.email} avec les documents requis.` });
    } catch (err) { setFeedback({ type: 'error', msg: `Erreur : ${err.message}` }); }
  };

  // ── Helpers UI ─────────────────────────────────────────────────────────────
  const EditInput = ({ label, name, type = 'text', mono = false, placeholder = '' }) => (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <input
        name={name} type={type} value={dossier[name] || ''} onChange={updDossier}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-400 transition-all bg-white ${mono ? 'font-mono' : ''}`}
      />
    </div>
  );

  const EditSelect = ({ label, name, options }) => (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <select
        name={name} value={dossier[name] || ''} onChange={updDossier}
        className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-400 transition-all bg-white cursor-pointer">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const g = dossier.garanties || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: '92vh' }}>

        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#0b1120] to-[#1a3a6b] px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className={`text-white font-black text-sm px-3 py-1 rounded-lg ${statut === 'ÉMISE' ? 'bg-emerald-500' : 'bg-orange-500'}`}>
              {statut === 'ÉMISE' ? '✅ ÉMISE' : '📋 DEMANDE'}
            </div>
            <div>
              <p className="text-white font-black text-sm uppercase">{dossier.nom || dossier.nomAssure || 'Client'}</p>
              <p className="text-blue-300 text-[9px] font-bold uppercase">{dossier.email} · {dossier.marque || '—'} · {dossier.immatriculation || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge color={statutColor(statut)}>{statut}</Badge>
            {policeInfo && <span className="text-[10px] font-mono font-black bg-white/10 text-white px-3 py-1 rounded-lg">{policeInfo.numPolice}</span>}
            {modified && <span className="text-[9px] font-black bg-amber-500 text-white px-2.5 py-1 rounded-full animate-pulse">● Modifié</span>}
            <button onClick={onClose} className="text-white/50 hover:text-red-400 font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/5">✕ Fermer</button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-5 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-1.5
                ${tab === t.id ? 'text-orange-600 border-orange-500 bg-white' : 'text-slate-400 border-transparent hover:text-slate-700 hover:bg-white'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* CONTENU */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-5">

          {/* FEEDBACK */}
          {feedback && (
            <div className={`p-4 rounded-2xl border-2 font-bold text-sm ${feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {feedback.type === 'success' ? '✅ ' : '❌ '}{feedback.msg}
            </div>
          )}

          {/* ── ASSURÉ ── */}
          {tab === 'assure' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-700 mb-4">👤 Informations Assuré</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <EditInput label="Nom & Prénom *"     name="nom"             />
                  <EditInput label="Email *"             name="email"           type="email" />
                  <EditInput label="Téléphone"           name="telephone"       />
                  <EditInput label="N° pièce identité"   name="numPieceIdentite" mono />
                  <EditInput label="Profession"          name="profession"      />
                  <EditInput label="Adresse"             name="adresse"         />
                  <EditInput label="Ville"               name="ville"           />
                  <EditSelect label="Wilaya"             name="wilaya"          options={WILAYAS_LIST} />
                  <EditInput label="Région"              name="region"          />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">🧑 Conducteur</p>
                <div className="grid grid-cols-3 gap-4">
                  <EditSelect label="Sexe"        name="sexe"      options={['H','F']} />
                  <EditInput  label="Âge"         name="age"       type="number" />
                  <EditInput  label="Date Permis" name="datePermis" type="date" />
                </div>
              </div>
            </div>
          )}

          {/* ── VÉHICULE ── */}
          {tab === 'vehicule' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">🚗 Identification</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <EditInput  label="Marque *"            name="marque"          />
                  <EditInput  label="Type Véhicule"       name="typeVehicule"    />
                  <EditSelect label="Genre *"             name="genreVehicule"   options={['VP','VU','MOTO','TC']} />
                  <EditSelect label="Zone Tarifaire"      name="zone"            options={['01','02','03','04']} />
                  <EditInput  label="Immatriculation *"   name="immatriculation" mono />
                  <EditInput  label="M.E.C le"            name="dateMEC"         type="date" />
                  <EditSelect label="Énergie"             name="energie"         options={['ESSENCE','DIESEL','GPL','ÉLECTRIQUE']} />
                  <EditInput  label="Puissance (CV)"      name="puissance"       type="number" />
                  <EditInput  label="N° Châssis"          name="chassis"         mono />
                  <EditInput  label="Places"              name="places"          type="number" />
                  <EditSelect label="Usage"               name="usage"           options={['USAGE PRIVÉ','USAGE COMMERCIAL','TAXI','TRANSPORT EN COMMUN','LOCATION']} />
                  <EditInput  label="Valeur Vénale (DZD)" name="valeurVenale"    type="number" />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-4">📋 Contrat</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <EditInput  label="Date Effet"    name="dateEffet"    type="date" />
                  <EditInput  label="Durée (mois)"  name="duree"        type="number" />
                  <EditInput  label="Date Échéance" name="dateEcheance" type="date" />
                  <EditSelect label="Réduction"     name="reduction"    options={['AUCUNE','FLOTTE','MULTIRISQUE','ANCIENNETE']} />
                </div>
              </div>
            </div>
          )}

          {/* ── GARANTIES ── */}
          {tab === 'garanties' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GARANTIES_META.map(gm => (
                <div key={gm.key}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${g[gm.key] ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                  onClick={() => {
                    if (gm.required) return;
                    setDossier(prev => ({ ...prev, garanties: { ...(prev.garanties || {}), [gm.key]: !prev.garanties?.[gm.key] } }));
                    setModified(true);
                  }}>
                  <div className="flex items-center gap-3">
                    <span className={`text-base ${g[gm.key] ? 'text-green-400' : 'text-slate-300'}`}>{g[gm.key] ? '✓' : '—'}</span>
                    <div>
                      <p className={`font-black text-xs uppercase ${g[gm.key] ? 'text-white' : 'text-slate-500'}`}>{gm.label}</p>
                      {gm.required && <p className="text-[9px] font-black text-red-400 uppercase">Obligatoire</p>}
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold ${g[gm.key] ? 'text-slate-400' : 'text-slate-300'}`}>{gm.info}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── QUITTANCE ── */}
          {tab === 'quittance' && (
            <div className="bg-gradient-to-br from-slate-900 to-[#0f2247] rounded-2xl p-8 border-b-4 border-orange-500">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-400 border-b border-white/10 pb-3 mb-4">Tarification</h3>
              {[
                ['Prime de base',           quittance.primeBase,           false],
                ['+ Garanties facultatives', quittance.totalOptions,        false],
                ['= Prime avant réduction',  quittance.primeAvantReduction, true ],
                ['− Réduction commerciale',  quittance.montantReduction,    false],
                ['+ Majorations',            quittance.totalMajorations,    false],
                ['Prime nette',              quittance.primeNette,          true ],
                ['Taxes (19%)',              quittance.totalTaxes,          false],
                ['Timbres',                  quittance.timbreDimension,     false],
              ].map(([l, v, a]) => <QRow key={l} label={l} value={v} accent={a} />)}
              <div className="border-t-2 border-orange-500/50 mt-4 pt-4">
                <QRow label="TOTAL À PAYER (TTC)" value={quittance.totalAPayer} large />
              </div>
            </div>
          )}

          {/* ── DÉCISION ── */}
          {tab === 'action' && (
            <div className="space-y-6">
              {emitted && policeInfo ? (
                <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-2xl p-6 text-white border-b-4 border-emerald-400">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-4">✅ Police émise</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[9px] text-emerald-300 font-black uppercase">N° Police</p><p className="font-mono font-black text-2xl mt-1">{policeInfo.numPolice}</p></div>
                    {policeInfo.password && <div><p className="text-[9px] text-emerald-300 font-black uppercase">Mot de passe</p><p className="font-mono font-black text-xl mt-1">{policeInfo.password}</p></div>}
                    <div><p className="text-[9px] text-emerald-300 font-black uppercase">Date effet</p><p className="font-bold mt-1">{policeInfo.dateEffet}</p></div>
                    <div><p className="text-[9px] text-emerald-300 font-black uppercase">Échéance</p><p className="font-bold mt-1">{policeInfo.dateEcheance}</p></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={handleEmettre} disabled={emitting || statut === 'REFUSÉE'}
                      className="col-span-2 p-6 rounded-2xl border-2 text-left bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white shadow-lg hover:from-emerald-600 hover:to-emerald-700 active:scale-95 disabled:opacity-50">
                      <div className="text-3xl mb-2">{emitting ? '⏳' : '🏛️'}</div>
                      <p className="font-black text-sm uppercase tracking-widest mb-1">{emitting ? 'Émission...' : 'Émettre la police'}</p>
                      <p className="text-emerald-100 text-[10px]">Génère le N° · Envoie par email au client</p>
                    </button>
                    <button onClick={handleRefuser} disabled={emitting || statut === 'ÉMISE'}
                      className="p-6 rounded-2xl border-2 text-left bg-white border-red-200 text-red-700 hover:bg-red-50 hover:border-red-400 active:scale-95 disabled:opacity-40">
                      <div className="text-3xl mb-2">❌</div>
                      <p className="font-black text-xs uppercase tracking-widest">Refuser</p>
                    </button>
                  </div>

                  {statut !== 'REFUSÉE' && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 space-y-4">
                      <h3 className="text-xs font-black uppercase text-amber-800">📎 Demander des informations au client</h3>
                      <p className="text-[9px] text-amber-600 font-bold">
                        Un email sera envoyé à <strong>{dossier.email}</strong> avec la liste des documents requis.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Copie carte grise',
                          'N° de châssis complet',
                          'Permis de conduire',
                          'Date MEC exacte',
                          'Valeur vénale justifiée',
                          'Photos du véhicule',
                          'CNI / Passeport',
                          'Attestation domicile',
                        ].map(info => (
                          <button key={info}
                            onClick={() => setInfosDemandees(p => p ? `${p}\n- ${info}` : `- ${info}`)}
                            className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full hover:bg-amber-200 border border-amber-200 transition-all">
                            + {info}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={infosDemandees}
                        onChange={e => setInfosDemandees(e.target.value)}
                        placeholder="Précisez les informations ou documents manquants..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl text-sm font-semibold text-amber-800 outline-none focus:border-amber-500 resize-none"
                      />
                      <button onClick={handleDemandeInfos} disabled={!infosDemandees.trim()}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95">
                        📧 Envoyer l'email de demande d'informations
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* BARRE SAUVEGARDER — sticky en bas si modifications */}
        {modified && (
          <div className="shrink-0 bg-amber-50 border-t-2 border-amber-200 px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-amber-500 text-lg">⚠</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Modifications non sauvegardées</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setDossier({ ...demande }); setModified(false); }}
                className="px-5 py-2 border-2 border-amber-300 text-amber-700 font-black text-[10px] uppercase rounded-xl hover:bg-amber-100 transition-all">
                Annuler
              </button>
              <button onClick={handleSauvegarder}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md">
                💾 Sauvegarder
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
// ─── ROW DEMANDE ───────────────────────────────────────────────────────────────
const DemandeRow = ({ demande:d, onOpen }) => {
  const q = useMemo(()=>computeQuittance(d),[d]);
  const statutColor = d.statut==='ÉMISE'?'green':d.statut==='REFUSÉE'?'red':d.statut==='INFOS REQUISES'?'amber':'teal';
  return(
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-slate-300 hover:shadow-md transition-all">
      <div className="px-6 py-4 flex flex-wrap items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${d.statut==='ÉMISE'?'bg-emerald-100 text-emerald-700':'bg-orange-100 text-orange-700'}`}>
          {d.statut==='ÉMISE'?'✅':'👤'}
        </div>
        <div className="flex-1 min-w-[160px]">
          <p className="font-black text-slate-900 text-sm">{d.nom||d.nomAssure||'—'}</p>
          <p className="text-[10px] text-slate-400 font-bold">{d.email} · {d.telephone}</p>
          <p className="text-[10px] text-slate-500 font-bold mt-0.5">🚗 {d.marque} · {d.immatriculation} · {d.wilaya}</p>
        </div>
        <div className="text-center shrink-0">
          <p className="text-[9px] text-slate-400 font-bold uppercase">Prime TTC</p>
          <p className="font-black text-orange-500 text-sm">{q.totalAPayer} DZD</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] text-slate-400 font-bold">Reçue</p>
          <p className="font-black text-slate-700 text-xs">{timeAgo(d.createdAt)}</p>
        </div>
        {d.numPolice&&<span className="font-mono text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">{d.numPolice}</span>}
        <Badge color={statutColor}>{d.statut||'EN ATTENTE'}</Badge>
        <button onClick={onOpen} className={`px-4 py-2 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all ${d.statut==='ÉMISE'?'bg-emerald-600 hover:bg-emerald-700':'bg-orange-500 hover:bg-orange-600'}`}>
          {d.statut==='ÉMISE'?'Voir →':'Traiter →'}
        </button>
      </div>
    </div>
  );
};

// ─── DASHBOARD AGENT PRINCIPAL ─────────────────────────────────────────────────
const DashboardAgent = ({ polices=[], onLogout }) => {
  const [view, setView]                             = useState('demandes');
  const [demandes, setDemandes]                     = useState([]);
  const [demandesLoading, setDemandesLoading]       = useState(true);
  const [policesList, setPolicesList]               = useState(polices);
  const [sinistresList, setSinistresList]           = useState([]);
  const [conversations, setConversations]           = useState([]);
  const [modalDemande, setModalDemande]             = useState(null);
  const [modalSinistre, setModalSinistre]           = useState(null);  // ← ModalSinistre complet
  const [modalConv, setModalConv]                   = useState(null);
  const [modalPolice, setModalPolice]               = useState(null);
  const [modalNouveauClient, setModalNouveauClient] = useState(false);
  const [searchDemande, setSearchDemande]           = useState('');
  const [filterDemande, setFilterDemande]           = useState('Tous');
  const [searchSinistre, setSearchSinistre]         = useState('');
  const [filterSinistre, setFilterSinistre]         = useState('Tous');
  const [searchPolice, setSearchPolice]             = useState('');
  const [nonLusMsg, setNonLusMsg]                   = useState(0);

  const agentInfo = JSON.parse(localStorage.getItem('user')||'{}');

  useEffect(()=>{
    const fetch_=async()=>{
      try{
        const res=await fetch(`${API}/demandes`,{headers:authHeaders()});
        const data=await res.json();
        if(Array.isArray(data))setDemandes(data);
      }catch(e){console.error(e);}
      finally{setDemandesLoading(false);}
    };
    fetch_();
    const poll=setInterval(fetch_,15000);
    return()=>clearInterval(poll);
  },[]);

  const fetchPolices=useCallback(async()=>{
    try{
      const res=await fetch(`${API}/polices/all`,{headers:authHeaders()});
      const data=await res.json();
      if(Array.isArray(data))setPolicesList(data);
    }catch(e){console.error(e);}
  },[]);

  const fetchSinistres=useCallback(async()=>{
    try{
      const res=await fetch(`${API}/sinistres/all`,{headers:authHeaders()});
      const data=await res.json();
      if(Array.isArray(data))setSinistresList(data);
    }catch(e){console.error(e);}
  },[]);

  const fetchConversations=useCallback(async()=>{
    try{
      const [convRes,nonLusRes]=await Promise.all([
        fetch(`${API}/messages/toutes`,{headers:authHeaders()}),
        fetch(`${API}/messages/non-lus/count`,{headers:authHeaders()}),
      ]);
      const convData=await convRes.json();const nonLusData=await nonLusRes.json();
      if(Array.isArray(convData))setConversations(convData);
      if(nonLusData?.count!==undefined)setNonLusMsg(nonLusData.count);
    }catch(e){console.error(e);}
  },[]);

  useEffect(()=>{
    fetchPolices();fetchSinistres();fetchConversations();
    const poll=setInterval(()=>{fetchPolices();fetchSinistres();fetchConversations();},10000);
    return()=>clearInterval(poll);
  },[fetchPolices,fetchSinistres,fetchConversations]);

  const handleUpdateDemande=useCallback(updated=>{
    setDemandes(prev=>prev.map(d=>d.id===updated.id?updated:d));
    setModalDemande(updated);
  },[]);

  // ← appelé par ModalSinistre complet via prop onUpdate
  const handleUpdateSinistre=useCallback(updated=>{
    setSinistresList(prev=>prev.map(s=>s.id===updated.id?updated:s));
    setModalSinistre(null);
    fetchSinistres();
  },[fetchSinistres]);

  const demandesStats=useMemo(()=>({
    total:   demandes.length,
    attente: demandes.filter(d=>!d.statut||d.statut==='EN ATTENTE').length,
    emises:  demandes.filter(d=>d.statut==='ÉMISE').length,
    refusees:demandes.filter(d=>d.statut==='REFUSÉE').length,
    infos:   demandes.filter(d=>d.statut==='INFOS REQUISES').length,
  }),[demandes]);

  const sinistresStats=useMemo(()=>({
    total:  sinistresList.length,
    cours:  sinistresList.filter(s=>s.statut==='EN_COURS').length,
    traite: sinistresList.filter(s=>s.statut==='TRAITE').length,
    refuse: sinistresList.filter(s=>s.statut==='REFUSE').length,
  }),[sinistresList]);

  const demandesFiltres=useMemo(()=>demandes.filter(d=>{
    const q=searchDemande.toLowerCase();
    const m=(d.nom||d.nomAssure||'').toLowerCase().includes(q)||(d.email||'').toLowerCase().includes(q)||(d.marque||'').toLowerCase().includes(q)||(d.immatriculation||'').toLowerCase().includes(q);
    const st=filterDemande==='Tous'||(d.statut||'EN ATTENTE')===filterDemande;
    return m&&st;
  }),[demandes,searchDemande,filterDemande]);

  const sinistresFiltres=useMemo(()=>sinistresList.filter(s=>{
    const q=searchSinistre.toLowerCase();
    const m=(s.ref||'').toLowerCase().includes(q)||(s.type||'').toLowerCase().includes(q)||(s.user?.fullName||'').toLowerCase().includes(q);
    const stMap={'Tous':true,'EN COURS':s.statut==='EN_COURS','VALIDÉ':s.statut==='TRAITE','REFUSÉ':s.statut==='REFUSE'};
    return m&&stMap[filterSinistre];
  }),[sinistresList,searchSinistre,filterSinistre]);

  const policesFiltres=useMemo(()=>policesList.filter(p=>{
    const q=searchPolice.toLowerCase();
    return(p.nomAssure||'').toLowerCase().includes(q)||(p.numeroPolice||'').toLowerCase().includes(q)||(p.email||'').toLowerCase().includes(q)||(p.vehicule?.marque||'').toLowerCase().includes(q)||(p.vehicule?.immatriculation||'').toLowerCase().includes(q);
  }),[policesList,searchPolice]);

  const navItems=[
    {key:'demandes',  icon:'📋',label:'Demandes',  badge:demandesStats.attente},
    {key:'dossiers',  icon:'📁',label:'Dossiers',  badge:0},
    {key:'sinistres', icon:'🚨',label:'Sinistres', badge:sinistresStats.cours},
    { key:'analytique', icon:'🔬', label:'Analytique', badge:0 },
    { key:'finances', icon:'💹', label:'Finances', badge:0 },
    {key:'messagerie',icon:'💬',label:'Messagerie',badge:nonLusMsg},
  ];

  return(
    <div className="min-h-screen bg-[#f0f2f7] flex font-sans">

      {/* ── MODALS ── */}
      {modalDemande  && <ModalDemandeEnrichie demande={modalDemande}  onClose={()=>setModalDemande(null)}  onUpdate={handleUpdateDemande} />}

      {/* ← ModalSinistre COMPLET importé (6 onglets : Constat, Assuré, Véhicules, Circonstances, Blessé, Décision) */}
      {modalSinistre && (
        <ModalSinistre
          sinistre={modalSinistre}
          onClose={()=>setModalSinistre(null)}
          onUpdate={handleUpdateSinistre}
        />
      )}

      {modalConv     && <ModalMessagerieAgent conversation={modalConv} onClose={()=>{setModalConv(null);fetchConversations();}} onRefresh={fetchConversations} />}
      {modalPolice   && <ModalPoliceDetail    police={modalPolice}    onClose={()=>setModalPolice(null)} />}
      {modalNouveauClient&&(
        <ModalNouveauClient
          onClose={()=>setModalNouveauClient(false)}
          onSuccess={()=>{setModalNouveauClient(false);fetchPolices();}}
        />
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0b1120] text-white flex flex-col shadow-2xl shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white text-sm">SAA</div>
            <div>
              <p className="font-black text-white text-sm">Espace Agent</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">ORASS v2.0</p>
            </div>
          </div>
          {agentInfo.fullName&&(
            <div className="mt-4 bg-white/5 rounded-xl px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Connecté</p>
              <p className="text-white font-bold text-xs mt-0.5">{agentInfo.fullName}</p>
              <p className="text-slate-500 text-[9px]">{agentInfo.email}</p>
            </div>
          )}
        </div>
        <nav className="p-4 flex-1 space-y-1 overflow-y-auto">
          {navItems.map(item=>(
            <button key={item.key} onClick={()=>setView(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-[11px] font-black uppercase tracking-widest ${view===item.key?'bg-orange-500 text-white shadow-lg':'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge>0&&(
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${view===item.key?'bg-white text-orange-500':'bg-orange-500 text-white'}`}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="grid grid-cols-2 gap-2">
            {[
              {label:'À traiter',value:demandesStats.attente,color:'text-orange-400'},
              {label:'Dossiers', value:policesList.length,   color:'text-emerald-400'},
              {label:'Sinistres',value:sinistresStats.cours, color:'text-red-400'},
              {label:'Messages', value:nonLusMsg,            color:'text-purple-400'},
            ].map(({label,value,color})=>(
              <div key={label} className="bg-white/5 rounded-xl p-2 text-center">
                <p className={`text-sm font-black ${color}`}>{value}</p>
                <p className="text-[8px] font-bold text-slate-600 uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onLogout} className="m-4 p-3 border border-white/10 rounded-xl text-slate-500 hover:text-red-400 hover:border-red-400/30 font-black text-[10px] uppercase tracking-widest transition-all text-center">
          ← Déconnexion
        </button>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">

        {/* DEMANDES */}
        {view==='demandes'&&(
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Demandes <span className="text-orange-500">Clients</span></h1>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">Nouveaux clients ayant soumis un formulaire depuis le site</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard icon="📋" label="Total"          value={demandesStats.total}   color="blue"   />
              <KpiCard icon="⏳" label="En attente"     value={demandesStats.attente} color="amber"  />
              <KpiCard icon="✅" label="Polices émises" value={demandesStats.emises}  color="green"  />
              <KpiCard icon="📎" label="Infos requises" value={demandesStats.infos}   color="orange" />
            </div>
            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="Rechercher nom, email, marque, immat…" value={searchDemande} onChange={e=>setSearchDemande(e.target.value)}
                className="flex-1 min-w-[240px] px-5 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-orange-400 shadow-sm"/>
              {['Tous','EN ATTENTE','ÉMISE','REFUSÉE','INFOS REQUISES'].map(f=>(
                <button key={f} onClick={()=>setFilterDemande(f)}
                  className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filterDemande===f?f==='ÉMISE'?'bg-green-500 text-white':f==='REFUSÉE'?'bg-red-500 text-white':f==='INFOS REQUISES'?'bg-amber-500 text-white':f==='EN ATTENTE'?'bg-orange-500 text-white':'bg-slate-900 text-white':'bg-white text-slate-500 border-2 border-slate-200 hover:border-slate-400'}`}>
                  {f}
                </button>
              ))}
            </div>
            {demandesLoading?(
              <div className="p-16 text-center"><p className="text-slate-400 font-black uppercase animate-pulse">Chargement…</p></div>
            ):demandesFiltres.length===0?(
              <EmptyState icon="📋" message="Aucune demande" sub="Les demandes des nouveaux clients apparaîtront ici"/>
            ):(
              <div className="space-y-3">
                {demandesFiltres.map((d,i)=><DemandeRow key={d.id||i} demande={d} onOpen={()=>setModalDemande(d)}/>)}
              </div>
            )}
          </div>
        )}

        {/* DOSSIERS */}
        {view==='dossiers'&&(
          <div className="p-8 space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Dossiers <span className="text-orange-500">Clients</span></h1>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">{policesList.length} client(s) dans le portefeuille</p>
              </div>
              <button onClick={()=>setModalNouveauClient(true)}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg">
                <span className="text-lg">+</span> Nouveau Client
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard icon="📁" label="Total"      value={policesList.length} color="blue"/>
              <KpiCard icon="✅" label="Payées"     value={policesList.filter(p=>p.statut==='PAYEE').length} color="green"/>
              <KpiCard icon="⏳" label="Non payées" value={policesList.filter(p=>p.statut==='EMISE').length} color="amber"/>
              <KpiCard icon="❌" label="Expirées"   value={policesList.filter(p=>p.statut==='EXPIREE'||new Date(p.dateEcheance)<new Date()).length} color="red"/>
            </div>
            <input type="text" placeholder="Rechercher nom, N° police, email, marque, immat…" value={searchPolice} onChange={e=>setSearchPolice(e.target.value)}
              className="w-full px-5 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-orange-400 shadow-sm"/>
            {policesFiltres.length===0?(
              <EmptyState icon="📁" message="Aucun dossier" sub="Créez un nouveau client ou attendez qu'un client s'inscrive avec son N° de police"/>
            ):(
              <div className="space-y-3">
                {policesFiltres.map((p,i)=>{
                  const joursRestants=Math.max(0,Math.ceil((new Date(p.dateEcheance)-new Date())/(1000*60*60*24)));
                  const statutCalcule=joursRestants<=0?'EXPIRÉE':joursRestants<=30?'EXPIRE BIENTÔT':'EN COURS';
                  const statutColor=statutCalcule==='EN COURS'?'green':statutCalcule==='EXPIRE BIENTÔT'?'amber':'red';
                  const garantiesArr=p.vehicule?.garanties?.split(',')||[];
                  const paiementColor=p.statut==='PAYEE'?'green':p.statut==='EMISE'?'amber':p.statut==='EXPIREE'?'red':'slate';
                  const paiementLabel=p.statut==='PAYEE'?'✅ Payée':p.statut==='EMISE'?'⏳ Non payée':p.statut==='EXPIREE'?'❌ Expirée':p.statut;
                  return(
                    <div key={p.id||i} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${p.statut==='EMISE'?'border-amber-200':p.statut==='PAYEE'?'border-emerald-200':'border-slate-100 hover:border-slate-300'}`}>
                      {p.statut==='EMISE'&&<div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between"><p className="text-amber-700 text-[9px] font-black uppercase tracking-widest">⏳ Police émise — En attente de paiement client</p></div>}
                      {p.statut==='PAYEE'&&<div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2"><p className="text-emerald-700 text-[9px] font-black uppercase tracking-widest">✅ Police payée et active</p></div>}
                      <div className="px-6 py-4 flex flex-wrap items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1a3a6b] to-[#0b1120] flex items-center justify-center font-black text-white text-sm shrink-0">
                          {(p.nomAssure||'C')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <p className="font-black text-slate-900 text-sm">{p.nomAssure||'—'}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">{p.email||'—'} · {p.telephone||'—'}</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5">{p.numeroPolice}</p>
                        </div>
                        <div className="shrink-0">
                          <p className="text-[9px] text-slate-400 font-black uppercase">Véhicule</p>
                          <p className="font-black text-slate-800 text-xs mt-0.5">🚗 {p.vehicule?.marque||'—'}</p>
                          <p className="font-mono text-[10px] text-slate-500">{p.vehicule?.immatriculation||'—'}</p>
                        </div>
                        <div className="shrink-0">
                          <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Garanties</p>
                          <div className="flex flex-wrap gap-1">
                            {garantiesArr.slice(0,4).map(g=>(
                              <span key={g} className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-[#1a3a6b]/10 text-[#1a3a6b]">{g}</span>
                            ))}
                            {garantiesArr.length>4&&<span className="text-[8px] font-black text-slate-400">+{garantiesArr.length-4}</span>}
                          </div>
                        </div>
                        <div className="text-center shrink-0">
                          <p className="text-[9px] text-slate-400 font-black uppercase">Prime</p>
                          <p className="font-black text-orange-500 text-sm">{formatNum(p.vehicule?.prime||p.primeNette)} DZD</p>
                          <p className="text-[9px] text-slate-400 mt-1 font-bold">Éch. {formatDate(p.dateEcheance)}</p>
                        </div>
                        <div className="text-center shrink-0">
                          <p className="text-[9px] text-slate-400 font-black uppercase">Jours</p>
                          <p className={`font-black text-sm ${statutCalcule==='EN COURS'?'text-emerald-500':statutCalcule==='EXPIRE BIENTÔT'?'text-amber-500':'text-red-500'}`}>
                            {joursRestants===0?'Expiré':`${joursRestants}j`}
                          </p>
                        </div>
                        <Badge color={statutColor}>{statutCalcule}</Badge>
                        <Badge color={paiementColor}>{paiementLabel}</Badge>
                        {p.user?<span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">✓ Compte</span>:<span className="text-[8px] font-black text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">Sans compte</span>}
                        <button onClick={()=>setModalPolice(p)} className="px-4 py-2 bg-[#1a3a6b] hover:bg-[#0f2247] text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all">Voir →</button>
                      </div>
                      {joursRestants>0&&(
                        <div className="px-6 pb-3">
                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${p.statut==='PAYEE'?'bg-emerald-400':p.statut==='EMISE'?'bg-amber-400':statutCalcule==='EXPIRE BIENTÔT'?'bg-amber-400':'bg-emerald-400'}`}
                              style={{width:`${Math.min(100,Math.round((joursRestants/((p.duree||12)*30))*100))}%`}}/>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SINISTRES */}
        {view==='sinistres'&&(
          <div className="p-8 space-y-6">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Sinistres <span className="text-red-500">Déclarés</span></h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard icon="📂" label="Total"    value={sinistresStats.total}  color="blue"  />
              <KpiCard icon="⏳" label="En cours" value={sinistresStats.cours}  color="amber" />
              <KpiCard icon="✅" label="Validés"  value={sinistresStats.traite} color="green" />
              <KpiCard icon="❌" label="Refusés"  value={sinistresStats.refuse} color="red"   />
            </div>
            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="Rechercher réf, type, client…" value={searchSinistre} onChange={e=>setSearchSinistre(e.target.value)}
                className="flex-1 min-w-[240px] px-5 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-red-400 shadow-sm"/>
              {['Tous','EN COURS','VALIDÉ','REFUSÉ'].map(f=>(
                <button key={f} onClick={()=>setFilterSinistre(f)}
                  className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filterSinistre===f?f==='VALIDÉ'?'bg-green-500 text-white':f==='REFUSÉ'?'bg-red-500 text-white':f==='EN COURS'?'bg-blue-500 text-white':'bg-slate-900 text-white':'bg-white text-slate-500 border-2 border-slate-200 hover:border-slate-400'}`}>
                  {f}
                </button>
              ))}
            </div>
            {sinistresList.length===0?(
              <EmptyState icon="🚨" message="Aucun sinistre" sub="Les sinistres déclarés par les clients apparaîtront ici"/>
            ):(
              <div className="space-y-3">
                {sinistresFiltres.map((s,i)=>{
                  const info=SINISTRE_STATUT[s.statut]||{label:s.statut,color:'blue'};
                  return(
                    <div key={s.id||i} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-slate-300 transition-all">
                      <div className="px-6 py-4 flex flex-wrap items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${s.statut==='TRAITE'?'bg-green-100 text-green-700':s.statut==='REFUSE'?'bg-red-100 text-red-700':'bg-orange-100 text-orange-700'}`}>⚠</div>
                        <div className="flex-1 min-w-[160px]">
                          <p className="font-black text-slate-900 text-sm">{s.type||'Accident'}</p>
                          <p className="text-[10px] text-slate-400 font-bold font-mono">{s.ref}</p>
                          {s.user&&<p className="text-[10px] text-slate-500 font-bold mt-0.5">👤 {s.user.fullName||s.user.email}</p>}
                          {s.lieu&&<p className="text-[10px] text-slate-500 mt-0.5">📍 {s.lieu}</p>}
                        </div>
                        <div className="text-center shrink-0">
                          <p className="text-[9px] text-slate-400 font-black uppercase">Reçu</p>
                          <p className="font-bold text-slate-700 text-xs">{timeAgo(s.createdAt)}</p>
                        </div>
                        {s.statut==='TRAITE'&&s.montant>0&&(
                          <div className="text-center shrink-0">
                            <p className="text-[9px] text-slate-400 font-black uppercase">Remboursement</p>
                            <p className="font-black text-emerald-600 text-sm">{formatNum(s.montant)} DZD</p>
                          </div>
                        )}
                        <Badge color={info.color}>{info.label}</Badge>
                        {/* ← bouton ouvre le ModalSinistre COMPLET avec tous les détails */}
                        <button onClick={()=>setModalSinistre(s)}
                          className="px-4 py-2 bg-slate-900 hover:bg-red-500 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all">
                          {s.statut==='EN_COURS'?'Traiter →':'Voir →'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MESSAGERIE */}
        {view==='messagerie'&&(
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Messagerie <span className="text-purple-500">Clients</span></h1>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">{nonLusMsg} non lu(s) · {conversations.length} conversation(s)</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <KpiCard icon="💬" label="Conversations" value={conversations.length} color="purple"/>
              <KpiCard icon="📩" label="Non lus"       value={nonLusMsg}           color="orange"/>
              <KpiCard icon="✅" label="Répondus"      value={conversations.filter(c=>c.messages?.[0]?.expediteur==='agent').length} color="green"/>
            </div>
            {conversations.length===0?(
              <EmptyState icon="💬" message="Aucune conversation" sub="Les messages des clients apparaîtront ici"/>
            ):(
              <div className="space-y-3">
                {conversations.map((conv,i)=>{
                  const dernierMsg=conv.messages?.[0];const client=conv.user||{};
                  const nonLu=dernierMsg&&dernierMsg.expediteur==='client'&&!dernierMsg.lu;
                  return(
                    <div key={conv.id||i}
                      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer ${nonLu?'border-orange-300 bg-orange-50/30':'border-slate-100 hover:border-slate-300'}`}
                      onClick={()=>setModalConv(conv)}>
                      <div className="px-6 py-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${nonLu?'bg-orange-500 text-white':'bg-slate-200 text-slate-600'}`}>
                          {(client.fullName||client.email||'C')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-black text-sm ${nonLu?'text-orange-700':'text-slate-900'}`}>{client.fullName||'Client'}</p>
                            {nonLu&&<span className="text-[8px] font-black text-white bg-orange-500 px-2 py-0.5 rounded-full uppercase">Nouveau</span>}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold">{client.email}</p>
                          {dernierMsg&&<p className={`text-xs mt-1 truncate ${nonLu?'font-bold text-orange-600':'text-slate-500'}`}>{dernierMsg.expediteur==='agent'?'↩ Vous : ':''}{dernierMsg.contenu}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          {dernierMsg&&<p className="text-[9px] text-slate-400 font-bold">{timeAgo(dernierMsg.createdAt)}</p>}
                          <p className="text-[9px] text-slate-300 font-bold mt-1">{conv.messages?.length||0} msg</p>
                        </div>
                        <span className="px-3 py-1.5 bg-[#1a3a6b] text-white font-black text-[9px] uppercase tracking-widest rounded-xl shrink-0">Répondre →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* STATS */}
        {view==='analytique'&&(
          <VueAnalytique />
        )}

        {/* FINANCES */}
        {view==='finances' && <VueFinances />}

      </main>
    </div>
  );
};

export default DashboardAgent;