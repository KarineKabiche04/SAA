import React from 'react';

const TopBar = () => {
  return (
    <div className="bg-[#2c2e33] text-white h-10 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-4 flex justify-between items-center h-full">
        
        {/* Section Gauche : Navigation par segments */}
        <div className="flex h-full text-[11px] font-bold uppercase tracking-tight">
          <button className="bg-white text-slate-900 px-6 flex items-center h-full border-r border-gray-200">
            Particuliers
          </button>
          <button className="px-6 flex items-center h-full hover:bg-white/10 transition-colors border-r border-white/10 text-gray-300 hover:text-white">
            Pros & Entreprises
          </button>
          <button className="px-6 flex items-center h-full hover:bg-white/10 transition-colors border-r border-white/10 text-gray-300 hover:text-white">
            Presse & Corporate
          </button>
        </div>

        {/* Section Droite : Réseaux sociaux et Langue */}
        <div className="flex items-center gap-6 h-full">
          {/* Icônes Réseaux Sociaux (Simulées avec du texte pour la structure) */}
          <div className="hidden md:flex items-center gap-4 border-r border-white/10 pr-6 h-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="text-[10px] font-black">f</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="text-[10px] font-black">in</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="text-[10px] font-black">ig</span>
            </a>
          </div>

          {/* Sélecteur de langue */}
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-200 hover:text-white transition-colors">
            🌐 Français 
            <span className="text-[8px] opacity-60">▼</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default TopBar;