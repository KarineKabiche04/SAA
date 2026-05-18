import React, { useState } from 'react';

const garanties = [
  { icon: '⚓', titre: 'Corps du Navire', desc: 'Dommages subis par votre embarcation : collision, naufrage, échouement, choc.' },
  { icon: '👥', titre: 'Responsabilité Civile', desc: 'Dommages causés à des tiers (autres bateaux, installations portuaires, personnes).' },
  { icon: '🆘', titre: 'Assistance & Sauvetage', desc: 'Remorquage en mer, assistance en cas de panne et frais de sauvetage.' },
  { icon: '🔥', titre: 'Incendie & Explosion', desc: 'Dommages causés par un incendie à bord, explosion du moteur ou du réservoir.' },
  { icon: '🌊', titre: 'Tempête & Intempéries', desc: 'Couverture des dégâts causés par les tempêtes, vents violents et mer agitée.' },
  { icon: '🎿', titre: 'Équipements & Accastillage', desc: 'Voiles, moteurs hors-bord, instruments de navigation et équipements sportifs.' },
];

const formules = [
  {
    nom: 'CÔTIER',
    prix: '22 000',
    couleur: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
    avantages: ['Corps du Navire', 'Responsabilité Civile', 'Incendie & Explosion'],
    manquants: ['Assistance & Sauvetage', 'Tempête & Intempéries', 'Équipements'],
    zone: 'Navigation côtière (12 milles)',
  },
  {
    nom: 'PLAISANCIER',
    prix: '48 000',
    couleur: '#e89d1b',
    bg: '#f0f8ff',
    border: '#e89d1b',
    badge: 'Le plus complet',
    avantages: ['Corps du Navire', 'Responsabilité Civile', 'Assistance & Sauvetage', 'Incendie & Explosion', 'Tempête & Intempéries'],
    manquants: ['Équipements'],
    zone: 'Navigation hauturière (200 milles)',
  },
  {
    nom: 'GRAND LARGE',
    prix: '85 000',
    couleur: '#e89d1b',
    bg: '#1a1f2e',
    border: '#1a1f2e',
    dark: true,
    avantages: ['Corps du Navire', 'Responsabilité Civile', 'Assistance & Sauvetage', 'Incendie & Explosion', 'Tempête & Intempéries', 'Équipements & Accastillage'],
    manquants: [],
    zone: 'Navigation illimitée',
  },
];

const faqs = [
  { q: 'Quels types d\'embarcations puis-je assurer chez SAA ?', r: 'SAA assure tous les types d\'embarcations de plaisance : voiliers, bateaux à moteur, semi-rigides, jet-skis, catamarans et yachts, jusqu\'à 24 mètres de longueur hors-tout.' },
  { q: 'L\'assurance couvre-t-elle mon bateau à quai ?', r: 'Oui, votre bateau est couvert en navigation mais aussi à l\'amarrage dans les ports et marinas, en hivernage à sec et lors du transport sur remorque.' },
  { q: 'Comment est évaluée la valeur de mon bateau ?', r: 'La valeur assurée est déterminée d\'un commun accord lors de la souscription, sur la base de la valeur vénale ou de la valeur à neuf selon la formule choisie. Un expert peut intervenir pour les embarcations de grande valeur.' },
];

export default function BateauPlaisance({ onDevisClick }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="font-sans bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-[480px] flex items-center"
        style={{ background: 'linear-gradient(135deg, #062a4a 0%, #0a3d5c 50%, #04253f 100%)' }}>
        <div className="absolute inset-0 opacity-25"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#062a4a]/95 via-[#062a4a]/70 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#e89d1b]/20 border border-[#e89d1b]/40 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[#e89d1b] text-[11px] font-black uppercase tracking-widest">⛵ Bateau de Plaisance</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase leading-[1.05] mb-6">
              NAVIGUEZ<br />
              <span className="text-[#e89d1b]">L'ESPRIT SEREIN</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-md">
              Que vous soyez plaisancier du dimanche ou navigateur aguerri, SAA protège votre embarcation sur toutes les mers d'Algérie.
            </p>

            {/* Zones de navigation */}
            <div className="flex gap-3 mb-8 flex-wrap">
              {['Navigation côtière', 'Navigation hauturière', 'Méditerranée'].map((z, i) => (
                <span key={i} className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white/70 text-[11px] font-semibold backdrop-blur-sm">
                  ✓ {z}
                </span>
              ))}
            </div>

            <div className="flex gap-4 flex-wrap">
              <button onClick={onDevisClick}
                className="px-8 py-4 bg-[#e89d1b] text-white font-black text-[11px] uppercase tracking-widest rounded-full hover:bg-orange-500 transition-all hover:-translate-y-0.5 shadow-xl">
                Assurer Mon Bateau
              </button>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <div className="relative w-72 h-72 border border-[#e89d1b]/30 rounded-[3rem] flex items-center justify-center text-[120px]"
              style={{ background: 'rgba(6,42,74,0.6)' }}>
              ⛵
              <div className="absolute -bottom-4 -right-4 bg-[#e89d1b] text-white text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-lg">
                Dès 22 000 DA/an
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-8" style={{ background: '#062a4a' }}>
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: '5 000+', l: 'Bateaux assurés' },
            { n: '1 200km', l: 'De côtes couvertes' },
            { n: '24h', l: 'Assistance en mer' },
            { n: '48h', l: 'Expertise post-sinistre' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black text-white italic">{s.n}</div>
              <div className="text-white/60 text-[11px] font-semibold uppercase tracking-widest mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── GARANTIES ── */}
      <section className="py-20 max-w-6xl mx-auto px-8">
        <div className="text-center mb-14">
          <p className="text-[#e89d1b] text-[11px] font-black uppercase tracking-widest mb-3">Une protection en mer et à quai</p>
          <h2 className="text-4xl font-black text-[#1a1f2e] italic uppercase">NOS GARANTIES NAUTIQUES</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {garanties.map((g, i) => (
            <div key={i} className="p-6 border border-slate-100 rounded-2xl hover:border-[#062a4a] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
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
            <h2 className="text-4xl font-black text-[#1a1f2e] italic uppercase">FORMULES NAUTIQUES</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formules.map((f, i) => (
              <div key={i} className="relative rounded-2xl p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                style={{ background: f.bg, border: `2px solid ${f.border}` }}>
                {f.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e89d1b] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">{f.badge}</div>
                )}
                <h3 className={`font-black text-xs uppercase tracking-widest mb-1 ${f.dark ? 'text-[#e89d1b]' : 'text-slate-400'}`}>{f.nom}</h3>
                <div className={`text-xs mb-3 ${f.dark ? 'text-blue-300' : 'text-blue-500'}`}>🧭 {f.zone}</div>
                <div className={`text-4xl font-black italic mb-1 ${f.dark ? 'text-white' : 'text-[#1a1f2e]'}`}>{f.prix} <span className="text-base font-normal">DA/an</span></div>
                <p className={`text-xs mb-6 ${f.dark ? 'text-white/50' : 'text-slate-400'}`}>Par embarcation</p>
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
                  style={{ background: f.dark ? '#e89d1b' : f.couleur, color: '#fff' }}>
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
      <section className="py-16 text-center px-8" style={{ background: '#062a4a' }}>
        <h2 className="text-4xl font-black text-white italic uppercase mb-4">PRÊT À PRENDRE LE LARGE ?</h2>
        <p className="text-white/60 mb-8 text-lg">Obtenez votre devis nautique en quelques minutes.</p>
        <button onClick={onDevisClick}
          className="px-12 py-5 bg-[#e89d1b] text-white font-black text-[11px] uppercase tracking-widest rounded-full hover:bg-orange-500 transition-all hover:-translate-y-1 shadow-2xl">
          Obtenir Mon Devis Bateau
        </button>
      </section>
    </div>
  );
}