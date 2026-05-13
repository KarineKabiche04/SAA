import React, { useState, useEffect } from 'react';

import TopBar from './components/TopBar';
import MainHeader from './components/MainHeader';
import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DevisStepByStep from './components/DevisStepByStep';
import Decsinistre from './components/Decsinistre';

/**
 * APPLICATION SAA - ORASS WEB SUITE v2.0
 * FRONTEND CLIENT
 */

// ─────────────────────────────────────────────────────────────
// VUES CLIENT
// ─────────────────────────────────────────────────────────────
const VIEWS = {
  HOME: 'home',
  AUTH: 'auth',
  SELECTION: 'selection',
  STEP_AUTO: 'step-auto',
  DASHBOARD: 'dashboard',
  SINISTRE: 'sinistre',
};

const IS_DEV = import.meta.env.DEV;

// ─────────────────────────────────────────────────────────────
// MODAL AUTH
// ─────────────────────────────────────────────────────────────
function AuthModal({ onSuccess, onClose, initialMode = 'login' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">

      <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full mx-4 p-2">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-slate-400 transition-all font-bold"
        >
          ✕
        </button>

        <div className="bg-[#e89d1b]/10 border border-[#e89d1b]/30 rounded-2xl px-4 py-3 mb-2 mx-2 mt-2">

          <p className="text-[10px] font-black uppercase tracking-widest text-[#e89d1b] text-center">
            📋 Créez un compte pour obtenir votre devis complet
          </p>

          <p className="text-[9px] text-slate-500 text-center mt-1">
            Imprimez, payez ou sauvegardez votre devis en toute sécurité
          </p>

        </div>

        <Login
          key={initialMode}
          initialMode={initialMode}
          onLoginSuccess={onSuccess}
          onSignupSuccess={onSuccess}
        />

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// APP CLIENT
// ─────────────────────────────────────────────────────────────
function App() {

  const [currentView, setCurrentView] = useState(VIEWS.HOME);

  const [authMode, setAuthMode] = useState('login');

  const [isLoading, setIsLoading] = useState(false);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [dossiersList, setDossiersList] = useState([]);

  const [sinistresList, setSinistresList] = useState([]);

  const [pendingDevisData, setPendingDevisData] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);

  // ─────────────────────────────────────────────────────────
  // LOADER
  // ─────────────────────────────────────────────────────────
  useEffect(() => {

    if (!isLoading) return;

    const t = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(t);

  }, [isLoading]);

  // ─────────────────────────────────────────────────────────
  // CHARGEMENT DONNÉES CLIENT
  // ─────────────────────────────────────────────────────────
  useEffect(() => {

    if (!user) return;

    const token = localStorage.getItem('token');

    // DOSSIERS CLIENT
    fetch('http://localhost:3001/api/devis/mes-devis', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {

          setDossiersList(
            data.map(d => {
              try {
                return JSON.parse(d.contenu);
              } catch {
                return null;
              }
            }).filter(Boolean)
          );

        }
      })
      .catch(console.error);

    // SINISTRES CLIENT
    fetch('http://localhost:3001/api/sinistres/mes-sinistres', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSinistresList(data);
        }
      })
      .catch(console.error);

  }, [user]);

  // ─────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────
  const navigate = (view) => {

    setIsLoading(true);

    setTimeout(() => {
      setCurrentView(view);
    }, 800);

  };

  // ─────────────────────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────────────────────
  const handleGoToAuth = (mode = 'login') => {
    setAuthMode(mode);
    setCurrentView(VIEWS.AUTH);
  };

  const handleAuthSuccess = (userData) => {

    setUser(userData);

    localStorage.setItem('user', JSON.stringify(userData));

    navigate(VIEWS.DASHBOARD);

  };

  // ─────────────────────────────────────────────────────────
  // AUTH MODAL SUCCESS
  // ─────────────────────────────────────────────────────────
  const handleAuthModalSuccess = async (userData) => {

    setUser(userData);

    setShowAuthModal(false);

    if (pendingDevisData) {

      try {

        const token = localStorage.getItem('token');

        await fetch('http://localhost:3001/api/devis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            contenu: pendingDevisData
          })
        });

        setPendingDevisData(null);

        navigate(VIEWS.DASHBOARD);

      } catch (err) {

        alert('Erreur lors de la sauvegarde du devis');

      }

    } else {

      navigate(VIEWS.DASHBOARD);

    }

  };

  // ─────────────────────────────────────────────────────────
  // SAUVEGARDE DOSSIER
  // ─────────────────────────────────────────────────────────
  const handleSaveNewDossier = async (data) => {

    if (user) {

      try {

        const token = localStorage.getItem('token');

        await fetch('http://localhost:3001/api/devis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            contenu: data
          })
        });

        navigate(VIEWS.DASHBOARD);

      } catch (err) {

        alert('Erreur lors de la sauvegarde du devis');

      }

    } else {

      setPendingDevisData(data);

      setShowAuthModal(true);

    }

  };

  // ─────────────────────────────────────────────────────────
  // SAUVEGARDE SINISTRE
  // ─────────────────────────────────────────────────────────
  const handleSaveSinistre = async (data) => {

    try {

      const token = localStorage.getItem('token');

      await fetch('http://localhost:3001/api/sinistres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          contenu: data
        })
      });

      navigate(VIEWS.DASHBOARD);

    } catch (err) {

      alert('Erreur lors de la sauvegarde du sinistre');

    }

  };

  // ─────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────
  const handleLogout = () => {

    setUser(null);

    localStorage.removeItem('token');

    localStorage.removeItem('user');

    setCurrentView(VIEWS.HOME);

  };

  // ─────────────────────────────────────────────────────────
  // LOADER SCREEN
  // ─────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (

    <div className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-900">

      {/* HOME */}
      {currentView === VIEWS.HOME && (

        <div className="animate-fade-in">

          <TopBar />

          <MainHeader
            onLoginClick={() => handleGoToAuth('login')}
          />

          <Navbar />

          <HeroSlider
            onLoginClick={handleGoToAuth}
            onDevisClick={() => setCurrentView(VIEWS.SELECTION)}
          />

          <main>
            <ProductGrid
              onDevisClick={() => setCurrentView(VIEWS.SELECTION)}
            />
          </main>

          <Footer />

        </div>
      )}

      {/* AUTH */}
      {currentView === VIEWS.AUTH && (

        <div className="animate-fade-in min-h-screen bg-[#f8fafc] flex items-center justify-center relative overflow-hidden">

          <button
            onClick={() => setCurrentView(VIEWS.HOME)}
            className="absolute top-8 left-8 z-50 flex items-center gap-3 text-slate-400 hover:text-[#e89d1b] transition-all group"
          >

            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#e89d1b]">
              ←
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest">
              Quitter
            </span>

          </button>

          <Login
            key={authMode}
            initialMode={authMode}
            onLoginSuccess={handleAuthSuccess}
            onSignupSuccess={handleAuthSuccess}
          />

        </div>
      )}

      {/* SELECTION */}
      {currentView === VIEWS.SELECTION && (

        <div className="animate-fade-in bg-slate-50 min-h-screen relative">

          <DevisStepByStep
            user={user}
            onSaveToDashboard={handleSaveNewDossier}
            onGoHome={() => setCurrentView(VIEWS.HOME)}
          />

          {showAuthModal && (
            <AuthModal
              initialMode="signup"
              onSuccess={handleAuthModalSuccess}
              onClose={() => {
                setShowAuthModal(false);
                setPendingDevisData(null);
              }}
            />
          )}

        </div>
      )}

      {/* SINISTRE */}
      {currentView === VIEWS.SINISTRE && (

        <div className="animate-fade-in bg-slate-50 min-h-screen">

          <div className="sticky top-0 z-40 bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-4 shadow-sm">

            <button
              onClick={() => navigate(VIEWS.DASHBOARD)}
              className="flex items-center gap-2 text-slate-400 hover:text-[#e89d1b] transition-all group"
            >

              <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#e89d1b] text-sm">
                ←
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest">
                Retour au dashboard
              </span>

            </button>

            <div className="ml-auto bg-red-50 border border-red-200 rounded-xl px-4 py-1">

              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                🚨 Déclaration de sinistre
              </span>

            </div>

          </div>

          <Decsinistre onSave={handleSaveSinistre} />

        </div>
      )}

      {/* DASHBOARD CLIENT */}
      {currentView === VIEWS.DASHBOARD && (

        <div className="animate-fade-in">

          <Dashboard
            dossiers={dossiersList}
            sinistres={sinistresList}
            user={user}
            onLogout={handleLogout}
            onNewDevis={() => setCurrentView(VIEWS.SELECTION)}
            onDeclareSinistre={() => navigate(VIEWS.SINISTRE)}
          />

        </div>
      )}

    </div>
  );
}

export default App;