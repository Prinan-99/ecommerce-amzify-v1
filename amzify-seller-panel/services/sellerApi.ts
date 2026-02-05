const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://ecommerce-amzify-v1.onrender.com';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SellerRegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  phone?: string;
  companyName: string;
  businessType?: string;
  description?: string;
}

class SellerApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    console.log('🌐 API Request:', url, config);

    const response = await fetch(url, config);
    const data = await response.json();

    console.log('📥 API Response:', response.status, data);

    if (!response.ok) {
      console.error('❌ API Error:', data);
      console.error('❌ Full error response:', { status: response.status, statusText: response.statusText, data });
      const error: any = new Error(data.error || data.message || `Request failed with status ${response.status}`);
      error.response = { data, status: response.status };
      throw error;
    }

    return data;
  }

  // Auth endpoints
  async login(credentials: LoginCredentials) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    
    return data;
  }

  async register(userData: SellerRegisterData) {
    const data = await this.request('/api/auth/register/seller', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    
    return data;
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const data = await this.request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
  }

  // Analytics endpoints
  async getSellerStats() {
    return this.request('/api/analytics/seller/stats');
  }

  async getSellerAnalytics(timeRange: string = '30d') {
    return this.request(`/api/analytics/seller?range=${timeRange}`);
  }

  // New comprehensive dashboard endpoints
  async getDashboardStats() {
    return this.request('/products/seller/dashboard-stats');
  }

  async getRevenueAnalytics(period: '7d' | '30d' | '90d' = '7d') {
    return this.request(`/products/seller/revenue-analytics?period=${period}`);
  }

  // Products endpoints (seller-specific)
  async getMyProducts(params?: { status?: string; page?: number; limit?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/products/seller/my-products${queryString}`);
  }

  // Orders endpoints (seller-specific)
  async getMyOrders(params?: { status?: string; page?: number; limit?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/orders/seller/my-orders${queryString}`);
  }

  // Seller Profile endpoints
  async getSellerProfile() {
    return this.request('/seller/profile');
  }

  async updateSellerProfile(profileData: any) {
    return this.request('/seller/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.request('/seller/profile/image', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
  }

  async getRevenueData(period: 'week' | 'month' | 'year' = 'month') {
    return this.request(`/seller/revenue?period=${period}`);
  }

  // Enhanced Products endpoints
  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: string, productData: any) {
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId: string) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async uploadProductImages(productId: string, files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    return this.request(`/products/${productId}/images`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
  }

  // Enhanced Orders endpoints
  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getOrderDetails(orderId: string) {
    return this.request(`/api/orders/${orderId}`);
  }

  // Marketing endpoints
  async getMarketingCampaigns() {
    return this.request('/api/marketing/campaigns');
  }

  async createMarketingCampaign(campaignData: any) {
    return this.request('/api/marketing/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async updateMarketingCampaign(campaignId: string, campaignData: any) {
    return this.request(`/api/marketing/campaigns/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    });
  }

  async deleteMarketingCampaign(campaignId: string) {
    return this.request(`/api/marketing/campaigns/${campaignId}`, {
      method: 'DELETE',
    });
  }

  // Customer endpoints
  async getMyCustomers() {
    return this.request('/api/customers/seller');
  }

  async getCustomerInsights() {
    return this.request('/api/customers/insights');
  }

    // Customer Analytics endpoints
    async getCustomerAnalyticsOverview(startDate?: string, endDate?: string) {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      return this.request(`/api/seller/analytics/overview?${params.toString()}`);
    }

    async getCustomersList(filters?: { search?: string; segment?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.segment) params.append('segment', filters.segment);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      return this.request(`/api/seller/customers?${params.toString()}`);
    }

    async getCustomerProfile(customerId: string) {
      return this.request(`/api/seller/customers/${customerId}`);
    }

    async getCustomerActivity(customerId: string) {
      return this.request(`/api/seller/customers/${customerId}/activity`);
    }

    async getCustomerSegmentation() {
      return this.request('/api/seller/segmentation');
    }

    async exportCustomers(startDate?: string, endDate?: string) {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(`${API_BASE_URL}/seller/export/customers?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }

    async exportPurchaseReport(startDate?: string, endDate?: string) {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(`${API_BASE_URL}/seller/export/purchase-report?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `purchase_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }

    async exportRepeatCustomers() {
      const response = await fetch(`${API_BASE_URL}/seller/export/repeat-customers`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repeat_customers_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }

    async getCustomerAIInsights(customerId: string) {
      return this.request(`/api/seller/customers/${customerId}/ai-insights`);
    }

  // Logistics endpoints
  async getMyShipments() {
    return this.request('/api/logistics/shipments');
  }

  async createShipment(shipmentData: any) {
    return this.request('/api/logistics/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  }

  async updateShipmentStatus(shipmentId: string, status: string) {
    return this.request(`/api/logistics/shipments/${shipmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Support endpoints
  async getSupportTickets() {
    return this.request('/api/support/tickets');
  }

  async createSupportTicket(ticketData: any) {
    return this.request('/api/support/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async updateSupportTicket(ticketId: string, message: string) {
    return this.request(`/api/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Financial endpoints
  async getPayoutHistory() {
    return this.request('/api/seller/payouts');
  }

  async requestPayout(amount: number) {
    return this.request('/api/seller/payouts/request', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async getFinancialSummary() {
    return this.request('/api/seller/financial/summary');
  }

  // Social Media Integration
  async connectSocialMedia(platform: string, credentials: any) {
    return this.request('/api/seller/social/connect', {
      method: 'POST',
      body: JSON.stringify({ platform, credentials }),
    });
  }

  async disconnectSocialMedia(platform: string) {
    return this.request(`/api/seller/social/disconnect/${platform}`, {
      method: 'DELETE',
    });
  }

  async getSocialMediaStats() {
    return this.request('/api/seller/social/stats');
  }

  async postToSocialMedia(platforms: string[], content: any) {
    return this.request('/api/seller/social/post', {
      method: 'POST',
      body: JSON.stringify({ platforms, content }),
    });
  }

  // Password reset endpoints
  async requestPasswordReset(email: string) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }
}

export const sellerApiService = new SellerApiService();
export default sellerApiService;