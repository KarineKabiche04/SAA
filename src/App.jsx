import React, { useState } from 'react';
import TopBar from './components/TopBar';
import MainHeader from './components/MainHeader';
import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import Login from './components/Login';

function App() {
  // État pour afficher ou masquer le formulaire de connexion
  const [showLogin, setShowLogin] = useState(false);
  
  // État pour savoir si on ouvre en mode "Se connecter" ou "Créer un compte"
  const [authMode, setAuthMode] = useState('login');

  // Fonction centrale pour gérer l'ouverture de l'authentification
  const handleAuthOpen = (mode) => {
    setAuthMode(mode); // 'login' ou 'register'
    setShowLogin(true);
  };

  return (
    <div className="App flex flex-col min-h-screen font-sans">
      {showLogin ? (
        /* VUE AUTHENTIFICATION */
        <div className="relative animate-fade-in">
          {/* Bouton de retour flottant */}
          <button 
            onClick={() => setShowLogin(false)}
            className="absolute top-10 left-10 z-50 bg-slate-900 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#e89d1b] transition-all shadow-2xl flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            Retour à l'accueil
          </button>
          
          {/* On passe le mode initial au composant Login */}
          <Login initialMode={authMode} />
        </div>
      ) : (
        /* VUE SITE COMPLET */
        <>
          <TopBar />
          
          {/* Le bouton du Header ouvre la connexion par défaut */}
          <MainHeader onLoginClick={() => handleAuthOpen('login')} />
          
          <Navbar />
          
          {/* Le HeroSlider commande maintenant le mode (Login ou Register) */}
          <HeroSlider onLoginClick={handleAuthOpen} />
          
          <main className="flex-grow">
            <ProductGrid />
          </main>
          
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;