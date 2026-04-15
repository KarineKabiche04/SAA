import React from 'react';

const Navbar = () => {
  return (
    <nav className="border-y border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 lg:grid-cols-7 text-[10px] font-black uppercase tracking-[0.15em]">
        
        {/* Item ACCUEIL - Maintenant en Orange (Actif) */}
        <NavItem 
          label="ACCUEIL" 
          icon="🏠" 
          active 
        />
        
        {/* Les autres items en Gris Bleuté (Standard) */}
        <NavItem label="CYBER RISQUES" icon="🛡️" />
        <NavItem label="AUTO / MOTO" icon="🚗" />
        <NavItem label="HABITATION" icon="🏠" />
        <NavItem label="BATEAU DE PLAISANCE" icon="⛵" />
        <NavItem label="SANTÉ" icon="🏥" />

        {/* Bouton de recherche */}
        <div className="flex items-center justify-center p-5 border-l border-gray-50 cursor-pointer group hover:bg-gray-50 transition-colors">
          <span className="text-xl group-hover:scale-110 transition-transform">🔍</span>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ label, icon, active }) => (
  <div className={`
    relative flex flex-col items-center justify-center py-6 border-r border-gray-50 cursor-pointer transition-all
    group hover:bg-gray-50
    ${active ? 'bg-gray-50' : 'bg-white'}
  `}>
    {/* Icône */}
    <div className={`text-2xl mb-2 transition-transform group-hover:scale-110 ${active ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}>
      {icon}
    </div>

    {/* Texte - Orange si actif, Gris-bleu sinon */}
    <span className={`px-2 text-center leading-tight transition-colors ${active ? 'text-[#e89d1b]' : 'text-slate-500 group-hover:text-[#e89d1b]'}`}>
      {label}
    </span>

    {/* La barre orange de sélection en bas (uniquement pour l'élément actif) */}
    {active && (
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#e89d1b]"></div>
    )}
  </div>
);

export default Navbar;