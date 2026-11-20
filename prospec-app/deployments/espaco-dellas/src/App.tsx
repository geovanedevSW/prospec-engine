import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ResultsGallery } from './components/ResultsGallery';
import { ServicesGrid } from './components/ServicesGrid';
import { AboutSection } from './components/AboutSection';
import { GoogleReviews } from './components/GoogleReviews';
import { FaqAccordion } from './components/FaqAccordion';
import { MapLocation } from './components/MapLocation';
import { StickyBar } from './components/StickyBar';
import { BookingModal } from './components/BookingModal';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);

  const handleOpenBooking = (serviceTitle?: string) => {
    setSelectedService(serviceTitle);
    setIsModalOpen(true);
  };

  const handleCloseBooking = () => {
    setIsModalOpen(false);
    setSelectedService(undefined);
  };

  return (
    <div className="site-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onOpenBooking={() => handleOpenBooking()} />

      <main style={{ flex: 1 }}>
        <Hero onOpenBooking={() => handleOpenBooking()} />
        <ResultsGallery onSelectResult={(res) => handleOpenBooking(res.title)} />
        <ServicesGrid onSelectService={(svc) => handleOpenBooking(svc.title)} />
        <AboutSection onOpenBooking={() => handleOpenBooking()} />
        <GoogleReviews />
        <FaqAccordion />
        <MapLocation />
      </main>

      <Footer />
      <StickyBar onOpenBooking={() => handleOpenBooking()} />

      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseBooking}
        initialService={selectedService}
      />
    </div>
  );
};

