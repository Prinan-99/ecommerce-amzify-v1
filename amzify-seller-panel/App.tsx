import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Box, ShoppingCart, Users, TrendingUp, ArrowUpRight, 
  Plus, Search, MoreHorizontal, Zap, Megaphone, Mail, Sparkles, Loader2,
  Calendar as CalendarIcon, Download, QrCode, MapPin, Package,
  Trash2, ToggleLeft, ToggleRight, Eye, MousePointerClick, 
  Activity, ArrowRight, RefreshCw, Layers, ShieldCheck, Ban, Reply,
  AlertTriangle, User, LogOut, Edit, DollarSign, TrendingDown,
  FileText, MessageSquare, Settings, Camera, Upload, Truck, Navigation,
  Clock, CheckCircle, XCircle, Link, Star, Heart, Bell, Save, X,
  CreditCard, Calendar
} from 'lucide-react';
import { useAuth } from './context/RealAuthContext';
import LoginPortal from './components/LoginPortal';
import ProfileModal from './components/ProfileModal';
import ProductModal from './components/ProductModal';
import RevenueDashboard from './components/RevenueDashboard';
import SocialMediaManager from './components/SocialMediaManager';
import AIGrowthAssistant from './components/AIGrowthAssistant';
import { FullSellerDashboard } from './components/FullSellerDashboard';
import { ModernSellerDashboard } from './components/ModernSellerDashboard';
import { LogisticsTab } from './components/LogisticsTab';
import { sellerApiService } from './services/sellerApi';
import { analytics } from './services/analytics';

const App: React.FC = () => {
  // Authentication integration
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  // Role validation - ensure only sellers can access this dashboard
  const hasSellerAccess = user?.role === 'seller';
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'marketing' | 'logistics' | 'support' | 'revenue' | 'social'>('dashboard');
  
  // Navigation handler with analytics
  const handleTabChange = (tab: typeof activeTab) => {
    analytics.trackNavigation(activeTab, tab);
    setActiveTab(tab);
  };
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const updateOrderStatusInApp = (orderId: string, status: string) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status } : order
    ));
  };
  const updateBulkStatusInApp = (orderIds: string[], status: string) => {
    setOrders(prev => prev.map(order =>
      orderIds.includes(order.id) ? { ...order, status } : order
    ));
  };
  
  // Modal states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [appSuccessMessage, setAppSuccessMessage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; categoryId: string | null }>({ show: false, categoryId: null });
  const [navigateToCategoriesTab, setNavigateToCategoriesTab] = useState(false);

  const refreshOrders = async () => {
    try {
      const ordersResponse = await sellerApiService.getMyOrders().catch(() => null);
      if (ordersResponse?.orders) {
        setOrders(ordersResponse.orders);
      }
    } catch {
      // Silent refresh: no UI error
    }
  };

  const refreshProducts = async () => {
    try {
      const productsResponse = await sellerApiService.getMyProducts().catch(() => null);
      if (productsResponse?.products) {
        setProducts(productsResponse.products);
      }
    } catch {
      // Silent refresh: no UI error
    }
  };

  // Listen for navigate to categories event
  useEffect(() => {
    const handleNavigateToCategories = () => {
      handleTabChange('products');
      setNavigateToCategoriesTab(true);
    };
    
    window.addEventListener('navigate-to-categories', handleNavigateToCategories);
    return () => window.removeEventListener('navigate-to-categories', handleNavigateToCategories);
  }, []);

  // Load seller data
  useEffect(() => {
    if (isAuthenticated && hasSellerAccess) {
      loadSellerData();
      loadNotifications();
      // Initialize analytics with seller data
      analytics.init();
      analytics.identify(user?.id, {
        email: user?.email,
        name: user?.name,
        role: user?.role,
        store_name: user?.storeName,
        seller_tier: user?.tier,
        signup_date: user?.createdAt
      });
    } else if (!authLoading) {
      // Auth check complete, no need to load data for non-sellers
      setIsDataLoading(false);
    }
  }, [isAuthenticated, hasSellerAccess, authLoading, user]);

  const loadSellerData = async () => {
    try {
      setIsDataLoading(true);
      
      // Set a timeout to prevent indefinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const dataPromise = Promise.all([
        sellerApiService.getSellerStats().catch(() => null),
        sellerApiService.getMyProducts().catch(() => ({ products: [] })),
        sellerApiService.getMyOrders().catch(() => ({ orders: [] }))
      ]);

      const [statsResponse, productsResponse, ordersResponse] = await Promise.race([
        dataPromise,
        timeoutPromise
      ]) as any;

      setStats(statsResponse || {
        total_revenue: 125000,
        total_orders: 234,
        total_products: 45,
        total_customers: 1247,
        monthly_revenue: 45000,
        growth_rate: 15.2
      });
      setProducts(productsResponse.products || []);
      setOrders(ordersResponse.orders || []);
    } catch (error) {
      // On error, set default empty data
      setStats({
        total_revenue: 0,
        total_orders: 0,
        total_products: 0,
        total_customers: 0,
        monthly_revenue: 0,
        growth_rate: 0
      });
      setProducts([]);
      setOrders([]);
      setAppSuccessMessage('Unable to load data. Please refresh the page.');
      setTimeout(() => setAppSuccessMessage(null), 3000);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Background refresh for orders
  useEffect(() => {
    if (!isAuthenticated || !hasSellerAccess) return;

    if (activeTab === 'orders') {
      refreshOrders();
    }

    const intervalId = setInterval(() => {
      refreshOrders();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [activeTab, isAuthenticated, hasSellerAccess]);

  // Background refresh for products
  useEffect(() => {
    if (!isAuthenticated || !hasSellerAccess) return;

    if (activeTab === 'products') {
      refreshProducts();
    }

    const intervalId = setInterval(() => {
      refreshProducts();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [activeTab, isAuthenticated, hasSellerAccess]);

  const loadNotifications = async () => {
    // Mock notifications for demo
    setNotifications([
      {
        id: '1',
        type: 'order',
        title: 'New Order Received',
        message: 'Order #AMZ12345 for Wireless Headphones Pro',
        time: '2 minutes ago',
        read: false
      },
      {
        id: '2',
        type: 'product',
        title: 'Product Approved',
        message: 'Your Smart Fitness Watch has been approved',
        time: '1 hour ago',
        read: false
      },
      {
        id: '3',
        type: 'payout',
        title: 'Payout Processed',
        message: '₹38,000 has been transferred to your account',
        time: '3 hours ago',
        read: true
      }
    ]);
  };

  const handleProductSave = () => {
    loadSellerData();
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-bold">Loading seller panel...</p>
        </div>
      </div>
    );
  }

  // Access control - redirect or show error if user doesn't have seller access
  if (!isAuthenticated) {
    return <LoginPortal />;
  }

  if (!hasSellerAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl text-center max-w-md">
          <Ban className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black tracking-tighter text-slate-950 mb-4">Access Denied</h2>
          <p className="text-sm text-slate-600 mb-8">You don't have permission to access the seller panel. Only sellers can view this page.</p>
          <div className="flex gap-4">
            <button 
              onClick={logout}
              className="flex-1 py-4 bg-slate-100 text-slate-950 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Logout
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex-1 py-4 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <h1 className="font-black text-sm uppercase tracking-widest">Amzify Seller Panel</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <button 
            onClick={() => {
              setSelectedProduct(null);
              setIsProductModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Product
          </button>

          {/* Profile */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Seller</p>
              <p className="text-xs font-black text-slate-950 mt-1">
                {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'Unknown Seller'}
              </p>
              {user?.company_name && (
                <p className="text-[9px] font-medium text-slate-500">{user.company_name}</p>
              )}
            </div>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'S'}
            </button>
            <button 
              onClick={logout}
              className="ml-2 p-3 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="max-w-[1440px] mx-auto p-6">
        <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-x-auto no-scrollbar flex gap-1 mb-8">
          {([
            'dashboard', 'products', 'orders', 'revenue', 'customers', 
            'marketing', 'social', 'logistics', 'support'
          ] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => handleTabChange(tab)} 
              className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-950'
              }`}
            >
              {tab === 'marketing' ? 'Digital Marketing' : 
               tab === 'social' ? 'Social Media' :
               tab === 'revenue' ? 'Revenue & Payouts' : tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[70vh]">
          {authLoading || isDataLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                <p className="text-slate-600">Loading your seller dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardTab stats={stats} onEditProduct={handleEditProduct} onViewOrder={(orderId) => console.log('View order:', orderId)} onNavigate={handleTabChange} />}
              {activeTab === 'products' && <ProductsTab products={products} onRefresh={loadSellerData} onEdit={handleEditProduct} onAdd={handleAddProduct} navigateToCategories={navigateToCategoriesTab} onCategoriesNavigated={() => setNavigateToCategoriesTab(false)} />}
              {activeTab === 'orders' && (
                <OrdersTab
                  orders={orders}
                  onRefresh={loadSellerData}
                  onStatusUpdated={updateOrderStatusInApp}
                  onBulkStatusUpdated={updateBulkStatusInApp}
                />
              )}
              {activeTab === 'revenue' && <RevenueDashboard />}
              {activeTab === 'customers' && <CustomersTab />}
              {activeTab === 'marketing' && <MarketingTab />}
              {activeTab === 'social' && <SocialMediaManager />}
              {activeTab === 'logistics' && <LogisticsTab />}
              {activeTab === 'support' && <SupportTab />}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={handleProductSave}
        onSuccess={(message) => {
          setAppSuccessMessage(message);
          setTimeout(() => setAppSuccessMessage(null), 3000);
        }}
      />

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

// Dashboard Tab Component - Now using FullSellerDashboard
const DashboardTab: React.FC<{ 
  stats: any;
  onEditProduct?: (productId: string) => void;
  onViewOrder?: (orderId: string) => void;
  onNavigate?: (tab: string) => void;
}> = ({ stats, onEditProduct, onViewOrder, onNavigate }) => {
  return (
    <ModernSellerDashboard onNavigate={onNavigate} />
  );
};

// Products Tab Component
const ProductsTab: React.FC<{ 
  products: any[]; 
  onRefresh: () => void; 
  onEdit: (product: any) => void; 
  onAdd: () => void;
  navigateToCategories?: boolean;
  onCategoriesNavigated?: () => void;
}> = ({ products, onRefresh, onEdit, onAdd, navigateToCategories, onCategoriesNavigated }) => {
  const [subTab, setSubTab] = useState<'products' | 'categories'>('products');
  const [categories, setCategories] = useState<any[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [editingCategoryProducts, setEditingCategoryProducts] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; categoryId: string | null }>({ show: false, categoryId: null });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle navigation to categories from product modal
  useEffect(() => {
    if (navigateToCategories) {
      setSubTab('categories');
      setIsAddingCategory(true);
      onCategoriesNavigated?.();
    }
  }, [navigateToCategories, onCategoriesNavigated]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await sellerApiService.request('/categories/seller/my-categories');
      setCategories(response.categories || []);
    } catch (error) {
      // Error handled silently
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    
    if (!showProductSelector) {
      // First step: show product selector
      console.log('Showing product selector');
      setShowProductSelector(true);
      return;
    }
    
    // Second step: create category with selected products
    try {
      console.log('Creating category:', newCategoryName);
      const result = await sellerApiService.request('/categories', {
        method: 'POST',
        body: JSON.stringify({ 
          name: newCategoryName,
          slug: newCategoryName.toLowerCase().replace(/\s+/g, '-')
        }),
      });
      
      console.log('Category created:', result);
      
      // Update selected products with the new category
      if (selectedProducts.length > 0 && result.category) {
        console.log('Updating products with category:', selectedProducts);
        await Promise.all(
          selectedProducts.map(productId =>
            sellerApiService.updateProduct(productId, { category_id: result.category.id })
          )
        );
      }
      
      setNewCategoryName('');
      setIsAddingCategory(false);
      setShowProductSelector(false);
      setSelectedProducts([]);
      setSuccessMessage('Category created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadCategories();
      onRefresh(); // Refresh products to show updated categories
    } catch (error) {
      setSuccessMessage(`Error creating category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleUpdateCategory = async (categoryId: string, name: string) => {
    try {
      await sellerApiService.request(`/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-')
        }),
      });
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    console.log('Delete button clicked for category:', categoryId);
    setDeleteConfirm({ show: true, categoryId });
  };

  const confirmDeleteCategory = async () => {
    if (!deleteConfirm.categoryId) return;
    try {
      console.log('Sending DELETE request to:', `/categories/${deleteConfirm.categoryId}`);
      const response = await sellerApiService.request(`/categories/${deleteConfirm.categoryId}`, {
        method: 'DELETE',
      });
      console.log('Delete response:', response);
      loadCategories();
      setDeleteConfirm({ show: false, categoryId: null });
      setSuccessMessage('Category deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to delete category. Please try again.';
      setDeleteConfirm({ show: false, categoryId: null });
      setSuccessMessage(errorMessage);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  return (
    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
      {/* Sub Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('products')}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              subTab === 'products' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Products
          </button>
          <button
            onClick={() => setSubTab('categories')}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              subTab === 'categories' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 inline mr-2" />
            Categories
          </button>
        </div>
        {subTab === 'products' && (
          <button 
            onClick={onAdd}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Product
          </button>
        )}
        {subTab === 'categories' && (
          <button 
            onClick={() => setIsAddingCategory(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Category
          </button>
        )}
      </div>

      {/* Products View */}
      {subTab === 'products' && (
        <>
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Box className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-slate-900 mb-2">No products yet</h4>
              <p className="text-slate-600 mb-6">Start by adding your first product to the marketplace</p>
              <button 
                onClick={onAdd}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                  <div className="aspect-square bg-slate-100 rounded-xl mb-4 overflow-hidden">
                    <img 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">{product.name}</h4>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-black text-slate-900">₹{product.price}</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onEdit(product)}
                      className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
                      type="button"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Categories View */}
      {subTab === 'categories' && (
        <div>
          {isAddingCategory && (
            <div className="mb-6 p-6 bg-slate-50 rounded-2xl border-2 border-indigo-200">
              <h4 className="font-bold text-slate-900 mb-4">
                {!showProductSelector ? 'Add New Category' : 'Select Products for Category'}
              </h4>
              
              {!showProductSelector ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name (e.g., Electronics, Clothing)"
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                      setShowProductSelector(false);
                      setSelectedProducts([]);
                    }}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-600 mb-4">
                    Select products to add to "{newCategoryName}" (you can add more products later)
                  </p>
                  
                  {products.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-xl border border-slate-200">
                      <p className="text-slate-600">No products available. You can add products later.</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto bg-white rounded-xl border border-slate-200 p-4 space-y-2 mb-4">
                      {products.map((product) => (
                        <label
                          key={product.id}
                          className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{product.name}</p>
                            <p className="text-sm text-slate-500">₹{product.price}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddCategory}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
                    >
                      <Save className="w-4 h-4 inline mr-2" />
                      Create Category {selectedProducts.length > 0 && `with ${selectedProducts.length} product(s)`}
                    </button>
                    <button
                      onClick={() => {
                        setShowProductSelector(false);
                        setSelectedProducts([]);
                      }}
                      className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-all"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {categories.length === 0 ? (
            <div className="text-center py-16">
              <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-slate-900 mb-2">No categories yet</h4>
              <p className="text-slate-600 mb-6">Create categories to organize your products</p>
              <button 
                onClick={() => setIsAddingCategory(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
              >
                Create Your First Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="p-6 border border-slate-200 rounded-2xl hover:shadow-lg transition-all">
                  {editingCategory?.id === category.id ? (
                    <div className="space-y-3">
                      {!editingCategoryProducts ? (
                        <>
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateCategory(category.id, editingCategory.name)}
                              className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
                            >
                              Save Name
                            </button>
                            <button
                              onClick={() => {
                                setEditingCategoryProducts(true);
                                // Load current products in this category
                                const categoryProducts = products
                                  .filter(p => p.category_id === category.id)
                                  .map(p => p.id);
                                setSelectedProducts(categoryProducts);
                              }}
                              className="flex-1 px-3 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-all"
                            >
                              <Package className="w-3 h-3 inline mr-1" />
                              Manage Products
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <h5 className="font-medium text-slate-900 mb-2">Select products for "{editingCategory.name}"</h5>
                          <div className="max-h-64 overflow-y-auto bg-white rounded-lg border border-slate-200 p-2 space-y-1 mb-3">
                            {products.map((product) => (
                              <label
                                key={product.id}
                                className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedProducts.includes(product.id)}
                                  onChange={() => toggleProductSelection(product.id)}
                                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                />
                                <div className="flex-1 text-sm">
                                  <p className="font-medium text-slate-900">{product.name}</p>
                                  <p className="text-xs text-slate-500">₹{product.price}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                // Update all products with the category
                                await Promise.all([
                                  // Add category to selected products
                                  ...selectedProducts.map(productId =>
                                    sellerApiService.updateProduct(productId, { category_id: category.id })
                                  ),
                                  // Remove category from unselected products
                                  ...products
                                    .filter(p => p.category_id === category.id && !selectedProducts.includes(p.id))
                                    .map(p => sellerApiService.updateProduct(p.id, { category_id: null }))
                                ]);
                                setEditingCategory(null);
                                setEditingCategoryProducts(false);
                                setSelectedProducts([]);
                                onRefresh();
                              }}
                              className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
                            >
                              Save Products
                            </button>
                            <button
                              onClick={() => {
                                setEditingCategoryProducts(false);
                                setSelectedProducts([]);
                              }}
                              className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-all"
                            >
                              Back
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-slate-900 mb-1">{category.name}</h4>
                          <p className="text-xs text-slate-500">{category.slug}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingCategory(category)}
                          className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all"
                        >
                          <Edit className="w-3 h-3 inline mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Success Toast Notification */}
      {successMessage && (
        <div className="fixed top-8 right-8 z-50 animate-slide-in-right">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {/* Delete Category Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Category?</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this category? Products in this category will need to be recategorized.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteConfirm({ show: false, categoryId: null })}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Orders Tab Component
const OrdersTab: React.FC<{ orders: any[]; onRefresh: () => void; onStatusUpdated: (orderId: string, status: string) => void; onBulkStatusUpdated: (orderIds: string[], status: string) => void }> = ({ orders, onRefresh, onStatusUpdated, onBulkStatusUpdated }) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localOrders, setLocalOrders] = useState<any[]>(orders);

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const showToast = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/seller/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      setLocalOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      onStatusUpdated(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}`);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      showToast('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;
    
    setIsUpdating(true);
    try {
      await Promise.all(
        selectedOrders.map(orderId => 
          fetch(`http://localhost:5000/api/orders/seller/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ status: bulkAction })
          })
        )
      );
      setLocalOrders(prev => prev.map(order =>
        selectedOrders.includes(order.id) ? { ...order, status: bulkAction } : order
      ));
      onBulkStatusUpdated(selectedOrders, bulkAction);
      showToast(`${selectedOrders.length} orders updated to ${bulkAction}`);
      setSelectedOrders([]);
      setBulkAction('');
    } catch (error) {
      showToast('Failed to update orders');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrintInvoice = (order: any) => {
    // Create invoice content
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) return;

    invoiceWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p>Order #${order.order_number}</p>
          <p>Date: ${new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <div class="details">
          <h3>Customer Details</h3>
          <p>${order.first_name} ${order.last_name}</p>
          <p>${order.email}</p>
          <p>${order.phone}</p>
        </div>
        <div class="details">
          <h3>Shipping Address</h3>
          <p>${order.shipping_address?.street_address || ''}</p>
          <p>${order.shipping_address?.city || ''}, ${order.shipping_address?.state || ''}</p>
          <p>${order.shipping_address?.postal_code || ''}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map((item: any) => `
              <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.unit_price}</td>
                <td>₹${item.total_price}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          Total: ${formatINR(order.my_total || order.total_amount)}
        </div>
      </body>
      </html>
    `);
    invoiceWindow.document.close();
    invoiceWindow.print();
  };

  // Filter and search orders
  const filteredOrders = localOrders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.first_name} ${order.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const orderStats = {
    total: localOrders.length,
    pending: localOrders.filter(o => o.status === 'pending').length,
    processing: localOrders.filter(o => o.status === 'processing').length,
    shipped: localOrders.filter(o => o.status === 'shipped').length,
    delivered: localOrders.filter(o => o.status === 'delivered').length,
    cancelled: localOrders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <>
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-black tracking-tighter">Order Management</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div 
            onClick={() => setFilterStatus('all')}
            className={`p-4 rounded-2xl cursor-pointer transition-all ${filterStatus === 'all' ? 'bg-indigo-100 border-2 border-indigo-600' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}`}
          >
            <p className="text-2xl font-black text-slate-900">{orderStats.total}</p>
            <p className="text-xs font-medium text-slate-600">Total Orders</p>
          </div>
          <div 
            onClick={() => setFilterStatus('pending')}
            className={`p-4 rounded-2xl cursor-pointer transition-all ${filterStatus === 'pending' ? 'bg-orange-100 border-2 border-orange-600' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}`}
          >
            <p className="text-2xl font-black text-orange-600">{orderStats.pending}</p>
            <p className="text-xs font-medium text-slate-600">Pending</p>
          </div>
          <div 
            onClick={() => setFilterStatus('processing')}
            className={`p-4 rounded-2xl cursor-pointer transition-all ${filterStatus === 'processing' ? 'bg-yellow-100 border-2 border-yellow-600' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}`}
          >
            <p className="text-2xl font-black text-yellow-600">{orderStats.processing}</p>
            <p className="text-xs font-medium text-slate-600">Processing</p>
          </div>
          <div 
            onClick={() => setFilterStatus('shipped')}
            className={`p-4 rounded-2xl cursor-pointer transition-all ${filterStatus === 'shipped' ? 'bg-blue-100 border-2 border-blue-600' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}`}
          >
            <p className="text-2xl font-black text-blue-600">{orderStats.shipped}</p>
            <p className="text-xs font-medium text-slate-600">Shipped</p>
          </div>
          <div 
            onClick={() => setFilterStatus('delivered')}
            className={`p-4 rounded-2xl cursor-pointer transition-all ${filterStatus === 'delivered' ? 'bg-green-100 border-2 border-green-600' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}`}
          >
            <p className="text-2xl font-black text-green-600">{orderStats.delivered}</p>
            <p className="text-xs font-medium text-slate-600">Delivered</p>
          </div>
          <div 
            onClick={() => setFilterStatus('cancelled')}
            className={`p-4 rounded-2xl cursor-pointer transition-all ${filterStatus === 'cancelled' ? 'bg-red-100 border-2 border-red-600' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}`}
          >
            <p className="text-2xl font-black text-red-600">{orderStats.cancelled}</p>
            <p className="text-xs font-medium text-slate-600">Cancelled</p>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-2xl flex items-center gap-4">
            <p className="text-sm font-medium text-slate-900">{selectedOrders.length} selected</p>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">Select Action</option>
              <option value="processing">Mark as Processing</option>
              <option value="shipped">Mark as Shipped</option>
              <option value="delivered">Mark as Delivered</option>
              <option value="cancelled">Cancel Orders</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || isUpdating}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              Apply
            </button>
            <button
              onClick={() => setSelectedOrders([])}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-all"
            >
              Clear
            </button>
          </div>
        )}
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-slate-900 mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No matching orders' : 'No orders yet'}
            </h4>
            <p className="text-slate-600">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your filters or search query'
                : 'Orders will appear here when customers purchase your products'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders([...selectedOrders, order.id]);
                      } else {
                        setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                      }
                    }}
                    className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">Order #{order.order_number}</h4>
                        <p className="text-slate-600 text-sm">{order.first_name} {order.last_name}</p>
                        <p className="text-slate-500 text-xs">{order.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-slate-900">{formatINR(order.my_total || order.total_amount)}</p>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          disabled={isUpdating}
                          className={`mt-2 px-3 py-1 rounded-lg text-xs font-medium border-2 outline-none cursor-pointer ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-orange-100 text-orange-800 border-orange-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        <p className="mb-1">
                          <Package className="w-4 h-4 inline mr-1" />
                          {order.my_items_count || 1} item(s)
                        </p>
                        <p className="mb-1">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {new Date(order.created_at).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p>
                          <CreditCard className="w-4 h-4 inline mr-1" />
                          {order.payment_method?.toUpperCase() || 'COD'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsOrderModalOpen(true);
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
                        >
                          <Eye className="w-4 h-4 inline mr-1" />
                          View Details
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(order)}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all"
                        >
                          <Download className="w-4 h-4 inline mr-1" />
                          Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-3xl">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Order #{selectedOrder.order_number}</h2>
                <p className="text-sm text-slate-600">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status Timeline */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">Order Status</h3>
                <div className="flex items-center justify-between">
                  {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => (
                    <div key={status} className="flex items-center">
                      <div className={`flex flex-col items-center ${index < ['pending', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.status) + 1 ? '' : 'opacity-30'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index < ['pending', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.status) + 1
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          {index < ['pending', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.status) + 1 ? '✓' : index + 1}
                        </div>
                        <p className="text-xs font-medium mt-2 capitalize">{status}</p>
                      </div>
                      {index < 3 && (
                        <div className={`w-20 h-1 mx-2 ${
                          index < ['pending', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.status)
                            ? 'bg-green-500'
                            : 'bg-slate-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedOrder.first_name} {selectedOrder.last_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.phone}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Shipping Address
                  </h3>
                  <div className="text-sm text-slate-700">
                    <p>{selectedOrder.shipping_address?.street_address}</p>
                    <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}</p>
                    <p>{selectedOrder.shipping_address?.postal_code}</p>
                    <p>{selectedOrder.shipping_address?.country || 'India'}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item: any, index: number) => (
                    <div key={index} className="bg-white rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{item.product_name}</p>
                          <p className="text-sm text-slate-600">SKU: {item.product_sku}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatINR(item.total_price)}</p>
                        <p className="text-sm text-slate-600">{formatINR(item.unit_price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">{formatINR(selectedOrder.subtotal || selectedOrder.my_total || selectedOrder.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax (GST)</span>
                    <span className="font-medium">{formatINR(selectedOrder.tax_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-medium">{formatINR(selectedOrder.shipping_amount || 0)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-slate-900">Total Amount</span>
                    <span className="font-black text-lg text-indigo-600">{formatINR(selectedOrder.my_total || selectedOrder.total_amount)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-600">Payment Method</span>
                    <span className="font-medium uppercase">{selectedOrder.payment_method || 'COD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Payment Status</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedOrder.payment_status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Download Invoice
                </button>
                <button
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-[9999] bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg animate-fade-in">
          <p className="font-medium">{successMessage}</p>
        </div>
      )}
    </>
  );
};

// Customers Tab Component
const CustomersTab: React.FC = () => {
  return (
    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
      <h3 className="text-3xl font-black tracking-tighter mb-8">Customer Analytics</h3>
      <div className="text-center py-16">
        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h4 className="text-xl font-bold text-slate-900 mb-2">Customer insights coming soon</h4>
        <p className="text-slate-600">Track customer behavior, repeat purchases, and conversion rates</p>
      </div>
    </div>
  );
};

// Marketing Tab Component
const MarketingTab: React.FC = () => {
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Spring Sale Campaign',
      type: 'email',
      status: 'active',
      reach: 1250,
      clicks: 89,
      conversions: 12,
      budget: 5000,
      spent: 3200
    },
    {
      id: 2,
      name: 'Social Media Boost',
      type: 'social',
      status: 'paused',
      reach: 8500,
      clicks: 234,
      conversions: 28,
      budget: 10000,
      spent: 7500
    }
  ]);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-black tracking-tighter">Digital Marketing</h3>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">
            <Plus className="w-4 h-4 inline mr-2" />
            New Campaign
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <Megaphone className="w-8 h-8" />
              <span className="text-sm font-medium opacity-90">Total Reach</span>
            </div>
            <h4 className="text-2xl font-black">9,750</h4>
            <p className="text-sm opacity-90">+15% from last month</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <MousePointerClick className="w-8 h-8" />
              <span className="text-sm font-medium opacity-90">Click Rate</span>
            </div>
            <h4 className="text-2xl font-black">3.2%</h4>
            <p className="text-sm opacity-90">Above industry avg</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8" />
              <span className="text-sm font-medium opacity-90">Conversions</span>
            </div>
            <h4 className="text-2xl font-black">40</h4>
            <p className="text-sm opacity-90">₹2,400 revenue</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xl font-bold text-slate-900">Active Campaigns</h4>
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="font-bold text-slate-900">{campaign.name}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      campaign.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                    }`}>
                      {campaign.type}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">
                    {campaign.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Reach</p>
                  <p className="font-bold text-slate-900">{campaign.reach.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Clicks</p>
                  <p className="font-bold text-slate-900">{campaign.clicks}</p>
                </div>
                <div>
                  <p className="text-slate-500">Conversions</p>
                  <p className="font-bold text-slate-900">{campaign.conversions}</p>
                </div>
                <div>
                  <p className="text-slate-500">Budget</p>
                  <p className="font-bold text-slate-900">₹{campaign.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Spent</p>
                  <p className="font-bold text-slate-900">₹{campaign.spent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Automation Section */}
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black tracking-tighter">Email Automation</h3>
          <button className="px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all">
            <Mail className="w-4 h-4 inline mr-2" />
            New Automation
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900">Welcome Series</h4>
              <ToggleRight className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-slate-600 text-sm mb-4">Automatically welcome new customers</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Sent: 45 emails</span>
              <span className="text-green-600 font-medium">Active</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900">Abandoned Cart</h4>
              <ToggleRight className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-slate-600 text-sm mb-4">Recover abandoned shopping carts</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Sent: 23 emails</span>
              <span className="text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Support Tab Component
const SupportTab: React.FC = () => {
  const [tickets, setTickets] = useState([
    {
      id: 1,
      subject: 'Product approval delay',
      status: 'open',
      priority: 'medium',
      created_at: '2024-01-30T10:00:00Z',
      last_reply: '2024-01-30T14:30:00Z'
    },
    {
      id: 2,
      subject: 'Payment processing issue',
      status: 'resolved',
      priority: 'high',
      created_at: '2024-01-28T09:15:00Z',
      last_reply: '2024-01-29T11:20:00Z'
    }
  ]);

  return (
    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-black tracking-tighter">Support & Tickets</h3>
        <button className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all">
          <MessageSquare className="w-4 h-4 inline mr-2" />
          New Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-slate-900 mb-2">No support tickets</h4>
          <p className="text-slate-600">Create a ticket if you need help with your seller account</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-slate-900">{ticket.subject}</h4>
                  <p className="text-slate-600 text-sm">Ticket #{ticket.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-slate-600 text-sm">
                  Created: {new Date(ticket.created_at).toLocaleDateString()} • 
                  Last reply: {new Date(ticket.last_reply).toLocaleDateString()}
                </p>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all">
                  <Reply className="w-4 h-4 inline mr-1" />
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;