import React, { useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Star,
  RefreshCw,
  AlertTriangle,
  Download
} from 'lucide-react';
import { useSellerDashboard } from '../hooks/useSellerDashboard';
import { SellerStatsCard } from './SellerStatsCard';
import { RecentOrdersTable } from './RecentOrdersTable';
import { TopProducts } from './TopProducts';

interface FullDashboardProps {
  onEditProduct?: (productId: string) => void;
  onViewOrder?: (orderId: string) => void;
}

export const FullSellerDashboard: React.FC<FullDashboardProps> = ({
  onEditProduct,
  onViewOrder
}) => {
  const { stats, recentOrders, topProducts, loading, error, refresh } = useSellerDashboard();

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Auto refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here's your seller performance overview</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-900">Failed to load dashboard</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={refresh}
              className="text-sm text-red-600 hover:text-red-800 font-bold mt-2 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SellerStatsCard
          title="Total Sales"
          value={formatINR(stats?.totalRevenue || 0)}
          change={stats?.revenueGrowth}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
          isLoading={loading}
        />
        <SellerStatsCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          change={stats?.ordersGrowth}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="blue"
          isLoading={loading}
        />
        <SellerStatsCard
          title="Active Products"
          value={stats?.activeProducts || 0}
          change={stats?.productsGrowth}
          icon={<Package className="w-5 h-5" />}
          color="purple"
          isLoading={loading}
        />
        <SellerStatsCard
          title="Avg. Order Value"
          value={formatINR(stats?.averageOrderValue || 0)}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="orange"
          isLoading={loading}
        />
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
              <p className="text-sm text-slate-600 mt-1">Latest 5 orders from customers</p>
            </div>
            <ShoppingCart className="w-6 h-6 text-indigo-600" />
          </div>
          <RecentOrdersTable
            orders={recentOrders}
            isLoading={loading}
            onViewOrder={onViewOrder}
          />
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs text-slate-600 uppercase font-bold mb-2">This Month</p>
            <p className="text-2xl font-black text-slate-900 mb-2">
              {formatINR(stats?.monthlyRevenue || 0)}
            </p>
            <p className="text-xs text-green-600 font-bold">
              ↑ {stats?.revenueGrowth || 0}% from last month
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs text-slate-600 uppercase font-bold mb-2">Pending Orders</p>
            <p className="text-2xl font-black text-slate-900 mb-2">{stats?.pendingOrders || 0}</p>
            <p className="text-xs text-orange-600 font-bold">Need attention</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs text-slate-600 uppercase font-bold mb-2">Conversion</p>
            <p className="text-2xl font-black text-slate-900 mb-2">
              {(stats?.conversionRate || 0).toFixed(1)}%
            </p>
            <p className="text-xs text-slate-600">Overall conversion rate</p>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Top Selling Products</h2>
            <p className="text-sm text-slate-600 mt-1">Your best performing items</p>
          </div>
          <Package className="w-6 h-6 text-indigo-600" />
        </div>
        <TopProducts
          products={topProducts}
          isLoading={loading}
          onEdit={onEditProduct}
        />
      </div>
    </div>
  );
};
