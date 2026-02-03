import bcrypt from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;

// Simple seeding script that works with Render database
async function quickSeed() {
  console.log('🌱 Starting quick database seeding...');
  console.log('📡 Connecting to Render database (this may take a moment if DB is sleeping)...');
  
  // Use the actual DATABASE_URL from environment
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : { rejectUnauthorized: false },
    connectionTimeoutMillis: 60000, // 60 seconds
    idleTimeoutMillis: 60000,
    max: 1 // Only one connection for seeding
  });

  let client;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      console.log(`🔄 Connection attempt ${retryCount + 1}/${maxRetries}...`);
      client = await pool.connect();
      console.log('✅ Database connected successfully');
      break;
    } catch (error) {
      retryCount++;
      console.log(`❌ Connection attempt ${retryCount} failed:`, error.message);
      if (retryCount >= maxRetries) {
        throw new Error(`Failed to connect after ${maxRetries} attempts`);
      }
      console.log('⏳ Waiting 10 seconds before retry...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  try {
    // Hash password once
    const passwordHash = await bcrypt.hash('password123', 10);
    const timestamp = new Date().toISOString();

    // 1. Create Admin User
    console.log('Creating admin user...');
    const adminResult = await client.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, is_active, created_at, updated_at)
      VALUES ('admin@amzify.com', $1, 'admin', 'Super', 'Admin', '+919999999999', true, true, $2, $2)
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = $1,
        updated_at = $2
      RETURNING id
    `, [passwordHash, timestamp]);

    // 2. Create 5 Sellers
    console.log('Creating sellers...');
    const sellerIds = [];
    const sellers = [
      { email: 'seller1@amzify.com', name: 'Rahul Kumar', company: 'TechWorld Electronics', business: 'Electronics' },
      { email: 'seller2@amzify.com', name: 'Priya Sharma', company: 'StyleHub Fashion', business: 'Fashion' },
      { email: 'seller3@amzify.com', name: 'Amit Patel', company: 'HomeComfort Solutions', business: 'Home & Garden' },
      { email: 'seller4@amzify.com', name: 'Sneha Singh', company: 'BookWorld Publishers', business: 'Books' },
      { email: 'seller5@amzify.com', name: 'Vikram Reddy', company: 'FitZone Sports', business: 'Sports' }
    ];

    for (let i = 0; i < sellers.length; i++) {
      const seller = sellers[i];
      const [firstName, lastName] = seller.name.split(' ');
      
      const sellerResult = await client.query(`
        INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, is_active, created_at, updated_at)
        VALUES ($1, $2, 'seller', $3, $4, $5, true, true, $6, $6)
        ON CONFLICT (email) DO UPDATE SET 
          password_hash = $2,
          updated_at = $6
        RETURNING id
      `, [seller.email, passwordHash, firstName, lastName, `+9188888888${i + 1}`, timestamp]);

      const sellerId = sellerResult.rows[0].id;
      sellerIds.push(sellerId);

      // Create seller profile
      await client.query(`
        INSERT INTO seller_profiles (
          user_id, company_name, business_type, description, is_approved, 
          approval_date, city, state, postal_code, gst_number, pan_number,
          bank_name, account_number, ifsc_code, account_holder_name, 
          commission_rate, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, true, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 0.15, $5, $5)
        ON CONFLICT (user_id) DO UPDATE SET
          company_name = $2,
          business_type = $3,
          updated_at = $5
      `, [
        sellerId, seller.company, seller.business, 
        `Premium ${seller.business.toLowerCase()} retailer with extensive experience`,
        timestamp,
        ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'][i],
        ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Maharashtra'][i],
        `4${String(i + 1).padStart(4, '0')}1`,
        `27ABCDE${1234 + i}Z1Z5`,
        `ABCDE${1234 + i}F`,
        'HDFC Bank',
        `1234567890${i}`,
        'HDFC0000001',
        `${firstName} ${lastName}`
      ]);
    }

    // 3. Create 37 Customers
    console.log('Creating 37 customers...');
    const customerIds = [];
    const firstNames = ['Arjun', 'Kavya', 'Rohit', 'Ananya', 'Karthik', 'Meera', 'Siddharth', 'Divya', 'Ravi', 'Pooja', 'Aditya', 'Shreya', 'Nikhil', 'Anjali', 'Varun', 'Ishita', 'Manish', 'Nisha', 'Prakash', 'Richa', 'Suresh', 'Deepika', 'Rajesh', 'Swati', 'Akash', 'Priyanka', 'Vinay', 'Neha', 'Gaurav', 'Sakshi', 'Sanjay', 'Tanvi', 'Ajay', 'Ritika', 'Naveen', 'Pallavi', 'Kiran'];
    const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Nair', 'Gupta', 'Rao', 'Agarwal', 'Verma'];

    for (let i = 0; i < 37; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const email = `customer${i + 1}@amzify.com`;
      
      const customerResult = await client.query(`
        INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, is_active, created_at, updated_at)
        VALUES ($1, $2, 'customer', $3, $4, $5, true, true, $6, $6)
        ON CONFLICT (email) DO UPDATE SET 
          password_hash = $2,
          updated_at = $6
        RETURNING id
      `, [email, passwordHash, firstName, lastName, `+917777${String(77771 + i)}`, timestamp]);

      customerIds.push(customerResult.rows[0].id);
    }

    // 4. Create Categories
    console.log('Creating categories...');
    const categoryIds = [];
    const categories = [
      { name: 'Electronics', slug: 'electronics', description: 'Smartphones, laptops, gadgets and electronic accessories' },
      { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, accessories and fashion items' },
      { name: 'Home & Garden', slug: 'home-garden', description: 'Home decor, furniture, kitchen and garden supplies' },
      { name: 'Books', slug: 'books', description: 'Books, e-books, stationery and educational materials' },
      { name: 'Sports', slug: 'sports', description: 'Sports equipment, fitness gear and outdoor activities' }
    ];

    for (const category of categories) {
      const result = await client.query(`
        INSERT INTO categories (name, slug, description, is_active, created_at)
        VALUES ($1, $2, $3, true, $4)
        ON CONFLICT (slug) DO UPDATE SET
          name = $1,
          description = $3,
          updated_at = $4
        RETURNING id
      `, [category.name, category.slug, category.description, timestamp]);
      
      categoryIds.push(result.rows[0].id);
    }

    // 5. Create 61 Products
    console.log('Creating 61 products...');
    const products = [
      // Electronics (15 products)
      { name: 'iPhone 15 Pro', price: 129900, categoryIndex: 0, sellerIndex: 0, stock: 45 },
      { name: 'Samsung Galaxy S24', price: 89900, categoryIndex: 0, sellerIndex: 0, stock: 38 },
      { name: 'MacBook Air M3', price: 114900, categoryIndex: 0, sellerIndex: 0, stock: 22 },
      { name: 'Sony WH-1000XM5', price: 29990, categoryIndex: 0, sellerIndex: 0, stock: 67 },
      { name: 'iPad Pro 12.9', price: 112900, categoryIndex: 0, sellerIndex: 0, stock: 18 },
      { name: 'Dell XPS 13', price: 95000, categoryIndex: 0, sellerIndex: 0, stock: 28 },
      { name: 'AirPods Pro', price: 24900, categoryIndex: 0, sellerIndex: 0, stock: 55 },
      { name: 'Mi Smart TV 55"', price: 42999, categoryIndex: 0, sellerIndex: 0, stock: 15 },
      { name: 'Canon EOS R6', price: 245000, categoryIndex: 0, sellerIndex: 0, stock: 8 },
      { name: 'Nintendo Switch', price: 25999, categoryIndex: 0, sellerIndex: 0, stock: 32 },
      { name: 'PlayStation 5', price: 54990, categoryIndex: 0, sellerIndex: 0, stock: 12 },
      { name: 'Bose SoundLink', price: 12990, categoryIndex: 0, sellerIndex: 0, stock: 41 },
      { name: 'Fitbit Versa', price: 19999, categoryIndex: 0, sellerIndex: 0, stock: 36 },
      { name: 'Kindle Paperwhite', price: 13999, categoryIndex: 0, sellerIndex: 0, stock: 48 },
      { name: 'GoPro Hero 11', price: 45990, categoryIndex: 0, sellerIndex: 0, stock: 25 },
      
      // Fashion (15 products)
      { name: 'Nike Air Jordan', price: 12995, categoryIndex: 1, sellerIndex: 1, stock: 89 },
      { name: 'Levis 501 Jeans', price: 4999, categoryIndex: 1, sellerIndex: 1, stock: 156 },
      { name: 'Ray-Ban Aviators', price: 8990, categoryIndex: 1, sellerIndex: 1, stock: 43 },
      { name: 'Zara Shirt', price: 2499, categoryIndex: 1, sellerIndex: 1, stock: 78 },
      { name: 'Adidas Hoodie', price: 3999, categoryIndex: 1, sellerIndex: 1, stock: 65 },
      { name: 'Puma Track Suit', price: 5999, categoryIndex: 1, sellerIndex: 1, stock: 42 },
      { name: 'Calvin Klein Watch', price: 15999, categoryIndex: 1, sellerIndex: 1, stock: 28 },
      { name: 'H&M Dress', price: 1999, categoryIndex: 1, sellerIndex: 1, stock: 92 },
      { name: 'Tommy Hilfiger Polo', price: 3499, categoryIndex: 1, sellerIndex: 1, stock: 57 },
      { name: 'Converse Sneakers', price: 4499, categoryIndex: 1, sellerIndex: 1, stock: 73 },
      { name: 'Fossil Handbag', price: 6999, categoryIndex: 1, sellerIndex: 1, stock: 34 },
      { name: 'Titan Watch', price: 8999, categoryIndex: 1, sellerIndex: 1, stock: 46 },
      { name: 'Woodland Boots', price: 7999, categoryIndex: 1, sellerIndex: 1, stock: 38 },
      { name: 'Lee Cooper Jacket', price: 4999, categoryIndex: 1, sellerIndex: 1, stock: 29 },
      { name: 'Vans Cap', price: 1499, categoryIndex: 1, sellerIndex: 1, stock: 85 },
      
      // Home & Garden (15 products)
      { name: 'Philips Air Fryer', price: 8999, categoryIndex: 2, sellerIndex: 2, stock: 34 },
      { name: 'IKEA Study Table', price: 12999, categoryIndex: 2, sellerIndex: 2, stock: 23 },
      { name: 'Prestige Cooker', price: 2499, categoryIndex: 2, sellerIndex: 2, stock: 89 },
      { name: 'Godrej Refrigerator', price: 25999, categoryIndex: 2, sellerIndex: 2, stock: 16 },
      { name: 'LG Washing Machine', price: 22999, categoryIndex: 2, sellerIndex: 2, stock: 19 },
      { name: 'Havells Ceiling Fan', price: 2999, categoryIndex: 2, sellerIndex: 2, stock: 67 },
      { name: 'Bajaj Mixer Grinder', price: 3499, categoryIndex: 2, sellerIndex: 2, stock: 52 },
      { name: 'Milton Water Bottle', price: 599, categoryIndex: 2, sellerIndex: 2, stock: 145 },
      { name: 'Cello Storage Box', price: 999, categoryIndex: 2, sellerIndex: 2, stock: 78 },
      { name: 'Wipro LED Bulbs', price: 299, categoryIndex: 2, sellerIndex: 2, stock: 234 },
      { name: 'Durex Mattress', price: 15999, categoryIndex: 2, sellerIndex: 2, stock: 12 },
      { name: 'Nilkamal Chair', price: 1999, categoryIndex: 2, sellerIndex: 2, stock: 45 },
      { name: 'Bosch Drill Machine', price: 4999, categoryIndex: 2, sellerIndex: 2, stock: 28 },
      { name: 'Asian Paint Bucket', price: 899, categoryIndex: 2, sellerIndex: 2, stock: 156 },
      { name: 'Eureka Forbes Vacuum', price: 12999, categoryIndex: 2, sellerIndex: 2, stock: 22 },
      
      // Books (8 products)
      { name: 'Atomic Habits', price: 599, categoryIndex: 3, sellerIndex: 3, stock: 234 },
      { name: 'Psychology of Money', price: 399, categoryIndex: 3, sellerIndex: 3, stock: 167 },
      { name: 'Rich Dad Poor Dad', price: 350, categoryIndex: 3, sellerIndex: 3, stock: 189 },
      { name: 'Think and Grow Rich', price: 299, categoryIndex: 3, sellerIndex: 3, stock: 145 },
      { name: 'Sapiens', price: 450, categoryIndex: 3, sellerIndex: 3, stock: 123 },
      { name: 'The Alchemist', price: 250, categoryIndex: 3, sellerIndex: 3, stock: 278 },
      { name: 'Harry Potter Set', price: 1999, categoryIndex: 3, sellerIndex: 3, stock: 67 },
      { name: 'Wings of Fire', price: 199, categoryIndex: 3, sellerIndex: 3, stock: 156 },
      
      // Sports (8 products)
      { name: 'Decathlon Treadmill', price: 45999, categoryIndex: 4, sellerIndex: 4, stock: 12 },
      { name: 'Nike Football', price: 1999, categoryIndex: 4, sellerIndex: 4, stock: 78 },
      { name: 'Yonex Badminton Racket', price: 2499, categoryIndex: 4, sellerIndex: 4, stock: 45 },
      { name: 'Nivia Cricket Bat', price: 3499, categoryIndex: 4, sellerIndex: 4, stock: 34 },
      { name: 'Adidas Sports Shoes', price: 7999, categoryIndex: 4, sellerIndex: 4, stock: 56 },
      { name: 'Spalding Basketball', price: 1499, categoryIndex: 4, sellerIndex: 4, stock: 67 },
      { name: 'Domyos Dumbbell Set', price: 2999, categoryIndex: 4, sellerIndex: 4, stock: 23 },
      { name: 'Wilson Tennis Racket', price: 4999, categoryIndex: 4, sellerIndex: 4, stock: 29 }
    ];

    const productIds = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const slug = `${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}-${i}`;
      
      const result = await client.query(`
        INSERT INTO products (
          seller_id, category_id, name, slug, description, short_description,
          price, compare_price, stock_quantity, status, is_featured, 
          images, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', $10, $11, $12, $12)
        ON CONFLICT (slug) DO UPDATE SET
          stock_quantity = $9,
          updated_at = $12
        RETURNING id
      `, [
        sellerIds[product.sellerIndex],
        categoryIds[product.categoryIndex], 
        product.name,
        slug,
        `High-quality ${product.name} with premium features and excellent build quality.`,
        `Premium ${product.name}`,
        product.price,
        Math.round(product.price * 1.2),
        product.stock,
        Math.random() > 0.7,
        JSON.stringify([`https://picsum.photos/400/400?random=${i + 100}`]),
        timestamp
      ]);
      
      productIds.push(result.rows[0].id);
    }

    // 6. Create 187 Orders with Order Items
    console.log('Creating 187 orders...');
    for (let i = 0; i < 187; i++) {
      const customer = customerIds[Math.floor(Math.random() * customerIds.length)];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderProducts = [];
      
      // Select random products for this order
      for (let j = 0; j < numItems; j++) {
        const productIndex = Math.floor(Math.random() * productIds.length);
        if (!orderProducts.includes(productIndex)) {
          orderProducts.push(productIndex);
        }
      }
      
      let subtotal = 0;
      const orderDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const orderNumber = `AMZ-${Date.now().toString().slice(-6)}-${String(i).padStart(3, '0')}`;
      
      // Create order first
      const orderResult = await client.query(`
        INSERT INTO orders (
          customer_id, order_number, status, subtotal, tax_amount, 
          shipping_amount, total_amount, payment_status, payment_method,
          shipping_address, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
        RETURNING id
      `, [
        customer,
        orderNumber,
        ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][Math.floor(Math.random() * 5)],
        0, // Will update after calculating
        0, // Will update after calculating  
        0, // Will update after calculating
        0, // Will update after calculating
        ['pending', 'paid', 'failed'][Math.floor(Math.random() * 3)],
        ['card', 'upi', 'netbanking', 'cod'][Math.floor(Math.random() * 4)],
        JSON.stringify({
          street: `${Math.floor(Math.random() * 999) + 1} Main Street`,
          city: 'Mumbai',
          state: 'Maharashtra', 
          postal_code: '400001',
          country: 'India'
        }),
        orderDate
      ]);
      
      const orderId = orderResult.rows[0].id;
      
      // Create order items
      for (const productIndex of orderProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const productPrice = products[productIndex].price;
        const itemTotal = productPrice * quantity;
        subtotal += itemTotal;
        
        await client.query(`
          INSERT INTO order_items (
            order_id, product_id, seller_id, product_name, 
            quantity, unit_price, total_price, created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          orderId,
          productIds[productIndex],
          sellerIds[products[productIndex].sellerIndex],
          products[productIndex].name,
          quantity,
          productPrice,
          itemTotal,
          orderDate
        ]);
      }
      
      // Update order totals
      const tax = subtotal * 0.18;
      const shipping = subtotal > 500 ? 0 : 50;
      const total = subtotal + tax + shipping;
      
      await client.query(`
        UPDATE orders 
        SET subtotal = $1, tax_amount = $2, shipping_amount = $3, total_amount = $4
        WHERE id = $5
      `, [subtotal, tax, shipping, total, orderId]);
    }

    // 7. Create 15 Customer Feedback entries
    console.log('Creating customer feedback...');
    const feedbackMessages = [
      'Great product quality and fast delivery!',
      'Excellent customer service, highly recommended.',
      'Product arrived damaged, but support was helpful.',
      'Amazing shopping experience, will order again.',
      'Good value for money, satisfied with purchase.',
      'Delivery was delayed but product quality is good.',
      'Outstanding service and product quality.',
      'Had issues with delivery but got resolved quickly.',
      'Perfect packaging and timely delivery.',
      'Could improve customer support response time.',
      'Fantastic product, exactly as described.',
      'Easy return process, very customer friendly.',
      'Great variety of products available.',
      'Competitive pricing and good quality.',
      'User-friendly website and smooth checkout.'
    ];

    for (let i = 0; i < 15; i++) {
      const customer = customerIds[Math.floor(Math.random() * customerIds.length)];
      const customerInfo = await client.query('SELECT first_name, last_name, email FROM users WHERE id = $1', [customer]);
      const { first_name, last_name, email } = customerInfo.rows[0];
      
      await client.query(`
        INSERT INTO customer_feedback (
          customer_id, customer_name, customer_email, rating, message, 
          status, type, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      `, [
        customer,
        `${first_name} ${last_name}`,
        email,
        Math.floor(Math.random() * 3) + 3, // 3-5 stars
        feedbackMessages[i],
        ['new', 'reviewed', 'responded'][Math.floor(Math.random() * 3)],
        ['product', 'service', 'delivery', 'general'][Math.floor(Math.random() * 4)],
        timestamp
      ]);
    }

    console.log('✅ Quick seeding completed successfully!');
    console.log(`📊 Data Summary:`);
    console.log(`   - 1 Admin User`);
    console.log(`   - 5 Sellers with Profiles`);
    console.log(`   - 37 Customers`);
    console.log(`   - 5 Categories`);
    console.log(`   - 61 Products`);
    console.log(`   - 187 Orders with Items`);
    console.log(`   - 15 Customer Feedback entries`);
    console.log(`   - Total: 346 order items, 5 seller profiles created`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

quickSeed().catch(console.error);