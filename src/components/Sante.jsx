import React, { useState } from 'react';

const garanties = [
  { icon: '🏥', titre: 'Hospitalisation', desc: 'Prise en charge complète des frais d\'hospitalisation, chirurgie et soins intensifs.' },
  { icon: '💊', titre: 'Médicaments', desc: 'Remboursement des médicaments prescrits selon le barème SAA.' },
  { icon: '👁️', titre: 'Optique & Dentaire', desc: 'Lunettes, lentilles, soins dentaires et prothèses remboursés.' },
  { icon: '🩺', titre: 'Consultations Médicales', desc: 'Généralistes, spécialistes et examens de biologie pris en charge.' },
  { icon: '🚑', titre: 'Urgences & Rapatriement', desc: 'Assistance médicale 24h/24 et rapatriement sanitaire si nécessaire.' },
  { icon: '🤰', titre: 'Maternité', desc: 'Suivi de grossesse, accouchement et soins du nouveau-né couverts.' },
];

const formules = [
  {
    nom: 'INDIVIDUEL',
    prix: '12 000',
    couleur: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
    avantages: ['Hospitalisation', 'Consultations médicales', 'Médicaments (60%)'],
    manquants: ['Optique & Dentaire', 'Urgences & Rapatriement', 'Maternité'],
  },
  {
    nom: 'FAMILLE',
    prix: '28 000',
    couleur: '#e89d1b',
    bg: '#fffbf0',
    border: '#e89d1b',
    badge: 'Meilleure valeur',
    avantages: ['Hospitalisation', 'Consultations médicales', 'Médicaments (80%)', 'Optique & Dentaire', 'Maternité'],
    manquants: ['Urgences & Rapatriement'],
  },
  {
    nom: 'PRESTIGE',
    prix: '45 000',
    couleur: '#e89d1b',
    bg: '#1a1f2e',
    border: '#1a1f2e',
    dark: true,
    avantages: ['Hospitalisation', 'Consultations médicales', 'Médicaments (100%)', 'Optique & Dentaire', 'Urgences & Rapatriement', 'Maternité'],
    manquants: [],
  },
];

const faqs = [
  { q: 'Comment fonctionne le remboursement des soins ?', r: 'Après chaque soin, vous soumettez votre dossier (ordonnance, facture, bulletin de soin) à SAA via l\'espace client en ligne ou en agence. Le remboursement intervient sous 10 jours ouvrés.' },
  { q: 'Puis-je assurer toute ma famille avec un seul contrat ?', r: 'Oui, la formule Famille couvre le souscripteur, son conjoint et tous ses enfants à charge (jusqu\'à 25 ans pour les étudiants) sous un seul et même contrat.' },
  { q: 'Y a-t-il un délai de carence ?', r: 'Un délai de carence de 3 mois s\'applique pour la maternité et certaines pathologies chroniques. Pour les soins courants (consultations, médicaments), la couverture est immédiate à la souscription.' },
];

export default function Sante({ onDevisClick }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="font-sans bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f4c35] via-[#1a6b4a] to-[#0d3d2c] min-h-[480px] flex items-center">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f4c35]/95 via-[#0f4c35]/70 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#e89d1b]/20 border border-[#e89d1b]/40 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[#e89d1b] text-[11px] font-black uppercase tracking-widest">🩺 Assurance Santé</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase leading-[1.05] mb-6">
              VOTRE SANTÉ,<br />
              <span className="text-[#e89d1b]">NOTRE ENGAGEMENT</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-md">
              Bénéficiez d'une couverture médicale complète pour vous et votre famille. SAA prend soin de vous à chaque étape de votre vie.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button onClick={onDevisClick}
                className="px-8 py-4 bg-[#e89d1b] text-white font-black text-[11px] uppercase tracking-widest rounded-full hover:bg-orange-500 transition-all hover:-translate-y-0.5 shadow-xl">
                Obtenir un Devis Santé
              </button>
              <button className="px-8 py-4 bg-white/10 border border-white/30 text-white font-black text-[11px] uppercase tracking-widest rounded-full hover:bg-white/20 transition-all backdrop-blur-sm">
                Voir les garanties
              </button>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative w-72 h-72 bg-white/10 border border-white/20 rounded-[3rem] flex items-center justify-center text-[120px]">
              🏥
              <div className="absolute -top-4 -right-4 bg-[#e89d1b] text-white text-[10px] font-black uppercase px-4 py-2 rounded-full">
                Dès 12 000 DA/an
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-[#0f4c35] text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-lg">
                ✓ Famille couverte
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#0f4c35] py-8">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: '200+', l: 'Cliniques partenaires' },
            { n: '100%', l: 'Hospitalisation couverte' },
            { n: '10j', l: 'Délai de remboursement' },
            { n: '24h', l: 'Assistance médicale' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black text-white italic">{s.n}</div>
              <div className="text-white/70 text-[11px] font-semibold uppercase tracking-widest mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── GARANTIES ── */}
      <section className="py-20 max-w-6xl mx-auto px-8">
        <div className="text-center mb-14">
          <p className="text-[#e89d1b] text-[11px] font-black uppercase tracking-widest mb-3">Une couverture globale</p>
          <h2 className="text-4xl font-black text-[#1a1f2e] italic uppercase">NOS GARANTIES SANTÉ</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {garanties.map((g, i) => (
            <div key={i} className="p-6 border border-slate-100 rounded-2xl hover:border-[#0f4c35] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-4">{g.icon}</div>
              <h3 className="text-[#1a1f2e] font-black text-sm uppercase tracking-wide mb-2">{g.titre}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FORMULES ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-14">
            <p className="text-[#e89d1b] text-[11px] font-black uppercase tracking-widest mb-3">Pour chaque situation</p>
            <h2 className="text-4xl font-black text-[#1a1f2e] italic uppercase">NOS FORMULES SANTÉ</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formules.map((f, i) => (
              <div key={i} className="relative rounded-2xl p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                style={{ background: f.bg, border: `2px solid ${f.border}` }}>
                {f.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e89d1b] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">{f.badge}</div>
                )}
                <h3 className={`font-black text-xs uppercase tracking-widest mb-2 ${f.dark ? 'text-[#e89d1b]' : 'text-slate-400'}`}>{f.nom}</h3>
                <div className={`text-4xl font-black italic mb-1 ${f.dark ? 'text-white' : 'text-[#1a1f2e]'}`}>{f.prix} <span className="text-base font-normal">DA/an</span></div>
                <p className={`text-xs mb-6 ${f.dark ? 'text-white/50' : 'text-slate-400'}`}>Par personne</p>
                <div className="space-y-2 mb-8">
                  {f.avantages.map((a, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span className="text-green-500 text-sm">✓</span>
                      <span className={`text-sm ${f.dark ? 'text-white/80' : 'text-slate-600'}`}>{a}</span>
                    </div>
                  ))}
                  {f.manquants.map((m, j) => (
                    <div key={j} className="flex items-center gap-2 opacity-40">
                      <span className="text-slate-400 text-sm">✗</span>
                      <span className={`text-sm ${f.dark ? 'text-white/50' : 'text-slate-400'}`}>{m}</span>
                    </div>
                  ))}
                </div>
                <button onClick={onDevisClick}
                  className="w-full py-3 rounded-full font-black text-[11px] uppercase tracking-widest transition-all hover:-translate-y-0.5"
                  style={{ background: f.couleur === '#64748b' ? '#64748b' : f.dark ? '#e89d1b' : '#e89d1b', color: '#fff' }}>
                  Souscrire {f.nom}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 max-w-4xl mx-auto px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black text-[#1a1f2e] italic uppercase">QUESTIONS FRÉQUENTES</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
              <button className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="font-bold text-[#1a1f2e] text-sm pr-4">{f.q}</span>
                <span className={`text-[#e89d1b] text-xl font-black flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">{f.r}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-[#0f4c35] text-center px-8">
        <h2 className="text-4xl font-black text-white italic uppercase mb-4">PRENEZ SOIN DE VOTRE FAMILLE</h2>
        <p className="text-white/60 mb-8 text-lg">Souscrivez votre assurance santé en quelques minutes.</p>
        <button onClick={onDevisClick}
          className="px-12 py-5 bg-[#e89d1b] text-white font-black text-[11px] uppercase tracking-widest rounded-full hover:bg-orange-500 transition-all hover:-translate-y-1 shadow-2xl">
          Obtenir Mon Devis Santé
        </button>
      </section>
    </div>
  );
}