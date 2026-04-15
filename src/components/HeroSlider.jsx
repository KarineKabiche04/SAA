import React, { useState, useEffect, useCallback } from 'react';

const slides = [
  {
    title: "ESPACE CLIENT SAA",
    description: "Gérez vos contrats et vos sinistres en toute simplicité. Connectez-vous ou créez votre compte en quelques clics.",
    bg: "https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=1600",
    buttons: [
      { label: "Se Connecter", primary: true, mode: 'login' },
      { label: "Créer un compte", primary: false, mode: 'register' }
    ]
  },
  {
    title: "DEVIS & SOUSCRIPTION EN LIGNE",
    description: "Faites vos devis & souscriptions automobiles et motos en ligne facilement et en toute sécurité.",
    bg: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1600",
    buttons: [
      { label: "Assurance Auto / Moto", primary: true }
    ]
  },
  {
    title: "CONTRE LES IMPRÉVUS DE LA VIE",
    description: "Protégez votre famille et votre maison au meilleur prix. La protection de votre logement et de vos biens personnels est notre priorité !",
    bg: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600",
    buttons: [
      { label: "Découvrir l'offre Habitation", primary: true }
    ]
  },
  {
    title: "POUR QUE LA MER SOIT UN PLAISIR",
    description: "Découvrez l'assurance bateau de plaisance faite spécialement pour vous garantir une navigation tout en repos.",
    bg: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600",
    buttons: [
      { label: "Découvrir l'offre Bateau", primary: true }
    ]
  }
];

const HeroSlider = ({ onLoginClick }) => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered]);

  return (
    <div 
      className="relative h-[650px] w-full overflow-hidden bg-slate-900 group font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Overlay dégradé pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10"></div>
          
          <img 
            src={slide.bg} 
            alt={slide.title} 
            className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${index === current ? 'scale-110' : 'scale-100'}`} 
          />

          {/* Contenu CENTRÉ verticalement et horizontalement */}
          <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
            <div className={`max-w-5xl text-center transition-all duration-1000 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
              
              <p className="text-[#e89d1b] font-black text-xs uppercase tracking-[0.5em] mb-6 drop-shadow-md">
                Solutions SAA Assurances
              </p>
              
              <h1 className="text-4xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-8 leading-[1.1] drop-shadow-lg">
                {slide.title}
              </h1>
              
              <p className="text-lg md:text-2xl text-white/90 mb-12 font-medium leading-relaxed max-w-3xl mx-auto drop-shadow-md">
                {slide.description}
              </p>
              
              <div className="flex flex-wrap gap-6 justify-center items-center">
                {slide.buttons.map((btn, bIdx) => (
                  <button
                    key={bIdx}
                    onClick={() => btn.mode ? onLoginClick(btn.mode) : null}
                    className={`px-12 py-5 rounded-full font-black text-[12px] uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 shadow-2xl ${
                      btn.primary 
                      ? 'bg-[#e89d1b] text-white hover:bg-orange-600 hover:-translate-y-1' 
                      : 'bg-white/10 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-slate-900 hover:-translate-y-1'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Flèches de Navigation */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex justify-between px-8 pointer-events-none">
        <button 
          onClick={prevSlide} 
          className="pointer-events-auto w-16 h-16 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#e89d1b] text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-10 group-hover:translate-x-0"
        >
          <span className="text-3xl">❮</span>
        </button>
        <button 
          onClick={nextSlide} 
          className="pointer-events-auto w-16 h-16 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#e89d1b] text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0"
        >
          <span className="text-3xl">❯</span>
        </button>
      </div>

      {/* Indicateurs (Dash progressifs) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-4">
        {slides.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrent(i)}
            className={`h-1.5 transition-all duration-500 rounded-full ${i === current ? 'w-16 bg-[#e89d1b]' : 'w-4 bg-white/30 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;