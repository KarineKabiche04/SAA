import React, { useState, useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// RÉFÉRENTIELS
// ─────────────────────────────────────────────────────────────────────────────
const API = 'http://localhost:3001/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const WILAYAS = [
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

const REF_ZONES = [
  { id:'01', label:'Zone 01 – Nord',  coef:1.00 },
  { id:'02', label:'Zone 02 – Est',   coef:0.95 },
  { id:'03', label:'Zone 03 – Ouest', coef:0.95 },
  { id:'04', label:'Zone 04 – Sud',   coef:0.80 },
];

const REF_GENRES = [
  { id:'VP',   label:'VP – Voiture Particulière', base:12500 },
  { id:'VU',   label:'VU – Véhicule Utilitaire',  base:19000 },
  { id:'MOTO', label:'MOTO – Deux Roues',          base:8500  },
  { id:'TC',   label:'TC – Transport en Commun',   base:28000 },
];

const REF_REDUCTIONS = [
  { id:'AUCUNE',      label:'Aucune',              value:0    },
  { id:'FLOTTE',      label:'Flotte –10%',         value:0.10 },
  { id:'MULTIRISQUE', label:'Multi-risque –5%',    value:0.05 },
  { id:'ANCIENNETE',  label:'Ancienneté –15%',     value:0.15 },
];

const GARANTIES_CONFIG = [
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

// ─────────────────────────────────────────────────────────────────────────────
// MOTEUR DE CALCUL
// ─────────────────────────────────────────────────────────────────────────────
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
  return {
    primeBase, totalOptions, primeAvantReduction, montantReduction,
    primeApresReduction, totalMajorations, primeNette, accessoires,
    taxesPrime, taxeAccessoires, totalTaxes, timbreDimension, timbreGradue,
    totalAPayer, apport, gestion: 850,
    totalCommissions: apport + 850,
  };
}

const fmt = n => Number(n || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAT INITIAL
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL = {
  // Assuré
  qualite:'MONSIEUR', nomAssure:'', codeAssure:'',
  typePiece:'CNI', numPieceIdentite:'',
  adresse:'', ville:'', wilaya:'16-Alger',
  profession:'EMPLOYÉ', activite:'PRIVÉE', chiffreAffaire:'',
  telephone:'', email:'',
  // Conducteur
  sexe:'H', age:'30', datePermis:'',
  // Contrat
  agence:'', convention:'9901 - INDIVIDUELLE', sousConvention:'', refDossier:'',
  dateEffet: new Date().toISOString().split('T')[0],
  dateEcheance:'', duree:'12', fractionnement:'ANNUEL',
  tarif:'TARIF STANDARD', type:'NOUVELLE AFFAIRE',
  reduction:'AUCUNE', regime:'RÉGIME NORMAL',
  typeDimension:'Standard', nombreDimension:'1', exoneration:'Aucune',
  contratFerme: false,
  // Véhicule
  marque:'', typeVehicule:'', immatriculation:'',
  dateMEC:'', dernierControle:'', energie:'ESSENCE',
  turbo:false, avecRemorque:false, matInflammableVeh:false,
  delegataireCredit:'', chassis:'', moteur:'', carrosserie:'',
  puissance:'', tonnage:'', cylindree:'', vitesse:'', places:'5',
  genreVehicule:'VP', usage:'USAGE PRIVÉ', zone:'01',
  // SMP
  valeurVenale:'1500000', valeurANeuf:'2500000',
  valeurAutoRadio:'0', capitalAssure:'2500000',
  // Garanties
  garanties:{ rc:true, dr:true, bdg:false, vol:false, inc:false, dc:false, pt:false, ir:false, tc:false },
  // Majorations
  majPermis:'0', majAge:'0', majMatieres:'0',
};

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS UI
// ─────────────────────────────────────────────────────────────────────────────
const F = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    {children}
  </div>
);

const Input = ({ label, name, value, onChange, type='text', placeholder='', readOnly=false }) => (
  <F label={label}>
    <input type={type} name={name} value={value ?? ''} onChange={onChange}
      placeholder={placeholder} readOnly={readOnly}
      className={`h-9 px-3 rounded-xl border text-xs font-bold outline-none transition-all
        ${readOnly ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-800 focus:border-[#1a3a6b]'}`}
    />
  </F>
);

const Select = ({ label, name, value, onChange, options, isObj=false }) => (
  <F label={label}>
    <select name={name} value={value ?? ''} onChange={onChange}
      className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#1a3a6b] cursor-pointer">
      {options.map(o => (
        <option key={isObj ? o.id : o} value={isObj ? o.id : o}>
          {isObj ? o.label : o}
        </option>
      ))}
    </select>
  </F>
);

const Chk = ({ label, name, checked, onChange, disabled=false }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} disabled={disabled}
      className="w-4 h-4 accent-[#1a3a6b] rounded" />
    <span className={`text-xs font-bold ${disabled ? 'text-slate-400' : 'text-slate-700'}`}>{label}</span>
  </label>
);

const QRow = ({ label, value, accent, large }) => (
  <div className={`flex justify-between items-center py-1.5 border-b border-white/10 ${large ? 'py-3' : ''}`}>
    <span className={`text-[10px] font-bold uppercase tracking-wider ${accent ? 'text-orange-300' : 'text-slate-400'}`}>{label}</span>
    <span className={`font-mono font-black tabular-nums ${large ? 'text-2xl text-white' : accent ? 'text-orange-300' : 'text-slate-300 text-xs'}`}>
      {fmt(value)} <span className="text-[9px] opacity-60">DZD</span>
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const ModalNouveauClient = ({ onClose, onSuccess }) => {
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [done, setDone]     = useState(null); // { numeroPolice }

  const quittance = useMemo(() => computeQuittance(form), [
    form.genreVehicule, form.zone, form.age, form.sexe, form.garanties,
    form.valeurVenale, form.valeurAutoRadio, form.reduction,
    form.majPermis, form.majAge, form.majMatieres, form.nombreDimension,
  ]);

  const upd = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      if (type === 'checkbox' && name in prev.garanties)
        return { ...prev, garanties: { ...prev.garanties, [name]: checked } };
      if (type === 'checkbox') return { ...prev, [name]: checked };
      return { ...prev, [name]: value };
    });
  };

  // Auto-calcul date échéance quand dateEffet ou duree change
  const handleDateEffetChange = (e) => {
    const { value } = e.target;
    setForm(prev => {
      const d = new Date(value);
      d.setMonth(d.getMonth() + parseInt(prev.duree || 12));
      return { ...prev, dateEffet: value, dateEcheance: d.toISOString().split('T')[0] };
    });
  };

  const handleDureeChange = (e) => {
    const duree = e.target.value;
    setForm(prev => {
      if (!prev.dateEffet) return { ...prev, duree };
      const d = new Date(prev.dateEffet);
      d.setMonth(d.getMonth() + parseInt(duree || 12));
      return { ...prev, duree, dateEcheance: d.toISOString().split('T')[0] };
    });
  };

  const STEPS = [
    { label:'Assuré & Contrat', icon:'👤' },
    { label:'Véhicule',         icon:'🚗' },
    { label:'Garanties & SMP',  icon:'🛡️' },
    { label:'Quittance',        icon:'💰' },
  ];

  const handleEmettre = async () => {
    setError('');
    if (!form.nomAssure)      return setError('Le nom de l\'assuré est obligatoire.');
    if (!form.marque)         return setError('La marque du véhicule est obligatoire.');
    if (!form.immatriculation) return setError('L\'immatriculation est obligatoire.');
    if (!form.dateEffet)      return setError('La date d\'effet est obligatoire.');
    if (!form.dateEcheance)   return setError('La date d\'échéance est obligatoire.');

    setLoading(true);
    try {
      const res = await fetch(`${API}/polices/creer`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          ...form,
          primeNette:   quittance.primeNette,
          montantTotal: quittance.totalAPayer,
          taxes:        quittance.totalTaxes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur serveur');
      setDone({ numeroPolice: data.numeroPolice });
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Rendu confirmation ──
  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">✅</div>
          <h2 className="font-black text-emerald-700 text-xl uppercase mb-2">Police émise !</h2>
          <p className="text-slate-400 text-sm mb-6">La police a été créée avec succès en base.</p>
          <div className="bg-slate-900 rounded-2xl p-5 mb-6">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2">N° Police</p>
            <p className="text-white font-mono font-black text-2xl">{done.numeroPolice}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-amber-700 text-[10px] font-bold leading-relaxed">
              ℹ Le client peut maintenant créer son compte en ligne en utilisant ce numéro de police.
            </p>
          </div>
          <button onClick={onClose}
            className="w-full py-3 bg-[#1a3a6b] hover:bg-[#0f2247] text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: '92vh' }}>

        {/* ── HEADER ── */}
        <div className="bg-gradient-to-r from-[#0b1120] to-[#1a3a6b] px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 text-white font-black text-sm px-3 py-1 rounded-lg">SAA</div>
            <div>
              <p className="text-white font-black text-sm uppercase tracking-wide">Nouvelle Police Client</p>
              <p className="text-blue-300 text-[9px] font-bold uppercase tracking-widest">ORASS Suite — Saisie complète</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-red-400 font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/5">✕ Fermer</button>
        </div>

        {/* ── STEPS ── */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => i < step - 1 && setStep(i + 1)}
              className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-1.5
                ${step === i + 1 ? 'text-orange-600 border-orange-500 bg-white' : i < step - 1 ? 'text-emerald-600 border-emerald-400 cursor-pointer hover:bg-white' : 'text-slate-400 border-transparent'}`}>
              <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[8px] mr-1
                ${step === i + 1 ? 'bg-orange-500 text-white' : i < step - 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i < step - 1 ? '✓' : i + 1}
              </span>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* ── CONTENU ── */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-5">

          {/* ════ ÉTAPE 1 — ASSURÉ & CONTRAT ════ */}
          {step === 1 && (
            <>
              {/* Assuré */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-blue-700 mb-4">👤 Informations Assuré</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Select label="Qualité"    name="qualite"    value={form.qualite}    onChange={upd} options={['MONSIEUR','MADAME','MADEMOISELLE','SOCIÉTÉ']} />
                  <div className="col-span-3"><Input label="Nom & Prénom *" name="nomAssure" value={form.nomAssure} onChange={upd} placeholder="ex: BENALI KARIM" /></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Input label="Code Assuré"       name="codeAssure"       value={form.codeAssure}       onChange={upd} />
                  <Select label="Type Pièce"        name="typePiece"        value={form.typePiece}        onChange={upd} options={['CNI','PASSEPORT','PERMIS DE CONDUIRE']} />
                  <div className="col-span-2"><Input label="N° Pièce Identité" name="numPieceIdentite" value={form.numPieceIdentite} onChange={upd} /></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="col-span-2"><Input label="Adresse"   name="adresse"   value={form.adresse}   onChange={upd} /></div>
                  <Input label="Ville"    name="ville"    value={form.ville}    onChange={upd} />
                  <Select label="Wilaya"  name="wilaya"   value={form.wilaya}   onChange={upd} options={WILAYAS} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Select label="Profession"    name="profession"    value={form.profession}    onChange={upd} options={['CADRE','EMPLOYÉ','COMMERÇANT','FONCTIONNAIRE','MÉDECIN','AVOCAT','INGÉNIEUR','ENSEIGNANT','ARTISAN','RETRAITÉ','SANS PROFESSION']} />
                  <Select label="Activité"      name="activite"      value={form.activite}      onChange={upd} options={['PRIVÉE','PUBLIQUE','COMMERCIALE','LIBÉRALE','ARTISANALE','AGRICOLE']} />
                  <Input  label="Téléphone"     name="telephone"     value={form.telephone}     onChange={upd} type="tel" />
                  <Input  label="Email"         name="email"         value={form.email}         onChange={upd} type="email" />
                </div>
              </div>

              {/* Conducteur */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">🧑 Profil Conducteur</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <F label="Sexe">
                    <div className="flex gap-2">
                      {[['H','Homme'],['F','Femme']].map(([val, lbl]) => (
                        <button key={val} type="button" onClick={() => setForm(p => ({...p, sexe: val}))}
                          className={`flex-1 h-9 rounded-xl font-bold text-xs transition-all border ${form.sexe === val ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#1a3a6b]'}`}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </F>
                  <Input label="Âge *"         name="age"        value={form.age}        onChange={upd} type="number" />
                  <Input label="Date Permis"   name="datePermis" value={form.datePermis} onChange={upd} type="date" />
                </div>
              </div>

              {/* Contrat */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-4">📋 Contrat & Couverture</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Input label="Agence"         name="agence"         value={form.agence}         onChange={upd} placeholder="ex: 16001 - ALGER" />
                  <Input label="Convention"     name="convention"     value={form.convention}     onChange={upd} />
                  <Input label="S/Convention"   name="sousConvention" value={form.sousConvention} onChange={upd} />
                  <Input label="Réf. Dossier"   name="refDossier"     value={form.refDossier}     onChange={upd} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Input label="Date Effet *"   name="dateEffet"      value={form.dateEffet}      onChange={handleDateEffetChange} type="date" />
                  <Input label="Durée (mois)"   name="duree"          value={form.duree}          onChange={handleDureeChange}     type="number" />
                  <Input label="Date Échéance"  name="dateEcheance"   value={form.dateEcheance}   onChange={upd} type="date" readOnly />
                  <Select label="Fractionnement" name="fractionnement" value={form.fractionnement} onChange={upd} options={['ANNUEL','SEMESTRIEL','TRIMESTRIEL','MENSUEL']} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Input  label="Tarif"      name="tarif"      value={form.tarif}      onChange={upd} />
                  <Select label="Type"       name="type"       value={form.type}       onChange={upd} options={['NOUVELLE AFFAIRE','RENOUVELLEMENT','AVENANT']} />
                  <Select label="Réduction"  name="reduction"  value={form.reduction}  onChange={upd} options={REF_REDUCTIONS} isObj />
                  <Select label="Régime"     name="regime"     value={form.regime}     onChange={upd} options={['RÉGIME NORMAL','RÉGIME RÉDUIT','RÉGIME SPÉCIAL']} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Select label="Type Dimension"  name="typeDimension"  value={form.typeDimension}  onChange={upd} options={['Standard','Grande Dimension','Remorque']} />
                  <Input  label="Nb Dimensions"   name="nombreDimension" value={form.nombreDimension} onChange={upd} type="number" />
                  <Select label="Exonération"     name="exoneration"    value={form.exoneration}    onChange={upd} options={['Aucune','Diplomatique','État']} />
                  <F label="Contrat Ferme">
                    <div className="flex items-center h-9"><Chk label="Oui" name="contratFerme" checked={form.contratFerme} onChange={upd} /></div>
                  </F>
                </div>
              </div>
            </>
          )}

          {/* ════ ÉTAPE 2 — VÉHICULE ════ */}
          {step === 2 && (
            <>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">🚗 Identification Véhicule</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Input  label="Marque *"         name="marque"         value={form.marque}         onChange={upd} placeholder="ex: TOYOTA" />
                  <Input  label="Type Véhicule"    name="typeVehicule"   value={form.typeVehicule}   onChange={upd} />
                  <Select label="Genre *"           name="genreVehicule"  value={form.genreVehicule}  onChange={upd} options={REF_GENRES} isObj />
                  <Select label="Zone Tarifaire"   name="zone"           value={form.zone}           onChange={upd} options={REF_ZONES} isObj />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Input  label="Immatriculation *" name="immatriculation" value={form.immatriculation} onChange={upd} placeholder="ex: 123456-16-25" />
                  <Input  label="M.E.C le"          name="dateMEC"         value={form.dateMEC}         onChange={upd} type="date" />
                  <Input  label="Dernier Contrôle"  name="dernierControle" value={form.dernierControle} onChange={upd} type="date" />
                  <Select label="Énergie"           name="energie"         value={form.energie}         onChange={upd} options={['ESSENCE','DIESEL','GPL','ÉLECTRIQUE']} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Input label="N° Châssis"   name="chassis"    value={form.chassis}    onChange={upd} />
                  <Input label="N° Moteur"    name="moteur"     value={form.moteur}     onChange={upd} />
                  <Input label="Carrosserie"  name="carrosserie" value={form.carrosserie} onChange={upd} />
                  <Select label="Usage"       name="usage"       value={form.usage}       onChange={upd} options={['USAGE PRIVÉ','USAGE COMMERCIAL','TAXI','TRANSPORT EN COMMUN','LOCATION']} />
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                  <Input label="Puissance"  name="puissance"  value={form.puissance}  onChange={upd} />
                  <Input label="Tonnage"    name="tonnage"    value={form.tonnage}    onChange={upd} />
                  <Input label="Cylindrée" name="cylindree"  value={form.cylindree}  onChange={upd} />
                  <Input label="Vitesse"   name="vitesse"    value={form.vitesse}    onChange={upd} />
                  <Input label="Nb Places" name="places"     value={form.places}     onChange={upd} type="number" />
                </div>
                <div className="flex flex-wrap gap-5 pt-2">
                  <Chk label="Turbo"                name="turbo"             checked={form.turbo}             onChange={upd} />
                  <Chk label="Avec Remorque"        name="avecRemorque"      checked={form.avecRemorque}      onChange={upd} />
                  <Chk label="Matières Inflammables" name="matInflammableVeh" checked={form.matInflammableVeh} onChange={upd} />
                </div>
              </div>

              {/* Délégataire */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">🏦 Crédit & Délégation</h3>
                <Input label="Délégataire Crédit" name="delegataireCredit" value={form.delegataireCredit} onChange={upd} placeholder="Banque / organisme de crédit" />
              </div>
            </>
          )}

          {/* ════ ÉTAPE 3 — GARANTIES & SMP ════ */}
          {step === 3 && (
            <>
              {/* Garanties */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-blue-700 mb-4">🛡️ Garanties Souscrites</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {GARANTIES_CONFIG.map(g => (
                    <label key={g.key}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all
                        ${form.garanties[g.key]
                          ? 'bg-[#1a3a6b] border-[#1a3a6b] text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" name={g.key} checked={form.garanties[g.key]} onChange={upd}
                          disabled={g.required} className="w-4 h-4 accent-orange-500 shrink-0" />
                        <div>
                          <p className="text-xs font-black uppercase">{g.label}</p>
                          {g.required && <p className="text-[8px] font-black text-orange-400 uppercase">Obligatoire</p>}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold opacity-70 text-right">{g.info}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SMP */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">💎 Valeurs & SMP</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label:'Valeur Vénale (DZD) *',    name:'valeurVenale'   },
                    { label:'Valeur à Neuf (DZD)',       name:'valeurANeuf'    },
                    { label:'Capital Assuré (DZD)',      name:'capitalAssure'  },
                    { label:'Valeur Auto-Radio (DZD)',   name:'valeurAutoRadio'},
                  ].map(f => (
                    <div key={f.name} className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{f.label}</label>
                      <input name={f.name} type="number" value={form[f.name]} onChange={upd}
                        className="bg-transparent text-2xl font-black border-b-2 border-slate-300 focus:border-[#1a3a6b] outline-none pb-1 transition-all text-slate-900" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Majorations */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-red-700 mb-4">⚠ Majorations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Majoration Permis (DZD)"          name="majPermis"   value={form.majPermis}   onChange={upd} type="number" />
                  <Input label="Majoration Âge (DZD)"             name="majAge"      value={form.majAge}      onChange={upd} type="number" />
                  <Input label="Matières Inflammables (DZD)"      name="majMatieres" value={form.majMatieres} onChange={upd} type="number" />
                </div>
              </div>
            </>
          )}

          {/* ════ ÉTAPE 4 — QUITTANCE ════ */}
          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Décomposition */}
              <div className="bg-gradient-to-br from-slate-900 to-[#0f2247] rounded-2xl p-6 border-b-4 border-orange-500">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-orange-400 border-b border-white/10 pb-3 mb-4">Tarification</h3>
                <QRow label="Prime de Base"            value={quittance.primeBase}           />
                <QRow label="+ Garanties Facultatives" value={quittance.totalOptions}        />
                <QRow label="= Prime Avant Réduction"  value={quittance.primeAvantReduction} accent />
                <QRow label="− Réduction Commerciale"  value={quittance.montantReduction}    />
                <QRow label="= Prime Après Réduction"  value={quittance.primeApresReduction} />
                <QRow label="+ Majorations"            value={quittance.totalMajorations}    />
                <div className="my-3 border-t border-white/10" />
                <h3 className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-3">Primes & Taxes</h3>
                <QRow label="Prime Nette"              value={quittance.primeNette}          accent />
                <QRow label="Accessoires Auto-Radio"   value={quittance.accessoires}         />
                <QRow label="Taxes / Prime (19%)"      value={quittance.taxesPrime}          />
                <QRow label="Taxes / Accessoires (19%)" value={quittance.taxeAccessoires}   />
                <QRow label="Total Taxes"              value={quittance.totalTaxes}          accent />
                <QRow label="Timbre de Dimension"      value={quittance.timbreDimension}     />
                <QRow label="Timbre Gradué"            value={quittance.timbreGradue}        />
                <div className="border-t-2 border-orange-500/50 mt-3 pt-3">
                  <QRow label="TOTAL À PAYER (TTC)"    value={quittance.totalAPayer}         large />
                </div>
              </div>

              {/* Récap + Émission */}
              <div className="space-y-4">
                {/* Résumé */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Récapitulatif</h3>
                  {[
                    ['Assuré',         form.nomAssure || '—'],
                    ['Email',          form.email     || '—'],
                    ['Téléphone',      form.telephone || '—'],
                    ['Véhicule',       `${form.marque || '—'} · ${form.immatriculation || '—'}`],
                    ['Genre',          form.genreVehicule],
                    ['Zone',           REF_ZONES.find(z => z.id === form.zone)?.label || '—'],
                    ['Date Effet',     form.dateEffet],
                    ['Échéance',       form.dateEcheance],
                    ['Fractionnement', form.fractionnement],
                    ['Réduction',      REF_REDUCTIONS.find(r => r.id === form.reduction)?.label || '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs">
                      <span className="text-slate-400 font-bold uppercase">{k}</span>
                      <span className="text-slate-800 font-black">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Commissions */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-3">Commissions</h3>
                  {[
                    ['Apport (12%)', quittance.apport],
                    ['Gestion',      quittance.gestion],
                    ['Total',        quittance.totalCommissions],
                  ].map(([l, v], i) => (
                    <div key={l} className={`flex justify-between py-2 text-xs ${i === 2 ? 'border-t-2 border-amber-300 pt-3 mt-1 font-black' : 'border-b border-amber-200'}`}>
                      <span className="text-slate-600">{l}</span>
                      <span className="font-mono font-bold">{fmt(v)} DZD</span>
                    </div>
                  ))}
                </div>

                {/* Garanties souscrites */}
                <div className="bg-slate-900 rounded-2xl p-4">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Garanties souscrites</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(form.garanties).filter(([, v]) => v).map(([k]) => (
                      <span key={k} className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-400/30">
                        {k.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Erreur */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-xs font-bold">❌ {error}</p>
                  </div>
                )}

                {/* Bouton émettre */}
                <button onClick={handleEmettre} disabled={loading}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg">
                  {loading ? '⏳ Émission en cours...' : '🏛️ Émettre la Police'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── NAVIGATION ── */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-6 py-2.5 text-[10px] font-black uppercase text-slate-500 hover:text-slate-800 transition-all">
            ← {step === 1 ? 'Annuler' : 'Retour'}
          </button>

          <div className="flex gap-1.5">
            {[1,2,3,4].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-orange-500' : s < step ? 'w-4 bg-emerald-400' : 'w-4 bg-slate-200'}`} />
            ))}
          </div>

          {step < 4 && (
            <button onClick={() => setStep(step + 1)}
              className="px-8 py-2.5 bg-[#1a3a6b] hover:bg-[#0f2247] text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
              Étape suivante →
            </button>
          )}
          {step === 4 && <div className="w-32" />}
        </div>
      </div>
    </div>
  );
};

export default ModalNouveauClient;