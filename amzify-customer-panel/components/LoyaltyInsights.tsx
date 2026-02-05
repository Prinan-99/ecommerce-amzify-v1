import React from 'react';
import { LoyaltyStats } from '../types';
import { TrendingUp, ShoppingCart, Heart, Calendar, Award, Target } from 'lucide-react';

interface LoyaltyInsightsProps {
  stats: LoyaltyStats;
}

const LoyaltyInsights: React.FC<LoyaltyInsightsProps> = ({ stats }) => {
  const insights = [
    {
      icon: ShoppingCart,
      label: 'Total Orders',
      value: stats.totalOrders.toString(),
      subtitle: 'Lifetime purchases',
      color: 'bg-blue-50 text-blue-600',
      trend: '+12% this month'
    },
    {
      icon: TrendingUp,
      label: 'Average Order',
      value: `₹${stats.averageOrderValue.toLocaleString()}`,
      subtitle: 'Per transaction',
      color: 'bg-green-50 text-green-600',
      trend: '+8% vs last month'
    },
    {
      icon: Heart,
      label: 'Favorite Category',
      value: stats.favoriteCategory,
      subtitle: '60% of purchases',
      color: 'bg-red-50 text-red-600',
      trend: 'Most loved'
    },
    {
      icon: Award,
      label: 'Total Saved',
      value: `₹${stats.totalSaved.toLocaleString()}`,
      subtitle: 'Through rewards',
      color: 'bg-amber-50 text-amber-600',
      trend: 'Lifetime savings'
    }
  ];

  return (
    <section className="px-6 py-12">
      <div className="mb-8">
        <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.4em] mb-2 block">Analytics</span>
        <h3 className="text-3xl font-serif text-gray-900 leading-tight">Your Shopping Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${insight.color} group-hover:scale-110 transition-transform duration-500`}>
                <insight.icon size={24} strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  {insight.trend}
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900 group-hover:text-[#C5A059] transition-colors">
                {insight.value}
              </div>
              <div className="text-sm font-bold text-gray-700">{insight.label}</div>
              <div className="text-xs text-gray-500">{insight.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Membership Journey */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-gray-800 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 gold-gradient opacity-10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 blur-[80px] rounded-full -ml-20 -mb-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center shadow-xl">
              <Calendar size={28} className="text-white" />
            </div>
            <div>
              <h4 className="text-2xl font-serif font-bold mb-1">Membership Journey</h4>
              <p className="text-white/60 text-sm">{stats.membershipDays} days of premium experience</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20">
                <Target size={32} className="text-[#C5A059]" />
              </div>
              <div className="text-3xl font-bold mb-2">{Math.round(stats.membershipDays / 30)}</div>
              <div className="text-white/60 text-sm font-medium">Months Active</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20">
                <TrendingUp size={32} className="text-green-400" />
              </div>
              <div className="text-3xl font-bold mb-2">{Math.round((stats.totalOrders / stats.membershipDays) * 30)}</div>
              <div className="text-white/60 text-sm font-medium">Orders/Month</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20">
                <Award size={32} className="text-amber-400" />
              </div>
              <div className="text-3xl font-bold mb-2">{Math.round(stats.totalSaved / stats.totalOrders)}</div>
              <div className="text-white/60 text-sm font-medium">Avg Savings</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoyaltyInsights;