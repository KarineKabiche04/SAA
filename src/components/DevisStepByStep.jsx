import React, { useState } from 'react';

const DevisStepByStep = ({ onGoHome, onComplete }) => {
  const [step, setStep] = useState(1);
  
  const wilayas = [
    "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna", "06 - Béjaïa", "07 - Biskra", "08 - Béchar", "09 - Blida", "10 - Bouira",
    "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda",
    "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine", "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla",
    "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arreridj", "35 - Boumerdès", "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
    "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma", "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - El M'Ghair", "50 - El Meniaa",
    "51 - Ouled Djellal", "52 - Bordj Baji Mokhtar", "53 - Béni Abbès", "54 - Timimoun", "55 - Touggourt", "56 - Djanet", "57 - In Salah", "58 - In Guezzam"
  ];

  const conventions = ["INDIVIDUELLE", "SALARIE SAA", "CONVENTION ETAT", "FLOTTE"];
  const sousConventions = ["PARTICULIER", "PROFESSIONNEL", "RETRAITE", "SOCIETE"];
  
  // LISTE COMPLÈTE DES CATÉGORIES (Standard Algérien)
  const categoriesPermis = [
    { code: "A1", label: "A1 - Moto < 125cm³" },
    { code: "A2", label: "A2 - Moto > 125cm³" },
    { code: "B", label: "B - Véhicule Léger" },
    { code: "C1", label: "C1 - Poids Lourd (Petit)" },
    { code: "C2", label: "C2 - Poids Lourd (Grand)" },
    { code: "D", label: "D - Transport Personnes" },
    { code: "E", label: "E - Remorque" },
    { code: "F", label: "F - Handicape" }
  ];

  const [formData, setFormData] = useState({
    convention: 'INDIVIDUELLE',
    sousConvention: 'PARTICULIER',
    bonusMalus: '1.00',
    nomAssure: '',
    wilaya: '16',
    marque: '',
    immatriculation: '',
    numChassis: '',
    energie: 'ESSENCE',
    puissanceFiscale: '',
    numPermis: '',
    datePermis: '',
    categoriePermis: 'B',
    valeurVenale: '',
    garanties: { rc: true, brisGlace: false, vol: false, tousRisques: false }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleGarantie = (key) => {
    setFormData(prev => ({
      ...prev,
      garanties: { ...prev.garanties, [key]: !prev.garanties[key] }
    }));
  };

  // LIBERTÉ TOTALE : On passe les étapes sans vérification pour la démo
  const handleNext = () => {
    if (step === 4) {
      onComplete(); 
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center p-4 md:p-8 font-sans">
      
      {/* BARRE DE RETOUR */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={onGoHome} className="flex items-center gap-2 text-slate-500 hover:text-orange-500 font-black text-[10px] uppercase tracking-widest transition-all">
          <span>←</span> Annuler
        </button>
        <div className="bg-white px-4 py-1 rounded-full shadow-sm border border-slate-200 font-black text-[9px] text-slate-400 uppercase tracking-tighter">
          Module SAA-Auto v2.0
        </div>
      </div>

      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        
        {/* HEADER TECHNIQUE */}
        <div className="bg-[#0f172a] p-8 border-b-4 border-[#e89d1b] relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-[#e89d1b] p-3 rounded-xl font-black text-white italic text-xl">SAA</div>
              <div>
                <h1 className="text-white font-black uppercase tracking-[0.2em] text-sm">Système de Tarification</h1>
                <p className="text-orange-400 text-[9px] font-black uppercase tracking-widest italic">Étape {step} / 4</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${s <= step ? 'bg-[#e89d1b]' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-14">
          
          {/* STEP 1 : CONVENTION & IDENTITÉ */}
          {step === 1 && (
            <div className="animate-fade-in space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Convention</label>
                  <select name="convention" value={formData.convention} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:border-orange-400 outline-none">
                    {conventions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Type Client</label>
                  <select name="sousConvention" value={formData.sousConvention} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:border-orange-400 outline-none">
                    {sousConventions.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#e89d1b] uppercase block mb-2 tracking-widest">Bonus CRM</label>
                  <input name="bonusMalus" value={formData.bonusMalus} readOnly className="w-full p-4 bg-orange-50 border border-orange-100 rounded-xl font-black text-orange-600 text-sm" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Détails de l'Assuré</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input name="nomAssure" value={formData.nomAssure} placeholder="NOM ET PRÉNOM COMPLET" onChange={handleChange} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase focus:border-orange-400 outline-none transition-all" />
                    <select name="wilaya" onChange={handleChange} value={formData.wilaya} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                        {wilayas.map(w => <option key={w} value={w.split(' ')[0]}>{w}</option>)}
                    </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 : VÉHICULE */}
          {step === 2 && (
            <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Marque & Modèle</label>
                  <input name="marque" value={formData.marque} onChange={handleChange} placeholder="EX: VOLKSWAGEN GOLF 8" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black focus:border-orange-400 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">N° Immatriculation</label>
                  <input name="immatriculation" value={formData.immatriculation} onChange={handleChange} placeholder="00123-122-16" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-center focus:border-orange-400 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">N° de Châssis</label>
                  <input name="numChassis" value={formData.numChassis} onChange={handleChange} placeholder="WVGZZZ123..." className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm focus:border-orange-400 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Énergie</label>
                  <select name="energie" onChange={handleChange} value={formData.energie} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none">
                    <option>ESSENCE</option><option>DIESEL</option><option>GPL / ÉLECTRIQUE</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Puissance Fiscale</label>
                  <input name="puissanceFiscale" type="number" value={formData.puissanceFiscale} onChange={handleChange} placeholder="6 CV" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black focus:border-orange-400 outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 : PERMIS (LISTE COMPLÈTE) */}
          {step === 3 && (
            <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Catégorie Permis (ORASS)</label>
                  <select name="categoriePermis" value={formData.categoriePermis} onChange={handleChange} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:border-orange-400">
                    {categoriesPermis.map(cat => (
                        <option key={cat.code} value={cat.code}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">N° de Permis</label>
                  <input name="numPermis" value={formData.numPermis} onChange={handleChange} placeholder="12/12345" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-orange-400" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Date d'obtention initiale</label>
                  <input name="datePermis" type="date" value={formData.datePermis} onChange={handleChange} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 : GARANTIES */}
          {step === 4 && (
            <div className="animate-fade-in space-y-10">
              <div className="bg-[#0f172a] p-12 rounded-[3.5rem] text-center shadow-2xl relative border-b-8 border-orange-500">
                <label className="text-orange-400 font-black text-[11px] uppercase tracking-[0.4em] mb-4 block italic">Valeur Vénale à Dire d'Expert</label>
                <div className="flex items-center justify-center gap-4">
                    <input name="valeurVenale" value={formData.valeurVenale} onChange={handleChange} placeholder="0.00" type="number" className="bg-transparent text-white text-6xl font-black text-center outline-none w-1/2 border-b-2 border-slate-800 focus:border-orange-500 pb-2" />
                    <span className="text-2xl font-black text-slate-700 italic">DZD</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'rc', label: 'Resp. Civile', desc: 'Garantie de base légale', fixed: true },
                  { id: 'brisGlace', label: 'Bris de Glace', desc: 'Protection optiques et vitres' },
                  { id: 'vol', label: 'Vol & Incendie', desc: 'Indemnisation valeur vénale' },
                  { id: 'tousRisques', label: 'Dommages Collision', desc: 'Protection "Tous Risques"' }
                ].map((g) => (
                  <button key={g.id} type="button" disabled={g.fixed} onClick={() => toggleGarantie(g.id)} className={`p-6 border-2 rounded-[1.8rem] flex justify-between items-center transition-all ${formData.garanties[g.id] ? 'border-orange-400 bg-orange-50/50' : 'border-slate-100 hover:border-slate-300'} ${g.fixed ? 'opacity-50' : ''}`}>
                    <div className="text-left">
                      <h4 className="font-black text-xs uppercase text-slate-800">{g.label}</h4>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{g.desc}</p>
                    </div>
                    <div className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center transition-all ${formData.garanties[g.id] ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'border-slate-200 text-transparent'}`}>✓</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTIONS DE NAVIGATION */}
          <div className="mt-16 flex flex-col md:flex-row gap-6">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="px-10 py-6 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all">
                Étape Précédente
              </button>
            )}
            <button 
              type="button" 
              onClick={handleNext}
              className="flex-1 bg-[#e89d1b] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] shadow-xl shadow-orange-100 hover:bg-orange-600 hover:-translate-y-1 transition-all active:scale-95"
            >
              {step === 4 ? "Finaliser mon dossier →" : "Étape Suivante"}
            </button>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 font-bold text-[8px] uppercase tracking-[0.5em]">Société Nationale d'Assurance - Algérie</p>
    </div>
  );
};

export default DevisStepByStep;