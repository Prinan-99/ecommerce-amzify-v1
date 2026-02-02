import pool from '../config/database.js';

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migration...');

    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Users table (customers, sellers, admins)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'seller', 'admin')),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seller profiles
    await client.query(`
      CREATE TABLE IF NOT EXISTS seller_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        company_name VARCHAR(255) NOT NULL,
        business_type VARCHAR(100),
        tax_id VARCHAR(50),
        description TEXT,
        website VARCHAR(255),
        business_address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        gst_number VARCHAR(50),
        pan_number VARCHAR(50),
        bank_name VARCHAR(255),
        account_number VARCHAR(50),
        ifsc_code VARCHAR(20),
        account_holder_name VARCHAR(255),
        commission_rate DECIMAL(5,4) DEFAULT 0.15,
        is_approved BOOLEAN DEFAULT false,
        approval_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Addresses
    await client.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing')),
        street_address VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) DEFAULT 'India',
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        parent_id UUID REFERENCES categories(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        short_description TEXT,
        price DECIMAL(10,2) NOT NULL,
        compare_price DECIMAL(10,2),
        cost_price DECIMAL(10,2),
        sku VARCHAR(100) UNIQUE,
        stock_quantity INTEGER DEFAULT 0,
        min_stock_level INTEGER DEFAULT 5,
        weight DECIMAL(8,2),
        dimensions JSONB,
        images JSONB DEFAULT '[]',
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'pending_approval')),
        is_featured BOOLEAN DEFAULT false,
        seo_title VARCHAR(255),
        seo_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Product variants (for size, color, etc.)
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        value VARCHAR(100) NOT NULL,
        price_adjustment DECIMAL(10,2) DEFAULT 0,
        stock_quantity INTEGER DEFAULT 0,
        sku VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Shopping cart
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id, variant_id)
      )
    `);

    // Wishlist
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);

    // Orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        shipping_amount DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
        payment_method VARCHAR(50),
        shipping_address JSONB NOT NULL,
        billing_address JSONB,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        variant_id UUID REFERENCES product_variants(id),
        seller_id UUID REFERENCES users(id),
        product_name VARCHAR(255) NOT NULL,
        product_sku VARCHAR(100),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Marketing campaigns
    await client.query(`
      CREATE TABLE IF NOT EXISTS marketing_campaigns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'social', 'sms')),
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
        subject VARCHAR(255),
        content TEXT,
        target_audience JSONB,
        scheduled_at TIMESTAMP,
        sent_at TIMESTAMP,
        metrics JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Support tickets
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        category VARCHAR(100),
        assigned_to UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ticket messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Refresh tokens
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Shipments table for logistics
    await client.query(`
      CREATE TABLE IF NOT EXISTS shipments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        tracking_number VARCHAR(100) UNIQUE NOT NULL,
        carrier VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned')),
        estimated_delivery TIMESTAMP,
        actual_delivery TIMESTAMP,
        shipping_address JSONB NOT NULL,
        weight DECIMAL(8,2),
        dimensions JSONB,
        cost DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tracking events for shipments
    await client.query(`
      CREATE TABLE IF NOT EXISTS tracking_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id)');

    console.log('✅ Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migration
createTables()
  .then(() => {
    console.log('🎉 All tables created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });