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
import Decsinistre from './components/Decsinistre';

/**
 * APPLICATION SAA - ORASS WEB SUITE v2.0
 * Master 2 SI - Système d'Aide à la Décision
 */

// ─── Constantes de navigation ────────────────────────────────────────────────
const VIEWS = {
  HOME:            'home',
  AUTH:            'auth',
  SELECTION:       'selection',
  STEP_AUTO:       'step-auto',
  SINISTRE:        'sinistre',
  DASHBOARD:       'dashboard',
  ADMIN_DASHBOARD: 'admin-dashboard',
};

const IS_DEV = import.meta.env.DEV;

// ─── Composant modal Auth ────────────────────────────────────────────────────
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

// ─── App principale ──────────────────────────────────────────────────────────
function App() {
  const [currentView, setCurrentView]   = useState(VIEWS.HOME);
  const [authMode, setAuthMode]         = useState('login');
  const [isLoading, setIsLoading]       = useState(false);
const [user, setUser] = useState(() => {
  const saved = localStorage.getItem('user');
  return saved ? JSON.parse(saved) : null;
});
  const [dossiersList, setDossiersList] = useState([]);
  const [sinistresList, setSinistresList] = useState([]);
  const [pendingDevisData, setPendingDevisData] = useState(null);
  const [showAuthModal, setShowAuthModal]       = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, [isLoading]);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const navigate = (view) => {
    setIsLoading(true);
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
    navigate(isAdmin(userData) ? VIEWS.ADMIN_DASHBOARD : VIEWS.DASHBOARD);
  };

  const handleAuthModalSuccess = async (userData) => {
  setUser(userData)
  setShowAuthModal(false)
  if (pendingDevisData) {
    try {
      const token = localStorage.getItem('token')
      await fetch('http://localhost:3001/api/devis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contenu: pendingDevisData })
      })
      setPendingDevisData(null)
      navigate(VIEWS.DASHBOARD)
    } catch (err) {
      alert('Erreur lors de la sauvegarde du devis')
    }
  } else {
    navigate(isAdmin(userData) ? VIEWS.ADMIN_DASHBOARD : VIEWS.DASHBOARD)
  }
}

 const handleSaveNewDossier = async (data) => {
  if (user) {
    try {
      const token = localStorage.getItem('token')
      await fetch('http://localhost:3001/api/devis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contenu: data })
      })
      navigate(VIEWS.DASHBOARD)
    } catch (err) {
      alert('Erreur lors de la sauvegarde du devis')
    }
  } else {
    setPendingDevisData(data)
    setShowAuthModal(true)
  }
}

const handleSaveSinistre = async (data) => {
  try {
    const token = localStorage.getItem('token')
    await fetch('http://localhost:3001/api/sinistres', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ contenu: data })
    })
    navigate(VIEWS.DASHBOARD)
  } catch (err) {
    alert('Erreur lors de la sauvegarde du sinistre')
  }
}
const handleLogout = () => {
  setUser(null);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setCurrentView(VIEWS.HOME);
};

  const handleDevAdminAccess = () => {
    setUser({ email: 'admin@saa.dz', isAdmin: true });
    navigate(VIEWS.ADMIN_DASHBOARD);
  };

  // ─── Loader ──────────────────────────────────────────────────────────────────
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

  // ─── Vues ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-900">

      {/* ── 1. ACCUEIL ── */}
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

      {/* ── 2. AUTHENTIFICATION ── */}
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

      {/* ── 3. SÉLECTION PRODUIT ── */}
      {currentView === VIEWS.SELECTION && (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="max-w-6xl w-full text-center">
            <span className="bg-orange-100 text-[#e89d1b] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">
              {user ? 'Portail Client Sécurisé' : 'Simulateur de Devis — Gratuit & Sans Engagement'}
            </span>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase text-slate-900 tracking-tighter mb-4">
              Choisir un <span className="text-[#e89d1b]">Contrat</span>
            </h2>
            {!user && (
              <p className="text-slate-400 text-sm mb-10">
                Simulez librement votre devis. Un compte vous sera demandé uniquement pour finaliser.
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
              <button
                onClick={() => navigate(VIEWS.STEP_AUTO)}
                className="group bg-white p-12 rounded-[3rem] shadow-2xl hover:border-[#e89d1b] border-2 border-transparent transition-all"
              >
                <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">🚗</div>
                <h3 className="font-black uppercase text-lg text-slate-800">Assurance Auto</h3>
                <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Système Expert v3.0</p>
              </button>
              <div className="bg-slate-50 p-12 rounded-[3rem] opacity-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center grayscale">
                <div className="text-7xl mb-6">🏠</div>
                <span className="font-black uppercase text-slate-400">Habitation</span>
                <span className="text-[9px] text-slate-300 uppercase mt-2">Bientôt disponible</span>
              </div>
              <div className="bg-slate-50 p-12 rounded-[3rem] opacity-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center grayscale">
                <div className="text-7xl mb-6">🚤</div>
                <span className="font-black uppercase text-slate-400">Plaisance</span>
                <span className="text-[9px] text-slate-300 uppercase mt-2">Bientôt disponible</span>
              </div>
            </div>
            <button
              onClick={() => setCurrentView(VIEWS.HOME)}
              className="mt-10 text-slate-400 hover:text-[#e89d1b] text-[10px] font-black uppercase tracking-widest transition-all"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      )}

      {/* ── 4. TUNNEL DEVIS AUTO ── */}
      {currentView === VIEWS.STEP_AUTO && (
        <div className="animate-fade-in bg-slate-50 min-h-screen relative">
          <DevisStepByStep
            user={user}
            onSaveToDashboard={handleSaveNewDossier}
            onGoHome={() => setCurrentView(VIEWS.SELECTION)}
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

      {/* ── 5. DÉCLARATION SINISTRE ── */}
      {currentView === VIEWS.SINISTRE && (
        <div className="animate-fade-in bg-slate-50 min-h-screen">
          {/* Barre de retour */}
          <div className="sticky top-0 z-40 bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-4 shadow-sm">
            <button
              onClick={() => navigate(VIEWS.DASHBOARD)}
              className="flex items-center gap-2 text-slate-400 hover:text-[#e89d1b] transition-all group"
            >
              <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#e89d1b] text-sm">
                ←
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Retour au dashboard</span>
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

      {/* ── 6. DASHBOARD CLIENT ── */}
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

      {/* ── 7. DASHBOARD ADMIN ── */}
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