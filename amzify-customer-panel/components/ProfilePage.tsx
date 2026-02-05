import React, { useState, useEffect } from 'react';
import { 
  X, User, Package, MapPin, Settings, LogOut, Trash2, Shield, Heart, Star, 
  ChevronRight, TrendingUp, Award, Gift, Crown, Zap, Sparkles, Calendar,
  CheckCircle, Clock, Truck, ShoppingBag, CreditCard, Bell, Eye, Edit,
  Download, Share2, Phone, Mail, ArrowLeft, Compass, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/RealAuthContext';
import { customerApiService } from '../services/customerApi';

// Types
interface UserProfile {
  initial: string;
  name: string;
  tier: string;
  memberSince: string;
  rewardPoints: number;
  lifetimeSpent: number;
  nextTierTarget: number;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

interface ProfileOrder {
  id: string;
  date: string;
  amount: number;
  status: OrderStatus;
  itemsCount: number;
}

interface Benefit {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

// Mock Data
const MOCK_USER: UserProfile = {
  initial: 'U',
  name: 'User',
  tier: 'Gold',
  memberSince: 'Jan 2024',
  rewardPoints: 2500,
  lifetimeSpent: 125000,
  nextTierTarget: 150000
};

const MOCK_ORDERS: ProfileOrder[] = [
  {
    id: 'AMZ#1234567890',
    date: 'Jan 15, 2024',
    amount: 24999,
    status: OrderStatus.DELIVERED,
    itemsCount: 2
  },
  {
    id: 'AMZ#1234567891',
    date: 'Jan 10, 2024',
    amount: 15499,
    status: OrderStatus.SHIPPED,
    itemsCount: 1
  }
];

const MOCK_WISHLIST: WishlistItem[] = [
  {
    id: '1',
    name: 'Wireless Headphones Pro',
    price: 2999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'
  }
];

const BENEFITS: Benefit[] = [
  {
    name: 'Free Shipping',
    description: 'On all orders above ₹500',
    icon: 'truck',
    unlocked: true
  },
  {
    name: 'Priority Support',
    description: '24/7 dedicated customer service',
    icon: 'headphones',
    unlocked: true
  }
];

interface ProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'overview' | 'orders' | 'wishlist' | 'referral' | 'settings';
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  tracking_number?: string;
  items: any[];
  shipping_address: any;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ isOpen, onClose, initialTab = 'overview' }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'referral' | 'settings'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(MOCK_WISHLIST);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER);
  const [profileOrders] = useState<ProfileOrder[]>(MOCK_ORDERS);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: MOCK_USER.name,
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  // Update active tab when initialTab prop changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen && user) {
      loadUserData();
    }
  }, [isOpen, user]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const ordersResponse = await customerApiService.getOrders();
      setOrders(ordersResponse.orders || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Use mock data for demo
      setOrders([
        {
          id: '1',
          order_number: 'AMZ12345',
          status: 'delivered',
          total_amount: 2999,
          created_at: '2024-01-15T10:30:00Z',
          tracking_number: 'TRK123456789',
          items: [{ name: 'Wireless Headphones Pro', quantity: 1, price: 2999 }],
          shipping_address: {
            street_address: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postal_code: '400001',
            country: 'India'
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleEditProfile = () => {
    setIsEditOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validation Functions
  const validateEmail = (email: string): boolean => {
    // Check if email contains uppercase letters
    if (email !== email.toLowerCase()) {
      return false;
    }
    // Check for valid email format with @ and domain
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const validateProfileForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!editForm.name.trim()) {
      errors.push('Full name is required');
    }

    if (!editForm.email.trim()) {
      errors.push('Email is required');
    } else if (!validateEmail(editForm.email)) {
      errors.push('Email must be lowercase and valid (e.g., user@example.com)');
    }

    if (!editForm.phone.trim()) {
      errors.push('Phone number is required');
    } else if (!validatePhoneNumber(editForm.phone)) {
      errors.push('Phone number must be exactly 10 digits');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const handleSaveProfile = async () => {
    const validation = validateProfileForm();
    
    if (!validation.valid) {
      alert('Please fix the following errors:\n\n' + validation.errors.join('\n'));
      return;
    }

    try {
      // Update user profile
      setUserProfile(prev => ({
        ...prev,
        name: editForm.name
      }));
      setIsEditOpen(false);
      // Show success message
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('❌ Failed to update profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden flex flex-col">
      {/* Header with premium white and gold background */}
      <div className="relative text-slate-900 overflow-hidden flex-shrink-0" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 25%, #faf7f2 50%, #f5f1e8 75%, #ffffff 100%)',
        backgroundSize: '400% 400%',
        animation: 'headerGradientShift 12s ease infinite'
      }}>
        <style>{`
          @keyframes headerGradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes goldFloat1 {
            0% { transform: translate(-80px, -80px) scale(1); opacity: 0.45; }
            50% { transform: translate(40px, 40px) scale(1.15); opacity: 0.65; }
            100% { transform: translate(-80px, -80px) scale(1); opacity: 0.45; }
          }

          @keyframes goldFloat2 {
            0% { transform: translate(80px, 80px) scale(1); opacity: 0.42; }
            50% { transform: translate(-40px, -40px) scale(1.2); opacity: 0.62; }
            100% { transform: translate(80px, 80px) scale(1); opacity: 0.42; }
          }

          @keyframes headerShimmer {
            0% { left: -1000px; opacity: 0; }
            50% { opacity: 0.25; }
            100% { left: 100%; opacity: 0; }
          }
        `}</style>

        {/* Premium animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gold accent elements */}
          <div className="absolute top-10 left-5 w-80 h-80 rounded-full" style={{
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.7) 0%, transparent 70%)',
            animation: 'goldFloat1 18s ease-in-out infinite'
          }}></div>

          <div className="absolute bottom-10 right-5 w-72 h-72 rounded-full" style={{
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.65) 0%, transparent 70%)',
            animation: 'goldFloat2 22s ease-in-out infinite'
          }}></div>

          {/* Primary white shimmer */}
          <div className="absolute inset-0 opacity-35" style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 25%, transparent 50%, rgba(255, 255, 255, 0.7) 75%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'headerShimmer 5s infinite'
          }}></div>

          {/* Secondary white shimmer */}
          <div className="absolute inset-0 opacity-25" style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 30%, transparent 60%, rgba(255, 255, 255, 0.4) 90%, transparent 100%)',
            backgroundSize: '150% 100%',
            animation: 'headerShimmer 7s infinite',
            animationDelay: '1.5s'
          }}></div>

          {/* Gold shimmer */}
          <div className="absolute inset-0 opacity-70" style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(217, 119, 6, 0.8) 25%, transparent 50%, rgba(217, 119, 6, 0.7) 75%, transparent 100%)',
            backgroundSize: '180% 100%',
            animation: 'headerShimmer 8s infinite',
            animationDelay: '3s'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-4">
          {/* Top navigation bar */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all border border-slate-300/40 text-sm font-bold text-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Shopping</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all border border-slate-300/40 text-slate-700">
                <Bell className="w-4 h-4" />
              </button>
              <button className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all border border-slate-300/40 text-slate-700">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-white to-indigo-100 rounded-2xl flex items-center justify-center text-4xl font-black text-indigo-600 shadow-lg border-3 border-white/30">
                {userProfile.initial}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-0.5 shadow-lg">
                <Crown className="w-3 h-3" />
                {userProfile.tier}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black mb-1 text-slate-900">{userProfile.name}</h1>
                <p className="text-slate-600 text-sm flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user?.email}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-lg border border-amber-200/50">
                  <div className="text-xs text-slate-700">Member Since</div>
                  <div className="font-bold text-sm text-slate-800">{userProfile.memberSince}</div>
                </div>
                <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-lg border border-amber-200/50">
                  <div className="text-xs text-slate-700">Reward Points</div>
                  <div className="font-bold text-sm text-slate-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    {userProfile.rewardPoints.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-lg border border-amber-200/50">
                  <div className="text-xs text-slate-700">Total Orders</div>
                  <div className="font-bold text-sm text-slate-800">{profileOrders.length}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleEditProfile}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg flex items-center gap-2 text-sm">
                <Edit className="w-3 h-3" />
                Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-white/25 backdrop-blur-sm text-slate-800 rounded-lg font-bold hover:bg-white/40 transition-all border border-slate-300/50 flex items-center gap-2 text-sm"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'overview'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'orders'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              My Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('referral')}
              className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'referral'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              <Gift className="w-4 h-4 inline mr-1" />
              Referral
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'wishlist'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              Wishlist ({wishlistItems.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'settings'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide relative" style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
        background: 'linear-gradient(135deg, #ffffff 0%, #faf7f2 25%, #f5f1e8 50%, #fef9f3 75%, #ffffff 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}>
        {/* Premium White & Gold Animated Background */}
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes floatingShadow1 {
            0% { transform: translate(-100px, -100px) scale(1); opacity: 0.05; }
            50% { transform: translate(50px, 50px) scale(1.2); opacity: 0.1; }
            100% { transform: translate(-100px, -100px) scale(1); opacity: 0.05; }
          }

          @keyframes floatingShadow2 {
            0% { transform: translate(100px, 100px) scale(1); opacity: 0.08; }
            50% { transform: translate(-50px, -50px) scale(1.1); opacity: 0.12; }
            100% { transform: translate(100px, 100px) scale(1); opacity: 0.08; }
          }

          @keyframes floatingShadow3 {
            0% { transform: translate(0, 0) scale(1); opacity: 0.06; }
            50% { transform: translate(-80px, 80px) scale(1.3); opacity: 0.11; }
            100% { transform: translate(0, 0) scale(1); opacity: 0.06; }
          }

          @keyframes shimmer {
            0% { left: -1000px; opacity: 0; }
            50% { opacity: 0.15; }
            100% { left: 100%; opacity: 0; }
          }
        `}</style>

        {/* Floating White Shade Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gold accents */}
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full" style={{
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.15) 0%, transparent 70%)',
            animation: 'floatingShadow1 20s ease-in-out infinite'
          }}></div>

          <div className="absolute bottom-32 right-20 w-80 h-80 rounded-full" style={{
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, transparent 70%)',
            animation: 'floatingShadow2 25s ease-in-out infinite'
          }}></div>

          <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full" style={{
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.08) 0%, transparent 70%)',
            animation: 'floatingShadow3 18s ease-in-out infinite'
          }}></div>

          {/* Moving white shade overlays */}
          <div className="absolute inset-0 opacity-40" style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 25%, transparent 50%, rgba(255, 255, 255, 0.6) 75%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 6s infinite'
          }}></div>

          {/* Secondary shimmer effect */}
          <div className="absolute inset-0 opacity-30" style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 30%, transparent 60%, rgba(255, 255, 255, 0.3) 90%, transparent 100%)',
            backgroundSize: '150% 100%',
            animation: 'shimmer 8s infinite',
            animationDelay: '2s'
          }}></div>

          {/* Subtle gold shimmer */}
          <div className="absolute inset-0 opacity-20" style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(217, 119, 6, 0.3) 25%, transparent 50%, rgba(217, 119, 6, 0.2) 75%, transparent 100%)',
            backgroundSize: '180% 100%',
            animation: 'shimmer 10s infinite',
            animationDelay: '4s'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Membership Progress */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <Crown className="w-6 h-6 text-amber-500" />
                  Membership Progress
                </h2>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-600">Current Tier</p>
                      <p className="text-2xl font-black text-amber-600">{userProfile.tier}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Reward Points</p>
                      <p className="text-2xl font-black text-indigo-600">{userProfile.rewardPoints.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold">Lifetime Spent</span>
                      <span className="font-bold">₹{userProfile.lifetimeSpent.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                        style={{ width: `${(userProfile.lifetimeSpent / userProfile.nextTierTarget) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      ₹{(userProfile.nextTierTarget - userProfile.lifetimeSpent).toLocaleString()} more to next tier
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  Your Benefits
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BENEFITS.map((benefit, index) => (
                    <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                      <h3 className="font-bold text-slate-900 mb-1">{benefit.name}</h3>
                      <p className="text-sm text-slate-600">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <Package className="w-6 h-6 text-indigo-600" />
                    Recent Orders
                  </h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {profileOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="border border-slate-200 rounded-xl p-4 hover:border-amber-300 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{order.id}</p>
                          <p className="text-sm text-slate-500">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">₹{order.amount.toLocaleString()}</p>
                          <p className={`text-xs font-bold ${
                            order.status === OrderStatus.DELIVERED ? 'text-green-600' : 'text-blue-600'
                          }`}>{order.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {selectedOrderForTracking ? (
                // Tracking view for selected order
                <div>
                  <button
                    onClick={() => setSelectedOrderForTracking(null)}
                    className="mb-4 flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100 transition-all border border-amber-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                  </button>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-black mb-6">Order Tracking</h2>
                    <p className="text-slate-600">Tracking details for order {selectedOrderForTracking}</p>
                  </div>
                </div>
              ) : (
                // Orders list view
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                  <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                    <Package className="w-6 h-6 text-indigo-600" />
                    Order History
                  </h2>
                  {profileOrders && profileOrders.length > 0 ? (
                    <div className="space-y-4">
                      {profileOrders.map((order) => (
                        <div key={order.id} className="border border-slate-200 rounded-2xl p-6 hover:border-amber-300 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-lg">
                                <Package className="w-6 h-6 text-indigo-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900">{order.id}</h3>
                                <p className="text-sm text-slate-500">{order.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-slate-900">₹{order.amount.toLocaleString()}</p>
                              <p className={`text-xs font-bold rounded-full px-2 py-1 ${
                                order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700' :
                                order.status === OrderStatus.SHIPPED ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {order.status}
                              </p>
                            </div>
                          </div>
                          <div className="mb-4 pb-4 border-t border-slate-100">
                            <p className="text-sm text-slate-600 mt-4">{order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}</p>
                          </div>
                          <button
                            onClick={() => setSelectedOrderForTracking(order.id)}
                            className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-bold hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
                          >
                            <Truck className="w-4 h-4" />
                            Track Order
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-bold">No orders yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black mb-6">Order Tracking</h2>
                <p className="text-slate-600">Order tracking details will appear here.</p>
              </div>
            </div>
          )}

          {activeTab === 'referral' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <Gift className="w-6 h-6 text-amber-500" />
                  Referral Program
                </h2>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                  <p className="text-lg font-bold text-slate-900 mb-2">Earn rewards by referring friends!</p>
                  <p className="text-slate-600">Share your unique referral code and get bonus points for each successful referral.</p>
                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-dashed border-amber-300">
                    <p className="text-sm text-slate-600 mb-1">Your Referral Code:</p>
                    <p className="text-2xl font-black text-amber-600">AMZIFY2024</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <Heart className="w-6 h-6 text-red-500" />
                  My Wishlist
                </h2>
                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
                        <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-3" />
                        <h3 className="font-bold text-slate-900">{item.name}</h3>
                        <p className="text-lg font-bold text-indigo-600 mt-2">₹{item.price.toLocaleString()}</p>
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all text-sm">
                            Add to Cart
                          </button>
                          <button 
                            onClick={() => setWishlistItems(prev => prev.filter(i => i.id !== item.id))}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Your wishlist is empty</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={user?.phone || 'Not provided'}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-bold text-slate-900 mb-4">Feedback & Support</h3>
                    <button onClick={() => {
                      const event = new CustomEvent('openFeedback');
                      window.dispatchEvent(event);
                      onClose();
                    }} className="w-full mb-6 px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-all border border-indigo-200 flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Share Your Feedback
                    </button>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-bold text-slate-900 mb-4">Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                        <span className="font-medium text-slate-900">Order updates</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                        <span className="font-medium text-slate-900">Promotional emails</span>
                        <input type="checkbox" className="rounded" />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                        <span className="font-medium text-slate-900">SMS notifications</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-bold text-slate-900 mb-4 text-red-600">Danger Zone</h3>
                    <button className="w-full md:w-auto px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-200 flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-6 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-2xl font-black">Edit Profile</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-600" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditFormChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                          editForm.name.trim() ? 'border-green-400 focus:border-green-600' : 'border-slate-200 focus:border-amber-500'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {editForm.name.trim() && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditFormChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                          editForm.email && validateEmail(editForm.email) ? 'border-green-400 focus:border-green-600' : 'border-slate-200 focus:border-amber-500'
                        } ${editForm.email && !validateEmail(editForm.email) ? 'border-red-400' : ''}`}
                        placeholder="Enter your email (e.g., user@example.com)"
                      />
                      {editForm.email && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {validateEmail(editForm.email) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {editForm.email && !validateEmail(editForm.email) && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Email must be lowercase with valid format (e.g., user@example.com)</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditFormChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                          editForm.phone && validatePhoneNumber(editForm.phone) ? 'border-green-400 focus:border-green-600' : 'border-slate-200 focus:border-amber-500'
                        } ${editForm.phone && !validatePhoneNumber(editForm.phone) ? 'border-red-400' : ''}`}
                        placeholder="Enter 10-digit phone number"
                        maxLength={10}
                      />
                      {editForm.phone && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {validatePhoneNumber(editForm.phone) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {editForm.phone && !validatePhoneNumber(editForm.phone) && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Invalid phone number format</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  Address Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={editForm.address}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
                      placeholder="Enter your street address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={editForm.city}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">State</label>
                      <input
                        type="text"
                        name="state"
                        value={editForm.state}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={editForm.postalCode}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
                        placeholder="Postal Code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                      <select
                        name="country"
                        value={editForm.country}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
                      >
                        <option>India</option>
                        <option>USA</option>
                        <option>UK</option>
                        <option>Canada</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex gap-3 justify-end rounded-b-3xl">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg font-bold hover:bg-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
