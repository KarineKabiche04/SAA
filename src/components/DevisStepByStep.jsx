import React, { useState, useEffect } from 'react';

const SAA_ORASS_PRODUCTION_COMPLETE = ({ onGoHome, onSaveToDashboard }) => {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('police');

  // --- RÉFÉRENTIELS ---
  const refWilayas = [
    "01-Adrar","02-Chlef","03-Laghouat","04-Oum El Bouaghi","05-Batna","06-Béjaïa","07-Biskra","08-Béchar","09-Blida","10-Bouira",
    "11-Tamanrasset","12-Tébessa","13-Tlemcen","14-Tiaret","15-Tizi Ouzou","16-Alger","17-Djelfa","18-Jijel","19-Sétif","20-Saïda",
    "21-Skikda","22-Sidi Bel Abbès","23-Annaba","24-Guelma","25-Constantine","26-Médéa","27-Mostaganem","28-M'Sila","29-Mascara","30-Ouargla",
    "31-Oran","32-El Bayadh","33-Illizi","34-Bordj Bou Arreridj","35-Boumerdès","36-El Tarf","37-Tindouf","38-Tissemsilt","39-El Oued","40-Khenchela",
    "41-Souk Ahras","42-Tipaza","43-Mila","44-Aïn Defla","45-Naâma","46-Aïn Témouchent","47-Ghardaïa","48-Relizane","49-El M'Ghair","50-El Meniaa",
    "51-Ouled Djellal","52-Bordj Baji Mokhtar","53-Béni Abbès","54-Timimoun","55-Touggourt","56-Djanet","57-In Salah","58-In Guezzam"
  ];
  const refZones = [
    { id:"01", label:"ZONE 01 - NORD",  coef:1.00 },
    { id:"02", label:"ZONE 02 - EST",   coef:0.95 },
    { id:"03", label:"ZONE 03 - OUEST", coef:0.95 },
    { id:"04", label:"ZONE 04 - SUD",   coef:0.80 }
  ];
  const refGenresVehicule = [
    { id:"VP",   label:"VP - VOITURE PARTICULIÈRE", base:12500 },
    { id:"VU",   label:"VU - VÉHICULE UTILITAIRE",  base:19000 },
    { id:"MOTO", label:"MOTO - DEUX ROUES",          base:8500  },
    { id:"TC",   label:"TC - TRANSPORT EN COMMUN",   base:28000 }
  ];
  const refProfessions = [
    "CADRE","EMPLOYÉ","COMMERÇANT","FONCTIONNAIRE","MÉDECIN","AVOCAT","INGÉNIEUR","ENSEIGNANT","ARTISAN","RETRAITÉ","SANS PROFESSION"
  ];
  const refActivites = ["PRIVÉE","PUBLIQUE","COMMERCIALE","LIBÉRALE","ARTISANALE","AGRICOLE"];
  const refReductions = [
    { id:"AUCUNE",      label:"Aucune",                    value:0    },
    { id:"FLOTTE",      label:"Réduction Flotte 10%",      value:0.10 },
    { id:"MULTIRISQUE", label:"Réduction Multi-risque 5%", value:0.05 },
    { id:"ANCIENNETE",  label:"Réduction Ancienneté 15%",  value:0.15 }
  ];
  const refRegimes = ["RÉGIME NORMAL","RÉGIME RÉDUIT","RÉGIME SPÉCIAL"];
  const refUsages = ["USAGE PRIVÉ","USAGE COMMERCIAL","TAXI","TRANSPORT EN COMMUN","LOCATION"];

  // --- ÉTAT GLOBAL ---
  const [formData, setFormData] = useState({
    // Police
    agence: "16001 - ALGER CENTRE",
    numPolice: `POL-${Date.now()}`,
    numAvenant: "0",
    numGarantie: "0",
    refDossier: "",
    convention: "9901 - INDIVIDUELLE",
    sousConvention: "",
    dateEffet: new Date().toISOString().split('T')[0],
    heureEffet: "00:00",
    dateEcheance: "",
    fractionnement: "ANNUEL",
    // Assuré
    nomAssure: "",
    qualite: "MONSIEUR",
    codeAssure: "",
    typePiece: "CNI",
    numPieceIdentite: "",
    adresse: "",
    ville: "",
    wilaya: "16-Alger",
    zone: "01",
    profession: "EMPLOYÉ",
    activite: "PRIVÉE",
    chiffreAffaire: "",
    telephone: "",
    email: "",
    // Conducteur
    sexe: "H",
    age: "30",
    datePermis: "",
    // Véhicule
    numOrdre: "0",
    marque: "",
    typeVehicule: "",
    immatriculation: "",
    dateMEC: "",
    dernierControle: "",
    energie: "ESSENCE",
    turbo: false,
    delegataireCredit: "",
    chassis: "",
    moteur: "",
    carrosserie: "",
    avecRemorque: false,
    puissance: "",
    tonnage: "",
    cylindree: "",
    vitesse: "",
    places: "5",
    // ✅ FIX: renommé pour éviter le doublon avec majMatieres
    matInflammableVeh: false,
    genreVehicule: "VP",
    usage: "USAGE PRIVÉ",
    // Valeurs SMP
    valeurVenale: "1500000",
    valeurANeuf: "2500000",
    valeurAutoRadio: "0",
    capitalAssure: "2500000",
    // Couverture
    contratFerme: false,
    souscritLe: new Date().toISOString().split('T')[0],
    saisiLe: new Date().toISOString().split('T')[0],
    duree: "12",
    tarif: "TARIF STANDARD",
    type: "NOUVELLE AFFAIRE",
    reduction: "AUCUNE",
    regime: "RÉGIME NORMAL",
    // Garanties
    garanties: {
      rc: true, dr: true, bdg: false, vol: false,
      inc: false, dc: false, pt: true, ir: false, tc: false
    },
    // ✅ FIX: majorations avec noms distincts
    majPermis: "0",
    majAge: "0",
    majMatieres: "0",
    // Timbres
    typeDimension: "",
    nombreDimension: "1",
    exoneration: "Aucune"
  });

  // --- QUITTANCE STATE ---
  const [quittance, setQuittance] = useState({
    primeBase: "0.00",
    totalOptions: "0.00",
    primeAvantReduction: "0.00",
    montantReduction: "0.00",
    primeApresReduction: "0.00",
    totalMajorations: "0.00",
    primeNette: "0.00",
    accessoires: "0.00",
    taxesPrime: "0.00",
    taxeAccessoires: "0.00",
    totalTaxes: "0.00",
    timbreDimension: "150.00",
    timbreGradue: "0.00",
    totalAPayer: "0.00",
    apport: "0.00",
    gestion: "850.00",
    totalCommissions: "850.00"
  });

  // --- MOTEUR DE CALCUL COMPLET ---
  useEffect(() => {
    // [1] PRIME DE BASE
    const base     = refGenresVehicule.find(g => g.id === formData.genreVehicule)?.base || 12500;
    const coefZone = refZones.find(z => z.id === formData.zone)?.coef || 1.0;
    const coefAge  = parseInt(formData.age) < 25 ? 1.5 : parseInt(formData.age) > 60 ? 0.9 : 1.0;
    const coefSexe = formData.sexe === "F" ? 0.95 : 1.05;
    const primeBase = base * coefZone * coefAge * coefSexe;

    // [2] GARANTIES FACULTATIVES
    const valV = parseFloat(formData.valeurVenale) || 0;
    let totalOptions = 0;
    if (formData.garanties.bdg) totalOptions += 4500;
    if (formData.garanties.vol) totalOptions += valV * 0.007;
    if (formData.garanties.inc) totalOptions += valV * 0.003;
    if (formData.garanties.dc)  totalOptions += valV * 0.018;
    if (formData.garanties.pt)  totalOptions += 1250;
    if (formData.garanties.ir)  totalOptions += 2800;
    if (formData.garanties.tc)  totalOptions += 3500;

    // [3] ACCESSOIRES
    const valRadio   = parseFloat(formData.valeurAutoRadio) || 0;
    const accessoires = valRadio * 0.025;

    // [4] PRIME AVANT RÉDUCTION
    const primeAvantReduction = primeBase + totalOptions;

    // [5] RÉDUCTION
    const tauxReduction    = refReductions.find(r => r.id === formData.reduction)?.value || 0;
    const montantReduction = primeAvantReduction * tauxReduction;
    const primeApresReduction = primeAvantReduction - montantReduction;

    // [6] MAJORATIONS
    const majP = parseFloat(formData.majPermis)   || 0;
    const majA = parseFloat(formData.majAge)       || 0;
    const majM = parseFloat(formData.majMatieres)  || 0;
    const totalMajorations = majP + majA + majM;
    const primeNette = primeApresReduction + totalMajorations;

    // [7] TAXES (TVA 19%)
    const taxesPrime      = primeNette   * 0.19;
    const taxeAccessoires = accessoires  * 0.19;
    const totalTaxes      = taxesPrime + taxeAccessoires;

    // [8] TIMBRES
    const timbreDimension = 150.00;
    const timbreGradue    = (parseInt(formData.nombreDimension) || 1) * 50;

    // [9] TOTAL À PAYER
    const totalAPayer = primeNette + accessoires + totalTaxes + timbreDimension + timbreGradue;

    // [10] COMMISSIONS
    const apport           = primeNette * 0.12;
    const gestion          = 850.00;
    const totalCommissions = apport + gestion;

    setQuittance({
      primeBase:            primeBase.toFixed(2),
      totalOptions:         totalOptions.toFixed(2),
      primeAvantReduction:  primeAvantReduction.toFixed(2),
      montantReduction:     montantReduction.toFixed(2),
      primeApresReduction:  primeApresReduction.toFixed(2),
      totalMajorations:     totalMajorations.toFixed(2),
      primeNette:           primeNette.toFixed(2),
      accessoires:          accessoires.toFixed(2),
      taxesPrime:           taxesPrime.toFixed(2),
      taxeAccessoires:      taxeAccessoires.toFixed(2),
      totalTaxes:           totalTaxes.toFixed(2),
      timbreDimension:      timbreDimension.toFixed(2),
      timbreGradue:         timbreGradue.toFixed(2),
      totalAPayer:          totalAPayer.toFixed(2),
      apport:               apport.toFixed(2),
      gestion:              gestion.toFixed(2),
      totalCommissions:     totalCommissions.toFixed(2)
    });
  }, [formData]);

  // --- HANDLER UNIFIÉ ---
  const handleUpdate = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name in formData.garanties) {
        setFormData(prev => ({ ...prev, garanties: { ...prev.garanties, [name]: checked } }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    const finalData = { ...formData, quittance, createdAt: new Date().toLocaleString(), status: "ÉMIS", genre: "AUTO" };
    onSaveToDashboard(finalData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 p-4 md:p-8 font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-blue-700 p-6 border-b-4 border-blue-400 flex justify-between items-center text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 px-4 py-2 rounded-lg font-bold text-2xl shadow-md">🚗</div>
            <div>
              <h2 className="font-bold text-lg">ORASS®Suite - Société Nationale d'Assurance</h2>
              <p className="text-xs text-blue-200">Licence N°1622130900 • Module Automobile • Version 4.5.2</p>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            {[1,2,3,4].map(s => (
              <div key={s} className={`h-2 w-12 rounded-full transition-all duration-500 ${s <= step ? 'bg-blue-400' : 'bg-slate-500'}`} />
            ))}
          </div>
        </div>

        {/* INFO BAR */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex justify-between items-center text-xs">
          <div className="flex gap-6">
            <span className="text-slate-600"><strong>Police:</strong> <span className="text-blue-600 font-mono">{formData.numPolice}</span></span>
            <span className="text-slate-600"><strong>N°:</strong> <span className="font-mono">{formData.numAvenant}</span></span>
            <span className="text-slate-600"><strong>N°G:</strong> <span className="font-mono">{formData.numGarantie}</span></span>
            <span className="text-slate-600"><strong>Véh:</strong> <span className="font-mono">{formData.genreVehicule === 'VP' ? '1' : '0'}</span></span>
          </div>
          <div className="flex gap-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">AUTOINTE</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">DRTO</span>
          </div>
        </div>

        <div className="p-6 md:p-8">

          {/* ── ÉTAPE 1 ── */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {/* Onglets */}
              <div className="flex gap-2 border-b-2 border-slate-200 pb-2">
                {['police','vehicule','vehicule2','garanties','smp','quittance'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-all ${
                      activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}>
                    {tab === 'police'    && 'Police'}
                    {tab === 'vehicule'  && 'Véhicule'}
                    {tab === 'vehicule2' && 'Véhicule...'}
                    {tab === 'garanties' && 'Garanties'}
                    {tab === 'smp'       && 'SMP / Risque'}
                    {tab === 'quittance' && 'Quittance'}
                  </button>
                ))}
              </div>

              {/* ── POLICE ── */}
              {activeTab === 'police' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Convention"  name="convention"    value={formData.convention}    onChange={handleUpdate} />
                    <InputField label="S/Convention" name="sousConvention" value={formData.sousConvention} onChange={handleUpdate} />
                    <InputField label="Réf. dossier" name="refDossier"    value={formData.refDossier}    onChange={handleUpdate} />
                  </div>
                  <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
                    <h3 className="font-bold text-blue-800 text-sm mb-4 border-b border-blue-200 pb-2">INFORMATIONS ASSURÉ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Code"    name="codeAssure" value={formData.codeAssure} onChange={handleUpdate} />
                      <SelectField label="Qualité" name="qualite"   value={formData.qualite}    onChange={handleUpdate} options={["MONSIEUR","MADAME","MADEMOISELLE","SOCIÉTÉ"]} />
                    </div>
                    <InputField label="Nom" name="nomAssure" value={formData.nomAssure} onChange={handleUpdate} placeholder="NOM & PRÉNOM COMPLET" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectField label="Type Pièce"        name="typePiece"       value={formData.typePiece}       onChange={handleUpdate} options={["CNI","PASSEPORT","PERMIS DE CONDUIRE"]} />
                      <InputField  label="N° Pièce Identité" name="numPieceIdentite" value={formData.numPieceIdentite} onChange={handleUpdate} />
                    </div>
                    <InputField label="Adresse" name="adresse" value={formData.adresse} onChange={handleUpdate} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InputField  label="Ville"      name="ville"      value={formData.ville}      onChange={handleUpdate} />
                      <SelectField label="Profession" name="profession" value={formData.profession} onChange={handleUpdate} options={refProfessions} />
                      <SelectField label="Activité"   name="activite"   value={formData.activite}   onChange={handleUpdate} options={refActivites} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Téléphone" name="telephone" value={formData.telephone} onChange={handleUpdate} type="tel" />
                      <InputField label="E-Mail"    name="email"     value={formData.email}     onChange={handleUpdate} type="email" />
                    </div>
                    <InputField label="Ch Affaire" name="chiffreAffaire" value={formData.chiffreAffaire} onChange={handleUpdate} />
                  </div>

                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-300 pb-2">COUVERTURE</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" name="contratFerme" checked={formData.contratFerme} onChange={handleUpdate} className="w-5 h-5 text-blue-600 rounded" />
                        <label className="text-sm font-semibold text-slate-700">Contrat/Ferme</label>
                      </div>
                      <InputField label="Souscrit Le" name="souscritLe" value={formData.souscritLe} onChange={handleUpdate} type="date" />
                      <InputField label="Saisi Le"    name="saisiLe"    value={formData.saisiLe}    onChange={handleUpdate} type="date" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Effet Du" name="dateEffet"    value={formData.dateEffet} onChange={handleUpdate} type="date" />
                      <InputField label="Durée"    name="duree"        value={formData.duree}     onChange={handleUpdate} type="number" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Echéance" name="dateEcheance" value={formData.dateEcheance} onChange={handleUpdate} type="date" />
                      <InputField label="Tarif"    name="tarif"        value={formData.tarif}        onChange={handleUpdate} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectField label="Type"     name="type"      value={formData.type}      onChange={handleUpdate} options={["NOUVELLE AFFAIRE","RENOUVELLEMENT","AVENANT"]} />
                      <SelectField label="Réduction" name="reduction" value={formData.reduction} onChange={handleUpdate} options={refReductions} isObj />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectField label="Régime"      name="regime" value={formData.regime} onChange={handleUpdate} options={refRegimes} />
                      <InputField  label="Coefficient" value="1.00"  readOnly />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
                      <h3 className="font-bold text-amber-800 text-sm mb-4">BONUS & MALUS</h3>
                      <div className="space-y-3">
                        <InputField label="Apport"  value="12%"      readOnly />
                        <InputField label="Gestion" value="850.00 DZD" readOnly />
                        <div className="pt-3 border-t border-amber-300">
                          <InputField label="Taux de commission spéciale" value="0%" readOnly />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                      <h3 className="font-bold text-green-800 text-sm mb-4">TIMBRES DE DIMENSIONS</h3>
                      <div className="space-y-3">
                        <SelectField label="Type"        name="typeDimension"  value={formData.typeDimension}  onChange={handleUpdate} options={["Standard","Grande Dimension","Remorque"]} />
                        <InputField  label="Nombre"      name="nombreDimension" value={formData.nombreDimension} onChange={handleUpdate} type="number" />
                        <SelectField label="Exonération" name="exoneration"    value={formData.exoneration}    onChange={handleUpdate} options={["Aucune","Diplomatique","État"]} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── VÉHICULE ── */}
              {activeTab === 'vehicule' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <InputField  label="N° d'ordre" name="numOrdre"      value={formData.numOrdre}      onChange={handleUpdate} />
                    <InputField  label="Marque"     name="marque"        value={formData.marque}        onChange={handleUpdate} />
                    <InputField  label="Type"       name="typeVehicule"  value={formData.typeVehicule}  onChange={handleUpdate} />
                    <SelectField label="Genre"      name="genreVehicule" value={formData.genreVehicule} onChange={handleUpdate} options={refGenresVehicule} isObj />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField label="Usage"        name="usage" value={formData.usage} onChange={handleUpdate} options={refUsages} />
                    <SelectField label="Zone Tarifaire" name="zone" value={formData.zone}  onChange={handleUpdate} options={refZones} isObj />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Immatriculation"  name="immatriculation" value={formData.immatriculation} onChange={handleUpdate} />
                    <InputField label="M.E.C"            name="dateMEC"         value={formData.dateMEC}         onChange={handleUpdate} type="date" />
                    <InputField label="Dernier contrôle" name="dernierControle" value={formData.dernierControle} onChange={handleUpdate} type="date" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SelectField label="Énergie" name="energie" value={formData.energie} onChange={handleUpdate} options={["ESSENCE","DIESEL","GPL","ÉLECTRIQUE"]} />
                    <div className="flex items-center gap-2 mt-6">
                      <input type="checkbox" name="turbo" checked={formData.turbo} onChange={handleUpdate} />
                      <label className="text-sm">Turbo</label>
                    </div>
                    <InputField label="Délégataire Crédit" name="delegataireCredit" value={formData.delegataireCredit} onChange={handleUpdate} />
                    <div className="flex items-center gap-2 mt-6">
                      <input type="checkbox" name="avecRemorque" checked={formData.avecRemorque} onChange={handleUpdate} />
                      <label className="text-sm">Avec remorque</label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="N° Châssis" name="chassis"    value={formData.chassis}    onChange={handleUpdate} />
                    <InputField label="N° Moteur"  name="moteur"     value={formData.moteur}     onChange={handleUpdate} />
                    <InputField label="Carrosserie" name="carrosserie" value={formData.carrosserie} onChange={handleUpdate} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <InputField label="Puissance"  name="puissance"  value={formData.puissance}  onChange={handleUpdate} />
                    <InputField label="Tonnage"    name="tonnage"    value={formData.tonnage}    onChange={handleUpdate} />
                    <InputField label="Cylindrée"  name="cylindree"  value={formData.cylindree}  onChange={handleUpdate} />
                    <InputField label="Vitesse"    name="vitesse"    value={formData.vitesse}    onChange={handleUpdate} />
                    <InputField label="Nb Places"  name="places"     value={formData.places}     onChange={handleUpdate} />
                  </div>
                  {/* ✅ FIX: nom corrigé matInflammableVeh */}
                  <div className="flex items-center gap-3">
                    <input type="checkbox" name="matInflammableVeh" checked={formData.matInflammableVeh} onChange={handleUpdate} />
                    <label className="font-semibold text-red-600 text-sm">Matières inflammables</label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField label="Wilaya" name="wilaya" value={formData.wilaya} onChange={handleUpdate} options={refWilayas} />
                  </div>
                </div>
              )}

              {/* ── VÉHICULE... (placeholder) ── */}
              {activeTab === 'vehicule2' && (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Informations complémentaires véhicule (documents, remorque…)
                </div>
              )}

              {/* ── GARANTIES ── */}
              {activeTab === 'garanties' && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-6 text-lg">SÉLECTION DES GARANTIES</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <GarantieCheckbox label="RC - Responsabilité Civile"    name="rc"  checked={formData.garanties.rc}  onChange={handleUpdate} required capital="ILLIMITÉ" />
                      <GarantieCheckbox label="DR - Défense et Recours"       name="dr"  checked={formData.garanties.dr}  onChange={handleUpdate} required capital="INCLUS" />
                      <GarantieCheckbox label="BDG - Bris de Glace"           name="bdg" checked={formData.garanties.bdg} onChange={handleUpdate} capital="4 500 DZD (fixe)" />
                      <GarantieCheckbox label="VOL - Vol du Véhicule"         name="vol" checked={formData.garanties.vol} onChange={handleUpdate} capital="V.Vénale × 0.7%" />
                      <GarantieCheckbox label="INC - Incendie"                name="inc" checked={formData.garanties.inc} onChange={handleUpdate} capital="V.Vénale × 0.3%" />
                      <GarantieCheckbox label="DC - Dommages Collision"       name="dc"  checked={formData.garanties.dc}  onChange={handleUpdate} capital="V.Vénale × 1.8%" />
                      <GarantieCheckbox label="PT - Personnes Transportées"  name="pt"  checked={formData.garanties.pt}  onChange={handleUpdate} capital="1 250 DZD (fixe)" />
                      <GarantieCheckbox label="IR - Individuelle Conducteur" name="ir"  checked={formData.garanties.ir}  onChange={handleUpdate} capital="2 800 DZD (fixe)" />
                      <GarantieCheckbox label="TC - Tous Chocs"               name="tc"  checked={formData.garanties.tc}  onChange={handleUpdate} capital="3 500 DZD (fixe)" />
                    </div>
                  </div>
                  {/* ✅ FIX: noms corrigés majPermis / majAge / majMatieres */}
                  <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                    <h3 className="font-bold text-red-800 mb-4">MAJORATIONS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InputField label="Permis (DZD)"             name="majPermis"   value={formData.majPermis}   onChange={handleUpdate} type="number" />
                      <InputField label="Âge (DZD)"                name="majAge"      value={formData.majAge}      onChange={handleUpdate} type="number" />
                      <InputField label="Matières Inflammables (DZD)" name="majMatieres" value={formData.majMatieres} onChange={handleUpdate} type="number" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── SMP / RISQUE ── */}
              {activeTab === 'smp' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 text-slate-600 opacity-30 text-7xl font-black">DZD</div>
                      <label className="text-blue-300 text-xs font-bold uppercase block mb-3 tracking-wider">Capital Assuré</label>
                      <input name="capitalAssure" value={formData.capitalAssure} onChange={handleUpdate}
                        className="bg-transparent text-6xl font-black border-b-4 border-slate-600 w-full outline-none focus:border-blue-400 pb-2 transition-all" />
                    </div>
                    <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white shadow-xl">
                      <label className="text-blue-100 text-xs font-bold uppercase block mb-3 tracking-wider">Valeur à Neuf</label>
                      <input name="valeurANeuf" value={formData.valeurANeuf} onChange={handleUpdate}
                        className="bg-transparent text-6xl font-black border-b-4 border-blue-400 w-full outline-none focus:border-blue-200 pb-2 transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-white border-4 border-slate-100 rounded-2xl hover:border-blue-200 transition-all">
                      <label className="text-slate-500 text-xs font-bold uppercase block mb-3 tracking-wider">Valeur Vénale</label>
                      <input name="valeurVenale" value={formData.valeurVenale} onChange={handleUpdate}
                        className="bg-transparent text-6xl font-black border-b-4 border-slate-200 w-full outline-none focus:border-slate-400 pb-2 transition-all text-slate-800" />
                    </div>
                    <div className="p-8 bg-white border-4 border-slate-100 rounded-2xl hover:border-green-200 transition-all">
                      <label className="text-slate-500 text-xs font-bold uppercase block mb-3 tracking-wider">Valeur Auto Radio</label>
                      <input name="valeurAutoRadio" value={formData.valeurAutoRadio} onChange={handleUpdate}
                        className="bg-transparent text-6xl font-black border-b-4 border-slate-200 w-full outline-none focus:border-green-400 pb-2 transition-all text-slate-800" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── QUITTANCE (améliorée) ── */}
              {activeTab === 'quittance' && (
                <div className="space-y-6">
                  {/* Décomposition du calcul */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-blue-900 rounded-2xl p-10 text-white shadow-2xl border-b-8 border-blue-500">

                    {/* BLOC TARIFICATION */}
                    <h3 className="text-blue-300 font-bold uppercase tracking-widest border-b border-slate-600 pb-3 mb-4 text-sm">
                      TARIFICATION
                    </h3>
                    <div className="space-y-2 mb-6">
                      <QuittanceRow label="Prime de Base"              value={quittance.primeBase} />
                      <QuittanceRow label="+ Garanties Facultatives"   value={quittance.totalOptions} />
                      <QuittanceRow label="= Prime Avant Réduction"    value={quittance.primeAvantReduction} highlight />
                      <QuittanceRow label="− Réduction Commerciale"    value={quittance.montantReduction} />
                      <QuittanceRow label="= Prime Après Réduction"    value={quittance.primeApresReduction} />
                      <QuittanceRow label="+ Majorations"              value={quittance.totalMajorations} />
                    </div>

                    {/* BLOC PRIMES */}
                    <h3 className="text-blue-300 font-bold uppercase tracking-widest border-b border-slate-600 pb-3 mb-4 text-sm">
                      PRIMES & TAXES
                    </h3>
                    <div className="space-y-2 mb-6">
                      <QuittanceRow label="Prime Nette"         value={quittance.primeNette} highlight />
                      <QuittanceRow label="Accessoires (Auto-radio)" value={quittance.accessoires} />
                      <QuittanceRow label="Taxes / Prime (19%)" value={quittance.taxesPrime} />
                      <QuittanceRow label="Taxes / Acc. (19%)"  value={quittance.taxeAccessoires} />
                      <QuittanceRow label="Total Taxes"         value={quittance.totalTaxes} highlight />
                      <QuittanceRow label="Timbre de Dimension" value={quittance.timbreDimension} />
                      <QuittanceRow label="Timbre Gradué"       value={quittance.timbreGradue} />
                    </div>

                    {/* TOTAL */}
                    <div className="border-t-2 border-blue-500 pt-5">
                      <QuittanceRow label="TOTAL À PAYER (TTC)" value={quittance.totalAPayer} large />
                    </div>
                  </div>

                  {/* Commissions + Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
                      <h3 className="font-bold text-amber-800 mb-4 text-sm">COMMISSIONS</h3>
                      <QuittanceRow label="Apport (12%)" value={quittance.apport} dark />
                      <QuittanceRow label="Gestion"      value={quittance.gestion} dark />
                      <div className="border-t border-amber-300 pt-3 mt-3">
                        <QuittanceRow label="Total Comm." value={quittance.totalCommissions} dark highlight />
                      </div>
                    </div>

                    <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                      <h3 className="font-bold text-green-800 mb-4 text-sm">COMPTABILISATION</h3>
                      <div className="space-y-3">
                        <InputField label="Emission : Pièce N°"  value="" readOnly />
                        <InputField label="Annulation : Pièce N°" value="" readOnly />
                      </div>
                      <div className="mt-6 flex gap-3">
                        <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-blue-700 transition">Imprimer</button>
                        <button className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-green-700 transition">Encaissements</button>
                      </div>
                      <div className="mt-3 flex gap-3">
                        <button className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-red-700 transition">Annulation</button>
                        <button className="flex-1 bg-slate-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-slate-700 transition">REC</button>
                        <button className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-purple-700 transition">Sinistres</button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Créée par"   value="ADMIN" readOnly />
                      <InputField label="Annulée par" value=""      readOnly />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ÉTAPE 2 ── */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8">
              <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-blue-200 shadow-lg">
                <h3 className="font-bold text-blue-900 text-lg mb-6 border-b-2 border-blue-300 pb-3">PROFIL DU CONDUCTEUR</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">Sexe du Conducteur</label>
                    <div className="flex gap-4">
                      {["H","F"].map(s => (
                        <button key={s} onClick={() => setFormData({...formData, sexe:s})}
                          className={`flex-1 py-6 rounded-2xl font-bold text-sm transition-all shadow-md ${
                            formData.sexe === s
                              ? 'bg-blue-600 text-white scale-105 shadow-xl'
                              : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-blue-400'
                          }`}>
                          {s === 'H' ? '👨 HOMME' : '👩 FEMME'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <InputField label="Âge du Conducteur" name="age" value={formData.age} type="number" onChange={handleUpdate} />
                </div>
                <div className="mt-6">
                  <InputField label="Date d'obtention du Permis" name="datePermis" value={formData.datePermis} type="date" onChange={handleUpdate} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-amber-50 rounded-xl border-2 border-amber-200">
                  <h3 className="font-bold text-amber-800 mb-4">COEFFICIENTS APPLIQUÉS</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      ["Zone Tarifaire", refZones.find(z=>z.id===formData.zone)?.coef || 1.0],
                      ["Âge Conducteur", parseInt(formData.age)<25?'1.5':parseInt(formData.age)>60?'0.9':'1.0'],
                      ["Sexe",           formData.sexe==='F'?'0.95':'1.05'],
                      ["Réduction",      refReductions.find(r=>r.id===formData.reduction)?.value || 0]
                    ].map(([lbl,val]) => (
                      <div key={lbl} className="flex justify-between py-2 border-b border-amber-200">
                        <span className="text-slate-700">{lbl}:</span>
                        <span className="font-mono font-bold text-amber-900">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
                  <h3 className="font-bold text-green-800 mb-4">INFORMATIONS COMPLÉMENTAIRES</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      ["Genre Véhicule", formData.genreVehicule],
                      ["Zone",           `${formData.zone} - ${refZones.find(z=>z.id===formData.zone)?.label}`],
                      ["Wilaya",         formData.wilaya],
                      ["Usage",          formData.usage]
                    ].map(([lbl,val]) => (
                      <div key={lbl} className="flex justify-between py-2 border-b border-green-200">
                        <span className="text-slate-700">{lbl}:</span>
                        <span className="font-bold text-green-900">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 ── */}
          {step === 3 && (
            <div className="space-y-6 animate-in zoom-in">
              <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-8 text-white shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 border-b-2 border-blue-500 pb-4">📋 RÉCAPITULATIF DES GARANTIES SOUSCRITES</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(formData.garanties).map(([key, value]) => {
                    const labels = { rc:'RC - Responsabilité Civile', dr:'DR - Défense et Recours', bdg:'BDG - Bris de Glace', vol:'VOL - Vol du Véhicule', inc:'INC - Incendie', dc:'DC - Dommages Collision', pt:'PT - Personnes Transportées', ir:'IR - Individuelle Conducteur', tc:'TC - Tous Chocs' };
                    return value && (
                      <div key={key} className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-lg backdrop-blur-sm border border-white/20">
                        <div className="bg-green-500 rounded-full p-1">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-semibold text-sm">{labels[key]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 4 ── */}
          {step === 4 && (
            <div className="animate-in fade-in space-y-8">
              <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-12 text-white relative shadow-2xl border-b-8 border-blue-500 overflow-hidden">
                <div className="absolute top-[-80px] right-[-80px] text-[25rem] font-black opacity-5 select-none">SAA</div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                  <div className="w-full md:w-1/2 space-y-3">
                    <h3 className="text-blue-300 font-bold uppercase tracking-widest border-b-2 border-slate-700 pb-4 text-lg mb-4">Décomposition de la Quittance</h3>
                    <PriceRow label="Prime de Base"             value={quittance.primeBase} light />
                    <PriceRow label="+ Options"                 value={quittance.totalOptions} light />
                    <PriceRow label="− Réduction"               value={quittance.montantReduction} light />
                    <PriceRow label="+ Majorations"             value={quittance.totalMajorations} light />
                    <PriceRow label="Prime Nette"               value={quittance.primeNette} light />
                    <PriceRow label="Accessoires (Auto-radio)"  value={quittance.accessoires} light />
                    <PriceRow label="Taxes / Prime (19%)"       value={quittance.taxesPrime} light />
                    <PriceRow label="Taxes / Accessoires (19%)" value={quittance.taxeAccessoires} light />
                    <PriceRow label="Total Taxes"               value={quittance.totalTaxes} light />
                    <PriceRow label="Timbre de Dimension"       value={quittance.timbreDimension} light />
                    <PriceRow label="Timbre Gradué"             value={quittance.timbreGradue} light />
                    <div className="flex flex-wrap gap-2 pt-4">
                      {[formData.wilaya, `Zone ${formData.zone}`, formData.genreVehicule, formData.fractionnement].map(t => (
                        <span key={t} className="text-xs font-bold uppercase px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-center bg-white/5 p-12 rounded-3xl border-2 border-white/20 backdrop-blur-md shadow-2xl">
                    <p className="text-blue-300 font-bold uppercase tracking-[0.3em] mb-4 text-xs">Net à Payer (TTC)</p>
                    <div className="text-8xl font-black tracking-tighter leading-none mb-4 bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                      {quittance.totalAPayer}
                    </div>
                    <p className="text-2xl font-bold text-slate-400">DINARS ALGÉRIENS</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-blue-50 rounded-2xl border-2 border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-4 text-lg">📊 DÉTAILS DU DOSSIER</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      ["N° Police",        formData.numPolice],
                      ["Assuré",           formData.nomAssure || "Non renseigné"],
                      ["Véhicule",         `${formData.marque||"N/A"} - ${formData.immatriculation||"N/A"}`],
                      ["Date Effet",       formData.dateEffet],
                      ["Fractionnement",   formData.fractionnement]
                    ].map(([lbl,val]) => (
                      <div key={lbl} className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">{lbl}:</span>
                        <span className="font-bold text-slate-800">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-8 bg-green-50 rounded-2xl border-2 border-green-200">
                  <h3 className="font-bold text-green-900 mb-4 text-lg">💰 COMMISSIONS</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      ["Apport (12%)", `${quittance.apport} DZD`,        false],
                      ["Gestion",      `${quittance.gestion} DZD`,        false],
                      ["Total Commissions", `${quittance.totalCommissions} DZD`, true]
                    ].map(([lbl,val,hl]) => (
                      <div key={lbl} className={`flex justify-between items-center py-2 border-b border-green-200 ${hl?'border-t-2 border-green-300 pt-3 mt-3':''}`}>
                        <span className="text-slate-600 font-semibold">{lbl}:</span>
                        <span className={`font-bold ${hl?'text-green-700 text-lg':'text-slate-800'}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION */}
          <div className="mt-12 flex justify-between items-center border-t-2 border-slate-200 pt-8">
            <button onClick={() => step > 1 ? setStep(step-1) : onGoHome()}
              className="px-8 py-4 text-slate-500 hover:text-red-600 font-bold uppercase text-xs tracking-wider transition-all hover:bg-red-50 rounded-lg">
              {step === 1 ? "❌ ANNULER" : "⬅️ PRÉCÉDENT"}
            </button>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-2">Étape {step} sur 4</p>
              <div className="flex gap-2">
                {[1,2,3,4].map(s => (
                  <div key={s} className={`h-2 w-12 rounded-full transition-all ${s===step?'bg-blue-600 scale-110':s<step?'bg-green-500':'bg-slate-300'}`} />
                ))}
              </div>
            </div>
            <button onClick={() => step < 4 ? setStep(step+1) : handleSave()}
              className="group relative bg-blue-600 text-white px-12 py-4 rounded-xl font-bold uppercase text-xs tracking-wider overflow-hidden hover:bg-blue-700 transition-all shadow-lg active:scale-95">
              <span className="relative z-10">{step === 4 ? "✅ ÉMETTRE LA POLICE" : "SUIVANT ➡️"}</span>
            </button>
          </div>
        </div>
      </div>
      <p className="text-center mt-8 text-xs font-semibold text-slate-400 uppercase tracking-wider opacity-60">
        SAA ORASS Suite © 2026 • Développé par la Direction des Systèmes d'Information
      </p>
    </div>
  );
};

// ── SOUS-COMPOSANTS ──────────────────────────────────────────────────────────

const InputField = ({ label, name, value, onChange, type="text", placeholder, readOnly }) => (
  <div className="flex flex-col group">
    <label className="text-xs font-bold text-slate-600 uppercase mb-2 tracking-wide">{label}</label>
    <input type={type} name={name} value={value||""} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      className={`p-3 bg-white border-2 border-slate-200 rounded-lg font-semibold text-sm outline-none focus:border-blue-500 focus:shadow-md transition-all ${readOnly?'bg-slate-50 cursor-not-allowed':''}`} />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, isObj }) => (
  <div className="flex flex-col group">
    <label className="text-xs font-bold text-slate-600 uppercase mb-2 tracking-wide">{label}</label>
    <select name={name} value={value||""} onChange={onChange}
      className="p-3 bg-white border-2 border-slate-200 rounded-lg font-semibold text-sm outline-none focus:border-blue-500 cursor-pointer transition-all">
      {options.map(o => (
        <option key={isObj?o.id:o} value={isObj?o.id:o}>{isObj?o.label:o}</option>
      ))}
    </select>
  </div>
);

const GarantieCheckbox = ({ label, name, checked, onChange, required, capital }) => (
  <div className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${checked?'bg-blue-50 border-blue-400 shadow-md':'bg-white border-slate-200 hover:border-slate-300'}`}>
    <div className="flex items-center gap-3">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} disabled={required} className="w-5 h-5 text-blue-600 rounded" />
      <div>
        <h4 className={`text-sm font-bold ${checked?'text-blue-800':'text-slate-700'}`}>{label}</h4>
        {required && <span className="text-xs text-red-600 font-semibold">OBLIGATOIRE</span>}
      </div>
    </div>
    <div className="text-right">
      <p className="text-xs font-bold text-slate-600">{capital}</p>
    </div>
  </div>
);

const QuittanceRow = ({ label, value, dark, large, highlight }) => (
  <div className={`flex justify-between items-center py-3 border-b ${dark?'border-amber-200':'border-slate-700'}`}>
    <span className={`text-xs font-bold uppercase ${dark?'text-amber-800':'text-slate-400'} ${highlight&&!dark?'text-blue-300':''} ${highlight&&dark?'text-lg':''}`}>
      {label}
    </span>
    <span className={`font-mono font-black ${large?'text-3xl':'text-base'} ${dark?'text-amber-900':'text-white'} ${highlight&&!dark?'text-blue-300':''}`}>
      {value} DZD
    </span>
  </div>
);

const PriceRow = ({ label, value, light }) => (
  <div className={`flex justify-between items-center py-2 border-b ${light?'border-slate-700':'border-slate-200'}`}>
    <span className={`text-xs font-bold uppercase ${light?'text-slate-400':'text-slate-600'}`}>{label}</span>
    <span className={`font-mono font-black ${light?'text-white':'text-slate-800'}`}>{value} DZD</span>
  </div>
);

export default SAA_ORASS_PRODUCTION_COMPLETE;
