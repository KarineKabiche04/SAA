import React from 'react';

/**
 * =========================================================
 * NAVBAR.JSX — VERSION FINALE
 * =========================================================
 *
 * Props :
 *
 * activePage  → page active actuelle
 * onNavigate  → fonction navigation
 * onHome      → retour accueil
 *
 * Pages :
 *
 * null           → accueil
 * 'auto'         → auto moto
 * 'habitation'   → habitation
 * 'bateau'       → bateau
 * 'sante'        → santé
 * 'cyber'        → cyber risques
 *
 * =========================================================
 */

export default function Navbar({
  activePage,
  onNavigate,
  onHome,
}) {

  return (
    <nav className="sticky top-0 z-50 bg-white border-y border-gray-100 shadow-sm">

      <div className="
        max-w-7xl mx-auto
        grid grid-cols-2 md:grid-cols-6 lg:grid-cols-7
        text-[10px]
        font-black
        uppercase
        tracking-[0.15em]
      ">

        {/* =================================================
            ACCUEIL
        ================================================= */}
        <NavItem
          label="ACCUEIL"
          icon="🏠"
          active={activePage === null}
          onClick={onHome}
        />

        {/* =================================================
            CYBER RISQUES
        ================================================= */}
        <NavItem
          label="CYBER RISQUES"
          icon="🛡️"
          active={activePage === 'cyber'}
          onClick={() => onNavigate('cyber')}
        />

        {/* =================================================
            AUTO / MOTO
        ================================================= */}
        <NavItem
          label="AUTO / MOTO"
          icon="🚗"
          active={activePage === 'auto'}
          onClick={() => onNavigate('auto')}
        />

        {/* =================================================
            HABITATION
        ================================================= */}
        <NavItem
          label="HABITATION"
          icon="🏠"
          active={activePage === 'habitation'}
          onClick={() => onNavigate('habitation')}
        />

        {/* =================================================
            BATEAU
        ================================================= */}
        <NavItem
          label="BATEAU DE PLAISANCE"
          icon="⛵"
          active={activePage === 'bateau'}
          onClick={() => onNavigate('bateau')}
        />

        {/* =================================================
            SANTÉ
        ================================================= */}
        <NavItem
          label="SANTÉ"
          icon="🏥"
          active={activePage === 'sante'}
          onClick={() => onNavigate('sante')}
        />

        {/* =================================================
            SEARCH
        ================================================= */}
        <button
          className="
            flex items-center justify-center
            p-5
            border-l border-gray-50
            hover:bg-gray-50
            transition
            group
          "
        >
          <span className="
            text-xl
            transition-transform
            group-hover:scale-110
          ">
            🔍
          </span>
        </button>

      </div>

    </nav>
  );
}

/* =========================================================
   NAV ITEM
========================================================= */

function NavItem({
  label,
  icon,
  active,
  onClick,
}) {

  return (
    <button
      onClick={onClick}
      className={`
        relative
        flex flex-col items-center justify-center
        py-6
        border-r border-gray-50
        transition-all
        group
        hover:bg-gray-50
        ${active ? 'bg-gray-50' : 'bg-white'}
      `}
    >

      {/* =================================================
          ICON
      ================================================= */}
      <div
        className={`
          text-2xl
          mb-2
          transition-transform
          group-hover:scale-110
          ${active
            ? 'grayscale-0'
            : 'grayscale group-hover:grayscale-0'
          }
        `}
      >
        {icon}
      </div>

      {/* =================================================
          LABEL
      ================================================= */}
      <span
        className={`
          px-2
          text-center
          leading-tight
          transition-colors
          ${active
            ? 'text-[#e89d1b]'
            : 'text-slate-500 group-hover:text-[#e89d1b]'
          }
        `}
      >
        {label}
      </span>

      {/* =================================================
          ACTIVE BAR
      ================================================= */}
      {active && (
        <div className="
          absolute bottom-0 left-0
          w-full h-[3px]
          bg-[#e89d1b]
        " />
      )}

    </button>
  );
}