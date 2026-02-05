import React from 'react';
import { MembershipTier, Benefit } from '../types';
import * as Icons from 'lucide-react';

interface BenefitsSectionProps {
  userTier: MembershipTier;
  benefits: Benefit[];
}

const BenefitsSection: React.FC<BenefitsSectionProps> = ({ userTier, benefits }) => {
  // Triple the array to ensure a seamless infinite loop even on ultra-wide screens
  const extendedBenefits = [...benefits, ...benefits, ...benefits];
  // Calculate a slow, readable duration (seconds per item)
  const scrollDuration = benefits.length * 15; 

  return (
    <section className="py-12 bg-transparent relative w-full overflow-hidden select-none">
      <div className="px-6 mb-12 text-center flex flex-col items-center">
        <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.5em] mb-3 opacity-80">
          Your Privilege Portfolio
        </span>
        <h3 className="text-3xl md:text-4xl font-serif text-gray-900 font-bold italic tracking-tight leading-tight">
          Exclusive Curations
        </h3>
        <div className="mt-6 flex items-center gap-3">
          <div className="w-8 h-[1px] bg-gray-200"></div>
          <Icons.Sparkle size={12} className="text-[#C5A059] opacity-40" />
          <div className="w-8 h-[1px] bg-gray-200"></div>
        </div>
      </div>
      
      {/* Auto-moving Marquee for "Signature" feel */}
      <div className="relative w-full group">
        <div 
          className="flex gap-6 w-max animate-marquee"
          style={{
            animation: `marquee ${scrollDuration}s linear infinite`,
          }}
        >
          {extendedBenefits.map((benefit, index) => {
            const IconComponent = (Icons as any)[benefit.icon] || Icons.HelpCircle;
            
            return (
              <div 
                key={`${benefit.id}-${index}`} 
                className="flex-shrink-0 w-[280px] md:w-[320px] bg-white p-8 md:p-10 rounded-[3rem] md:rounded-[4rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col items-center text-center transition-all duration-700 hover:shadow-[0_40px_80px_rgba(197,160,89,0.12)] hover:-translate-y-3 cursor-pointer group/card"
              >
                <div className="relative mb-8 transition-transform duration-700 group-hover/card:scale-105">
                  <div className="w-20 h-20 md:w-24 md:h-24 gold-gradient rounded-[2.2rem] md:rounded-[2.8rem] flex items-center justify-center text-white shadow-[0_20px_40px_rgba(197,160,89,0.3)] border-4 border-white">
                    <IconComponent size={32} strokeWidth={1.5} />
                  </div>
                  <div className="absolute inset-0 gold-gradient blur-3xl opacity-10 -z-10 rounded-full scale-150"></div>
                </div>

                <h4 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mb-3 tracking-tight group-hover/card:text-[#C5A059] transition-colors">
                  {benefit.title}
                </h4>
                
                <div className="w-10 h-0.5 bg-gray-100 mb-4 rounded-full group-hover/card:w-16 transition-all duration-500 group-hover/card:bg-[#C5A059]/30"></div>
                
                <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] leading-relaxed max-w-[200px]">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Gradient overlays to soften the edges */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FDFCFB] to-transparent pointer-events-none z-10"></div>
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FDFCFB] to-transparent pointer-events-none z-10"></div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          /* Move by exactly one set of items */
          100% { transform: translateX(calc(-320px * ${benefits.length} - 1.5rem * ${benefits.length})); }
        }
        @media (max-width: 768px) {
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-280px * ${benefits.length} - 1.5rem * ${benefits.length})); }
          }
        }
        .animate-marquee { 
          will-change: transform; 
        }
        .group:hover .animate-marquee { 
          animation-play-state: paused; 
        }
        .gold-gradient {
          background: linear-gradient(135deg, #C5A059 0%, #E6C875 50%, #C5A059 100%);
        }
      `}</style>
      
      <div className="flex justify-center mt-12">
        <div className="flex items-center gap-6">
          <div className="flex gap-1.5">
             {[1, 2, 3].map((i) => (
               <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === 1 ? 'bg-[#C5A059] w-4' : 'bg-gray-200'}`}></div>
             ))}
          </div>
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.5em] animate-pulse">
            scroll to explain
          </p>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;