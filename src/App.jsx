import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import MainHeader from './components/MainHeader';
import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import Login from './components/Login';
import DevisStepByStep from './components/DevisStepByStep';
import Dashboard from './components/Dashboard';

/**
 * APPLICATION SAA - ORASS WEB SUITE
 * Version Intégrale - Master 2 SI Special Edition
 */
function App() {
  // Navigation State : 'home', 'auth', 'selection', 'step-auto', 'dashboard'
  const [currentView, setCurrentView] = useState('home'); 
  const [authMode, setAuthMode] = useState('login'); // 'login' ou 'signup'
  const [isLoading, setIsLoading] = useState(false);

  // Effet pour simuler un chargement entre les vues (très important pour le look SI)
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // HANDLERS : NAVIGATION & AUTH
  const handleGoToAuth = (mode) => {
    setAuthMode(mode);
    setCurrentView('auth');
  };

  const handleAuthSuccess = () => {
    setIsLoading(true);
    setCurrentView('selection'); 
  };

  const handleTypeSelected = (type) => {
    if (type === 'auto') {
      setIsLoading(true);
      setCurrentView('step-auto');
    }
  };

  const handleFinalFinish = () => {
    setIsLoading(true);
    setCurrentView('dashboard'); 
  };

  const handleGoHome = () => {
    setCurrentView('home');
  };

  // COMPOSANT DE CHARGEMENT (SQUELETTE ORASS)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="bg-[#e89d1b] p-4 rounded-2xl font-black text-white italic text-2xl animate-bounce shadow-2xl">SAA</div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Initialisation du module ORASS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* 1. VUE ACCUEIL : Landing Page Complète */}
      {currentView === 'home' && (
        <div className="animate-fade-in">
          <TopBar />
          <MainHeader onLoginClick={() => handleGoToAuth('login')} />
          <Navbar />
          <HeroSlider 
            onLoginClick={(mode) => handleGoToAuth(mode)} 
            onDevisClick={() => {
                // Si on clique sur devis sans être connecté, on peut rediriger vers auth ou selection
                setCurrentView('selection'); 
            }} 
          />
          <main>
            <ProductGrid onDevisClick={() => setCurrentView('selection')} />
          </main>
          <Footer />
        </div>
      )}

      {/* 2. VUE AUTHENTIFICATION : Login / Registration */}
      {currentView === 'auth' && (
        <div className="animate-fade-in min-h-screen bg-[#f8fafc] flex items-center justify-center relative overflow-hidden">
            {/* Décoration en arrière-plan */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-slate-100 rounded-full blur-3xl opacity-50" />

            <button 
                onClick={handleGoHome}
                className="absolute top-8 left-8 z-50 flex items-center gap-3 text-slate-400 hover:text-[#e89d1b] transition-all group"
            >
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#e89d1b]">
                    <span className="text-sm">←</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Retour Accueil</span>
            </button>
            
            <Login 
                key={authMode} 
                initialMode={authMode} 
                onSignupSuccess={handleAuthSuccess} 
                onLoginSuccess={handleAuthSuccess} 
            />
        </div>
      )}

      {/* 3. SÉLECTION DU PRODUIT : Post-Authentification */}
      {currentView === 'selection' && (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 md:p-12 animate-fade-in relative">
          <div className="max-w-6xl w-full">
            <div className="text-center mb-16">
                <span className="bg-orange-100 text-[#e89d1b] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Portail Client</span>
                <h2 className="text-4xl md:text-6xl font-black italic uppercase text-slate-900 tracking-tighter leading-none">
                    Que souhaitez-vous <br /> <span className="text-[#e89d1b]">assurer aujourd'hui ?</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* PRODUIT AUTOMOBILE */}
                <button 
                onClick={() => handleTypeSelected('auto')} 
                className="group relative bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200 hover:shadow-orange-200 border-2 border-transparent hover:border-[#e89d1b] transition-all flex flex-col items-center text-center"
                >
                    <div className="text-7xl mb-8 group-hover:scale-110 transition-transform duration-500">🚗</div>
                    <h3 className="font-black uppercase text-lg tracking-tight text-slate-800">Assurance Auto</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mt-3 tracking-widest">Module ORASS V.3</p>
                    <div className="mt-8 bg-[#e89d1b] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all">Lancer le Devis</div>
                </button>

                {/* HABITATION (LOCK) */}
                <div className="relative bg-slate-50/50 p-12 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center text-center opacity-60">
                    <div className="absolute top-6 right-8 bg-slate-200 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500">Bientôt</div>
                    <div className="text-7xl mb-8 grayscale">🏠</div>
                    <h3 className="font-black uppercase text-lg tracking-tight text-slate-400">Habitation</h3>
                    <p className="text-slate-300 text-[10px] font-bold uppercase mt-3">Indisponible</p>
                </div>

                {/* PLAISANCE (LOCK) */}
                <div className="relative bg-slate-50/50 p-12 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center text-center opacity-60">
                    <div className="absolute top-6 right-8 bg-slate-200 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500">Bientôt</div>
                    <div className="text-7xl mb-8 grayscale">🚤</div>
                    <h3 className="font-black uppercase text-lg tracking-tight text-slate-400">Plaisance</h3>
                    <p className="text-slate-300 text-[10px] font-bold uppercase mt-3">Indisponible</p>
                </div>
            </div>

            <div className="mt-16 text-center">
                <button onClick={handleGoHome} className="text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.3em] transition-colors">
                    Déconnexion de la session sécurisée
                </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TUNNEL TECHNIQUE : Saisie Devis Automobile */}
      {currentView === 'step-auto' && (
        <div className="animate-fade-in bg-slate-50 min-h-screen">
          <DevisStepByStep 
            onComplete={handleFinalFinish} 
            onGoHome={handleGoHome}
          />
        </div>
      )}

      {/* 5. DASHBOARD FINAL / MON PROFIL */}
      {currentView === 'dashboard' && (
        <div className="animate-fade-in">
          <Dashboard 
            onLogout={handleGoHome} 
            onNewDevis={() => setCurrentView('selection')} 
          />
        </div>
      )}

    </div>
  );
}

export default App;