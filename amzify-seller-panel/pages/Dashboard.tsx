import React, { useEffect, useState } from 'react';
import { sellerApiService } from '../services/sellerApi';
import { analytics } from '../services/analytics';
import { useAuth } from '../context/RealAuthContext';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, ShoppingBag, DollarSign, Package, Users, 
  ArrowUpRight, ArrowDownRight, Eye, Heart, ShoppingCart, Star,
  Clock, CheckCircle, AlertCircle, Zap, Activity, RefreshCw, Bell,
  BarChart3, Calendar, Download, Filter, Search, Sparkles
} from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

// Enhanced Stat Card with animations
const StatCard = ({ icon: Icon, title, value, change, trend, color, loading }: any) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  const handleCardClick = () => {
    // Track stat card interaction
    analytics.trackStatsCardClick(title, value);
  };

  useEffect(() => {
    if (loading) return;
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setAnimatedValue(value);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, loading]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
          <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
        </div>
        <div className="w-20 h-4 bg-slate-200 rounded mb-2"></div>
        <div className="w-32 h-8 bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <div 
      className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
      onClick={handleCardClick}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
              trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {change}%
            </div>
          )}
        </div>
        
        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
          {typeof animatedValue === 'number' && title.toLowerCase().includes('revenue') 
            ? `$${animatedValue.toLocaleString()}` 
            : animatedValue.toLocaleString()}
        </h3>
      </div>
    </div>
  );
};

// Top Products Component
const TopProducts = ({ products, loading }: any) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="w-32 h-6 bg-slate-200 rounded mb-6 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="w-full h-32 bg-slate-200 rounded-xl mb-3"></div>
              <div className="w-3/4 h-4 bg-slate-200 rounded mb-2"></div>
              <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Top Products
        </h3>
        <button className="text-indigo-600 text-sm font-bold hover:text-indigo-700 hover:underline">View all</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {products?.slice(0, 4).map((product: any, index: number) => (
          <div key={product.id} className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-xl mb-3 aspect-square bg-gradient-to-br from-slate-100 to-slate-200">
              {product.images?.[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-gradient-to-br from-indigo-500 to-purple-600 px-2.5 py-1 rounded-full text-xs font-black text-white shadow-lg">
                #{index + 1}
              </div>
            </div>
            <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
              {product.name}
            </h4>
            <p className="text-lg font-black text-indigo-600">${product.price}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-bold">4.8</span>
              </div>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600 font-medium">{product.stock_quantity || 0} in stock</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [salesData, setSalesData] = useState<any[]>([]);

  // Analytics tracking functions
  const handleChartClick = (chartType: string, dataPoint?: any) => {
    analytics.trackChartInteraction(chartType, dataPoint);
  };

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
    analytics.trackEvent('time_range_changed', { previous: timeRange, new: newRange });
    fetchDashboardData();
  };

  const handleRefreshClick = () => {
    analytics.trackEvent('dashboard_refresh');
    fetchDashboardData();
  };

  // Mock chart data with better values
  const mockChartData = [
    { date: 'Mon', revenue: 4200, orders: 24, visitors: 320 },
    { date: 'Tue', revenue: 5100, orders: 31, visitors: 410 },
    { date: 'Wed', revenue: 3800, orders: 22, visitors: 290 },
    { date: 'Thu', revenue: 6200, orders: 38, visitors: 520 },
    { date: 'Fri', revenue: 7500, orders: 45, visitors: 680 },
    { date: 'Sat', revenue: 8900, orders: 52, visitors: 750 },
    { date: 'Sun', revenue: 6700, orders: 41, visitors: 590 },
  ];

  const salesByCategory = [
    { name: 'Electronics', value: 4500, color: '#6366f1' },
    { name: 'Fashion', value: 3200, color: '#8b5cf6' },
    { name: 'Home', value: 2800, color: '#ec4899' },
    { name: 'Sports', value: 2100, color: '#f59e0b' },
    { name: 'Books', value: 1400, color: '#10b981' },
  ];

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Track dashboard data fetch attempt
      analytics.trackDashboardView(user?.id || 'anonymous');
      
      const [dashboardData, revenueData] = await Promise.all([
        sellerApiService.getDashboardStats().catch((error) => {
          console.error('Dashboard stats error:', error);
          analytics.trackError('dashboard_stats_failed', error);
          return null;
        }),
        sellerApiService.getRevenueAnalytics(timeRange as any).catch((error) => {
          console.error('Revenue analytics error:', error);
          analytics.trackError('revenue_analytics_failed', error);
          return { chartData: mockChartData };
        })
      ]);

      if (dashboardData) {
        setStats({
          totalRevenue: dashboardData.stats.totalRevenue,
          totalOrders: dashboardData.stats.totalOrders,
          productsSold: dashboardData.stats.activeProducts,
          totalCustomers: dashboardData.stats.totalOrders,
          revenueGrowth: dashboardData.stats.revenueGrowth,
          ordersGrowth: dashboardData.stats.ordersGrowth,
          productsGrowth: dashboardData.stats.productsGrowth,
          averageOrderValue: dashboardData.stats.averageOrderValue,
          monthlyRevenue: dashboardData.stats.monthlyRevenue,
          pendingOrders: dashboardData.stats.pendingOrders
        });
        setProducts(dashboardData.topProducts || []);
        setOrders(dashboardData.recentOrders || []);
        setSalesData(dashboardData.categoryBreakdown || []);
        
        // Track successful data load
        analytics.trackStatsLoad(dashboardData.stats);
      } else {
        // Fallback to mock data
        setStats({
          totalRevenue: 24567,
          totalOrders: 342,
          productsSold: 1205,
          totalCustomers: 189,
          revenueGrowth: 12.5,
          ordersGrowth: 8.3,
          productsGrowth: 15.2,
          averageOrderValue: 71.8
        });
        setProducts([]);
        setOrders([]);
        setSalesData(salesByCategory);
        
        // Track fallback to mock data
        analytics.trackEvent('dashboard_fallback_data');
      }
      
      setChartData(revenueData?.chartData || mockChartData);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      analytics.trackError('dashboard_fetch_failed', error);
      
      setStats({
        totalRevenue: 24567,
        totalOrders: 342,
        productsSold: 1205,
        totalCustomers: 189,
        revenueGrowth: 12.5,
        ordersGrowth: 8.3,
        productsGrowth: 15.2,
        averageOrderValue: 71.8
      });
      setProducts([]);
      setOrders([]);
      setChartData(mockChartData);
      setSalesData(salesByCategory);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [timeRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">
              Seller Dashboard
            </h1>
            <p className="text-purple-200 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-300 animate-pulse" />
              Welcome back, {user?.first_name}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-7xl mx-auto">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={stats?.totalRevenue || 24567}
            change={stats?.revenueGrowth || 12.5}
            trend="up"
            color="from-indigo-500 to-purple-600"
            loading={loading}
          />
          <StatCard
            icon={ShoppingBag}
            title="Total Orders"
            value={stats?.totalOrders || 342}
            change={stats?.ordersGrowth || 8.2}
            trend="up"
            color="from-blue-500 to-cyan-600"
            loading={loading}
          />
          <StatCard
            icon={Package}
            title="Products Sold"
            value={stats?.productsSold || 1205}
            change={stats?.productsGrowth || 5.7}
            trend="up"
            color="from-emerald-500 to-green-600"
            loading={loading}
          />
          <StatCard
            icon={Users}
            title="Total Customers"
            value={stats?.totalCustomers || 189}
            change={15.2}
            trend="up"
            color="from-orange-500 to-red-600"
            loading={loading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Bar Chart */}
          <div className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Weekly Revenue</h3>
                <p className="text-xs text-slate-500 mt-1">Last 7 days performance</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Sales Pie Chart */}
          <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Sales by Category</h3>
                <p className="text-xs text-slate-500 mt-1">Product distribution</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={salesData.length > 0 ? salesData : salesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(salesData.length > 0 ? salesData : salesByCategory).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-3">
              {(salesData.length > 0 ? salesData : salesByCategory).map((category, index) => (
                <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-lg" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-bold text-slate-700">{category.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">
                    {category.value ? `$${category.value.toLocaleString()}` : `${Math.round(category.percentage || 0)}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products & Orders Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopProducts products={products} loading={loading} />
          
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-xl hover:border-indigo-300 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-indigo-600" />
                Recent Orders
              </h3>
              <button className="text-indigo-600 text-sm font-black hover:text-indigo-700 hover:underline">View all</button>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 animate-pulse">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
                      <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
                    </div>
                    <div className="w-20 h-8 bg-slate-200 rounded-full"></div>
                  </div>
                ))
              ) : orders.length > 0 ? (
                orders.slice(0, 5).map((order: any, index: number) => (
                  <div key={order.id || index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all cursor-pointer border-2 border-transparent hover:border-indigo-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-900">Order #{order.orderNumber || order.id?.slice(0, 8) || `ORD-${index}`}</p>
                      <p className="text-xs text-slate-600 font-medium">{order.customerName || 'Customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-indigo-600">${order.totalAmount || '0.00'}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">No recent orders</p>
                  <p className="text-slate-400 text-sm">Orders will appear here once customers start purchasing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

function fetchDashboardData() {
  throw new Error('Function not implemented.');
}
