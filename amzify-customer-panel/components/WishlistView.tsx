import React from 'react';
import { WishlistItem } from '../types';
import { Trash2, ShoppingCart, Star, ArrowLeft, Heart, Sparkles } from 'lucide-react';

interface WishlistViewProps {
  items: WishlistItem[];
  onRemove: (id: string) => void;
  onAddToCart: (item: WishlistItem) => void;
  onItemClick: (item: WishlistItem) => void;
  onBack: () => void;
}

const WishlistView: React.FC<WishlistViewProps> = ({ items, onRemove, onAddToCart, onItemClick, onBack }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.4em] mb-3">Your Curation</p>
          <h2 className="text-5xl font-serif text-gray-900">The Collection</h2>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-gray-100 shadow-sm">
           <span className="pl-6 pr-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Vaulted Items</span>
           <div className="bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl text-sm font-black tracking-tighter shadow-xl">
             {items.length} PIECES
           </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-40 flex flex-col items-center text-center px-12 bg-white rounded-[4rem] border border-gray-50 shadow-sm">
          <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center text-gray-200 mb-8 border border-gray-100">
            <Heart size={56} strokeWidth={1} />
          </div>
          <h3 className="text-3xl font-serif text-gray-900 mb-4">An Empty Canvas</h3>
          <p className="text-sm text-gray-400 mb-12 font-medium max-w-sm mx-auto leading-relaxed">Begin curating your future lifestyle. Every great collection starts with a single piece of inspiration.</p>
          <button 
            onClick={onBack}
            className="px-12 py-5 gold-gradient text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-[#C5A059]/30 active:scale-95 transition-all"
          >
            Explore Masterpieces
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {items.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-[3rem] overflow-hidden border border-gray-50 shadow-sm group cursor-pointer hover:border-[#C5A059]/30 hover:shadow-[0_40px_80px_-20px_rgba(197,160,89,0.15)] transition-all duration-700 flex flex-col shimmer"
              onClick={() => onItemClick(item)}
            >
              <div className="relative h-72 overflow-hidden bg-gray-50">
                <img 
                  src={item.image.replace('w=200', 'w=600')} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-6 left-6">
                   <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black text-[#C5A059] uppercase tracking-widest border border-[#C5A059]/10">
                     {item.category}
                   </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.id);
                  }}
                  className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-md text-gray-300 hover:text-red-500 rounded-2xl shadow-xl transition-all border border-gray-100 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className={`${i < Math.floor(item.rating) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.rating}</span>
                  </div>
                  <h4 className="text-2xl font-serif text-gray-900 mb-2 leading-tight">{item.name}</h4>
                  <p className="text-xs text-gray-400 font-medium mb-6">Exclusively curated for your Signature profile.</p>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Acquisition</span>
                    <span className="text-2xl font-bold text-gray-900 tracking-tighter">₹{item.price.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(item);
                    }}
                    className="flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C5A059] transition-all shadow-xl shadow-black/10 active:scale-95 group/btn"
                  >
                    <ShoppingCart size={14} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                    Acquire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style>{`
        .gold-gradient {
          background: linear-gradient(135deg, #C5A059 0%, #E6C875 50%, #C5A059 100%);
        }
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(197, 160, 89, 0.1), transparent);
          transition: left 0.5s;
        }
        .shimmer:hover::before {
          left: 100%;
        }
      `}</style>
    </div>
  );
};

export default WishlistView;