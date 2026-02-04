import React from 'react';

interface PremiumCardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'gradient' | 'minimal';
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({ 
  children, 
  variant = 'solid',
  className = '',
  interactive = false,
  onClick
}) => {
  const baseClasses = "rounded-2xl transition-all duration-300 ease-out";
  
  const variantClasses = {
    glass: "bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-2xl hover:bg-white/90",
    solid: "bg-white border border-slate-200 shadow-md hover:shadow-xl",
    gradient: "bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-lg hover:shadow-2xl",
    minimal: "bg-transparent border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50"
  };

  const interactiveClasses = interactive ? "cursor-pointer hover:scale-105 hover:-translate-y-1" : "";

  return (
    <div 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
    >
      {children}
    </div>
  );
};

interface StatCardAnimatedProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
  gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'cyan';
  isLoading?: boolean;
}

const gradientMap = {
  blue: "from-blue-600 to-blue-700",
  purple: "from-purple-600 to-purple-700",
  green: "from-emerald-600 to-emerald-700",
  orange: "from-orange-600 to-orange-700",
  pink: "from-pink-600 to-pink-700",
  cyan: "from-cyan-600 to-cyan-700"
};

const gradientLightMap = {
  blue: "from-blue-50 to-blue-100/50",
  purple: "from-purple-50 to-purple-100/50",
  green: "from-emerald-50 to-emerald-100/50",
  orange: "from-orange-50 to-orange-100/50",
  pink: "from-pink-50 to-pink-100/50",
  cyan: "from-cyan-50 to-cyan-100/50"
};

export const StatCardAnimated: React.FC<StatCardAnimatedProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  gradient = 'blue',
  isLoading
}) => {
  return (
    <PremiumCard variant="gradient" interactive className="p-6 group overflow-hidden relative">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientLightMap[gradient]} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{title}</p>
          </div>
          {icon && (
            <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientMap[gradient]} text-white transform group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-3">
          {isLoading ? (
            <div className="h-8 bg-slate-200 rounded-lg animate-pulse w-32"></div>
          ) : (
            <p className="text-4xl font-black text-slate-900 group-hover:text-slate-900 transition-colors">
              {value}
            </p>
          )}
        </div>

        {/* Subtitle and trend */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-600">{subtitle}</p>
          {trend !== undefined && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              trend >= 0 
                ? 'text-green-700 bg-green-100' 
                : 'text-red-700 bg-red-100'
            }`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      </div>

      {/* Hover effect line */}
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-slate-400 group-hover:to-transparent transition-all duration-300"></div>
    </PremiumCard>
  );
};
