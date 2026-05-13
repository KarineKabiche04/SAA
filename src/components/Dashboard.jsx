import React, { useState, useEffect } from "react";

/* ─── RÉFÉRENTIELS TARIFICATION ──────────────────────────────────────────── */
const REF_GENRES = [
  { id:"VP", label:"VP – Voiture Particulière", base:12500 },
  { id:"VU", label:"VU – Véhicule Utilitaire",  base:19000 },
  { id:"MOTO", label:"Moto – Deux Roues",        base:8500  },
  { id:"TC", label:"TC – Transport en Commun",   base:28000 }
];
const REF_ZONES = [
  { id:"01", label:"Zone 01 – Nord",  coef:1.00 },
  { id:"02", label:"Zone 02 – Est",   coef:0.95 },
  { id:"03", label:"Zone 03 – Ouest", coef:0.95 },
  { id:"04", label:"Zone 04 – Sud",   coef:0.80 }
];
const REF_REDUCTIONS = [
  { id:"AUCUNE",      label:"Aucune",              value:0    },
  { id:"FLOTTE",      label:"Flotte –10%",         value:0.10 },
  { id:"MULTIRISQUE", label:"Multi-risque –5%",    value:0.05 },
  { id:"ANCIENNETE",  label:"Ancienneté –15%",     value:0.15 }
];
const GARANTIES_DEF = [
  { key:"rc",  label:"RC – Responsabilité Civile",   req:true,  base:0 },
  { key:"dr",  label:"DR – Défense et Recours",      req:true,  base:0 },
  { key:"bdg", label:"BDG – Bris de Glace",          req:false, base:4500 },
  { key:"vol", label:"VOL – Vol du Véhicule",        req:false, base:"0.007v" },
  { key:"inc", label:"INC – Incendie",               req:false, base:"0.003v" },
  { key:"dc",  label:"DC – Dommages Collision",      req:false, base:"0.018v" },
  { key:"pt",  label:"PT – Personnes Transportées",  req:false, base:1250 },
  { key:"ir",  label:"IR – Individuelle Conducteur", req:false, base:2800 },
  { key:"tc",  label:"TC – Tous Chocs",              req:false, base:3500 }
];

/* ─── MOTEUR TARIFAIRE ───────────────────────────────────────────────────── */
function calculerPrime(f) {
  const genre = REF_GENRES.find(g => g.id === f.genre) || REF_GENRES[0];
  const zone  = REF_ZONES.find(z => z.id === f.zone)   || REF_ZONES[0];
  const age   = parseInt(f.age) || 35;
  const coefAge  = age < 25 ? 1.5 : age > 60 ? 0.9 : 1.0;
  const coefSexe = f.sexe === "F" ? 0.95 : 1.05;
  const valV  = parseFloat(f.valeurVenale)   || 0;
  const valR  = parseFloat(f.valeurAutoRadio) || 0;
  const primeBase = genre.base * zone.coef * coefAge * coefSexe;
  let options = 0;
  const g = f.garanties;
  if (g.bdg) options += 4500;
  if (g.vol) options += valV * 0.007;
  if (g.inc) options += valV * 0.003;
  if (g.dc)  options += valV * 0.018;
  if (g.pt)  options += 1250;
  if (g.ir)  options += 2800;
  if (g.tc)  options += 3500;
  const acc       = valR * 0.025;
  const pAvantRed = primeBase + options;
  const taux      = REF_REDUCTIONS.find(r => r.id === f.reduction)?.value || 0;
  const reduction = pAvantRed * taux;
  const pApresRed = pAvantRed - reduction;
  const majs      = (parseFloat(f.majPermis)||0) + (parseFloat(f.majAge)||0) + (parseFloat(f.majMatieres)||0);
  const pNette    = pApresRed + majs;
  const taxes     = (pNette + acc) * 0.19;
  const timbre    = 150 + (parseInt(f.nombreDimension)||1) * 50;
  const total     = pNette + acc + taxes + timbre;
  const apport    = pNette * 0.12;
  return {
    primeBase: +primeBase.toFixed(2), options: +options.toFixed(2),
    pAvantRed: +pAvantRed.toFixed(2), reduction: +reduction.toFixed(2),
    pApresRed: +pApresRed.toFixed(2), majs: +majs.toFixed(2),
    pNette: +pNette.toFixed(2), acc: +acc.toFixed(2),
    taxes: +taxes.toFixed(2), timbre: +timbre.toFixed(2),
    total: +total.toFixed(2), apport: +apport.toFixed(2),
    gestion: 850, totalComm: +(apport + 850).toFixed(2)
  };
}

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
const fmt = n => Number(n).toLocaleString("fr-DZ", { minimumFractionDigits:2, maximumFractionDigits:2 });

function getStatutPolice(echeance) {
  if (!echeance || echeance === "—") return "INCONNU";
  const parts = echeance.split("/");
  if (parts.length !== 3) return "INCONNU";
  const [d, m, y] = parts;
  const date = new Date(`${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`);
  if (isNaN(date)) return "INCONNU";
  const diffDays = Math.floor((date - new Date()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)   return "EXPIRÉE";
  if (diffDays <= 30) return "EXPIRE BIENTÔT";
  return "EN COURS";
}

function getMontantRestant(prime, echeance) {
  if (!prime || !echeance || echeance === "—") return prime || 0;
  const parts = echeance.split("/");
  if (parts.length !== 3) return prime;
  const [d, m, y] = parts;
  const dateEch = new Date(`${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`);
  if (isNaN(dateEch)) return prime;
  const remainDays = Math.max(0, Math.floor((dateEch - new Date()) / (1000 * 60 * 60 * 24)));
  return +((prime / 365) * remainDays).toFixed(2);
}

/* ─── BADGE ──────────────────────────────────────────────────────────────── */
const Badge = ({ children, color="slate" }) => {
  const colors = {
    green:  "bg-emerald-100 text-emerald-800",
    red:    "bg-red-100 text-red-700",
    amber:  "bg-amber-100 text-amber-800",
    blue:   "bg-blue-100 text-blue-800",
    slate:  "bg-slate-100 text-slate-600",
    orange: "bg-orange-100 text-orange-700",
  };
  return <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${colors[color]||colors.slate}`}>{children}</span>;
};

/* ─── MODAL PAIEMENT ─────────────────────────────────────────────────────── */
const ModalPaiement = ({ police, onClose }) => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [done, setDone] = useState(false);
  const montant = getMontantRestant(police.prime, police.echeance);

  const handlePay = () => {
    setDone(true);
    setTimeout(() => onClose(), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-slate-900 px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-white font-black text-sm uppercase tracking-wider">Paiement en ligne</p>
            <p className="text-orange-400 text-[9px] font-bold uppercase tracking-widest">Police {police.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-400 font-black text-xs uppercase px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">✕</button>
        </div>
        {done ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">✅</div>
            <p className="font-black text-emerald-700 text-lg uppercase">Paiement confirmé !</p>
            <p className="text-slate-400 text-sm mt-2">{fmt(montant)} DZD débité avec succès</p>
          </div>
        ) : (
          <div className="p-8 space-y-6">
            <div className="bg-slate-900 rounded-2xl p-5 text-center border-b-4 border-orange-500">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Montant restant à payer</p>
              <p className="text-white text-4xl font-black tabular-nums">{fmt(montant)}</p>
              <p className="text-slate-400 text-xs font-bold mt-1">DINARS ALGÉRIENS</p>
            </div>
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Choisir un mode de paiement</p>
                {[
                  { id:"cib",      icon:"💳", label:"Carte CIB / Edahabia" },
                  { id:"virement", icon:"🏦", label:"Virement Bancaire" },
                  { id:"cheque",   icon:"📄", label:"Chèque" },
                ].map(m => (
                  <button key={m.id} onClick={() => { setMethod(m.id); setStep(2); }}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-slate-200 hover:border-orange-400 hover:bg-orange-50 transition-all text-left">
                    <span className="text-2xl">{m.icon}</span>
                    <span className="font-black text-sm text-slate-800 uppercase tracking-wide">{m.label}</span>
                    <span className="ml-auto text-slate-400">→</span>
                  </button>
                ))}
              </div>
            )}
            {step === 2 && method === "cib" && (
              <div className="space-y-4">
                <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-700">← Retour</button>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Numéro de carte</label>
                  <input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,'').slice(0,16))}
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-800 outline-none focus:border-orange-400 transition-all tracking-widest" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Expiration</label>
                    <input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/AA"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-800 outline-none focus:border-orange-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">CVV</label>
                    <input value={cvv} onChange={e => setCvv(e.target.value.slice(0,3))} placeholder="•••" type="password"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-800 outline-none focus:border-orange-400 transition-all" />
                  </div>
                </div>
                <button onClick={handlePay}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg shadow-orange-200">
                  💳 Payer {fmt(montant)} DZD
                </button>
              </div>
            )}
            {step === 2 && (method === "virement" || method === "cheque") && (
              <div className="space-y-4">
                <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-700">← Retour</button>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Coordonnées bancaires SAA</p>
                  <div><p className="text-[9px] text-slate-400 font-bold uppercase">Banque</p><p className="font-black text-slate-800">BNA — Banque Nationale d'Algérie</p></div>
                  <div><p className="text-[9px] text-slate-400 font-bold uppercase">RIB</p><p className="font-black text-slate-800 font-mono tracking-widest">00200150 00000123456 78</p></div>
                  <div><p className="text-[9px] text-slate-400 font-bold uppercase">Référence</p><p className="font-black text-orange-500">{police.id}</p></div>
                </div>
                <p className="text-[10px] text-slate-400 font-bold text-center">
                  Veuillez indiquer la référence police dans le libellé du {method === "virement" ? "virement" : "chèque"}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── MODAL CHANGEMENT VÉHICULE ──────────────────────────────────────────── */
const ModalChangementVehicule = ({ police, onClose, onConfirm }) => {
  const [form, setForm] = useState({
    marque:"", immatriculation:"", dateMEC:"", energie:"ESSENCE",
    chassis:"", puissance:"", places:"5", valeurVenale:"", valeurANeuf:"", valeurAutoRadio:"0"
  });
  const upd = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-slate-900 px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-white font-black text-sm uppercase tracking-wider">🚗 Changement de Véhicule</p>
            <p className="text-orange-400 text-[9px] font-bold uppercase tracking-widest">Police {police.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-400 font-black text-xs uppercase px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">✕</button>
        </div>
        <div className="p-8 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">⚠ Attention</p>
            <p className="text-xs font-bold text-amber-600 mt-1">Le changement de véhicule entraîne un avenant à votre police. Un agent SAA vous contactera pour valider la modification.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label:"Marque", name:"marque", placeholder:"ex: TOYOTA" },
              { label:"Immatriculation", name:"immatriculation", placeholder:"ex: 123456-16-25" },
              { label:"N° Châssis", name:"chassis", placeholder:"ex: VF3..." },
              { label:"Puissance (CV)", name:"puissance", placeholder:"ex: 75" },
              { label:"Valeur Vénale (DZD)", name:"valeurVenale", placeholder:"ex: 2500000" },
              { label:"Valeur à Neuf (DZD)", name:"valeurANeuf", placeholder:"ex: 3500000" },
            ].map(f => (
              <div key={f.name}>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">{f.label}</label>
                <input name={f.name} value={form[f.name]} onChange={upd} placeholder={f.placeholder}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-orange-400 transition-all" />
              </div>
            ))}
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">M.E.C le</label>
              <input type="date" name="dateMEC" value={form.dateMEC} onChange={upd}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-orange-400 transition-all" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Énergie</label>
              <select name="energie" value={form.energie} onChange={upd}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-orange-400 transition-all">
                {["ESSENCE","DIESEL","GPL","ÉLECTRIQUE"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => { onConfirm(form); onClose(); }}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg shadow-orange-200">
            📤 Soumettre la demande de changement
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── MODAL MESSAGERIE ───────────────────────────────────────────────────── */
const ModalMessagerie = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id:1, from:"agent", text:"Bonjour, comment puis-je vous aider ?", date:"10/05/2026 09:14" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const txt = input.trim();
    setMessages(p => [...p, { id:Date.now(), from:"client", text:txt, date:new Date().toLocaleString("fr-DZ") }]);
    setInput("");
    setTimeout(() => {
      setMessages(p => [...p, {
        id: Date.now()+1, from:"agent",
        text: "Votre message a bien été reçu. Un conseiller SAA vous répondra dans les plus brefs délais.",
        date: new Date().toLocaleString("fr-DZ")
      }]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col" style={{maxHeight:"85vh"}}>
        <div className="bg-slate-900 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-sm">S</div>
            <div>
              <p className="text-white font-black text-sm">SAA — Support Client</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-emerald-400 text-[9px] font-bold">En ligne</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-400 font-black text-xs uppercase px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.from==="client"?"justify-end":"justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.from==="client" ? "bg-orange-500 text-white rounded-tr-sm" : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
              }`}>
                <p className="text-sm font-semibold leading-relaxed">{msg.text}</p>
                <p className={`text-[9px] font-bold mt-1 ${msg.from==="client"?"text-orange-200":"text-slate-400"}`}>{msg.date}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send()}
            placeholder="Votre message..."
            className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-orange-400 transition-all" />
          <button onClick={send}
            className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black transition-all active:scale-95">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── MODAL RENOUVELLEMENT ───────────────────────────────────────────────── */
const ModalRenouveler = ({ police, onClose, onSuccess }) => {
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() + 1);
  const [dateEcheance, setDateEcheance] = useState(defaultDate.toISOString().split('T')[0]);
  const [prime, setPrime] = useState(police.prime);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/vehicules/${police.id}/renouveler`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ dateEcheance, prime })
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Erreur lors du renouvellement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 text-lg">🔄</div>
          <div>
            <h2 className="text-lg font-black uppercase text-slate-900">Renouveler la police</h2>
            <p className="text-slate-500 text-xs">{police.marque} — {police.immat}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Nouvelle date d'échéance</label>
            <input type="date" value={dateEcheance} onChange={e => setDateEcheance(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-orange-400 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Nouvelle prime (DZD)</label>
            <input type="number" value={prime} onChange={e => setPrime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-orange-400 transition-all" />
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 mt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Garanties conservées</p>
          <div className="flex flex-wrap gap-1">
            {police.garanties.map(g => (
              <span key={g} className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">{g}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-3 border-2 border-slate-200 rounded-xl font-black text-xs uppercase text-slate-600 hover:border-slate-400 transition-all">
            Annuler
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase transition-all">
            {loading ? 'En cours...' : '✅ Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── SOUS-COMPOSANTS MODAL DEVIS ────────────────────────────────────────── */
const SectionBox = ({ title, children }) => (
  <div className="border border-slate-200 rounded-2xl overflow-hidden">
    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{title}</p>
    </div>
    <div className="p-4">{children}</div>
  </div>
);
const ModalInput = ({ label, name, value, onChange, type="text", placeholder="" }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    <input type={type} name={name} value={value||""} onChange={onChange} placeholder={placeholder}
      className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
  </div>
);
const ModalSelect = ({ label, name, value, onChange, options, labels }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    <select name={name} value={value||""} onChange={onChange}
      className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-orange-400 cursor-pointer transition-all">
      {options.map((o,i) => <option key={o} value={o}>{labels?labels[i]:o}</option>)}
    </select>
  </div>
);
const BigValInput = ({ label, name, value, onChange }) => (
  <div className="flex flex-col gap-1 bg-slate-50 rounded-xl p-3 border border-slate-200">
    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    <input type="number" name={name} value={value||""} onChange={onChange}
      className="bg-transparent text-xl font-black text-slate-900 outline-none border-b-2 border-slate-200 focus:border-orange-400 pb-1 transition-all w-full" />
  </div>
);
const CalcLine = ({ label, val, accent, neg, bold }) => (
  <div className={`flex justify-between items-center py-2 border-b border-slate-100 last:border-0 ${bold?"border-t-2 border-slate-200 mt-1 pt-3 last:border-0":""}`}>
    <span className={`text-[10px] uppercase font-bold ${bold?"text-slate-900":"text-slate-500"} ${accent?"text-blue-700":""}`}>{label}</span>
    <span className={`text-xs font-black tabular-nums ${bold?"text-slate-900":"text-slate-700"} ${neg?"text-red-500":""} ${accent?"text-blue-700":""}`}>
      {neg && val > 0 ? "−" : ""}{fmt(val)} DZD
    </span>
  </div>
);

/* ─── MODAL DEVIS ────────────────────────────────────────────────────────── */
const ModalDevis = ({ onClose, onEmit }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    dateEffet: new Date().toISOString().split("T")[0],
    duree:"12", fractionnement:"ANNUEL", nomAssure:"", qualite:"M.", typePiece:"CNI", numPiece:"",
    adresse:"", ville:"", profession:"EMPLOYÉ", telephone:"", email:"",
    sexe:"H", age:"30", datePermis:"", genre:"VP", marque:"", immatriculation:"", dateMEC:"",
    energie:"ESSENCE", chassis:"", puissance:"", cylindree:"", places:"5",
    zone:"01", usage:"USAGE PRIVÉ", valeurVenale:"1500000", valeurANeuf:"2500000", valeurAutoRadio:"0",
    capitalAssure:"2500000",
    garanties:{ rc:true, dr:true, bdg:false, vol:false, inc:false, dc:false, pt:false, ir:false, tc:false },
    majPermis:"0", majAge:"0", majMatieres:"0", nombreDimension:"1", reduction:"AUCUNE"
  });
  const calc = calculerPrime(form);
  const upd = (e) => {
    const { name, value, type, checked } = e.target;
    if (type==="checkbox") {
      if (name in form.garanties) setForm(p=>({...p,garanties:{...p.garanties,[name]:checked}}));
      else setForm(p=>({...p,[name]:checked}));
    } else setForm(p=>({...p,[name]:value}));
  };
  const STEPS = ["Police & Assuré","Véhicule & Conducteur","Garanties","Quittance"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col" style={{maxHeight:"92vh"}}>
        <div className="bg-slate-900 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 text-white font-black text-sm px-3 py-1 rounded-lg tracking-widest uppercase">SAA</div>
            <div>
              <p className="text-white font-black text-sm uppercase tracking-wider">ORASS® Suite — Nouveau Devis Auto</p>
              <p className="text-orange-400 text-[9px] font-bold uppercase tracking-widest">Module Production v4.5.2</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-400 font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/5 transition-all">ESC Annuler</button>
        </div>
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          {STEPS.map((s,i) => (
            <button key={i} onClick={() => i<step-1 && setStep(i+1)}
              className={`flex-1 py-3.5 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 ${step===i+1?"text-orange-600 border-orange-500 bg-white":i<step-1?"text-emerald-600 border-emerald-400 cursor-pointer hover:bg-white":"text-slate-400 border-transparent"}`}>
              <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full mr-1.5 text-[8px] ${step===i+1?"bg-orange-500 text-white":i<step-1?"bg-emerald-500 text-white":"bg-slate-200 text-slate-500"}`}>{i<step-1?"✓":i+1}</span>{s}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {step===1 && (
            <div className="space-y-6">
              <SectionBox title="Couverture">
                <div className="grid grid-cols-3 gap-4">
                  <ModalInput label="Date d'effet" name="dateEffet" value={form.dateEffet} onChange={upd} type="date" />
                  <ModalSelect label="Durée (mois)" name="duree" value={form.duree} onChange={upd} options={["1","3","6","12","24","36"]} />
                  <ModalSelect label="Fractionnement" name="fractionnement" value={form.fractionnement} onChange={upd} options={["ANNUEL","SEMESTRIEL","TRIMESTRIEL","MENSUEL"]} />
                </div>
              </SectionBox>
              <SectionBox title="Informations Assuré">
                <div className="grid grid-cols-4 gap-4">
                  <ModalSelect label="Qualité" name="qualite" value={form.qualite} onChange={upd} options={["M.","Mme","Mlle","Sté"]} />
                  <div className="col-span-3"><ModalInput label="Nom & Prénom complet" name="nomAssure" value={form.nomAssure} onChange={upd} placeholder="ex : BENALI KARIM" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <ModalSelect label="Type Pièce Identité" name="typePiece" value={form.typePiece} onChange={upd} options={["CNI","PASSEPORT","PERMIS"]} />
                  <ModalInput label="N° Pièce" name="numPiece" value={form.numPiece} onChange={upd} />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="col-span-2"><ModalInput label="Adresse" name="adresse" value={form.adresse} onChange={upd} /></div>
                  <ModalInput label="Ville" name="ville" value={form.ville} onChange={upd} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <ModalInput label="Téléphone" name="telephone" value={form.telephone} onChange={upd} type="tel" />
                  <ModalInput label="Email" name="email" value={form.email} onChange={upd} type="email" />
                </div>
              </SectionBox>
            </div>
          )}
          {step===2 && (
            <div className="space-y-6">
              <SectionBox title="Tarif & Zone">
                <div className="grid grid-cols-3 gap-4">
                  <ModalSelect label="Genre" name="genre" value={form.genre} onChange={upd} options={REF_GENRES.map(g=>g.id)} labels={REF_GENRES.map(g=>g.label)} />
                  <ModalSelect label="Zone Tarifaire" name="zone" value={form.zone} onChange={upd} options={REF_ZONES.map(z=>z.id)} labels={REF_ZONES.map(z=>z.label)} />
                  <ModalSelect label="Réduction" name="reduction" value={form.reduction} onChange={upd} options={REF_REDUCTIONS.map(r=>r.id)} labels={REF_REDUCTIONS.map(r=>r.label)} />
                </div>
              </SectionBox>
              <SectionBox title="Identification Véhicule">
                <div className="grid grid-cols-3 gap-4">
                  <ModalInput label="Marque" name="marque" value={form.marque} onChange={upd} />
                  <ModalInput label="Immatriculation" name="immatriculation" value={form.immatriculation} onChange={upd} />
                  <ModalInput label="M.E.C le" name="dateMEC" value={form.dateMEC} onChange={upd} type="date" />
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <ModalSelect label="Énergie" name="energie" value={form.energie} onChange={upd} options={["ESSENCE","DIESEL","GPL","ÉLECTRIQUE"]} />
                  <ModalInput label="N° Châssis" name="chassis" value={form.chassis} onChange={upd} />
                  <ModalInput label="Puissance" name="puissance" value={form.puissance} onChange={upd} />
                  <ModalInput label="Nb Places" name="places" value={form.places} onChange={upd} type="number" />
                </div>
              </SectionBox>
              <SectionBox title="Valeurs du Véhicule">
                <div className="grid grid-cols-3 gap-4">
                  <BigValInput label="Valeur Vénale (DZD)" name="valeurVenale" value={form.valeurVenale} onChange={upd} />
                  <BigValInput label="Valeur à Neuf (DZD)" name="valeurANeuf" value={form.valeurANeuf} onChange={upd} />
                  <BigValInput label="Valeur Auto-Radio (DZD)" name="valeurAutoRadio" value={form.valeurAutoRadio} onChange={upd} />
                </div>
              </SectionBox>
              <SectionBox title="Profil Conducteur Principal">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Sexe</p>
                    <div className="flex gap-2">
                      {["H","F"].map(s=>(
                        <button key={s} onClick={()=>setForm(p=>({...p,sexe:s}))}
                          className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase transition-all border-2 ${form.sexe===s?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                          {s==="H"?"Homme":"Femme"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ModalInput label="Âge conducteur" name="age" value={form.age} onChange={upd} type="number" />
                  <ModalInput label="Date permis" name="datePermis" value={form.datePermis} onChange={upd} type="date" />
                </div>
              </SectionBox>
            </div>
          )}
          {step===3 && (
            <div className="space-y-4">
              <SectionBox title="Sélection des Garanties">
                <div className="grid grid-cols-2 gap-3">
                  {GARANTIES_DEF.map(g=>{
                    const checked=form.garanties[g.key];
                    const valV=parseFloat(form.valeurVenale)||0;
                    const primeG=typeof g.base==="number"?g.base:g.base.includes("v")?valV*parseFloat(g.base):0;
                    return (
                      <label key={g.key} className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${checked?"bg-slate-900 border-slate-900 text-white":"bg-white border-slate-200 hover:border-slate-400 text-slate-700"}`}>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" name={g.key} checked={checked} onChange={upd} disabled={g.req} className="w-4 h-4 accent-orange-500 shrink-0" />
                          <div>
                            <p className="text-xs font-black uppercase">{g.label}</p>
                            {g.req && <p className="text-[8px] font-bold text-orange-400 uppercase">Obligatoire</p>}
                          </div>
                        </div>
                        {primeG>0&&checked&&<span className="text-[9px] font-black tabular-nums">{fmt(primeG)} DZD</span>}
                      </label>
                    );
                  })}
                </div>
              </SectionBox>
              <SectionBox title="Majorations (DZD)">
                <div className="grid grid-cols-3 gap-4">
                  <ModalInput label="Majoration Permis" name="majPermis" value={form.majPermis} onChange={upd} type="number" />
                  <ModalInput label="Majoration Âge" name="majAge" value={form.majAge} onChange={upd} type="number" />
                  <ModalInput label="Matières Inflammables" name="majMatieres" value={form.majMatieres} onChange={upd} type="number" />
                </div>
              </SectionBox>
              <div className="bg-slate-900 rounded-2xl p-5 flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Aperçu Prime Nette</p>
                  <p className="text-white text-2xl font-black tabular-nums">{fmt(calc.pNette)} <span className="text-sm text-slate-400">DZD</span></p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Total TTC estimé</p>
                  <p className="text-orange-400 text-2xl font-black tabular-nums">{fmt(calc.total)} <span className="text-sm text-slate-500">DZD</span></p>
                </div>
              </div>
            </div>
          )}
          {step===4 && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <SectionBox title="Tarification">
                  <CalcLine label="Prime de Base" val={calc.primeBase} />
                  <CalcLine label="+ Garanties facultatives" val={calc.options} />
                  <CalcLine label="= Prime avant réduction" val={calc.pAvantRed} accent />
                  <CalcLine label="− Réduction commerciale" val={calc.reduction} neg />
                  <CalcLine label="= Prime après réduction" val={calc.pApresRed} />
                  <CalcLine label="+ Majorations" val={calc.majs} />
                  <CalcLine label="Prime Nette (HT)" val={calc.pNette} bold />
                </SectionBox>
                <SectionBox title="Taxes & Timbres">
                  <CalcLine label="Accessoires (Auto-radio)" val={calc.acc} />
                  <CalcLine label="Taxes 19% (prime + acc.)" val={calc.taxes} />
                  <CalcLine label="Timbre + Gradué" val={calc.timbre} />
                </SectionBox>
                <SectionBox title="Commissions">
                  <CalcLine label="Apport (12%)" val={calc.apport} />
                  <CalcLine label="Gestion" val={calc.gestion} />
                  <CalcLine label="Total Comm." val={calc.totalComm} bold />
                </SectionBox>
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-slate-900 rounded-2xl p-8 text-center flex-1 flex flex-col justify-center border-b-4 border-orange-500">
                  <p className="text-orange-400 text-[9px] font-black uppercase tracking-[0.3em] mb-4">Net à Payer (TTC)</p>
                  <p className="text-white text-6xl font-black tabular-nums leading-none">{fmt(calc.total)}</p>
                  <p className="text-slate-400 text-sm font-bold mt-2">DINARS ALGÉRIENS</p>
                  <div className="mt-8 space-y-3 text-left bg-white/5 rounded-xl p-4">
                    {[["Assuré",form.nomAssure||"—"],["Marque",form.marque||"—"],["Immat.",form.immatriculation||"—"],["Date effet",form.dateEffet],["Zone",REF_ZONES.find(z=>z.id===form.zone)?.label||"—"]].map(([k,v])=>(
                      <div key={k} className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-bold uppercase">{k}</span>
                        <span className="text-slate-200 font-black">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={()=>{onEmit({...form,calc,id:`16/2026/${Math.floor(Math.random()*9000+1000)}`});onClose();}}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-orange-900/20 active:scale-95">
                  Émettre la Police →
                </button>
                <button onClick={onClose}
                  className="w-full py-3 bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl transition-all">
                  Imprimer Quittance
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <button onClick={()=>step>1?setStep(step-1):onClose()} className="px-6 py-2.5 text-[10px] font-black uppercase text-slate-500 hover:text-slate-800 transition-all">
            ← {step===1?"Annuler":"Retour"}
          </button>
          <div className="flex gap-1.5">
            {[1,2,3,4].map(s=>(
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s===step?"w-8 bg-orange-500":s<step?"w-4 bg-emerald-400":"w-4 bg-slate-200"}`} />
            ))}
          </div>
          {step<4 && <button onClick={()=>setStep(step+1)} className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">Étape suivante →</button>}
          {step===4 && <div className="w-32" />}
        </div>
      </div>
    </div>
  );
};

/* ─── SPARK BAR ──────────────────────────────────────────────────────────── */
const SparkBar = ({ data, color="#f97316" }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((v,i)=>(
        <div key={i} className="flex-1 rounded-sm transition-all" style={{height:`${(v/max)*100}%`,background:color,opacity:i===data.length-1?1:0.35}} />
      ))}
    </div>
  );
};

/* ─── POLICE CARD ────────────────────────────────────────────────────────── */
const PoliceCard = ({ police, onPayer, onChanger, onRenouveler }) => {
  const statut = getStatutPolice(police.echeance);
  const montantRestant = getMontantRestant(police.prime, police.echeance);
  const pct = police.prime > 0 ? Math.min(100, Math.round((montantRestant / police.prime) * 100)) : 0;
  const isExpired = statut === "EXPIRÉE";
  const statutColor = statut==="EN COURS"?"green":statut==="EXPIRE BIENTÔT"?"amber":"red";

  return (
    <div className={`rounded-2xl border-2 p-5 transition-all ${isExpired?"border-slate-200 bg-white opacity-75":"border-slate-900 bg-slate-900 text-white"}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className={`text-xs font-black uppercase ${isExpired?"text-slate-400":"text-slate-300"}`}>Police automobile</p>
          <p className={`text-lg font-black uppercase leading-tight mt-1 ${isExpired?"text-slate-800":"text-white"}`}>{police.marque}</p>
          {police.immat && police.immat!=="—" && (
            <p className={`text-[10px] font-mono font-bold mt-0.5 ${isExpired?"text-slate-500":"text-slate-400"}`}>{police.immat}</p>
          )}
        </div>
        <Badge color={statutColor}>{statut}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className={`text-[8px] font-black uppercase tracking-widest ${isExpired?"text-slate-400":"text-slate-500"}`}>N° Police</p>
          <p className={`text-[10px] font-black font-mono mt-0.5 ${isExpired?"text-slate-600":"text-slate-300"}`}>{police.id}</p>
        </div>
        <div>
          <p className={`text-[8px] font-black uppercase tracking-widest ${isExpired?"text-slate-400":"text-slate-500"}`}>Échéance</p>
          <p className={`text-[10px] font-black mt-0.5 ${statut==="EXPIRÉE"?"text-red-500":statut==="EXPIRE BIENTÔT"?"text-amber-400":"text-orange-400"}`}>{police.echeance}</p>
        </div>
        <div>
          <p className={`text-[8px] font-black uppercase tracking-widest ${isExpired?"text-slate-400":"text-slate-500"}`}>Prime annuelle</p>
          <p className={`text-[10px] font-black mt-0.5 ${isExpired?"text-slate-600":"text-slate-200"}`}>{fmt(police.prime)} DZD</p>
        </div>
        <div>
          <p className={`text-[8px] font-black uppercase tracking-widest ${isExpired?"text-slate-400":"text-slate-500"}`}>Restant à payer</p>
          <p className={`text-[10px] font-black mt-0.5 ${isExpired?"text-slate-600":"text-orange-400"}`}>{fmt(montantRestant)} DZD</p>
        </div>
      </div>

      {!isExpired && statut!=="INCONNU" && (
        <div className="mb-4">
          <div className="flex justify-between text-[8px] font-bold mb-1">
            <span className="text-slate-500">Couverture restante</span>
            <span className="text-slate-400">{pct}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${statut==="EXPIRE BIENTÔT"?"bg-amber-400":"bg-emerald-400"}`} style={{width:`${pct}%`}} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-4">
        {police.garanties.map(g=>(
          <span key={g} className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isExpired?"bg-slate-100 text-slate-500":"bg-white/10 text-slate-300 border border-white/20"}`}>{g}</span>
        ))}
      </div>

      {!isExpired ? (
        <div className="flex gap-2">
          <button onClick={()=>onPayer(police)}
            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95">
            💳 Payer en ligne
          </button>
          <button onClick={()=>onChanger(police)}
            className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
            🚗 Changer véhicule
          </button>
        </div>
      ) : (
        <button onClick={()=>onRenouveler(police)}
          className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
          🔄 Renouveler la police
        </button>
      )}
    </div>
  );
};

/* ─── DASHBOARD PRINCIPAL ────────────────────────────────────────────────── */
const Dashboard = ({ onLogout, onDeclareSinistre }) => {
  const [devisOpen, setDevisOpen]             = useState(false);
  const [polices, setPolices]                 = useState([]);
  const [sinistres, setSinistres]             = useState([]);
  const [activePage, setActivePage]           = useState("accueil");
  const [toast, setToast]                     = useState(null);
  const [user, setUser]                       = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [modalPaiement, setModalPaiement]     = useState(null);
  const [modalChangement, setModalChangement] = useState(null);
  const [modalRenouveler, setModalRenouveler] = useState(null);
  const [modalMsg, setModalMsg]               = useState(false);
  const [msgNonLus, setMsgNonLus]             = useState(1);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [sinistresRes, vehiculesRes] = await Promise.all([
        fetch('http://localhost:3001/api/sinistres/mes-sinistres', { headers }),
        fetch('http://localhost:3001/api/vehicules/mes-vehicules', { headers })
      ]);
      const sinistresData = await sinistresRes.json();
      const vehiculesData = await vehiculesRes.json();

      const vehiculesList = Array.isArray(vehiculesData) ? vehiculesData : [];
      const sinistresList = Array.isArray(sinistresData) ? sinistresData : [];

      const policesFormatted = vehiculesList.map(v => ({
        id:       v.id,
        marque:   v.marque.toUpperCase(),
        immat:    v.immatriculation,
        echeance: new Date(v.dateEcheance).toLocaleDateString('fr-DZ'),
        statut:   getStatutPolice(new Date(v.dateEcheance).toLocaleDateString('fr-DZ')),
        prime:    v.prime,
        garanties: v.garanties.split(',')
      }));

      const sinistresFormatted = sinistresList.map(s => ({
        ref:     s.ref,
        date:    new Date(s.createdAt).toLocaleDateString('fr-DZ'),
        type:    s.type,
        lieu:    s.lieu,
        statut:  s.statut,
        montant: s.montant
      }));

      setPolices(policesFormatted);
      setSinistres(sinistresFormatted);
    } catch (err) {
      console.error('Erreur chargement données', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchData();
  }, []);

  const handleEmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3001/api/vehicules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          marque: data.marque || 'VÉHICULE',
          immatriculation: data.immatriculation || '—',
          energie: data.energie || 'ESSENCE',
          dateEcheance: (() => {
            const d = new Date(data.dateEffet);
            d.setMonth(d.getMonth() + parseInt(data.duree||12));
            return d.toISOString();
          })(),
          garanties: Object.entries(data.garanties).filter(([,v])=>v).map(([k])=>k.toUpperCase()).join(','),
          prime: data.calc.pNette
        })
      });
      showToast(`Police émise avec succès — ${fmt(data.calc.total)} DZD TTC`);
      fetchData();
    } catch (err) {
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const primesData = [28400, 31000, 34200, 38500, 42120];
  const userDisplay = user?.fullName || user?.email || '';
  const userInitial = userDisplay?.[0]?.toUpperCase() || 'U';
  const policesActives    = polices.filter(p => getStatutPolice(p.echeance) === "EN COURS");
  const policesExpBientot = polices.filter(p => getStatutPolice(p.echeance) === "EXPIRE BIENTÔT");

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-orange-500 p-6 rounded-3xl font-black text-white italic text-3xl animate-bounce shadow-2xl inline-block mb-4">SAA</div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">Chargement de vos données...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {devisOpen       && <ModalDevis onClose={()=>setDevisOpen(false)} onEmit={handleEmit} />}
      {modalPaiement   && <ModalPaiement police={modalPaiement} onClose={()=>setModalPaiement(null)} />}
      {modalChangement && <ModalChangementVehicule police={modalChangement} onClose={()=>setModalChangement(null)}
          onConfirm={()=>showToast(`Demande de changement soumise pour la police ${modalChangement.id}`)} />}
      {modalRenouveler && <ModalRenouveler police={modalRenouveler} onClose={()=>setModalRenouveler(null)}
          onSuccess={()=>{ showToast('Police renouvelée avec succès !'); fetchData(); }} />}
      {modalMsg        && <ModalMessagerie onClose={()=>{setModalMsg(false);setMsgNonLus(0);}} />}

      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-widest transition-all ${toast.type==="success"?"bg-emerald-500 text-white":"bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {policesExpBientot.length > 0 && (
        <div className="bg-amber-500 text-white px-8 py-2.5 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest">⚠ {policesExpBientot.length} police(s) expire(nt) dans moins de 30 jours</p>
          <button onClick={()=>setActivePage("polices")} className="text-[10px] font-black uppercase border border-white/40 px-3 py-1 rounded-lg hover:bg-white/20 transition-all">Voir →</button>
        </div>
      )}

      <nav className="bg-slate-900 border-b-4 border-orange-500 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-white font-black text-2xl tracking-tighter uppercase italic">SAA</div>
            <div className="h-6 w-px bg-white/10" />
            <div className="hidden md:flex gap-1">
              {[["accueil","Accueil"],["polices","Mes Polices"],["sinistres","Mes Sinistres"]].map(([id,label])=>(
                <button key={id} onClick={()=>setActivePage(id)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activePage===id?"bg-white/10 text-white":"text-slate-400 hover:text-white hover:bg-white/5"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={()=>setModalMsg(true)}
              className="relative px-3 py-1.5 rounded-lg border border-slate-700 hover:border-orange-500 text-slate-400 hover:text-orange-400 transition-all">
              <span className="text-sm">💬</span>
              {msgNonLus > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] font-black flex items-center justify-center">{msgNonLus}</span>
              )}
            </button>
            <div className="text-right hidden md:block">
              <p className="text-white text-[10px] font-black uppercase tracking-widest">{userDisplay}</p>
              <p className="text-orange-400 text-[8px] font-bold">Espace Client SAA</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-sm">{userInitial}</div>
            <button onClick={onLogout}
              className="text-slate-400 hover:text-red-400 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border border-slate-700 hover:border-red-500 transition-all">
              Quitter
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">

        {activePage==="accueil" && (
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden border-b-4 border-orange-500">
              <div className="absolute inset-0 opacity-5" style={{backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",backgroundSize:"20px 20px"}} />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-orange-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Espace Client Professionnel</p>
                  <h1 className="text-white text-4xl font-black uppercase italic leading-tight">Bonjour,<br />{userDisplay}</h1>
                  <p className="text-slate-400 text-xs font-bold mt-3 font-mono">Espace Client SAA</p>
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={()=>setDevisOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-orange-900/30 active:scale-95">
                    + Nouveau Devis / Police
                  </button>
                  <button onClick={onDeclareSinistre}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
                    🚨 Déclarer un Sinistre
                  </button>
                  <button onClick={()=>setModalMsg(true)}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2">
                    💬 Contacter un Agent
                    {msgNonLus>0 && <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{msgNonLus}</span>}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label:"Polices Actives",   val: policesActives.length,                                                                         unit:""    },
                { label:"Prime Totale / An", val: fmt(polices.filter(p=>getStatutPolice(p.echeance)!=="EXPIRÉE").reduce((a,p)=>a+p.prime,0)),    unit:"DZD" },
                { label:"Sinistres Ouverts", val: sinistres.filter(s=>s.statut==="EN COURS").length,                                             unit:""    },
                { label:"Points Fidélité",   val: "1 250",                                                                                       unit:"pts" }
              ].map(k=>(
                <div key={k.label} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-400 transition-all">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{k.label}</p>
                  <p className="text-2xl font-black text-slate-900 leading-none">{k.val}</p>
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
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                    <p className="text-slate-400 text-sm font-bold">Aucune police souscrite</p>
                    <button onClick={()=>setDevisOpen(true)} className="mt-3 text-orange-500 font-black text-xs uppercase">+ Créer un devis →</button>
                  </div>
                ) : polices.slice(0,2).map(p=>(
                  <PoliceCard key={p.id} police={p} onPayer={setModalPaiement} onChanger={setModalChangement} onRenouveler={setModalRenouveler} />
                ))}
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Évolution Primes</p>
                  <p className="text-xl font-black text-slate-900 mb-3">{fmt(primesData[primesData.length-1])} <span className="text-xs text-slate-400">DZD</span></p>
                  <SparkBar data={primesData} />
                  <p className="text-[8px] font-bold text-slate-300 uppercase mt-2">5 dernières années</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Programme Fidélité</p>
                  <div className="flex items-end gap-3 mb-3">
                    <p className="text-4xl font-black text-orange-500">1 250</p>
                    <p className="text-xs text-slate-500 font-bold mb-1">points</p>
                  </div>
                  <div className="bg-slate-100 rounded-full h-1.5 mb-1 overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full" style={{width:`${(1250/2000)*100}%`}} />
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">750 pts pour le palier Or</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Dernier Sinistre</p>
                  {sinistres.length>0 ? (
                    <>
                      <p className="text-xs font-black text-slate-800">{sinistres[0].type}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1">{sinistres[0].date}</p>
                      {sinistres[0].lieu && <p className="text-[9px] font-bold text-slate-400">{sinistres[0].lieu}</p>}
                      <div className="flex items-center justify-between mt-3">
                        <Badge color="amber">{sinistres[0].statut}</Badge>
                        <p className="text-[9px] font-black text-slate-500 font-mono">{sinistres[0].ref}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 gap-2">
                      <p className="text-slate-300 text-2xl">✓</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase text-center">Aucun sinistre déclaré</p>
                      <button onClick={onDeclareSinistre} className="mt-2 text-[9px] font-black uppercase text-red-400 hover:text-red-600 transition-all">+ Déclarer un sinistre</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activePage==="polices" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contrats Automobile</p>
                <h2 className="text-2xl font-black uppercase text-slate-900 mt-1">Mes Polices</h2>
              </div>
              <button onClick={()=>setDevisOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all">
                + Nouvelle Police
              </button>
            </div>
            {polices.length>0 && (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label:"En cours",       count:polices.filter(p=>getStatutPolice(p.echeance)==="EN COURS").length,       cls:"bg-emerald-100 text-emerald-800 border-emerald-200" },
                  { label:"Expire bientôt", count:polices.filter(p=>getStatutPolice(p.echeance)==="EXPIRE BIENTÔT").length, cls:"bg-amber-100 text-amber-800 border-amber-200" },
                  { label:"Expirées",       count:polices.filter(p=>getStatutPolice(p.echeance)==="EXPIRÉE").length,        cls:"bg-red-100 text-red-800 border-red-200" },
                ].map(s=>(
                  <div key={s.label} className={`border rounded-2xl p-4 text-center ${s.cls}`}>
                    <p className="text-2xl font-black">{s.count}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
            {polices.length===0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center gap-4">
                <p className="font-black uppercase text-slate-400 text-sm">Aucune police souscrite</p>
                <button onClick={()=>setDevisOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all">+ Créer un devis</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {polices.map(p=><PoliceCard key={p.id} police={p} onPayer={setModalPaiement} onChanger={setModalChangement} onRenouveler={setModalRenouveler} />)}
              </div>
            )}
          </div>
        )}

        {activePage==="sinistres" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Gestion des Réclamations</p>
                <h2 className="text-2xl font-black uppercase text-slate-900 mt-1">Mes Sinistres</h2>
              </div>
              <button onClick={onDeclareSinistre}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all">
                🚨 Nouveau Sinistre
              </button>
            </div>
            {sinistres.length===0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl">🛡️</div>
                <p className="font-black uppercase text-slate-400 text-sm">Aucun sinistre déclaré</p>
                <button onClick={onDeclareSinistre} className="mt-2 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all">+ Déclarer un sinistre</button>
              </div>
            ) : (
              <div className="grid gap-4">
                {sinistres.map(s=>(
                  <div key={s.ref} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-400 transition-all">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                          s.statut==="EN COURS"?"bg-amber-100 text-amber-700":
                          s.statut==="VALIDÉ"?"bg-emerald-100 text-emerald-700":
                          s.statut==="REFUSÉ"?"bg-red-100 text-red-700":"bg-slate-100 text-slate-500"
                        }`}>⚠</div>
                        <div>
                          <p className="text-xs font-black uppercase text-slate-800">{s.type}</p>
                          <p className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">{s.ref} • {s.date}</p>
                          {s.lieu && <p className="text-[9px] font-bold text-slate-400 mt-0.5">{s.lieu}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase text-slate-400">Montant</p>
                          <p className="text-sm font-black text-slate-900">{s.montant>0?fmt(s.montant)+" DZD":"En évaluation"}</p>
                        </div>
                        <Badge color={s.statut==="EN COURS"?"amber":s.statut==="VALIDÉ"?"green":s.statut==="REFUSÉ"?"red":"slate"}>{s.statut}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
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