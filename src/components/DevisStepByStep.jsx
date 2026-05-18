import React, { useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// RÉFÉRENTIELS
// ═══════════════════════════════════════════════════════════════
const REF = {
  wilayas: [
    "01-Adrar","02-Chlef","03-Laghouat","04-Oum El Bouaghi","05-Batna","06-Béjaïa",
    "07-Biskra","08-Béchar","09-Blida","10-Bouira","11-Tamanrasset","12-Tébessa",
    "13-Tlemcen","14-Tiaret","15-Tizi Ouzou","16-Alger","17-Djelfa","18-Jijel",
    "19-Sétif","20-Saïda","21-Skikda","22-Sidi Bel Abbès","23-Annaba","24-Guelma",
    "25-Constantine","26-Médéa","27-Mostaganem","28-M'Sila","29-Mascara","30-Ouargla",
    "31-Oran","32-El Bayadh","33-Illizi","34-Bordj Bou Arreridj","35-Boumerdès",
    "36-El Tarf","37-Tindouf","38-Tissemsilt","39-El Oued","40-Khenchela",
    "41-Souk Ahras","42-Tipaza","43-Mila","44-Aïn Defla","45-Naâma",
    "46-Aïn Témouchent","47-Ghardaïa","48-Relizane","49-El M'Ghair","50-El Meniaa",
    "51-Ouled Djellal","52-Bordj Baji Mokhtar","53-Béni Abbès","54-Timimoun",
    "55-Touggourt","56-Djanet","57-In Salah","58-In Guezzam",
  ],
  zones: [
    { id:"01", label:"Zone 01 — Nord",  coef:1.00 },
    { id:"02", label:"Zone 02 — Est",   coef:0.95 },
    { id:"03", label:"Zone 03 — Ouest", coef:0.95 },
    { id:"04", label:"Zone 04 — Sud",   coef:0.80 },
  ],
  genres: [
    { id:"VP",   label:"VP — Voiture Particulière", base:12500 },
    { id:"VU",   label:"VU — Véhicule Utilitaire",  base:19000 },
    { id:"MOTO", label:"MOTO — Deux Roues",          base:8500  },
    { id:"TC",   label:"TC — Transport en Commun",   base:28000 },
  ],
  reductions: [
    { id:"AUCUNE",      label:"Aucune",              value:0    },
    { id:"FLOTTE",      label:"Flotte –10%",         value:0.10 },
    { id:"MULTIRISQUE", label:"Multi-risque –5%",    value:0.05 },
    { id:"ANCIENNETE",  label:"Ancienneté –15%",     value:0.15 },
  ],
  usages:   ["USAGE PRIVÉ","USAGE COMMERCIAL","TAXI","TRANSPORT EN COMMUN","LOCATION"],
  energies: ["ESSENCE","DIESEL","GPL","ÉLECTRIQUE"],
  fracts:   ["ANNUEL","SEMESTRIEL","TRIMESTRIEL","MENSUEL"],
};

const GARANTIES_CONFIG = [
  { key:"rc",  label:"RC — Responsabilité Civile",   required:true,  info:"Illimité"        },
  { key:"dr",  label:"DR — Défense et Recours",      required:true,  info:"Inclus"          },
  { key:"bdg", label:"BDG — Bris de Glace",          required:false, info:"4 500 DZD"       },
  { key:"vol", label:"VOL — Vol du Véhicule",        required:false, info:"Val.Vénale × 0.7%"},
  { key:"inc", label:"INC — Incendie",               required:false, info:"Val.Vénale × 0.3%"},
  { key:"dc",  label:"DC — Dommages Collision",      required:false, info:"Val.Vénale × 1.8%"},
  { key:"pt",  label:"PT — Personnes Transportées",  required:false, info:"1 250 DZD"       },
  { key:"ir",  label:"IR — Individuelle Conducteur", required:false, info:"2 800 DZD"       },
  { key:"tc",  label:"TC — Tous Chocs",              required:false, info:"3 500 DZD"       },
];

// ═══════════════════════════════════════════════════════════════
// MOTEUR DE CALCUL
// ═══════════════════════════════════════════════════════════════
function computeQuittance(f) {
  const base      = REF.genres.find(g => g.id === f.genreVehicule)?.base ?? 12500;
  const coefZone  = REF.zones.find(z => z.id === f.zone)?.coef ?? 1.0;
  const age       = parseInt(f.age) || 30;
  const coefAge   = age < 25 ? 1.5 : age > 60 ? 0.9 : 1.0;
  const coefSexe  = f.sexe === 'F' ? 0.95 : 1.05;
  const primeBase = base * coefZone * coefAge * coefSexe;
  const valV      = parseFloat(f.valeurVenale) || 0;
  let totalOptions = 0;
  if (f.garanties.bdg) totalOptions += 4500;
  if (f.garanties.vol) totalOptions += valV * 0.007;
  if (f.garanties.inc) totalOptions += valV * 0.003;
  if (f.garanties.dc)  totalOptions += valV * 0.018;
  if (f.garanties.pt)  totalOptions += 1250;
  if (f.garanties.ir)  totalOptions += 2800;
  if (f.garanties.tc)  totalOptions += 3500;
  const accessoires         = (parseFloat(f.valeurAutoRadio) || 0) * 0.025;
  const primeAvantReduction = primeBase + totalOptions;
  const tauxRed             = REF.reductions.find(r => r.id === f.reduction)?.value ?? 0;
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

// ═══════════════════════════════════════════════════════════════
// ÉTAT INITIAL
// ═══════════════════════════════════════════════════════════════
const INITIAL = {
  // Assuré
  nomAssure:'', qualite:'MONSIEUR', typePiece:'CNI', numPieceIdentite:'',
  adresse:'', ville:'', wilaya:'16-Alger',
  telephone:'', email:'',
  // Conducteur
  sexe:'H', age:'30', datePermis:'',
  // Véhicule
  marque:'', typeVehicule:'', immatriculation:'',
  dateMEC:'', energie:'ESSENCE', chassis:'', puissance:'', places:'5',
  genreVehicule:'VP', usage:'USAGE PRIVÉ', zone:'01',
  // Contrat
  dateEffet: new Date().toISOString().split('T')[0],
  dateEcheance:'', duree:'12', fractionnement:'ANNUEL',
  reduction:'AUCUNE', nombreDimension:'1',
  // SMP
  valeurVenale:'1500000', valeurANeuf:'2500000', valeurAutoRadio:'0',
  // Garanties
  garanties:{ rc:true, dr:true, bdg:false, vol:false, inc:false, dc:false, pt:false, ir:false, tc:false },
  // Majorations
  majPermis:'0', majAge:'0', majMatieres:'0',
};

// ═══════════════════════════════════════════════════════════════
// UI
// ═══════════════════════════════════════════════════════════════
const F = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
    {children}
  </div>
);

const Inp = ({ label, name, value, onChange, type='text', placeholder='', readOnly=false }) => (
  <F label={label}>
    <input type={type} name={name} value={value ?? ''} onChange={onChange}
      placeholder={placeholder} readOnly={readOnly}
      className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold outline-none transition-all
        ${readOnly ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                   : 'bg-white border-slate-200 text-slate-800 focus:border-[#1a3a6b]'}`} />
  </F>
);

const Sel = ({ label, name, value, onChange, options, isObj=false }) => (
  <F label={label}>
    <select name={name} value={value ?? ''} onChange={onChange}
      className="px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-800 outline-none focus:border-[#1a3a6b] transition-all cursor-pointer">
      {options.map(o => (
        <option key={isObj ? o.id : o} value={isObj ? o.id : o}>
          {isObj ? o.label : o}
        </option>
      ))}
    </select>
  </F>
);

const QRow = ({ label, value, accent, large }) => (
  <div className={`flex justify-between items-center py-2 border-b border-white/10 ${large ? 'py-4' : ''}`}>
    <span className={`text-xs font-bold uppercase tracking-wider ${accent ? 'text-blue-300' : 'text-slate-400'}`}>{label}</span>
    <span className={`font-mono font-black tabular-nums ${large ? 'text-4xl text-white' : accent ? 'text-blue-300 text-base' : 'text-slate-300 text-sm'}`}>
      {value} <span className="text-xs font-bold opacity-60">DZD</span>
    </span>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// ÉTAPES
// ═══════════════════════════════════════════════════════════════
const STEPS = [
  { label:'Assuré & Véhicule', icon:'👤' },
  { label:'Conducteur',        icon:'🧑' },
  { label:'Garanties & SMP',   icon:'🛡️' },
  { label:'Devis Final',       icon:'💰' },
];

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════
const DevisStepByStep = ({ onGoHome }) => {
  const [step, setStep]           = useState(1);
  const [form, setForm]           = useState(INITIAL);
  const [quittance, setQuittance] = useState(() => computeQuittance(INITIAL));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    setQuittance(computeQuittance(form));
  }, [
    form.genreVehicule, form.zone, form.age, form.sexe, form.garanties,
    form.valeurVenale, form.valeurAutoRadio, form.reduction,
    form.majPermis, form.majAge, form.majMatieres, form.nombreDimension,
  ]);

  // Auto-calcul date échéance
  useEffect(() => {
    if (!form.dateEffet || !form.duree) return;
    const d = new Date(form.dateEffet);
    d.setMonth(d.getMonth() + parseInt(form.duree || 12));
    setForm(prev => ({ ...prev, dateEcheance: d.toISOString().split('T')[0] }));
  }, [form.dateEffet, form.duree]);

  const upd = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      if (type === 'checkbox' && name in prev.garanties)
        return { ...prev, garanties: { ...prev.garanties, [name]: checked } };
      if (type === 'checkbox') return { ...prev, [name]: checked };
      return { ...prev, [name]: value };
    });
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!form.nomAssure)       return setError('Le nom de l\'assuré est obligatoire.');
    if (!form.email)           return setError('L\'email est obligatoire.');
    if (!form.telephone)       return setError('Le téléphone est obligatoire.');
    if (!form.marque)          return setError('La marque du véhicule est obligatoire.');
    if (!form.immatriculation) return setError('L\'immatriculation est obligatoire.');

    setSubmitting(true);
    try {
      await fetch('http://localhost:3001/api/demandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom:             form.nomAssure,
          email:           form.email,
          telephone:       form.telephone,
          marque:          form.marque,
          immatriculation: form.immatriculation,
          wilaya:          form.wilaya,
          message:         JSON.stringify({ ...form, quittance }),
        }),
      });
      setSubmitted(true);
    } catch {
      setError('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── ÉCRAN DE CONFIRMATION ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-12 text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">✅</div>
          <h2 className="text-3xl font-black text-slate-900 uppercase mb-3">Demande Envoyée !</h2>
          <p className="text-slate-500 mb-6">
            Votre demande a bien été transmise à un agent SAA. Vous recevrez votre numéro de police et vos identifiants par email.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 text-left space-y-2">
            <p className="text-amber-800 text-sm font-black uppercase tracking-wide">📋 Récapitulatif</p>
            <div className="text-sm space-y-1">
              <p><span className="text-slate-500">Assuré :</span> <span className="font-bold text-slate-800">{form.nomAssure}</span></p>
              <p><span className="text-slate-500">Email :</span> <span className="font-bold text-slate-800">{form.email}</span></p>
              <p><span className="text-slate-500">Véhicule :</span> <span className="font-bold text-slate-800">{form.marque} · {form.immatriculation}</span></p>
              <p><span className="text-slate-500">Prime estimée :</span> <span className="font-black text-orange-600">{quittance.totalAPayer} DZD / an</span></p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8">
            <p className="text-blue-700 text-sm font-bold">
              📧 Un email sera envoyé à <strong>{form.email}</strong> avec votre N° de police et votre mot de passe dès validation par l'agent.
            </p>
          </div>
          <button onClick={onGoHome}
            className="w-full bg-[#1a3a6b] hover:bg-[#0f2247] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg">
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* HEADER */}
        <header className="bg-gradient-to-r from-[#0f2247] via-[#1a3a6b] to-[#1e4d8c] px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#e89d1b] w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">🚗</div>
            <div>
              <p className="font-black text-white text-sm tracking-wide">ORASS®Suite — SAA Assurances</p>
              <p className="text-blue-300 text-[10px] uppercase tracking-widest">Devis & Souscription Automobile en ligne</p>
            </div>
          </div>
          <button onClick={onGoHome} className="text-white/50 hover:text-white text-xs font-black uppercase tracking-widest transition-all">
            ✕ Quitter
          </button>
        </header>

        {/* STEPS */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => i < step - 1 && setStep(i + 1)}
              className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-1.5
                ${step === i + 1 ? 'text-[#1a3a6b] border-[#1a3a6b] bg-white' : i < step - 1 ? 'text-emerald-600 border-emerald-400 cursor-pointer hover:bg-white' : 'text-slate-400 border-transparent'}`}>
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[8px] font-black mr-1
                ${step === i + 1 ? 'bg-[#1a3a6b] text-white' : i < step - 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i < step - 1 ? '✓' : i + 1}
              </span>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 space-y-6">

          {/* ════ ÉTAPE 1 — ASSURÉ & VÉHICULE ════ */}
          {step === 1 && (
            <>
              {/* Assuré */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-800 mb-4">👤 Informations Assuré</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <F label="Qualité">
                    <select name="qualite" value={form.qualite} onChange={upd}
                      className="px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold outline-none focus:border-[#1a3a6b] cursor-pointer">
                      {["MONSIEUR","MADAME","MADEMOISELLE","SOCIÉTÉ"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </F>
                  <div className="col-span-3"><Inp label="Nom & Prénom *" name="nomAssure" value={form.nomAssure} onChange={upd} placeholder="ex: BENALI KARIM" /></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Sel label="Type Pièce" name="typePiece" value={form.typePiece} onChange={upd} options={["CNI","PASSEPORT","PERMIS DE CONDUIRE"]} />
                  <div className="col-span-3"><Inp label="N° Pièce Identité" name="numPieceIdentite" value={form.numPieceIdentite} onChange={upd} /></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <Inp label="Adresse"  name="adresse"  value={form.adresse}  onChange={upd} />
                  <Inp label="Ville"    name="ville"    value={form.ville}    onChange={upd} />
                  <Sel label="Wilaya"   name="wilaya"   value={form.wilaya}   onChange={upd} options={REF.wilayas} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Inp label="Téléphone *" name="telephone" value={form.telephone} onChange={upd} type="tel" placeholder="05XXXXXXXX" />
                  <Inp label="Email *"     name="email"     value={form.email}     onChange={upd} type="email" placeholder="exemple@email.com" />
                </div>
              </div>

              {/* Véhicule */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 mb-4">🚗 Véhicule</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Inp label="Marque *"          name="marque"         value={form.marque}         onChange={upd} placeholder="ex: TOYOTA" />
                  <Inp label="Type"              name="typeVehicule"   value={form.typeVehicule}   onChange={upd} />
                  <Sel label="Genre *"           name="genreVehicule"  value={form.genreVehicule}  onChange={upd} options={REF.genres} isObj />
                  <Sel label="Zone Tarifaire"    name="zone"           value={form.zone}           onChange={upd} options={REF.zones} isObj />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Inp label="Immatriculation *" name="immatriculation" value={form.immatriculation} onChange={upd} placeholder="123456-16-25" />
                  <Inp label="M.E.C le"          name="dateMEC"         value={form.dateMEC}         onChange={upd} type="date" />
                  <Sel label="Énergie"           name="energie"         value={form.energie}         onChange={upd} options={REF.energies} />
                  <Inp label="Puissance (CV)"    name="puissance"       value={form.puissance}       onChange={upd} type="number" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Inp label="N° Châssis"  name="chassis" value={form.chassis} onChange={upd} />
                  <Inp label="Nb Places"   name="places"  value={form.places}  onChange={upd} type="number" />
                  <Sel label="Usage"       name="usage"   value={form.usage}   onChange={upd} options={REF.usages} />
                  <Sel label="Wilaya Circulation" name="wilaya" value={form.wilaya} onChange={upd} options={REF.wilayas} />
                </div>
              </div>

              {/* Contrat */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-800 mb-4">📋 Contrat</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Inp label="Date Effet *"   name="dateEffet"      value={form.dateEffet}      onChange={upd} type="date" />
                  <Inp label="Durée (mois)"   name="duree"          value={form.duree}          onChange={upd} type="number" />
                  <Inp label="Date Échéance"  name="dateEcheance"   value={form.dateEcheance}   onChange={upd} type="date" readOnly />
                  <Sel label="Fractionnement" name="fractionnement" value={form.fractionnement} onChange={upd} options={REF.fracts} />
                </div>
              </div>
            </>
          )}

          {/* ════ ÉTAPE 2 — CONDUCTEUR ════ */}
          {step === 2 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-800 mb-5">🧑 Profil Conducteur</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                  <F label="Sexe du Conducteur">
                    <div className="flex gap-3">
                      {[["H","👨 Homme"],["F","👩 Femme"]].map(([val, lbl]) => (
                        <button key={val} type="button" onClick={() => setForm(p => ({...p, sexe: val}))}
                          className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all border-2
                            ${form.sexe === val ? 'bg-[#1a3a6b] text-white border-[#1a3a6b] shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:border-[#1a3a6b]/50'}`}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </F>
                  <Inp label="Âge *" name="age" value={form.age} onChange={upd} type="number" />
                </div>
                <Inp label="Date d'obtention du Permis" name="datePermis" value={form.datePermis} onChange={upd} type="date" />
              </div>

              {/* Coefficients en temps réel */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-800 mb-4">📊 Coefficients Appliqués</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    ["Zone",      REF.zones.find(z => z.id === form.zone)?.coef ?? 1.0],
                    ["Âge",       parseInt(form.age) < 25 ? '1.50' : parseInt(form.age) > 60 ? '0.90' : '1.00'],
                    ["Sexe",      form.sexe === 'F' ? '0.95' : '1.05'],
                    ["Réduction", REF.reductions.find(r => r.id === form.reduction)?.value.toFixed(2) ?? '0.00'],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-white border border-amber-200 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-1">{l}</p>
                      <p className="text-2xl font-black text-amber-900">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prime preview */}
              <div className="bg-[#1a3a6b] rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-[9px] font-black uppercase tracking-widest">Prime estimée (TTC)</p>
                  <p className="text-white font-black text-3xl mt-1">{quittance.totalAPayer} DZD</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-300 text-[9px] font-black uppercase tracking-widest">Prime Nette</p>
                  <p className="text-white font-black text-xl mt-1">{quittance.primeNette} DZD</p>
                </div>
              </div>
            </>
          )}

          {/* ════ ÉTAPE 3 — GARANTIES & SMP ════ */}
          {step === 3 && (
            <>
              {/* Garanties */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-800 mb-4">🛡️ Garanties Souscrites</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {GARANTIES_CONFIG.map(g => (
                    <label key={g.key}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all
                        ${form.garanties[g.key] ? 'bg-[#1a3a6b] border-[#1a3a6b] text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}>
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
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 mb-4">💎 Valeurs & SMP</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label:'Valeur Vénale (DZD) *',   name:'valeurVenale'    },
                    { label:'Valeur à Neuf (DZD)',      name:'valeurANeuf'     },
                    { label:'Capital Assuré (DZD)',     name:'capitalAssure'   },
                    { label:'Auto-Radio (DZD)',         name:'valeurAutoRadio' },
                  ].map(f => (
                    <div key={f.name} className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{f.label}</label>
                      <input name={f.name} type="number" value={form[f.name] ?? ''} onChange={upd}
                        className="bg-transparent text-2xl font-black border-b-2 border-slate-300 focus:border-[#1a3a6b] outline-none pb-1 transition-all text-slate-900" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Réduction */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-800 mb-4">🏷️ Réduction Commerciale</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {REF.reductions.map(r => (
                    <button key={r.id} type="button" onClick={() => setForm(p => ({...p, reduction: r.id}))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${form.reduction === r.id ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-amber-200 text-amber-800 hover:border-amber-400'}`}>
                      <p className="font-black text-xs uppercase">{r.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ════ ÉTAPE 4 — DEVIS FINAL ════ */}
          {step === 4 && (
            <>
              {/* Quittance */}
              <div className="bg-gradient-to-br from-[#0a1628] via-[#0f2247] to-[#1a3a6b] rounded-3xl p-8 relative overflow-hidden shadow-2xl border-b-4 border-[#e89d1b]">
                <div className="absolute -top-16 -right-16 text-[18rem] font-black opacity-[0.03] select-none text-white">SAA</div>
                <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-0.5">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-blue-300 border-b border-white/10 pb-3 mb-3">Décomposition</h3>
                    {[
                      ["Prime de Base",             quittance.primeBase,           false],
                      ["+ Garanties",               quittance.totalOptions,        false],
                      ["= Prime avant réduction",   quittance.primeAvantReduction, true ],
                      ["− Réduction",               quittance.montantReduction,    false],
                      ["+ Majorations",             quittance.totalMajorations,    false],
                      ["Prime Nette",               quittance.primeNette,          true ],
                      ["Taxes (19%)",               quittance.totalTaxes,          false],
                      ["Timbres",                   quittance.timbreDimension,     false],
                    ].map(([l,v,a]) => <QRow key={l} label={l} value={v} accent={a} />)}
                  </div>
                  <div className="text-center bg-white/5 px-8 py-6 rounded-2xl border border-white/10 self-start min-w-[200px]">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-300 mb-3">Net à Payer (TTC)</p>
                    <div className="text-6xl font-black tracking-tighter leading-none mb-2 text-white">{quittance.totalAPayer}</div>
                    <p className="text-sm font-bold text-slate-400">DZD / an</p>
                  </div>
                </div>
              </div>

              {/* Récap client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Récapitulatif Assuré</h3>
                  {[
                    ["Nom",            form.nomAssure     || '—'],
                    ["Email",          form.email         || '—'],
                    ["Téléphone",      form.telephone     || '—'],
                    ["Wilaya",         form.wilaya        || '—'],
                    ["Véhicule",       `${form.marque || '—'} · ${form.immatriculation || '—'}`],
                    ["Genre",          form.genreVehicule ],
                    ["Énergie",        form.energie       ],
                    ["Date Effet",     form.dateEffet     ],
                    ["Échéance",       form.dateEcheance  || '—'],
                    ["Fractionnement", form.fractionnement],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs">
                      <span className="text-slate-400 font-bold uppercase">{k}</span>
                      <span className="text-slate-800 font-black">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {/* Garanties choisies */}
                  <div className="bg-[#1a3a6b] rounded-2xl p-4">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-blue-300 mb-3">Garanties Souscrites</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(form.garanties).filter(([,v]) => v).map(([k]) => (
                        <span key={k} className="text-[8px] font-black uppercase px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-400/30">
                          {k.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Commissions */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-3">Commissions</h3>
                    {[
                      ["Apport (12%)", quittance.apport],
                      ["Gestion",      quittance.gestion],
                      ["Total",        quittance.totalCommissions],
                    ].map(([l, v], i) => (
                      <div key={l} className={`flex justify-between py-2 text-xs ${i === 2 ? 'border-t-2 border-amber-300 pt-3 mt-1 font-black text-sm' : 'border-b border-amber-200'}`}>
                        <span className="text-slate-600">{l}</span>
                        <span className="font-mono font-bold">{v} DZD</span>
                      </div>
                    ))}
                  </div>

                  {/* Bandeau info */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                    <p className="text-emerald-700 text-xs font-bold leading-relaxed">
                      ✅ En soumettant ce devis, un agent SAA vous contactera pour valider votre dossier et vous envoyer vos identifiants par email.
                    </p>
                  </div>

                  {/* Erreur */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-red-600 text-xs font-bold">❌ {error}</p>
                    </div>
                  )}

                  {/* Bouton soumettre */}
                  <button onClick={handleSubmit} disabled={submitting}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg">
                    {submitting ? '⏳ Envoi en cours...' : '📤 Soumettre ma demande à l\'agent'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* NAVIGATION */}
          <div className="flex justify-between items-center border-t-2 border-slate-100 pt-6 mt-4">
            <button onClick={() => step > 1 ? setStep(step - 1) : onGoHome()}
              className="px-6 py-2.5 text-slate-500 hover:text-red-600 font-black uppercase text-[10px] tracking-widest transition-all hover:bg-red-50 rounded-lg">
              {step === 1 ? '✕ Annuler' : '← Précédent'}
            </button>

            <div className="flex gap-1.5">
              {[1,2,3,4].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-[#1a3a6b]' : s < step ? 'w-4 bg-[#e89d1b]' : 'w-4 bg-slate-200'}`} />
              ))}
            </div>

            {step < 4 && (
              <button onClick={() => setStep(step + 1)}
                className="bg-[#1a3a6b] hover:bg-[#0f2247] text-white px-8 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95">
                Étape suivante →
              </button>
            )}
            {step === 4 && <div className="w-32" />}
          </div>
        </div>
      </div>

      <p className="text-center mt-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        SAA ORASS Suite © 2026 · Direction des Systèmes d'Information
      </p>
    </div>
  );
};

export default DevisStepByStep;