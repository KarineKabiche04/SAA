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
import DashboardAdmin from './components/DashboardAdmin'; // Import du nouveau module

/**
 * APPLICATION SAA - ORASS WEB SUITE v2.0
 * Master 2 SI - Système d'Aide à la Décision
 */
function App() {
  // Navigation State : 'home', 'auth', 'selection', 'step-auto', 'dashboard', 'admin-dashboard'
  const [currentView, setCurrentView] = useState('home'); 
  const [authMode, setAuthMode] = useState('login'); 
  const [isLoading, setIsLoading] = useState(false);
  
  // Base de données locale partagée entre le client et l'admin
  const [dossiersList, setDossiersList] = useState([]);

  // Simulation de chargement SI
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // --- HANDLERS ---
  
  const handleGoToAuth = (mode) => {
    setAuthMode(mode);
    setCurrentView('auth');
  };

  const handleAuthSuccess = (userData) => {
    setIsLoading(true);
    // Logique SI : Si l'utilisateur est admin (ex: contient @saa.dz), on va vers l'admin
    if (userData?.isAdmin || userData?.email?.includes('@saa.dz')) {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('selection');
    }
  };

  const handleSaveNewDossier = (data) => {
    setIsLoading(true);
    // On stocke le dossier avec un timestamp pour les stats
    const nouveauDossier = { ...data, date: new Date().toISOString() };
    setDossiersList(prev => [nouveauDossier, ...prev]);
    setCurrentView('dashboard');
  };

  const handleGoHome = () => {
    setCurrentView('home');
  };

  // --- RENDU ÉCRAN DE CHARGEMENT ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="bg-[#e89d1b] p-6 rounded-[2rem] font-black text-white italic text-3xl animate-bounce shadow-2xl">SAA</div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">Initialisation du moteur ORASS Decision Support...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* 1. VUE ACCUEIL */}
      {currentView === 'home' && (
        <div className="animate-fade-in">
          <TopBar />
          <MainHeader onLoginClick={() => handleGoToAuth('login')} />
          <Navbar />
          <HeroSlider 
            onLoginClick={(mode) => handleGoToAuth(mode)} 
            onDevisClick={() => setCurrentView('selection')} 
          />
          <main>
            <ProductGrid onDevisClick={() => setCurrentView('selection')} />
          </main>
          <Footer />
        </div>
      )}

      {/* 2. VUE AUTHENTIFICATION */}
      {currentView === 'auth' && (
        <div className="animate-fade-in min-h-screen bg-[#f8fafc] flex items-center justify-center relative overflow-hidden">
            <button onClick={handleGoHome} className="absolute top-8 left-8 z-50 flex items-center gap-3 text-slate-400 hover:text-[#e89d1b] transition-all group">
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#e89d1b]">←</div>
                <span className="text-[10px] font-black uppercase tracking-widest">Quitter</span>
            </button>
            <Login 
                key={authMode} 
                initialMode={authMode} 
                onSignupSuccess={handleAuthSuccess} 
                onLoginSuccess={handleAuthSuccess} 
            />
        </div>
      )}

      {/* 3. SÉLECTION DU PRODUIT (Client) */}
      {currentView === 'selection' && (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="max-w-6xl w-full text-center">
            <span className="bg-orange-100 text-[#e89d1b] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Portail Client Sécurisé</span>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase text-slate-900 tracking-tighter mb-12">
                Choisir un <span className="text-[#e89d1b]">Contrat</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <button onClick={() => { setIsLoading(true); setCurrentView('step-auto'); }} className="group bg-white p-12 rounded-[3rem] shadow-2xl hover:border-[#e89d1b] border-2 border-transparent transition-all">
                    <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">🚗</div>
                    <h3 className="font-black uppercase text-lg text-slate-800">Assurance Auto</h3>
                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Système Expert v3.0</p>
                </button>
                <div className="bg-slate-50 p-12 rounded-[3rem] opacity-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center grayscale">
                    <div className="text-7xl mb-6">🏠</div>
                    <span className="font-black uppercase text-slate-400">Habitation</span>
                </div>
                <div className="bg-slate-50 p-12 rounded-[3rem] opacity-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center grayscale">
                    <div className="text-7xl mb-6">🚤</div>
                    <span className="font-black uppercase text-slate-400">Plaisance</span>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TUNNEL TECHNIQUE (SAISIE DEVIS) */}
      {currentView === 'step-auto' && (
        <div className="animate-fade-in bg-slate-50 min-h-screen">
          <DevisStepByStep 
            onSaveToDashboard={handleSaveNewDossier} // Correction du nom de la prop
            onGoHome={() => setCurrentView('selection')}
          />
        </div>
      )}

      {/* 5. DASHBOARD CLIENT */}
      {currentView === 'dashboard' && (
        <div className="animate-fade-in">
          <Dashboard 
            dossiers={dossiersList} 
            onLogout={handleGoHome} 
            onNewDevis={() => setCurrentView('selection')} 
          />
        </div>
      )}

      {/* 6. DASHBOARD ADMIN (L'intelligence du projet) */}
      {currentView === 'admin-dashboard' && (
        <div className="animate-fade-in">
          <DashboardAdmin 
            dossiers={dossiersList} 
            onLogout={handleGoHome} 
          />
        </div>
      )}

    </div>
  );
}

export default App;