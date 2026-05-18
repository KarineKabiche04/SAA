import React, { useState } from 'react';

const garanties = [
  { icon: '🔥', titre: 'Incendie & Explosion', desc: 'Couvre tous les dommages causés par le feu, la fumée et les explosions dans votre logement.' },
  { icon: '💧', titre: 'Dégâts des Eaux', desc: 'Protection contre les inondations, ruptures de canalisations et infiltrations.' },
  { icon: '⚡', titre: 'Catastrophes Naturelles', desc: 'Tremblement de terre, inondations, tempêtes et autres événements naturels.' },
  { icon: '🔓', titre: 'Vol & Cambriolage', desc: 'Remboursement de vos biens volés et dommages liés aux effractions.' },
  { icon: '🛡️', titre: 'Responsabilité Civile', desc: 'Vous protège en cas de dommages causés à des tiers depuis votre logement.' },
  { icon: '🏗️', titre: 'Bris de Glace', desc: 'Remplacement de toutes vos vitres, miroirs et surfaces vitrées.' },
];

const formules = [
  {
    nom: 'ESSENTIEL',
    prix: '1 200',
    couleur: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
    avantages: ['Incendie & Explosion', 'Dégâts des Eaux', 'Catastrophes Naturelles'],
    manquants: ['Vol & Cambriolage', 'Responsabilité Civile', 'Bris de Glace'],
  },
  {
    nom: 'CONFORT',
    prix: '2 400',
    couleur: '#e89d1b',
    bg: '#fffbf0',
    border: '#e89d1b',
    badge: 'Le plus choisi',
    avantages: ['Incendie & Explosion', 'Dégâts des Eaux', 'Catastrophes Naturelles', 'Vol & Cambriolage', 'Responsabilité Civile'],
    manquants: ['Bris de Glace'],
  },
  {
    nom: 'PREMIUM',
    prix: '3 800',
    couleur: '#1a1f2e',
    bg: '#1a1f2e',
    border: '#1a1f2e',
    dark: true,
    avantages: ['Incendie & Explosion', 'Dégâts des Eaux', 'Catastrophes Naturelles', 'Vol & Cambriolage', 'Responsabilité Civile', 'Bris de Glace'],
    manquants: [],
  },
];

const faqs = [
  { q: 'Quels biens sont couverts par l\'assurance habitation ?', r: 'L\'assurance habitation SAA couvre votre logement (murs, toiture, installations fixes) ainsi que vos biens mobiliers (meubles, électroménager, vêtements, objets de valeur jusqu\'à un certain plafond).' },
  { q: 'Comment déclarer un sinistre habitation ?', r: 'Connectez-vous à votre Espace Client SAA ou appelez le 021 22 50 12. Vous pouvez aussi vous rendre dans l\'une de nos agences. La déclaration doit être faite dans les 5 jours suivant le sinistre.' },
  { q: 'L\'assurance couvre-t-elle les locataires ?', r: 'Oui, l\'assurance habitation SAA est disponible pour les propriétaires occupants, les propriétaires non-occupants et les locataires avec des formules adaptées à chaque situation.' },
];

export default function Habitation({ onDevisClick }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="font-sans bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1f2e] via-[#2d3554] to-[#1a1f2e] min-h-[480px] flex items-center">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1f2e]/95 via-[#1a1f2e]/70 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#e89d1b]/20 border border-[#e89d1b]/40 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[#e89d1b] text-[11px] font-black uppercase tracking-widest">🏠 Assurance Habitation</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase leading-[1.05] mb-6">
              VOTRE MAISON,<br />
              <span className="text-[#e89d1b]">NOTRE PRIORITÉ</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-md">
              Protégez votre logement et vos biens avec la formule habitation SAA. Une couverture complète pour vivre l'esprit serein.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={onDevisClick}
                className="px-8 py-4 bg-[#e89d1b] text-white font-black text-[11px] uppercase tracking-widest rounded-full hover:bg-orange-500 transition-all hover:-translate-y-0.5 shadow-xl shadow-orange-900/30"
              >
                Obtenir un Devis Gratuit
              </button>
              <button className="px-8 py-4 bg-white/10 border border-white/30 text-white font-black text-[11px] uppercase tracking-widest rounded-full hover:bg-white/20 transition-all hover:-translate-y-0.5 backdrop-blur-sm">
                Découvrir les garanties
              </button>
            </div>
          </div>
          <div className="hidden md:flex justify-end">
            <div className="relative">
              <div className="w-72 h-72 bg-[#e89d1b]/10 border border-[#e89d1b]/20 rounded-[3rem] flex items-center justify-center text-[120px]">
                🏠
              </div>
              <div className="absolute -top-4 -right-4 bg-[#e89d1b] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                Dès 1 200 DA/an
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-[#1a1f2e] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                ✓ Sans engagement
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHIFFRES CLÉS ── */}
      <section className="bg-[#e89d1b] py-8">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: '50 000+', l: 'Foyers protégés' },
            { n: '24h', l: 'Délai de réponse' },
            { n: '98%', l: 'Clients satisfaits' },
            { n: '60 ans', l: "D'expérience SAA" },
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
          <p className="text-[#e89d1b] text-[11px] font-black uppercase tracking-widest mb-3">Ce que vous couvre SAA</p>
          <h2 className="text-4xl font-black text-[#1a1f2e] italic uppercase">NOS GARANTIES HABITATION</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {garanties.map((g, i) => (
            <div key={i} className="group p-6 border border-slate-100 rounded-2xl hover:border-[#e89d1b] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white">
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
            <p className="text-[#e89d1b] text-[11px] font-black uppercase tracking-widest mb-3">Adaptée à votre budget</p>
            <h2 className="text-4xl font-black text-[#1a1f2e] italic uppercase">CHOISISSEZ VOTRE FORMULE</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formules.map((f, i) => (
              <div
                key={i}
                className="relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{ background: f.bg, border: `2px solid ${f.border}` }}
              >
                {f.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e89d1b] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                    {f.badge}
                  </div>
                )}
                <h3 className={`font-black text-xs uppercase tracking-widest mb-2 ${f.dark ? 'text-[#e89d1b]' : 'text-slate-400'}`}>{f.nom}</h3>
                <div className={`text-4xl font-black italic mb-1 ${f.dark ? 'text-white' : 'text-[#1a1f2e]'}`}>{f.prix} <span className="text-base font-normal">DA/an</span></div>
                <p className={`text-xs mb-6 ${f.dark ? 'text-white/50' : 'text-slate-400'}`}>Toutes taxes comprises</p>

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

                <button
                  onClick={onDevisClick}
                  className="w-full py-3 rounded-full font-black text-[11px] uppercase tracking-widest transition-all hover:-translate-y-0.5"
                  style={{
                    background: f.couleur,
                    color: f.dark && f.couleur === '#1a1f2e' ? '#e89d1b' : '#fff',
                    border: f.dark ? '2px solid #e89d1b' : 'none',
                  }}
                >
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
          <p className="text-[#e89d1b] text-[11px] font-black uppercase tracking-widest mb-3">Vous avez des questions ?</p>
          <h2 className="text-4xl font-black text-[#1a1f2e] italic uppercase">QUESTIONS FRÉQUENTES</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-bold text-[#1a1f2e] text-sm pr-4">{f.q}</span>
                <span className={`text-[#e89d1b] text-xl font-black flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {f.r}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-16 bg-[#1a1f2e] text-center px-8">
        <h2 className="text-4xl font-black text-white italic uppercase mb-4">PRÊT À PROTÉGER VOTRE LOGEMENT ?</h2>
        <p className="text-white/60 mb-8 text-lg">Obtenez votre devis personnalisé en moins de 5 minutes.</p>
        <button
          onClick={onDevisClick}
          className="px-12 py-5 bg-[#e89d1b] text-white font-black text-[11px] uppercase tracking-widest rounded-full hover:bg-orange-500 transition-all hover:-translate-y-1 shadow-2xl shadow-orange-900/40"
        >
          Obtenir Mon Devis Habitation
        </button>
      </section>

    </div>
  );
}