
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {  const navigate = useNavigate();  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-3 glass shadow-sm' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">amzify<span className="text-indigo-600">.</span></span>
        </div>

        <div className="hidden md:flex items-center gap-6 font-medium text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#process" className="hover:text-indigo-600 transition-colors">Process</a>
          <a href="#success" className="hover:text-indigo-600 transition-colors">Success Stories</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/seller/login')}
            className="hidden sm:block px-4 py-2 text-slate-600 font-medium hover:text-indigo-600 transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/seller/register')}
            className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            Start Selling
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
