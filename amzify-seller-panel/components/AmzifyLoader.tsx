import React from 'react';

interface AmzifyLoaderProps {
  message?: string;
  submessage?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export const AmzifyLoader: React.FC<AmzifyLoaderProps> = ({
  message = 'Loading',
  submessage = 'Fetching data from Amzify...',
  size = 'medium',
  fullScreen = false
}) => {
  const sizeClasses = {
    small: { logo: 'w-12 h-12', text: 'text-base', dot: 'w-1.5 h-1.5' },
    medium: { logo: 'w-20 h-20', text: 'text-xl', dot: 'w-2 h-2' },
    large: { logo: 'w-28 h-28', text: 'text-2xl', dot: 'w-3 h-3' }
  };

  const classes = sizeClasses[size];

  const content = (
    <div className="text-center">
      {/* Amzify Logo Animation */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${classes.logo} rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20 animate-ping`}></div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className={`${classes.logo} rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl transform rotate-12 animate-pulse`}>
            <span className={`${size === 'small' ? 'text-2xl' : size === 'medium' ? 'text-4xl' : 'text-5xl'} font-black text-white transform -rotate-12`}>A</span>
          </div>
        </div>
      </div>
      
      {/* Loading Text */}
      <h3 className={`${classes.text} font-bold text-slate-900 mb-2`}>{message}</h3>
      <p className="text-slate-600 mb-4">{submessage}</p>
      
      {/* Animated Dots */}
      <div className="flex items-center justify-center gap-2">
        <div className={`${classes.dot} rounded-full bg-indigo-600 animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${classes.dot} rounded-full bg-purple-600 animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${classes.dot} rounded-full bg-pink-600 animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl">
      {content}
    </div>
  );
};

export default AmzifyLoader;
