import React, { useState, useEffect } from 'react';

const Login = ({ initialMode = 'login', onSignupSuccess, onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');

  useEffect(() => {
    setIsLoginMode(initialMode === 'login');
  }, [initialMode]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoginMode) {
      try {
        const res = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) return alert(data.message);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (onLoginSuccess) onLoginSuccess(data.user);
      } catch (err) {
        alert('Erreur de connexion au serveur');
      }
    } else {
      try {
        const res = await fetch('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName })
        });
        const data = await res.json();
        if (!res.ok) return alert(data.message);
        alert('Compte créé avec succès ! Connectez-vous.');
        setIsLoginMode(true);
        if (onSignupSuccess) onSignupSuccess({ email });
      } catch (err) {
        alert('Erreur de connexion au serveur');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 transition-all duration-500">

        <div className={`p-12 text-center transition-colors duration-500 relative ${isLoginMode ? 'bg-[#0f172a]' : 'bg-[#e89d1b]'}`}>
          <div className="inline-flex flex-col items-center leading-none mb-6">
            <span className={`text-5xl font-black italic tracking-tighter uppercase ${isLoginMode ? 'text-[#e89d1b]' : 'text-white'}`}>saa</span>
            <span className={`text-[10px] font-black uppercase tracking-[0.4em] mt-2 ${isLoginMode ? 'text-white' : 'text-slate-900'}`}>Assurances</span>
          </div>
          <h2 className="text-white text-xl font-black uppercase tracking-tight italic">
            {isLoginMode ? "Espace Client" : "Créer un compte"}
          </h2>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10"></div>
        </div>

        <div className="p-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLoginMode && (
              <div className="animate-fade-in">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Nom et Prénom</label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre nom complet"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-[#e89d1b] focus:bg-white outline-none transition-all shadow-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">E-mail / Identifiant</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.dz"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-[#e89d1b] focus:bg-white outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Mot de passe</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-[#e89d1b] focus:bg-white outline-none transition-all shadow-sm"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] shadow-xl transition-all active:scale-95 text-white mt-4 ${
                isLoginMode
                  ? 'bg-[#0f172a] shadow-slate-200 hover:bg-slate-800'
                  : 'bg-[#e89d1b] shadow-orange-200 hover:bg-orange-600'
              }`}
            >
              {isLoginMode ? 'Se Connecter 🔒' : "Confirmer l'Inscription"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="group text-[11px] font-black uppercase tracking-widest transition-all"
            >
              {isLoginMode ? (
                <p className="text-slate-400">
                  Nouveau chez SAA ?
                  <span className="text-[#e89d1b] border-b-2 border-[#e89d1b] ml-2 group-hover:text-orange-600">Créer un compte</span>
                </p>
              ) : (
                <p className="text-slate-400">
                  Déjà inscrit ?
                  <span className="text-[#0f172a] border-b-2 border-[#0f172a] ml-2 group-hover:text-blue-900">Se connecter</span>
                </p>
              )}
            </button>

            {isLoginMode && (
              <button type="button" className="text-[9px] font-bold text-slate-300 uppercase tracking-widest hover:text-slate-500">
                Mot de passe oublié ?
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-4 text-center">
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
            Sécurité Garantie par SAA Système SI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;