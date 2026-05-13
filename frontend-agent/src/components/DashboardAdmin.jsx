import React, { useEffect, useState } from 'react';

const DashboardAdmin = ({ user, onLogout }) => {

  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'agent'
  });

  const [passwordData, setPasswordData] = useState({
    userId: '',
    newPassword: ''
  });

  // ─────────────────────────────────────────────
  // LOAD USERS
  // ─────────────────────────────────────────────
  useEffect(() => {

    fetchUsers();

  }, []);

  const fetchUsers = async () => {

    try {

      const token = localStorage.getItem('agent_token');

      const res = await fetch(
        'http://localhost:3001/api/users/all',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setUsers(data);
      }

    } catch (err) {

      console.error(err);

    }
  };

  // ─────────────────────────────────────────────
  // CREATE ACCOUNT
  // ─────────────────────────────────────────────
  const handleCreateUser = async (e) => {

    e.preventDefault();

    try {

      const token = localStorage.getItem('agent_token');

      const res = await fetch(
        'http://localhost:3001/api/users/create-agent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert('Compte créé');

      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: 'agent'
      });

      fetchUsers();

    } catch (err) {

      alert('Erreur serveur');

    }
  };

  // ─────────────────────────────────────────────
  // CHANGE PASSWORD
  // ─────────────────────────────────────────────
  const handleChangePassword = async (e) => {

    e.preventDefault();

    try {

      const token = localStorage.getItem('agent_token');

      const res = await fetch(
        `http://localhost:3001/api/users/change-password/${passwordData.userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            password: passwordData.newPassword
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert('Mot de passe modifié');

      setPasswordData({
        userId: '',
        newPassword: ''
      });

    } catch (err) {

      alert('Erreur serveur');

    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white flex">

      {/* SIDEBAR */}
      <aside className="w-72 bg-[#111827] border-r border-white/5 p-6">

        <div className="mb-10">

          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl font-black italic mb-4">
            SAA
          </div>

          <h1 className="text-2xl font-black italic">
            ADMIN PANEL
          </h1>

          <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-2">
            Gestion des comptes
          </p>

        </div>

        <div className="bg-[#1a2235] rounded-2xl p-4 mb-8">

          <p className="text-[10px] uppercase tracking-widest text-slate-500">
            Connecté
          </p>

          <h3 className="font-black mt-2">
            {user.fullName}
          </h3>

          <span className="text-orange-400 text-[10px] uppercase tracking-widest">
            ADMIN
          </span>

        </div>

        <button
          onClick={onLogout}
          className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-2xl text-[10px] uppercase tracking-widest font-black"
        >
          Déconnexion
        </button>

      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">

        {/* TITLE */}
        <div className="mb-10">

          <h1 className="text-5xl font-black italic mb-3">
            Tableau de bord Admin
          </h1>

          <p className="text-slate-500 uppercase tracking-widest text-[10px]">
            Gestion des agents et administrateurs
          </p>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-6 mb-10">

          <div className="bg-[#111827] rounded-3xl p-8">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-3">
              Comptes
            </p>

            <h2 className="text-5xl font-black text-orange-500">
              {users.length}
            </h2>
          </div>

          <div className="bg-[#111827] rounded-3xl p-8">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-3">
              Agents
            </p>

            <h2 className="text-5xl font-black text-cyan-400">
              {users.filter(u => u.role === 'agent').length}
            </h2>
          </div>

          <div className="bg-[#111827] rounded-3xl p-8">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-3">
              Admins
            </p>

            <h2 className="text-5xl font-black text-red-400">
              {users.filter(u => u.role === 'admin').length}
            </h2>
          </div>

        </div>

        {/* CREATE USER */}
        <div className="bg-[#111827] rounded-3xl p-8 mb-10">

          <h2 className="text-2xl font-black mb-6">
            Créer un compte
          </h2>

          <form
            onSubmit={handleCreateUser}
            className="grid grid-cols-2 gap-5"
          >

            <input
              type="text"
              placeholder="Nom complet"
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fullName: e.target.value
                })
              }
              className="bg-[#1a2235] rounded-2xl px-5 py-4 outline-none"
            />

            <input
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value
                })
              }
              className="bg-[#1a2235] rounded-2xl px-5 py-4 outline-none"
            />

            <input
              type="password"
              placeholder="Mot de passe"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value
                })
              }
              className="bg-[#1a2235] rounded-2xl px-5 py-4 outline-none"
            />

            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value
                })
              }
              className="bg-[#1a2235] rounded-2xl px-5 py-4 outline-none"
            >
              <option value="agent">
                Agent
              </option>

              <option value="admin">
                Admin
              </option>
            </select>

            <button
              type="submit"
              className="col-span-2 py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black uppercase tracking-widest text-[10px]"
            >
              Créer le compte
            </button>

          </form>

        </div>

        {/* CHANGE PASSWORD */}
        <div className="bg-[#111827] rounded-3xl p-8 mb-10">

          <h2 className="text-2xl font-black mb-6">
            Modifier un mot de passe
          </h2>

          <form
            onSubmit={handleChangePassword}
            className="grid grid-cols-2 gap-5"
          >

            <select
              required
              value={passwordData.userId}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  userId: e.target.value
                })
              }
              className="bg-[#1a2235] rounded-2xl px-5 py-4 outline-none"
            >

              <option value="">
                Sélectionner un compte
              </option>

              {users.map((u) => (
                <option
                  key={u.id}
                  value={u.id}
                >
                  {u.fullName} ({u.role})
                </option>
              ))}

            </select>

            <input
              type="password"
              placeholder="Nouveau mot de passe"
              required
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value
                })
              }
              className="bg-[#1a2235] rounded-2xl px-5 py-4 outline-none"
            />

            <button
              type="submit"
              className="col-span-2 py-4 bg-cyan-500 hover:bg-cyan-600 rounded-2xl font-black uppercase tracking-widest text-[10px]"
            >
              Modifier le mot de passe
            </button>

          </form>

        </div>

        {/* USERS */}
        <div className="bg-[#111827] rounded-3xl p-8">

          <h2 className="text-2xl font-black mb-6">
            Comptes existants
          </h2>

          <div className="space-y-4">

            {users.map((u) => (

              <div
                key={u.id}
                className="bg-[#1a2235] rounded-2xl p-5 flex justify-between items-center"
              >

                <div>

                  <h3 className="font-black">
                    {u.fullName}
                  </h3>

                  <p className="text-slate-500 text-sm">
                    {u.email}
                  </p>

                </div>

                <span className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black
                  ${u.role === 'admin'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-cyan-500/20 text-cyan-400'
                  }`}
                >
                  {u.role}
                </span>

              </div>

            ))}

          </div>

        </div>

      </main>

    </div>
  );
};

export default DashboardAdmin;