
import React from 'react';
import { CheckCircle2, Download, ArrowRight, Mail, ShieldCheck, Printer } from 'lucide-react';
import { CartItem } from '../types';

interface PostPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  items: CartItem[];
  total: number;
}

const PostPurchaseModal: React.FC<PostPurchaseModalProps> = ({ isOpen, onClose, orderId, items, total }) => {
  if (!isOpen) return null;

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
        <div className="bg-indigo-600 p-12 text-white text-center space-y-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Gratitude, Artifact Secured.</h2>
          <p className="text-indigo-100 text-sm font-medium uppercase tracking-[0.2em]">Order Registry: {orderId}</p>
        </div>

        <div className="p-10 space-y-8 overflow-y-auto max-h-[50vh] custom-scrollbar">
          <div className="space-y-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-4">Investment Summary</p>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img src={item.images[0]} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-black text-slate-900">{formatINR(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Artifact Total</span>
              <span className="text-slate-900">{formatINR(total)}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Logistics</span>
              <span className="text-indigo-600">Complimentary</span>
            </div>
            <div className="flex justify-between items-end pt-4 border-t border-slate-200">
              <span className="text-xs font-black uppercase tracking-widest text-slate-900">Total Settlement</span>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">{formatINR(total)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border border-indigo-50 rounded-2xl bg-indigo-50/30">
            <Mail className="w-5 h-5 text-indigo-600" />
            <p className="text-xs font-medium text-slate-600">A digital receipt and tracking protocol has been dispatched to your registered communique.</p>
          </div>
        </div>

        <div className="p-10 border-t border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <button className="flex-1 py-5 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
          <button onClick={onClose} className="flex-[2] py-5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-3">
            Continue Journey <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostPurchaseModal;
