import React, { useState, useEffect } from 'react';
import { X, User, Package, MapPin, CreditCard, Settings, Eye, Truck, Calendar, CheckCircle, Clock, AlertCircle, LogOut, Trash2, Shield, Heart, Star } from 'lucide-react';
import { useAuth } from '../context/RealAuthContext';
import { customerApiService } from '../services/customerApi';
import { MOCK_USER, MOCK_ORDERS, MOCK_WISHLIST, BENEFITS } from '../constants';
import { UserProfile, Order as ProfileOrder, WishlistItem } from '../types';
import MembershipCard from './MembershipCard';
import BenefitsSection from './BenefitsSection';
import OrderHistory from './OrderHistory';
import WishlistView from './WishlistView';

interface ProfileModalProps {
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

interface Address {
  id: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'settings' | 'wishlist'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(MOCK_WISHLIST);
  const [userProfile] = useState<UserProfile>(MOCK_USER);
  const [profileOrders] = useState<ProfileOrder[]>(MOCK_ORDERS);

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Load orders
      const ordersResponse = await customerApiService.getOrders();
      setOrders(ordersResponse.orders || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Mock data for demo
      setOrders([
        {
          id: '1',
          order_number: 'AMZ12345',
          status: 'delivered',
          total_amount: 2999,
          created_at: '2024-01-15T10:30:00Z',
          tracking_number: 'TRK123456789',
          items: [
            { name: 'Wireless Bluetooth Headphones Pro', quantity: 1, price: 2999 }
          ],
          shipping_address: {
            street_address: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postal_code: '400001',
            country: 'India'
          }
        },
        {
          id: '2',
          order_number: 'AMZ12346',
          status: 'shipped',
          total_amount: 4999,
          created_at: '2024-01-20T14:15:00Z',
          tracking_number: 'TRK987654321',
          items: [
            { name: 'Smart Fitness Watch Ultra', quantity: 1, price: 4999 }
          ],
          shipping_address: {
            street_address: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postal_code: '400001',
            country: 'India'
          }
        },
        {
          id: '3',
          order_number: 'AMZ12347',
          status: 'processing',
          total_amount: 1299,
          created_at: '2024-01-25T09:45:00Z',
          items: [
            { name: 'Yoga Mat Premium Plus', quantity: 1, price: 1299 }
          ],
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      const token = localStorage.getItem('accessToken');
      if (token) {
        const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://ecommerce-amzify-v1.onrender.com';
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always logout locally
      logout();
      onClose();
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteReason.trim()) {
      alert('Please provide a reason for account deletion');
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://ecommerce-amzify-v1.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/auth/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: deleteReason })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        logout();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteReason('');
    }
  };

  const handleWishlistRemove = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddToCart = (item: WishlistItem) => {
    // Add to cart logic here
    console.log('Adding to cart:', item);
  };

  const handleWishlistItemClick = (item: WishlistItem) => {
    // Handle item click logic here
    console.log('Clicked item:', item);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[3rem] max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white rounded-t-[3rem] border-b border-slate-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">My Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-slate-50 p-6 border-r border-slate-100">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-white'
                }`}
              >
                <User className="w-5 h-5" />
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-white'
                }`}
              >
                <Package className="w-5 h-5" />
                My Orders
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'addresses' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-white'
                }`}
              >
                <MapPin className="w-5 h-5" />
                Addresses
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'wishlist' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-white'
                }`}
              >
                <Heart className="w-5 h-5" />
                Wishlist
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-white'
                }`}
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Premium Membership Card */}
                <MembershipCard 
                  user={userProfile} 
                  onViewHistory={() => setActiveTab('orders')} 
                />
                
                {/* Benefits Section */}
                <BenefitsSection 
                  userTier={userProfile.tier} 
                  benefits={BENEFITS} 
                />

                {/* Recent Orders Preview */}
                <OrderHistory 
                  orders={profileOrders.slice(0, 3)} 
                  onSeeAll={() => setActiveTab('orders')}
                  onOrderClick={(id) => console.log('Order clicked:', id)}
                />

                {/* Account Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-900 mb-4">Account Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-slate-600">Email</label>
                        <p className="font-medium text-slate-900">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-600">Phone</label>
                        <p className="font-medium text-slate-900">{user?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-600">Account Status</label>
                        <p className="font-medium text-green-600">Verified</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-900 mb-4">Order Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Orders</span>
                        <span className="font-bold text-slate-900">{profileOrders.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Delivered</span>
                        <span className="font-bold text-green-600">
                          {profileOrders.filter(o => o.status === 'Delivered').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Spent</span>
                        <span className="font-bold text-slate-900">
                          ₹{profileOrders.reduce((sum, order) => sum + order.amount, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <WishlistView
                items={wishlistItems}
                onRemove={handleWishlistRemove}
                onAddToCart={handleAddToCart}
                onItemClick={handleWishlistItemClick}
                onBack={() => setActiveTab('profile')}
              />
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">My Orders</h3>
                  <span className="text-sm text-slate-600">{orders.length} orders</span>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-slate-900 mb-2">No orders yet</h4>
                    <p className="text-slate-600">Start shopping to see your orders here!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(order.status)}
                            <div>
                              <h4 className="font-bold text-slate-900">Order #{order.order_number}</h4>
                              <p className="text-sm text-slate-600">
                                Placed on {formatDate(order.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <p className="text-lg font-bold text-slate-900 mt-1">
                              {formatINR(order.total_amount)}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-slate-600">
                                {order.items?.length || 1} item(s)
                              </p>
                              {order.tracking_number && (
                                <p className="text-sm text-slate-600">
                                  Tracking: <span className="font-mono">{order.tracking_number}</span>
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Saved Addresses</h3>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all">
                    Add New Address
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h4 className="font-bold text-slate-900">Home</h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Default</span>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-700">
                    123 Main Street, Apartment 4B<br />
                    Mumbai, Maharashtra 400001<br />
                    India
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Account Settings</h3>

                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-900 mb-4">Notifications</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-slate-700">Order updates</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-slate-700">Promotional emails</span>
                        <input type="checkbox" className="rounded" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-slate-700">SMS notifications</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </label>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-900 mb-4">Privacy</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-slate-700">Share data for better recommendations</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-slate-700">Allow analytics tracking</span>
                        <input type="checkbox" className="rounded" />
                      </label>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-900 mb-4">Account Actions</h4>
                    <div className="space-y-3">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 p-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Order Details</h3>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">#{selectedOrder.order_number}</h4>
                    <p className="text-slate-600">Placed on {formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>

                {selectedOrder.tracking_number && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Tracking Number</p>
                        <p className="text-blue-700 font-mono">{selectedOrder.tracking_number}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="font-bold text-slate-900 mb-3">Items Ordered</h5>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-slate-900">{formatINR(item.price)}</p>
                      </div>
                    )) || (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-slate-600">Order items not available</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 mb-3">Shipping Address</h5>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-slate-700">
                      {selectedOrder.shipping_address?.street_address}<br />
                      {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.postal_code}<br />
                      {selectedOrder.shipping_address?.country}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>{formatINR(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Delete Account</h3>
                    <p className="text-sm text-slate-600">This action cannot be undone</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-slate-700 mb-4">
                    Are you sure you want to delete your account? This will permanently remove all your data, including orders, addresses, and preferences.
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Please tell us why you're leaving (required):
                    </label>
                    <textarea
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Your feedback helps us improve..."
                      className="w-full p-3 border border-slate-300 rounded-xl resize-none h-20 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteReason('');
                    }}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || !deleteReason.trim()}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;