import React, { useEffect, useState } from 'react';
import { sellerApiService } from '../services/sellerApi';
import { ModernStatCard } from '../components/ModernStatCard';
import AmzifyLoader from '../components/AmzifyLoader';
import {
  Users, TrendingUp, DollarSign, RefreshCw, Search, Download,
  Calendar, Filter, ChevronRight, Eye, ArrowUpDown, Sparkles,
  ShoppingBag, Heart, UserCheck, AlertCircle
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  customer_type: string;
  customer_segment: string;
}

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  returningCustomers: number;
  repeatPurchaseRate: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
}

const Customers: React.FC = () => {
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load analytics and customers
  useEffect(() => {
    loadData();
  }, [searchTerm, selectedSegment, startDate, endDate, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load analytics overview
      const analyticsData = await sellerApiService.getCustomerAnalyticsOverview(
        startDate || undefined,
        endDate || undefined
      );
      setAnalytics(analyticsData);

      // Load customers list
      const customersData = await sellerApiService.getCustomersList({
        search: searchTerm || undefined,
        segment: selectedSegment || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        limit: 50
      });
      
      setCustomers(customersData.customers);
      setTotalPages(customersData.totalPages);
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCustomers = () => {
    sellerApiService.exportCustomers(startDate || undefined, endDate || undefined);
  };

  const handleExportPurchaseReport = () => {
    sellerApiService.exportPurchaseReport(startDate || undefined, endDate || undefined);
  };

  const handleExportRepeatCustomers = () => {
    sellerApiService.exportRepeatCustomers();
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const getSegmentBadge = (segment: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      loyal: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Loyal' },
      high_value: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'High Value' },
      at_risk: { bg: 'bg-red-100', text: 'text-red-700', label: 'At Risk' },
      new: { bg: 'bg-green-100', text: 'text-green-700', label: 'New' },
      regular: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Regular' }
    };
    
    const badge = badges[segment] || badges.regular;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getCustomerTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      loyal: { bg: 'bg-purple-50', text: 'text-purple-600' },
      returning: { bg: 'bg-blue-50', text: 'text-blue-600' },
      new: { bg: 'bg-green-50', text: 'text-green-600' }
    };
    
    const badge = badges[type] || badges.new;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">
              Customer Analytics
            </h1>
            <p className="text-slate-600">
              Understand your customers and grow your business
            </p>
          </div>
          
          {/* Export Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleExportCustomers}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Customers
            </button>
            <button
              onClick={handleExportPurchaseReport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Purchase Report
            </button>
            <button
              onClick={handleExportRepeatCustomers}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Repeat Customers
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ModernStatCard
            title="Total Customers"
            value={analytics?.totalCustomers || 0}
            icon={<Users />}
            gradient="blue"
            isLoading={loading}
          />
          
          <ModernStatCard
            title="New This Month"
            value={analytics?.newCustomersThisMonth || 0}
            icon={<UserCheck />}
            gradient="green"
            isLoading={loading}
          />
          
          <ModernStatCard
            title="Returning Customers"
            value={analytics?.returningCustomers || 0}
            icon={<RefreshCw />}
            gradient="purple"
            isLoading={loading}
          />
          
          <ModernStatCard
            title="Repeat Purchase Rate"
            value={`${analytics?.repeatPurchaseRate || 0}%`}
            icon={<TrendingUp />}
            gradient="orange"
            isLoading={loading}
          />
          
          <ModernStatCard
            title="Avg Order Value"
            value={`₹${analytics?.averageOrderValue || 0}`}
            icon={<DollarSign />}
            gradient="green"
            isLoading={loading}
          />
          
          <ModernStatCard
            title="Customer Lifetime Value"
            value={`₹${analytics?.customerLifetimeValue || 0}`}
            icon={<Heart />}
            gradient="pink"
            isLoading={loading}
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Segment Filter */}
            <div>
              <select
                value={selectedSegment}
                onChange={(e) => {
                  setSelectedSegment(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Segments</option>
                <option value="loyal">Loyal</option>
                <option value="high_value">High Value</option>
                <option value="at_risk">At Risk</option>
                <option value="new">New</option>
                <option value="regular">Regular</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedSegment || startDate || endDate) && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-slate-600">Active filters:</span>
              {searchTerm && (
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm flex items-center gap-2">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-indigo-900">×</button>
                </span>
              )}
              {selectedSegment && (
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm flex items-center gap-2">
                  Segment: {selectedSegment}
                  <button onClick={() => setSelectedSegment('')} className="hover:text-purple-900">×</button>
                </span>
              )}
              {(startDate || endDate) && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2">
                  Date Range
                  <button onClick={() => { setStartDate(''); setEndDate(''); }} className="hover:text-blue-900">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Last Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Segment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  // Loading skeleton
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 rounded w-40"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 rounded w-12"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-slate-200 rounded-full w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 bg-slate-200 rounded w-16"></div>
                      </td>
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-lg font-medium">No customers found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleViewCustomer(customer)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{customer.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">{customer.email}</div>
                        <div className="text-xs text-slate-400">{customer.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-900">{customer.total_orders}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-600">
                          ₹{customer.total_spent.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {new Date(customer.last_order_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getCustomerTypeBadge(customer.customer_type)}
                      </td>
                      <td className="px-6 py-4">
                        {getSegmentBadge(customer.customer_segment)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCustomer(customer);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && customers.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};

// Customer Profile Modal Component
const CustomerProfileModal: React.FC<{ customer: Customer; onClose: () => void }> = ({
  customer,
  onClose
}) => {
  const [profile, setProfile] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'tickets' | 'activity'>('orders');

  useEffect(() => {
    loadProfileData();
  }, [customer.id]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileData, insights] = await Promise.all([
        sellerApiService.getCustomerProfile(customer.id),
        sellerApiService.getCustomerAIInsights(customer.id)
      ]);
      
      setProfile(profileData);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChurnRiskColor = (risk: string) => {
    if (risk === 'high') return 'text-red-600 bg-red-50';
    if (risk === 'medium') return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{customer.name}</h2>
              <p className="text-indigo-100">{customer.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <AmzifyLoader message="Loading Customer Profile" submessage="Fetching insights from Amzify..." size="medium" />
          </div>
        ) : (
          <>
            {/* AI Insights Section */}
            {aiInsights && (
              <div className="px-6 py-4 bg-gradient-to-br from-purple-50 to-pink-50 border-b border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-purple-900">AI-Powered Insights</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/70 rounded-xl p-3 border border-purple-100">
                    <div className="text-xs text-purple-600 font-medium mb-1">Next Purchase Prediction</div>
                    <div className="font-semibold text-slate-900">{aiInsights.nextPurchasePrediction}</div>
                  </div>
                  {aiInsights.suggestedDiscount && (
                    <div className="bg-white/70 rounded-xl p-3 border border-purple-100">
                      <div className="text-xs text-purple-600 font-medium mb-1">Suggested Discount</div>
                      <div className="font-semibold text-green-600">{aiInsights.suggestedDiscount}</div>
                    </div>
                  )}
                  <div className="bg-white/70 rounded-xl p-3 border border-purple-100">
                    <div className="text-xs text-purple-600 font-medium mb-1">Churn Risk</div>
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getChurnRiskColor(aiInsights.churnRisk)}`}>
                      {aiInsights.churnRisk.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-slate-600 mb-1">Total Orders</div>
                  <div className="text-2xl font-bold text-slate-900">{profile?.stats.totalOrders || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1">Total Spent</div>
                  <div className="text-2xl font-bold text-green-600">₹{profile?.stats.totalSpent || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1">Avg Order Value</div>
                  <div className="text-2xl font-bold text-indigo-600">₹{profile?.stats.averageOrderValue || 0}</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-slate-200">
              <div className="flex gap-6">
                {(['orders', 'addresses', 'tickets'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                      activeTab === tab
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {profile?.orders?.map((order: any) => (
                    <div key={order.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold text-slate-900">{order.order_number}</div>
                          <div className="text-sm text-slate-600">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            ₹{order.order_items.reduce((sum: number, item: any) => sum + parseFloat(item.total_price), 0).toFixed(2)}
                          </div>
                          <div className="text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.order_items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                            <span className="text-slate-700">{item.product_name}</span>
                            <span className="text-slate-500">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {(!profile?.orders || profile.orders.length === 0) && (
                    <div className="text-center py-8 text-slate-500">No orders found</div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="space-y-4">
                  {profile?.addresses?.map((address: any) => (
                    <div key={address.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div>
                          {address.is_default && (
                            <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded mb-2">
                              Default
                            </span>
                          )}
                          <div className="font-medium text-slate-900 mb-1">{address.type}</div>
                          <div className="text-sm text-slate-600">
                            {address.street_address}<br />
                            {address.city}, {address.state} {address.postal_code}<br />
                            {address.country}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!profile?.addresses || profile.addresses.length === 0) && (
                    <div className="text-center py-8 text-slate-500">No addresses found</div>
                  )}
                </div>
              )}

              {activeTab === 'tickets' && (
                <div className="space-y-4">
                  {profile?.tickets?.map((ticket: any) => (
                    <div key={ticket.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-slate-900">{ticket.subject}</div>
                          <div className="text-sm text-slate-600 mt-1">{ticket.description}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                          ticket.status === 'closed' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(ticket.created_at).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  ))}
                  {(!profile?.tickets || profile.tickets.length === 0) && (
                    <div className="text-center py-8 text-slate-500">No support tickets found</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Customers;
