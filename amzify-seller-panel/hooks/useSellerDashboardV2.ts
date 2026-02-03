import { useState, useEffect } from 'react';
import axios from 'axios';

export interface DashboardData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    avgRating: number;
  };
  recentOrders: Array<{
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: Array<{ product_name: string; quantity: number; price: number }>;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    price: number;
    images: string[];
    totalSold: number;
    totalRevenue: number;
    status: string;
  }>;
  analytics: {
    monthlyRevenue: number;
    ordersToday: number;
    monthlyOrders: number;
    conversionRate: string;
  };
}

export const useSellerDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await axios.get('http://localhost:5000/api/seller/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setData(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch dashboard';
      setError(message);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refresh: fetchDashboard };
};
