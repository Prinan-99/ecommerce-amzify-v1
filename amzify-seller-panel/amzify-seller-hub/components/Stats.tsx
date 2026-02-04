
import React from 'react';

const Stats: React.FC = () => {
  const stats = [
    { label: "Active Sellers", value: "50,000+" },
    { label: "Gross Volume", value: "$4.2B" },
    { label: "Countries Served", value: "150+" },
    { label: "Customer Rating", value: "4.9/5" }
  ];

  return (
    <div className="relative z-10 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-slate-900 rounded-[3rem] p-10 lg:p-16 shadow-2xl overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 blur-[120px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative z-10">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center border-r border-slate-800 last:border-0">
              <p className="text-3xl lg:text-5xl font-black text-white mb-2">{stat.value}</p>
              <p className="text-slate-400 font-medium uppercase tracking-wider text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
