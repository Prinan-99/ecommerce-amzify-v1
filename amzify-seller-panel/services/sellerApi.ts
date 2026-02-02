const API_BASE_URL = 'http://localhost:5000/api';

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

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // Auth endpoints
  async login(credentials: LoginCredentials) {
    const data = await this.request('/auth/login', {
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
    const data = await this.request('/auth/register/seller', {
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
    return this.request('/auth/me');
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
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

    const data = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
  }

  // Analytics endpoints
  async getSellerStats() {
    return this.request('/analytics/seller/stats');
  }

  async getSellerAnalytics(timeRange: string = '30d') {
    return this.request(`/analytics/seller?range=${timeRange}`);
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
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getOrderDetails(orderId: string) {
    return this.request(`/orders/${orderId}`);
  }

  // Marketing endpoints
  async getMarketingCampaigns() {
    return this.request('/marketing/campaigns');
  }

  async createMarketingCampaign(campaignData: any) {
    return this.request('/marketing/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async updateMarketingCampaign(campaignId: string, campaignData: any) {
    return this.request(`/marketing/campaigns/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    });
  }

  async deleteMarketingCampaign(campaignId: string) {
    return this.request(`/marketing/campaigns/${campaignId}`, {
      method: 'DELETE',
    });
  }

  // Customer endpoints
  async getMyCustomers() {
    return this.request('/customers/seller');
  }

  async getCustomerInsights() {
    return this.request('/customers/insights');
  }

  // Logistics endpoints
  async getMyShipments() {
    return this.request('/logistics/shipments');
  }

  async createShipment(shipmentData: any) {
    return this.request('/logistics/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  }

  async updateShipmentStatus(shipmentId: string, status: string) {
    return this.request(`/logistics/shipments/${shipmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Support endpoints
  async getSupportTickets() {
    return this.request('/support/tickets');
  }

  async createSupportTicket(ticketData: any) {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async updateSupportTicket(ticketId: string, message: string) {
    return this.request(`/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Financial endpoints
  async getPayoutHistory() {
    return this.request('/seller/payouts');
  }

  async requestPayout(amount: number) {
    return this.request('/seller/payouts/request', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async getFinancialSummary() {
    return this.request('/seller/financial/summary');
  }

  // Social Media Integration
  async connectSocialMedia(platform: string, credentials: any) {
    return this.request('/seller/social/connect', {
      method: 'POST',
      body: JSON.stringify({ platform, credentials }),
    });
  }

  async disconnectSocialMedia(platform: string) {
    return this.request(`/seller/social/disconnect/${platform}`, {
      method: 'DELETE',
    });
  }

  async getSocialMediaStats() {
    return this.request('/seller/social/stats');
  }

  async postToSocialMedia(platforms: string[], content: any) {
    return this.request('/seller/social/post', {
      method: 'POST',
      body: JSON.stringify({ platforms, content }),
    });
  }
}

export const sellerApiService = new SellerApiService();
export default sellerApiService;