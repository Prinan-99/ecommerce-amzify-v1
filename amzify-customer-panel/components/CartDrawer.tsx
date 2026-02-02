
import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ChevronRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  isAuthenticated?: boolean;
  onLoginPrompt?: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout, isAuthenticated = true, onLoginPrompt }) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <div className="p-8 flex items-center justify-between border-b border-slate-50">
          <div>
            <h2 className="text-2xl font-black tracking-tighter flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" /> Your Bag
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              {items.length} artifacts selected
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-slate-200" />
              </div>
              <div>
                <h3 className="text-xl font-black">Your bag is empty</h3>
                <p className="text-slate-400 text-sm mt-2">Start your collection with our latest artifacts.</p>
              </div>
              <button onClick={onClose} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Discover Now</button>
            </div>
          ) : (
            <div className="space-y-8">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 items-start group">
                  <div className="w-28 h-36 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 shadow-sm border border-slate-100">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                      <button 
                        onClick={() => onRemove(item.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm font-black text-indigo-600 mb-4">{formatINR(item.price)}</p>
                    
                    <div className="flex items-center bg-slate-50 w-fit p-1 rounded-xl border border-slate-200">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-5 font-black text-xs">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 border-t border-slate-50 bg-white space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                <span>Sub-Investment</span>
                <span className="text-slate-900">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                <span>Shipping</span>
                <span className="text-slate-900">Complimentary</span>
              </div>
              <div className="pt-4 flex justify-between items-end">
                <span className="text-sm font-black uppercase text-slate-950 tracking-widest">Total Investment</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{formatINR(subtotal)}</span>
              </div>
            </div>
            
            <button 
              onClick={isAuthenticated ? onCheckout : onLoginPrompt}
              className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 group"
            >
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {!isAuthenticated && (
              <p className="text-[9px] text-center text-slate-600 font-medium">Create an account to complete your purchase</p>
            )}
            <p className="text-[9px] text-center text-slate-400 font-black uppercase tracking-widest">Secure Checkout Protocol Active</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
