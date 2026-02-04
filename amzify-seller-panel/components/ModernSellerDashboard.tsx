import React, { useEffect, useState } from 'react';
import { useSellerDashboard } from '../hooks/useSellerDashboardV2';
import { useTrendAnalysis, normalizeTrendData } from '../hooks/useTrendAnalysis';
import { StatCardAnimated, PremiumCard } from './PremiumCard';
import { CircleChart, BarChartComponent, LineChartComponent } from './AnalyticsCharts';
import { DemographicsChart, LocationMap } from './DemographicsChart';
import { RecentOrders } from './RecentOrdersModern';
import { TopProducts } from './TopProductsModern';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Star, 
  AlertCircle,
  RefreshCw,
  BarChart3
} from 'lucide-react';

interface ModernSellerDashboardProps {
  onNavigate?: (tab: string) => void;
}

export const ModernSellerDashboard: React.FC<ModernSellerDashboardProps> = ({ onNavigate }) => {
  const { data, loading, error, refresh } = useSellerDashboard();
  const { data: trendData } = useTrendAnalysis();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Simplified data with fallbacks - handle backend response structure
  const stats = data?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    avgRating: 0
  };

  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];
  const analytics = data?.analytics || {
    monthlyRevenue: 0,
    ordersToday: 0,
    monthlyOrders: 0,
    conversionRate: 0
  };

  // Calculate growth metrics (simplified)
  const revenueGrowth = analytics.monthlyRevenue > 0 ? Math.round((analytics.monthlyRevenue / Math.max(stats.totalRevenue, 1)) * 100) - 100 : 0;

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900">Error Loading Dashboard</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">Welcome back! Here's your business overview</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCardAnimated
            title="Total Revenue"
            value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}`}
            subtitle="All time"
            trend={revenueGrowth}
            icon={<TrendingUp className="w-5 h-5" />}
            gradient="blue"
            isLoading={loading}
          />
          <StatCardAnimated
            title="Total Orders"
            value={stats.totalOrders || 0}
            subtitle={`${analytics.ordersToday || 0} today`}
            icon={<ShoppingCart className="w-5 h-5" />}
            gradient="purple"
            isLoading={loading}
          />
          <StatCardAnimated
            title="Active Products"
            value={stats.totalProducts || 0}
            subtitle="Live on platform"
            icon={<Package className="w-5 h-5" />}
            gradient="green"
            isLoading={loading}
          />
          <StatCardAnimated
            title="Avg Rating"
            value={Number(stats.avgRating || 0).toFixed(1)}
            subtitle="From reviews"
            icon={<Star className="w-5 h-5" />}
            gradient="orange"
            isLoading={loading}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <PremiumCard variant="glass" className="p-6 group">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Monthly Revenue</p>
            <p className="text-3xl font-black text-slate-900 mt-2 group-hover:text-blue-600 transition-colors">₹{(analytics.monthlyRevenue || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
            <p className="text-xs text-slate-500 mt-2">Last 30 days</p>
          </PremiumCard>
          <PremiumCard variant="glass" className="p-6 group">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Monthly Orders</p>
            <p className="text-3xl font-black text-slate-900 mt-2 group-hover:text-purple-600 transition-colors">{analytics.monthlyOrders || 0}</p>
            <p className="text-xs text-slate-500 mt-2">Last 30 days</p>
          </PremiumCard>
          <PremiumCard variant="glass" className="p-6 group">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Conversion Rate</p>
            <p className="text-3xl font-black text-slate-900 mt-2 group-hover:text-emerald-600 transition-colors">
              {typeof analytics.conversionRate === 'number' 
                ? analytics.conversionRate.toFixed(1) 
                : parseFloat(String(analytics.conversionRate) || '0').toFixed(1)
              }%
            </p>
            <p className="text-xs text-slate-500 mt-2">View to Order</p>
          </PremiumCard>
        </div>

        {/* Analytics Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Analytics & Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Sources */}
            <div>
              <CircleChart
                title="Product Distribution"
                value={stats.totalProducts || 0}
                unit="Products"
                data={[
                  { label: 'Electronics', percentage: 45, color: '#60A5FA' },
                  { label: 'Fashion', percentage: 30, color: '#34D399' },
                  { label: 'Home', percentage: 25, color: '#A78BFA' }
                ]}
              />
            </div>

            {/* Performance Overview */}
            <div className="lg:col-span-2">
              <BarChartComponent
                title="Performance Overview"
                data={[
                  { label: 'Aug', value: 42 },
                  { label: 'Sep', value: 65 },
                  { label: 'Oct', value: 68 },
                  { label: 'Nov', value: 48 },
                  { label: 'Dec', value: 88 }
                ]}
                maxValue={100}
              />
            </div>
          </div>

          {/* Demographics Section */}
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Demographics */}
              <DemographicsChart
                title="Customer Demographics"
                data={[
                  { label: '18-25', value: 2400, percentage: 20, color: '#3b82f6' },
                  { label: '26-35', value: 3900, percentage: 32, color: '#8b5cf6' },
                  { label: '36-45', value: 2800, percentage: 23, color: '#ec4899' },
                  { label: '46-55', value: 1800, percentage: 15, color: '#f59e0b' },
                  { label: '55+', value: 1200, percentage: 10, color: '#10b981' }
                ]}
              />

              {/* Location Distribution */}
              <LocationMap
                title="Geographic Distribution"
                regions={[
                  { name: 'North America', value: 35, color: '#3b82f6' },
                  { name: 'Europe', value: 28, color: '#8b5cf6' },
                  { name: 'Asia Pacific', value: 22, color: '#ec4899' },
                  { name: 'Rest of World', value: 15, color: '#f59e0b' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Recent Orders and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <RecentOrders
              orders={recentOrders.map((order: any) => ({
                order_id: order.order_number || order.id || 'Unknown',
                customer_name: order.customer_name || 'Unknown Customer',
                total_amount: order.total_amount || 0,
                status: order.status || 'pending',
                created_at: order.created_at || new Date().toISOString(),
                items_count: (order.items && order.items.length) || 1
              }))}
              isLoading={loading}
            />
          </div>

          {/* Quick Actions */}
          <PremiumCard variant="glass" className="p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => onNavigate?.('products')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95">
                + Add Product
              </button>
              <button 
                onClick={() => onNavigate?.('orders')}
                className="w-full bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-900 font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95">
                View All Orders
              </button>
              <button 
                onClick={() => onNavigate?.('products')}
                className="w-full bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-900 font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95">
                Manage Inventory
              </button>
              <button 
                onClick={() => onNavigate?.('revenue')}
                className="w-full bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-900 font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95">
                View Analytics
              </button>
            </div>

            {/* Info Card */}
            <PremiumCard variant="minimal" className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200">
              <p className="text-xs text-blue-900 font-semibold uppercase">💡 Tip</p>
              <p className="text-xs text-blue-800 mt-2">
                Keep your product descriptions detailed and add high-quality images for better conversion rates.
              </p>
            </PremiumCard>
          </PremiumCard>
        </div>

        {/* Top Products */}
        <TopProducts
          products={topProducts.map((product: any) => ({
            product_id: product.id || 'unknown',
            name: product.name || 'Unknown Product',
            category: 'Product',
            total_sold: product.totalSold || 0,
            total_revenue: product.totalRevenue || 0,
            image: (product.images && product.images[0]) || undefined
          }))}
          isLoading={loading}
        />
      </div>
    </div>
  );
};
