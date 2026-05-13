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

function today() {
  return new Date().toLocaleDateString('fr-DZ');
}

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS UTILITAIRES
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
  };
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${map[color] || map.slate}`}>
      {children}
    </span>
  );
};

const SectionTitle = ({ icon, title, light }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-base">{icon}</span>
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
    blue:   'bg-blue-50 border-blue-100 text-blue-700',
    green:  'bg-green-50 border-green-100 text-green-700',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    pink:   'bg-pink-50 border-pink-100 text-pink-700',
    orange: 'bg-orange-50 border-orange-100 text-orange-700',
    red:    'bg-red-50 border-red-100 text-red-700',
    amber:  'bg-amber-50 border-amber-100 text-amber-700',
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
    danger:  dark ? 'bg-red-500/10 border-red-500/20 text-red-300'             : 'bg-red-50 border-red-200 text-red-700',
    success: dark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-green-50 border-green-100 text-green-700',
    info:    dark ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'          : 'bg-blue-50 border-blue-100 text-blue-700',
  };
  return (
    <div className={`p-4 border rounded-2xl text-[10px] font-bold leading-relaxed ${styles[type] || styles.info}`}>
      {message}
    </div>
  );
};

const EmptyState = ({ message = "Aucune donnée pour le moment", sub = "Les données apparaîtront après les premières souscriptions" }) => (
  <div className="p-20 bg-white rounded-3xl border-4 border-dashed border-slate-200 text-center">
    <p className="text-slate-300 font-black uppercase text-xl">{message}</p>
    <p className="text-slate-300 text-[11px] font-bold uppercase tracking-widest mt-3">{sub}</p>
  </div>
);

const InfoCell = ({ label, value, highlight }) => (
  <div>
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className={`font-bold mt-0.5 text-sm truncate ${highlight ? 'text-orange-500' : 'text-slate-800'}`}>
      {value || '—'}
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TAB BAR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const TabBar = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 border-b-2 border-slate-200 mb-6 overflow-x-auto">
    {tabs.map(t => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        className={`px-4 py-2.5 rounded-t-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-1.5 ${
          active === t.id
            ? 'bg-slate-900 text-white shadow-md translate-y-px'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
      >
        {t.icon && <span>{t.icon}</span>}
        {t.label}
        {t.count !== undefined && (
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-black ${
            active === t.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
          }`}>{t.count}</span>
        )}
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MODAL SINISTRE DETAIL
// ─────────────────────────────────────────────────────────────────────────────

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
    "Constat amiable signé",
    "Rapport de police / PV Gendarmerie",
    "Carte grise du véhicule",
    "Permis de conduire",
    "Photos des dommages",
    "Factures de réparation",
    "Attestation d'assurance en cours",
    "Certificat médical (si blessé)",
    "Devis de réparation",
    "Carte d'identité nationale",
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
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3001/api/sinistres/${sinistre.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        statut: updated.statut,
        montant: parseFloat(updated.montantRembourse) || 0,
        motifRefus: updated.motifRefus,
        piecesDemandees: updated.piecesDemandees,
        commentaire: updated.commentaire,
      })
    });
  } catch (err) {
    console.error('Erreur sauvegarde décision', err);
  }

  onUpdate(updated);
  setSaved(true);
  setTimeout(() => { setSaved(false); onClose(); }, 800);
};

  const addPiece = () => {
    const p = nouvellePiece.trim();
    if (p && !piecesDemandees.includes(p)) {
      setPiecesDemandees(prev => [...prev, p]);
      setNouvellePiece('');
    }
  };

  const tabs = [
    { id: 'infos',    icon: '📋', label: 'Informations' },
    { id: 'vehicules',icon: '🚗', label: 'Véhicules' },
    { id: 'circonstances', icon: '⚠️', label: 'Circonstances' },
    { id: 'croquis',  icon: '🗺️', label: 'Croquis' },
    { id: 'blesse',   icon: '🏥', label: 'Blessé(s)' },
    { id: 'decision', icon: '⚖️', label: 'Décision Admin' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: '92vh' }}>

        {/* Header */}
        <div className="bg-slate-900 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 text-white font-black text-sm px-3 py-1 rounded-lg tracking-widest uppercase">🚨 SIN</div>
            <div>
              <p className="text-white font-black text-sm uppercase tracking-wider">{sinistre.ref}</p>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{sinistre.type} · {sinistre.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge color={
              sinistre.statut === 'VALIDÉ' ? 'green' :
              sinistre.statut === 'REFUSÉ' ? 'red' :
              sinistre.statut === 'PIÈCES REQUISES' ? 'amber' : 'blue'
            }>{sinistre.statut || 'EN COURS'}</Badge>
            <button onClick={onClose} className="text-slate-400 hover:text-red-400 font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/5 transition-all">✕ Fermer</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-5 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-1.5 ${
                tab === t.id ? 'text-red-600 border-red-500 bg-white' : 'text-slate-400 border-transparent hover:text-slate-700 hover:bg-white'
              }`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-8 py-6">

          {/* ── INFOS ── */}
          {tab === 'infos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCell label="Référence"  value={sinistre.ref} highlight />
                <InfoCell label="Date"       value={sinistre.date} />
                <InfoCell label="Type"       value={sinistre.type} />
                <InfoCell label="Statut"     value={sinistre.statut || 'EN COURS'} />
              </div>
              <div className="h-px bg-slate-100" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Informations générales</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoCell label="Date de l'accident"  value={d.date} />
                <InfoCell label="Heure"               value={d.heure} />
                <InfoCell label="Lieu"                value={d.lieu} />
                <InfoCell label="Dégâts tiers"        value={d.degTiers === 'oui' ? 'Oui' : d.degTiers === 'non' ? 'Non' : '—'} />
                <InfoCell label="Témoin"              value={d.temoin} />
                <InfoCell label="PV Gendarmerie"      value={d.pvGend === 'oui' ? '✅ Oui' : d.pvGend === 'non' ? '❌ Non' : '—'} />
                <InfoCell label="Rapport Police"      value={d.pvPolice === 'oui' ? '✅ Oui' : d.pvPolice === 'non' ? '❌ Non' : '—'} />
                <InfoCell label="Fait à"              value={d.faitA} />
                <InfoCell label="Le"                  value={d.faitLe} />
              </div>
              <div className="h-px bg-slate-100" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assuré déclarant</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoCell label="Nom"        value={d.nomAssure} />
                <InfoCell label="Profession" value={d.profession} />
                <InfoCell label="Téléphone"  value={d.tel} />
                <InfoCell label="Adresse"    value={d.adresseAssure} />
              </div>
              <div className="h-px bg-slate-100" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conducteur du véhicule assuré</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoCell label="Conducteur habituel" value={d.conducteur?.habituel === 'oui' ? '✅ Oui' : '❌ Non'} />
                <InfoCell label="Réside chez assuré"  value={d.conducteur?.reside === 'oui' ? '✅ Oui' : '❌ Non'} />
                <InfoCell label="Date de naissance"   value={d.conducteur?.dob} />
                <InfoCell label="Permis n°"           value={d.conducteur?.permis} />
                <InfoCell label="Catégorie"           value={d.conducteur?.categorie} />
                <InfoCell label="Délivré le"          value={d.conducteur?.delivreLe} />
                <InfoCell label="Par la wilaya de"    value={d.conducteur?.wilaya} />
              </div>
              {sinistre.dateDecision && (
                <>
                  <div className="h-px bg-slate-100" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Historique décision</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InfoCell label="Date décision"      value={sinistre.dateDecision} />
                    <InfoCell label="Décision"           value={sinistre.statut} highlight />
                    {sinistre.montantRembourse > 0 && <InfoCell label="Montant remboursé" value={`${formatNum(sinistre.montantRembourse)} DZD`} highlight />}
                    {sinistre.commentaire && <InfoCell label="Commentaire" value={sinistre.commentaire} />}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── VEHICULES ── */}
          {tab === 'vehicules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[['A', d.vehiculeA], ['B', d.vehiculeB]].map(([label, v]) => (
                <div key={label} className={`rounded-2xl border-2 p-6 ${label === 'A' ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}`}>
                  <h3 className={`text-sm font-black uppercase mb-4 ${label === 'A' ? 'text-blue-800' : 'text-red-800'}`}>
                    Véhicule {label}
                  </h3>
                  {v ? (
                    <div className="grid grid-cols-2 gap-3">
                      <InfoCell label="Marque / Type"    value={v.marque} />
                      <InfoCell label="Immatriculation"  value={v.immat} />
                      <InfoCell label="Venant de"        value={v.from} />
                      <InfoCell label="Allant vers"      value={v.to} />
                      <InfoCell label="N° Attestation"   value={v.attestation} />
                      <InfoCell label="Compagnie"        value={v.compagnie} />
                      <InfoCell label="N° Police"        value={v.police} />
                      <InfoCell label="Valable du"       value={v.valDu} />
                      <InfoCell label="Au"               value={v.valAu} />
                      <InfoCell label="Agence"           value={v.agence} />
                      <InfoCell label="Conducteur"       value={`${v.condPrenom || ''} ${v.condNom || ''}`.trim() || '—'} />
                      <InfoCell label="Adresse"          value={v.condAdresse} />
                      <div className="col-span-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Dégâts apparents</p>
                        <p className="font-semibold text-sm mt-1 text-slate-800">{v.degats || '—'}</p>
                      </div>
                      {v.obs && (
                        <div className="col-span-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Observations</p>
                          <p className="font-semibold text-sm mt-1 text-slate-800">{v.obs}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">Aucune information renseignée</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── CIRCONSTANCES ── */}
          {tab === 'circonstances' && (
            <div className="space-y-6">
              <p className="text-sm text-slate-600 font-semibold">
                Description : <span className="text-slate-900">{d.circDesc || '—'}</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[['A', d.circonstancesA, 'bg-blue-50 border-blue-200 text-blue-800'], ['B', d.circonstancesB, 'bg-red-50 border-red-200 text-red-800']].map(([label, circ, cls]) => (
                  <div key={label} className={`rounded-2xl border-2 p-5 ${cls.split(' ').slice(0, 2).join(' ')}`}>
                    <h3 className={`text-xs font-black uppercase mb-3 ${cls.split(' ')[2]}`}>
                      Cases cochées — Véhicule {label} ({Array.isArray(circ) ? circ.length : 0})
                    </h3>
                    {Array.isArray(circ) && circ.length > 0 ? (
                      <div className="space-y-2">
                        {circ.map(i => (
                          <div key={i} className="flex items-start gap-2 text-[11px]">
                            <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                            <span className="text-slate-700 font-semibold">{CIRCUMSTANCES[i] || `Case ${i}`}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">Aucune case cochée</p>
                    )}
                  </div>
                ))}
              </div>
              {/* Dégâts tiers */}
              {(d.degatsNature || d.degatsProp) && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
                  <h3 className="text-xs font-black uppercase text-amber-800 mb-3">Dégâts matériels tiers</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoCell label="Nature des dégâts"    value={d.degatsNature} />
                    <InfoCell label="Propriétaire / Adresse" value={d.degatsProp} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CROQUIS ── */}
          {tab === 'croquis' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  🗺️ Croquis de l'accident — dessiné par l'assuré
                </h3>
                {/* On essaie d'afficher le canvas data si disponible, sinon un placeholder */}
                {d.croquis ? (
                  <img src={d.croquis} alt="Croquis accident" className="w-full rounded-xl border border-slate-200" />
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center" style={{ height: 340 }}>
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <p className="text-slate-400 font-black uppercase text-sm">Croquis non transmis numériquement</p>
                      <p className="text-slate-300 text-xs">Le croquis papier est joint au constat amiable</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                Le croquis indique la position des véhicules, les voies empruntées et le point de choc initial
              </p>
            </div>
          )}

          {/* ── BLESSÉ ── */}
          {tab === 'blesse' && (
            <div className="space-y-4">
              {d.blesse && (d.blesse.nom || d.blesse.blessures) ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                  <h3 className="text-xs font-black uppercase text-red-800 mb-4">🏥 Informations sur le(s) blessé(s)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InfoCell label="Nom & Prénom"          value={d.blesse.nom} />
                    <InfoCell label="Âge"                   value={d.blesse.age} />
                    <InfoCell label="Adresse"               value={d.blesse.adresse} />
                    <InfoCell label="Profession"            value={d.blesse.profession} />
                    <InfoCell label="N° Sécurité Sociale"   value={d.blesse.secu} />
                    <InfoCell label="Situation au moment"   value={d.blesse.situation} />
                    <InfoCell label="1ers soins / Hospi"    value={d.blesse.hospi} />
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Nature et gravité des blessures</p>
                      <p className="font-semibold text-sm mt-1 text-red-800">{d.blesse.blessures || '—'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-10 flex flex-col items-center gap-3">
                  <div className="text-4xl">✅</div>
                  <p className="font-black uppercase text-green-800 text-sm">Aucun blessé déclaré</p>
                  <p className="text-green-600 text-xs text-center">L'accident ne comporte pas de victimes corporelles selon la déclaration.</p>
                </div>
              )}
            </div>
          )}

          {/* ── DÉCISION ADMIN ── */}
          {tab === 'decision' && (
            <div className="space-y-6">

              {/* Choix de décision */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Choisir une décision</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'valide',  icon: '✅', label: 'Valider le remboursement', color: 'green', desc: 'Le sinistre est reconnu. Saisir le montant à rembourser.' },
                    { key: 'refuse',  icon: '❌', label: 'Refuser le sinistre',       color: 'red',   desc: 'Le sinistre est rejeté. Indiquer le motif de refus.' },
                    { key: 'pieces',  icon: '📎', label: 'Demander des pièces justif.', color: 'amber', desc: 'Dossier incomplet. Spécifier les pièces manquantes.' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setDecision(opt.key)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all ${
                        decision === opt.key
                          ? opt.key === 'valide' ? 'bg-green-500 border-green-500 text-white shadow-lg scale-105'
                          : opt.key === 'refuse' ? 'bg-red-500 border-red-500 text-white shadow-lg scale-105'
                          : 'bg-amber-500 border-amber-500 text-white shadow-lg scale-105'
                          : 'bg-white border-slate-200 hover:border-slate-400 text-slate-700'
                      }`}
                    >
                      <div className="text-2xl mb-2">{opt.icon}</div>
                      <p className="font-black text-xs uppercase tracking-widest mb-1">{opt.label}</p>
                      <p className={`text-[10px] leading-relaxed ${decision === opt.key ? 'opacity-80' : 'text-slate-400'}`}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Saisie selon décision */}
              {decision === 'valide' && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-green-800 mb-2">💰 Montant du remboursement</h3>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-green-700 block mb-1">Montant (DZD)</label>
                      <input
                        type="number"
                        value={montant}
                        onChange={e => setMontant(e.target.value)}
                        placeholder="ex : 85000"
                        className="w-full px-4 py-3 rounded-xl border-2 border-green-300 bg-white text-2xl font-black text-green-800 outline-none focus:border-green-500 transition-all"
                      />
                    </div>
                    <div className="text-green-600 font-black text-sm pb-3">DZD</div>
                  </div>
                  {montant && (
                    <div className="bg-green-100 border border-green-300 rounded-xl p-3 text-center">
                      <p className="text-green-800 font-black text-lg">{formatNum(montant)} DZD</p>
                      <p className="text-green-600 text-[10px] uppercase font-bold">Montant validé pour remboursement</p>
                    </div>
                  )}
                </div>
              )}

              {decision === 'refuse' && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-red-800 mb-2">❌ Motif de refus</h3>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-red-700 block mb-1">Motif</label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[
                        "Sinistre non couvert par la police",
                        "Exclusion contractuelle applicable",
                        "Délai de déclaration dépassé",
                        "Faute intentionnelle de l'assuré",
                        "Conduite sous l'emprise d'alcool",
                        "Absence de permis valide",
                        "Dommages antérieurs au contrat",
                        "Déclaration frauduleuse suspectée",
                      ].map(m => (
                        <button key={m} onClick={() => setMotifRefus(m)}
                          className={`text-left px-3 py-2 rounded-xl border text-[10px] font-bold transition-all ${
                            motifRefus === m ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-red-200 text-red-700 hover:border-red-400'
                          }`}>
                          {m}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={motifRefus}
                      onChange={e => setMotifRefus(e.target.value)}
                      placeholder="Ou saisir un motif personnalisé..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-red-200 bg-white text-sm font-semibold text-red-800 outline-none focus:border-red-400 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {decision === 'pieces' && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-amber-800 mb-2">📎 Pièces justificatives requises</h3>

                  {/* Prédéfinies */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-2">Sélectionner parmi les pièces courantes</p>
                    <div className="grid grid-cols-2 gap-2">
                      {PIECES_PREDEFINIES.map(p => (
                        <button key={p}
                          onClick={() => setPiecesDemandees(prev =>
                            prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                          )}
                          className={`text-left px-3 py-2 rounded-xl border text-[10px] font-bold transition-all flex items-center gap-2 ${
                            piecesDemandees.includes(p)
                              ? 'bg-amber-500 border-amber-500 text-white'
                              : 'bg-white border-amber-200 text-amber-800 hover:border-amber-400'
                          }`}>
                          <span>{piecesDemandees.includes(p) ? '✓' : '+'}</span>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pièce personnalisée */}
                  <div className="flex gap-3 mt-3">
                    <input
                      type="text"
                      value={nouvellePiece}
                      onChange={e => setNouvellePiece(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addPiece()}
                      placeholder="Ajouter une pièce personnalisée..."
                      className="flex-1 px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-white text-sm font-semibold text-amber-800 outline-none focus:border-amber-500 transition-all"
                    />
                    <button onClick={addPiece}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase rounded-xl transition-all">
                      + Ajouter
                    </button>
                  </div>

                  {/* Liste sélectionnée */}
                  {piecesDemandees.length > 0 && (
                    <div className="bg-white border border-amber-200 rounded-xl p-4 space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-2">Pièces demandées ({piecesDemandees.length})</p>
                      {piecesDemandees.map(p => (
                        <div key={p} className="flex items-center justify-between text-sm bg-amber-50 px-3 py-2 rounded-lg">
                          <span className="font-semibold text-amber-800">📎 {p}</span>
                          <button onClick={() => setPiecesDemandees(prev => prev.filter(x => x !== p))}
                            className="text-red-400 hover:text-red-600 font-black transition-all">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Commentaire général */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Commentaire interne (optionnel)</label>
                <textarea
                  value={commentaire}
                  onChange={e => setCommentaire(e.target.value)}
                  placeholder="Notes internes sur ce dossier sinistre..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-700 outline-none focus:border-slate-400 resize-none transition-all"
                  rows={3}
                />
              </div>

              {/* Bouton enregistrer */}
              {decision && (
                <button
                  onClick={handleSave}
                  className={`w-full py-4 rounded-2xl font-black uppercase text-sm tracking-widest transition-all active:scale-95 ${
                    saved ? 'bg-emerald-500 text-white'
                    : decision === 'valide' ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                    : decision === 'refuse' ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg'
                  }`}
                >
                  {saved ? '✅ Décision enregistrée !' : '💾 Enregistrer la décision'}
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
// MODAL DOSSIER DETAIL (Police / Devis complet)
// ─────────────────────────────────────────────────────────────────────────────
const ModalDossier = ({ dossier: d, onClose }) => {
  const [tab, setTab] = useState('assure');

  const tabs = [
    { id: 'assure',    icon: '👤', label: 'Assuré' },
    { id: 'vehicule',  icon: '🚗', label: 'Véhicule' },
    { id: 'garanties', icon: '🛡️', label: 'Garanties' },
    { id: 'quittance', icon: '💰', label: 'Quittance' },
    { id: 'police',    icon: '📄', label: 'Police' },
  ];

  const q = d.quittance || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: '92vh' }}>

        {/* Header */}
        <div className="bg-slate-900 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 text-white font-black text-sm px-3 py-1 rounded-lg tracking-widest uppercase">📁 DOS</div>
            <div>
              <p className="text-white font-black text-sm uppercase tracking-wider">{d.nomAssure || 'Dossier client'}</p>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{d.numPolice} · {d.marque || 'N/A'} {d.immatriculation || ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-400 font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/5 transition-all">✕ Fermer</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-5 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-1.5 ${
                tab === t.id ? 'text-orange-600 border-orange-500 bg-white' : 'text-slate-400 border-transparent hover:text-slate-700 hover:bg-white'
              }`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-8 py-6">

          {tab === 'assure' && (
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Informations Assuré</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoCell label="Qualité"          value={d.qualite} />
                <InfoCell label="Nom & Prénom"      value={d.nomAssure} highlight />
                <InfoCell label="Code Assuré"       value={d.codeAssure} />
                <InfoCell label="Type Pièce"        value={d.typePiece} />
                <InfoCell label="N° Pièce"          value={d.numPieceIdentite} />
                <InfoCell label="Profession"        value={d.profession} />
                <InfoCell label="Activité"          value={d.activite} />
                <InfoCell label="Téléphone"         value={d.telephone} />
                <InfoCell label="Email"             value={d.email} />
                <InfoCell label="Adresse"           value={d.adresse} />
                <InfoCell label="Ville"             value={d.ville} />
                <InfoCell label="Wilaya"            value={d.wilaya} />
                <InfoCell label="Région"            value={getRegion(d.wilaya)} />
                <InfoCell label="Zone tarifaire"    value={d.zone ? `Zone ${d.zone}` : '—'} />
                <InfoCell label="Chiffre d'affaire" value={d.chiffreAffaire} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">Conducteur</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoCell label="Sexe"        value={d.sexe === 'F' ? 'Femme' : 'Homme'} />
                <InfoCell label="Âge"         value={d.age ? `${d.age} ans` : '—'} />
                <InfoCell label="Date Permis" value={d.datePermis} />
              </div>
            </div>
          )}

          {tab === 'vehicule' && (
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identification Véhicule</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoCell label="Genre"           value={d.genreVehicule} highlight />
                <InfoCell label="Marque"          value={d.marque} />
                <InfoCell label="Type"            value={d.typeVehicule} />
                <InfoCell label="Immatriculation" value={d.immatriculation} />
                <InfoCell label="M.E.C"           value={d.dateMEC} />
                <InfoCell label="Dernier Contrôle" value={d.dernierControle} />
                <InfoCell label="Énergie"         value={d.energie} />
                <InfoCell label="Usage"           value={d.usage} />
                <InfoCell label="N° Châssis"      value={d.chassis} />
                <InfoCell label="N° Moteur"       value={d.moteur} />
                <InfoCell label="Carrosserie"     value={d.carrosserie} />
                <InfoCell label="Puissance"       value={d.puissance} />
                <InfoCell label="Tonnage"         value={d.tonnage} />
                <InfoCell label="Cylindrée"       value={d.cylindree} />
                <InfoCell label="Vitesse"         value={d.vitesse} />
                <InfoCell label="Nb Places"       value={d.places} />
                <InfoCell label="Turbo"           value={d.turbo ? 'Oui' : 'Non'} />
                <InfoCell label="Avec Remorque"   value={d.avecRemorque ? 'Oui' : 'Non'} />
                <InfoCell label="Mat. Inflammables" value={d.matInflammableVeh ? 'Oui' : 'Non'} />
                <InfoCell label="Délégataire Crédit" value={d.delegataireCredit} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">Valeurs SMP</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCell label="Valeur Vénale"     value={d.valeurVenale ? `${formatNum(d.valeurVenale)} DZD` : '—'} highlight />
                <InfoCell label="Valeur à Neuf"     value={d.valeurANeuf ? `${formatNum(d.valeurANeuf)} DZD` : '—'} />
                <InfoCell label="Capital Assuré"    value={d.capitalAssure ? `${formatNum(d.capitalAssure)} DZD` : '—'} />
                <InfoCell label="Valeur Auto-Radio" value={d.valeurAutoRadio ? `${formatNum(d.valeurAutoRadio)} DZD` : '—'} />
              </div>
            </div>
          )}

          {tab === 'garanties' && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Garanties Souscrites</h3>
              {d.garanties ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key:'rc',  label:'RC – Responsabilité Civile'   },
                    { key:'dr',  label:'DR – Défense et Recours'      },
                    { key:'bdg', label:'BDG – Bris de Glace'          },
                    { key:'vol', label:'VOL – Vol du Véhicule'        },
                    { key:'inc', label:'INC – Incendie'               },
                    { key:'dc',  label:'DC – Dommages Collision'      },
                    { key:'pt',  label:'PT – Personnes Transportées'  },
                    { key:'ir',  label:'IR – Individuelle Conducteur' },
                    { key:'tc',  label:'TC – Tous Chocs'              },
                  ].map(g => (
                    <div key={g.key} className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 ${
                      d.garanties[g.key] ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <span className="font-black text-xs uppercase">{g.label}</span>
                      <span className={`text-sm ${d.garanties[g.key] ? 'text-green-400' : 'text-slate-300'}`}>
                        {d.garanties[g.key] ? '✓' : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-400">Aucune information sur les garanties</p>}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <InfoCell label="Majoration Permis"     value={d.majPermis ? `${d.majPermis} DZD` : '0 DZD'} />
                <InfoCell label="Majoration Âge"        value={d.majAge ? `${d.majAge} DZD` : '0 DZD'} />
                <InfoCell label="Matières Inflammables" value={d.majMatieres ? `${d.majMatieres} DZD` : '0 DZD'} />
              </div>
            </div>
          )}

          {tab === 'quittance' && (
            <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-400 border-b border-white/10 pb-3 mb-4">Décomposition de la Quittance</h3>
              {[
                ['Prime de Base',              q.primeBase],
                ['+ Garanties Facultatives',   q.totalOptions],
                ['Prime avant Réduction',      q.primeAvantReduction, true],
                ['− Réduction Commerciale',    q.montantReduction],
                ['Prime après Réduction',      q.primeApresReduction],
                ['+ Majorations',              q.totalMajorations],
                ['Prime Nette (HT)',           q.primeNette, true],
                ['Accessoires Auto-Radio',     q.accessoires],
                ['Taxes / Prime (19%)',        q.taxesPrime],
                ['Taxes / Accessoires (19%)',  q.taxeAccessoires],
                ['Total Taxes',                q.totalTaxes, true],
                ['Timbre de Dimension',        q.timbreDimension],
                ['Timbre Gradué',              q.timbreGradue],
              ].map(([l, v, a]) => (
                <div key={l} className={`flex justify-between items-center py-2 border-b border-white/10 ${a ? 'border-t border-orange-500/30 mt-1' : ''}`}>
                  <span className={`text-xs font-bold uppercase ${a ? 'text-orange-300' : 'text-slate-400'}`}>{l}</span>
                  <span className={`font-mono font-black tabular-nums ${a ? 'text-orange-300' : 'text-slate-300'} text-sm`}>{v || '0.00'} DZD</span>
                </div>
              ))}
              <div className="border-t-2 border-orange-500 pt-4 flex justify-between items-center">
                <span className="text-white font-black uppercase text-sm">TOTAL À PAYER (TTC)</span>
                <span className="text-orange-400 font-black text-3xl tabular-nums">{q.totalAPayer || '—'} DZD</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 border-t border-white/10 pt-4">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-500">Apport (12%)</p>
                  <p className="text-white font-black">{q.apport || '—'} DZD</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-500">Gestion</p>
                  <p className="text-white font-black">{q.gestion || '—'} DZD</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-500">Total Commissions</p>
                  <p className="text-orange-400 font-black">{q.totalCommissions || '—'} DZD</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'police' && (
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Informations Police</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoCell label="N° Police"        value={d.numPolice} highlight />
                <InfoCell label="N° Avenant"       value={d.numAvenant} />
                <InfoCell label="N° Garantie"      value={d.numGarantie} />
                <InfoCell label="Réf. Dossier"     value={d.refDossier} />
                <InfoCell label="Convention"       value={d.convention} />
                <InfoCell label="Agence"           value={d.agence} />
                <InfoCell label="Type"             value={d.type} />
                <InfoCell label="Tarif"            value={d.tarif} />
                <InfoCell label="Régime"           value={d.regime} />
                <InfoCell label="Réduction"        value={d.reduction} />
                <InfoCell label="Fractionnement"   value={d.fractionnement} />
                <InfoCell label="Durée (mois)"     value={d.duree} />
                <InfoCell label="Date Effet"       value={d.dateEffet} />
                <InfoCell label="Date Échéance"    value={d.dateEcheance} />
                <InfoCell label="Souscrit le"      value={d.souscritLe} />
                <InfoCell label="Contrat Ferme"    value={d.contratFerme ? 'Oui' : 'Non'} />
                <InfoCell label="Exonération"      value={d.exoneration} />
                <InfoCell label="Type Dimension"   value={d.typeDimension} />
                <InfoCell label="Nb Dimensions"    value={d.nombreDimension} />
                <InfoCell label="Statut"           value={d.status || 'ÉMIS'} highlight />
                <InfoCell label="Créé le"          value={d.createdAt} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DOSSIER ROW
// ─────────────────────────────────────────────────────────────────────────────
const DossierRow = ({ dossier: d, onOpen }) => {
  const region = getRegion(d.wilaya);
  const regionStyle = {
    Nord: 'bg-blue-100 text-blue-700',
    Est:  'bg-purple-100 text-purple-700',
    Ouest:'bg-teal-100 text-teal-700',
    Sud:  'bg-amber-100 text-amber-700',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-slate-300 transition-all">
      <div className="px-6 py-4 flex flex-wrap items-center gap-4">
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
        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full shrink-0 ${regionStyle[region] || 'bg-slate-100 text-slate-600'}`}>{region}</span>
        <div className="text-right shrink-0">
          <p className="font-black text-orange-500 text-sm">{formatNum(d.quittance?.totalAPayer || 0)} DZD</p>
          <p className="text-[9px] text-slate-400 font-bold">Total TTC</p>
        </div>
        <button onClick={onOpen}
          className="px-4 py-2 bg-slate-900 hover:bg-orange-500 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all">
          Voir →
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SINISTRE ROW
// ─────────────────────────────────────────────────────────────────────────────
const SinistreRow = ({ sinistre: s, onOpen }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-slate-300 transition-all">
    <div className="px-6 py-4 flex flex-wrap items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
        s.statut === 'VALIDÉ' ? 'bg-green-100 text-green-700' :
        s.statut === 'REFUSÉ' ? 'bg-red-100 text-red-700' :
        s.statut === 'PIÈCES REQUISES' ? 'bg-amber-100 text-amber-700' :
        'bg-orange-100 text-orange-700'
      }`}>⚠</div>
      <div className="flex-1 min-w-[160px]">
        <p className="font-black text-slate-900 text-sm">{s.type || 'Accident'}</p>
        <p className="text-[10px] text-slate-400 font-bold font-mono">{s.ref} · {s.date}</p>
        {s.lieu && <p className="text-[10px] text-slate-400 font-bold">📍 {s.lieu}</p>}
      </div>
      <div className="text-center shrink-0">
        <p className="font-black text-slate-900 text-sm">
          {s.montantRembourse > 0 ? `${formatNum(s.montantRembourse)} DZD` : '—'}
        </p>
        <p className="text-[9px] text-slate-400 font-bold uppercase">Remboursement</p>
      </div>
      <Badge color={
        s.statut === 'VALIDÉ' ? 'green' :
        s.statut === 'REFUSÉ' ? 'red' :
        s.statut === 'PIÈCES REQUISES' ? 'amber' : 'blue'
      }>{s.statut || 'EN COURS'}</Badge>
      <button onClick={onOpen}
        className="px-4 py-2 bg-slate-900 hover:bg-red-500 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all">
        Traiter →
      </button>
    </div>
    {/* Pièces demandées */}
    {s.piecesDemandees?.length > 0 && (
      <div className="px-6 pb-4 border-t border-slate-100">
        <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mt-3 mb-2">Pièces demandées</p>
        <div className="flex flex-wrap gap-2">
          {s.piecesDemandees.map(p => (
            <span key={p} className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">📎 {p}</span>
          ))}
        </div>
      </div>
    )}
    {s.motifRefus && (
      <div className="px-6 pb-4 border-t border-slate-100">
        <p className="text-[9px] font-black uppercase tracking-widest text-red-600 mt-3 mb-1">Motif de refus</p>
        <p className="text-xs font-semibold text-red-700">{s.motifRefus}</p>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const DashboardAdmin = ({ dossiers = [], sinistres = [], onLogout }) => {
  const [view, setView]                   = useState('stats');
  const [admins, setAdmins]               = useState(['admin@saa.dz', 'manager@saa.dz']);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [searchDossier, setSearchDossier] = useState('');
  const [filterRegion, setFilterRegion]   = useState('Toutes');
  const [searchSinistre, setSearchSinistre] = useState('');
  const [filterSinistre, setFilterSinistre] = useState('Tous');
  const [modalSinistre, setModalSinistre] = useState(null);
  const [modalDossier, setModalDossier]   = useState(null);
  const [sinistresList, setSinistresList] = useState(sinistres);

  // Sync si props change
  React.useEffect(() => { setSinistresList(sinistres); }, [sinistres]);

  const handleUpdateSinistre = (updated) => {
    setSinistresList(prev => prev.map(s => s.ref === updated.ref ? updated : s));
    setModalSinistre(updated);
  };

  // ── STATS ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = dossiers.length;
    if (total === 0) return null;
    const parSexe   = { H: 0, F: 0 };
    const parAge    = { jeune: 0, adulte: 0, senior: 0 };
    const parRegion = { Nord: 0, Est: 0, Ouest: 0, Sud: 0 };
    const parWilaya = {};
    const parGenre  = {};
    let primeTotale = 0;

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

    return { total, parSexe, parAge, parRegion, parWilaya, parGenre, primeTotale, primeMoyenne: primeTotale / total };
  }, [dossiers]);

  const sinistresStats = useMemo(() => ({
    total:  sinistresList.length,
    cours:  sinistresList.filter(s => s.statut === 'EN COURS').length,
    valide: sinistresList.filter(s => s.statut === 'VALIDÉ').length,
    refuse: sinistresList.filter(s => s.statut === 'REFUSÉ').length,
    pieces: sinistresList.filter(s => s.statut === 'PIÈCES REQUISES').length,
    totalRembourse: sinistresList.reduce((acc, s) => acc + parseFloat(s.montantRembourse || 0), 0),
  }), [sinistresList]);

  // ── FILTRES ─────────────────────────────────────────────────────────────────
  const dossiersFiltres = useMemo(() => dossiers.filter(d => {
    const q = searchDossier.toLowerCase();
    const match = (d.nomAssure || '').toLowerCase().includes(q) ||
      (d.numPolice || '').toLowerCase().includes(q) ||
      (d.immatriculation || '').toLowerCase().includes(q) ||
      (d.wilaya || '').toLowerCase().includes(q);
    const region = filterRegion === 'Toutes' || getRegion(d.wilaya) === filterRegion;
    return match && region;
  }), [dossiers, searchDossier, filterRegion]);

  const sinistresFiltres = useMemo(() => sinistresList.filter(s => {
    const q = searchSinistre.toLowerCase();
    const match = (s.ref || '').toLowerCase().includes(q) ||
      (s.type || '').toLowerCase().includes(q) ||
      (s.lieu || '').toLowerCase().includes(q);
    const statut = filterSinistre === 'Tous' || s.statut === filterSinistre || (!s.statut && filterSinistre === 'EN COURS');
    return match && statut;
  }), [sinistresList, searchSinistre, filterSinistre]);

  const handleAddAdmin = () => {
    const email = newAdminEmail.trim();
    if (email && !admins.includes(email)) {
      setAdmins(p => [...p, email]);
      setNewAdminEmail('');
    }
  };

  const navItems = [
    { key: 'stats',     icon: '📊', label: 'Statistiques' },
    { key: 'dossiers',  icon: '📁', label: `Dossiers (${dossiers.length})` },
    { key: 'sinistres', icon: '🚨', label: `Sinistres (${sinistresList.length})` },
    { key: 'admins',    icon: '👥', label: 'Admins' },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex font-sans">

      {/* Modals */}
      {modalSinistre && (
        <ModalSinistre
          sinistre={modalSinistre}
          onClose={() => setModalSinistre(null)}
          onUpdate={handleUpdateSinistre}
        />
      )}
      {modalDossier && (
        <ModalDossier
          dossier={modalDossier}
          onClose={() => setModalDossier(null)}
        />
      )}

      {/* ════ SIDEBAR ════ */}
      <aside className="w-64 bg-[#0b1120] text-white flex flex-col shadow-2xl shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg">SAA</div>
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

        {/* Aperçu rapide */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Aperçu rapide</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Dossiers',   value: dossiers.length,             color: 'text-orange-400' },
              { label: 'Sinistres',  value: sinistresList.length,        color: 'text-red-400'    },
              { label: 'En cours',   value: sinistresStats.cours,        color: 'text-amber-400'  },
              { label: 'Validés',    value: sinistresStats.valide,       color: 'text-green-400'  },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 rounded-xl p-2 text-center">
                <p className={`text-sm font-black ${color}`}>{value}</p>
                <p className="text-[8px] font-bold text-slate-600 uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onLogout}
          className="m-4 p-3 border border-white/10 rounded-xl text-slate-500 hover:text-red-400 hover:border-red-400/30 font-black text-[10px] uppercase tracking-widest transition-all text-center">
          ← Déconnexion
        </button>
      </aside>

      {/* ════ CONTENU PRINCIPAL ════ */}
      <main className="flex-1 overflow-y-auto">

        {/* ─── STATISTIQUES ─── */}
        {view === 'stats' && (
          <div className="p-8 space-y-8">
            <header className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                  Aide à la <span className="text-orange-500">Décision</span>
                </h1>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                  SAA-ORASS Decision Tree v4 · Temps réel
                </p>
              </div>
              <div className="bg-white px-8 py-4 rounded-2xl shadow border border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total dossiers</p>
                <p className="text-5xl font-black text-slate-900">{stats?.total ?? 0}</p>
              </div>
            </header>

            {/* Sinistres KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard icon="🚨" label="Total Sinistres"      value={sinistresStats.total}                                    color="red"    />
              <KpiCard icon="⏳" label="En cours"             value={sinistresStats.cours}                                    color="amber"  />
              <KpiCard icon="✅" label="Validés"              value={sinistresStats.valide}                                   color="green"  />
              <KpiCard icon="💰" label="Total remboursé"      value={`${formatNum(sinistresStats.totalRembourse)} DZD`}       color="blue"   />
            </div>

            {!stats ? <EmptyState /> : (
              <>
                {/* KPIs dossiers */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KpiCard icon="💰" label="Prime Totale"   value={`${formatNum(stats.primeTotale)} DZD`}   color="blue"   />
                  <KpiCard icon="📈" label="Prime Moyenne"  value={`${formatNum(stats.primeMoyenne)} DZD`}  color="green"  />
                  <KpiCard icon="👨" label="Conducteurs H"  value={`${stats.parSexe.H} (${Math.round(stats.parSexe.H / stats.total * 100)}%)`} color="indigo" />
                  <KpiCard icon="👩" label="Conductrices F" value={`${stats.parSexe.F} (${Math.round(stats.parSexe.F / stats.total * 100)}%)`} color="pink"   />
                </div>

                {/* Sexe + Âge */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <SectionTitle icon="⚤" title="Répartition par Sexe" />
                    <div className="space-y-5">
                      <StatBar label="Hommes" count={stats.parSexe.H} total={stats.total} color="bg-blue-500" />
                      <StatBar label="Femmes" count={stats.parSexe.F} total={stats.total} color="bg-pink-500" />
                    </div>
                    <DonutChart h={stats.parSexe.H} total={stats.total} />
                    <AlertCard type={stats.parSexe.F > stats.parSexe.H ? 'success' : 'info'}
                      message={stats.parSexe.F > stats.parSexe.H
                        ? '✅ Profils féminins dominants — prime réductible de 5%'
                        : '📌 Profils masculins dominants — tarification standard'} dark={false} />
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <SectionTitle icon="🎂" title="Segmentation par Âge" />
                    <div className="space-y-5">
                      <StatBar label="18 – 30 ans (risque élevé)" count={stats.parAge.jeune}  total={stats.total} color="bg-red-500"     />
                      <StatBar label="31 – 60 ans (standard)"     count={stats.parAge.adulte} total={stats.total} color="bg-orange-400"  />
                      <StatBar label="+ 60 ans (prudent)"         count={stats.parAge.senior} total={stats.total} color="bg-emerald-500" />
                    </div>
                    <div className={`mt-6 p-4 rounded-2xl border text-[10px] font-bold leading-relaxed ${
                      stats.parAge.jeune > stats.total * 0.3
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-green-50 border-green-100 text-green-700'}`}>
                      {stats.parAge.jeune > stats.total * 0.3
                        ? '⚠️ Taux 18-30 ans > 30% — coefficient majoré 1.7 recommandé'
                        : '✅ Taux de jeunes normal — coefficient standard 1.5 maintenu'}
                    </div>
                  </div>
                </div>

                {/* Régions */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                  <SectionTitle icon="🗺️" title="Répartition par Région" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key:'Nord',  color:'bg-blue-500',   bg:'bg-blue-50',   text:'text-blue-700',   border:'border-blue-100'   },
                      { key:'Est',   color:'bg-purple-500', bg:'bg-purple-50', text:'text-purple-700', border:'border-purple-100' },
                      { key:'Ouest', color:'bg-teal-500',   bg:'bg-teal-50',   text:'text-teal-700',   border:'border-teal-100'   },
                      { key:'Sud',   color:'bg-amber-500',  bg:'bg-amber-50',  text:'text-amber-700',  border:'border-amber-100'  },
                    ].map(({ key, color, bg, text, border }) => {
                      const count = stats.parRegion[key] || 0;
                      const pct   = stats.total > 0 ? Math.round(count / stats.total * 100) : 0;
                      return (
                        <div key={key} className={`${bg} ${border} border rounded-2xl p-6 text-center`}>
                          <p className={`text-4xl font-black ${text}`}>{count}</p>
                          <p className={`text-[10px] font-black uppercase ${text} mt-1`}>{key}</p>
                          <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className={`text-[9px] font-black ${text} mt-1`}>{pct}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Genre véhicule + Recommandations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <SectionTitle icon="🚗" title="Genre de Véhicule" />
                    <div className="space-y-4">
                      {Object.entries(stats.parGenre).sort((a,b)=>b[1]-a[1]).map(([genre, count]) => {
                        const cols = { VP:'bg-blue-500', VU:'bg-purple-500', MOTO:'bg-amber-500', TC:'bg-green-500' };
                        return <StatBar key={genre} label={genre} count={count} total={stats.total} color={cols[genre] || 'bg-slate-500'} />;
                      })}
                    </div>
                  </div>
                  <div className="bg-[#0b1120] rounded-3xl p-8 shadow-xl text-white">
                    <SectionTitle icon="🧠" title="Recommandations ORASS" light />
                    <div className="space-y-3">
                      {stats.parAge.jeune > stats.total * 0.3 && (
                        <AlertCard type="danger"  message="Taux 18-30 ans > 30% — coefficient 1.7 recommandé." />
                      )}
                      {stats.parSexe.F > stats.parSexe.H && (
                        <AlertCard type="success" message="Majorité de conductrices — réduction 5% applicable." />
                      )}
                      {stats.parRegion.Sud > stats.total * 0.2 && (
                        <AlertCard type="info" message="Présence Zone Sud significative — coefficient 0.80 appliqué." />
                      )}
                      {sinistresStats.cours > 0 && (
                        <AlertCard type="danger" message={`${sinistresStats.cours} sinistre(s) en attente de traitement.`} />
                      )}
                      {sinistresStats.totalRembourse > 0 && (
                        <AlertCard type="info" message={`Total remboursé : ${formatNum(sinistresStats.totalRembourse)} DZD`} />
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

        {/* ─── DOSSIERS ─── */}
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
            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="Rechercher nom, police, immat, wilaya…"
                value={searchDossier} onChange={e => setSearchDossier(e.target.value)}
                className="flex-1 min-w-[240px] px-5 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-orange-400 transition-all shadow-sm" />
              {['Toutes','Nord','Est','Ouest','Sud'].map(r => (
                <button key={r} onClick={() => setFilterRegion(r)}
                  className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    filterRegion === r ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-orange-300'
                  }`}>{r}</button>
              ))}
            </div>
            {dossiers.length === 0 ? (
              <EmptyState message="Aucun dossier enregistré" sub="Les dossiers apparaîtront après les premières souscriptions" />
            ) : dossiersFiltres.length === 0 ? (
              <div className="p-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-black uppercase">Aucun dossier ne correspond à la recherche.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dossiersFiltres.map((d, i) => (
                  <DossierRow key={i} dossier={d} onOpen={() => setModalDossier(d)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── SINISTRES ─── */}
        {view === 'sinistres' && (
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                  Sinistres <span className="text-red-500">Déclarés</span>
                </h1>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                  {sinistresFiltres.length} sinistre{sinistresFiltres.length !== 1 ? 's' : ''} · {sinistresStats.cours} en attente
                </p>
              </div>
            </div>

            {/* KPIs sinistres */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <KpiCard icon="📂" label="Total"           value={sinistresStats.total}                              color="blue"   />
              <KpiCard icon="⏳" label="En cours"        value={sinistresStats.cours}                              color="amber"  />
              <KpiCard icon="✅" label="Validés"         value={sinistresStats.valide}                             color="green"  />
              <KpiCard icon="❌" label="Refusés"         value={sinistresStats.refuse}                             color="red"    />
              <KpiCard icon="📎" label="Pièces req."     value={sinistresStats.pieces}                             color="orange" />
            </div>
            {sinistresStats.totalRembourse > 0 && (
              <div className="bg-slate-900 rounded-2xl p-5 flex justify-between items-center">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total remboursements validés</p>
                <p className="text-orange-400 text-2xl font-black tabular-nums">{formatNum(sinistresStats.totalRembourse)} DZD</p>
              </div>
            )}

            {/* Filtres */}
            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="Rechercher par réf, type, lieu…"
                value={searchSinistre} onChange={e => setSearchSinistre(e.target.value)}
                className="flex-1 min-w-[240px] px-5 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-red-400 transition-all shadow-sm" />
              {['Tous', 'EN COURS', 'VALIDÉ', 'REFUSÉ', 'PIÈCES REQUISES'].map(f => (
                <button key={f} onClick={() => setFilterSinistre(f)}
                  className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    filterSinistre === f
                      ? f === 'VALIDÉ' ? 'bg-green-500 text-white'
                      : f === 'REFUSÉ' ? 'bg-red-500 text-white'
                      : f === 'PIÈCES REQUISES' ? 'bg-amber-500 text-white'
                      : f === 'EN COURS' ? 'bg-blue-500 text-white'
                      : 'bg-slate-900 text-white'
                      : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-slate-400'
                  }`}>{f}</button>
              ))}
            </div>

            {sinistresList.length === 0 ? (
              <EmptyState message="Aucun sinistre déclaré" sub="Les sinistres apparaîtront après les premières déclarations clients" />
            ) : sinistresFiltres.length === 0 ? (
              <div className="p-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-black uppercase">Aucun sinistre ne correspond aux filtres.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sinistresFiltres.map((s, i) => (
                  <SinistreRow key={i} sinistre={s} onOpen={() => setModalSinistre(s)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ADMINS ─── */}
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

export default DashboardAdmin;