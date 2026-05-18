import React, { useState } from 'react';

import LoginAgent     from './components/LoginAgent';
import DashboardAgent from './components/DashboardAgent';
import DashboardAdmin from './components/DashboardAdmin';

export default function App() {

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });

  const [loading, setLoading] = useState(false);

  // ─── Login ────────────────────────────────────────────────────────────────
  const handleLoginSuccess = (userData) => {
    setLoading(true);
    setTimeout(() => {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setLoading(false);
    }, 1200);
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // ─── Loader ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex flex-col items-center justify-center">
        <div className="bg-orange-500 p-6 rounded-[2rem] font-black text-white italic text-3xl animate-bounce shadow-2xl">
          SAA
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 animate-pulse">
          Initialisation du portail sécurisé...
        </p>
      </div>
    );
  }

  // ─── Login screen ─────────────────────────────────────────────────────────
  if (!user) {
    return <LoginAgent onLoginSuccess={handleLoginSuccess} />;
  }

  // ─── Admin ────────────────────────────────────────────────────────────────
  // DashboardAdmin gère ses propres fetch (users, stats, polices, sinistres)
  if (user.role === 'ADMIN' || user.role === 'admin') {
    return <DashboardAdmin user={user} onLogout={handleLogout} />;
  }

  // ─── Agent ────────────────────────────────────────────────────────────────
  // DashboardAgent gère ses propres fetch (demandes, sinistres, polices, messagerie)
  return <DashboardAgent onLogout={handleLogout} />;
}