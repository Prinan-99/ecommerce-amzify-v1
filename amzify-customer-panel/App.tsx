
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, Menu, Heart, Star, ArrowRight, 
  ChevronRight, LayoutGrid, List, User, ShoppingBag, Plus, X, ArrowDown, MessageSquare, Bell,
  Home, Sparkles, Filter, SlidersHorizontal, Loader2, Store
} from 'lucide-react';
import { Product, CartItem } from './types';
import CartDrawer from './components/CartDrawer';
import AISearch from './components/AISearch';
import ProductModal from './components/ProductModal';
import CheckoutModal from './components/CheckoutModal';
import PostPurchaseModal from './components/PostPurchaseModal';
import FeedbackModal from './components/FeedbackModal';
import ProfileModal from './components/ProfileModal';
import BecomeSellerModal from './components/BecomeSellerModal';
import LoginPortal from './components/LoginPortal';
import { useAuth } from './context/RealAuthContext';
import { customerApiService } from './services/customerApi';

const App: React.FC = () => {
  // Authentication integration
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  // Role validation - ensure only customers can access this panel
  const hasCustomerAccess = user?.role === 'customer';
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Optimization Features State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isPostPurchaseOpen, setIsPostPurchaseOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBecomeSellerOpen, setIsBecomeSellerOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<{id: string, items: CartItem[], total: number} | null>(null);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && hasCustomerAccess) {
      loadInitialData();
    } else if (!authLoading) {
      // If not authenticated or no access, still load public data
      loadPublicData();
    }
  }, [isAuthenticated, hasCustomerAccess, authLoading]);

  const loadInitialData = async () => {
    try {
      setIsDataLoading(true);
      
      // Load categories and products in parallel
      const [categoriesResponse, productsResponse, cartResponse] = await Promise.all([
        fetch('http://localhost:5000/api/categories').then(res => res.json()),
        fetch('http://localhost:5000/api/products').then(res => res.json()),
        customerApiService.getCart().catch(() => ({ items: [] })) // Cart might be empty
      ]);

      setCategories(categoriesResponse.categories || []);
      setProducts(productsResponse.products || []);
      setCart(cartResponse.items || []);
    } catch (err) {
      setError('Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setIsDataLoading(false);
    }
  };

  const loadPublicData = async () => {
    try {
      setIsDataLoading(true);
      
      // Load categories and products for guest browsing
      const [categoriesResponse, productsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/categories').then(res => res.json()),
        fetch('http://localhost:5000/api/products').then(res => res.json())
      ]);

      setCategories(categoriesResponse.categories || []);
      setProducts(productsResponse.products || []);
      setCart([]); // Empty cart for guests
    } catch (err) {
      setError('Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category_name?.toLowerCase() === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = async (product: Product) => {
    // ALWAYS add to local cart first for instant feedback (guest or authenticated)
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    setIsCartOpen(true);

    // If authenticated, sync with backend
    if (isAuthenticated) {
      try {
        await customerApiService.addToCart(product.id, 1);
        // Reload cart to get updated data from server
        const cartResponse = await customerApiService.getCart();
        setCart(cartResponse.items || []);
      } catch (error) {
        console.error('Add to cart sync error:', error);
        // Local cart is already updated, so continue with demo experience
      }
    }
    // For guests, cart remains in local state - fully functional demo shopping
  };

  const updateQuantity = async (id: string, delta: number) => {
    // Always update local cart immediately for instant feedback
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));

    // If authenticated, sync with backend
    if (isAuthenticated) {
      try {
        const item = cart.find(item => item.id === id);
        if (item) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) {
            await customerApiService.removeFromCart(id);
          } else {
            await customerApiService.updateCartItem(id, newQuantity);
          }
          // Reload cart from server
          const cartResponse = await customerApiService.getCart();
          setCart(cartResponse.items || []);
        }
      } catch (error) {
        console.error('Update cart sync error:', error);
        // Local cart already updated, continue with demo
      }
    }
  };

  const removeFromCart = async (id: string) => {
    // Always update local cart immediately
    setCart(prev => prev.filter(item => item.id !== id));

    // If authenticated, sync with backend
    if (isAuthenticated) {
      try {
        await customerApiService.removeFromCart(id);
        const cartResponse = await customerApiService.getCart();
        setCart(cartResponse.items || []);
      } catch (error) {
        console.error('Remove from cart sync error:', error);
        // Local cart already updated, continue with demo
      }
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async (orderData: any) => {
    try {
      const orderResponse = await customerApiService.createOrder(orderData);
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      setLastOrder({ 
        id: orderResponse.order.order_number, 
        items: [...cart], 
        total 
      });
      setCart([]);
      setIsCheckoutOpen(false);
      setIsPostPurchaseOpen(true);
    } catch (error) {
      console.error('Order creation error:', error);
      // Fallback demo checkout
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const orderId = `AMZ${Math.floor(Math.random() * 90000) + 10000}`;
      setLastOrder({ id: orderId, items: [...cart], total });
      setCart([]);
      setIsCheckoutOpen(false);
      setIsPostPurchaseOpen(true);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Access control - allow guest browsing, require login only for checkout/profile
  if (!isAuthenticated) {
    // Show login portal only if user is trying to access protected features
    if (isCartOpen || isCheckoutOpen || isProfileOpen) {
      return <LoginPortal />;
    }
    // Otherwise allow guest browsing
  }

  // Role validation for authenticated users
  if (isAuthenticated && !hasCustomerAccess) {
    return <LoginPortal />;
  }

  // Loading state
  if (authLoading || isDataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-slate-600">Loading your shopping experience...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={loadInitialData}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Dynamic Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 px-6 ${isScrolled ? 'bg-white/80 backdrop-blur-md h-16 border-b' : 'bg-transparent h-24'}`}>
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isScrolled ? 'bg-slate-900 shadow-lg' : 'bg-white shadow-xl'}`}>
                <span className={`font-black text-lg ${isScrolled ? 'text-white' : 'text-slate-900'}`}>A</span>
              </div>
              <h1 className={`text-lg font-black tracking-tighter hidden sm:block ${!isScrolled && 'text-white'}`}>Amzify</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${isScrolled ? 'bg-slate-50 border-slate-100' : 'bg-white/10 border-white/20'}`}>
              <Search className={`w-4 h-4 ${isScrolled ? 'text-slate-400' : 'text-white/60'}`} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`bg-transparent outline-none text-xs font-bold w-32 ${isScrolled ? 'text-slate-900' : 'text-white'}`}
              />
            </div>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`relative p-3 rounded-2xl transition-all ${isScrolled ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-900 shadow-xl'}`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>

            <button onClick={() => setIsFeedbackOpen(true)} className={`p-3 rounded-2xl border transition-all sm:flex hidden ${isScrolled ? 'border-slate-200 text-slate-400' : 'border-white/20 text-white'} hover:bg-white hover:text-slate-900`}>
              <MessageSquare className="w-5 h-5" />
            </button>

            {isAuthenticated ? (
              <button onClick={() => setIsProfileOpen(true)} className={`p-3 rounded-2xl border transition-all ${isScrolled ? 'border-slate-200 text-slate-400' : 'border-white/20 text-white'} hover:bg-white hover:text-slate-900`}>
                <User className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={() => setIsProfileOpen(true)} className={`px-4 py-2 rounded-2xl border transition-all ${isScrolled ? 'border-slate-200 text-slate-700 bg-white' : 'border-white/20 text-white bg-white/10'} hover:bg-white hover:text-slate-900`}>
                <span className="text-sm font-bold">Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24">
        {/* Hero Section */}
        {!searchQuery && selectedCategory === 'all' && (
          <section className="relative h-[85vh] flex items-end overflow-hidden bg-slate-950">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1920" 
                className="w-full h-full object-cover opacity-60 scale-105"
                alt="Luxury Lifestyle"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 pb-20 relative z-10 w-full">
              <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-3 animate-in slide-in-from-left duration-700">
                  <span className="h-[1px] w-8 bg-indigo-500"></span>
                  <span className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em]">Spring/Summer 2024</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter animate-in slide-in-from-left duration-700 delay-100">
                  Art of<br />Living <span className="text-indigo-500">Lux.</span>
                </h2>
                <div className="flex gap-4">
                  <button 
                    onClick={() => document.getElementById('shop-grid')?.scrollIntoView({behavior:'smooth'})}
                    className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 group active:scale-95 transition-all animate-in slide-in-from-left duration-700 delay-200"
                  >
                    Shop Catalog <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setIsBecomeSellerOpen(true)}
                    className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 group active:scale-95 transition-all animate-in slide-in-from-left duration-700 delay-300"
                  >
                    Become a Seller <Store className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Categories Bar */}
        <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-slate-50 py-4 px-6 overflow-x-auto no-scrollbar flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedCategory === 'all' 
                ? 'bg-slate-900 text-white shadow-xl' 
                : 'bg-slate-50 text-slate-400 hover:text-slate-900'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name.toLowerCase())}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === category.name.toLowerCase() 
                  ? 'bg-slate-900 text-white shadow-xl' 
                  : 'bg-slate-50 text-slate-400 hover:text-slate-900'
              }`}
            >
              {category.name} ({category.products_count})
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div id="shop-grid" className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => setSelectedProduct(product)}
                className="group cursor-pointer flex flex-col animate-in fade-in zoom-in-95 duration-500"
              >
                <div className="relative overflow-hidden bg-slate-100 rounded-[2.5rem] aspect-[3/4] mb-6">
                  <img 
                    src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute bottom-4 right-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                      className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all hover:bg-indigo-600 hover:text-white"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                  {product.is_featured && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">Featured</span>
                    </div>
                  )}
                </div>
                
                <div className="px-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{product.category_name || 'General'}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-black text-slate-900">4.5</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-black text-slate-950">
                      {formatINR(product.price)}
                    </p>
                    {product.compare_price && product.compare_price > product.price && (
                      <p className="text-sm text-slate-400 line-through">
                        {formatINR(product.compare_price)}
                      </p>
                    )}
                  </div>
                  {product.seller_name && (
                    <p className="text-[8px] text-slate-500">by {product.seller_name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black">No artifacts found</h3>
              <p className="text-slate-400 text-sm">Try broadening your search or choosing another category.</p>
            </div>
          )}
        </div>

        {/* Become a Seller Section */}
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[3rem] p-12 text-center text-white">
            <Store className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h3 className="text-3xl font-black mb-4">Want to Sell on Amzify?</h3>
            <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of sellers and reach millions of customers. Start your business journey with us today.
            </p>
            <button 
              onClick={() => setIsBecomeSellerOpen(true)}
              className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl"
            >
              Become a Seller
            </button>
          </div>
        </div>
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-8 py-4 h-20 flex items-center justify-between shadow-2xl md:hidden">
        <button onClick={() => { window.scrollTo({top:0, behavior:'smooth'}); setSelectedCategory('all'); setSearchQuery(''); }} className="flex flex-col items-center gap-1 text-slate-900">
          <Home className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Shop</span>
        </button>
        <button onClick={() => setIsFeedbackOpen(true)} className="flex flex-col items-center gap-1 text-slate-400">
          <MessageSquare className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Feedback</span>
        </button>
        <div className="relative -top-4">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <Heart className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Wish</span>
        </button>
        {isAuthenticated ? (
          <button onClick={() => setIsProfileOpen(true)} className="flex flex-col items-center gap-1 text-slate-400">
            <User className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-tighter">Profile</span>
          </button>
        ) : (
          <button onClick={() => setIsProfileOpen(true)} className="flex flex-col items-center gap-1 text-slate-900">
            <User className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-tighter">Login</span>
          </button>
        )}
      </nav>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onConfirmOrder={handleConfirmOrder}
      />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        isAuthenticated={isAuthenticated}
        onLoginPrompt={() => setIsProfileOpen(true)}
      />

      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={addToCart} 
      />

      <PostPurchaseModal
        isOpen={isPostPurchaseOpen}
        onClose={() => setIsPostPurchaseOpen(false)}
        orderId={lastOrder?.id || ''}
        items={lastOrder?.items || []}
        total={lastOrder?.total || 0}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmit={async (data) => {
          try {
            const response = await fetch('http://localhost:5000/api/auth/feedback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(isAuthenticated && { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` })
              },
              body: JSON.stringify({
                rating: data.rating,
                message: data.comment,
                type: 'general'
              })
            });

            if (response.ok) {
              console.log('Feedback submitted successfully');
              // Show success message or notification
            } else {
              console.error('Failed to submit feedback');
            }
          } catch (error) {
            console.error('Feedback submission error:', error);
          }
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <BecomeSellerModal
        isOpen={isBecomeSellerOpen}
        onClose={() => setIsBecomeSellerOpen(false)}
      />

      <AISearch />
    </div>
  );
};

export default App;
