import React, { useState } from "react";

/* ================= UI ================= */

const Card = ({ title, children, action }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    {(title || action) && (
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">
          {title}
        </h3>
        {action}
      </div>
    )}
    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-xs font-bold text-slate-400">{label}</label>
    <input
      {...props}
      className="w-full mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:border-orange-400 outline-none"
    />
  </div>
);

/* ================= DASHBOARD ================= */

const Dashboard = ({ onLogout, onNewDevis }) => {
  const [editProfile, setEditProfile] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);

  const [user, setUser] = useState({
    nom: "MOHAMED",
    prenom: "AMINE",
    email: "amine@email.dz",
    tel: "0550 12 34 56",
    adresse: "Alger",
    points: 1250,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const contract = {
    vehicle: "GOLF 8",
    immat: "00123-122-16",
    status: "ACTIF",
    daysLeft: 142,
  };

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    alert("Mot de passe mis à jour !");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ================= NAVBAR ================= */}
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        
        <div>
          <h1 className="font-bold text-lg">SAA • Espace Client</h1>
          <p className="text-xs text-slate-400">
            Assurance Automobile
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-orange-400 font-bold">
            {user.nom} {user.prenom}
          </span>

          {/* 🔥 bouton déconnexion PRO */}
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-xs font-bold transition"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              Tableau de bord
            </h2>
            <p className="text-sm text-slate-400">
              Gestion de votre espace assuré
            </p>
          </div>

          <div className="bg-white px-5 py-3 rounded-xl border shadow-sm">
            <p className="text-xs text-slate-400">Points fidélité</p>
            <p className="text-xl font-black text-orange-500">
              {user.points}
            </p>
          </div>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* PROFILE */}
          <div className="md:col-span-2">
            <Card
              title="Profil assuré"
              action={
                <button
                  onClick={() => setEditProfile(!editProfile)}
                  className="text-xs font-bold text-orange-500"
                >
                  {editProfile ? "Sauvegarder" : "Modifier"}
                </button>
              }
            >
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Nom"
                  value={user.nom}
                  disabled={!editProfile}
                  onChange={(e) =>
                    setUser({ ...user, nom: e.target.value })
                  }
                />
                <Input
                  label="Prénom"
                  value={user.prenom}
                  disabled={!editProfile}
                  onChange={(e) =>
                    setUser({ ...user, prenom: e.target.value })
                  }
                />
                <Input
                  label="Email"
                  value={user.email}
                  disabled={!editProfile}
                  onChange={(e) =>
                    setUser({ ...user, email: e.target.value })
                  }
                />
                <Input
                  label="Téléphone"
                  value={user.tel}
                  disabled={!editProfile}
                  onChange={(e) =>
                    setUser({ ...user, tel: e.target.value })
                  }
                />
              </div>
            </Card>
          </div>

          {/* CONTRACT */}
          <Card title="Contrat actif">
            <p className="text-lg font-black">{contract.vehicle}</p>
            <p className="text-sm text-slate-500">{contract.immat}</p>

            <div className="mt-4">
              <p className="text-xs text-slate-400">Statut</p>
              <p className="text-green-600 font-bold">
                {contract.status}
              </p>
            </div>

            <div className="mt-3">
              <p className="text-xs text-slate-400">Expiration</p>
              <p className="font-bold">
                {contract.daysLeft} jours restants
              </p>
            </div>
          </Card>
        </div>

        {/* ACTIONS */}
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={onNewDevis}
            className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-2xl font-bold text-lg transition"
          >
            + Nouveau devis
          </button>

          <button className="bg-slate-900 hover:bg-black text-white p-6 rounded-2xl font-bold text-lg transition">
            Déclarer un sinistre
          </button>
        </div>

        {/* ================= SECURITY ================= */}
        <Card
          title="Sécurité du compte"
          action={
            <button
              onClick={() => setShowSecurity(!showSecurity)}
              className="text-xs font-bold text-orange-500"
            >
              {showSecurity ? "Fermer" : "Gérer"}
            </button>
          }
        >
          {showSecurity && (
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Mot de passe actuel"
                type="password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    current: e.target.value,
                  })
                }
              />

              <Input
                label="Nouveau mot de passe"
                type="password"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
              />

              <Input
                label="Confirmer"
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirm: e.target.value,
                  })
                }
              />

              <div className="md:col-span-3">
                <button
                  onClick={handlePasswordChange}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm transition"
                >
                  Mettre à jour le mot de passe
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;