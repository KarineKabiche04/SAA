import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#1a1c20] text-slate-400 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Colonne 1 : Identité & Protection */}
          <div className="space-y-6">
            <div className="leading-none">
              <span className="text-3xl font-black text-[#e89d1b] italic tracking-tighter uppercase">saa</span>
              <span className="block text-[10px] font-bold text-white uppercase tracking-[0.3em] mt-1">Assurances</span>
            </div>
            <div className="pt-4">
              <h4 className="text-white text-[11px] font-black uppercase tracking-widest mb-4">Protection des données</h4>
              <ul className="text-xs space-y-2">
                <li className="hover:text-yellow-500 cursor-pointer transition-colors">› Politique de Protection</li>
                <li className="hover:text-yellow-500 cursor-pointer transition-colors">› Mentions Légales</li>
              </ul>
            </div>
          </div>

          {/* Colonne 2 : Navigation Corporate */}
          <div>
            <h4 className="text-white text-[11px] font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-2">Découvrez la SAA</h4>
            <ul className="text-xs space-y-4">
              <li className="hover:text-yellow-500 cursor-pointer transition-colors flex items-center gap-2">› Présentation</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors flex items-center gap-2">› Mot du PDG</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors flex items-center gap-2">› La SAA en chiffres</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors flex items-center gap-2">› Actualité</li>
            </ul>
          </div>

          {/* Colonne 3 : Produits */}
          <div>
            <h4 className="text-white text-[11px] font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-2">Nos Produits</h4>
            <ul className="text-xs space-y-4">
              <li className="hover:text-yellow-500 cursor-pointer transition-colors flex items-center gap-2">› Assurance Auto</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors flex items-center gap-2">› Multirisque Habitation</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors flex items-center gap-2">› Catastrophes Naturelles</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors flex items-center gap-2">› Bateau de plaisance</li>
            </ul>
          </div>

          {/* Colonne 4 : Contact Direct */}
          <div>
            <h4 className="text-white text-[11px] font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-2">Contactez-nous</h4>
            <div className="text-xs space-y-5">
              <div className="flex gap-3">
                <span className="text-yellow-500">📍</span>
                <p className="leading-relaxed">
                  <span className="text-white font-bold italic block mb-1">Adresse :</span>
                  Immeuble SAA, Route nationale n°5, Bab Ezzouar, Alger.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-yellow-500">📞</span>
                <p><span className="text-white font-bold italic">Tel :</span> +213 21 22 50 00</p>
              </div>
              <div className="flex gap-3">
                <span className="text-yellow-500">📧</span>
                <p><span className="text-white font-bold italic">Email :</span> ecoute_client@saa.dz</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de Copyright Finale */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40">
            © 2026 Société Nationale d'Assurances. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-white/20">
            <span className="hover:text-yellow-500 cursor-pointer transition-colors">Facebook</span>
            <span className="hover:text-yellow-500 cursor-pointer transition-colors">LinkedIn</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;