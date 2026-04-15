import React from 'react';

const MainHeader = () => {
  return (
    <div className="bg-white py-6 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-6">
        
        {/* --- LOGO SAA --- */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="flex flex-col items-center leading-none">
            {/* Simulation du logo SAA avec du style Tailwind */}
            <span className="text-4xl font-black text-[#e89d1b] italic tracking-tighter group-hover:scale-105 transition-transform">
              saa
            </span>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] -mt-1">
              Assurances
            </span>
          </div>
        </div>

        {/* --- INFOS DE CONTACT (Desktop) --- */}
        <div className="hidden lg:flex gap-10 items-center">
          <HeaderContact 
            icon="📞" 
            title="021 22 50 00" 
            subtitle="Dimanche-Jeudi 8h30-17h30" 
          />
          <HeaderContact 
            icon="💬" 
            title="Contactez nous" 
            subtitle="SAA vous écoute" 
            isItalic 
          />
          <HeaderContact 
            icon="📍" 
            title="Trouver une agence" 
            subtitle="SAA est près de chez vous" 
            isUppercase 
          />
        </div>

        {/* --- BOUTON ESPACE CLIENT --- */}
        <button className="bg-[#5cb85c] text-white px-6 py-3 rounded text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#4cae4c] transition-all shadow-md active:scale-95">
          Espace client (021 22 50 12) 
          <span className="text-xs">🔒</span>
        </button>

      </div>
    </div>
  );
};

/**
 * Sous-composant pour les blocs d'information de contact
 */
const HeaderContact = ({ icon, title, subtitle, isItalic, isUppercase }) => (
  <div className="flex items-center gap-3 border-r last:border-0 border-gray-100 pr-10 last:pr-0">
    <div className="text-2xl text-[#e89d1b] opacity-80">{icon}</div>
    <div className="leading-tight">
      <p className={`text-[13px] font-bold text-slate-700 ${isItalic ? 'italic' : ''} ${isUppercase ? 'uppercase tracking-tighter' : ''}`}>
        {title}
      </p>
      <p className="text-[10px] text-gray-400 font-medium italic">
        {subtitle}
      </p>
    </div>
  </div>
);

export default MainHeader;