
import React, { useEffect, useState } from 'react';
import { AdminApi } from '../services/api';
import { Ticket } from '../types';

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminApi.getTickets().then(data => {
      setTickets(data);
      setLoading(false);
    });
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    await AdminApi.updateTicketStatus(id, status);
    setTickets(tickets.map(t => t.id === id ? { ...t, status: status as any } : t));
  };

  if (loading) return <div className="p-8 font-black text-slate-400 uppercase tracking-widest">Opening Support Ledger...</div>;

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h2 className="text-3xl font-black text-slate-900">Seller Concierge</h2>
        <p className="text-slate-500 font-medium">Resolve merchant support tickets and SLA escalations</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue / Merchant</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map(ticket => (
              <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                   <p className="text-sm font-black text-slate-900">{ticket.subject}</p>
                   <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{ticket.sellerName}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                    ticket.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{ticket.category}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                    ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => handleStatusUpdate(ticket.id, 'IN_PROGRESS')} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Claim</button>
                    <button onClick={() => handleStatusUpdate(ticket.id, 'RESOLVED')} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline">Resolve</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tickets;
