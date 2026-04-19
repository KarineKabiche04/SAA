import React from 'react';

// Le composant reçoit la fonction onDevisClick depuis App.jsx
const ProductGrid = ({ onDevisClick }) => {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 border-b border-gray-100">
        
        {/* Produit 1 : Habitation */}
        <ProductCard 
          title="MULTIRISQUE HABITATION"
          description="L'assurance Multirisques Habitation SAA vous protège efficacement en toutes circonstances contre l'incendie, les dégâts des eaux, le vol, le bris de glaces et les catastrophes naturelles."
          icon="🏠"
          iconColor="text-red-500"
          onBtnClick={onDevisClick}
        />

        {/* Produit 2 : Responsabilité Civile */}
        <ProductCard 
          title="RESPONSABILITÉ CIVILE"
          description="Lorsque vous ou vos proches causez des dommages à autrui, votre responsabilité civile est engagée. La SAA prend le relais pour indemniser les victimes à votre place."
          icon="👥"
          iconColor="text-purple-500"
          onBtnClick={onDevisClick}
        />

        {/* Produit 3 : Bloc CTA Professionnel (Couleur différente) */}
        <div className="bg-slate-50 p-12 flex flex-col items-center text-center group">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform duration-300">
            <span className="text-2xl">💼</span>
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-slate-800">
            VOUS ÊTES UN PRO ?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-10 font-medium max-w-[250px]">
            Allez de l'avant, la SAA vous accompagne dans vos projets d'avenir avec des solutions d'assurance dédiées aux entreprises et professionnels.
          </p>
          <button 
            onClick={onDevisClick}
            className="bg-[#e89d1b] text-white px-8 py-3 rounded font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-orange-200 active:scale-95"
          >
            EN SAVOIR PLUS
          </button>
        </div>

      </div>
    </section>
  );
};

/**
 * Sous-composant pour les cartes standards
 * On extrait précisément les props pour ne rien oublier
 */
const ProductCard = ({ title, description, icon, iconColor, onBtnClick }) => (
  <div className="p-12 border-r border-gray-100 flex flex-col items-center text-center hover:bg-gray-50 transition-all duration-300 group cursor-pointer" onClick={onBtnClick}>
    <div className={`text-4xl mb-8 ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-slate-700">
      {title}
    </h3>
    <p className="text-xs text-slate-400 leading-relaxed mb-10 font-medium">
      {description}
    </p>
    <button 
      onClick={(e) => {
        e.stopPropagation(); // Empêche le double clic si la carte est déjà cliquable
        onBtnClick();
      }}
      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#e89d1b] transition-colors flex items-center gap-2 group-hover:translate-x-1 duration-300"
    >
      Découvrir l'offre <span className="text-lg">→</span>
    </button>
  </div>
);

export default ProductGrid;