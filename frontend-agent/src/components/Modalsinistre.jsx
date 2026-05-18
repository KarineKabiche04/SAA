import React, { useState } from 'react';

const API = 'http://localhost:3001/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const CIRCUMSTANCES = [
  "Heurtait à l'arrière (même sens, même file)",
  "Roulait même sens, file différente",
  "Roulait en sens inverse",
  "Venait d'une chaussée différente",
  "Venait de droite (carrefour)",
  "S'engageait dans une place à sens giratoire",
  "Roulait sur place à sens giratoire",
  "En stationnement",
  "Quittait un stationnement",
  "Prenait un stationnement",
  "Reculait",
  "Doublait",
  "Dépassement irrégulier",
  "Changeait de file",
  "Virait à droite",
  "Virait à gauche",
  "S'engageait dans un parking / lieu privé",
  "Sortait d'un parking / lieu privé",
  "Empiétait sur voie réservée / sens inverse",
  "Roulait en sens interdit",
  "Inobservation d'un signe de priorité",
  "Faisait un demi-tour",
  "Ouvrait une portière",
];

const SINISTRE_STATUT = {
  EN_COURS: { label: 'En cours',   color: 'blue'  },
  TRAITE:   { label: 'Validé ✅',  color: 'green' },
  REFUSE:   { label: 'Refusé ❌',  color: 'red'   },
};

const Badge = ({ children, color = 'slate' }) => {
  const map = {
    green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    red:   'bg-red-100 text-red-700 border-red-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    blue:  'bg-blue-100 text-blue-800 border-blue-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${map[color] || map.slate}`}>
      {children}
    </span>
  );
};

// Petite cellule d'info
const Cell = ({ label, value, mono, highlight, full }) => (
  <div className={full ? 'col-span-full' : ''}>
    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
    <p className={`text-xs font-bold ${highlight ? 'text-orange-500' : 'text-slate-800'} ${mono ? 'font-mono' : ''} break-words`}>
      {value || <span className="text-slate-300">—</span>}
    </p>
  </div>
);

// Section avec titre
const Section = ({ icon, title, children, color = 'slate' }) => {
  const colors = {
    slate: 'border-slate-200 bg-slate-50',
    blue:  'border-blue-200 bg-blue-50',
    red:   'border-red-200 bg-red-50',
    amber: 'border-amber-200 bg-amber-50',
    green: 'border-emerald-200 bg-emerald-50',
  };
  return (
    <div className={`border-2 rounded-2xl overflow-hidden ${colors[color]}`}>
      <div className={`px-5 py-3 border-b ${colors[color]} flex items-center gap-2`}>
        <span className="text-base">{icon}</span>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

// Grille de circonstances cochées
const CirconstancesGrid = ({ indices = [], label }) => {
  if (!indices.length) return (
    <p className="text-xs text-slate-400 italic">Aucune case cochée</p>
  );
  return (
    <div className="space-y-1">
      {indices.map(i => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-green-500 text-sm mt-0.5 shrink-0">✓</span>
          <span className="text-xs text-slate-700">{i + 1}) {CIRCUMSTANCES[i]}</span>
        </div>
      ))}
    </div>
  );
};

// Bloc véhicule A ou B
const VehiculeBlock = ({ data = {}, label, colorClass }) => (
  <div className={`rounded-xl border-2 p-4 ${colorClass}`}>
    <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${label === 'A' ? 'text-blue-700' : 'text-red-700'}`}>
      Véhicule {label}
    </p>
    <div className="grid grid-cols-2 gap-3">
      <Cell label="Marque / Type"            value={data.marque}       highlight />
      <Cell label="Immatriculation"           value={data.immat}        mono highlight />
      <Cell label="Venant de"                 value={data.from} />
      <Cell label="Allant vers"               value={data.to} />
      <Cell label="N° Attestation assurance"  value={data.attestation}  mono />
      <Cell label="Compagnie"                 value={data.compagnie} />
      <Cell label="N° Police"                 value={data.police}       mono />
      <Cell label="Agence"                    value={data.agence} />
      <Cell label="Conducteur"                value={`${data.condNom || ''} ${data.condPrenom || ''}`.trim() || null} />
      <Cell label="Adresse conducteur"        value={data.condAdresse}  full />
      {data.degats && <Cell label="Dégâts apparents" value={data.degats} full />}
      {data.obs    && <Cell label="Observations"     value={data.obs}   full />}
    </div>
  </div>
);

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────
export default function ModalSinistre({ sinistre, onClose, onUpdate }) {
  const [tab,      setTab]      = useState('constat');
  const [decision, setDecision] = useState(null);
  const [montant,  setMontant]  = useState('');
  const [motif,    setMotif]    = useState('');
  const [saved,    setSaved]    = useState(false);

  // ── Parser contenu ────────────────────────────────────────
  let c = {};
  try {
    c = JSON.parse(typeof sinistre.contenu === 'string' ? sinistre.contenu : JSON.stringify(sinistre.contenu || {}));
  } catch { c = {}; }

  const conducteur       = c.conducteur       || {};
  const vehiculeA        = c.vehiculeA        || {};
  const vehiculeB        = c.vehiculeB        || {};
  const circonstancesA   = c.circonstancesA   || [];
  const circonstancesB   = c.circonstancesB   || [];
  const blesse           = c.blesse           || {};

  // ── Sauvegarder décision ──────────────────────────────────
  const handleSave = async () => {
    const statutPrisma = decision === 'valide' ? 'TRAITE' : 'REFUSE';
    try {
      await fetch(`${API}/sinistres/${sinistre.id}`, {
        method:  'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          statut:     statutPrisma,
          montant:    decision === 'valide' ? parseFloat(montant) || 0 : 0,
          motifRefus: decision === 'refuse' ? motif : '',
        }),
      });
    } catch (e) { console.error(e); }

    onUpdate({ ...sinistre, statut: statutPrisma, montant: parseFloat(montant) || 0 });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const tabs = [
    { id: 'constat',    icon: '📋', label: 'Constat'       },
    { id: 'assure',     icon: '👤', label: 'Assuré'        },
    { id: 'vehicules',  icon: '🚗', label: 'Véhicules'     },
    { id: 'circonstances', icon: '📌', label: 'Circonstances'},
    { id: 'blesse',     icon: '🩺', label: 'Blessé(s)'     },
    { id: 'photos', icon: '📷', label: 'Photos' },
    { id: 'decision',   icon: '⚖️',  label: 'Décision'      },
  ];

  const statInfo = SINISTRE_STATUT[sinistre.statut] || { label: sinistre.statut, color: 'blue' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: '92vh' }}>

        {/* ── HEADER ── */}
        <div className="bg-slate-900 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white text-xl">🚨</div>
            <div>
              <p className="text-white font-black text-sm uppercase tracking-wide">
                {sinistre.ref}
              </p>
              <p className="text-slate-400 text-[9px] font-bold mt-0.5">
                {c.date ? `📅 ${c.date}` : ''} {c.heure ? `⏰ ${c.heure}` : ''} {c.lieu ? `📍 ${c.lieu}` : ''}
              </p>
              {sinistre.user && (
                <p className="text-orange-400 text-[9px] font-bold">
                  👤 {sinistre.user.fullName || sinistre.user.email}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge color={statInfo.color}>{statInfo.label}</Badge>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-400 font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/5"
            >✕ Fermer</button>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-5 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-1.5
                ${tab === t.id
                  ? 'text-orange-600 border-orange-500 bg-white'
                  : 'text-slate-400 border-transparent hover:text-slate-700 hover:bg-white'
                }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── CONTENU ── */}
        <div className="overflow-y-auto flex-1 p-8 space-y-5">

          {/* ── CONSTAT ── */}
          {tab === 'constat' && (
            <div className="space-y-4">
              <Section icon="📅" title="Informations générales">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Cell label="Date de l'accident" value={c.date}    highlight />
                  <Cell label="Heure"               value={c.heure} />
                  <Cell label="Lieu précis"          value={c.lieu}  highlight />
                  <Cell label="Dégâts tiers (hors A/B)" value={c.degTiers === 'oui' ? '⚠ Oui' : c.degTiers === 'non' ? 'Non' : null} />
                  <Cell label="PV Gendarmerie"       value={c.pvGend === 'oui' ? '✓ Oui' : c.pvGend === 'non' ? 'Non' : null} />
                  <Cell label="Rapport de Police"    value={c.pvPolice === 'oui' ? '✓ Oui' : c.pvPolice === 'non' ? 'Non' : null} />
                  {c.temoin && <Cell label="Témoin(s)" value={c.temoin} full />}
                </div>
              </Section>

              {c.circDesc && (
                <Section icon="📝" title="Description des circonstances" color="blue">
                  <p className="text-sm text-slate-700 leading-relaxed">{c.circDesc}</p>
                </Section>
              )}

              {(c.degatsNature || c.degatsProp) && (
                <Section icon="🏗️" title="Dégâts matériels tiers" color="amber">
                  <div className="grid grid-cols-2 gap-4">
                    {c.degatsNature && <Cell label="Nature et importance" value={c.degatsNature} full />}
                    {c.degatsProp   && <Cell label="Propriétaire"          value={c.degatsProp}  full />}
                  </div>
                </Section>
              )}

              <Section icon="✍️" title="Signature">
                <div className="grid grid-cols-2 gap-4">
                  <Cell label="Fait à" value={c.faitA} />
                  <Cell label="Le"     value={c.faitLe} />
                </div>
              </Section>
            </div>
          )}

          {/* ── ASSURÉ ── */}
          {tab === 'assure' && (
            <div className="space-y-4">
              <Section icon="👤" title="Assuré / Déclarant">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Cell label="Nom de l'assuré" value={c.nomAssure}     highlight />
                  <Cell label="Profession"       value={c.profession} />
                  <Cell label="Téléphone"        value={c.tel}          mono />
                  <Cell label="Adresse"          value={c.adresseAssure} full />
                </div>
              </Section>

              <Section icon="🪪" title="Conducteur du véhicule assuré" color="blue">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Cell label="Conducteur habituel" value={conducteur.habituel === 'oui' ? '✓ Oui' : conducteur.habituel === 'non' ? 'Non' : null} />
                  <Cell label="Réside chez l'assuré" value={conducteur.reside === 'oui' ? '✓ Oui' : conducteur.reside === 'non' ? 'Non' : null} />
                  <Cell label="Date de naissance"   value={conducteur.dob} />
                  <Cell label="N° Permis"            value={conducteur.permis}    mono />
                  <Cell label="Catégorie"            value={conducteur.categorie} />
                  <Cell label="Délivré le"           value={conducteur.delivreLe} />
                  <Cell label="Par la wilaya de"     value={conducteur.wilaya} />
                </div>
              </Section>
            </div>
          )}

          {/* ── VÉHICULES ── */}
          {tab === 'vehicules' && (
            <div className="space-y-4">
              <VehiculeBlock
                data={vehiculeA}
                label="A"
                colorClass="border-blue-200 bg-blue-50"
              />
              <VehiculeBlock
                data={vehiculeB}
                label="B"
                colorClass="border-red-200 bg-red-50"
              />
            </div>
          )}

          {/* ── CIRCONSTANCES ── */}
          {tab === 'circonstances' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Section icon="🔵" title={`Véhicule A — ${circonstancesA.length} case(s)`} color="blue">
                  <CirconstancesGrid indices={circonstancesA} label="A" />
                </Section>
                <Section icon="🔴" title={`Véhicule B — ${circonstancesB.length} case(s)`} color="red">
                  <CirconstancesGrid indices={circonstancesB} label="B" />
                </Section>
              </div>

              {/* Résumé des totaux */}
              <div className="bg-slate-900 rounded-2xl p-5 flex items-center justify-center gap-12">
                <div className="text-center">
                  <p className="text-blue-300 text-[9px] font-black uppercase">Total A</p>
                  <p className="text-white font-black text-4xl">{circonstancesA.length}</p>
                </div>
                <div className="text-slate-600 text-3xl">vs</div>
                <div className="text-center">
                  <p className="text-red-300 text-[9px] font-black uppercase">Total B</p>
                  <p className="text-white font-black text-4xl">{circonstancesB.length}</p>
                </div>
              </div>

              {/* Aide à la décision */}
              {(circonstancesA.length > 0 || circonstancesB.length > 0) && (
                <div className={`rounded-2xl p-4 border-2 ${
                  circonstancesA.length > circonstancesB.length
                    ? 'bg-red-50 border-red-200'
                    : circonstancesA.length < circonstancesB.length
                    ? 'bg-green-50 border-green-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Analyse de responsabilité</p>
                  <p className="font-bold text-sm">
                    {circonstancesA.length > circonstancesB.length
                      ? `⚠ Véhicule A a plus de cases cochées (${circonstancesA.length} vs ${circonstancesB.length}) — responsabilité probable du conducteur A`
                      : circonstancesA.length < circonstancesB.length
                      ? `✓ Véhicule B a plus de cases cochées (${circonstancesB.length} vs ${circonstancesA.length}) — tiers (B) probablement responsable`
                      : `⚖️ Égalité (${circonstancesA.length} cases chacun) — responsabilité partagée probable`
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── BLESSÉ(S) ── */}
          {tab === 'blesse' && (
            <div className="space-y-4">
              {blesse.nom ? (
                <Section icon="🩺" title="Informations blessé(s)" color="amber">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Cell label="Nom et Prénom"   value={blesse.nom}       highlight />
                    <Cell label="Âge"              value={blesse.age ? `${blesse.age} ans` : null} />
                    <Cell label="Adresse"          value={blesse.adresse} />
                    <Cell label="Profession"       value={blesse.profession} />
                    <Cell label="N° Sécu / CNAS"   value={blesse.secu}      mono />
                    <Cell label="Situation au moment" value={blesse.situation} />
                    <Cell label="Nature des blessures" value={blesse.blessures} full highlight />
                    <Cell label="1ers soins / Hospitalisation" value={blesse.hospi} full />
                  </div>
                </Section>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="font-black text-green-700 uppercase">Aucun blessé déclaré</p>
                  <p className="text-green-600 text-xs mt-1">Le client n'a pas renseigné de blessé dans sa déclaration</p>
                </div>
              )}
            </div>
          )}

         {/* ── PHOTOS ── */}
        {tab === 'photos' && (
          <div className="space-y-4">
            {c.photos && c.photos.length > 0 ? (
              <>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  {c.photos.length} photo(s) soumise(s) par le client
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {c.photos.map((p, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                      <img
                        src={p.url}
                        alt={p.name || `Photo ${i + 1}`}
                        className="w-full object-cover"
                        style={{ maxHeight: 220 }}
                      />
                      <p className="text-[9px] font-bold text-slate-400 px-3 py-2 bg-slate-50 truncate">
                        📷 {p.name || `Photo ${i + 1}`}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                <p className="text-4xl mb-3">📷</p>
                <p className="font-black text-slate-400 uppercase">Aucune photo soumise</p>
                <p className="text-slate-300 text-xs mt-1">Le client n'a pas joint de photos à sa déclaration</p>
              </div>
            )}
          </div>
        )}

          {/* ── DÉCISION AGENT ── */}
          {tab === 'decision' && (
            <div className="space-y-5">

              {/* Statut actuel */}
              {sinistre.statut !== 'EN_COURS' && (
                <div className={`rounded-2xl p-5 border-2 ${
                  sinistre.statut === 'TRAITE' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                }`}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Décision enregistrée</p>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{sinistre.statut === 'TRAITE' ? '✅' : '❌'}</span>
                    <div>
                      <p className="font-black text-lg">
                        {sinistre.statut === 'TRAITE' ? 'Sinistre validé' : 'Sinistre refusé'}
                      </p>
                      {sinistre.montant > 0 && (
                        <p className="text-green-700 font-black text-xl">
                          Remboursement : {Number(sinistre.montant).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DZD
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Récap rapide pour aider la décision */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                <Cell label="Date sinistre"     value={c.date}       highlight />
                <Cell label="Lieu"              value={c.lieu} />
                <Cell label="Véhicule assuré"   value={`${vehiculeA.marque || '—'} · ${vehiculeA.immat || '—'}`} />
                <Cell label="Dégâts assuré"     value={vehiculeA.degats} />
                <Cell label="Cases A / B"       value={`${circonstancesA.length} / ${circonstancesB.length}`} />
                <Cell label="Blessé"            value={blesse.nom || 'Aucun'} />
              </div>

              {/* Boutons décision */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'valide', icon: '✅', label: 'Valider & Rembourser', cls: decision === 'valide' ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-green-300 hover:bg-green-50' },
                  { key: 'refuse', icon: '❌', label: 'Refuser le sinistre',  cls: decision === 'refuse' ? 'bg-red-500 border-red-500 text-white'   : 'bg-white border-slate-200 text-slate-700 hover:border-red-300 hover:bg-red-50'   },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setDecision(opt.key)}
                    disabled={sinistre.statut !== 'EN_COURS'}
                    className={`p-5 rounded-2xl border-2 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${opt.cls}`}
                  >
                    <div className="text-3xl mb-2">{opt.icon}</div>
                    <p className="font-black text-sm uppercase tracking-wide">{opt.label}</p>
                  </button>
                ))}
              </div>

              {/* Montant si validation */}
              {decision === 'valide' && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Montant à rembourser (DZD)
                  </label>
                  <input
                    type="number"
                    value={montant}
                    onChange={e => setMontant(e.target.value)}
                    placeholder="Ex : 150000"
                    className="w-full px-5 py-4 border-2 border-green-300 rounded-2xl text-3xl font-black text-green-800 outline-none focus:border-green-500 transition-all"
                  />
                  <p className="text-[9px] text-green-600 font-bold">
                    {montant ? `= ${Number(montant).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DZD` : ''}
                  </p>
                </div>
              )}

              {/* Motif si refus */}
              {decision === 'refuse' && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Motif de refus (obligatoire)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[
                      'Responsabilité du client établie',
                      'Garantie non souscrite',
                      'Déclaration hors délai',
                      'Fausse déclaration',
                      'Exclusion contractuelle',
                    ].map(m => (
                      <button
                        key={m}
                        onClick={() => setMotif(p => p ? `${p}. ${m}` : m)}
                        className="text-[9px] font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full border border-red-200 hover:bg-red-200 transition-all"
                      >+ {m}</button>
                    ))}
                  </div>
                  <textarea
                    value={motif}
                    onChange={e => setMotif(e.target.value)}
                    rows={3}
                    placeholder="Détaillez le motif de refus..."
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-2xl text-sm font-semibold text-red-800 outline-none focus:border-red-400 resize-none"
                  />
                </div>
              )}

              {/* Bouton confirmer */}
              {decision && (
                <button
                  onClick={handleSave}
                  disabled={
                    (decision === 'valide' && !montant) ||
                    (decision === 'refuse' && !motif.trim())
                  }
                  className={`w-full py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg ${
                    saved
                      ? 'bg-emerald-500 text-white'
                      : decision === 'valide'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {saved
                    ? '✅ Décision enregistrée !'
                    : decision === 'valide'
                    ? `💾 Valider — Rembourser ${montant ? Number(montant).toLocaleString('fr-DZ') + ' DZD' : '…'}`
                    : '💾 Confirmer le refus'
                  }
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}