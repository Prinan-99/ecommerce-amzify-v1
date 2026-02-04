import React from 'react';
import { Achievement } from '../types';
import * as Icons from 'lucide-react';

interface AchievementsSectionProps {
  achievements: Achievement[];
}

const AchievementsSection: React.FC<AchievementsSectionProps> = ({ achievements }) => {
  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'rare': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'epic': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'legendary': return 'bg-amber-50 text-amber-600 border-amber-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getRarityGlow = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-200/50';
      case 'rare': return 'shadow-blue-200/50';
      case 'epic': return 'shadow-purple-200/50';
      case 'legendary': return 'shadow-amber-200/50';
      default: return 'shadow-gray-200/50';
    }
  };

  return (
    <section className="px-6 py-12">
      <div className="mb-8">
        <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.4em] mb-2 block">Your Journey</span>
        <h3 className="text-3xl font-serif text-gray-900 leading-tight">Achievements Unlocked</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const IconComponent = (Icons as any)[achievement.icon] || Icons.Award;
          
          return (
            <div 
              key={achievement.id}
              className={`bg-white rounded-[2.5rem] p-8 border shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group cursor-pointer ${getRarityGlow(achievement.rarity)}`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 ${getRarityColor(achievement.rarity)} group-hover:scale-110 transition-transform duration-500`}>
                  <IconComponent size={28} strokeWidth={1.5} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity}
                </div>
              </div>

              <h4 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#C5A059] transition-colors">
                {achievement.title}
              </h4>
              
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {achievement.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Unlocked {achievement.unlockedAt}
                </span>
                <div className="w-2 h-2 bg-[#C5A059] rounded-full animate-pulse"></div>
              </div>
            </div>
          );
        })}

        {/* Next Achievement Teaser */}
        <div className="bg-gray-50 rounded-[2.5rem] p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center min-h-[280px] group hover:border-[#C5A059]/30 transition-all duration-500">
          <div className="w-16 h-16 bg-gray-100 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:bg-[#C5A059]/10 transition-colors">
            <Icons.Lock size={28} className="text-gray-400 group-hover:text-[#C5A059] transition-colors" />
          </div>
          <h4 className="text-lg font-serif font-bold text-gray-400 mb-2">Next Achievement</h4>
          <p className="text-sm text-gray-500 mb-4">Keep shopping to unlock more exclusive rewards</p>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coming Soon</div>
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;