import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;

console.log('🌱 Starting database population...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 60000
});

async function clearExistingData(client) {
  console.log('🧹 Clearing existing data...');
  
  try {
    // Delete in reverse order of dependencies
    await client.query('DELETE FROM customer_feedback');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM categories');
    await client.query('DELETE FROM seller_profiles');
    await client.query('DELETE FROM customers');
    await client.query('DELETE FROM users WHERE role != \'admin\' OR email != \'admin@amzify.com\'');
    
    console.log('✅ Existing data cleared!');
  } catch (error) {
    console.log('ℹ️ Some tables may not exist yet, continuing...');
  }
}

async function populateData() {
  let client;
  try {
    console.log('📡 Connecting to database...');
    client = await pool.connect();
    console.log('✅ Connected successfully!');

    // Clear existing data first
    await clearExistingData(client);

    const passwordHash = await bcrypt.hash('password123', 10);
    const now = new Date().toISOString();

    // Create admin
    console.log('Creating admin...');
    await client.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, is_active, created_at, updated_at)
      VALUES ('admin@amzify.com', $1, 'admin', 'Super', 'Admin', '+919999999999', true, true, $2, $2)
      ON CONFLICT (email) DO UPDATE SET updated_at = $2
    `, [passwordHash, now]);

    // Create sellers
    console.log('Creating sellers...');
    for (let i = 1; i <= 5; i++) {
      const email = `seller${i}@amzify.com`;
      const result = await client.query(`
        INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, is_active, created_at, updated_at)
        VALUES ($1, $2, 'seller', $3, $4, $5, true, true, $6, $6)
        ON CONFLICT (email) DO UPDATE SET updated_at = $6
        RETURNING id
      `, [email, passwordHash, `Seller${i}`, 'User', `+9188888888${i}`, now]);
      
      const sellerId = result.rows[0] ? result.rows[0].id : (await client.query('SELECT id FROM users WHERE email = $1', [email])).rows[0].id;
      
      // Create seller profile
      try {
        await client.query(`
          INSERT INTO seller_profiles (user_id, company_name, business_type, is_approved, created_at, updated_at)
          VALUES ($1, $2, $3, true, $4, $4)
        `, [sellerId, `Company ${i}`, 'Business', now]);
      } catch (err) {
        // Profile might already exist, skip
        console.log(`Seller profile ${i} already exists`);
      }
    }

    // Create customers
    console.log('Creating 37 customers...');
    for (let i = 1; i <= 37; i++) {
      const email = `customer${i}@amzify.com`;
      await client.query(`
        INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, is_active, created_at, updated_at)
        VALUES ($1, $2, 'customer', $3, $4, $5, true, true, $6, $6)
        ON CONFLICT (email) DO UPDATE SET updated_at = $6
      `, [email, passwordHash, `Customer${i}`, 'User', `+917777777${String(i).padStart(2, '0')}`, now]);
    }

    // Create categories
    console.log('Creating categories...');
    const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Books'];
    for (const cat of categories) {
      const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await client.query(`
        INSERT INTO categories (name, slug, description, is_active, created_at)
        VALUES ($1, $2, $3, true, $4)
        ON CONFLICT (slug) DO NOTHING
      `, [cat, slug, `${cat} category`, now]);
    }

    // Create products
    console.log('Creating 61 products...');
    const sellers = await client.query('SELECT id FROM users WHERE role = $1 LIMIT 5', ['seller']);
    const cats = await client.query('SELECT id FROM categories LIMIT 4');
    
    for (let i = 1; i <= 61; i++) {
      const sellerId = sellers.rows[i % 5].id;
      const categoryId = cats.rows[i % 4].id;
      const slug = `product-${i}-${Date.now()}`;
      
      await client.query(`
        INSERT INTO products (seller_id, category_id, name, slug, description, price, stock_quantity, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $8)
        ON CONFLICT (slug) DO NOTHING
      `, [sellerId, categoryId, `Product ${i}`, slug, `Description for product ${i}`, 1000 + (i * 100), 50 + i, now]);
    }

    // Create orders
    console.log('Creating 187 orders...');
    const customers = await client.query('SELECT id FROM users WHERE role = $1', ['customer']);
    const products = await client.query('SELECT id, seller_id, name, price FROM products LIMIT 61');
    
    for (let i = 1; i <= 187; i++) {
      const customerId = customers.rows[Math.floor(Math.random() * customers.rows.length)].id;
      const orderNumber = `AMZ-${String(100000 + i).padStart(6, '0')}`;
      
      const orderResult = await client.query(`
        INSERT INTO orders (customer_id, order_number, status, subtotal, total_amount, shipping_address, created_at, updated_at)
        VALUES ($1, $2, 'pending', 1000, 1000, $3, $4, $4)
        RETURNING id
      `, [customerId, orderNumber, JSON.stringify({street: '123 Street', city: 'City'}), now]);
      
      const orderId = orderResult.rows[0].id;
      
      // Add 1-3 order items
      const numItems = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numItems; j++) {
        const product = products.rows[Math.floor(Math.random() * products.rows.length)];
        await client.query(`
          INSERT INTO order_items (order_id, product_id, seller_id, product_name, quantity, unit_price, total_price, created_at)
          VALUES ($1, $2, $3, $4, 1, $5, $5, $6)
        `, [orderId, product.id, product.seller_id, product.name, product.price, now]);
      }
    }

    // Create feedback
    console.log('Creating feedback...');
    for (let i = 1; i <= 15; i++) {
      const customerId = customers.rows[i % customers.rows.length].id;
      await client.query(`
        INSERT INTO customer_feedback (customer_id, customer_name, customer_email, rating, message, status, created_at, updated_at)
        VALUES ($1, $2, $3, 5, $4, 'new', $5, $5)
      `, [customerId, `Customer ${i}`, `customer${i}@amzify.com`, `Great feedback ${i}`, now]);
    }

    console.log('✅ Database populated successfully!');
    console.log('📊 Summary: 1 admin, 5 sellers, 37 customers, 4 categories, 61 products, 187 orders, 15 feedback');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

populateData();