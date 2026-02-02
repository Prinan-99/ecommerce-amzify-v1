
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavItem: React.FC<{ to: string; label: string; icon: string }> = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
        isActive 
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
      }`}
    >
      <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
      <span className="font-bold text-sm">{label}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  return (
    <div className="w-72 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col p-6 z-40">
      <div className="flex items-center space-x-3 mb-10 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-100">
          N
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Nexus Governance</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Central Authority</p>
        </div>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Executive Control</p>
          <nav className="space-y-1">
            <NavItem to="/" label="Dashboard" icon="📊" />
            <NavItem to="/users" label="User Governance" icon="🛡️" />
            <NavItem to="/sellers" label="Merchant Oversight" icon="🏪" />
            <NavItem to="/products" label="SKU Moderation" icon="📦" />
            <NavItem to="/orders" label="Platform Orders" icon="🛒" />
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Supply Chain</p>
          <nav className="space-y-1">
            <NavItem to="/logistics" label="Logistics & Delivery" icon="🚚" />
            <NavItem to="/offers" label="Offers & Promotions" icon="🏷️" />
            <NavItem to="/governance-rules" label="Rule Engine" icon="🧠" />
            <NavItem to="/tickets" label="Seller Tickets" icon="🎫" />
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">System Data</p>
          <nav className="space-y-1">
            <NavItem to="/health" label="System Telemetry" icon="⚡" />
            <NavItem to="/audit-logs" label="Audit Trail" icon="📜" />
            <NavItem to="/settings" label="Global Settings" icon="⚙️" />
          </nav>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 mt-6">
        <div className="bg-slate-900 rounded-2xl p-4 text-white">
           <div className="flex items-center space-x-2 mb-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Secure Console</span>
           </div>
           <p className="text-[10px] text-slate-400 font-medium">Nexus Engine v4.5.1-Auth</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
