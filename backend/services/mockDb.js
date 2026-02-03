/**
 * Mock Database Service
 * Provides in-memory data storage for development when PostgreSQL is unavailable
 */

class MockDatabase {
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.cart_items = new Map();
    this.orders = new Map();
    this.sellers = new Map();
    this.password_reset_tokens = new Map();
    this.otp_storage = new Map();
    
    // Initialize with sample data
    this.initSampleData();
  }

  initSampleData() {
    // Sample user
    this.users.set('sample-user-1', {
      id: 'sample-user-1',
      email: 'customer@test.com',
      password: '$2b$10$x.HsvGXEph0iB4KzCjL5K.ZZplS0lWQYyC5w8D5lH5z9xJ5l9Z9Ey', // password123
      name: 'Test Customer',
      phone: '9876543210',
      role: 'customer',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Sample seller
    this.sellers.set('sample-seller-1', {
      id: 'sample-seller-1',
      user_id: 'sample-seller-user',
      store_name: 'Test Store',
      description: 'A test store',
      status: 'active',
      verified: true,
      created_at: new Date(),
    });

    // Sample category
    this.categories.set('electronics', {
      id: 'electronics',
      name: 'Electronics',
      description: 'Electronic devices',
      created_at: new Date(),
    });

    // Sample product
    this.products.set('prod-1', {
      id: 'prod-1',
      name: 'Sample Product',
      description: 'A sample product',
      price: 999.99,
      stock: 100,
      category_id: 'electronics',
      seller_id: 'sample-seller-1',
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // User operations
  async createUser(data) {
    const id = `user-${Date.now()}`;
    const user = { id, ...data, created_at: new Date(), updated_at: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async getUserById(id) {
    return this.users.get(id) || null;
  }

  async updateUser(id, data) {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...data, updated_at: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  // Password reset token operations
  async createPasswordResetToken(userId, token, expiresAt) {
    this.password_reset_tokens.set(token, {
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    });
    return token;
  }

  async getPasswordResetToken(token) {
    const record = this.password_reset_tokens.get(token);
    if (record && record.expiresAt > new Date()) {
      return record;
    }
    return null;
  }

  async deletePasswordResetToken(token) {
    this.password_reset_tokens.delete(token);
  }

  // Product operations
  async getProducts(limit = 10, offset = 0) {
    const products = Array.from(this.products.values());
    return products.slice(offset, offset + limit);
  }

  async getProductById(id) {
    return this.products.get(id) || null;
  }

  async createProduct(data) {
    const id = `prod-${Date.now()}`;
    const product = { id, ...data, created_at: new Date(), updated_at: new Date() };
    this.products.set(id, product);
    return product;
  }

  async countProducts() {
    return this.products.size;
  }

  // Category operations
  async getCategories() {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id) {
    return this.categories.get(id) || null;
  }

  // Cart operations
  async getCartItems(userId) {
    const items = [];
    for (const item of this.cart_items.values()) {
      if (item.user_id === userId) items.push(item);
    }
    return items;
  }

  async addToCart(userId, productId, quantity = 1) {
    const id = `cart-${Date.now()}`;
    const item = { id, user_id: userId, product_id: productId, quantity, created_at: new Date() };
    this.cart_items.set(id, item);
    return item;
  }

  async removeFromCart(cartItemId) {
    this.cart_items.delete(cartItemId);
  }

  // Order operations
  async createOrder(data) {
    const id = `order-${Date.now()}`;
    const order = { id, ...data, created_at: new Date(), updated_at: new Date() };
    this.orders.set(id, order);
    return order;
  }

  async getOrdersByUserId(userId) {
    const orders = [];
    for (const order of this.orders.values()) {
      if (order.user_id === userId) orders.push(order);
    }
    return orders;
  }

  // Seller operations
  async getSellers() {
    return Array.from(this.sellers.values());
  }

  async getSellerById(id) {
    return this.sellers.get(id) || null;
  }

  // OTP operations
  async storeOTP(email, otp, type = 'signup') {
    this.otp_storage.set(`${email}-${type}`, {
      email,
      otp,
      type,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
  }

  async verifyOTP(email, otp, type = 'signup') {
    const key = `${email}-${type}`;
    const record = this.otp_storage.get(key);
    if (!record) return false;
    if (record.expiresAt < new Date()) {
      this.otp_storage.delete(key);
      return false;
    }
    if (record.otp === otp) {
      this.otp_storage.delete(key);
      return true;
    }
    return false;
  }

  // Utility
  async disconnect() {
    console.log('Mock database disconnected');
  }

  async connect() {
    console.log('Mock database connected');
  }
}

export default new MockDatabase();
