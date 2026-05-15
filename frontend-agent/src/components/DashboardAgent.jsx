import React, { useState, useMemo, useEffect, useRef } from 'react';

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

function today() {
  return new Date().toLocaleDateString('fr-DZ');
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60)   return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff/3600)}h`;
  return d.toLocaleDateString('fr-DZ');
}

const API = 'http://localhost:3001/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS UI
// ─────────────────────────────────────────────────────────────────────────────
const Badge = ({ children, color = 'slate' }) => {
  const map = {
    green:  'bg-emerald-100 text-emerald-800 border-emerald-200',
    red:    'bg-red-100 text-red-700 border-red-200',
    amber:  'bg-amber-100 text-amber-800 border-amber-200',
    blue:   'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    slate:  'bg-slate-100 text-slate-600 border-slate-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    teal:   'bg-teal-100 text-teal-700 border-teal-200',
  };
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${map[color] || map.slate}`}>
      {children}
    </span>
  );
};

const KpiCard = ({ icon, label, value, color }) => {
  const map = {
    blue:   'bg-blue-50 border-blue-100 text-blue-700',
    green:  'bg-green-50 border-green-100 text-green-700',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    pink:   'bg-pink-50 border-pink-100 text-pink-700',
    orange: 'bg-orange-50 border-orange-100 text-orange-700',
    red:    'bg-red-50 border-red-100 text-red-700',
    amber:  'bg-amber-50 border-amber-100 text-amber-700',
    teal:   'bg-teal-50 border-teal-100 text-teal-700',
  };
  return (
    <div className={`${map[color] || map.blue} border rounded-2xl p-5`}>
      <div className="flex justify-between items-start">
        <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-base font-black mt-2 leading-tight">{value}</p>
    </div>
  );
};

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

const EmptyState = ({ icon = '📭', message, sub }) => (
  <div className="p-16 bg-white rounded-3xl border-4 border-dashed border-slate-200 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <p className="text-slate-400 font-black uppercase text-lg">{message}</p>
    {sub && <p className="text-slate-300 text-[11px] font-bold uppercase tracking-widest mt-2">{sub}</p>}
  </div>
);

const InfoCell = ({ label, value, highlight }) => (
  <div>
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className={`font-bold mt-0.5 text-sm truncate ${highlight ? 'text-orange-500' : 'text-slate-800'}`}>{value || '—'}</p>
  </div>
);

const AlertCard = ({ type, message, dark = true }) => {
  const styles = {
    danger:  dark ? 'bg-red-500/10 border-red-500/20 text-red-300'             : 'bg-red-50 border-red-200 text-red-700',
    success: dark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-green-50 border-green-100 text-green-700',
    info:    dark ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'          : 'bg-blue-50 border-blue-100 text-blue-700',
  };
  return <div className={`p-4 border rounded-2xl text-[10px] font-bold leading-relaxed ${styles[type] || styles.info}`}>{message}</div>;
};

// ─────────────────────────────────────────────────────────────────────────────
// CIRCUMSTANCES
// ─────────────────────────────────────────────────────────────────────────────
const CIRCUMSTANCES = [
  "1) Heurtait à l'arrière","2) Même sens, file différente","3) Sens inverse",
  "4) Chaussée différente","5) Venait de droite","6) Giratoire (entrée)",
  "7) Giratoire (circulation)","8) En stationnement","9) Quittait stationnement",
  "10) Prenait stationnement","11) Reculait","12) Doublait","13) Dépassement irrégulier",
  "14) Changeait de file","15) Virait à droite","16) Virait à gauche",
  "17) Entrait parking","18) Sortait parking","19) Voie réservée",
  "20) Sens interdit","21) Non-priorité","22) Demi-tour","23) Portière ouverte",
];

// ─────────────────────────────────────────────────────────────────────────────
// MODAL SINISTRE
// ─────────────────────────────────────────────────────────────────────────────
const ModalSinistre = ({ sinistre, onClose, onUpdate }) => {
  const [tab, setTab] = useState('infos');
  const [decision, setDecision] = useState(sinistre.decision || null);
  const [montant, setMontant] = useState(sinistre.montantRembourse || '');
  const [motifRefus, setMotifRefus] = useState(sinistre.motifRefus || '');
  const [piecesDemandees, setPiecesDemandees] = useState(sinistre.piecesDemandees || []);
  const [nouvellePiece, setNouvellePiece] = useState('');
  const [commentaire, setCommentaire] = useState(sinistre.commentaire || '');
  const [saved, setSaved] = useState(false);
  const d = sinistre.details || {};

  const PIECES_PREDEFINIES = [
    "Constat amiable signé","Rapport de police / PV Gendarmerie","Carte grise du véhicule",
    "Permis de conduire","Photos des dommages","Factures de réparation",
    "Attestation d'assurance en cours","Certificat médical (si blessé)","Devis de réparation","Carte d'identité nationale",
  ];

  const handleSave = async () => {
    const updated = {
      ...sinistre,
      decision,
      montantRembourse: decision === 'valide' ? montant : 0,
      motifRefus: decision === 'refuse' ? motifRefus : '',
      piecesDemandees: decision === 'pieces' ? piecesDemandees : [],
      commentaire,
      statut: decision === 'valide' ? 'VALIDÉ' : decision === 'refuse' ? 'REFUSÉ' : decision === 'pieces' ? 'PIÈCES REQUISES' : 'EN COURS',
      dateDecision: today(),
    };
    try {
      await fetch(`${API}/sinistres/${sinistre.id}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ statut: updated.statut, montant: parseFloat(updated.montantRembourse)||0, motifRefus: updated.motifRefus, piecesDemandees: updated.piecesDemandees, commentaire: updated.commentaire })
      });
    } catch (err) { console.error(err); }
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const tabs = [
    { id:'infos', icon:'📋', label:'Informations' }, { id:'vehicules', icon:'🚗', label:'Véhicules' },
    { id:'circonstances', icon:'⚠️', label:'Circonstances' }, { id:'blesse', icon:'🏥', label:'Blessé(s)' },
    { id:'decision', icon:'⚖️', label:'Décision' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight:'92vh' }}>
        <div className="bg-slate-900 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 text-white font-black text-sm px-3 py-1 rounded-lg">🚨 SIN</div>
            <div>
              <p className="text-white font-black text-sm uppercase">{sinistre.ref}</p>
              <p className="text-slate-400 text-[9px] font-bold uppercase">{sinistre.type} · {sinistre.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge color={sinistre.statut==='VALIDÉ'?'green':sinistre.statut==='REFUSÉ'?'red':sinistre.statut==='PIÈCES REQUISES'?'amber':'blue'}>{sinistre.statut||'EN COURS'}</Badge>
            <button onClick={onClose} className="text-slate-400 hover:text-red-400 font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/5 transition-all">✕ Fermer</button>
          </div>
        </div>
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-5 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-1.5 ${tab===t.id?'text-red-600 border-red-500 bg-white':'text-slate-400 border-transparent hover:text-slate-700 hover:bg-white'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {tab==='infos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCell label="Référence" value={sinistre.ref} highlight />
                <InfoCell label="Date" value={sinistre.date} />
                <InfoCell label="Type" value={sinistre.type} />
                <InfoCell label="Statut" value={sinistre.statut||'EN COURS'} />
              </div>
              <div className="h-px bg-slate-100" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Informations générales</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoCell label="Date accident" value={d.date} />
                <InfoCell label="Heure" value={d.heure} />
                <InfoCell label="Lieu" value={d.lieu} />
                <InfoCell label="Dégâts tiers" value={d.degTiers==='oui'?'Oui':'Non'} />
                <InfoCell label="Témoin" value={d.temoin} />
                <InfoCell label="PV Gendarmerie" value={d.pvGend==='oui'?'✅ Oui':'❌ Non'} />
              </div>
              <div className="h-px bg-slate-100" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assuré déclarant</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoCell label="Nom" value={d.nomAssure} />
                <InfoCell label="Téléphone" value={d.tel} />
                <InfoCell label="Adresse" value={d.adresseAssure} />
              </div>
            </div>
          )}
          {tab==='vehicules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[['A',d.vehiculeA,'border-blue-200 bg-blue-50','text-blue-800'],['B',d.vehiculeB,'border-red-200 bg-red-50','text-red-800']].map(([label,v,cls,tcls])=>(
                <div key={label} className={`rounded-2xl border-2 p-6 ${cls}`}>
                  <h3 className={`text-sm font-black uppercase mb-4 ${tcls}`}>Véhicule {label}</h3>
                  {v ? <div className="grid grid-cols-2 gap-3">
                    <InfoCell label="Marque" value={v.marque} />
                    <InfoCell label="Immatriculation" value={v.immat} />
                    <InfoCell label="Compagnie" value={v.compagnie} />
                    <InfoCell label="Conducteur" value={`${v.condPrenom||''} ${v.condNom||''}`.trim()} />
                    <div className="col-span-2"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Dégâts</p><p className="font-semibold text-sm mt-1">{v.degats||'—'}</p></div>
                  </div> : <p className="text-slate-400 text-sm">Aucune information</p>}
                </div>
              ))}
            </div>
          )}
          {tab==='circonstances' && (
            <div className="space-y-6">
              <p className="text-sm text-slate-600 font-semibold">Description : <span className="text-slate-900">{d.circDesc||'—'}</span></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[['A',d.circonstancesA,'bg-blue-50 border-blue-200','text-blue-800'],['B',d.circonstancesB,'bg-red-50 border-red-200','text-red-800']].map(([label,circ,cls,tcls])=>(
                  <div key={label} className={`rounded-2xl border-2 p-5 ${cls}`}>
                    <h3 className={`text-xs font-black uppercase mb-3 ${tcls}`}>Cases Véhicule {label} ({Array.isArray(circ)?circ.length:0})</h3>
                    {Array.isArray(circ)&&circ.length>0?circ.map(i=>(
                      <div key={i} className="flex items-start gap-2 text-[11px] mb-1">
                        <span className="text-green-500 shrink-0">✓</span>
                        <span className="text-slate-700 font-semibold">{CIRCUMSTANCES[i]||`Case ${i}`}</span>
                      </div>
                    )):<p className="text-slate-400 text-sm">Aucune case cochée</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==='blesse' && (
            <div>
              {d.blesse&&(d.blesse.nom||d.blesse.blessures) ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                  <h3 className="text-xs font-black uppercase text-red-800 mb-4">🏥 Blessé(s)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InfoCell label="Nom" value={d.blesse.nom} />
                    <InfoCell label="Âge" value={d.blesse.age} />
                    <InfoCell label="Situation" value={d.blesse.situation} />
                    <InfoCell label="Hospitalisation" value={d.blesse.hospi} />
                    <div className="col-span-2"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Blessures</p><p className="font-semibold text-sm mt-1 text-red-800">{d.blesse.blessures||'—'}</p></div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-10 flex flex-col items-center gap-3">
                  <div className="text-4xl">✅</div>
                  <p className="font-black uppercase text-green-800 text-sm">Aucun blessé déclaré</p>
                </div>
              )}
            </div>
          )}
          {tab==='decision' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {key:'valide',icon:'✅',label:'Valider le remboursement',desc:'Le sinistre est reconnu.'},
                  {key:'refuse',icon:'❌',label:'Refuser le sinistre',desc:'Le sinistre est rejeté.'},
                  {key:'pieces',icon:'📎',label:'Demander des pièces',desc:'Dossier incomplet.'},
                ].map(opt=>(
                  <button key={opt.key} onClick={()=>setDecision(opt.key)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${decision===opt.key?opt.key==='valide'?'bg-green-500 border-green-500 text-white shadow-lg scale-105':opt.key==='refuse'?'bg-red-500 border-red-500 text-white shadow-lg scale-105':'bg-amber-500 border-amber-500 text-white shadow-lg scale-105':'bg-white border-slate-200 hover:border-slate-400 text-slate-700'}`}>
                    <div className="text-2xl mb-2">{opt.icon}</div>
                    <p className="font-black text-xs uppercase tracking-widest mb-1">{opt.label}</p>
                    <p className={`text-[10px] ${decision===opt.key?'opacity-80':'text-slate-400'}`}>{opt.desc}</p>
                  </button>
                ))}
              </div>
              {decision==='valide' && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-green-800">💰 Montant du remboursement</h3>
                  <input type="number" value={montant} onChange={e=>setMontant(e.target.value)} placeholder="ex : 85000"
                    className="w-full px-4 py-3 rounded-xl border-2 border-green-300 bg-white text-2xl font-black text-green-800 outline-none focus:border-green-500 transition-all" />
                  {montant && <div className="bg-green-100 border border-green-300 rounded-xl p-3 text-center"><p className="text-green-800 font-black text-lg">{formatNum(montant)} DZD</p></div>}
                </div>
              )}
              {decision==='refuse' && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-red-800">❌ Motif de refus</h3>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {["Sinistre non couvert","Exclusion contractuelle","Délai dépassé","Faute intentionnelle","Conduite sous alcool","Permis invalide"].map(m=>(
                      <button key={m} onClick={()=>setMotifRefus(m)} className={`text-left px-3 py-2 rounded-xl border text-[10px] font-bold transition-all ${motifRefus===m?'bg-red-500 border-red-500 text-white':'bg-white border-red-200 text-red-700 hover:border-red-400'}`}>{m}</button>
                    ))}
                  </div>
                  <textarea value={motifRefus} onChange={e=>setMotifRefus(e.target.value)} placeholder="Ou saisir un motif personnalisé..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-red-200 bg-white text-sm font-semibold text-red-800 outline-none focus:border-red-400 resize-none" rows={3} />
                </div>
              )}
              {decision==='pieces' && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-amber-800">📎 Pièces requises</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PIECES_PREDEFINIES.map(p=>(
                      <button key={p} onClick={()=>setPiecesDemandees(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p])}
                        className={`text-left px-3 py-2 rounded-xl border text-[10px] font-bold transition-all flex items-center gap-2 ${piecesDemandees.includes(p)?'bg-amber-500 border-amber-500 text-white':'bg-white border-amber-200 text-amber-800 hover:border-amber-400'}`}>
                        <span>{piecesDemandees.includes(p)?'✓':'+'}</span>{p}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input type="text" value={nouvellePiece} onChange={e=>setNouvellePiece(e.target.value)} onKeyDown={e=>e.key==='Enter'&&nouvellePiece.trim()&&(setPiecesDemandees(p=>[...p,nouvellePiece.trim()]),setNouvellePiece(''))}
                      placeholder="Pièce personnalisée..."
                      className="flex-1 px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-white text-sm font-semibold text-amber-800 outline-none focus:border-amber-500 transition-all" />
                    <button onClick={()=>nouvellePiece.trim()&&(setPiecesDemandees(p=>[...p,nouvellePiece.trim()]),setNouvellePiece(''))} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase rounded-xl transition-all">+ Ajouter</button>
                  </div>
                </div>
              )}
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Commentaire interne</label>
                <textarea value={commentaire} onChange={e=>setCommentaire(e.target.value)} placeholder="Notes internes..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-700 outline-none focus:border-slate-400 resize-none transition-all" rows={3} />
              </div>
              {decision && (
                <button onClick={handleSave}
                  className={`w-full py-4 rounded-2xl font-black uppercase text-sm tracking-widest transition-all active:scale-95 ${saved?'bg-emerald-500 text-white':decision==='valide'?'bg-green-500 hover:bg-green-600 text-white shadow-lg':decision==='refuse'?'bg-red-500 hover:bg-red-600 text-white shadow-lg':'bg-amber-500 hover:bg-amber-600 text-white shadow-lg'}`}>
                  {saved?'✅ Décision enregistrée !':'💾 Enregistrer la décision'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DOSSIER
// ─────────────────────────────────────────────────────────────────────────────
const ModalDossier = ({ dossier: d, onClose }) => {
  const [tab, setTab] = useState('assure');
  const tabs = [
    {id:'assure',icon:'👤',label:'Assuré'},{id:'vehicule',icon:'🚗',label:'Véhicule'},
    {id:'garanties',icon:'🛡️',label:'Garanties'},{id:'quittance',icon:'💰',label:'Quittance'},
    {id:'police',icon:'📄',label:'Police'},
  ];
  const q = d.quittance||{};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{maxHeight:'92vh'}}>
        <div className="bg-slate-900 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 text-white font-black text-sm px-3 py-1 rounded-lg">📁 DOS</div>
            <div>
              <p className="text-white font-black text-sm uppercase">{d.nomAssure||'Dossier client'}</p>
              <p className="text-slate-400 text-[9px] font-bold uppercase">{d.numPolice} · {d.marque||'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-400 font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/5 transition-all">✕ Fermer</button>
        </div>
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0 overflow-x-auto">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex-shrink-0 px-5 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-1.5 ${tab===t.id?'text-orange-600 border-orange-500 bg-white':'text-slate-400 border-transparent hover:text-slate-700 hover:bg-white'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {tab==='assure' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoCell label="Nom & Prénom" value={d.nomAssure} highlight />
            <InfoCell label="Téléphone" value={d.telephone} />
            <InfoCell label="Email" value={d.email} />
            <InfoCell label="Adresse" value={d.adresse} />
            <InfoCell label="Wilaya" value={d.wilaya} />
            <InfoCell label="Région" value={getRegion(d.wilaya)} />
            <InfoCell label="Profession" value={d.profession} />
            <InfoCell label="Sexe" value={d.sexe==='F'?'Femme':'Homme'} />
            <InfoCell label="Âge" value={d.age?`${d.age} ans`:'—'} />
          </div>}
          {tab==='vehicule' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoCell label="Genre" value={d.genreVehicule} highlight />
            <InfoCell label="Marque" value={d.marque} />
            <InfoCell label="Immatriculation" value={d.immatriculation} />
            <InfoCell label="Énergie" value={d.energie} />
            <InfoCell label="Usage" value={d.usage} />
            <InfoCell label="Puissance" value={d.puissance} />
            <InfoCell label="Valeur Vénale" value={d.valeurVenale?`${formatNum(d.valeurVenale)} DZD`:'—'} highlight />
          </div>}
          {tab==='garanties' && d.garanties && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[{key:'rc',label:'RC – Responsabilité Civile'},{key:'dr',label:'DR – Défense et Recours'},{key:'bdg',label:'BDG – Bris de Glace'},{key:'vol',label:'VOL – Vol'},{key:'inc',label:'INC – Incendie'},{key:'dc',label:'DC – Dommages Collision'},{key:'pt',label:'PT – Personnes Transportées'},{key:'ir',label:'IR – Individuelle Conducteur'},{key:'tc',label:'TC – Tous Chocs'}].map(g=>(
                <div key={g.key} className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 ${d.garanties[g.key]?'bg-slate-900 border-slate-900 text-white':'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <span className="font-black text-xs uppercase">{g.label}</span>
                  <span className={`text-sm ${d.garanties[g.key]?'text-green-400':'text-slate-300'}`}>{d.garanties[g.key]?'✓':'—'}</span>
                </div>
              ))}
            </div>
          )}
          {tab==='quittance' && (
            <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-400 border-b border-white/10 pb-3 mb-4">Décomposition Quittance</h3>
              {[['Prime de Base',q.primeBase],['+ Garanties Facultatives',q.totalOptions],['Prime Nette (HT)',q.primeNette,true],['Total Taxes',q.totalTaxes,true],['Timbre de Dimension',q.timbreDimension],['Timbre Gradué',q.timbreGradue]].map(([l,v,a])=>(
                <div key={l} className={`flex justify-between items-center py-2 border-b border-white/10 ${a?'border-t border-orange-500/30 mt-1':''}`}>
                  <span className={`text-xs font-bold uppercase ${a?'text-orange-300':'text-slate-400'}`}>{l}</span>
                  <span className={`font-mono font-black tabular-nums text-sm ${a?'text-orange-300':'text-slate-300'}`}>{v||'0.00'} DZD</span>
                </div>
              ))}
              <div className="border-t-2 border-orange-500 pt-4 flex justify-between items-center">
                <span className="text-white font-black uppercase text-sm">TOTAL À PAYER (TTC)</span>
                <span className="text-orange-400 font-black text-3xl tabular-nums">{q.totalAPayer||'—'} DZD</span>
              </div>
            </div>
          )}
          {tab==='police' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoCell label="N° Police" value={d.numPolice} highlight />
            <InfoCell label="Date Effet" value={d.dateEffet} />
            <InfoCell label="Date Échéance" value={d.dateEcheance} />
            <InfoCell label="Fractionnement" value={d.fractionnement} />
            <InfoCell label="Durée (mois)" value={d.duree} />
            <InfoCell label="Statut" value={d.status||'ÉMIS'} highlight />
          </div>}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DEMANDE DETAIL
// ─────────────────────────────────────────────────────────────────────────────
const ModalDemande = ({ demande, onClose, onUpdate }) => {
  const [statut, setStatut] = useState(demande.statut);
  const [infosDemandees, setInfosDemandees] = useState('');
  const [saved, setSaved] = useState(false);

  const handleUpdateStatut = async (newStatut) => {
    try {
      await fetch(`${API}/demandes/${demande.id}/statut`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ statut: newStatut })
      });
      setStatut(newStatut);
      onUpdate({ ...demande, statut: newStatut });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
  };

  const handleDemandeInfos = async () => {
    if (!infosDemandees.trim()) return;
    // Met à jour le statut et note les infos demandées
    try {
      await fetch(`${API}/demandes/${demande.id}/statut`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ statut: 'INFOS REQUISES', infosDemandees: infosDemandees.trim() })
      });
      setStatut('INFOS REQUISES');
      onUpdate({ ...demande, statut: 'INFOS REQUISES' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
  };

  const statutColor = statut==='TRAITÉE'?'green':statut==='REFUSÉE'?'red':statut==='INFOS REQUISES'?'amber':'blue';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{maxHeight:'90vh'}}>
        <div className="bg-emerald-700 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-white text-emerald-700 font-black text-sm px-3 py-1 rounded-lg">📋 DEMANDE</div>
            <div>
              <p className="text-white font-black text-sm uppercase">{demande.nom}</p>
              <p className="text-emerald-200 text-[9px] font-bold">{demande.email} · {demande.telephone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge color={statutColor}>{statut}</Badge>
            <button onClick={onClose} className="text-white/60 hover:text-white font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/10 transition-all">✕</button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-8 space-y-6">
          {/* Infos client */}
          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Informations du prospect</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoCell label="Nom & Prénom" value={demande.nom} highlight />
              <InfoCell label="Email" value={demande.email} />
              <InfoCell label="Téléphone" value={demande.telephone} />
              <InfoCell label="Wilaya" value={demande.wilaya} />
              <InfoCell label="Marque véhicule" value={demande.marque} />
              <InfoCell label="Immatriculation" value={demande.immatriculation} />
              <InfoCell label="Date de demande" value={new Date(demande.createdAt).toLocaleDateString('fr-DZ')} />
            </div>
            {demande.message && (
              <div className="mt-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Message du client</p>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-700 italic">"{demande.message}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {[
                {key:'TRAITÉE',   icon:'✅', label:'Marquer traitée', cls:'bg-green-500 hover:bg-green-600'},
                {key:'REFUSÉE',   icon:'❌', label:'Refuser',         cls:'bg-red-500 hover:bg-red-600'},
              ].map(a=>(
                <button key={a.key} onClick={()=>handleUpdateStatut(a.key)}
                  className={`${a.cls} text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2`}>
                  <span>{a.icon}</span>{a.label}
                </button>
              ))}
              {saved && <div className="flex items-center justify-center bg-emerald-100 border border-emerald-200 rounded-xl">
                <p className="text-emerald-700 font-black text-[10px] uppercase">✅ Sauvegardé</p>
              </div>}
            </div>

            {/* Demande d'infos complémentaires */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-black uppercase text-amber-800">📎 Demander des informations complémentaires</h4>
              <textarea value={infosDemandees} onChange={e=>setInfosDemandees(e.target.value)}
                placeholder="Ex: Copie carte grise, N° de châssis, date de mise en circulation..."
                rows={3}
                className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl text-sm font-semibold text-amber-800 outline-none focus:border-amber-500 resize-none transition-all" />
              <div className="flex gap-2">
                {["Copie carte grise","N° de châssis","Date MEC","Valeur vénale","Permis de conduire"].map(info=>(
                  <button key={info} onClick={()=>setInfosDemandees(p=>p?`${p}, ${info}`:info)}
                    className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-full hover:bg-amber-200 transition-all border border-amber-200">
                    + {info}
                  </button>
                ))}
              </div>
              <button onClick={handleDemandeInfos} disabled={!infosDemandees.trim()}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95">
                📤 Envoyer la demande d'informations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGERIE AGENT — Panneau de conversation
// ─────────────────────────────────────────────────────────────────────────────
const MessagerieAgent = () => {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API}/messages/toutes`, { headers: authHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) setConversations(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await fetch(`${API}/messages/${convId}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchConversations();
    pollRef.current = setInterval(fetchConversations, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    if (selected) {
      fetchMessages(selected.id);
      const poll = setInterval(() => fetchMessages(selected.id), 3000);
      return () => clearInterval(poll);
    }
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    const txt = input.trim();
    setInput('');
    try {
      await fetch(`${API}/messages/envoyer`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ conversationId: selected.id, contenu: txt, expediteur: 'agent' })
      });
      await fetchMessages(selected.id);
      await fetchConversations();
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  const nonLusCount = (conv) => {
    return conv.messages?.filter(m => m.expediteur === 'client' && !m.lu).length || 0;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <p className="text-slate-400 font-black uppercase animate-pulse">Chargement des conversations...</p>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">

      {/* Liste conversations */}
      <div className="w-80 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Conversations</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{conversations.length} client(s)</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-slate-400 font-bold text-xs uppercase">Aucune conversation</p>
            </div>
          ) : conversations.map(conv => {
            const dernierMsg = conv.messages?.[0];
            const nonLus = nonLusCount(conv);
            const isSelected = selected?.id === conv.id;
            return (
              <button key={conv.id} onClick={() => { setSelected(conv); fetchMessages(conv.id); }}
                className={`w-full px-4 py-4 text-left border-b border-slate-100 transition-all hover:bg-slate-50 ${isSelected?'bg-orange-50 border-l-4 border-l-orange-500':''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${isSelected?'bg-orange-500 text-white':'bg-slate-100 text-slate-600'}`}>
                      {(conv.user?.fullName||conv.user?.email||'?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-xs truncate">{conv.user?.fullName||conv.user?.email}</p>
                      {dernierMsg && <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{dernierMsg.expediteur==='agent'?'Vous: ':''}{dernierMsg.contenu}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {dernierMsg && <p className="text-[8px] font-bold text-slate-400">{timeAgo(dernierMsg.createdAt)}</p>}
                    {nonLus > 0 && <span className="w-5 h-5 bg-orange-500 rounded-full text-white text-[9px] font-black flex items-center justify-center">{nonLus}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Zone de chat */}
      {!selected ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50">
          <div className="text-6xl">💬</div>
          <p className="font-black text-slate-400 uppercase text-sm">Sélectionnez une conversation</p>
          <p className="text-slate-300 text-xs">pour commencer à discuter avec un client</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Header chat */}
          <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center gap-4 shrink-0">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-black text-white text-sm">
              {(selected.user?.fullName||selected.user?.email||'?')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm">{selected.user?.fullName||selected.user?.email}</p>
              <p className="text-[9px] font-bold text-slate-400">{selected.user?.email}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-[9px] font-bold text-emerald-600">En ligne</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <p className="text-slate-300 font-bold text-sm uppercase">Aucun message</p>
                <p className="text-slate-300 text-xs">Commencez la conversation</p>
              </div>
            ) : messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.expediteur==='agent'?'justify-end':'justify-start'}`}>
                {msg.expediteur==='client' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-600 text-xs mr-2 shrink-0 mt-1">
                    {(selected.user?.fullName||selected.user?.email||'?')[0].toUpperCase()}
                  </div>
                )}
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.expediteur==='agent'?'bg-orange-500 text-white rounded-tr-sm':'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                  <p className="text-sm font-semibold leading-relaxed">{msg.contenu}</p>
                  <p className={`text-[9px] font-bold mt-1 ${msg.expediteur==='agent'?'text-orange-200':'text-slate-400'}`}>{timeAgo(msg.createdAt)}</p>
                </div>
                {msg.expediteur==='agent' && (
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center font-black text-white text-xs ml-2 shrink-0 mt-1">A</div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&handleSend()}
              placeholder={`Répondre à ${selected.user?.fullName||selected.user?.email}...`}
              className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-orange-400 transition-all" />
            <button onClick={handleSend} disabled={!input.trim()||sending}
              className="w-12 h-12 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 rounded-2xl flex items-center justify-center text-white font-black transition-all active:scale-95">
              {sending ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROWS
// ─────────────────────────────────────────────────────────────────────────────
const DossierRow = ({ dossier: d, onOpen }) => {
  const region = getRegion(d.wilaya);
  const regionStyle = {Nord:'bg-blue-100 text-blue-700',Est:'bg-purple-100 text-purple-700',Ouest:'bg-teal-100 text-teal-700',Sud:'bg-amber-100 text-amber-700'};
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-slate-300 transition-all">
      <div className="px-6 py-4 flex flex-wrap items-center gap-4">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${d.sexe==='F'?'bg-pink-100 text-pink-600':'bg-blue-100 text-blue-600'}`}>
          {d.sexe==='F'?'♀':'♂'}
        </div>
        <div className="flex-1 min-w-[140px]">
          <p className="font-black text-slate-900 text-sm">{d.nomAssure||'Non renseigné'}</p>
          <p className="text-[10px] text-slate-400 font-bold font-mono">{d.numPolice}</p>
        </div>
        <div className="hidden md:block text-[10px] font-bold text-slate-500">🚗 {d.marque||'N/A'} · {d.immatriculation||'N/A'}</div>
        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full shrink-0 ${regionStyle[region]||'bg-slate-100 text-slate-600'}`}>{region}</span>
        <div className="text-right shrink-0">
          <p className="font-black text-orange-500 text-sm">{formatNum(d.quittance?.totalAPayer||0)} DZD</p>
          <p className="text-[9px] text-slate-400 font-bold">Total TTC</p>
        </div>
        <button onClick={onOpen} className="px-4 py-2 bg-slate-900 hover:bg-orange-500 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all">Voir →</button>
      </div>
    </div>
  );
};

const SinistreRow = ({ sinistre: s, onOpen }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-slate-300 transition-all">
    <div className="px-6 py-4 flex flex-wrap items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${s.statut==='VALIDÉ'?'bg-green-100 text-green-700':s.statut==='REFUSÉ'?'bg-red-100 text-red-700':s.statut==='PIÈCES REQUISES'?'bg-amber-100 text-amber-700':'bg-orange-100 text-orange-700'}`}>⚠</div>
      <div className="flex-1 min-w-[160px]">
        <p className="font-black text-slate-900 text-sm">{s.type||'Accident'}</p>
        <p className="text-[10px] text-slate-400 font-bold font-mono">{s.ref} · {s.date}</p>
        {s.lieu && <p className="text-[10px] text-slate-400 font-bold">📍 {s.lieu}</p>}
      </div>
      <Badge color={s.statut==='VALIDÉ'?'green':s.statut==='REFUSÉ'?'red':s.statut==='PIÈCES REQUISES'?'amber':'blue'}>{s.statut||'EN COURS'}</Badge>
      <button onClick={onOpen} className="px-4 py-2 bg-slate-900 hover:bg-red-500 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all">Traiter →</button>
    </div>
  </div>
);

const DemandeRow = ({ demande: d, onOpen }) => {
  const statutColor = d.statut==='TRAITÉE'?'green':d.statut==='REFUSÉE'?'red':d.statut==='INFOS REQUISES'?'amber':'teal';
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-slate-300 transition-all">
      <div className="px-6 py-4 flex flex-wrap items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg shrink-0">👤</div>
        <div className="flex-1 min-w-[160px]">
          <p className="font-black text-slate-900 text-sm">{d.nom}</p>
          <p className="text-[10px] text-slate-400 font-bold">{d.email} · {d.telephone}</p>
          <p className="text-[10px] text-slate-500 font-bold mt-0.5">🚗 {d.marque} · {d.immatriculation} · {d.wilaya}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] text-slate-400 font-bold">Reçue le</p>
          <p className="font-black text-slate-700 text-xs">{new Date(d.createdAt).toLocaleDateString('fr-DZ')}</p>
        </div>
        <Badge color={statutColor}>{d.statut}</Badge>
        <button onClick={onOpen} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all">Traiter →</button>
      </div>
      {d.message && (
        <div className="px-6 pb-4 border-t border-slate-50">
          <p className="text-[9px] font-bold text-slate-400 mt-3 italic">"{d.message}"</p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD AGENT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const DashboardAgent = ({ dossiers = [], sinistres = [], onLogout }) => {
  const [view, setView]                     = useState('stats');
  const [searchDossier, setSearchDossier]   = useState('');
  const [filterRegion, setFilterRegion]     = useState('Toutes');
  const [searchSinistre, setSearchSinistre] = useState('');
  const [filterSinistre, setFilterSinistre] = useState('Tous');
  const [searchDemande, setSearchDemande]   = useState('');
  const [filterDemande, setFilterDemande]   = useState('Tous');
  const [modalSinistre, setModalSinistre]   = useState(null);
  const [modalDossier, setModalDossier]     = useState(null);
  const [modalDemande, setModalDemande]     = useState(null);
  const [sinistresList, setSinistresList]   = useState(sinistres);
  const [demandes, setDemandes]             = useState([]);
  const [demandesLoading, setDemandesLoading] = useState(true);
  const [nonLusMsg, setNonLusMsg]           = useState(0);

  const agentInfo = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { setSinistresList(sinistres); }, [sinistres]);

  // Charger les demandes
  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        const res = await fetch(`${API}/demandes`, { headers: authHeaders() });
        const data = await res.json();
        if (Array.isArray(data)) setDemandes(data);
      } catch (err) { console.error(err); }
      finally { setDemandesLoading(false); }
    };
    fetchDemandes();
    const poll = setInterval(fetchDemandes, 15000);
    return () => clearInterval(poll);
  }, []);

  // Charger nb messages non lus
  useEffect(() => {
    const fetchNonLus = async () => {
      try {
        const res = await fetch(`${API}/messages/non-lus/count`, { headers: authHeaders() });
        const data = await res.json();
        setNonLusMsg(data.count || 0);
      } catch (err) {}
    };
    fetchNonLus();
    const poll = setInterval(fetchNonLus, 10000);
    return () => clearInterval(poll);
  }, []);

  const handleUpdateSinistre = (updated) => {
    setSinistresList(prev => prev.map(s => s.ref===updated.ref?updated:s));
    setModalSinistre(updated);
  };

  const handleUpdateDemande = (updated) => {
    setDemandes(prev => prev.map(d => d.id===updated.id?updated:d));
    setModalDemande(updated);
  };

  // Stats
  const stats = useMemo(() => {
    const total = dossiers.length;
    if (total===0) return null;
    const parSexe={H:0,F:0}, parAge={jeune:0,adulte:0,senior:0}, parRegion={Nord:0,Est:0,Ouest:0,Sud:0}, parGenre={};
    let primeTotale=0;
    dossiers.forEach(d=>{
      parSexe[d.sexe==='F'?'F':'H']++;
      const age=parseInt(d.age||30);
      if(age<=30)parAge.jeune++;else if(age<=60)parAge.adulte++;else parAge.senior++;
      const reg=getRegion(d.wilaya);
      parRegion[reg]=(parRegion[reg]||0)+1;
      const gv=d.genreVehicule||'VP';
      parGenre[gv]=(parGenre[gv]||0)+1;
      primeTotale+=parseFloat(d.quittance?.totalAPayer||0);
    });
    return {total,parSexe,parAge,parRegion,parGenre,primeTotale,primeMoyenne:primeTotale/total};
  }, [dossiers]);

  const sinistresStats = useMemo(()=>({
    total:  sinistresList.length,
    cours:  sinistresList.filter(s=>s.statut==='EN COURS').length,
    valide: sinistresList.filter(s=>s.statut==='VALIDÉ').length,
    refuse: sinistresList.filter(s=>s.statut==='REFUSÉ').length,
    pieces: sinistresList.filter(s=>s.statut==='PIÈCES REQUISES').length,
    totalRembourse: sinistresList.reduce((acc,s)=>acc+parseFloat(s.montantRembourse||0),0),
  }),[sinistresList]);

  const demandesStats = useMemo(()=>({
    total:     demandes.length,
    attente:   demandes.filter(d=>d.statut==='EN ATTENTE').length,
    traitees:  demandes.filter(d=>d.statut==='TRAITÉE').length,
    refusees:  demandes.filter(d=>d.statut==='REFUSÉE').length,
    infos:     demandes.filter(d=>d.statut==='INFOS REQUISES').length,
  }),[demandes]);

  const dossiersFiltres = useMemo(()=>dossiers.filter(d=>{
    const q=searchDossier.toLowerCase();
    const match=(d.nomAssure||'').toLowerCase().includes(q)||(d.numPolice||'').toLowerCase().includes(q)||(d.immatriculation||'').toLowerCase().includes(q);
    const region=filterRegion==='Toutes'||getRegion(d.wilaya)===filterRegion;
    return match&&region;
  }),[dossiers,searchDossier,filterRegion]);

  const sinistresFiltres = useMemo(()=>sinistresList.filter(s=>{
    const q=searchSinistre.toLowerCase();
    const match=(s.ref||'').toLowerCase().includes(q)||(s.type||'').toLowerCase().includes(q);
    const statut=filterSinistre==='Tous'||s.statut===filterSinistre||(!s.statut&&filterSinistre==='EN COURS');
    return match&&statut;
  }),[sinistresList,searchSinistre,filterSinistre]);

  const demandesFiltres = useMemo(()=>demandes.filter(d=>{
    const q=searchDemande.toLowerCase();
    const match=(d.nom||'').toLowerCase().includes(q)||(d.email||'').toLowerCase().includes(q)||(d.marque||'').toLowerCase().includes(q);
    const statut=filterDemande==='Tous'||d.statut===filterDemande;
    return match&&statut;
  }),[demandes,searchDemande,filterDemande]);

  const navItems = [
    { key:'stats',     icon:'📊', label:'Statistiques' },
    { key:'dossiers',  icon:'📁', label:`Dossiers (${dossiers.length})` },
    { key:'sinistres', icon:'🚨', label:`Sinistres (${sinistresList.length})` },
    { key:'demandes',  icon:'📋', label:`Demandes`, badge: demandesStats.attente },
    { key:'messagerie',icon:'💬', label:'Messagerie', badge: nonLusMsg },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex font-sans">

      {modalSinistre && <ModalSinistre sinistre={modalSinistre} onClose={()=>setModalSinistre(null)} onUpdate={handleUpdateSinistre} />}
      {modalDossier  && <ModalDossier  dossier={modalDossier}   onClose={()=>setModalDossier(null)} />}
      {modalDemande  && <ModalDemande  demande={modalDemande}   onClose={()=>setModalDemande(null)} onUpdate={handleUpdateDemande} />}

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0b1120] text-white flex flex-col shadow-2xl shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg">SAA</div>
            <div>
              <p className="font-black text-white text-sm leading-none">Espace Agent</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">ORASS v2.0</p>
            </div>
          </div>
          {agentInfo.fullName && (
            <div className="mt-4 bg-white/5 rounded-xl px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Connecté en tant que</p>
              <p className="text-white font-bold text-xs mt-0.5">{agentInfo.fullName}</p>
              <p className="text-slate-500 text-[9px]">{agentInfo.email}</p>
            </div>
          )}
        </div>

        <nav className="p-4 flex-1 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.key} onClick={()=>setView(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-[11px] font-black uppercase tracking-widest ${view===item.key?'bg-orange-500 text-white shadow-lg':'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${view===item.key?'bg-white text-orange-500':'bg-orange-500 text-white'}`}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Aperçu rapide</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              {label:'Dossiers', value:dossiers.length,       color:'text-orange-400'},
              {label:'Sinistres',value:sinistresList.length,  color:'text-red-400'},
              {label:'Demandes', value:demandesStats.attente, color:'text-teal-400'},
              {label:'Messages', value:nonLusMsg,             color:'text-blue-400'},
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

        {/* ── STATS ── */}
        {view==='stats' && (
          <div className="p-8 space-y-8">
            <header className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Tableau de <span className="text-orange-500">Bord</span></h1>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">Agent SAA · ORASS v2.0</p>
              </div>
              <div className="bg-white px-8 py-4 rounded-2xl shadow border border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total dossiers</p>
                <p className="text-5xl font-black text-slate-900">{stats?.total??0}</p>
              </div>
            </header>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard icon="🚨" label="Total Sinistres" value={sinistresStats.total} color="red" />
              <KpiCard icon="⏳" label="En cours" value={sinistresStats.cours} color="amber" />
              <KpiCard icon="✅" label="Validés" value={sinistresStats.valide} color="green" />
              <KpiCard icon="📋" label="Demandes en attente" value={demandesStats.attente} color="teal" />
            </div>
            {!stats ? <EmptyState icon="📭" message="Aucune donnée" sub="Les données apparaîtront après les premières souscriptions" /> : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KpiCard icon="💰" label="Prime Totale" value={`${formatNum(stats.primeTotale)} DZD`} color="blue" />
                  <KpiCard icon="📈" label="Prime Moyenne" value={`${formatNum(stats.primeMoyenne)} DZD`} color="green" />
                  <KpiCard icon="👨" label="Conducteurs H" value={`${stats.parSexe.H} (${Math.round(stats.parSexe.H/stats.total*100)}%)`} color="indigo" />
                  <KpiCard icon="👩" label="Conductrices F" value={`${stats.parSexe.F} (${Math.round(stats.parSexe.F/stats.total*100)}%)`} color="pink" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h3 className="font-black uppercase tracking-widest text-[11px] text-slate-400 mb-4">⚤ Répartition par Sexe</h3>
                    <div className="space-y-5">
                      <StatBar label="Hommes" count={stats.parSexe.H} total={stats.total} color="bg-blue-500" />
                      <StatBar label="Femmes" count={stats.parSexe.F} total={stats.total} color="bg-pink-500" />
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h3 className="font-black uppercase tracking-widest text-[11px] text-slate-400 mb-4">🎂 Segmentation par Âge</h3>
                    <div className="space-y-5">
                      <StatBar label="18 – 30 ans" count={stats.parAge.jeune} total={stats.total} color="bg-red-500" />
                      <StatBar label="31 – 60 ans" count={stats.parAge.adulte} total={stats.total} color="bg-orange-400" />
                      <StatBar label="+ 60 ans" count={stats.parAge.senior} total={stats.total} color="bg-emerald-500" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                  <h3 className="font-black uppercase tracking-widest text-[11px] text-slate-400 mb-6">🗺️ Répartition par Région</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {key:'Nord',color:'bg-blue-500',bg:'bg-blue-50',text:'text-blue-700',border:'border-blue-100'},
                      {key:'Est',color:'bg-purple-500',bg:'bg-purple-50',text:'text-purple-700',border:'border-purple-100'},
                      {key:'Ouest',color:'bg-teal-500',bg:'bg-teal-50',text:'text-teal-700',border:'border-teal-100'},
                      {key:'Sud',color:'bg-amber-500',bg:'bg-amber-50',text:'text-amber-700',border:'border-amber-100'},
                    ].map(({key,color,bg,text,border})=>{
                      const count=stats.parRegion[key]||0;
                      const pct=stats.total>0?Math.round(count/stats.total*100):0;
                      return (
                        <div key={key} className={`${bg} ${border} border rounded-2xl p-6 text-center`}>
                          <p className={`text-4xl font-black ${text}`}>{count}</p>
                          <p className={`text-[10px] font-black uppercase ${text} mt-1`}>{key}</p>
                          <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full`} style={{width:`${pct}%`}} />
                          </div>
                          <p className={`text-[9px] font-black ${text} mt-1`}>{pct}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-[#0b1120] rounded-3xl p-8 shadow-xl text-white">
                  <h3 className="font-black uppercase tracking-widest text-[11px] text-orange-400 mb-4">🧠 Recommandations ORASS</h3>
                  <div className="space-y-3">
                    {stats.parAge.jeune>stats.total*0.3&&<AlertCard type="danger" message="Taux 18-30 ans > 30% — coefficient 1.7 recommandé." />}
                    {stats.parSexe.F>stats.parSexe.H&&<AlertCard type="success" message="Majorité de conductrices — réduction 5% applicable." />}
                    {sinistresStats.cours>0&&<AlertCard type="danger" message={`${sinistresStats.cours} sinistre(s) en attente de traitement.`} />}
                    {demandesStats.attente>0&&<AlertCard type="info" message={`${demandesStats.attente} demande(s) de nouveaux clients en attente.`} />}
                    {nonLusMsg>0&&<AlertCard type="info" message={`${nonLusMsg} message(s) non lu(s) de clients.`} />}
                    <p className="text-[9px] text-slate-600 uppercase font-black italic tracking-widest pt-3 border-t border-white/10">SAA-ORASS Decision Tree v4 · Temps réel</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── DOSSIERS ── */}
        {view==='dossiers' && (
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Dossiers <span className="text-orange-500">Clients</span></h1>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">{dossiersFiltres.length} résultat(s)</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="Rechercher nom, police, immat…" value={searchDossier} onChange={e=>setSearchDossier(e.target.value)}
                className="flex-1 min-w-[240px] px-5 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-orange-400 transition-all shadow-sm" />
              {['Toutes','Nord','Est','Ouest','Sud'].map(r=>(
                <button key={r} onClick={()=>setFilterRegion(r)} className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filterRegion===r?'bg-orange-500 text-white shadow-md':'bg-white text-slate-500 border-2 border-slate-200 hover:border-orange-300'}`}>{r}</button>
              ))}
            </div>
            {dossiers.length===0?<EmptyState icon="📁" message="Aucun dossier" sub="Les dossiers apparaîtront après les premières souscriptions" />:
              dossiersFiltres.length===0?<div className="p-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center"><p className="text-slate-400 font-black uppercase">Aucun résultat.</p></div>:
              <div className="space-y-3">{dossiersFiltres.map((d,i)=><DossierRow key={i} dossier={d} onOpen={()=>setModalDossier(d)} />)}</div>
            }
          </div>
        )}

        {/* ── SINISTRES ── */}
        {view==='sinistres' && (
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Sinistres <span className="text-red-500">Déclarés</span></h1>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">{sinistresFiltres.length} sinistre(s) · {sinistresStats.cours} en attente</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <KpiCard icon="📂" label="Total" value={sinistresStats.total} color="blue" />
              <KpiCard icon="⏳" label="En cours" value={sinistresStats.cours} color="amber" />
              <KpiCard icon="✅" label="Validés" value={sinistresStats.valide} color="green" />
              <KpiCard icon="❌" label="Refusés" value={sinistresStats.refuse} color="red" />
              <KpiCard icon="📎" label="Pièces req." value={sinistresStats.pieces} color="orange" />
            </div>
            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="Rechercher par réf, type…" value={searchSinistre} onChange={e=>setSearchSinistre(e.target.value)}
                className="flex-1 min-w-[240px] px-5 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-red-400 transition-all shadow-sm" />
              {['Tous','EN COURS','VALIDÉ','REFUSÉ','PIÈCES REQUISES'].map(f=>(
                <button key={f} onClick={()=>setFilterSinistre(f)} className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filterSinistre===f?f==='VALIDÉ'?'bg-green-500 text-white':f==='REFUSÉ'?'bg-red-500 text-white':f==='PIÈCES REQUISES'?'bg-amber-500 text-white':f==='EN COURS'?'bg-blue-500 text-white':'bg-slate-900 text-white':'bg-white text-slate-500 border-2 border-slate-200 hover:border-slate-400'}`}>{f}</button>
              ))}
            </div>
            {sinistresList.length===0?<EmptyState icon="🚨" message="Aucun sinistre" sub="Les sinistres apparaîtront après les premières déclarations" />:
              sinistresFiltres.length===0?<div className="p-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center"><p className="text-slate-400 font-black uppercase">Aucun résultat.</p></div>:
              <div className="space-y-3">{sinistresFiltres.map((s,i)=><SinistreRow key={i} sinistre={s} onOpen={()=>setModalSinistre(s)} />)}</div>
            }
          </div>
        )}

        {/* ── DEMANDES ── */}
        {view==='demandes' && (
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Demandes <span className="text-emerald-600">Nouveaux Clients</span></h1>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">{demandesFiltres.length} demande(s) · {demandesStats.attente} en attente</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard icon="📋" label="Total" value={demandesStats.total} color="teal" />
              <KpiCard icon="⏳" label="En attente" value={demandesStats.attente} color="amber" />
              <KpiCard icon="✅" label="Traitées" value={demandesStats.traitees} color="green" />
              <KpiCard icon="📎" label="Infos requises" value={demandesStats.infos} color="orange" />
            </div>
            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="Rechercher nom, email, marque…" value={searchDemande} onChange={e=>setSearchDemande(e.target.value)}
                className="flex-1 min-w-[240px] px-5 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-all shadow-sm" />
              {['Tous','EN ATTENTE','TRAITÉE','REFUSÉE','INFOS REQUISES'].map(f=>(
                <button key={f} onClick={()=>setFilterDemande(f)} className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filterDemande===f?f==='TRAITÉE'?'bg-green-500 text-white':f==='REFUSÉE'?'bg-red-500 text-white':f==='INFOS REQUISES'?'bg-amber-500 text-white':f==='EN ATTENTE'?'bg-teal-500 text-white':'bg-slate-900 text-white':'bg-white text-slate-500 border-2 border-slate-200 hover:border-slate-400'}`}>{f}</button>
              ))}
            </div>
            {demandesLoading?<div className="p-16 text-center"><p className="text-slate-400 font-black uppercase animate-pulse">Chargement...</p></div>:
              demandes.length===0?<EmptyState icon="📋" message="Aucune demande" sub="Les demandes de nouveaux clients apparaîtront ici" />:
              demandesFiltres.length===0?<div className="p-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center"><p className="text-slate-400 font-black uppercase">Aucun résultat.</p></div>:
              <div className="space-y-3">{demandesFiltres.map((d,i)=><DemandeRow key={i} demande={d} onOpen={()=>setModalDemande(d)} />)}</div>
            }
          </div>
        )}

        {/* ── MESSAGERIE ── */}
        {view==='messagerie' && (
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Messagerie <span className="text-orange-500">Clients</span></h1>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                Communication en temps réel · {nonLusMsg > 0 ? `${nonLusMsg} message(s) non lu(s)` : 'Tout lu'}
              </p>
            </div>
            <MessagerieAgent />
          </div>
        )}

      </main>
    </div>
  );
};

export default DashboardAgent;
