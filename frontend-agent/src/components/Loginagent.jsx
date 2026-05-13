import React, { useState } from 'react';

const LoginAgent = ({ onLoginSuccess }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@saa.dz')) {
      setError('Accès réservé aux agents SAA (@saa.dz)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Identifiants incorrects');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (onLoginSuccess) onLoginSuccess(data.user);

    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 flex items-center justify-center p-6 font-sans">
      
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex flex-col items-center leading-none mb-6">

            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center font-black text-white text-2xl italic shadow-xl mb-4">
              SAA
            </div>

            <span className="text-slate-900 text-3xl font-black italic tracking-tighter uppercase">
              Espace Agent
            </span>

            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
              ORASS v2.0 — Accès Restreint
            </span>

          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">

          {/* Bandeau */}
          <div className="bg-orange-50 border-b border-orange-100 px-8 py-3 flex items-center gap-3">
            
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />

            <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
              Portail agent SAA — Connexion sécurisée
            </p>

          </div>

          <div className="p-8">

            <form className="space-y-5" onSubmit={handleSubmit}>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  Identifiant Agent
                </label>

                <div className="relative">
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="prenom.nom@saa.dz"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:border-orange-400 focus:bg-white outline-none transition-all"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    @saa.dz
                  </span>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  Mot de passe
                </label>

                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••••"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:border-orange-400 focus:bg-white outline-none transition-all"
                />
              </div>

              {/* Erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-500 text-[11px] font-bold">
                    ⚠ {error}
                  </p>
                </div>
              )}

              {/* Bouton */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-[11px] uppercase tracking-[0.25em] rounded-2xl transition-all active:scale-95 shadow-lg shadow-orange-200 mt-2"
              >
                {loading ? '⏳ Connexion...' : '🔐 Accéder au Portail Agent'}
              </button>

            </form>

            {/* Info */}
            <div className="mt-8 pt-6 border-t border-slate-100">

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">

                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Accès réservé aux :
                </p>

                {[
                  { icon:"👤", label:"Agents de production" },
                  { icon:"🔍", label:"Chargés de sinistres" },
                  { icon:"📊", label:"Responsables de portefeuille" },
                ].map(item => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3"
                  >
                    <span className="text-sm">{item.icon}</span>

                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">

          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            SAA ORASS Suite © 2026 — Direction des Systèmes d'Information
          </p>

          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
            Tout accès non autorisé est passible de poursuites
          </p>

        </div>
      </div>
    </div>
  );
};

export default LoginAgent;