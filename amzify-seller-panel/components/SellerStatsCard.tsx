import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  isLoading?: boolean;
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  red: 'bg-red-50 border-red-200 text-red-700'
};

const iconColorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  red: 'text-red-600'
};

export const SellerStatsCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className={`p-6 rounded-2xl border-2 ${colorClasses[color]} animate-pulse`}>
        <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl border-2 ${colorClasses[color]} hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide">{title}</h3>
        <div className={`p-2 bg-white rounded-lg ${iconColorClasses[color]}`}>
          {icon}
        </div>
      </div>
      
      <p className="text-3xl font-black text-slate-900 mb-2">{value}</p>
      
      {change !== undefined && (
        <div className="flex items-center gap-1">
          {change >= 0 ? (
            <>
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-600">+{change}% this month</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-red-600">{change}% this month</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
