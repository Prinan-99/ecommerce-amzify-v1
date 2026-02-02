
import React, { useEffect, useState } from 'react';
import { AdminApi } from '../services/api';
import { Seller, AccountStatus } from '../types';

const Sellers: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING'>('ALL');

  useEffect(() => {
    AdminApi.getSellers().then(data => {
      setSellers(data);
      setLoading(false);
    });
  }, []);

  const handleVerification = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    const actionLabel = status === 'VERIFIED' ? 'approve' : 'reject';
    if (confirm(`Are you sure you want to ${actionLabel} this merchant account?`)) {
      // In a real app, this would call AdminApi.updateSellerVerification(id, status)
      setSellers(prev => prev.map(s => s.id === id ? { ...s, verificationStatus: status } : s));
    }
  };

  const filteredSellers = sellers.filter(s => 
    activeTab === 'ALL' ? true : s.verificationStatus === 'PENDING'
  );

  const pendingCount = sellers.filter(s => s.verificationStatus === 'PENDING').length;

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-xs">Syncing Merchant Ledger</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Merchant Oversight</h2>
          <p className="text-slate-500 font-bold mt-1">Global seller registry and trust verification system</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'ALL' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            ALL MERCHANTS
          </button>
          <button 
            onClick={() => setActiveTab('PENDING')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${activeTab === 'PENDING' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span>VERIFICATION QUEUE</span>
            {pendingCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Global Health Index</p>
          <div className="flex items-end space-x-2">
            <h3 className="text-3xl font-black text-slate-900">94.8%</h3>
            <span className="text-emerald-500 text-xs font-bold mb-1">↗ 2.1%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Commission Collected</p>
          <div className="flex items-end space-x-2">
            <h3 className="text-3xl font-black text-slate-900">$842.5K</h3>
            <span className="text-slate-400 text-xs font-bold mb-1">This Cycle</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">High Risk Entities</p>
          <div className="flex items-end space-x-2">
            <h3 className="text-3xl font-black text-rose-600">14</h3>
            <span className="text-rose-400 text-xs font-bold mb-1">Immediate Audit</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Store & Merchant</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Risk Profile</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Compliance</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSellers.map(seller => (
                <tr key={seller.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl group-hover:bg-blue-50 group-hover:text-blue-400 transition-colors">
                        {seller.storeName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900">{seller.storeName}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{seller.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      seller.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      seller.verificationStatus === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        seller.verificationStatus === 'VERIFIED' ? 'bg-emerald-500' :
                        seller.verificationStatus === 'REJECTED' ? 'bg-rose-500' :
                        'bg-amber-500 animate-pulse'
                      }`}></span>
                      {seller.verificationStatus}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                        <span className="text-slate-400">Violation Points</span>
                        <span className={seller.violationPoints > 10 ? 'text-rose-500' : 'text-emerald-500'}>{seller.violationPoints}</span>
                      </div>
                      <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${seller.violationPoints > 10 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, (seller.violationPoints / 20) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{seller.healthScore}%</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">SLA Grade</p>
                      </div>
                      <div className={`w-2 h-8 rounded-full ${seller.healthScore > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center space-x-2">
                      {seller.verificationStatus === 'PENDING' ? (
                        <>
                          <button 
                            onClick={() => handleVerification(seller.id, 'VERIFIED')}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all"
                          >
                            APPROVE
                          </button>
                          <button 
                            onClick={() => handleVerification(seller.id, 'REJECTED')}
                            className="bg-white border border-rose-200 text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all"
                          >
                            REJECT
                          </button>
                        </>
                      ) : (
                        <div className="flex space-x-4">
                          <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                            AUDIT LOGS
                          </button>
                          <button className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors">
                            SUSPEND
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSellers.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
              <span className="text-4xl">✅</span>
              <div>
                <p className="text-xl font-black text-slate-900">Verification Queue Clear</p>
                <p className="text-slate-400 font-bold text-sm">All merchants have been processed for this region.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sellers;
