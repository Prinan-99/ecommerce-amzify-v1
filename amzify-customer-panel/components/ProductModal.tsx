
import React, { useState } from 'react';
import { X, Star, ShoppingBag, Truck, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  // Ensure images array exists
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'];
  
  const productName = product.name || product.title || 'Product';
  const productCategory = product.category_name || product.category || 'General';
  const productRating = product.rating || 4.5;

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(product);
    
    // Brief delay to show the feedback animation before closing
    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 600);
  };

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZooming(false);
    setActiveImageIdx(prev => (prev + 1) % productImages.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZooming(false);
    setActiveImageIdx(prev => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-12">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-6xl md:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom md:zoom-in-95 duration-500 max-h-[95vh] md:max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-10 p-3 bg-white/80 backdrop-blur-md rounded-2xl text-slate-900 shadow-xl hidden md:block hover:bg-white transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Mobile Handle */}
        <div className="md:hidden w-full h-8 flex items-center justify-center pt-2" onClick={onClose}>
           <div className="w-12 h-1 bg-slate-200 rounded-full"></div>
        </div>

        {/* Visual Content - Carousel with Zoom */}
        <div 
          className="w-full md:w-1/2 bg-slate-50 relative overflow-hidden flex-shrink-0 aspect-[4/5] md:aspect-auto cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
        >
          <img 
            src={productImages[activeImageIdx]} 
            alt={productName} 
            className={`w-full h-full object-cover transition-transform will-change-transform ${isZooming ? 'duration-200' : 'duration-700'}`}
            style={{
              transform: isZooming ? 'scale(2)' : 'scale(1)',
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
            }}
          />
          
          <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
            <button 
              onClick={prevImg}
              className="p-3 bg-white/30 backdrop-blur-md text-white rounded-full hover:bg-white/50 transition-all pointer-events-auto"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextImg}
              className="p-3 bg-white/30 backdrop-blur-md text-white rounded-full hover:bg-white/50 transition-all pointer-events-auto"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {productImages.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all ${i === activeImageIdx ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        {/* Narrative Content */}
        <div className="flex-1 p-8 md:p-16 overflow-y-auto custom-scrollbar bg-white flex flex-col">
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                  {productCategory}
                </span>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black text-slate-900">{productRating}</span>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">{productName}</h2>
              <p className="text-3xl font-black text-indigo-600 mt-2">
                {formatINR(product.price)}
              </p>
            </div>

            <p className="text-slate-500 leading-relaxed text-lg font-medium">
              {product.description || 'Premium quality product with excellent features and craftsmanship.'}
            </p>

            <div className="grid grid-cols-2 gap-4 py-8 border-y border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900"><Truck className="w-5 h-5" /></div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-900">Complimentary</p>
                  <p className="text-[9px] font-bold text-slate-400">Express Delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900"><ShieldCheck className="w-5 h-5" /></div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-900">Authentic</p>
                  <p className="text-[9px] font-bold text-slate-400">Lifetime Warranty</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-12 md:pb-0">
              <button 
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-[2] py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-2xl flex items-center justify-center gap-4 group relative overflow-hidden active:scale-95 ${
                  isAdding 
                  ? 'bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-95' 
                  : 'bg-slate-950 text-white hover:bg-indigo-600 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                }`}
              >
                {isAdding ? (
                  <>Added to Bag <Check className="w-4 h-4 animate-in zoom-in duration-300" /></>
                ) : (
                  <>Add to Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
                
                {/* Visual ripple/glow effect layer */}
                <div className={`absolute inset-0 bg-white/20 transition-opacity duration-300 ${isAdding ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
