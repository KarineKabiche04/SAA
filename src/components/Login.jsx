import React, { useState } from 'react';

// ─── LOGIN PRINCIPAL ──────────────────────────────────────────────────────────
// modes: 'login' | 'register'
const Login = ({ initialMode = 'login', onSignupSuccess, onLoginSuccess }) => {
  const [mode, setMode] = useState(initialMode);

  // Champs login
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // Champs register (assuré existant)
  const [regFullName, setRegFullName]   = useState('');
  const [regEmail, setRegEmail]         = useState('');
  const [regPassword, setRegPassword]   = useState('');
  const [regNumPolice, setRegNumPolice] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const reset = () => { setError(''); setSuccess(''); };

  const handleLogin = async (e) => {
    e.preventDefault(); reset(); setLoading(true);
    try {
      const res  = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (onLoginSuccess) onLoginSuccess(data.user);
    } catch { setError('Erreur de connexion au serveur'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); reset(); setLoading(true);
    try {
      const res  = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName,
          email: regEmail,
          password: regPassword,
          numPolice: regNumPolice
        })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSuccess('Compte créé avec succès ! Connectez-vous.');
      setTimeout(() => { setMode('login'); setSuccess(''); }, 2000);
      if (onSignupSuccess) onSignupSuccess({ email: regEmail, fullName: regFullName });
    } catch { setError('Erreur de connexion au serveur'); }
    finally { setLoading(false); }
  };

  const headerBg    = mode === 'login' ? 'bg-[#0f172a]' : 'bg-[#e89d1b]';
  const headerTitle = mode === 'login' ? 'Espace Client' : 'Créer mon compte';
  const logoColor   = mode === 'login' ? 'text-[#e89d1b]' : 'text-white';
  const logoSub     = mode === 'login' ? 'text-white' : 'text-slate-900';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">

          {/* Header */}
          <div className={`p-10 text-center relative ${headerBg}`}>
            <div className="inline-flex flex-col items-center leading-none mb-4">
              <span className={`text-5xl font-black italic tracking-tighter uppercase ${logoColor}`}>saa</span>
              <span className={`text-[10px] font-black uppercase tracking-[0.4em] mt-2 ${logoSub}`}>Assurances</span>
            </div>
            <h2 className="text-white text-xl font-black uppercase tracking-tight italic">{headerTitle}</h2>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10" />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {[
              { key: 'login',    label: 'Se connecter' },
              { key: 'register', label: 'Déjà assuré SAA' },
            ].map(t => (
              <button key={t.key} onClick={() => { setMode(t.key); reset(); }}
                className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 ${
                  mode === t.key
                    ? t.key === 'login'
                      ? 'border-[#0f172a] text-[#0f172a]'
                      : 'border-[#e89d1b] text-[#e89d1b]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-8">

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-5">
                <p className="text-red-500 text-[11px] font-bold">⚠ {error}</p>
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-5">
                <p className="text-emerald-600 text-[11px] font-bold">{success}</p>
              </div>
            )}

            {/* ── SE CONNECTER ── */}
            {mode === 'login' && (
              <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">E-mail</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.dz"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-[#0f172a] focus:bg-white outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Mot de passe</label>
                  <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-[#0f172a] focus:bg-white outline-none transition-all" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-[#0f172a] hover:bg-slate-800 disabled:opacity-50 text-white font-black text-[11px] uppercase tracking-[0.25em] rounded-2xl transition-all active:scale-95 shadow-xl">
                  {loading ? '⏳ Connexion...' : 'Se Connecter 🔒'}
                </button>
                <button type="button" className="w-full text-[9px] font-bold text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-all">
                  Mot de passe oublié ?
                </button>
              </form>
            )}

            {/* ── DÉJÀ ASSURÉ SAA ── */}
            {mode === 'register' && (
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-2">
                  <p className="text-amber-700 text-[10px] font-bold leading-relaxed">
                    📋 Vous avez déjà une police d'assurance SAA ? Créez votre espace client en renseignant votre N° de police.
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nom & Prénom</label>
                  <input required type="text" value={regFullName} onChange={e => setRegFullName(e.target.value)}
                    placeholder="Votre nom complet"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-[#e89d1b] focus:bg-white outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">E-mail</label>
                  <input required type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                    placeholder="votre@email.dz"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-[#e89d1b] focus:bg-white outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Mot de passe</label>
                  <input required type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)}
                    placeholder="Choisissez un mot de passe"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-[#e89d1b] focus:bg-white outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">N° de Police SAA</label>
                  <input required type="text" value={regNumPolice} onChange={e => setRegNumPolice(e.target.value)}
                    placeholder="ex: 16/2026/1234"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold font-mono focus:border-[#e89d1b] focus:bg-white outline-none transition-all" />
                  <p className="text-[9px] text-slate-400 font-bold mt-1 ml-1">Indiqué sur votre attestation d'assurance</p>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-[#e89d1b] hover:bg-orange-600 disabled:opacity-50 text-white font-black text-[11px] uppercase tracking-[0.25em] rounded-2xl transition-all active:scale-95 shadow-xl shadow-orange-100">
                  {loading ? '⏳ Vérification...' : 'Créer mon Espace Client →'}
                </button>
              </form>
            )}

          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-4 text-center">
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
              Sécurité Garantie par SAA Système SI
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;