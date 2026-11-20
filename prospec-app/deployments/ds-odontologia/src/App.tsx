import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ServicesGrid } from './components/ServicesGrid';
import { ResultsGallery } from './components/ResultsGallery';
import { GoogleReviews } from './components/GoogleReviews';
import { FaqAccordion } from './components/FaqAccordion';
import { MapLocation } from './components/MapLocation';
import { Footer } from './components/Footer';
import { StickyBar } from './components/StickyBar';
import { BookingModal } from './components/BookingModal';

export const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<string | undefined>(undefined);

  const handleOpenBooking = (procedureTitle?: string) => {
    setSelectedProcedure(procedureTitle);
    setIsModalOpen(true);
  };

  const handleCloseBooking = () => {
    setIsModalOpen(false);
    setSelectedProcedure(undefined);
  };

  // Scroll Reveal Observer
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal-on-scroll');
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="site-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onOpenBooking={() => handleOpenBooking()} />

      <main style={{ flex: 1 }}>
        {/* 1. Hero */}
        <Hero onOpenBooking={(proc) => handleOpenBooking(proc)} />

        {/* 2. Sobre a Clínica (Placed BEFORE Procedimentos as requested!) */}
        <div className="reveal-on-scroll">
          <AboutSection onOpenBooking={() => handleOpenBooking()} />
        </div>

        {/* 3. Procedimentos & Especialidades (with 6 cards + 'Ver mais') */}
        <div className="reveal-on-scroll">
          <ServicesGrid onSelectService={(proc) => handleOpenBooking(proc)} />
        </div>

        {/* 4. Casos Clínicos Antes & Depois (with mobile carousel) */}
        <div className="reveal-on-scroll">
          <ResultsGallery onSelectCase={(caseTitle) => handleOpenBooking(caseTitle)} />
        </div>

        {/* 5. Avaliações Google (Carousel showing 3 per page on desktop, 1 on mobile) */}
        <div className="reveal-on-scroll">
          <GoogleReviews />
        </div>

        {/* 6. FAQ (Responsive dropdowns with smooth animation) */}
        <div className="reveal-on-scroll">
          <FaqAccordion />
        </div>

        {/* 7. Onde Estamos (Interactive switcher: Contagem / Betim) */}
        <div className="reveal-on-scroll">
          <MapLocation />
        </div>
      </main>

      <Footer />
      <StickyBar onOpenBooking={() => handleOpenBooking()} />

      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseBooking}
        initialProcedure={selectedProcedure}
      />
    </div>
  );
};
