import React, { useState } from 'react';

const garanties = [
  { icon: '💥', titre: 'Responsabilité Civile', desc: 'Obligatoire en Algérie. Couvre les dommages corporels et matériels causés à des tiers.' },
  { icon: '🔧', titre: 'Dommages Tous Accidents', desc: 'Prise en charge de votre véhicule quel que soit le responsable de l\'accident.' },
  { icon: '🔥', titre: 'Incendie & Vol', desc: 'Indemnisation en cas d\'incendie, de vol total ou de tentative de vol de votre véhicule.' },
  { icon: '🌪️', titre: 'Bris de Glace', desc: 'Remplacement du pare-brise, vitres latérales et lunette arrière sans franchise.' },
  { icon: '🚑', titre: 'Assistance 24h/24', desc: 'Remorquage, véhicule de remplacement et prise en charge médicale en cas d\'accident.' },
  { icon: '🌍', titre: 'Protection Voyage', desc: 'Couverture étendue pour vos déplacements sur tout le territoire algérien.' },
];

const formules = [
  {
    nom: 'RC OBLIGATOIRE',
    prix: '4 500',
    couleur: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
    avantages: ['Responsabilité Civile', 'Protection juridique de base'],
    manquants: ['Dommages Tous Accidents', 'Incendie & Vol', 'Bris de Glace', 'Assistance 24h/24'],
  },
  {
    nom: 'TOUS RISQUES',
    prix: '18 000',
    couleur: '#e89d1b',
    bg: '#fffbf0',
    border: '#e89d1b',
    badge: 'Recommandé',
    avantages: ['Responsabilité Civile', 'Dommages Tous Accidents', 'Incendie & Vol', 'Bris de Glace'],
    manquants: ['Assistance 24h/24', 'Protection Voyage'],
  },
  {
    nom: 'INTÉGRAL',
    prix: '28 000',
    couleur: '#e89d1b',
    bg: '#1a1f2e',
    border: '#1a1f2e',
    dark: true,
    avantages: ['Responsabilité Civile', 'Dommages Tous Accidents', 'Incendie & Vol', 'Bris de Glace', 'Assistance 24h/24', 'Protection Voyage'],
    manquants: [],
  },
];

const faqs = [
  { q: 'L\'assurance RC est-elle obligatoire en Algérie ?', r: 'Oui, la Responsabilité Civile Automobile est une assurance obligatoire en Algérie pour tout véhicule à moteur circulant sur la voie publique. Rouler sans RC expose à des sanctions pénales.' },
  { q: 'Comment est calculée ma prime d\'assurance auto ?', r: 'La prime dépend de plusieurs critères : la puissance fiscale du véhicule, sa valeur vénale, l\'ancienneté, la zone de circulation, et votre historique sinistres (bonus/malus).' },
  { q: 'Puis-je assurer ma moto avec SAA ?', r: 'Oui, SAA propose des contrats spécifiques pour les motos, scooters et cyclomoteurs avec des garanties adaptées à chaque type de deux-roues.' },
];

export default function AutoMoto({ onDevisClick }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [type, setType] = useState('auto');

  return (
    <div className="font-sans bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1f2e] via-[#2d3554] to-[#0f1520] min-h-[480px] flex items-center">
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1f2e]/95 via-[#1a1f2e]/70 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#e89d1b]/20 border border-[#e89d1b]/40 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[#e89d1b] text-[11px] font-black uppercase tracking-widest">🚗 Assurance Auto / Moto</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase leading-[1.05] mb-6">
              ROULEZ<br />
              <span className="text-[#e89d1b]">EN TOUTE SÉCURITÉ</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-md">
              L'assurance auto et moto SAA vous protège sur toutes les routes d'Algérie. RC obligatoire ou tous risques, choisissez la formule qui vous convient.
            </p>

            {/* Toggle Auto / Moto */}
            <div className="flex gap-2 mb-8 bg-white/10 p-1 rounded-full w-fit backdrop-blur-sm">
              {['auto', 'moto'].map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-6 py-2 rounded-full font-black text-[11px] uppercase tracking-widest transition-all ${type === t ? 'bg-[#e89d1b] text-white' : 'text-white/60 hover:text-white'}`}
                >
                  {t === 'auto' ? '🚗 Voiture' : '🏍️ Moto'}
                </button>
              ))}
            </div>

            <div className="flex gap-4 flex-wrap">
              <button
                onClick={onDevisClick}
                className="px-8 py-4 bg-[#e89d1b] text-white font-black text-[11px] uppercase tracking-widest rounded-full hover:bg-orange-500 transition-all hover:-translate-y-0.5 shadow-xl"
              >
                Devis {type === 'auto' ? 'Voiture' : 'Moto'} Gratuit
              </button>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <div className="text-[160px] filter drop-shadow-2xl select-none">
              {type === 'auto' ? '🚗' : '🏍️'}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#e89d1b] py-8">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: '120 000+', l: 'Véhicules assurés' },
            { n: 'RC', l: 'Obligatoire incluse' },
            { n: '72h', l: 'Règlement sinistres' },
            { n: '300+', l: 'Agences en Algérie' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black text-white italic">{s.n}</div>
              <div className="text-white/80 text-[11px] font-semibold uppercase tracking-widest mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── GARANTIES ── */}
      <section className="py-20 max-w-6xl mx-auto px-8">
        <div className="text-center mb-14">
          <p className="text-[#e89d1b] text-[11px] font-black uppercase tracking-widest mb-3">Ce qui vous protège</p>
          <h2 className="text-4xl font-black text-[#1a1f2e] italic uppercase">NOS GARANTIES AUTO / MOTO</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {garanties.map((g, i) => (
            <div key={i} className="p-6 border border-slate-100 rounded-2xl hover:border-[#e89d1b] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
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
            <p className="text-[#e89d1b] text-[11px] font-black uppercase tracking-widest mb-3">Pour tous les profils</p>
            <h2 className="text-4xl font-black text-[#1a1f2e] italic uppercase">NOS FORMULES {type.toUpperCase()}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formules.map((f, i) => (
              <div key={i} className="relative rounded-2xl p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                style={{ background: f.bg, border: `2px solid ${f.border}` }}>
                {f.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e89d1b] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                    {f.badge}
                  </div>
                )}
                <h3 className={`font-black text-xs uppercase tracking-widest mb-2 ${f.dark ? 'text-[#e89d1b]' : 'text-slate-400'}`}>{f.nom}</h3>
                <div className={`text-4xl font-black italic mb-1 ${f.dark ? 'text-white' : 'text-[#1a1f2e]'}`}>{f.prix} <span className="text-base font-normal">DA/an</span></div>
                <p className={`text-xs mb-6 ${f.dark ? 'text-white/50' : 'text-slate-400'}`}>Par véhicule, toutes taxes</p>
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
                  style={{ background: f.couleur, color: '#fff', border: f.dark ? '2px solid #e89d1b' : 'none' }}>
                  Souscrire
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
      <section className="py-16 bg-[#1a1f2e] text-center px-8">
        <h2 className="text-4xl font-black text-white italic uppercase mb-4">ASSUREZ VOTRE VÉHICULE AUJOURD'HUI</h2>
        <p className="text-white/60 mb-8 text-lg">Devis en ligne immédiat. Souscription en quelques clics.</p>
        <button onClick={onDevisClick}
          className="px-12 py-5 bg-[#e89d1b] text-white font-black text-[11px] uppercase tracking-widest rounded-full hover:bg-orange-500 transition-all hover:-translate-y-1 shadow-2xl">
          Obtenir Mon Devis Auto / Moto
        </button>
      </section>
    </div>
  );
}