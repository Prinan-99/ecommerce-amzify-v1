import React, { useState, useEffect } from 'react';
import { 
  X, User, Package, MapPin, Settings, LogOut, Trash2, Shield, Heart, Star, 
  ChevronRight, TrendingUp, Award, Gift, Crown, Zap, Sparkles, Calendar,
  CheckCircle, Clock, Truck, ShoppingBag, CreditCard, Bell, Eye, Edit,
  Download, Share2, Phone, Mail, ArrowLeft, Compass
} from 'lucide-react';
import { useAuth } from '../context/RealAuthContext';
import { customerApiService } from '../services/customerApi';
import { MOCK_USER, MOCK_ORDERS, MOCK_WISHLIST, BENEFITS } from '../constants';
import { UserProfile, Order as ProfileOrder, WishlistItem } from '../types';
import MembershipCard from './MembershipCard';
import BenefitsSection from './BenefitsSection';
import OrderHistory from './OrderHistory';
import WishlistView from './WishlistView';
import OrderTracking from './OrderTracking';
import ReferralProgram from './ReferralProgram';

interface ProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
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

const ProfilePage: React.FC<ProfilePageProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'tracking' | 'wishlist' | 'referral' | 'settings'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(MOCK_WISHLIST);
  const [userProfile] = useState<UserProfile>(MOCK_USER);
  const [profileOrders] = useState<ProfileOrder[]>(MOCK_ORDERS);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden flex flex-col">
      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white overflow-hidden flex-shrink-0">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-4">
          {/* Top navigation bar */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all border border-white/20 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-bold">Back to Shopping</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all border border-white/20">
                <Bell className="w-4 h-4" />
              </button>
              <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all border border-white/20">
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
                <h1 className="text-2xl font-black mb-1">{userProfile.name}</h1>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user?.email}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20">
                  <div className="text-xs opacity-80">Member Since</div>
                  <div className="font-bold text-sm">{userProfile.memberSince}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20">
                  <div className="text-xs opacity-80">Reward Points</div>
                  <div className="font-bold text-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    {userProfile.rewardPoints.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20">
                  <div className="text-xs opacity-80">Total Orders</div>
                  <div className="font-bold text-sm">{profileOrders.length}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2">
              <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2 text-sm">
                <Edit className="w-3 h-3" />
                Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg font-bold hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2 text-sm"
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
              onClick={() => setActiveTab('tracking')}
              className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'tracking'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4 inline mr-1" />
              Tracking
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
      <div className="flex-1 overflow-y-auto bg-slate-50 min-h-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Membership Progress */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <Crown className="w-6 h-6 text-amber-500" />
                  Membership Progress
                </h2>
                <MembershipCard user={userProfile} onViewHistory={() => setActiveTab('orders')} />
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  Your Benefits
                </h2>
                <BenefitsSection userTier={userProfile.tier} benefits={BENEFITS} />
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
                <OrderHistory
                  orders={profileOrders.slice(0, 3)}
                  onSeeAll={() => setActiveTab('orders')}
                  onOrderClick={(id) => console.log('Order:', id)}
                />
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <Package className="w-6 h-6 text-indigo-600" />
                  Order History
                </h2>
                <OrderHistory
                  orders={profileOrders}
                  onSeeAll={() => {}}
                  onOrderClick={(id) => console.log('Order:', id)}
                />
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <OrderTracking
                orderId="AMZ#1234567890"
                onBack={() => setActiveTab('overview')}
              />
            </div>
          )}

          {activeTab === 'referral' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ReferralProgram />
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <WishlistView
                  items={wishlistItems}
                  onRemove={(id) => setWishlistItems(prev => prev.filter(item => item.id !== id))}
                  onAddToCart={(item) => console.log('Add to cart:', item)}
                  onItemClick={(item) => console.log('Item:', item)}
                  onBack={() => setActiveTab('overview')}
                />
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
    </div>
  );
};

export default ProfilePage;
