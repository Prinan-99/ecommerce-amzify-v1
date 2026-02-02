import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Box, ShoppingCart, Users, TrendingUp, ArrowUpRight, 
  Plus, Search, MoreHorizontal, Zap, Megaphone, Mail, Sparkles, Loader2,
  Calendar as CalendarIcon, Download, QrCode, MapPin, Package,
  Trash2, ToggleLeft, ToggleRight, Eye, MousePointerClick, 
  Activity, ArrowRight, RefreshCw, Layers, ShieldCheck, Ban, Reply,
  AlertTriangle, User, LogOut, Edit, DollarSign, TrendingDown,
  FileText, MessageSquare, Settings, Camera, Upload, Truck, Navigation,
  Clock, CheckCircle, XCircle, Link, Star, Heart, Bell
} from 'lucide-react';
import { useAuth } from './context/RealAuthContext';
import LoginPortal from './components/LoginPortal';
import ProfileModal from './components/ProfileModal';
import ProductModal from './components/ProductModal';
import RevenueDashboard from './components/RevenueDashboard';
import SocialMediaManager from './components/SocialMediaManager';
import { sellerApiService } from './services/sellerApi';

const App: React.FC = () => {
  // Authentication integration
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  // Role validation - ensure only sellers can access this dashboard
  const hasSellerAccess = user?.role === 'seller';
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'marketing' | 'logistics' | 'support' | 'revenue' | 'social'>('dashboard');
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Modal states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Load seller data
  useEffect(() => {
    if (isAuthenticated && hasSellerAccess) {
      loadSellerData();
      loadNotifications();
    } else if (!authLoading) {
      // Auth check complete, no need to load data for non-sellers
      setIsDataLoading(false);
    }
  }, [isAuthenticated, hasSellerAccess, authLoading]);

  const loadSellerData = async () => {
    try {
      setIsDataLoading(true);
      const [statsResponse, productsResponse, ordersResponse] = await Promise.all([
        sellerApiService.getSellerStats().catch(() => null),
        sellerApiService.getMyProducts().catch(() => ({ products: [] })),
        sellerApiService.getMyOrders().catch(() => ({ orders: [] }))
      ]);

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
      console.error('Load seller data error:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

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

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await sellerApiService.deleteProduct(productId);
      loadSellerData();
    } catch (error) {
      console.error('Delete product error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

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
              onClick={() => setActiveTab(tab)} 
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
              {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
              {activeTab === 'products' && <ProductsTab products={products} onRefresh={loadSellerData} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />}
              {activeTab === 'orders' && <OrdersTab orders={orders} onRefresh={loadSellerData} />}
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
      />

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab: React.FC<{ stats: any }> = ({ stats }) => {
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-black text-green-600">+12%</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {stats?.total_revenue ? formatINR(stats.total_revenue) : '₹0'}
          </h3>
          <p className="text-xs font-medium text-slate-500">Total Revenue</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-black text-blue-600">+8%</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats?.total_orders || 0}</h3>
          <p className="text-xs font-medium text-slate-500">Total Orders</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Box className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-black text-slate-400">-</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats?.total_products || 0}</h3>
          <p className="text-xs font-medium text-slate-500">Active Products</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-black text-amber-600">+15%</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats?.total_customers || 0}</h3>
          <p className="text-xs font-medium text-slate-500">Total Customers</p>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-900 mb-8">Welcome to Amzify Seller Panel</h3>
        <p className="text-slate-600 mb-8">
          Manage your products, track orders, and grow your business on the Amzify marketplace. 
          Use the navigation above to access different sections of your seller dashboard.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <Box className="w-8 h-8 text-indigo-600 mb-4" />
            <h4 className="font-black text-slate-900 mb-2">Manage Products</h4>
            <p className="text-sm text-slate-600">Add, edit, and organize your product catalog</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <ShoppingCart className="w-8 h-8 text-indigo-600 mb-4" />
            <h4 className="font-black text-slate-900 mb-2">Process Orders</h4>
            <p className="text-sm text-slate-600">View and manage customer orders efficiently</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <BarChart3 className="w-8 h-8 text-indigo-600 mb-4" />
            <h4 className="font-black text-slate-900 mb-2">Track Analytics</h4>
            <p className="text-sm text-slate-600">Monitor your sales performance and growth</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Products Tab Component
const ProductsTab: React.FC<{ products: any[]; onRefresh: () => void }> = ({ products, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-black tracking-tighter">Product Management</h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Box className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-slate-900 mb-2">No products yet</h4>
          <p className="text-slate-600 mb-6">Start by adding your first product to the marketplace</p>
          <button 
            onClick={() => setShowAddModal(true)}
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
                <button className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                  <Edit className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
                <button className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Orders Tab Component
const OrdersTab: React.FC<{ orders: any[]; onRefresh: () => void }> = ({ orders, onRefresh }) => {
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
      <h3 className="text-3xl font-black tracking-tighter mb-8">Order Management</h3>
      
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h4>
          <p className="text-slate-600">Orders will appear here when customers purchase your products</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-slate-900">Order #{order.order_number}</h4>
                  <p className="text-slate-600 text-sm">{order.first_name} {order.last_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">{formatINR(order.my_total || order.total_amount)}</p>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-slate-600 text-sm">
                  {order.my_items_count || 1} item(s) • {new Date(order.created_at).toLocaleDateString()}
                </p>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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

// Logistics Tab Component
const LogisticsTab: React.FC = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    setIsLoading(true);
    try {
      // Mock shipment data for seller
      setShipments([
        {
          id: '1',
          order_number: 'AMZ12345',
          customer_name: 'Jane Customer',
          tracking_number: 'TRK123456789',
          status: 'shipped',
          carrier: 'BlueDart',
          pickup_date: '2024-02-01',
          estimated_delivery: '2024-02-05',
          destination: 'Delhi',
          items: [
            { name: 'Wireless Bluetooth Headphones Pro', quantity: 1 }
          ]
        },
        {
          id: '2',
          order_number: 'AMZ12346',
          customer_name: 'David Smith',
          tracking_number: 'TRK987654321',
          status: 'delivered',
          carrier: 'FedEx',
          pickup_date: '2024-01-30',
          estimated_delivery: '2024-02-03',
          destination: 'Bangalore',
          items: [
            { name: 'Smart Fitness Watch Ultra', quantity: 1 }
          ]
        },
        {
          id: '3',
          order_number: 'AMZ12347',
          customer_name: 'Emily Johnson',
          tracking_number: 'TRK456789123',
          status: 'ready_for_pickup',
          carrier: 'DTDC',
          pickup_date: '2024-02-04',
          estimated_delivery: '2024-02-07',
          destination: 'Chennai',
          items: [
            { name: 'Yoga Mat Premium Plus', quantity: 1 }
          ]
        }
      ]);
    } catch (error) {
      console.error('Load shipments error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'ready_for_pickup':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'ready_for_pickup':
        return <Package className="w-4 h-4 text-yellow-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-black tracking-tighter">Logistics & Shipping</h3>
          <div className="flex items-center gap-4">
            <button 
              onClick={loadShipments}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Refresh
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-all">
              <Plus className="w-4 h-4 inline mr-2" />
              Create Shipment
            </button>
          </div>
        </div>

        {/* Logistics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8" />
              <span className="text-2xl font-black">{shipments.filter(s => s.status === 'ready_for_pickup').length}</span>
            </div>
            <p className="text-yellow-100 text-sm">Ready for Pickup</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <Truck className="w-8 h-8" />
              <span className="text-2xl font-black">{shipments.filter(s => s.status === 'shipped').length}</span>
            </div>
            <p className="text-blue-100 text-sm">In Transit</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8" />
              <span className="text-2xl font-black">{shipments.filter(s => s.status === 'delivered').length}</span>
            </div>
            <p className="text-green-100 text-sm">Delivered</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8" />
              <span className="text-2xl font-black">{shipments.filter(s => s.status === 'processing').length}</span>
            </div>
            <p className="text-orange-100 text-sm">Processing</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-slate-600">Loading shipments...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-16">
            <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-slate-900 mb-2">No shipments found</h4>
            <p className="text-slate-600">Your shipments will appear here once orders are placed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <div key={shipment.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(shipment.status)}
                    <div>
                      <h4 className="font-bold text-slate-900">Order #{shipment.order_number}</h4>
                      <p className="text-slate-600 text-sm">{shipment.customer_name}</p>
                      <p className="text-slate-500 text-xs font-mono">{shipment.tracking_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(shipment.status)}`}>
                      {shipment.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <p className="text-sm text-slate-600 mt-1">via {shipment.carrier}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Pickup Date</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(shipment.pickup_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Destination</p>
                      <p className="text-sm font-medium text-slate-900">{shipment.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Est. Delivery</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(shipment.estimated_delivery).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-sm text-slate-600">
                      {shipment.items.length} item(s): {shipment.items.map((item: any) => item.name).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedShipment(shipment)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      View Details
                    </button>
                    {shipment.status === 'ready_for_pickup' && (
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all">
                        <Truck className="w-4 h-4 inline mr-1" />
                        Schedule Pickup
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shipment Details Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Shipment Details</h3>
                <p className="text-slate-600">Order #{selectedShipment.order_number}</p>
              </div>
              <button 
                onClick={() => setSelectedShipment(null)}
                className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Shipping Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-slate-500">Tracking Number:</span>
                      <p className="font-mono text-sm">{selectedShipment.tracking_number}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Carrier:</span>
                      <p className="text-sm">{selectedShipment.carrier}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(selectedShipment.status)}`}>
                        {selectedShipment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-slate-500">Customer:</span>
                      <p className="text-sm">{selectedShipment.customer_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Destination:</span>
                      <p className="text-sm">{selectedShipment.destination}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Est. Delivery:</span>
                      <p className="text-sm">{new Date(selectedShipment.estimated_delivery).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-3">Items</h4>
                <div className="space-y-2">
                  {selectedShipment.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm text-slate-600">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all">
                  Print Label
                </button>
                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all">
                  Track Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;