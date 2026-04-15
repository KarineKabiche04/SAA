import React, { useState, useEffect } from 'react';

const Login = ({ initialMode = 'login' }) => {
  // On initialise l'état selon le bouton cliqué dans le HeroSlider
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');

  // Si on change de mode via le Slider sans fermer le composant, on met à jour
  useEffect(() => {
    setIsLoginMode(initialMode === 'login');
  }, [initialMode]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 transition-all duration-500">
        
        {/* Header Institutionnel Unique */}
        <div className="bg-[#0f172a] p-10 text-center relative">
          <div className="inline-flex flex-col items-center leading-none mb-4">
            <span className="text-4xl font-black text-[#e89d1b] italic tracking-tighter uppercase">saa</span>
            <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mt-1">Assurances</span>
          </div>
          <h2 className="text-white text-xl font-black uppercase tracking-tight italic">
            {isLoginMode ? "Espace Client" : "Inscription"}
          </h2>
          <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isLoginMode ? 'w-full bg-[#5cb85c]' : 'w-full bg-[#e89d1b]'}`}></div>
        </div>

        <div className="p-8">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            
            {/* Nom complet affiché uniquement en mode inscription */}
            {!isLoginMode && (
              <div className="animate-fade-in">
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Nom Complet</label>
                <input 
                  type="text" 
                  placeholder="Votre nom et prénom" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#e89d1b] outline-none transition-all" 
                />
              </div>
            )}

            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Identifiant / E-mail</label>
              <input 
                type="email" 
                placeholder="client@email.dz" 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#e89d1b] outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Mot de passe</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#e89d1b] outline-none transition-all" 
              />
            </div>

            <button 
              type="submit"
              className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 text-white mt-4 ${isLoginMode ? 'bg-[#5cb85c] shadow-green-100 hover:bg-green-600' : 'bg-[#e89d1b] shadow-orange-100 hover:bg-orange-600'}`}
            >
              {isLoginMode ? 'Accéder à mon espace 🔒' : 'Confirmer l\'inscription'}
            </button>
          </form>

          {/* Section Bas de page : Mot de passe oublié PUIS Créer un compte */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center flex flex-col gap-3">
            
            {/* 1. Mot de passe oublié (priorité haute en mode login) */}
            {isLoginMode && (
              <button 
                type="button" 
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#e89d1b] transition-colors"
              >
                Mot de passe oublié ?
              </button>
            )}

            {/* 2. Bascule entre Login et Inscription */}
            <button 
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#e89d1b] transition-colors"
            >
              {isLoginMode ? (
                <>Pas encore de compte ? <span className="text-[#e89d1b] ml-1">Créer un compte</span></>
              ) : (
                <>Déjà inscrit ? <span className="text-[#5cb85c] ml-1">Se connecter</span></>
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;