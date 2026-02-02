/**
 * Seller API Service for Amzify E-commerce
 * 
 * This service provides API integration for seller-specific operations
 * with automatic authentication header inclusion and token refresh handling.
 */

import { sellerApi } from '../../shared/auth/ApiService';
import { Product, Order, Customer, Campaign, AutomationRule } from '../types';

// Mock data for development/fallback
const MOCK_DATA = {
  sellerStats: {
    totalRevenue: 1245000,
    totalOrders: 342,
    totalCustomers: 156,
    averageOrderValue: 3640,
    conversionRate: 4.2,
    returnRate: 2.1,
    topSellingProduct: 'Zenith Wireless Headphones',
    monthlyGrowth: 18.5
  },
  products: [
    {
      id: 'p-1',
      name: 'Zenith Wireless Headphones',
      price: 24999,
      originalPrice: 29999,
      category: 'Electronics',
      stock: 45,
      status: 'ACTIVE',
      sales: 89,
      revenue: 2224911,
      imageUrl: 'https://picsum.photos/seed/zenith/200/200'
    },
    {
      id: 'p-2', 
      name: 'Aura Silk Evening Gown',
      price: 15499,
      originalPrice: 18999,
      category: 'Fashion',
      stock: 12,
      status: 'ACTIVE',
      sales: 34,
      revenue: 526966,
      imageUrl: 'https://picsum.photos/seed/aura/200/200'
    }
  ],
  orders: [
    {
      id: 'ORD-8291',
      customer: 'Aarav Sharma',
      email: 'aarav@nexus.in',
      address: 'Sky Tower, Mumbai',
      total: 24999,
      date: '2024-05-20',
      status: 'Processing',
      items: [
        { productId: 'p-1', productName: 'Zenith Wireless Headphones', quantity: 1, price: 24999 }
      ]
    },
    {
      id: 'ORD-8290',
      customer: 'Ishani Roy',
      email: 'ishani.r@glam.com',
      address: 'UB City, Bangalore',
      total: 15499,
      date: '2024-05-19',
      status: 'Shipped',
      items: [
        { productId: 'p-2', productName: 'Aura Silk Evening Gown', quantity: 1, price: 15499 }
      ]
    }
  ],
  customers: [
    {
      id: 'CUST-001',
      name: 'Aarav Sharma',
      email: 'aarav@nexus.in',
      totalOrders: 12,
      totalSpent: 145000,
      lastPurchase: '2024-05-20',
      status: 'Active',
      joinDate: '2024-01-15'
    },
    {
      id: 'CUST-002',
      name: 'Ishani Roy',
      email: 'ishani.r@glam.com',
      totalOrders: 5,
      totalSpent: 78900,
      lastPurchase: '2024-05-19',
      status: 'Active',
      joinDate: '2024-02-08'
    }
  ],
  campaigns: [
    {
      id: 'CMP-101',
      name: 'Spring Revival',
      platform: 'Instagram',
      status: 'Active',
      reach: 12400,
      engagement: '4.2%',
      product: 'Aura Silk Gown',
      budget: 25000,
      spent: 18500,
      conversions: 23
    },
    {
      id: 'CMP-102',
      name: 'Elite Audio Launch',
      platform: 'Email',
      status: 'Draft',
      reach: 0,
      engagement: '0%',
      product: 'Zenith Wireless',
      budget: 15000,
      spent: 0,
      conversions: 0
    }
  ],
  automations: [
    {
      id: 'AUTO-01',
      name: 'Global VIP Welcome',
      trigger: 'welcome',
      active: true,
      lastSent: '2 hours ago',
      stats: { delivered: 1420, opened: 890, clicked: 234 }
    },
    {
      id: 'AUTO-02',
      name: 'High-Value Abandonment',
      trigger: 'abandonment',
      active: true,
      lastSent: '15 mins ago',
      stats: { delivered: 45, opened: 32, clicked: 8 }
    }
  ]
};

/**
 * Seller API service with authentication integration
 */
export const SellerApi = {
  // Dashboard and Analytics
  getSellerStats: async () => {
    try {
      return await sellerApi.get('/stats');
    } catch (error) {
      console.warn('Failed to fetch seller stats, using mock data:', error);
      return MOCK_DATA.sellerStats;
    }
  },

  getSellerAnalytics: async (timeRange: '7d' | '30d' | '90d' | '1y' = '30d') => {
    try {
      return await sellerApi.get(`/analytics?range=${timeRange}`);
    } catch (error) {
      console.warn('Failed to fetch analytics, using mock data:', error);
      // Generate mock analytics data based on time range
      const points = timeRange === '7d' ? 7 : timeRange === '30d' ? 15 : timeRange === '90d' ? 30 : 12;
      return Array.from({ length: points }).map((_, i) => ({
        label: timeRange === '1y' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i % 12] : `${i + 1}`,
        revenue: Math.floor(Math.random() * 50000) + 15000,
        orders: Math.floor(Math.random() * 20) + 5,
        active: i === points - 1
      }));
    }
  },

  // Product Management
  getProducts: async () => {
    try {
      return await sellerApi.get('/products');
    } catch (error) {
      console.warn('Failed to fetch products, using mock data:', error);
      return MOCK_DATA.products;
    }
  },

  createProduct: async (productData: Partial<Product>) => {
    try {
      return await sellerApi.post('/products', productData);
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  },

  updateProduct: async (productId: string, updates: Partial<Product>) => {
    try {
      return await sellerApi.patch(`/products/${productId}`, updates);
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  },

  deleteProduct: async (productId: string) => {
    try {
      return await sellerApi.delete(`/products/${productId}`);
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  },

  // Order Management
  getOrders: async (status?: string) => {
    try {
      const url = status ? `/orders?status=${status}` : '/orders';
      return await sellerApi.get(url);
    } catch (error) {
      console.warn('Failed to fetch orders, using mock data:', error);
      return MOCK_DATA.orders;
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      return await sellerApi.patch(`/orders/${orderId}/status`, { status });
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  },

  getOrderDetails: async (orderId: string) => {
    try {
      return await sellerApi.get(`/orders/${orderId}`);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      throw error;
    }
  },

  // Customer Management
  getCustomers: async () => {
    try {
      return await sellerApi.get('/customers');
    } catch (error) {
      console.warn('Failed to fetch customers, using mock data:', error);
      return MOCK_DATA.customers;
    }
  },

  getCustomerDetails: async (customerId: string) => {
    try {
      return await sellerApi.get(`/customers/${customerId}`);
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      throw error;
    }
  },

  // Marketing and Campaigns
  getCampaigns: async () => {
    try {
      return await sellerApi.get('/campaigns');
    } catch (error) {
      console.warn('Failed to fetch campaigns, using mock data:', error);
      return MOCK_DATA.campaigns;
    }
  },

  createCampaign: async (campaignData: Partial<Campaign>) => {
    try {
      return await sellerApi.post('/campaigns', campaignData);
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  },

  updateCampaign: async (campaignId: string, updates: Partial<Campaign>) => {
    try {
      return await sellerApi.patch(`/campaigns/${campaignId}`, updates);
    } catch (error) {
      console.error('Failed to update campaign:', error);
      throw error;
    }
  },

  deleteCampaign: async (campaignId: string) => {
    try {
      return await sellerApi.delete(`/campaigns/${campaignId}`);
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      throw error;
    }
  },

  // Email Automation
  getAutomations: async () => {
    try {
      return await sellerApi.get('/automations');
    } catch (error) {
      console.warn('Failed to fetch automations, using mock data:', error);
      return MOCK_DATA.automations;
    }
  },

  createAutomation: async (automationData: Partial<AutomationRule>) => {
    try {
      return await sellerApi.post('/automations', automationData);
    } catch (error) {
      console.error('Failed to create automation:', error);
      throw error;
    }
  },

  updateAutomation: async (automationId: string, updates: Partial<AutomationRule>) => {
    try {
      return await sellerApi.patch(`/automations/${automationId}`, updates);
    } catch (error) {
      console.error('Failed to update automation:', error);
      throw error;
    }
  },

  toggleAutomation: async (automationId: string, active: boolean) => {
    try {
      return await sellerApi.patch(`/automations/${automationId}/toggle`, { active });
    } catch (error) {
      console.error('Failed to toggle automation:', error);
      throw error;
    }
  },

  // File Upload
  uploadProductImage: async (productId: string, imageFile: File) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('productId', productId);
      
      return await sellerApi.upload(`/products/${productId}/image`, formData);
    } catch (error) {
      console.error('Failed to upload product image:', error);
      throw error;
    }
  },

  // Reports and Exports
  exportOrders: async (startDate?: string, endDate?: string) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      return await sellerApi.download(`/reports/orders?${params.toString()}`);
    } catch (error) {
      console.error('Failed to export orders:', error);
      throw error;
    }
  },

  exportCustomers: async () => {
    try {
      return await sellerApi.download('/reports/customers');
    } catch (error) {
      console.error('Failed to export customers:', error);
      throw error;
    }
  },

  // Seller Profile
  getSellerProfile: async () => {
    try {
      return await sellerApi.get('/profile');
    } catch (error) {
      console.error('Failed to fetch seller profile:', error);
      throw error;
    }
  },

  updateSellerProfile: async (profileData: any) => {
    try {
      return await sellerApi.patch('/profile', profileData);
    } catch (error) {
      console.error('Failed to update seller profile:', error);
      throw error;
    }
  }
};

export default SellerApi;