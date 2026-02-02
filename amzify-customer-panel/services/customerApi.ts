const API_BASE_URL = 'http://localhost:5000/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  phone?: string;
}

class CustomerApiService {
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

  async register(userData: RegisterData) {
    const data = await this.request('/auth/register/customer', {
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

  // Products endpoints
  async getProducts(params?: { category?: string; search?: string; page?: number; limit?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/products${queryString}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  // Cart endpoints
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId: string, quantity: number, variantId?: string) {
    return this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity, variant_id: variantId }),
    });
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Orders endpoints
  async getOrders() {
    return this.request('/orders');
  }

  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }
}

export const customerApiService = new CustomerApiService();
export default customerApiService;