
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import AIGrowthAssistant from './components/AIGrowthAssistant';

/**
 * A wrapper component that applies a fade-in animation when its content
 * enters the viewport using the Intersection Observer API.
 */
const FadeInSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // Toggle visibility to allow both fade-in and fade-out effects
        if (entry.isIntersecting) {
          setVisible(true);
        } else {
          // Optional: Remove this if you only want it to fade in once
          setVisible(false);
        }
      });
    }, { threshold: 0.1 });

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      className={`fade-in-section ${isVisible ? 'is-visible' : ''}`}
      ref={domRef}
    >
      {children}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />
      <main className="flex-grow overflow-x-hidden">
        <FadeInSection>
          <Hero />
        </FadeInSection>
        
        <FadeInSection>
          <Stats />
        </FadeInSection>

        <FadeInSection>
          <div id="features">
            <Features />
          </div>
        </FadeInSection>

        <FadeInSection>
          <div id="process">
            <HowItWorks />
          </div>
        </FadeInSection>

        <FadeInSection>
          <div id="success">
            <Testimonials />
          </div>
        </FadeInSection>
      </main>
      <Footer />
      
      {/* Unique Feature: Floating AI Assistant to help potential sellers understand the platform */}
      <AIGrowthAssistant />
    </div>
  );
};

export default App;
