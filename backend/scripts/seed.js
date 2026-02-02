import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting comprehensive database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminResult = await client.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, is_active)
      VALUES ('admin@amzify.com', $1, 'admin', 'Super', 'Admin', '+91-9876543210', true, true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [adminPassword]);

    let adminId;
    if (adminResult.rows.length > 0) {
      adminId = adminResult.rows[0].id;
      console.log('✅ Admin user created');
    } else {
      const existingAdmin = await client.query('SELECT id FROM users WHERE email = $1', ['admin@amzify.com']);
      adminId = existingAdmin.rows[0]?.id;
    }

    // Create multiple sellers
    const sellers = [
      {
        email: 'seller@example.com',
        firstName: 'John',
        lastName: 'Seller',
        phone: '+91-9876543211',
        companyName: 'Acme Electronics Inc',
        businessType: 'Electronics',
        description: 'Premium electronics and gadgets retailer with 10+ years experience'
      },
      {
        email: 'fashionseller@example.com',
        firstName: 'Sarah',
        lastName: 'Fashion',
        phone: '+91-9876543212',
        companyName: 'StyleHub Fashion',
        businessType: 'Fashion & Apparel',
        description: 'Trendy fashion and lifestyle products for modern consumers'
      },
      {
        email: 'homeseller@example.com',
        firstName: 'Mike',
        lastName: 'Home',
        phone: '+91-9876543213',
        companyName: 'HomeComfort Solutions',
        businessType: 'Home & Garden',
        description: 'Quality home improvement and garden supplies'
      }
    ];

    const sellerIds = {};
    for (const seller of sellers) {
      const sellerPassword = await bcrypt.hash('seller123', 12);
      const sellerResult = await client.query(`
        INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, is_active)
        VALUES ($1, $2, 'seller', $3, $4, $5, true, true)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, [seller.email, sellerPassword, seller.firstName, seller.lastName, seller.phone]);

      let sellerId;
      if (sellerResult.rows.length > 0) {
        sellerId = sellerResult.rows[0].id;
        
        // Create seller profile
        await client.query(`
          INSERT INTO seller_profiles (user_id, company_name, business_type, description, is_approved, commission_rate)
          VALUES ($1, $2, $3, $4, true, 0.15)
          ON CONFLICT (user_id) DO NOTHING
        `, [sellerId, seller.companyName, seller.businessType, seller.description]);
        
      } else {
        const existingSeller = await client.query('SELECT id FROM users WHERE email = $1', [seller.email]);
        sellerId = existingSeller.rows[0]?.id;
      }
      
      sellerIds[seller.email] = sellerId;
    }
    console.log('✅ Multiple sellers created');

    // Create multiple customers
    const customers = [
      {
        email: 'customer@example.com',
        firstName: 'Jane',
        lastName: 'Customer',
        phone: '+91-9876543214'
      },
      {
        email: 'customer2@example.com',
        firstName: 'David',
        lastName: 'Smith',
        phone: '+91-9876543215'
      },
      {
        email: 'customer3@example.com',
        firstName: 'Emily',
        lastName: 'Johnson',
        phone: '+91-9876543216'
      }
    ];

    const customerIds = {};
    for (const customer of customers) {
      const customerPassword = await bcrypt.hash('customer123', 12);
      const customerResult = await client.query(`
        INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, is_active)
        VALUES ($1, $2, 'customer', $3, $4, $5, true, true)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, [customer.email, customerPassword, customer.firstName, customer.lastName, customer.phone]);

      if (customerResult.rows.length > 0) {
        customerIds[customer.email] = customerResult.rows[0].id;
      } else {
        const existingCustomer = await client.query('SELECT id FROM users WHERE email = $1', [customer.email]);
        customerIds[customer.email] = existingCustomer.rows[0]?.id;
      }
    }
    console.log('✅ Multiple customers created');

    // Create comprehensive categories
    const categories = [
      { name: 'Electronics', slug: 'electronics', description: 'Electronic devices, gadgets, and accessories' },
      { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, and fashion accessories' },
      { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement, furniture, and garden supplies' },
      { name: 'Books', slug: 'books', description: 'Books, e-books, and educational materials' },
      { name: 'Sports & Fitness', slug: 'sports', description: 'Sports equipment and fitness accessories' },
      { name: 'Beauty & Health', slug: 'beauty-health', description: 'Beauty products and health supplements' },
      { name: 'Automotive', slug: 'automotive', description: 'Car accessories and automotive parts' },
      { name: 'Toys & Games', slug: 'toys-games', description: 'Toys, games, and entertainment products' }
    ];

    const categoryIds = {};
    for (const category of categories) {
      const result = await client.query(`
        INSERT INTO categories (name, slug, description, is_active)
        VALUES ($1, $2, $3, true)
        ON CONFLICT (slug) DO UPDATE SET name = $1, description = $3
        RETURNING id
      `, [category.name, category.slug, category.description]);
      
      categoryIds[category.slug] = result.rows[0].id;
    }
    console.log('✅ Comprehensive categories created');

    // Create extensive product catalog
    const products = [
      // Electronics
      {
        name: 'Wireless Bluetooth Headphones Pro',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life, premium sound quality, and comfortable over-ear design. Features active noise cancellation, quick charge, and premium materials.',
        short_description: 'Premium wireless headphones with noise cancellation',
        price: 2999.00,
        compare_price: 3999.00,
        category: 'electronics',
        stock_quantity: 50,
        sku: 'WBH-001',
        seller: 'seller@example.com',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'
        ],
        is_featured: true
      },
      {
        name: 'Smart Fitness Watch Ultra',
        description: 'Advanced fitness tracking with heart rate monitor, GPS, sleep tracking, and 7-day battery life. Water resistant up to 50m with multiple sport modes.',
        short_description: 'Smart watch with fitness tracking and GPS',
        price: 4999.00,
        compare_price: 6999.00,
        category: 'electronics',
        stock_quantity: 30,
        sku: 'SFW-002',
        seller: 'seller@example.com',
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
          'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500'
        ],
        is_featured: true
      },
      {
        name: 'Smartphone 128GB',
        description: 'Latest smartphone with 128GB storage, triple camera system, 5G connectivity, and all-day battery life.',
        short_description: 'Latest smartphone with 128GB storage and 5G',
        price: 24999.00,
        compare_price: 29999.00,
        category: 'electronics',
        stock_quantity: 25,
        sku: 'SP-003',
        seller: 'seller@example.com',
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
        ],
        is_featured: true
      },
      {
        name: 'Wireless Charging Pad',
        description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.',
        short_description: 'Fast wireless charging pad with LED indicator',
        price: 1299.00,
        category: 'electronics',
        stock_quantity: 75,
        sku: 'WCP-004',
        seller: 'seller@example.com',
        images: [
          'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500'
        ]
      },
      
      // Fashion
      {
        name: 'Organic Cotton T-Shirt Premium',
        description: 'Comfortable organic cotton t-shirt available in multiple colors and sizes. Soft, breathable, and eco-friendly material.',
        short_description: 'Comfortable organic cotton t-shirt',
        price: 799.00,
        compare_price: 1299.00,
        category: 'fashion',
        stock_quantity: 100,
        sku: 'OCT-005',
        seller: 'fashionseller@example.com',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500'
        ]
      },
      {
        name: 'Designer Jeans',
        description: 'Premium designer jeans with perfect fit and comfort. Made from high-quality denim with modern styling.',
        short_description: 'Premium designer jeans with perfect fit',
        price: 2499.00,
        compare_price: 3499.00,
        category: 'fashion',
        stock_quantity: 60,
        sku: 'DJ-006',
        seller: 'fashionseller@example.com',
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'
        ]
      },
      {
        name: 'Leather Handbag',
        description: 'Elegant leather handbag with multiple compartments. Perfect for daily use with premium leather construction.',
        short_description: 'Elegant leather handbag with multiple compartments',
        price: 3999.00,
        compare_price: 5999.00,
        category: 'fashion',
        stock_quantity: 35,
        sku: 'LHB-007',
        seller: 'fashionseller@example.com',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'
        ],
        is_featured: true
      },
      
      // Home & Garden
      {
        name: 'LED Desk Lamp Pro',
        description: 'Adjustable LED desk lamp with touch controls, USB charging port, and multiple brightness levels. Perfect for work and study.',
        short_description: 'Adjustable LED desk lamp with USB charging',
        price: 1499.00,
        category: 'home-garden',
        stock_quantity: 45,
        sku: 'LDL-008',
        seller: 'homeseller@example.com',
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed657f9971?w=500'
        ]
      },
      {
        name: 'Indoor Plant Set',
        description: 'Beautiful set of 3 indoor plants perfect for home decoration. Includes pots and care instructions.',
        short_description: 'Set of 3 indoor plants with pots',
        price: 1999.00,
        category: 'home-garden',
        stock_quantity: 20,
        sku: 'IPS-009',
        seller: 'homeseller@example.com',
        images: [
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500'
        ]
      },
      {
        name: 'Kitchen Knife Set',
        description: 'Professional kitchen knife set with 6 knives and wooden block. High-quality stainless steel blades.',
        short_description: 'Professional kitchen knife set with wooden block',
        price: 2799.00,
        compare_price: 3999.00,
        category: 'home-garden',
        stock_quantity: 30,
        sku: 'KKS-010',
        seller: 'homeseller@example.com',
        images: [
          'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500'
        ]
      },
      
      // Sports & Fitness
      {
        name: 'Yoga Mat Premium Plus',
        description: 'Non-slip premium yoga mat with carrying strap and alignment lines. Perfect for all yoga practices with extra cushioning.',
        short_description: 'Non-slip premium yoga mat with carrying strap',
        price: 1299.00,
        compare_price: 1799.00,
        category: 'sports',
        stock_quantity: 40,
        sku: 'YMP-011',
        seller: 'seller@example.com',
        images: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500'
        ]
      },
      {
        name: 'Resistance Bands Set',
        description: 'Complete resistance bands set with 5 different resistance levels, door anchor, and exercise guide.',
        short_description: 'Complete resistance bands set with 5 levels',
        price: 899.00,
        category: 'sports',
        stock_quantity: 55,
        sku: 'RBS-012',
        seller: 'seller@example.com',
        images: [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
        ]
      },
      
      // Beauty & Health
      {
        name: 'Skincare Set Premium',
        description: 'Complete skincare routine set with cleanser, toner, serum, and moisturizer. Suitable for all skin types.',
        short_description: 'Complete skincare routine set for all skin types',
        price: 2499.00,
        compare_price: 3499.00,
        category: 'beauty-health',
        stock_quantity: 25,
        sku: 'SSP-013',
        seller: 'fashionseller@example.com',
        images: [
          'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500'
        ]
      },
      
      // Books
      {
        name: 'Programming Fundamentals Book',
        description: 'Comprehensive guide to programming fundamentals covering multiple languages and best practices.',
        short_description: 'Comprehensive programming fundamentals guide',
        price: 599.00,
        category: 'books',
        stock_quantity: 80,
        sku: 'PFB-014',
        seller: 'seller@example.com',
        images: [
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500'
        ]
      }
    ];

    // Insert products
    for (const product of products) {
      const sellerId = sellerIds[product.seller];
      if (!sellerId) continue;

      const slug = product.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substr(2, 9);

      await client.query(`
        INSERT INTO products (
          seller_id, category_id, name, slug, description, short_description,
          price, compare_price, stock_quantity, sku, images, is_featured, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')
        ON CONFLICT (sku) DO NOTHING
      `, [
        sellerId,
        categoryIds[product.category],
        product.name,
        slug,
        product.description,
        product.short_description,
        product.price,
        product.compare_price || null,
        product.stock_quantity,
        product.sku,
        JSON.stringify(product.images),
        product.is_featured || false
      ]);
    }
    console.log('✅ Extensive product catalog created');

    // Create sample orders with logistics tracking
    const sampleOrders = [
      {
        customerId: customerIds['customer@example.com'],
        status: 'delivered',
        trackingNumber: 'AMZ123456789',
        shippingAddress: {
          street_address: '123 Main Street, Apt 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          postal_code: '400001',
          country: 'India'
        }
      },
      {
        customerId: customerIds['customer2@example.com'],
        status: 'shipped',
        trackingNumber: 'AMZ987654321',
        shippingAddress: {
          street_address: '456 Oak Avenue',
          city: 'Delhi',
          state: 'Delhi',
          postal_code: '110001',
          country: 'India'
        }
      },
      {
        customerId: customerIds['customer3@example.com'],
        status: 'processing',
        trackingNumber: 'AMZ456789123',
        shippingAddress: {
          street_address: '789 Pine Road',
          city: 'Bangalore',
          state: 'Karnataka',
          postal_code: '560001',
          country: 'India'
        }
      }
    ];

    for (const order of sampleOrders) {
      if (!order.customerId) continue;

      const orderNumber = `AMZ${Math.floor(Math.random() * 90000) + 10000}`;
      const totalAmount = Math.floor(Math.random() * 5000) + 1000;
      const orderResult = await client.query(`
        INSERT INTO orders (
          customer_id, order_number, status, subtotal, total_amount, shipping_address, 
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')
        RETURNING id
      `, [
        order.customerId,
        orderNumber,
        order.status,
        totalAmount,
        totalAmount,
        JSON.stringify(order.shippingAddress)
      ]);

      // Add logistics tracking entries
      const orderId = orderResult.rows[0].id;
      const trackingStatuses = [
        { status: 'order_placed', description: 'Order has been placed successfully' },
        { status: 'confirmed', description: 'Order confirmed and being prepared' },
        { status: 'shipped', description: 'Order has been shipped' }
      ];

      if (order.status === 'delivered') {
        trackingStatuses.push({ status: 'delivered', description: 'Order delivered successfully' });
      }

      // Create shipment for the order
      const trackingNumber = `TRK${Math.floor(Math.random() * 900000) + 100000}`;
      const shipmentResult = await client.query(`
        INSERT INTO shipments (
          order_id, tracking_number, carrier, status, shipping_address, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')
        RETURNING id
      `, [orderId, trackingNumber, 'BlueDart', order.status === 'delivered' ? 'delivered' : 'in_transit', JSON.stringify(order.shippingAddress)]);

      const shipmentId = shipmentResult.rows[0].id;

      for (let i = 0; i < trackingStatuses.length; i++) {
        const tracking = trackingStatuses[i];
        await client.query(`
          INSERT INTO tracking_events (
            shipment_id, status, description, timestamp
          ) VALUES ($1, $2, $3, NOW() - INTERVAL '${30 - (i * 2)} days')
        `, [shipmentId, tracking.status, tracking.description]);
      }
    }
    console.log('✅ Sample orders with logistics tracking created');

    console.log('🎉 Comprehensive database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run seeding
seedData()
  .then(() => {
    console.log('✨ Seeding process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });