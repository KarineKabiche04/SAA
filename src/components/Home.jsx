import React from 'react';

// --- Petit composant réutilisable pour les cartes d'assurance ---
const InsuranceCard = ({ icon, title, description, color }) => (
  <div className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-${color}-300 hover:shadow-lg hover:shadow-${color}-500/10 transition-all duration-300 group cursor-pointer flex flex-col h-full`}>
    <div className={`w-14 h-14 rounded-2xl bg-${color}-50 flex items-center justify-center text-${color}-500 mb-6 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">{description}</p>
    <a href="#" className={`text-${color}-600 font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all`}>
      Découvrir l'offre <span>→</span>
    </a>
  </div>
);

const Home = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-100">
      
      {/* --- 1. Top Header (Urgence & Accès Rapide) --- */}
      <div className="bg-slate-900 text-slate-300 py-2.5 px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-medium">
          <div className="flex gap-5 items-center">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Assistance 24/7 : **021 22 50 00**
            </span>
            <span className="hidden md:inline">|</span>
            <a href="#" className="hover:text-white hidden md:inline">Trouver une agence</a>
          </div>
          <div className="flex gap-4 items-center font-semibold text-white">
            <a href="#" className="hover:text-cyan-400">Déclarer un sinistre</a>
            <a href="#" className="bg-white/10 px-4 py-1.5 rounded-full hover:bg-white/20 transition">Espace Client 🔒</a>
          </div>
        </div>
      </div>

      {/* --- 2. Navigation Bar principale --- */}
      <nav className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo Pro */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/30">S</div>
            <span className="text-2xl font-extrabold text-slate-950 tracking-tighter">saa<span className="text-blue-600">.</span><span className="text-xs font-medium text-slate-400 tracking-normal ml-1">assurances</span></span>
          </div>
          
          {/* Menu principal */}
          <div className="hidden lg:flex gap-10 text-[14px] font-semibold text-slate-700">
            {['Auto', 'Habitation', 'Santé', 'Pro & PME', 'Épargne'].map(item => (
              <a key={item} href="#" className="hover:text-blue-600 transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-0 after:-bottom-1 hover:after:w-full after:transition-all">{item}</a>
            ))}
          </div>

          {/* CTA */}
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-500/20">
            Obtenir un devis express
          </button>
        </div>
      </nav>

      {/* --- 3. Section Hero (Confiance & Action) --- */}
      <header className="bg-gradient-to-b from-blue-50/50 to-white py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">N°1 de l'assurance en Algérie</span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-950 tracking-tighter leading-[1.1] mb-8">
              Protégez ce qui compte <br />vrai<span className="text-blue-600">m</span>ent pour vous.
            </h1>
            <p className="text-lg text-slate-700 mb-12 leading-relaxed max-w-xl">
              De votre famille à votre entreprise, SAA vous offre des solutions d'assurance claires, rapides et adaptées à votre quotidien. Sans mauvaise surprise.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <button className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-slate-800 transition active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10">
                🚀 Simuler mon tarif
              </button>
              <button className="bg-white border border-slate-200 text-slate-900 px-10 py-4 rounded-xl font-bold hover:bg-slate-50 transition active:scale-95 flex items-center justify-center gap-2">
                📞 Parler à un conseiller
              </button>
            </div>
          </div>
          {/* Illustration visuelle Pro */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1556742044-3c52d6e88c02?q=80&w=600&auto=format&fit=crop" 
              alt="Conseillère souriante" 
              className="rounded-3xl w-full h-[350px] object-cover"
            />
          </div>
        </div>
      </header>

      {/* --- 4. Section Bento Grid (Les Offres) --- */}
      <section className="max-w-7xl mx-auto py-24 px-6 bg-white rounded-[3rem] shadow-xl shadow-slate-500/5 border border-slate-100 -mt-10 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Nos Solutions</h2>
          <p className="text-4xl font-extrabold text-slate-950 tracking-tight">Une couverture complète, pour chaque étape de votre vie.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Carte Auto (Bleu) */}
          <InsuranceCard 
            color="blue"
            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>}
            title="Assurance Auto Connectée"
            description="Roulez l'esprit tranquille avec des garanties sur-mesure et une assistance géolocalisée en 1 clic depuis votre mobile."
          />

          {/* Carte Habitation (Ambre) */}
          <InsuranceCard 
            color="amber"
            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
            title="Multirisque Habitation"
            description="Votre foyer est précieux. Protégez vos murs, vos biens et votre responsabilité civile avec des plafonds adaptés."
          />

          {/* Carte Santé (Cyan) */}
          <InsuranceCard 
            color="cyan"
            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 006.364-6.364 4.5 4.5 0 00-6.364 0L12 7.293l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
            title="Complémentaire Santé"
            description="Prenez soin de vous et de vos proches avec des remboursements rapides et un large réseau de professionnels de santé."
          />

        </div>
      </section>

      {/* --- 5. Footer Pro Épuré --- */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 mt-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">S</div>
              <span className="text-xl font-extrabold text-white tracking-tighter">saa.assurances</span>
            </div>
            <p className="text-xs">© 2024 Société Nationale d'Assurances. <br />Tous droits réservés.</p>
          </div>
          <div><h5 className="font-bold text-white mb-3">Produits</h5><a>Auto</a><br /><a>Maison</a><br /><a>Santé</a></div>
          <div><h5 className="font-bold text-white mb-3">Entreprise</h5><a>À propos</a><br /><a>Carrières</a><br /><a>Presse</a></div>
          <div><h5 className="font-bold text-white mb-3">Légal</h5><a>Mentions légales</a><br /><a>Confidentialité</a></div>
        </div>
      </footer>
    </div>
  );
};

export default Home;