
import React, { useEffect, useState } from 'react';
import { AdminApi } from '../services/api';
import { Offer } from '../types';

const Offers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminApi.getOffers().then(data => {
      setOffers(data);
      setLoading(false);
    });
  }, []);

  const handleUpdate = async (id: string, status: string) => {
    await AdminApi.updateOfferStatus(id, status);
    setOffers(offers.map(o => o.id === id ? { ...o, status: status as any } : o));
  };

  if (loading) return <div className="p-8 font-black text-slate-400">Loading Offer Ledger...</div>;

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Promotion Governance</h2>
          <p className="text-slate-500 font-medium">Control and validate merchant-driven discounts and flash sales</p>
        </div>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-100">
          Create Global Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map(offer => (
          <div key={offer.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-1.5 h-full ${offer.status === 'ACTIVE' ? 'bg-emerald-500' : offer.status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-200'}`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Title</p>
                <h3 className="text-xl font-black text-slate-900">{offer.title}</h3>
                <p className="text-xs font-bold text-blue-600 mt-1">Merchant: {offer.sellerName}</p>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                offer.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {offer.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Discount</p>
                <p className="text-lg font-black text-slate-900">{offer.value}{offer.discountType === 'PERCENTAGE' ? '%' : '$'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Min Order</p>
                <p className="text-lg font-black text-slate-900">${offer.minOrderValue}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expires</p>
                <p className="text-lg font-black text-slate-900">{new Date(offer.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-50">
               {offer.status === 'PENDING' && (
                 <button onClick={() => handleUpdate(offer.id, 'ACTIVE')} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">APPROVE</button>
               )}
               <button onClick={() => handleUpdate(offer.id, 'PAUSED')} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">PAUSE</button>
               <button onClick={() => handleUpdate(offer.id, 'REJECTED')} className="flex-1 border border-rose-100 text-rose-600 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all">TERMINATE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Offers;
