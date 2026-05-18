import React, { useState } from 'react';

/* ───────── COMPONENTS ───────── */
import TopBar from './TopBar';
import MainHeader from './MainHeader';
import Navbar from './Navbar';
import HeroSlider from './HeroSlider';
import ProductGrid from './ProductGrid';
import Footer from './Footer';

/* ───────── PAGES PRODUITS ───────── */
import Habitation from './Habitation';
import AutoMoto from './AutoMoto';
import Sante from './Sante';
import CyberRisques from './CyberRisques';
import BateauPlaisance from './BateauPlaisance';

/**
 * =========================================================
 * HOME.JSX — VERSION COMPLÈTE FINALE
 * =========================================================
 *
 * Navigation centralisée du site assurance.
 *
 * Pages disponibles :
 *
 * null           → Accueil
 * 'auto'         → Auto / Moto
 * 'habitation'   → Habitation
 * 'bateau'       → Bateau de plaisance
 * 'sante'        → Santé
 * 'cyber'        → Cyber Risques
 *
 * Props reçues depuis App.jsx :
 *
 * onLoginClick() → ouverture espace client
 * onDevisClick() → ouverture formulaire devis
 *
 * =========================================================
 */

export default function Home({
  onLoginClick,
  onDevisClick,
}) {
  /* ───────── STATE ───────── */
  const [activePage, setActivePage] = useState(null);

  /* ───────── NAVIGATION ───────── */

  // Changer de page + scroll top
  const goTo = (page) => {
    setActivePage(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Retour accueil
  const goHome = () => {
    goTo(null);
  };

  /* ───────── RENDER PAGES ───────── */

  const renderPage = () => {
    switch (activePage) {

      /* AUTO / MOTO */
      case 'auto':
        return (
          <AutoMoto
            onDevisClick={onDevisClick}
          />
        );

      /* HABITATION */
      case 'habitation':
        return (
          <Habitation
            onDevisClick={onDevisClick}
          />
        );

      /* BATEAU */
      case 'bateau':
        return (
          <BateauPlaisance
            onDevisClick={onDevisClick}
          />
        );

      /* SANTÉ */
      case 'sante':
        return (
          <Sante
            onDevisClick={onDevisClick}
          />
        );

      /* CYBER RISQUES */
      case 'cyber':
        return (
          <CyberRisques
            onDevisClick={onDevisClick}
          />
        );

      /* ACCUEIL */
      default:
        return (
          <>
            {/* HERO */}
            <HeroSlider
              onLoginClick={onLoginClick}
              onDevisClick={onDevisClick}
            />

            {/* PRODUITS */}
            <main>
              <ProductGrid
                onDevisClick={onDevisClick}
                onNavigate={goTo}
              />
            </main>
          </>
        );
    }
  };

  /* ───────── JSX ───────── */

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">

      {/* =====================================================
          TOP BAR
      ===================================================== */}
      <TopBar />

      {/* =====================================================
          HEADER PRINCIPAL
      ===================================================== */}
      <MainHeader
        onLoginClick={onLoginClick}
        user={null}
      />

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <Navbar
        activePage={activePage}
        onNavigate={goTo}
        onHome={goHome}
      />

      {/* =====================================================
          CONTENU PRINCIPAL
      ===================================================== */}
      <div className="animate-fade-in">

        {renderPage()}

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <Footer />

    </div>
  );
}
