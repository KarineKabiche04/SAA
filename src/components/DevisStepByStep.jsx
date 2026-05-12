import React, { useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// RÉFÉRENTIELS — hors composant pour éviter les recréations
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
    { id:"01", label:"ZONE 01 - NORD",  coef:1.00 },
    { id:"02", label:"ZONE 02 - EST",   coef:0.95 },
    { id:"03", label:"ZONE 03 - OUEST", coef:0.95 },
    { id:"04", label:"ZONE 04 - SUD",   coef:0.80 },
  ],
  genres: [
    { id:"VP",   label:"VP - VOITURE PARTICULIÈRE", base:12500 },
    { id:"VU",   label:"VU - VÉHICULE UTILITAIRE",  base:19000 },
    { id:"MOTO", label:"MOTO - DEUX ROUES",          base:8500  },
    { id:"TC",   label:"TC - TRANSPORT EN COMMUN",   base:28000 },
  ],
  professions: ["CADRE","EMPLOYÉ","COMMERÇANT","FONCTIONNAIRE","MÉDECIN","AVOCAT","INGÉNIEUR","ENSEIGNANT","ARTISAN","RETRAITÉ","SANS PROFESSION"],
  activites:   ["PRIVÉE","PUBLIQUE","COMMERCIALE","LIBÉRALE","ARTISANALE","AGRICOLE"],
  reductions: [
    { id:"AUCUNE",      label:"Aucune",                    value:0    },
    { id:"FLOTTE",      label:"Réduction Flotte 10%",      value:0.10 },
    { id:"MULTIRISQUE", label:"Réduction Multi-risque 5%", value:0.05 },
    { id:"ANCIENNETE",  label:"Réduction Ancienneté 15%",  value:0.15 },
  ],
  regimes: ["RÉGIME NORMAL","RÉGIME RÉDUIT","RÉGIME SPÉCIAL"],
  usages:  ["USAGE PRIVÉ","USAGE COMMERCIAL","TAXI","TRANSPORT EN COMMUN","LOCATION"],
  energies:["ESSENCE","DIESEL","GPL","ÉLECTRIQUE"],
  pieces:  ["CNI","PASSEPORT","PERMIS DE CONDUIRE"],
  types:   ["NOUVELLE AFFAIRE","RENOUVELLEMENT","AVENANT"],
  fracts:  ["ANNUEL","SEMESTRIEL","TRIMESTRIEL","MENSUEL"],
};

const GARANTIES_CONFIG = [
  { key:"rc",  label:"RC - Responsabilité Civile",    required:true,  info:"ILLIMITÉ"          },
  { key:"dr",  label:"DR - Défense et Recours",       required:true,  info:"INCLUS"            },
  { key:"bdg", label:"BDG - Bris de Glace",           required:false, info:"4 500 DZD"         },
  { key:"vol", label:"VOL - Vol du Véhicule",         required:false, info:"V.Vénale × 0.7%"   },
  { key:"inc", label:"INC - Incendie",                required:false, info:"V.Vénale × 0.3%"   },
  { key:"dc",  label:"DC - Dommages Collision",       required:false, info:"V.Vénale × 1.8%"   },
  { key:"pt",  label:"PT - Personnes Transportées",  required:false, info:"1 250 DZD"          },
  { key:"ir",  label:"IR - Individuelle Conducteur", required:false, info:"2 800 DZD"          },
  { key:"tc",  label:"TC - Tous Chocs",               required:false, info:"3 500 DZD"          },
];

const GARANTIES_LABELS = Object.fromEntries(GARANTIES_CONFIG.map(g => [g.key, g.label]));

// ═══════════════════════════════════════════════════════════════
// MOTEUR DE CALCUL — fonction pure, hors composant
// ═══════════════════════════════════════════════════════════════
function computeQuittance(f) {
  const base     = REF.genres.find(g => g.id === f.genreVehicule)?.base ?? 12500;
  const coefZone = REF.zones.find(z => z.id === f.zone)?.coef ?? 1.0;
  const age      = parseInt(f.age) || 30;
  const coefAge  = age < 25 ? 1.5 : age > 60 ? 0.9 : 1.0;
  const coefSexe = f.sexe === 'F' ? 0.95 : 1.05;
  const primeBase = base * coefZone * coefAge * coefSexe;

  const valV = parseFloat(f.valeurVenale) || 0;
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
  const gestion             = 850;

  const fmt = (n) => n.toFixed(2);
  return {
    primeBase: fmt(primeBase), totalOptions: fmt(totalOptions),
    primeAvantReduction: fmt(primeAvantReduction), montantReduction: fmt(montantReduction),
    primeApresReduction: fmt(primeApresReduction), totalMajorations: fmt(totalMajorations),
    primeNette: fmt(primeNette), accessoires: fmt(accessoires),
    taxesPrime: fmt(taxesPrime), taxeAccessoires: fmt(taxeAccessoires),
    totalTaxes: fmt(totalTaxes), timbreDimension: fmt(timbreDimension),
    timbreGradue: fmt(timbreGradue), totalAPayer: fmt(totalAPayer),
    apport: fmt(apport), gestion: fmt(gestion), totalCommissions: fmt(apport + gestion),
  };
}

// ═══════════════════════════════════════════════════════════════
// ÉTAT INITIAL
// ═══════════════════════════════════════════════════════════════
const INITIAL_FORM = {
  // Police
  agence:"16001 - ALGER CENTRE", numPolice:`POL-${Date.now()}`, numAvenant:"0",
  numGarantie:"0", refDossier:"", convention:"9901 - INDIVIDUELLE",
  sousConvention:"", dateEffet:new Date().toISOString().split('T')[0],
  heureEffet:"00:00", dateEcheance:"", fractionnement:"ANNUEL",
  contratFerme:false, souscritLe:new Date().toISOString().split('T')[0],
  saisiLe:new Date().toISOString().split('T')[0], duree:"12",
  tarif:"TARIF STANDARD", type:"NOUVELLE AFFAIRE", reduction:"AUCUNE",
  regime:"RÉGIME NORMAL", typeDimension:"Standard", nombreDimension:"1", exoneration:"Aucune",
  // Assuré
  nomAssure:"", qualite:"MONSIEUR", codeAssure:"", typePiece:"CNI",
  numPieceIdentite:"", adresse:"", ville:"", wilaya:"16-Alger",
  zone:"01", profession:"EMPLOYÉ", activite:"PRIVÉE", chiffreAffaire:"",
  telephone:"", email:"",
  // Conducteur
  sexe:"H", age:"30", datePermis:"",
  // Véhicule
  numOrdre:"0", marque:"", typeVehicule:"", immatriculation:"",
  dateMEC:"", dernierControle:"", energie:"ESSENCE", turbo:false,
  delegataireCredit:"", chassis:"", moteur:"", carrosserie:"",
  avecRemorque:false, puissance:"", tonnage:"", cylindree:"",
  vitesse:"", places:"5", matInflammableVeh:false,
  genreVehicule:"VP", usage:"USAGE PRIVÉ",
  // SMP
  valeurVenale:"1500000", valeurANeuf:"2500000",
  valeurAutoRadio:"0", capitalAssure:"2500000",
  // Garanties
  garanties:{ rc:true, dr:true, bdg:false, vol:false, inc:false, dc:false, pt:true, ir:false, tc:false },
  // Majorations
  majPermis:"0", majAge:"0", majMatieres:"0",
};

// ═══════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS UI
// ═══════════════════════════════════════════════════════════════
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
    {children}
  </div>
);

const Input = ({ label, name, value, onChange, type="text", placeholder, readOnly }) => (
  <Field label={label}>
    <input
      type={type} name={name} value={value ?? ""} onChange={onChange}
      placeholder={placeholder} readOnly={readOnly}
      className={`px-3 py-2.5 rounded-lg border-2 text-sm font-semibold outline-none transition-all
        ${readOnly
          ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
          : 'bg-white border-slate-200 text-slate-800 focus:border-[#1a3a6b] focus:shadow-sm'
        }`}
    />
  </Field>
);

const Select = ({ label, name, value, onChange, options, isObj }) => (
  <Field label={label}>
    <select
      name={name} value={value ?? ""}  onChange={onChange}
      className="px-3 py-2.5 rounded-lg border-2 border-slate-200 bg-white text-sm font-semibold text-slate-800 outline-none focus:border-[#1a3a6b] transition-all cursor-pointer"
    >
      {options.map(o => (
        <option key={isObj ? o.id : o} value={isObj ? o.id : o}>
          {isObj ? o.label : o}
        </option>
      ))}
    </select>
  </Field>
);

const Checkbox = ({ label, name, checked, onChange, disabled }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none group">
    <input
      type="checkbox" name={name} checked={checked} onChange={onChange} disabled={disabled}
      className="w-4 h-4 rounded accent-[#1a3a6b]"
    />
    <span className={`text-sm font-semibold ${disabled ? 'text-slate-400' : 'text-slate-700 group-hover:text-[#1a3a6b]'}`}>
      {label}
    </span>
  </label>
);

const SectionCard = ({ title, color="slate", children }) => {
  const colors = {
    slate: "bg-slate-50 border-slate-200 text-slate-800",
    blue:  "bg-blue-50  border-blue-200  text-blue-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    green: "bg-green-50 border-green-200 text-green-900",
    red:   "bg-red-50   border-red-200   text-red-900",
  };
  return (
    <div className={`rounded-xl border-2 p-5 ${colors[color]}`}>
      {title && <h3 className="text-xs font-black uppercase tracking-widest mb-4 pb-2 border-b border-current/20">{title}</h3>}
      {children}
    </div>
  );
};

const QRow = ({ label, value, accent, large }) => (
  <div className={`flex justify-between items-center py-2 border-b border-white/10 ${large ? 'py-4' : ''}`}>
    <span className={`text-xs font-bold uppercase tracking-wider ${accent ? 'text-blue-300' : 'text-slate-400'}`}>{label}</span>
    <span className={`font-mono font-black tabular-nums ${large ? 'text-4xl text-white' : accent ? 'text-blue-300 text-base' : 'text-slate-300 text-sm'}`}>
      {value} <span className="text-xs font-bold opacity-60">DZD</span>
    </span>
  </div>
);

const Tag = ({ children }) => (
  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
    {children}
  </span>
);

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════
const DevisStepByStep = ({ onGoHome, onSaveToDashboard, user }) => {
  const [step, setStep]           = useState(1);
  const [activeTab, setActiveTab] = useState('police');
  const [form, setForm]           = useState(INITIAL_FORM);
  const [quittance, setQuittance] = useState(() => computeQuittance(INITIAL_FORM));

  // Recalcul uniquement quand les champs qui impactent la prime changent
  useEffect(() => {
    setQuittance(computeQuittance(form));
  }, [
    form.genreVehicule, form.zone, form.age, form.sexe, form.garanties,
    form.valeurVenale, form.valeurAutoRadio, form.reduction,
    form.majPermis, form.majAge, form.majMatieres, form.nombreDimension,
  ]);

  // Handler unifié mémorisé
  const handleUpdate = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      if (type === 'checkbox' && name in prev.garanties)
        return { ...prev, garanties: { ...prev.garanties, [name]: checked } };
      if (type === 'checkbox')
        return { ...prev, [name]: checked };
      return { ...prev, [name]: value };
    });
  }, []);

  const handleSave = () => {
    onSaveToDashboard({
      ...form,
      quittance,
      createdAt: new Date().toLocaleString(),
      status: "ÉMIS",
      genre: "AUTO",
    });
  };

  // Tabs de l'étape 1
  const TABS = [
    { id:'police',    label:'Police'     },
    { id:'vehicule',  label:'Véhicule'   },
    { id:'vehicule2', label:'Véhicule…'  },
    { id:'garanties', label:'Garanties'  },
    { id:'smp',       label:'SMP'        },
    { id:'quittance', label:'Quittance'  },
  ];

  // Coefficients affichés à l'étape 2
  const coefficients = [
    ["Zone Tarifaire", REF.zones.find(z => z.id === form.zone)?.coef ?? 1.0],
    ["Âge Conducteur", parseInt(form.age) < 25 ? '1.50' : parseInt(form.age) > 60 ? '0.90' : '1.00'],
    ["Sexe",           form.sexe === 'F' ? '0.95' : '1.05'],
    ["Réduction",      REF.reductions.find(r => r.id === form.reduction)?.value.toFixed(2) ?? '0.00'],
  ];

  const infosDossier = [
    ["N° Police",      form.numPolice],
    ["Assuré",         form.nomAssure || "—"],
    ["Véhicule",       [form.marque, form.immatriculation].filter(Boolean).join(" · ") || "—"],
    ["Date Effet",     form.dateEffet],
    ["Fractionnement", form.fractionnement],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* ── HEADER ── */}
        <header className="bg-gradient-to-r from-[#0f2247] via-[#1a3a6b] to-[#1e4d8c] px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#e89d1b] w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">🚗</div>
            <div>
              <p className="font-black text-white text-sm tracking-wide">ORASS®Suite — Société Nationale d'Assurance</p>
              <p className="text-blue-300 text-[10px] uppercase tracking-widest">Licence N°1622130900 · Module Automobile · v4.5.2</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {[1,2,3,4].map(s => (
              <div key={s} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${s <= step ? 'bg-[#e89d1b]' : 'bg-white/20'}`} />
            ))}
          </div>
        </header>

        {/* ── INFO BAR ── */}
        <div className="bg-[#f0f4ff] border-b border-blue-100 px-6 py-2.5 flex justify-between items-center text-xs">
          <div className="flex gap-6 text-slate-600">
            {[["Police", form.numPolice],["Avenant", form.numAvenant],["Garantie", form.numGarantie]].map(([k,v]) => (
              <span key={k}><strong>{k}:</strong> <span className="font-mono text-[#1a3a6b]">{v}</span></span>
            ))}
          </div>
          <div className="flex gap-2">
            {["AUTOINTE","DRTO"].map(t => (
              <span key={t} className="px-2.5 py-0.5 rounded-full bg-[#1a3a6b]/10 text-[#1a3a6b] font-bold text-[10px]">{t}</span>
            ))}
          </div>
        </div>

        <div className="p-6 md:p-8">

          {/* ════ ÉTAPE 1 — SAISIE ════ */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Onglets */}
              <div className="flex gap-1 border-b-2 border-slate-200 pb-0 overflow-x-auto">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-2.5 rounded-t-lg text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                      activeTab === t.id
                        ? 'bg-[#1a3a6b] text-white shadow-md translate-y-px'
                        : 'text-slate-500 hover:text-[#1a3a6b] hover:bg-slate-100'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── POLICE ── */}
              {activeTab === 'police' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Convention"   name="convention"    value={form.convention}    onChange={handleUpdate} />
                    <Input label="S/Convention" name="sousConvention" value={form.sousConvention} onChange={handleUpdate} />
                    <Input label="Réf. Dossier" name="refDossier"    value={form.refDossier}    onChange={handleUpdate} />
                  </div>

                  <SectionCard title="Informations Assuré" color="blue">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input  label="Code"   name="codeAssure" value={form.codeAssure} onChange={handleUpdate} />
                      <Select label="Qualité" name="qualite"   value={form.qualite}    onChange={handleUpdate} options={["MONSIEUR","MADAME","MADEMOISELLE","SOCIÉTÉ"]} />
                    </div>
                    <div className="mt-4">
                      <Input label="Nom & Prénom" name="nomAssure" value={form.nomAssure} onChange={handleUpdate} placeholder="Nom complet" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Select label="Type Pièce"        name="typePiece"       value={form.typePiece}       onChange={handleUpdate} options={REF.pieces} />
                      <Input  label="N° Pièce Identité" name="numPieceIdentite" value={form.numPieceIdentite} onChange={handleUpdate} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <Input  label="Adresse"    name="adresse"    value={form.adresse}    onChange={handleUpdate} />
                      <Input  label="Ville"      name="ville"      value={form.ville}      onChange={handleUpdate} />
                      <Select label="Wilaya"     name="wilaya"     value={form.wilaya}     onChange={handleUpdate} options={REF.wilayas} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <Select label="Profession"    name="profession"    value={form.profession}    onChange={handleUpdate} options={REF.professions} />
                      <Select label="Activité"      name="activite"      value={form.activite}      onChange={handleUpdate} options={REF.activites} />
                      <Input  label="Ch. d'Affaire" name="chiffreAffaire" value={form.chiffreAffaire} onChange={handleUpdate} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Input label="Téléphone" name="telephone" value={form.telephone} onChange={handleUpdate} type="tel" />
                      <Input label="E-Mail"    name="email"     value={form.email}     onChange={handleUpdate} type="email" />
                    </div>
                  </SectionCard>

                  <SectionCard title="Couverture" color="slate">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 md:col-span-1">
                        <Checkbox label="Contrat Ferme" name="contratFerme" checked={form.contratFerme} onChange={handleUpdate} />
                      </div>
                      <Input label="Souscrit Le" name="souscritLe" value={form.souscritLe} onChange={handleUpdate} type="date" />
                      <Input label="Saisi Le"    name="saisiLe"    value={form.saisiLe}    onChange={handleUpdate} type="date" />
                      <Input label="Durée (mois)" name="duree"     value={form.duree}      onChange={handleUpdate} type="number" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <Input  label="Date Effet"   name="dateEffet"   value={form.dateEffet}   onChange={handleUpdate} type="date" />
                      <Input  label="Date Échéance" name="dateEcheance" value={form.dateEcheance} onChange={handleUpdate} type="date" />
                      <Select label="Fractionnement" name="fractionnement" value={form.fractionnement} onChange={handleUpdate} options={REF.fracts} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input  label="Tarif"     name="tarif"     value={form.tarif}     onChange={handleUpdate} />
                      <Select label="Type"      name="type"      value={form.type}      onChange={handleUpdate} options={REF.types} />
                      <Select label="Réduction" name="reduction" value={form.reduction} onChange={handleUpdate} options={REF.reductions} isObj />
                      <Select label="Régime"    name="regime"    value={form.regime}    onChange={handleUpdate} options={REF.regimes} />
                    </div>
                  </SectionCard>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <SectionCard title="Bonus & Commissions" color="amber">
                      <div className="space-y-3">
                        <Input label="Taux Apport"    value="12%"       readOnly />
                        <Input label="Frais Gestion"  value="850.00 DZD" readOnly />
                        <Input label="Commission spéciale" value="0%"   readOnly />
                      </div>
                    </SectionCard>
                    <SectionCard title="Timbres de Dimensions" color="green">
                      <div className="space-y-3">
                        <Select label="Type"        name="typeDimension"  value={form.typeDimension}  onChange={handleUpdate} options={["Standard","Grande Dimension","Remorque"]} />
                        <Input  label="Nombre"      name="nombreDimension" value={form.nombreDimension} onChange={handleUpdate} type="number" />
                        <Select label="Exonération" name="exoneration"    value={form.exoneration}    onChange={handleUpdate} options={["Aucune","Diplomatique","État"]} />
                      </div>
                    </SectionCard>
                  </div>
                </div>
              )}

              {/* ── VÉHICULE ── */}
              {activeTab === 'vehicule' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Input  label="N° d'Ordre" name="numOrdre"      value={form.numOrdre}      onChange={handleUpdate} />
                    <Input  label="Marque"     name="marque"        value={form.marque}        onChange={handleUpdate} />
                    <Input  label="Type"       name="typeVehicule"  value={form.typeVehicule}  onChange={handleUpdate} />
                    <Select label="Genre"      name="genreVehicule" value={form.genreVehicule} onChange={handleUpdate} options={REF.genres} isObj />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Usage"          name="usage" value={form.usage} onChange={handleUpdate} options={REF.usages} />
                    <Select label="Zone Tarifaire" name="zone"  value={form.zone}  onChange={handleUpdate} options={REF.zones} isObj />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Immatriculation"  name="immatriculation" value={form.immatriculation} onChange={handleUpdate} />
                    <Input label="M.E.C"            name="dateMEC"         value={form.dateMEC}         onChange={handleUpdate} type="date" />
                    <Input label="Dernier Contrôle" name="dernierControle" value={form.dernierControle} onChange={handleUpdate} type="date" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <Select label="Énergie" name="energie" value={form.energie} onChange={handleUpdate} options={REF.energies} />
                    <div className="flex flex-col gap-3 pt-2">
                      <Checkbox label="Turbo"        name="turbo"        checked={form.turbo}        onChange={handleUpdate} />
                      <Checkbox label="Avec Remorque" name="avecRemorque" checked={form.avecRemorque} onChange={handleUpdate} />
                    </div>
                    <Input label="Délégataire Crédit" name="delegataireCredit" value={form.delegataireCredit} onChange={handleUpdate} />
                    <div className="pt-2">
                      <Checkbox label="Matières inflammables" name="matInflammableVeh" checked={form.matInflammableVeh} onChange={handleUpdate} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="N° Châssis"  name="chassis"    value={form.chassis}    onChange={handleUpdate} />
                    <Input label="N° Moteur"   name="moteur"     value={form.moteur}     onChange={handleUpdate} />
                    <Input label="Carrosserie" name="carrosserie" value={form.carrosserie} onChange={handleUpdate} />
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    <Input label="Puissance" name="puissance" value={form.puissance} onChange={handleUpdate} />
                    <Input label="Tonnage"   name="tonnage"   value={form.tonnage}   onChange={handleUpdate} />
                    <Input label="Cylindrée" name="cylindree" value={form.cylindree} onChange={handleUpdate} />
                    <Input label="Vitesse"   name="vitesse"   value={form.vitesse}   onChange={handleUpdate} />
                    <Input label="Nb Places" name="places"    value={form.places}    onChange={handleUpdate} />
                  </div>
                  <Select label="Wilaya de Circulation" name="wilaya" value={form.wilaya} onChange={handleUpdate} options={REF.wilayas} />
                </div>
              )}

              {/* ── VÉHICULE 2 ── */}
              {activeTab === 'vehicule2' && (
                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                  Informations complémentaires véhicule (documents, remorque…) — à compléter
                </div>
              )}

              {/* ── GARANTIES ── */}
              {activeTab === 'garanties' && (
                <div className="space-y-5">
                  <SectionCard title="Sélection des Garanties" color="blue">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {GARANTIES_CONFIG.map(g => (
                        <div key={g.key}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all
                            ${form.garanties[g.key]
                              ? 'bg-[#1a3a6b]/5 border-[#1a3a6b]/40 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox" name={g.key} checked={form.garanties[g.key]}
                              onChange={handleUpdate} disabled={g.required}
                              className="w-4 h-4 accent-[#1a3a6b]"
                            />
                            <div>
                              <p className={`text-sm font-bold ${form.garanties[g.key] ? 'text-[#1a3a6b]' : 'text-slate-700'}`}>{g.label}</p>
                              {g.required && <p className="text-[10px] font-black text-red-500 uppercase">Obligatoire</p>}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 text-right">{g.info}</span>
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Majorations" color="red">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input label="Permis (DZD)"              name="majPermis"   value={form.majPermis}   onChange={handleUpdate} type="number" />
                      <Input label="Âge (DZD)"                 name="majAge"      value={form.majAge}      onChange={handleUpdate} type="number" />
                      <Input label="Matières Inflammables (DZD)" name="majMatieres" value={form.majMatieres} onChange={handleUpdate} type="number" />
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ── SMP ── */}
              {activeTab === 'smp' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label:"Capital Assuré",  name:"capitalAssure",  bg:"from-slate-800 to-slate-900", lbl:"text-blue-300", inp:"text-white" },
                    { label:"Valeur à Neuf",   name:"valeurANeuf",    bg:"from-blue-700 to-blue-800",   lbl:"text-blue-100", inp:"text-white" },
                    { label:"Valeur Vénale",   name:"valeurVenale",   bg:"from-white to-slate-50",      lbl:"text-slate-500", inp:"text-slate-900", border:true },
                    { label:"Valeur Auto-Radio", name:"valeurAutoRadio", bg:"from-white to-green-50",   lbl:"text-slate-500", inp:"text-slate-900", border:true },
                  ].map(c => (
                    <div key={c.name} className={`p-8 bg-gradient-to-br ${c.bg} rounded-2xl shadow-lg ${c.border ? 'border-2 border-slate-100' : ''}`}>
                      <label className={`text-[10px] font-black uppercase tracking-widest block mb-3 ${c.lbl}`}>{c.label}</label>
                      <input
                        name={c.name} value={form[c.name]} onChange={handleUpdate}
                        className={`bg-transparent text-5xl font-black border-b-4 border-current/30 w-full outline-none focus:border-current pb-2 transition-all ${c.inp}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ── QUITTANCE (onglet étape 1) ── */}
              {activeTab === 'quittance' && (
                <div className="space-y-5">
                  <div className="bg-gradient-to-br from-slate-900 to-[#0f2247] rounded-2xl p-8 border-b-4 border-[#e89d1b]">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-300 border-b border-white/10 pb-3 mb-4">Tarification</h3>
                    {[
                      ["Prime de Base",           quittance.primeBase,           false],
                      ["+ Garanties Facultatives", quittance.totalOptions,        false],
                      ["= Prime Avant Réduction",  quittance.primeAvantReduction, true ],
                      ["− Réduction Commerciale",  quittance.montantReduction,    false],
                      ["= Prime Après Réduction",  quittance.primeApresReduction, false],
                      ["+ Majorations",            quittance.totalMajorations,    false],
                    ].map(([l,v,a]) => <QRow key={l} label={l} value={v} accent={a} />)}

                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-300 border-b border-white/10 pb-3 mb-4 mt-6">Primes & Taxes</h3>
                    {[
                      ["Prime Nette",              quittance.primeNette,          true ],
                      ["Accessoires Auto-Radio",   quittance.accessoires,         false],
                      ["Taxes / Prime (19%)",      quittance.taxesPrime,          false],
                      ["Taxes / Accessoires (19%)",quittance.taxeAccessoires,     false],
                      ["Total Taxes",              quittance.totalTaxes,          true ],
                      ["Timbre de Dimension",      quittance.timbreDimension,     false],
                      ["Timbre Gradué",            quittance.timbreGradue,        false],
                    ].map(([l,v,a]) => <QRow key={l} label={l} value={v} accent={a} />)}

                    <div className="border-t-2 border-[#e89d1b]/50 mt-4 pt-4">
                      <QRow label="TOTAL À PAYER (TTC)" value={quittance.totalAPayer} large />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <SectionCard title="Commissions" color="amber">
                      <div className="space-y-2 text-sm">
                        {[["Apport (12%)", quittance.apport],["Gestion", quittance.gestion],["Total", quittance.totalCommissions]].map(([l,v]) => (
                          <div key={l} className="flex justify-between py-1.5 border-b border-amber-200 last:border-0 last:font-black last:text-base">
                            <span className="text-slate-600">{l}</span>
                            <span className="font-mono font-bold">{v} DZD</span>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                    <SectionCard title="Comptabilisation" color="green">
                      <div className="space-y-3 mb-4">
                        <Input label="Émission : Pièce N°"  value="" readOnly />
                        <Input label="Annulation : Pièce N°" value="" readOnly />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[["Imprimer","blue"],["Encaissements","green"],["Annulation","red"],["REC","slate"],["Sinistres","purple"]].map(([l,c]) => (
                          <button key={l} className={`py-2 rounded-lg text-white text-xs font-bold bg-${c}-600 hover:bg-${c}-700 transition col-span-1`}>{l}</button>
                        ))}
                      </div>
                    </SectionCard>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ ÉTAPE 2 — CONDUCTEUR ════ */}
          {step === 2 && (
            <div className="space-y-6">
              <SectionCard title="Profil du Conducteur" color="blue">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Field label="Sexe du Conducteur">
                    <div className="flex gap-3">
                      {[["H","👨 Homme"],["F","👩 Femme"]].map(([val,label]) => (
                        <button key={val} onClick={() => setForm(p => ({...p, sexe:val}))}
                          className={`flex-1 py-5 rounded-xl font-bold text-sm transition-all border-2
                            ${form.sexe === val
                              ? 'bg-[#1a3a6b] text-white border-[#1a3a6b] shadow-lg scale-105'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-[#1a3a6b]/50'
                            }`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Input label="Âge du Conducteur" name="age" value={form.age} onChange={handleUpdate} type="number" />
                </div>
                <Input label="Date d'Obtention du Permis" name="datePermis" value={form.datePermis} onChange={handleUpdate} type="date" />
              </SectionCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SectionCard title="Coefficients Appliqués" color="amber">
                  {coefficients.map(([l,v]) => (
                    <div key={l} className="flex justify-between py-2 border-b border-amber-200 text-sm">
                      <span className="text-slate-600">{l}</span>
                      <span className="font-mono font-black text-amber-900">{v}</span>
                    </div>
                  ))}
                </SectionCard>
                <SectionCard title="Informations Complémentaires" color="green">
                  {[["Genre", form.genreVehicule],["Zone", `${form.zone} — ${REF.zones.find(z=>z.id===form.zone)?.label}`],["Wilaya", form.wilaya],["Usage", form.usage]].map(([l,v]) => (
                    <div key={l} className="flex justify-between py-2 border-b border-green-200 text-sm">
                      <span className="text-slate-600">{l}</span>
                      <span className="font-bold text-green-900">{v}</span>
                    </div>
                  ))}
                </SectionCard>
              </div>
            </div>
          )}

          {/* ════ ÉTAPE 3 — GARANTIES RÉCAP ════ */}
          {step === 3 && (
            <div className="bg-gradient-to-br from-[#0f2247] to-[#1a3a6b] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-black mb-6 border-b-2 border-[#e89d1b] pb-4">
                📋 Récapitulatif des Garanties Souscrites
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(form.garanties).filter(([,v]) => v).map(([key]) => (
                  <div key={key} className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl border border-white/20 backdrop-blur-sm">
                    <div className="w-6 h-6 rounded-full bg-[#e89d1b] flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-semibold text-sm">{GARANTIES_LABELS[key]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ ÉTAPE 4 — QUITTANCE FINALE ════ */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#0a1628] via-[#0f2247] to-[#1a3a6b] rounded-3xl p-10 relative overflow-hidden shadow-2xl border-b-8 border-[#e89d1b]">
                <div className="absolute -top-16 -right-16 text-[18rem] font-black opacity-[0.03] select-none text-white">SAA</div>
                <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12">
                  <div className="flex-1 space-y-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-300 border-b border-white/10 pb-3 mb-4">
                      Décomposition de la Quittance
                    </h3>
                    {[
                      ["Prime de Base",             quittance.primeBase,           false],
                      ["+ Options",                 quittance.totalOptions,        false],
                      ["− Réduction",               quittance.montantReduction,    false],
                      ["+ Majorations",             quittance.totalMajorations,    false],
                      ["Prime Nette",               quittance.primeNette,          true ],
                      ["Accessoires (Auto-Radio)",  quittance.accessoires,         false],
                      ["Taxes / Prime (19%)",       quittance.taxesPrime,          false],
                      ["Taxes / Accessoires (19%)", quittance.taxeAccessoires,     false],
                      ["Total Taxes",               quittance.totalTaxes,          true ],
                      ["Timbre de Dimension",       quittance.timbreDimension,     false],
                      ["Timbre Gradué",             quittance.timbreGradue,        false],
                    ].map(([l,v,a]) => <QRow key={l} label={l} value={v} accent={a} />)}
                    <div className="flex flex-wrap gap-2 pt-4">
                      {[form.wilaya, `Zone ${form.zone}`, form.genreVehicule, form.fractionnement].map(t => <Tag key={t}>{t}</Tag>)}
                    </div>
                  </div>
                  <div className="text-center bg-white/5 px-10 py-8 rounded-2xl border border-white/10 backdrop-blur-md self-start">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 mb-3">Net à Payer (TTC)</p>
                    <div className="text-7xl font-black tracking-tighter leading-none mb-2 text-white">
                      {quittance.totalAPayer}
                    </div>
                    <p className="text-lg font-bold text-slate-400">DINARS ALGÉRIENS</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SectionCard title="Détails du Dossier" color="blue">
                  {infosDossier.map(([l,v]) => (
                    <div key={l} className="flex justify-between py-2 border-b border-blue-200 text-sm">
                      <span className="text-slate-600 font-semibold">{l}</span>
                      <span className="font-bold text-slate-800">{v}</span>
                    </div>
                  ))}
                </SectionCard>
                <SectionCard title="Commissions" color="green">
                  {[["Apport (12%)",`${quittance.apport} DZD`],["Gestion",`${quittance.gestion} DZD`],["Total Commissions",`${quittance.totalCommissions} DZD`]].map(([l,v],i) => (
                    <div key={l} className={`flex justify-between py-2 text-sm ${i===2?'border-t-2 border-green-300 pt-3 mt-2 font-black text-base':'border-b border-green-200'}`}>
                      <span className="text-slate-600 font-semibold">{l}</span>
                      <span className="font-bold text-green-800">{v}</span>
                    </div>
                  ))}
                </SectionCard>
              </div>

              {/* Bandeau auth si non connecté */}
              {!user && (
                <div className="bg-[#e89d1b]/10 border-2 border-[#e89d1b]/40 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <p className="font-black text-[#c27d0a] uppercase tracking-wider text-sm">
                      🔒 Créez un compte pour finaliser
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      Imprimez, payez ou sauvegardez ce devis en toute sécurité.
                    </p>
                  </div>
                  <div className="text-2xl">→</div>
                </div>
              )}
            </div>
          )}

          {/* ── NAVIGATION ── */}
          <div className="mt-10 flex justify-between items-center border-t-2 border-slate-100 pt-8">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onGoHome()}
              className="px-6 py-3 text-slate-500 hover:text-red-600 font-black uppercase text-[10px] tracking-widest transition-all hover:bg-red-50 rounded-lg"
            >
              {step === 1 ? "✕ Annuler" : "← Précédent"}
            </button>

            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Étape {step} / 4</p>
              <div className="flex gap-2 justify-center">
                {[1,2,3,4].map(s => (
                  <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${
                    s === step ? 'w-8 bg-[#1a3a6b]' : s < step ? 'w-5 bg-[#e89d1b]' : 'w-5 bg-slate-200'
                  }`} />
                ))}
              </div>
            </div>

            <button
              onClick={() => step < 4 ? setStep(step + 1) : handleSave()}
              className="bg-[#1a3a6b] hover:bg-[#0f2247] text-white px-10 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95"
            >
              {step === 4 ? (user ? "✅ Émettre la Police" : "🔒 Finaliser & Créer un Compte") : "Suivant →"}
            </button>
          </div>
        </div>
      </div>

      <p className="text-center mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        SAA ORASS Suite © 2026 · Direction des Systèmes d'Information
      </p>
    </div>
  );
};

export default DevisStepByStep;