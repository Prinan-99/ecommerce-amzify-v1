
import React, { useEffect, useState } from 'react';
import { AdminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';

// Professional SVG Icons
const Icons = {
  Revenue: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3 1.343 3 3-1.343 3-3 3m0-12c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3m0-12V3m0 18v-3" />
    </svg>
  ),
  Approval: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Live: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Product: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Trending: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
};

const StatCard: React.FC<{ 
  label: string; 
  value: string | number; 
  subtext: string; 
  icon: React.ReactNode; 
  alert?: boolean;
  growth?: number;
  live?: boolean;
}> = ({ label, value, subtext, icon, alert, growth, live }) => (
  <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 ${alert ? 'border-l-4 border-l-rose-500' : ''} ${live ? 'ring-1 ring-emerald-100' : ''}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-xl ${alert ? 'bg-rose-50 text-rose-600' : live ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
        {icon}
      </div>
      <div className="flex flex-col items-end">
        {live && (
          <span className="flex items-center space-x-1.5 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>LIVE</span>
          </span>
        )}
        {growth !== undefined && (
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}%
          </span>
        )}
      </div>
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
    <h3 className={`text-3xl font-black tracking-tight ${alert ? 'text-rose-600' : 'text-slate-900'}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </h3>
    <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center">
      <span className={`w-1 h-1 rounded-full mr-2 ${alert ? 'bg-rose-500' : live ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
      {subtext}
    </p>
  </div>
);

const RiskHeatmap: React.FC = () => {
  const segments = [
    { name: 'Electronics', risk: 82, trend: 'up' },
    { name: 'Fashion', risk: 12, trend: 'down' },
    { name: 'Home/Auto', risk: 45, trend: 'stable' },
    { name: 'Logistics', risk: 91, trend: 'up' },
    { name: 'Payments', risk: 5, trend: 'down' },
    { name: 'Account Sec', risk: 24, trend: 'up' },
  ];

  return (
    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black tracking-tight">Seller Risk Heatmap</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Global Marketplace Telemetry</p>
        </div>
        <div className="p-2 bg-slate-800 rounded-lg text-rose-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {segments.map((s) => (
          <div key={s.name} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 hover:border-slate-500 transition-all cursor-default group">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{s.name}</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${s.risk > 70 ? 'bg-rose-500/20 text-rose-400' : s.risk > 30 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {s.risk}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${s.risk > 70 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : s.risk > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${s.risk}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="flex items-start space-x-3 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
          <div className="text-rose-500 mt-1 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black text-rose-400 uppercase tracking-widest">Action Required</p>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Logistics cluster critical. 14 merchants flagged for review. Automated suspension pending confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    AdminApi.getStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  const performanceData = [
    { name: 'Mon', revenue: 45000 }, { name: 'Tue', revenue: 52000 }, { name: 'Wed', revenue: 38000 },
    { name: 'Thu', revenue: 61000 }, { name: 'Fri', revenue: 75000 }, { name: 'Sat', revenue: 89000 },
    { name: 'Sun', revenue: 82000 },
  ];

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-xs">Decrypting Governance Logs</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-fadeIn">
      {/* Dynamic Header with User Data */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Governance Console
          </h2>
          <div className="flex items-center space-x-3 mt-2">
            <span className="flex items-center text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              Admin: {user?.name.split(' ')[0]} Verified
            </span>
            <p className="text-slate-500 font-bold text-sm">Nexus Central Authority: Session Active</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authority Level</p>
            <p className="text-sm font-black text-blue-600 uppercase">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black">
            {user?.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Primary Financial & Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Settled GMV" 
          value={`$${(stats.totalRevenue/1000000).toFixed(2)}M`} 
          subtext="Total Revenue (Trailing 30d)" 
          icon={<Icons.Revenue />} 
          growth={stats.revenueGrowth}
        />
        <StatCard 
          label="Live Customers" 
          value={stats.liveCustomers} 
          subtext="Active sessions on storefront" 
          icon={<Icons.Users />} 
          live={true}
          growth={stats.customerGrowth}
        />
        <StatCard 
          label="Live Products" 
          value={stats.liveProducts} 
          subtext="Total active SKUs in storefront" 
          icon={<Icons.Product />} 
          live={true}
          growth={stats.productGrowth}
        />
        <StatCard 
          label="Seller Growth" 
          value={`${stats.totalSellers.toLocaleString()}`} 
          subtext="Merchant network expansion" 
          icon={<Icons.Trending />} 
          growth={stats.sellerGrowth}
        />
      </div>

      {/* Secondary Performance & Alert Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Pending Approvals" 
          value={stats.pendingApprovals} 
          subtext="SKUs awaiting moderation" 
          icon={<Icons.Approval />} 
          alert={stats.pendingApprovals > 400} 
        />
        <StatCard 
          label="Open Tickets" 
          value={stats.openTickets} 
          subtext="Merchant support queue" 
          icon={<Icons.Live />} 
          alert={stats.openTickets > 50}
        />
        <StatCard 
          label="Security Anomalies" 
          value={stats.fraudAlerts} 
          subtext="Neutralized threat vectors" 
          icon={<Icons.Live />} 
          alert={stats.fraudAlerts > 10} 
        />
        <StatCard 
          label="Active Campaigns" 
          value={124} 
          subtext="Ongoing seller promotions" 
          icon={<Icons.Trending />} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Financial Performance</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Settled Platform Revenue</p>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
               <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white shadow-sm text-slate-900">7D Pulse</button>
               <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">30D Pulse</button>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  strokeWidth={4}
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <RiskHeatmap />
      </div>

      <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 skew-x-12 transform translate-x-20 group-hover:bg-blue-600/10 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-xl">
            <h3 className="text-2xl font-black mb-4 tracking-tight">Real-time Policy Enforcement</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              System monitoring level: <span className="text-emerald-400 font-black uppercase tracking-widest ml-1">Optimized Execution</span>. 
              Automated SLA warnings are being dispatched to 24 sub-performing merchants. Fraud detection engine reporting 0.02% false positive rate.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rules Synced</p>
               <p className="text-2xl font-black">100%</p>
             </div>
             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Uptime SLA</p>
               <p className="text-2xl font-black text-emerald-400">99.99</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
