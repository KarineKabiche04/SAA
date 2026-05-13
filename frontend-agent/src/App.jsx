import React, { useState, useEffect } from 'react';

import LoginAgent from './components/LoginAgent';
import DashboardAgent from './components/DashboardAgent';
import DashboardAdmin from './components/DashboardAdmin';

function App() {

  // ─────────────────────────────────────────────
  // SESSION UTILISATEUR
  // ─────────────────────────────────────────────
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('agent_user')) || null
  );

  // ─────────────────────────────────────────────
  // LOADING SCREEN
  // ─────────────────────────────────────────────
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────
  const [dossiers, setDossiers] = useState([]);
  const [sinistres, setSinistres] = useState([]);
  const [users, setUsers] = useState([]);

  // ─────────────────────────────────────────────
  // CHARGEMENT DES DONNÉES
  // ─────────────────────────────────────────────
  useEffect(() => {

    if (!user) return;

    const token = localStorage.getItem('agent_token');

    // ───── Tous les devis ─────
    fetch('http://localhost:3001/api/devis/all', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDossiers(data);
        }
      })
      .catch(console.error);

    // ───── Tous les sinistres ─────
    fetch('http://localhost:3001/api/sinistres/all', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSinistres(data);
        }
      })
      .catch(console.error);

    // ───── Tous les utilisateurs (ADMIN seulement) ─────
    if (user.role === 'admin') {

      fetch('http://localhost:3001/api/users/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setUsers(data);
          }
        })
        .catch(console.error);
    }

  }, [user]);

  // ─────────────────────────────────────────────
  // LOGIN SUCCESS
  // ─────────────────────────────────────────────
  const handleLoginSuccess = (userData) => {

    setLoading(true);

    setTimeout(() => {

      setUser(userData);

      localStorage.setItem(
        'agent_user',
        JSON.stringify(userData)
      );

      setLoading(false);

    }, 1200);
  };

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────
  const handleLogout = () => {

    localStorage.removeItem('agent_token');
    localStorage.removeItem('agent_user');

    setUser(null);
  };

  // ─────────────────────────────────────────────
  // LOADER
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // LOGIN SCREEN
  // ─────────────────────────────────────────────
  if (!user) {

    return (
      <LoginAgent
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // ─────────────────────────────────────────────
  // DASHBOARD ADMIN
  // ─────────────────────────────────────────────
  if (user.role === 'admin') {

    return (
      <DashboardAdmin
        user={user}
        dossiers={dossiers}
        sinistres={sinistres}
        users={users}
        onLogout={handleLogout}
      />
    );
  }

  // ─────────────────────────────────────────────
  // DASHBOARD AGENT
  // ─────────────────────────────────────────────
  return (
    <DashboardAgent
      user={user}
      dossiers={dossiers}
      sinistres={sinistres}
      onLogout={handleLogout}
    />
  );
}

export default App;