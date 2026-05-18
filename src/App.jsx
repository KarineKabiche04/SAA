import React, { useState, useEffect } from 'react';

/* ───────────────── COMPONENTS ───────────────── */
import TopBar         from './components/TopBar';
import MainHeader     from './components/MainHeader';
import Navbar         from './components/Navbar';
import HeroSlider     from './components/HeroSlider';
import ProductGrid    from './components/ProductGrid';
import Footer         from './components/Footer';

import Login          from './components/Login';
import Dashboard      from './components/Dashboard';
import DevisStepByStep from './components/DevisStepByStep';
import Decsinistre    from './components/Decsinistre';

/* ───────────────── PAGES PRODUITS ───────────────── */
import AutoMoto        from './components/AutoMoto';
import Habitation      from './components/Habitation';
import Sante           from './components/Sante';
import CyberRisques    from './components/CyberRisques';
import BateauPlaisance from './components/BateauPlaisance';

/* ───────────────── CONFIG API ───────────────── */
const API = 'http://localhost:3001/api';

/* ───────────────── VIEWS ───────────────── */
const VIEWS = {
  HOME:      'home',
  AUTH:      'auth',
  SELECTION: 'selection',
  DASHBOARD: 'dashboard',
  SINISTRE:  'sinistre',
};

/* =========================================================
   APP
========================================================= */
export default function App() {

  const [currentView, setCurrentView] = useState(VIEWS.HOME);
  const [activePage,  setActivePage]  = useState(null);
  const [authMode,    setAuthMode]    = useState('login');
  const [isLoading,   setIsLoading]   = useState(false);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  /* ─── Loader ─── */
  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, [isLoading]);

  const navigate = (view) => {
    setIsLoading(true);
    setTimeout(() => setCurrentView(view), 800);
  };

  /* ─── Navigation ─── */
  const handleNavbarNavigation = (page) => setActivePage(page);
  const handleHomeNavigation   = () => { setActivePage(null); setCurrentView(VIEWS.HOME); };

  /* ─── Auth ─── */
  const handleGoToAuth = (mode = 'login') => {
    setAuthMode(mode);
    setCurrentView(VIEWS.AUTH);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    navigate(VIEWS.DASHBOARD);
  };

  /* ─── Sinistre ─── */
  const handleSaveSinistre = async (data) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/sinistres`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type:    'Accident automobile',
          lieu:    data.lieu || '',
          date:    data.date || new Date().toISOString().split('T')[0],
          contenu: JSON.stringify(data),
        }),
      });
      navigate(VIEWS.DASHBOARD);
    } catch {
      alert('Erreur lors de la sauvegarde du sinistre');
    }
  };

  /* ─── Logout ─── */
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView(VIEWS.HOME);
  };

  /* ─── Loader screen ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="bg-[#e89d1b] p-6 rounded-[2rem] font-black text-white italic text-3xl animate-bounce shadow-2xl">SAA</div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">
          Initialisation du moteur ORASS Decision Support...
        </p>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-900">

      {/* ── HOME ── */}
      {currentView === VIEWS.HOME && (
        <div className="animate-fade-in">

          <TopBar />
          <MainHeader onLoginClick={() => handleGoToAuth('login')} />
          <Navbar
            activePage={activePage}
            onNavigate={handleNavbarNavigation}
            onHome={handleHomeNavigation}
          />

          {activePage === null && (
            <>
              <HeroSlider
                onLoginClick={handleGoToAuth}
                onDevisClick={() => setCurrentView(VIEWS.SELECTION)}
                onPageClick={(page) => setActivePage(page)}
              />
              <main>
                <ProductGrid onDevisClick={() => setCurrentView(VIEWS.SELECTION)} />
              </main>
            </>
          )}

          {activePage === 'auto'       && <AutoMoto        onDevisClick={() => setCurrentView(VIEWS.SELECTION)} />}
          {activePage === 'habitation' && <Habitation      onDevisClick={() => setCurrentView(VIEWS.SELECTION)} />}
          {activePage === 'sante'      && <Sante           onDevisClick={() => setCurrentView(VIEWS.SELECTION)} />}
          {activePage === 'cyber'      && <CyberRisques    onDevisClick={() => setCurrentView(VIEWS.SELECTION)} />}
          {activePage === 'bateau'     && <BateauPlaisance onDevisClick={() => setCurrentView(VIEWS.SELECTION)} />}

          <Footer />
        </div>
      )}

      {/* ── AUTH ── */}
      {currentView === VIEWS.AUTH && (
        <div className="animate-fade-in min-h-screen bg-[#f8fafc] flex items-center justify-center relative overflow-hidden">
          <button
            onClick={() => setCurrentView(VIEWS.HOME)}
            className="absolute top-8 left-8 z-50 flex items-center gap-3 text-slate-400 hover:text-[#e89d1b] transition-all group"
          >
            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#e89d1b]">←</div>
            <span className="text-[10px] font-black uppercase tracking-widest">Quitter</span>
          </button>
          <Login
            key={authMode}
            initialMode={authMode}
            onLoginSuccess={handleAuthSuccess}
            onSignupSuccess={handleAuthSuccess}
          />
        </div>
      )}

      {/* ── DEVIS ── */}
      {currentView === VIEWS.SELECTION && (
        <div className="animate-fade-in bg-slate-50 min-h-screen">
          <DevisStepByStep onGoHome={() => setCurrentView(VIEWS.HOME)} />
        </div>
      )}

      {/* ── SINISTRE ── */}
      {currentView === VIEWS.SINISTRE && (
        <div className="animate-fade-in bg-slate-50 min-h-screen">
          <div className="sticky top-0 z-40 bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-4 shadow-sm">
            <button
              onClick={() => navigate(VIEWS.DASHBOARD)}
              className="flex items-center gap-2 text-slate-400 hover:text-[#e89d1b] transition-all group"
            >
              <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#e89d1b] text-sm">←</div>
              <span className="text-[10px] font-black uppercase tracking-widest">Retour au dashboard</span>
            </button>
          </div>
          <Decsinistre onSave={handleSaveSinistre} />
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {currentView === VIEWS.DASHBOARD && (
        <div className="animate-fade-in">
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onNewDevis={() => navigate(VIEWS.SELECTION)}
            onDeclareSinistre={() => navigate(VIEWS.SINISTRE)}
          />
        </div>
      )}

    </div>
  );
}