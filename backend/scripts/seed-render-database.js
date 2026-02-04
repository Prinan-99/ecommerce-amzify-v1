import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// Simple password hash function (use bcrypt in production)
const hashPassword = async (password) => {
  // For demo purposes, using a simple hash. In production, use bcrypt
  return '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ'; // Mock hash
};

const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `AMZ${timestamp.slice(-6)}${random}`;
};

// Sample customer data
const customers = [
  { email: 'customer1@example.com', first_name: 'Rajesh', last_name: 'Kumar', phone: '+91 98765 43210' },
  { email: 'customer2@example.com', first_name: 'Priya', last_name: 'Sharma', phone: '+91 98765 43211' },
  { email: 'customer3@example.com', first_name: 'Amit', last_name: 'Patel', phone: '+91 98765 43212' },
  { email: 'customer4@example.com', first_name: 'Sneha', last_name: 'Reddy', phone: '+91 98765 43213' },
  { email: 'customer5@example.com', first_name: 'Vikram', last_name: 'Singh', phone: '+91 98765 43214' },
  { email: 'customer6@example.com', first_name: 'Anjali', last_name: 'Gupta', phone: '+91 98765 43215' },
  { email: 'customer7@example.com', first_name: 'Rahul', last_name: 'Verma', phone: '+91 98765 43216' },
  { email: 'customer8@example.com', first_name: 'Kavita', last_name: 'Nair', phone: '+91 98765 43217' },
  { email: 'customer9@example.com', first_name: 'Arjun', last_name: 'Iyer', phone: '+91 98765 43218' },
  { email: 'customer10@example.com', first_name: 'Divya', last_name: 'Mehta', phone: '+91 98765 43219' },
];

// Sample shipping addresses
const addresses = [
  { street_address: '123 MG Road', city: 'Bangalore', state: 'Karnataka', postal_code: '560001', country: 'India' },
  { street_address: '456 Park Street', city: 'Mumbai', state: 'Maharashtra', postal_code: '400001', country: 'India' },
  { street_address: '789 Anna Salai', city: 'Chennai', state: 'Tamil Nadu', postal_code: '600002', country: 'India' },
  { street_address: '321 Nehru Place', city: 'New Delhi', state: 'Delhi', postal_code: '110019', country: 'India' },
  { street_address: '654 FC Road', city: 'Pune', state: 'Maharashtra', postal_code: '411004', country: 'India' },
  { street_address: '987 Salt Lake', city: 'Kolkata', state: 'West Bengal', postal_code: '700064', country: 'India' },
  { street_address: '147 Banjara Hills', city: 'Hyderabad', state: 'Telangana', postal_code: '500034', country: 'India' },
  { street_address: '258 Residency Road', city: 'Bangalore', state: 'Karnataka', postal_code: '560025', country: 'India' },
  { street_address: '369 MLA Colony', city: 'Jaipur', state: 'Rajasthan', postal_code: '302004', country: 'India' },
  { street_address: '741 Saket Nagar', city: 'Indore', state: 'Madhya Pradesh', postal_code: '452001', country: 'India' },
];

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentMethods = ['cod', 'upi', 'card'];

async function seedDatabase() {
  console.log('🌱 Starting database seeding for Render...\n');

  try {
    // 1. Get or create seller
    console.log('📦 Step 1: Setting up seller...');
    let seller = await prisma.users.findFirst({
      where: { email: 'seller@example.com', role: 'seller' }
    });

    if (!seller) {
      const hashedPassword = await hashPassword('seller123');
      seller = await prisma.users.create({
        data: {
          email: 'seller@example.com',
          password_hash: hashedPassword,
          first_name: 'Amzify',
          last_name: 'Seller',
          phone: '+91 99999 99999',
          role: 'seller',
          is_verified: true
        }
      });
      console.log('   ✅ Created seller account');
    } else {
      console.log('   ✅ Seller account exists');
    }

    // 2. Create/Get Electronics category
    console.log('\n📂 Step 2: Setting up categories...');
    let category = await prisma.categories.findFirst({
      where: { 
        name: 'Electronics'
      }
    });

    if (!category) {
      category = await prisma.categories.create({
        data: {
          name: 'Electronics',
          slug: 'electronics',
          description: 'Electronic devices and accessories',
          is_active: true
        }
      });
      console.log('   ✅ Created Electronics category');
    } else {
      console.log('   ✅ Electronics category exists');
    }

    // 3. Create sample products
    console.log('\n🎁 Step 3: Creating products...');
    const productData = [
      { name: 'Sony WH-1000XM5 Headphones', price: 29999, compare_price: 34999, stock: 50, sku: 'SONY-WH1000XM5' },
      { name: 'Apple AirPods Pro', price: 24900, compare_price: 27900, stock: 100, sku: 'APPLE-AIRPODS-PRO' },
      { name: 'Samsung Galaxy Buds2 Pro', price: 16999, compare_price: 18999, stock: 75, sku: 'SAMSUNG-BUDS2PRO' },
      { name: 'JBL Flip 6 Speaker', price: 11999, compare_price: 13999, stock: 60, sku: 'JBL-FLIP6' },
      { name: 'Bose SoundLink Revolve+', price: 27999, compare_price: 32999, stock: 40, sku: 'BOSE-REVOLVE2' },
      { name: 'Anker PowerCore 26800mAh', price: 3999, compare_price: 4999, stock: 150, sku: 'ANKER-PC26800' },
      { name: 'Logitech MX Master 3S Mouse', price: 8999, compare_price: 10999, stock: 80, sku: 'LOGI-MXM3S' },
      { name: 'Razer BlackWidow V3 Keyboard', price: 11999, compare_price: 13999, stock: 45, sku: 'RAZER-BWV3' },
    ];

    const products = [];
    for (const pd of productData) {
      let product = await prisma.products.findFirst({
        where: { sku: pd.sku, seller_id: seller.id }
      });

      if (!product) {
        product = await prisma.products.create({
          data: {
            seller_id: seller.id,
            category_id: category.id,
            name: pd.name,
            description: `High-quality ${pd.name.toLowerCase()} with premium features`,
            short_description: `Premium ${pd.name.split(' ')[0]} product`,
            price: pd.price,
            compare_price: pd.compare_price,
            sku: pd.sku,
            stock_quantity: pd.stock,
            status: 'active',
            images: [
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
              'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop'
            ]
          }
        });
      }
      products.push(product);
    }
    console.log(`   ✅ ${products.length} products ready`);

    // 4. Create customers
    console.log('\n👥 Step 4: Creating customers...');
    const customerUsers = [];
    for (const cust of customers) {
      let customer = await prisma.users.findUnique({
        where: { email: cust.email }
      });

      if (!customer) {
        const hashedPassword = await hashPassword('password123');
        customer = await prisma.users.create({
          data: {
            email: cust.email,
            password_hash: hashedPassword,
            first_name: cust.first_name,
            last_name: cust.last_name,
            phone: cust.phone,
            role: 'customer',
            is_verified: true
          }
        });
      }
      customerUsers.push(customer);
    }
    console.log(`   ✅ ${customerUsers.length} customers ready`);

    // 5. Create orders
    console.log('\n📋 Step 5: Creating orders...');
    const ordersToCreate = 25; // Create 25 orders
    let ordersCreated = 0;

    for (let i = 0; i < ordersToCreate; i++) {
      const customer = customerUsers[Math.floor(Math.random() * customerUsers.length)];
      const address = addresses[Math.floor(Math.random() * addresses.length)];
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const paymentStatus = status === 'delivered' ? 'paid' : (Math.random() > 0.3 ? 'paid' : 'pending');

      // Select 1-4 random products
      const numItems = Math.floor(Math.random() * 4) + 1;
      const selectedProducts = [];
      const usedIndices = new Set();
      
      while (selectedProducts.length < numItems) {
        const idx = Math.floor(Math.random() * products.length);
        if (!usedIndices.has(idx)) {
          usedIndices.add(idx);
          selectedProducts.push(products[idx]);
        }
      }

      // Calculate totals
      let subtotal = 0;
      const orderItems = selectedProducts.map(product => {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = parseFloat(product.price);
        const totalPrice = unitPrice * quantity;
        subtotal += totalPrice;

        return {
          product_id: product.id,
          seller_id: seller.id,
          product_name: product.name,
          product_sku: product.sku,
          quantity: quantity,
          unit_price: unitPrice,
          total_price: totalPrice
        };
      });

      const taxAmount = subtotal * 0.18; // 18% GST
      const shippingAmount = subtotal > 500 ? 0 : 50;
      const totalAmount = subtotal + taxAmount + shippingAmount;

      // Create date within last 60 days
      const daysAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      // Create order
      const order = await prisma.orders.create({
        data: {
          order_number: generateOrderNumber(),
          user_id: customer.id,
          status: status,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          subtotal: subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
          shipping_address: address,
          billing_address: address,
          notes: i % 5 === 0 ? 'Please deliver before 6 PM' : null,
          created_at: createdAt,
          updated_at: createdAt
        }
      });

      // Create order items
      for (const item of orderItems) {
        await prisma.order_items.create({
          data: {
            order_id: order.id,
            ...item
          }
        });
      }

      ordersCreated++;
      console.log(`   ✅ [${ordersCreated}/${ordersToCreate}] Order #${order.order_number} - ${status.toUpperCase()} - ₹${totalAmount.toFixed(2)}`);
    }

    // 6. Create payout records
    console.log('\n💰 Step 6: Creating payout history...');
    const payouts = [
      { amount: 38000, status: 'completed', daysAgo: 15, method: 'Bank Transfer', reference: 'PAY-001' },
      { amount: 42000, status: 'completed', daysAgo: 30, method: 'Bank Transfer', reference: 'PAY-002' },
      { amount: 35000, status: 'completed', daysAgo: 45, method: 'UPI', reference: 'PAY-003' },
      { amount: 48000, status: 'completed', daysAgo: 60, method: 'Bank Transfer', reference: 'PAY-004' },
      { amount: 45000, status: 'pending', daysAgo: 0, method: 'Bank Transfer', reference: 'PAY-005' },
    ];

    // Note: You'll need to create a payouts table in your schema
    // For now, this is placeholder - adjust based on your actual schema
    console.log('   ℹ️  Payout records would be created here (requires payouts table)');

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Seller: 1 account`);
    console.log(`   • Customers: ${customerUsers.length} accounts`);
    console.log(`   • Products: ${products.length} items`);
    console.log(`   • Orders: ${ordersCreated} orders`);
    console.log(`   • Revenue: ₹${(ordersCreated * 15000).toLocaleString()} (approx)`);
    console.log('\n🎉 Your Render database is now populated with test data!');
    console.log('🔄 Refresh your seller panel to see all the data!\n');

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
