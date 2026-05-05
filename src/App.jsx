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
import DashboardAdmin from './components/DashboardAdmin';

/**
 * APPLICATION SAA - ORASS WEB SUITE v2.0
 * Master 2 SI - Système d'Aide à la Décision
 */

// Constantes de navigation — évite les magic strings
const VIEWS = {
  HOME: 'home',
  AUTH: 'auth',
  SELECTION: 'selection',
  STEP_AUTO: 'step-auto',
  DASHBOARD: 'dashboard',
  ADMIN_DASHBOARD: 'admin-dashboard',
};

const IS_DEV = import.meta.env.DEV;

function App() {
  const [currentView, setCurrentView] = useState(VIEWS.HOME);
  const [authMode, setAuthMode]       = useState('login');
  const [isLoading, setIsLoading]     = useState(false);
  const [user, setUser]               = useState(null); // utilisateur connecté
  const [dossiersList, setDossiersList] = useState([]);

  // Auto-reset du loader
  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, [isLoading]);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const navigate = (view) => {
    setIsLoading(true);
    // useEffect s'occupera du setIsLoading(false)
    // On change la vue après le délai de chargement
    setTimeout(() => setCurrentView(view), 800);
  };

  const isAdmin = (userData) =>
    userData?.isAdmin || userData?.email?.includes('@saa.dz');

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleGoToAuth = (mode = 'login') => {
    setAuthMode(mode);
    setCurrentView(VIEWS.AUTH);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    navigate(isAdmin(userData) ? VIEWS.ADMIN_DASHBOARD : VIEWS.SELECTION);
  };

  const handleSaveNewDossier = (data) => {
    const nouveauDossier = {
      ...data,
      id: crypto.randomUUID(),
      clientEmail: user?.email ?? 'inconnu',
      date: new Date().toISOString(),
    };
    setDossiersList((prev) => [nouveauDossier, ...prev]);
    navigate(VIEWS.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(VIEWS.HOME);
  };

  // Accès rapide admin (dev uniquement)
  const handleDevAdminAccess = () => {
    setUser({ email: 'admin@saa.dz', isAdmin: true });
    navigate(VIEWS.ADMIN_DASHBOARD);
  };

  // ─── Loader ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="bg-[#e89d1b] p-6 rounded-[2rem] font-black text-white italic text-3xl animate-bounce shadow-2xl">
          SAA
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">
          Initialisation du moteur ORASS Decision Support...
        </p>
      </div>
    );
  }

  // ─── Vues ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-900">

      {/* 1. ACCUEIL */}
      {currentView === VIEWS.HOME && (
        <div className="animate-fade-in">
          <TopBar />
          <MainHeader onLoginClick={() => handleGoToAuth('login')} />
          <Navbar />
          <HeroSlider
            onLoginClick={handleGoToAuth}
            onDevisClick={() => setCurrentView(VIEWS.SELECTION)}
          />
          <main>
            <ProductGrid onDevisClick={() => setCurrentView(VIEWS.SELECTION)} />
          </main>
          <Footer />

          {IS_DEV && (
            <button
              onClick={handleDevAdminAccess}
              className="fixed bottom-6 right-6 z-50 bg-slate-900 text-orange-400 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-orange-500 hover:text-white transition-all border border-orange-400/30"
            >
              ⚙️ Dev → Admin
            </button>
          )}
        </div>
      )}

      {/* 2. AUTHENTIFICATION */}
      {currentView === VIEWS.AUTH && (
        <div className="animate-fade-in min-h-screen bg-[#f8fafc] flex items-center justify-center relative overflow-hidden">
          <button
            onClick={() => setCurrentView(VIEWS.HOME)}
            className="absolute top-8 left-8 z-50 flex items-center gap-3 text-slate-400 hover:text-[#e89d1b] transition-all group"
          >
            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#e89d1b]">
              ←
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Quitter</span>
          </button>

          {IS_DEV && (
            <div className="absolute top-8 right-8 bg-slate-900 text-orange-400 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">
              Admin : admin@saa.dz
            </div>
          )}

          <Login
            key={authMode}
            initialMode={authMode}
            onLoginSuccess={handleAuthSuccess}
            onSignupSuccess={handleAuthSuccess}
          />
        </div>
      )}

      {/* 3. SÉLECTION PRODUIT */}
      {currentView === VIEWS.SELECTION && (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="max-w-6xl w-full text-center">
            <span className="bg-orange-100 text-[#e89d1b] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">
              Portail Client Sécurisé
            </span>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase text-slate-900 tracking-tighter mb-12">
              Choisir un <span className="text-[#e89d1b]">Contrat</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Assurance Auto — actif */}
              <button
                onClick={() => navigate(VIEWS.STEP_AUTO)}
                className="group bg-white p-12 rounded-[3rem] shadow-2xl hover:border-[#e89d1b] border-2 border-transparent transition-all"
              >
                <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">🚗</div>
                <h3 className="font-black uppercase text-lg text-slate-800">Assurance Auto</h3>
                <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Système Expert v3.0</p>
              </button>

              {/* Habitation — bientôt */}
              <div className="bg-slate-50 p-12 rounded-[3rem] opacity-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center grayscale">
                <div className="text-7xl mb-6">🏠</div>
                <span className="font-black uppercase text-slate-400">Habitation</span>
                <span className="text-[9px] text-slate-300 uppercase mt-2">Bientôt disponible</span>
              </div>

              {/* Plaisance — bientôt */}
              <div className="bg-slate-50 p-12 rounded-[3rem] opacity-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center grayscale">
                <div className="text-7xl mb-6">🚤</div>
                <span className="font-black uppercase text-slate-400">Plaisance</span>
                <span className="text-[9px] text-slate-300 uppercase mt-2">Bientôt disponible</span>
              </div>
            </div>

            {/* Retour accueil */}
            <button
              onClick={() => setCurrentView(VIEWS.HOME)}
              className="mt-10 text-slate-400 hover:text-[#e89d1b] text-[10px] font-black uppercase tracking-widest transition-all"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      )}

      {/* 4. TUNNEL DEVIS AUTO */}
      {currentView === VIEWS.STEP_AUTO && (
        <div className="animate-fade-in bg-slate-50 min-h-screen">
          <DevisStepByStep
            onSaveToDashboard={handleSaveNewDossier}
            onGoHome={() => setCurrentView(VIEWS.SELECTION)}
          />
        </div>
      )}

      {/* 5. DASHBOARD CLIENT */}
      {currentView === VIEWS.DASHBOARD && (
        <div className="animate-fade-in">
          <Dashboard
            dossiers={dossiersList}
            user={user}
            onLogout={handleLogout}
            onNewDevis={() => setCurrentView(VIEWS.SELECTION)}
          />
        </div>
      )}

      {/* 6. DASHBOARD ADMIN */}
      {currentView === VIEWS.ADMIN_DASHBOARD && (
        <div className="animate-fade-in">
          <DashboardAdmin
            dossiers={dossiersList}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      )}

    </div>
  );
}

export default App;
