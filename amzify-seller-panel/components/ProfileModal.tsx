import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Phone, Building, MapPin, Globe, 
  Camera, Save, Edit, Link, Facebook, Twitter, Instagram, 
  Youtube, Linkedin, DollarSign, TrendingUp, Package, 
  ShoppingCart, Users, Star, Upload, Settings, Bell,
  CreditCard, Wallet, Banknote, Calendar, Award, Download
} from 'lucide-react';
import { useAuth } from '../context/RealAuthContext';
import { sellerApiService } from '../services/sellerApi';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'social' | 'analytics' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    linkedin: '',
    website: ''
  });
  const [analytics, setAnalytics] = useState<any>({});

  useEffect(() => {
    if (isOpen && user) {
      loadProfileData();
      loadAnalytics();
    }
  }, [isOpen, user]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await sellerApiService.getSellerProfile();
      setProfileData(response.profile || {});
      setSocialLinks(response.profile?.social_links || {
        facebook: '',
        twitter: '',
        instagram: '',
        youtube: '',
        linkedin: '',
        website: ''
      });
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await sellerApiService.getSellerAnalytics();
      setAnalytics(response.analytics || {});
    } catch (error) {
      console.error('Load analytics error:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      await sellerApiService.updateSellerProfile({
        ...profileData,
        social_links: socialLinks
      });
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Save profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
              {user?.first_name?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-slate-600">{user?.company_name || 'Seller Profile'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-8">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'business', label: 'Business', icon: Building },
            { id: 'social', label: 'Social Media', icon: Link },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
                >
                  <Edit className="w-4 h-4" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileData.first_name || user?.first_name || ''}
                    onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.last_name || user?.last_name || ''}
                    onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone || user?.phone || ''}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={profileData.company_name || user?.company_name || ''}
                    onChange={(e) => setProfileData({...profileData, company_name: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Business Type</label>
                  <select
                    value={profileData.business_type || ''}
                    onChange={(e) => setProfileData({...profileData, business_type: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                  >
                    <option value="">Select Business Type</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion & Apparel</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Books">Books & Media</option>
                    <option value="Sports">Sports & Fitness</option>
                    <option value="Beauty">Beauty & Health</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Business Description</label>
                  <textarea
                    value={profileData.description || ''}
                    onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                    placeholder="Describe your business..."
                  />
                </div>
              </div>

              {/* Business Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <span className="text-xs font-medium text-green-600">+12%</span>
                  </div>
                  <h4 className="text-2xl font-bold text-green-900">{formatCurrency(analytics.total_revenue || 125000)}</h4>
                  <p className="text-sm text-green-700">Total Revenue</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-8 h-8 text-blue-600" />
                    <span className="text-xs font-medium text-blue-600">+8%</span>
                  </div>
                  <h4 className="text-2xl font-bold text-blue-900">{analytics.total_products || 45}</h4>
                  <p className="text-sm text-blue-700">Products Listed</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <ShoppingCart className="w-8 h-8 text-purple-600" />
                    <span className="text-xs font-medium text-purple-600">+15%</span>
                  </div>
                  <h4 className="text-2xl font-bold text-purple-900">{analytics.total_orders || 234}</h4>
                  <p className="text-sm text-purple-700">Orders Completed</p>
                </div>
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                  <div className="flex items-center justify-between mb-2">
                    <Star className="w-8 h-8 text-amber-600" />
                    <span className="text-xs font-medium text-amber-600">4.8/5</span>
                  </div>
                  <h4 className="text-2xl font-bold text-amber-900">{analytics.avg_rating || '4.8'}</h4>
                  <p className="text-sm text-amber-700">Average Rating</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Social Media Integration</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
                >
                  <Link className="w-4 h-4" />
                  {isEditing ? 'Cancel' : 'Edit Links'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      Facebook Page
                    </label>
                    <input
                      type="url"
                      value={socialLinks.facebook}
                      onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                      disabled={!isEditing}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Twitter className="w-4 h-4 text-blue-400" />
                      Twitter Profile
                    </label>
                    <input
                      type="url"
                      value={socialLinks.twitter}
                      onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                      disabled={!isEditing}
                      placeholder="https://twitter.com/yourhandle"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Instagram className="w-4 h-4 text-pink-600" />
                      Instagram Account
                    </label>
                    <input
                      type="url"
                      value={socialLinks.instagram}
                      onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                      disabled={!isEditing}
                      placeholder="https://instagram.com/youraccount"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Youtube className="w-4 h-4 text-red-600" />
                      YouTube Channel
                    </label>
                    <input
                      type="url"
                      value={socialLinks.youtube}
                      onChange={(e) => setSocialLinks({...socialLinks, youtube: e.target.value})}
                      disabled={!isEditing}
                      placeholder="https://youtube.com/yourchannel"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Linkedin className="w-4 h-4 text-blue-700" />
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      value={socialLinks.linkedin}
                      onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                      disabled={!isEditing}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Globe className="w-4 h-4 text-slate-600" />
                      Website
                    </label>
                    <input
                      type="url"
                      value={socialLinks.website}
                      onChange={(e) => setSocialLinks({...socialLinks, website: e.target.value})}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Save Links
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Performance Analytics</h3>
              
              {/* Revenue Chart */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="text-lg font-bold text-slate-900 mb-4">Revenue Overview</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.monthly_revenue || 45000)}</p>
                    <p className="text-sm text-slate-600">This Month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.yearly_revenue || 540000)}</p>
                    <p className="text-sm text-slate-600">This Year</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{analytics.growth_rate || '+15'}%</p>
                    <p className="text-sm text-slate-600">Growth Rate</p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100">
                  <h5 className="font-bold text-slate-900 mb-4">Top Performing Products</h5>
                  <div className="space-y-3">
                    {(analytics.top_products || [
                      { name: 'Wireless Headphones Pro', sales: 156, revenue: 467000 },
                      { name: 'Smart Fitness Watch', sales: 89, revenue: 445000 },
                      { name: 'Bluetooth Speaker', sales: 67, revenue: 134000 }
                    ]).map((product: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-600">{product.sales} sales</p>
                        </div>
                        <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100">
                  <h5 className="font-bold text-slate-900 mb-4">Customer Insights</h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Total Customers</span>
                      <span className="font-bold text-slate-900">{analytics.total_customers || 1247}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Repeat Customers</span>
                      <span className="font-bold text-slate-900">{analytics.repeat_customers || 423}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Customer Satisfaction</span>
                      <span className="font-bold text-green-600">{analytics.satisfaction_rate || '94'}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Average Order Value</span>
                      <span className="font-bold text-slate-900">{formatCurrency(analytics.avg_order_value || 2850)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Account Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900">Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-slate-700">Email notifications for new orders</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-slate-700">SMS alerts for urgent matters</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded" />
                      <span className="text-slate-700">Marketing campaign updates</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900">Privacy</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-slate-700">Show profile in seller directory</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded" />
                      <span className="text-slate-700">Allow customer reviews</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-slate-700">Display business metrics publicly</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 mb-4">Account Actions</h4>
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                    <Download className="w-4 h-4 inline mr-2" />
                    Export Data
                  </button>
                  <button className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Advanced Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;