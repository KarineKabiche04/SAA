import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* --- 1. BANDEAU DE SEGMENTATION (Gris clair) --- */}
      <div className="bg-[#f2f2f2] border-b border-gray-300 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-[11px] font-bold uppercase">
          <div className="flex">
            <button className="bg-white px-5 py-2.5 text-blue-700 border-x border-gray-300 relative after:absolute after:top-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-700">
              Particuliers
            </button>
            <button className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 border-r border-gray-300">
              Pros & Entreprises
            </button>
            <button className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 border-r border-gray-300">
              Presse & Corporate
            </button>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <div className="flex gap-3 pr-4 border-r border-gray-300">
              <span>f</span> <span>in</span> <span>ig</span>
            </div>
            <button className="flex items-center gap-1">🌐 FRANÇAIS</button>
          </div>
        </div>
      </div>

      {/* --- 2. LOGO & CONTACT (Blanc) --- */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          {/* Logo simulé SAA */}
          <div className="flex flex-col items-center leading-none">
            <span className="text-3xl font-black text-orange-500 italic tracking-tighter">saa</span>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Assurances</span>
          </div>
        </div>

        <div className="hidden lg:flex gap-12 items-center">
          <div className="flex items-center gap-3">
            <div className="text-orange-400">📞</div>
            <div className="text-xs">
              <p className="font-bold text-gray-600">021 22 50 00</p>
              <p className="text-gray-400 italic">Dimanche-Jeudi 8h30-17h30</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-orange-400">📍</div>
            <div className="text-xs">
              <p className="font-bold text-gray-600 italic">Contactez nous</p>
              <p className="text-gray-400 uppercase">SAA vous écoute</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-orange-400">🔍</div>
            <div className="text-xs">
              <p className="font-bold text-gray-600 italic uppercase">Trouver une agence</p>
              <p className="text-gray-400 uppercase">SAA est près de chez vous</p>
            </div>
          </div>
        </div>

        <button className="bg-[#5cb85c] text-white px-5 py-2.5 rounded text-xs font-bold flex items-center gap-2 hover:bg-green-600 transition">
          Espace client (021 22 50 12) 🔒
        </button>
      </div>

      {/* --- 3. BARRE DE NAVIGATION ICÔNES (Blanc/Gris) --- */}
      <nav className="border-y border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 lg:grid-cols-7 text-[10px] font-bold uppercase text-gray-600">
          <NavItem label="ACCUEIL" active />
          <NavItem label="CYBER RISQUES" highlight />
          <NavItem label="AUTO / MOTO" />
          <NavItem label="HABITATION" />
          <NavItem label="BATEAU DE PLAISANCE" />
          <NavItem label="SANTÉ" />
          <div className="flex items-center justify-center p-4 border-l border-gray-100">🔍</div>
        </div>
      </nav>

      {/* --- 4. HERO SECTION (IMAGE + OVERLAY) --- */}
      <div className="relative h-[450px] bg-slate-800 flex items-center overflow-hidden">
        {/* Image de fond (Remplacer par une image de bureau/paiement) */}
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=1600" 
            className="w-full h-full object-cover" 
            alt="Paiement en ligne SAA" 
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 italic uppercase tracking-tight">
            PAIEMENT EN LIGNE
          </h1>
          <p className="text-xl md:text-2xl font-light mb-10 max-w-2xl mx-auto">
            Faites vos devis & souscriptions en ligne facilement et en toute sécurité
          </p>
          <button className="bg-white/20 backdrop-blur-sm border border-white px-8 py-3 uppercase font-bold text-sm hover:bg-white hover:text-blue-900 transition">
            MULTIRISQUE HABITATION
          </button>
        </div>

        {/* Badge circulaire en bas à droite */}
        <div className="absolute bottom-8 right-8 hidden md:block">
           <div className="w-20 h-20 rounded-full border-2 border-white/30 flex items-center justify-center p-1">
              <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-center leading-tight">
                CRÉDIT<br/>AGRICOLE
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// Composant interne pour les éléments de menu
const NavItem = ({ label, active, highlight }) => (
  <div className={`flex flex-col items-center justify-center py-4 border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition ${active ? 'bg-gray-50' : ''}`}>
    <div className={`w-8 h-8 mb-2 flex items-center justify-center ${active ? 'text-yellow-500' : highlight ? 'text-orange-500' : 'text-gray-400'}`}>
       {/* Icônes simplifiées */}
       {label === 'ACCUEIL' && '🏠'}
       {label === 'CYBER RISQUES' && '🛡️'}
       {label === 'AUTO / MOTO' && '🚗'}
       {label === 'HABITATION' && '🏠'}
       {label === 'BATEAU DE PLAISANCE' && '⛵'}
       {label === 'SANTÉ' && '🏥'}
    </div>
    <span className={`px-2 text-center leading-tight ${highlight ? 'text-orange-600' : ''}`}>{label}</span>
  </div>
);

export default Home;