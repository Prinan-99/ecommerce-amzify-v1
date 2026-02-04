const API_BASE_URL = 'http://localhost:5000/api';

interface LoginCredentials {
  email: string;
  password: string;
}

class AdminApiService {
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

  // Admin-specific endpoints
  async getAllUsers(params?: { role?: string; page?: number; limit?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/admin/users${queryString}`);
  }

  async getAllSellers(params?: { page?: number; limit?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/admin/sellers${queryString}`);
  }

  async getPendingSellers() {
    return this.request('/admin/sellers/pending');
  }

  async approveSeller(sellerId: string, approved: boolean = true) {
    return this.request(`/admin/sellers/${sellerId}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ approved }),
    });
  }

  async rejectSeller(sellerId: string, reason?: string) {
    return this.request(`/admin/sellers/${sellerId}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ approved: false, reason }),
    });
  }

  async getAllProducts(params?: { status?: string; seller?: string; page?: number; limit?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/admin/products${queryString}`);
  }

  async approveProduct(productId: string) {
    return this.request(`/admin/products/${productId}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ approved: true }),
    });
  }

  async rejectProduct(productId: string, reason?: string) {
    return this.request(`/admin/products/${productId}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ approved: false, reason }),
    });
  }

  async getAllOrders(params?: { status?: string; page?: number; limit?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/admin/orders${queryString}`);
  }

  async getSystemStats() {
    return this.request('/analytics/admin/stats');
  }

  // Feedback management
  async getAllFeedback(params?: { status?: string; type?: string; page?: number; limit?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/admin/feedback${queryString}`);
  }

  async getFeedbackStats() {
    return this.request('/admin/feedback/stats');
  }

  async updateFeedbackStatus(feedbackId: string, status: string, response?: string) {
    return this.request(`/admin/feedback/${feedbackId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_response: response }),
    });
  }

  async respondToFeedback(feedbackId: string, response: string) {
    return this.request(`/admin/feedback/${feedbackId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  // Password reset endpoints
  async requestPasswordReset(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // Products management
  async getProducts(params?: { page?: number; limit?: number; category?: string; search?: string }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/products${queryString}`);
  }

  async getTopCategories() {
    return this.request('/products/categories/top');
  }

  async getSellerDetails(sellerId: string) {
    return this.request(`/products/sellers/${sellerId}`);
  }

  async getSellerProducts(sellerId: string, page: number = 1, limit: number = 20) {
    return this.request(`/products/sellers/${sellerId}/products?page=${page}&limit=${limit}`);
  }

  // Logistics endpoints
  async getShipments(params?: { status?: string; trackingNumber?: string; orderId?: string; courierPartner?: string; page?: number; limit?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/admin/shipments${queryString}`);
  }

  async getShipmentById(shipmentId: string) {
    return this.request(`/admin/shipments/${shipmentId}`);
  }

  async updateShipmentStatus(shipmentId: string, status: string, remarks?: string) {
    return this.request(`/admin/shipments/${shipmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks }),
    });
  }

  async updateCourierPartner(shipmentId: string, courierPartnerId: string, trackingNumber: string) {
    return this.request(`/admin/shipments/${shipmentId}/courier`, {
      method: 'PATCH',
      body: JSON.stringify({ courierPartnerId, trackingNumber }),
    });
  }

  async updateTrackingNumber(shipmentId: string, trackingNumber: string) {
    return this.request(`/admin/shipments/${shipmentId}/tracking`, {
      method: 'PATCH',
      body: JSON.stringify({ trackingNumber }),
    });
  }

  async getDeliveryPartners(params?: { page?: number; limit?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/admin/delivery-partners${queryString}`);
  }

  async getShipmentTimeline(shipmentId: string) {
    return this.request(`/admin/shipments/${shipmentId}/timeline`);
  }

  async getShipmentsStats() {
    return this.request('/admin/shipments/stats');
  }
}

export const adminApiService = new AdminApiService();
export default adminApiService;