
import React, { useEffect, useState } from 'react';
import { AdminApi } from '../services/api';
import { GovernanceRule } from '../types';

const GovernanceRules: React.FC = () => {
  const [rules, setRules] = useState<GovernanceRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminApi.getRules().then(data => {
      setRules(data);
      setLoading(false);
    });
  }, []);

  const toggleRule = async (id: string, isEnabled: boolean) => {
    await AdminApi.updateRule(id, { isEnabled: !isEnabled });
    setRules(rules.map(r => r.id === id ? { ...r, isEnabled: !isEnabled } : r));
  };

  if (loading) return <div className="p-8 font-black text-slate-400">Syncing Policy Engine...</div>;

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Rule Engine</h2>
          <p className="text-slate-500 font-medium">Automated detection and enforcement parameters for platform discipline</p>
        </div>
      </div>

      <div className="space-y-4">
        {rules.map(rule => (
          <div key={rule.id} className={`bg-white p-6 rounded-2xl border transition-all duration-300 ${rule.isEnabled ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-black text-slate-900">{rule.name}</h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                    rule.action === 'BLOCK' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    Action: {rule.action}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500">{rule.description}</p>
                <div className="mt-4 flex items-center space-x-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enforcement Threshold</p>
                    <p className="text-xl font-black text-slate-900">{rule.threshold}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Detection</p>
                    <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Active</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button 
                  onClick={() => toggleRule(rule.id, rule.isEnabled)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    rule.isEnabled ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {rule.isEnabled ? 'DEACTIVATE' : 'ACTIVATE'}
                </button>
                <button className="text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest underline">Edit Params</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl text-white">
        <h3 className="text-xl font-black mb-4">Security Policy Snapshot</h3>
        <p className="text-slate-400 text-sm max-w-2xl mb-6">Automation rules are enforced globally across all merchant categories. Manual overrides are logged and tracked via the Super Admin Audit Ledger.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-slate-800 p-4 rounded-xl">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Upload Rate Limit</p>
             <p className="text-lg font-black">50 SKUs / Hour</p>
           </div>
           <div className="bg-slate-800 p-4 rounded-xl">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Price Drop Alert</p>
             <p className="text-lg font-black">&gt; 70% Single Session</p>
           </div>
           <div className="bg-slate-800 p-4 rounded-xl">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Suspicious Returns</p>
             <p className="text-lg font-black">&gt; 12% Monthly Avg</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceRules;
