import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface ModernStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
  gradient: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink';
  isLoading?: boolean;
  onClick?: () => void;
}

const gradients = {
  blue: 'from-blue-500/10 to-blue-600/10 border-blue-200/30',
  purple: 'from-purple-500/10 to-purple-600/10 border-purple-200/30',
  green: 'from-emerald-500/10 to-emerald-600/10 border-emerald-200/30',
  orange: 'from-orange-500/10 to-orange-600/10 border-orange-200/30',
  red: 'from-red-500/10 to-red-600/10 border-red-200/30',
  pink: 'from-pink-500/10 to-pink-600/10 border-pink-200/30'
};

const iconGradients = {
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  green: 'text-emerald-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
  pink: 'text-pink-600'
};

export const ModernStatCard: React.FC<ModernStatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  gradient,
  isLoading,
  onClick
}) => {
  if (isLoading) {
    return (
      <div className={`bg-gradient-to-br ${gradients[gradient]} border rounded-2xl p-6 animate-pulse`}>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${gradients[gradient]} border rounded-2xl p-6 hover:shadow-lg hover:scale-105 transition-all cursor-pointer backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{title}</p>
        </div>
        {icon && <div className={`${iconGradients[gradient]} text-xl`}>{icon}</div>}
      </div>

      <p className="text-3xl font-black text-slate-900 mb-2">{value}</p>

      <div className="flex items-center justify-between">
        {subtitle && <p className="text-xs text-slate-600">{subtitle}</p>}
        {trend !== undefined && (
          <div className="flex items-center gap-1">
            {trend >= 0 ? (
              <>
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-600">+{trend}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3 text-red-600" />
                <span className="text-xs font-bold text-red-600">{trend}%</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
