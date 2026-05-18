import React, { useState } from 'react';

const menaces = [
  { icon: '🔐', titre: 'Ransomware', desc: 'Protection contre les logiciels malveillants qui chiffrent vos données et exigent une rançon.' },
  { icon: '🎣', titre: 'Phishing & Fraude', desc: 'Couverture des pertes financières dues aux arnaques et usurpations d\'identité en ligne.' },
  { icon: '💻', titre: 'Violation de Données', desc: 'Prise en charge des frais légaux et de notification en cas de fuite de données clients.' },
  { icon: '🌐', titre: 'Interruption d\'Activité', desc: 'Indemnisation de la perte d\'exploitation due à une cyberattaque sur vos systèmes.' },
  { icon: '⚖️', titre: 'Responsabilité Cyber', desc: 'Défense juridique si des tiers vous poursuivent suite à une violation de leurs données.' },
  { icon: '🛠️', titre: 'Restauration Systèmes', desc: 'Frais de remise en état de votre infrastructure informatique après une attaque.' },
];

const formules = [
  {
    nom: 'TPE / PME',
    prix: '35 000',
    couleur: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
    avantages: ['Protection ransomware', 'Phishing & Fraude', 'Assistance technique 24h'],
    manquants: ['Violation de Données', 'Interruption d\'Activité', 'Responsabilité Cyber'],
  },
  {
    nom: 'ENTREPRISE',
    prix: '95 000',
    couleur: '#e89d1b',
    bg: '#fffbf0',
    border: '#e89d1b',
    badge: 'Populaire',
    avantages: ['Protection ransomware', 'Phishing & Fraude', 'Assistance technique 24h', 'Violation de Données', 'Interruption d\'Activité'],
    manquants: ['Responsabilité Cyber'],
  },
  {
    nom: 'GRAND COMPTE',
    prix: 'Sur devis',
    couleur: '#e89d1b',
    bg: '#1a1f2e',
    border: '#1a1f2e',
    dark: true,
    avantages: ['Protection ransomware', 'Phishing & Fraude', 'Assistance technique 24h', 'Violation de Données', 'Interruption d\'Activité', 'Responsabilité Cyber'],
    manquants: [],
  },
];

const faqs = [
  { q: 'Qu\'est-ce qu\'une cyberassurance ?', r: 'La cyberassurance protège les entreprises contre les conséquences financières des cyberattaques et violations de données. Elle couvre les coûts de remédiation, les pertes d\'exploitation et les éventuelles poursuites judiciaires.' },
  { q: 'Mon entreprise est-elle vraiment exposée aux cyberrisques ?', r: 'En Algérie, les cyberattaques ont augmenté de 400% depuis 2020. Toute structure connectée à internet est exposée : PME, commerce, cabinet médical, cabinet d\'avocat. Le coût moyen d\'une attaque dépasse 8 millions de DA.' },
  { q: 'La cyberassurance couvre-t-elle aussi les employés en télétravail ?', r: 'Oui, nos formules Entreprise et Grand Compte couvrent les incidents liés au télétravail, y compris les connexions depuis des réseaux domestiques et l\'utilisation d\'appareils personnels à des fins professionnelles.' },
];

export default function CyberRisques({ onDevisClick }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="font-sans bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-[480px] flex items-center"
        style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 40%, #0a1628 100%)' }}>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(232,157,27,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(232,157,27,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d1a]/95 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#e89d1b]/20 border border-[#e89d1b]/40 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[#e89d1b] text-[11px] font-black uppercase tracking-widest">🛡️ Cyber Risques</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase leading-[1.05] mb-6">
              PROTÉGEZ<br />
              <span className="text-[#e89d1b]">VOTRE DIGITAL</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-6 max-w-md">
              Les cyberattaques coûtent des millions aux entreprises algériennes. SAA vous protège contre toutes les menaces numériques.
            </p>

            {/* Alerte live */}
            <div className="flex items-center gap-3 bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 mb-8">
              <span className="text-red-400 text-lg animate-pulse">⚠️</span>
              <span className="text-red-300 text-[11px] font-bold uppercase tracking-wide">Les cyberattaques ont augmenté de 400% en Algérie en 2024</span>
            </div>

            <div className="flex gap-4 flex-wrap">
              <button onClick={onDevisClick}
                className="px-8 py-4 bg-[#e89d1b] text-white font-black text-[11px] uppercase tracking-widest rounded-full hover:bg-orange-500 transition-all hover:-translate-y-0.5 shadow-xl">
                Sécuriser Mon Entreprise
              </button>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <div className="relative w-72 h-72 border border-[#e89d1b]/30 rounded-[3rem] flex items-center justify-center text-[120px]"
              style={{ background: 'rgba(232,157,27,0.05)' }}>
              🔐
              <div className="absolute inset-0 rounded-[3rem] border border-[#e89d1b]/10 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#e89d1b] py-8">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: '8M DA', l: 'Coût moyen attaque' },
            { n: '400%', l: 'Hausse des attaques' },
            { n: '1h', l: 'Réponse incident' },
            { n: '100%', l: 'Entreprises à risque' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black text-white italic">{s.n}</div>
              <div className="text-white/80 text-[11px] font-semibold uppercase tracking-widest mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MENACES ── */}
      <section className="py-20 max-w-6xl mx-auto px-8">
        <div className="text-center mb-14">
          <p className="text-[#e89d1b] text-[11px] font-black uppercase tracking-widest mb-3">Ce contre quoi nous vous protégeons</p>
          <h2 className="text-4xl font-black text-[#1a1f2e] italic uppercase">MENACES COUVERTES</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menaces.map((g, i) => (
            <div key={i} className="p-6 border border-slate-100 rounded-2xl hover:border-[#e89d1b] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
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
            <h2 className="text-4xl font-black text-[#1a1f2e] italic uppercase">FORMULES CYBER</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formules.map((f, i) => (
              <div key={i} className="relative rounded-2xl p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                style={{ background: f.bg, border: `2px solid ${f.border}` }}>
                {f.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e89d1b] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">{f.badge}</div>
                )}
                <h3 className={`font-black text-xs uppercase tracking-widest mb-2 ${f.dark ? 'text-[#e89d1b]' : 'text-slate-400'}`}>{f.nom}</h3>
                <div className={`text-3xl font-black italic mb-1 ${f.dark ? 'text-white' : 'text-[#1a1f2e]'}`}>{f.prix} <span className="text-base font-normal">{f.prix !== 'Sur devis' ? 'DA/an' : ''}</span></div>
                <p className={`text-xs mb-6 ${f.dark ? 'text-white/50' : 'text-slate-400'}`}>Par entreprise</p>
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
                  {f.prix === 'Sur devis' ? 'Nous Contacter' : 'Souscrire'}
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
      <section className="py-16 text-center px-8"
        style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 100%)' }}>
        <h2 className="text-4xl font-black text-white italic uppercase mb-4">NE LAISSEZ PAS LES HACKERS GAGNER</h2>
        <p className="text-white/60 mb-8 text-lg">Protégez votre entreprise dès aujourd'hui.</p>
        <button onClick={onDevisClick}
          className="px-12 py-5 bg-[#e89d1b] text-white font-black text-[11px] uppercase tracking-widest rounded-full hover:bg-orange-500 transition-all hover:-translate-y-1 shadow-2xl">
          Obtenir Mon Devis Cyber
        </button>
      </section>
    </div>
  );
}