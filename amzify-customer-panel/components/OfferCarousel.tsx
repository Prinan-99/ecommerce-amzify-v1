import React from 'react';
import { Sparkles, Gift, Zap, TrendingUp } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  discount: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const OfferCarousel: React.FC = () => {
  const offers: Offer[] = [
    {
      id: 'off1',
      title: 'Mega Sale',
      discount: 'Up to 40% OFF',
      description: 'On selected premium fashion items',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'off2',
      title: 'First Buy',
      discount: '₹500 Gift',
      description: 'On your first order with Amzify',
      icon: <Gift className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'off3',
      title: 'Flash Deal',
      discount: '3x Points',
      description: 'Earn triple rewards this weekend',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'off4',
      title: 'Top Sellers',
      discount: 'Free Shipping',
      description: 'On orders above ₹999',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500'
    },
  ];

  // Extended array for seamless loop
  const extendedOffers = [...offers, ...offers];
  const scrollDuration = offers.length * 8;

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className="relative group">
        {/* Scrolling Container */}
        <div 
          className="flex gap-4 w-max"
          style={{
            animation: `slideOffers ${scrollDuration}s linear infinite`,
          }}
        >
          {extendedOffers.map((offer, index) => (
            <div
              key={`${offer.id}-${index}`}
              className={`flex-shrink-0 w-72 h-40 rounded-3xl bg-gradient-to-br ${offer.color} p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 group/card text-white border border-white/20 backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white/90">{offer.title}</h3>
                  <div className="text-2xl font-black leading-tight">{offer.discount}</div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover/card:bg-white/30 transition-all">
                  {offer.icon}
                </div>
              </div>
              
              <p className="text-xs font-semibold text-white/80">{offer.description}</p>
            </div>
          ))}
        </div>

        {/* Gradient Fade Overlays */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none z-10"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-10"></div>
      </div>

      <style>{`
        @keyframes slideOffers {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-288px * ${offers.length} - 1rem * ${offers.length})); }
        }
        .group:hover [style*="animation"] {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default OfferCarousel;
