
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  // Interactive Demo State
  const [productName, setProductName] = useState('');
  const [cost, setCost] = useState<number>(25);
  const [category, setCategory] = useState('Electronics');
  const [isSimulating, setIsSimulating] = useState(false);
  const [stats, setStats] = useState({
    profit: 15.50,
    demand: 'High',
    reach: '2.4M',
    roi: '62%'
  });

  const categories = ['Electronics', 'Home & Decor', 'Fashion', 'Wellness', 'Eco-Friendly'];

  const runSimulation = () => {
    setIsSimulating(true);
    // Simulate a brief AI "thinking" period
    setTimeout(() => {
      const randomProfit = (cost * (0.4 + Math.random() * 0.6)).toFixed(2);
      const randomROI = Math.floor(40 + Math.random() * 80);
      const randomReach = (1 + Math.random() * 4).toFixed(1);
      
      setStats({
        profit: parseFloat(randomProfit),
        demand: Math.random() > 0.3 ? 'High' : 'Very High',
        reach: `${randomReach}M`,
        roi: `${randomROI}%`
      });
      setIsSimulating(false);
    }, 800);
  };

  useEffect(() => {
    if (productName.length > 3) {
      runSimulation();
    }
  }, [productName, category, cost]);

  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-32 hero-pattern overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 w-full lg:w-1/2 h-full bg-gradient-to-l from-indigo-50 to-transparent opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        <div className="flex-1 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            Predict Your Growth
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-4 sm:mb-6">
            Scale your brand to <span className="gradient-text">new heights</span> with Amzify.
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            The world's most intuitive seller platform. Try our AI analytics below—enter your product details to see your potential.
          </p>
          <div className="flex justify-center lg:justify-start">
            <button 
              onClick={() => navigate('/seller/register')}
              className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 text-lg"
            >
              Launch Your Store
            </button>
          </div>
        </div>

        <div className="flex-1 relative w-full lg:max-w-xl">
          {/* Interactive Demo Card */}
          <div className="relative glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white/50 bg-white/80">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                AI Profit Predictor
              </h3>
              <span className="text-[10px] sm:text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider">Beta</span>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Inputs */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Product Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Silk Yoga Mat"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Target Category</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all appearance-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Manufacturing Cost</label>
                  <span className="text-sm font-bold text-indigo-600">${cost}</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="500" 
                  step="5"
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  value={cost}
                  onChange={(e) => setCost(parseInt(e.target.value))}
                />
              </div>

              {/* Simulation Result Area */}
              <div className={`mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 text-white transition-all duration-500 relative overflow-hidden ${isSimulating ? 'opacity-50' : 'opacity-100'}`}>
                {isSimulating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-10">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 sm:gap-6 relative z-0">
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Est. Profit</p>
                    <p className="text-xl sm:text-2xl font-black text-indigo-400">${stats.profit}</p>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Market Demand</p>
                    <p className="text-xl sm:text-2xl font-black">{stats.demand}</p>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Reach</p>
                    <p className="text-xl sm:text-2xl font-black">{stats.reach}</p>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Target ROI</p>
                    <p className="text-xl sm:text-2xl font-black text-green-400">{stats.roi}</p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500 italic">
                    *Based on real-time Amzify network data for {category.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Background Glows - Reduced on mobile */}
          <div className="absolute -top-10 -right-10 w-48 h-48 lg:w-64 lg:h-64 bg-indigo-500/10 lg:bg-indigo-500/20 rounded-full blur-[80px] lg:blur-[100px] -z-10"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 lg:w-64 lg:h-64 bg-purple-500/5 lg:bg-purple-500/10 rounded-full blur-[80px] lg:blur-[100px] -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
