import { useState, useEffect } from 'react';
import { sellerApiService } from '../services/sellerApi';

export interface SellerStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  revenueGrowth: number;
  ordersGrowth: number;
  productsGrowth: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  items: any[];
  created_at: string;
  payment_method: string;
}

export interface TopProduct {
  id: string;
  name: string;
  price: number;
  images?: string[];
  totalSold: number;
  totalRevenue: number;
  category_name?: string;
}

export interface DashboardData {
  stats: SellerStats | null;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useSellerDashboard = (): DashboardData => {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 1;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await sellerApiService.getDashboardStats();

      if (response && response.stats) {
        setStats(response.stats);
        setRecentOrders(response.recentOrders || []);
        setTopProducts(response.topProducts || []);
        setRetryCount(0);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch dashboard data';
      
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(fetchDashboardData, 2000);
      } else {
        setError(errorMessage);
        console.error('Dashboard fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    recentOrders,
    topProducts,
    loading,
    error,
    refresh: fetchDashboardData
  };
};
