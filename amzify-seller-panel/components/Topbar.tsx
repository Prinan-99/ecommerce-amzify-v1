
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Topbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search resources, users, orders..." 
            className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 text-sm transition-all"
          />
          <span className="absolute left-3 top-2 text-slate-400">🔍</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3 pr-6 border-r border-slate-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
            {user?.name?.charAt(0)}
          </div>
        </div>

        <button 
          onClick={logout}
          className="text-slate-600 hover:text-red-600 transition-colors text-sm font-medium flex items-center space-x-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
