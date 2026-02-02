
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, Box, ShoppingCart, Users, TrendingUp, ArrowUpRight, 
  Plus, Search, MoreHorizontal, Zap, Megaphone, Mail, Sparkles, Loader2,
  Calendar as CalendarIcon, Download, QrCode, MapPin, Package,
  Trash2, ToggleLeft, ToggleRight, Eye, MousePointerClick, 
  Activity, ArrowRight, RefreshCw, Layers, ShieldCheck, Ban, Reply,
  AlertTriangle
} from 'lucide-react';
import { PRODUCTS as initialProducts } from '../constants';
import { Order, Product, SellerTab, AutomationRule, Customer, Inquiry, Campaign } from '../types';
import { 
  getSellerInsights, 
  generateMarketingCreative, 
  generateEmailAutomationContent, 
  generateSupportReply 
} from '../services/geminiService';
import { useAuth } from '../../shared/auth/AuthContext';
import { UserRole } from '../../shared/auth/types';

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SellerDashboard: React.FC = () => {
  // Authentication integration
  const { user, role, isAuthenticated, logout, checkPermission } = useAuth();
  
  // Role validation - ensure only sellers can access this dashboard
  const hasSellerAccess = checkPermission(UserRole.SELLER);
  
  const [activeTab, setActiveTab] = useState<SellerTab>('dashboard');
  const [insight, setInsight] = useState<string>('Syncing marketplace intelligence...');
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [metricType, setMetricType] = useState<'revenue' | 'volume'>('revenue');
  
  // Dashboard Timeline State
  const [rangeMode, setRangeMode] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  // State for Lists
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: 'CMP-101', name: 'Spring Revival', platform: 'Instagram', status: 'Active', reach: 12400, engagement: '4.2%', product: 'Aura Silk Gown' },
    { id: 'CMP-102', name: 'Elite Audio Launch', platform: 'Email', status: 'Draft', reach: 0, engagement: '0%', product: 'Zenith Wireless' }
  ]);

  const [automations, setAutomations] = useState<AutomationRule[]>([
    { id: 'AUTO-01', name: 'Global VIP Welcome', trigger: 'welcome', active: true, lastSent: '2 hours ago', stats: { delivered: 1420, opened: 890 } },
    { id: 'AUTO-02', name: 'High-Value Abandonment', trigger: 'abandonment', active: true, lastSent: '15 mins ago', stats: { delivered: 45, opened: 32 } }
  ]);

  const [customers] = useState<Customer[]>([
    { id: 'CUST-001', name: 'Aarav Sharma', email: 'aarav@nexus.in', totalOrders: 12, totalSpent: 145000, lastPurchase: '2024-05-20', status: 'Active' },
    { id: 'CUST-002', name: 'Ishani Roy', email: 'ishani.r@glam.com', totalOrders: 5, totalSpent: 78900, lastPurchase: '2024-05-19', status: 'Active' },
  ]);

  const [orders] = useState<Order[]>([
    { id: 'ORD-8291', customer: 'Aarav Sharma', email: 'aarav@nexus.in', address: 'Sky Tower, Mumbai', total: 24999, date: '2024-05-20', status: 'Processing', items: [] },
    { id: 'ORD-8290', customer: 'Ishani Roy', email: 'ishani.r@glam.com', address: 'UB City, Bangalore', total: 15499, date: '2024-05-19', status: 'Shipped', items: [] },
  ]);

  // Marketing Generation State
  const [mktProduct, setMktProduct] = useState(initialProducts[0].name);
  const [mktGoal, setMktGoal] = useState('New Launch');
  const [isCampaignLoading, setIsCampaignLoading] = useState(false);
  const [isAutomationLoading, setIsAutomationLoading] = useState(false);

  // Dynamic Chart Simulation
  const chartData = useMemo(() => {
    const points = rangeMode === '7d' ? 7 : rangeMode === '30d' ? 15 : rangeMode === '90d' ? 30 : 12;
    return Array.from({ length: points }).map((_, i) => ({
      label: rangeMode === '1y' ? MONTH_NAMES[i % 12] : `${i + 1}`,
      value: metricType === 'revenue' 
        ? Math.floor(Math.random() * 50000) + 15000 
        : Math.floor(Math.random() * 20) + 5,
      active: i === points - 1
    }));
  }, [rangeMode, metricType]);

  useEffect(() => {
    refreshInsights();
  }, []);

  const refreshInsights = async () => {
    setIsInsightLoading(true);
    const res = await getSellerInsights();
    setInsight(res);
    setIsInsightLoading(false);
  };

  const handleDeployCampaign = async () => {
    setIsCampaignLoading(true);
    const creative = await generateMarketingCreative(mktProduct, mktGoal, 'Minimalist');
    const newCampaign: Campaign = {
      id: `CMP-${Math.floor(Math.random() * 900) + 100}`,
      name: `AI: ${mktGoal} - ${mktProduct}`,
      platform: 'Instagram',
      status: 'Active',
      reach: 0,
      engagement: '0%',
      product: mktProduct
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    setIsCampaignLoading(false);
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  // Access control - redirect or show error if user doesn't have seller access
  if (!isAuthenticated) {
    return (
      <div className="flex-1 bg-slate-50/50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black tracking-tighter text-slate-950 mb-4">Authentication Required</h2>
          <p className="text-sm text-slate-600 mb-8">Please log in to access the seller dashboard.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full py-4 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!hasSellerAccess) {
    return (
      <div className="flex-1 bg-slate-50/50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl text-center max-w-md">
          <Ban className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black tracking-tighter text-slate-950 mb-4">Access Denied</h2>
          <p className="text-sm text-slate-600 mb-8">You don't have permission to access the seller dashboard. Only sellers can view this page.</p>
          <div className="flex gap-4">
            <button 
              onClick={logout}
              className="flex-1 py-4 bg-slate-100 text-slate-950 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Logout
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex-1 py-4 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen">
      <div className="max-w-[1440px] mx-auto p-6 md:p-10 space-y-8 md:space-y-12">
        
        {/* Navigation Grid */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-x-auto no-scrollbar flex gap-1">
            {(['dashboard', 'orders', 'customers', 'marketing', 'support'] as SellerTab[]).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-950'}`}
              >
                {tab === 'support' ? 'Concierge' : tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Market Status</p>
                <p className="text-xs font-black text-emerald-500 flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live & Synced
                </p>
             </div>
             <div className="flex flex-col items-end mr-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Seller</p>
                <p className="text-xs font-black text-slate-950 mt-1">
                  {user && 'sellerName' in user ? user.sellerName : 'Unknown Seller'}
                </p>
                {user && 'companyName' in user && (
                  <p className="text-[9px] font-medium text-slate-500">{user.companyName}</p>
                )}
             </div>
             <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-indigo-100">
               {user && 'sellerName' in user ? user.sellerName.charAt(0).toUpperCase() : 'S'}
             </div>
             <button 
               onClick={logout}
               className="ml-2 p-3 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl transition-all"
               title="Logout"
             >
               <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="min-h-[70vh]">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-700">
               {/* Dashboard Metric Control Bar */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2 bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-between px-8">
                    <div className="flex items-center gap-6">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol View</p>
                       <div className="flex gap-2">
                          <button onClick={() => setMetricType('revenue')} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${metricType === 'revenue' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>Revenue</button>
                          <button onClick={() => setMetricType('volume')} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${metricType === 'volume' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>Volume</button>
                       </div>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-100"></div>
                    <div className="flex items-center gap-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</p>
                       <div className="flex gap-1.5 bg-slate-50 p-1 rounded-full">
                          {(['7d', '30d', '90d', '1y'] as const).map(mode => (
                            <button key={mode} onClick={() => setRangeMode(mode)} className={`px-4 py-2 rounded-full text-[8px] font-black uppercase transition-all ${rangeMode === mode ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400'}`}>{mode}</button>
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-center px-8">
                    <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                       <RefreshCw className="w-4 h-4" /> Recalculate Node Matrix
                    </button>
                 </div>
               </div>

               {/* Main Visual Matrix */}
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-3 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-12 relative overflow-hidden">
                     <div className="flex justify-between items-start relative z-10">
                        <div>
                          <h3 className="text-4xl font-black tracking-tighter text-slate-950">Performance Graph</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Aggregate Node Analysis</p>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-black tracking-tighter text-indigo-600">
                            {metricType === 'revenue' ? formatINR(chartData.reduce((a,b)=>a+b.value, 0)) : `${chartData.reduce((a,b)=>a+b.value, 0)} Units`}
                          </p>
                          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">+18.2% Optimization</p>
                        </div>
                     </div>
                     
                     <div className="flex items-end gap-3 h-[300px] px-4">
                        {chartData.map((point, i) => (
                           <div key={i} className="flex-1 flex flex-col items-center group gap-4 h-full justify-end">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-md mb-2">{point.value}</div>
                              <div 
                                className={`w-full rounded-t-2xl transition-all duration-1000 ease-out ${point.active ? 'bg-indigo-600 shadow-2xl shadow-indigo-100' : 'bg-slate-100 group-hover:bg-indigo-200'}`} 
                                style={{ height: `${(point.value / (metricType === 'revenue' ? 65000 : 30)) * 100}%` }} 
                              />
                              <span className="text-[9px] font-black text-slate-300 uppercase">{point.label}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* AI Strategic Advice */}
                  <div className="bg-slate-950 p-12 rounded-[3.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:scale-125 transition-transform duration-1000"></div>
                     <div className="relative z-10 space-y-10">
                        <div className="flex items-center justify-between">
                           <h3 className="text-xs font-black tracking-widest uppercase text-indigo-400">Tactical Insight</h3>
                           <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl">
                           {isInsightLoading ? (
                             <div className="flex items-center gap-3 py-4">
                               <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                               <p className="text-[10px] font-black uppercase text-slate-500 italic">Processing marketplace signals...</p>
                             </div>
                           ) : (
                             <p className="text-sm font-medium leading-relaxed italic text-slate-200">"{insight}"</p>
                           )}
                        </div>
                        <button onClick={refreshInsights} className="w-full py-5 bg-white text-slate-950 rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-xl active:scale-95">Reroute Strategy</button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Marketing Tab */}
          {activeTab === 'marketing' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
               {/* Campaign Management Interface */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10">
                     <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-3xl font-black tracking-tighter">Campaign Matrix</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">AI-Powered Orchestration</p>
                        </div>
                        <Megaphone className="w-10 h-10 text-indigo-600" />
                     </div>
                     <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target Product</label>
                              <select value={mktProduct} onChange={e => setMktProduct(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-black outline-none border-none focus:ring-2 focus:ring-indigo-500">
                                 {initialProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Protocol Goal</label>
                              <select value={mktGoal} onChange={e => setMktGoal(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-black outline-none border-none focus:ring-2 focus:ring-indigo-500">
                                 <option>New Launch</option>
                                 <option>Clearance</option>
                                 <option>VIP Exclusive</option>
                              </select>
                           </div>
                        </div>
                        <button 
                          onClick={handleDeployCampaign} 
                          disabled={isCampaignLoading}
                          className="w-full py-6 bg-slate-950 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 hover:bg-indigo-600 transition-all disabled:opacity-50"
                        >
                          {isCampaignLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} Deploy AI Campaign
                        </button>
                     </div>

                     <div className="pt-10 border-t border-slate-50 space-y-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Operations</p>
                        <div className="space-y-4">
                           {campaigns.map(camp => (
                             <div key={camp.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                                <div className="flex items-center gap-5">
                                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                                      <Zap className="w-5 h-5" />
                                   </div>
                                   <div>
                                      <h4 className="text-sm font-black text-slate-900">{camp.name}</h4>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{camp.platform} • {camp.product}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-xs font-black text-slate-900">{camp.reach.toLocaleString()}</p>
                                   <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{camp.engagement} Engagement</p>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Automation Registry */}
                  <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10">
                     <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-3xl font-black tracking-tighter">Automation Logic</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Behavioral Trigger Sequences</p>
                        </div>
                        <Mail className="w-10 h-10 text-indigo-600" />
                     </div>

                     <div className="space-y-6">
                        {automations.map(auto => (
                          <div key={auto.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative group transition-all">
                             <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                   <div className={`w-3 h-3 rounded-full ${auto.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                   <h4 className="text-lg font-black tracking-tight">{auto.name}</h4>
                                </div>
                                <button 
                                  onClick={() => setAutomations(prev => prev.map(a => a.id === auto.id ? { ...a, active: !a.active } : a))}
                                  className={`p-2 transition-all ${auto.active ? 'text-indigo-600' : 'text-slate-300'}`}
                                >
                                   {auto.active ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                                </button>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Stats</p>
                                   <div className="flex items-baseline gap-2">
                                      <span className="text-xl font-black">{auto.stats?.opened}</span>
                                      <span className="text-[9px] font-black text-slate-400 uppercase">Opens</span>
                                   </div>
                                </div>
                                <div className="space-y-1">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Fired</p>
                                   <p className="text-xs font-black text-indigo-600">{auto.lastSent}</p>
                                </div>
                             </div>
                          </div>
                        ))}

                        <button 
                          onClick={() => setIsAutomationLoading(true)}
                          className="w-full py-5 bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 rounded-[2rem] font-black text-[9px] uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-3"
                        >
                           {isAutomationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Initialize New Protocol
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Orders/Customers Placeholder logic */}
          {(activeTab === 'orders' || activeTab === 'customers') && (
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12 animate-in fade-in duration-500">
               <div className="flex items-center justify-between mb-12">
                  <h3 className="text-4xl font-black tracking-tighter uppercase">{activeTab} Registry</h3>
                  <div className="flex gap-4">
                     <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search registry..." className="pl-12 pr-6 py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase outline-none border-none focus:ring-2 focus:ring-indigo-500" />
                     </div>
                     <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-950 transition-colors"><Download className="w-5 h-5" /></button>
                  </div>
               </div>
               
               <div className="space-y-6">
                 {activeTab === 'orders' ? (
                   orders.map(o => (
                     <div key={o.id} className="p-8 bg-slate-50 rounded-[2.5rem] flex items-center justify-between border border-slate-100">
                        <div className="flex gap-8 items-center">
                           <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Package className="w-6 h-6" /></div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{o.id}</p>
                              <h4 className="text-xl font-black text-slate-900">{o.customer}</h4>
                           </div>
                        </div>
                        <div className="flex gap-16 items-center">
                           <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Investment</p>
                              <p className="text-xl font-black">{formatINR(o.total)}</p>
                           </div>
                           <span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${o.status === 'Processing' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{o.status}</span>
                        </div>
                     </div>
                   ))
                 ) : (
                   customers.map(c => (
                    <div key={c.id} className="p-8 bg-slate-50 rounded-[2.5rem] flex items-center justify-between border border-slate-100">
                       <div className="flex gap-8 items-center">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Users className="w-6 h-6" /></div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.id}</p>
                             <h4 className="text-xl font-black text-slate-900">{c.name}</h4>
                          </div>
                       </div>
                       <div className="flex gap-16 items-center">
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Spend</p>
                             <p className="text-xl font-black">{formatINR(c.totalSpent)}</p>
                          </div>
                          <span className="px-6 py-2 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">{c.totalOrders} Orders</span>
                       </div>
                    </div>
                   ))
                 )}
               </div>
            </div>
          )}
        </div>
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default SellerDashboard;
