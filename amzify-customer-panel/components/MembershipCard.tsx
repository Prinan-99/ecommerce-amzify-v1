import React, { useState, useEffect } from 'react';
import { UserProfile, MembershipTier } from '../types';
import { TIER_THRESHOLDS } from '../constants';
import { Coins, History, Trophy, ArrowUpRight, Sparkles } from 'lucide-react';

interface MembershipCardProps {
  user: UserProfile;
  onViewHistory?: () => void;
}

const MembershipCard: React.FC<MembershipCardProps> = ({ user, onViewHistory }) => {
  const tiers = [MembershipTier.MEMBER, MembershipTier.GOLD, MembershipTier.PLATINUM];
  const currentTierIndex = tiers.indexOf(user.tier);
  const nextTier = tiers[currentTierIndex + 1];
  
  const [displaySpend, setDisplaySpend] = useState(0);
  const [displayPoints, setDisplayPoints] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  const getTargetProgress = () => {
    if (user.tier === MembershipTier.PLATINUM) return 100;
    const currentTierLimit = TIER_THRESHOLDS[user.tier];
    const nextTierLimit = TIER_THRESHOLDS[nextTier];
    const progress = ((user.currentSpend - currentTierLimit) / (nextTierLimit - currentTierLimit)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  useEffect(() => {
    // Quick, snappy count-up for psychological impact
    const duration = 1200;
    const steps = 30;
    const interval = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Ease out expo for a "premium" feel
      const easeProgress = 1 - Math.pow(2, -10 * progress);
      
      setDisplaySpend(Math.floor(user.currentSpend * easeProgress));
      setDisplayPoints(Math.floor(user.rewardPoints * easeProgress));
      
      if (currentStep >= steps) {
        setDisplaySpend(user.currentSpend);
        setDisplayPoints(user.rewardPoints);
        clearInterval(timer);
      }
    }, interval);

    // Delay bar animation slightly for layered effect
    const barTimer = setTimeout(() => {
      setBarWidth(getTargetProgress());
    }, 200);

    return () => {
      clearInterval(timer);
      clearTimeout(barTimer);
    };
  }, [user]);

  const remainingToNext = nextTier ? TIER_THRESHOLDS[nextTier] - user.currentSpend : 0;

  return (
    <div className="relative group overflow-visible">
      <div className="bg-[#1A1A1A] rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/10 transition-all duration-500 hover:shadow-amber-900/20">
        
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 gold-gradient opacity-10 blur-[80px] rounded-full -mr-32 -mt-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 opacity-20 blur-3xl rounded-full -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#C5A059] animate-ping"></div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Status: Verified</p>
              </div>
              <h3 className="text-3xl font-serif italic text-white flex items-center gap-3">
                {user.tier} <Trophy size={20} className="text-[#C5A059]" />
              </h3>
            </div>
            <div className="relative">
               <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                <div className="w-10 h-10 gold-gradient rounded-xl shadow-inner flex items-center justify-center">
                   <Sparkles size={20} className="text-white/80" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#C5A059] rounded-full border-2 border-[#1A1A1A] flex items-center justify-center">
                 <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Core Spending Section */}
          <div className="space-y-6 mb-12">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-1">Portfolio Value</span>
                <span className="text-3xl font-bold text-white tracking-tighter">₹{displaySpend.toLocaleString()}</span>
              </div>
              {nextTier && (
                <div className="text-right">
                  <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest block mb-1">Next Milestone</span>
                  <span className="text-xs font-bold text-white/60 italic">₹{remainingToNext.toLocaleString()} more to {nextTier}</span>
                </div>
              )}
            </div>

            {/* Premium Progress Engine */}
            <div className="relative pt-4 pb-2">
              <div className="absolute -top-2 right-0 flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
                <ArrowUpRight size={10} className="text-[#C5A059]" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">
                  {nextTier === 'Platinum' ? 'UNLOCK: LOUNGE ACCESS' : 'UNLOCK: PRIORITY'}
                </span>
              </div>
              
              <div className="relative h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="absolute h-full gold-gradient shadow-[0_0_20px_rgba(197,160,89,0.5)] transition-all duration-1000 ease-out flex items-center justify-end"
                  style={{ width: `${barWidth}%` }}
                >
                  {/* Leading Edge Sparkle */}
                  <div className="w-8 h-full bg-white/40 blur-md"></div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                {tiers.map((tier, idx) => (
                  <div key={tier} className="relative flex flex-col items-center">
                    <div className={`w-1.5 h-1.5 rounded-full mb-2 transition-colors duration-1000 ${idx <= currentTierIndex ? 'bg-[#C5A059] shadow-[0_0_10px_#C5A059]' : 'bg-white/10'}`}></div>
                    <span className={`text-[8px] font-black uppercase tracking-tighter ${idx <= currentTierIndex ? 'text-[#C5A059]' : 'text-gray-600'}`}>
                      {tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reward Section */}
          <div className="flex items-center justify-between pt-8 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-[#C5A059]/30 transition-colors">
                <Coins size={22} className="text-[#C5A059]" />
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Available Credits</span>
                <span className="text-xl font-bold text-white tracking-tight">
                  {displayPoints.toLocaleString()} 
                  <span className="text-[10px] text-[#C5A059] ml-1.5 font-black">PTS</span>
                </span>
              </div>
            </div>
            
            <button 
              onClick={onViewHistory}
              className="group/btn flex items-center gap-2 bg-white/5 hover:bg-[#C5A059] text-white/50 hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border border-white/5 hover:border-transparent shadow-xl"
            >
              <History size={14} className="group-hover/btn:rotate-[-45deg] transition-transform" />
              Vault History
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .gold-gradient {
          background: linear-gradient(135deg, #C5A059 0%, #E6C875 50%, #C5A059 100%);
        }
      `}</style>
    </div>
  );
};

export default MembershipCard;