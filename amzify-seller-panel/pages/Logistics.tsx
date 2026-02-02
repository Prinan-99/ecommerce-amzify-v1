
import React, { useEffect, useState } from 'react';
import { AdminApi } from '../services/api';
import { Shipment, DeliveryPartner, ShipmentStatus, ShipmentUpdate } from '../types';

const Logistics: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SHIPMENTS' | 'PARTNERS'>('SHIPMENTS');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null);
  const [updateFilter, setUpdateFilter] = useState<'ALL' | 'SELLER' | 'PARTNER'>('ALL');

  useEffect(() => {
    Promise.all([
      AdminApi.getShipments(),
      AdminApi.getDeliveryPartners()
    ]).then(([shipmentData, partnerData]) => {
      setShipments(shipmentData);
      setPartners(partnerData);
      setLoading(false);
    });
  }, []);

  const filteredUpdates = (updates: ShipmentUpdate[]) => {
    if (updateFilter === 'ALL') return updates;
    return updates.filter(u => u.authorRole === (updateFilter === 'PARTNER' ? 'DELIVERY_PARTNER' : 'SELLER'));
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-xs">Synchronizing Supply Chain</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Logistics & Fleet</h2>
          <p className="text-slate-500 font-bold mt-1">Real-time fulfillment governance and delivery partner performance</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('SHIPMENTS')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'SHIPMENTS' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            FULFILLMENT OPS
          </button>
          <button 
            onClick={() => setActiveTab('PARTNERS')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'PARTNERS' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            FLEET MANAGEMENT
          </button>
        </div>
      </div>

      {activeTab === 'SHIPMENTS' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In-Transit</p>
              <h3 className="text-3xl font-black text-slate-900">{shipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT).length}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SLA Exceptions</p>
              <h3 className="text-3xl font-black text-rose-600">3</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Cycle Time</p>
              <h3 className="text-3xl font-black text-blue-600">42.5h</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Health</p>
              <div className="flex items-center space-x-2">
                <h3 className="text-3xl font-black text-emerald-600">99%</h3>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipment / Route</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback Count</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shipments.map(shipment => (
                    <tr 
                      key={shipment.id} 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedShipment?.id === shipment.id ? 'bg-blue-50/50' : ''}`}
                      onClick={() => setSelectedShipment(shipment)}
                    >
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-slate-900">{shipment.id}</p>
                        <div className="flex items-center text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                          <span>{shipment.origin}</span>
                          <span className="mx-2">→</span>
                          <span>{shipment.destination}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          shipment.status === ShipmentStatus.IN_TRANSIT ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          shipment.status === ShipmentStatus.PICKUP_PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {shipment.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex space-x-2">
                           <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">S: {shipment.updates.filter(u => u.authorRole === 'SELLER').length}</span>
                           <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">P: {shipment.updates.filter(u => u.authorRole === 'DELIVERY_PARTNER').length}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Full Audit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white min-h-[600px] flex flex-col border border-slate-800 shadow-2xl">
                {selectedShipment ? (
                  <>
                    <div className="mb-6 flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-black mb-1 tracking-tight">Timeline & Feedback</h3>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Operational Pulse: {selectedShipment.id}</p>
                      </div>
                      <div className="flex bg-slate-800 p-1 rounded-xl">
                         {['ALL', 'SELLER', 'PARTNER'].map(f => (
                           <button 
                            key={f}
                            onClick={() => setUpdateFilter(f as any)}
                            className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${updateFilter === f ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                           >
                             {f}
                           </button>
                         ))}
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-6 overflow-y-auto pr-4 no-scrollbar">
                      {filteredUpdates(selectedShipment.updates).map((update) => (
                        <div key={update.id} className="relative pl-8 pb-6 border-l border-slate-800 last:border-0 last:pb-0">
                          <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full border-4 border-slate-900 transition-colors ${
                            update.type === 'SUCCESS' ? 'bg-emerald-500' : 
                            update.type === 'WARNING' ? 'bg-rose-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-500 transition-all">
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                                 update.authorRole === 'SELLER' ? 'bg-purple-500/20 text-purple-400' :
                                 update.authorRole === 'DELIVERY_PARTNER' ? 'bg-blue-500/20 text-blue-400' :
                                 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {update.authorRole}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold">
                                {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-200 leading-relaxed italic">"{update.message}"</p>
                          </div>
                        </div>
                      ))}
                      {filteredUpdates(selectedShipment.updates).length === 0 && (
                        <p className="text-center text-slate-500 font-black text-[10px] uppercase tracking-widest mt-10">No logs for this filter</p>
                      )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800 flex gap-4">
                      <button className="flex-1 bg-blue-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all">REASSIGN PARTNER</button>
                      <button className="bg-slate-800 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">ESCALATE</button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-800 rounded-[2rem] flex items-center justify-center text-3xl shadow-inner">📦</div>
                    <div>
                      <p className="text-lg font-black text-white">Route Inspection</p>
                      <p className="text-sm font-bold text-slate-500 mt-1">Select a shipment to analyze feedback</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fleet Capacity</p>
              <h3 className="text-3xl font-black text-slate-900">{partners.length} Nodes</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Agents</p>
              <h3 className="text-3xl font-black text-emerald-600">{partners.filter(p => p.status === 'ONLINE').length}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fleet Rating</p>
              <h3 className="text-3xl font-black text-amber-500">4.82 ★</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Utilization</p>
              <h3 className="text-3xl font-black text-purple-600">84%</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent / ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Load</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Rating</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partners.map(partner => (
                    <tr 
                      key={partner.id} 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedPartner?.id === partner.id ? 'bg-blue-50/50' : ''}`}
                      onClick={() => setSelectedPartner(partner)}
                    >
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-slate-900">{partner.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{partner.provider}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          partner.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          partner.status === 'ON_BREAK' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {partner.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs font-bold text-slate-700">{partner.activeOrders} Orders</span>
                          <div className="w-24 bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, (partner.activeOrders / 15) * 100)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-amber-500">★</span>
                          <span className="text-xs font-black text-slate-900">{partner.rating}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600">Profile</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-2xl min-h-[500px] flex flex-col">
                {selectedPartner ? (
                  <>
                    <div className="flex flex-col items-center text-center mb-8">
                       <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 text-3xl font-black mb-4">
                         {selectedPartner.name.charAt(0)}
                       </div>
                       <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedPartner.name}</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{selectedPartner.provider} • {selectedPartner.vehicleType}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deliveries</p>
                        <p className="text-xl font-black text-slate-900">1.4K</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">On-Time</p>
                        <p className="text-xl font-black text-emerald-600">97%</p>
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Fleet Feedback</p>
                      <div className="space-y-3">
                        {[1, 2].map(i => (
                          <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs font-medium text-slate-700 italic">"Consistently fast delivery, handled high-value items with care."</p>
                            <p className="text-[9px] font-black text-slate-400 mt-2 uppercase">Verified Dispatch • 2h ago</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                      <button className="flex-1 border border-slate-200 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">MESSAGE</button>
                      <button className="flex-1 bg-rose-50 text-rose-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all">SUSPEND</button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-3xl">🪪</div>
                    <div>
                      <p className="text-lg font-black text-slate-900">Fleet Intel</p>
                      <p className="text-sm font-bold text-slate-500 mt-1">Select an agent to view metrics</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logistics;
