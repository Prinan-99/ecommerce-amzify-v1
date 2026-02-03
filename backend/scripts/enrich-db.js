import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

// Sample data generators
const generateEmail = (prefix, domain = 'amzify.com') => 
  `${prefix.toLowerCase().replace(/\s+/g, '.')}@${domain}`;

const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Jessica', 'Robert', 'Amanda'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const companyNames = ['TechVision', 'FashionHub', 'HomeStyle', 'SportsGear', 'DigitalPro', 'StyleWorks', 'HomeComfort', 'ActiveLife'];
const categories = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Home & Living', slug: 'home-living' },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors' },
  { name: 'Books & Media', slug: 'books-media' },
  { name: 'Beauty & Health', slug: 'beauty-health' }
];

const products = [
  { name: 'Wireless Bluetooth Speaker', price: 2499, stock: 50 },
  { name: '4K Webcam Pro', price: 3999, stock: 30 },
  { name: 'USB-C Fast Charging Cable', price: 299, stock: 200 },
  { name: 'Adjustable Phone Stand', price: 399, stock: 150 },
  { name: 'Cotton T-Shirt Bundle', price: 799, stock: 100 },
  { name: 'Premium Denim Jeans', price: 1299, stock: 75 },
  { name: 'Formal White Shirt', price: 899, stock: 60 },
  { name: 'Running Shoes Ultra', price: 2499, stock: 80 },
  { name: 'LED Desk Lamp with USB', price: 1199, stock: 45 },
  { name: 'Ceramic Plant Pot Set', price: 599, stock: 120 },
  { name: 'Bamboo Bed Sheet Set', price: 1699, stock: 90 },
  { name: 'Stainless Steel Knife Set', price: 1299, stock: 55 },
  { name: 'Yoga Exercise Mat', price: 599, stock: 100 },
  { name: 'Adjustable Dumbbell Set', price: 2299, stock: 40 },
  { name: 'Digital Bathroom Scale', price: 1299, stock: 65 },
  { name: 'Anti-Aging Face Cream', price: 899, stock: 100 },
  { name: 'Organic Hair Shampoo', price: 299, stock: 150 },
  { name: 'Vitamin C Serum', price: 599, stock: 80 }
];

async function seed() {
  try {
    console.log('🌱 Enriching database with additional data...\n');

    // Create categories
    console.log('📁 Creating categories...');
    const createdCategories = [];
    for (const cat of categories) {
      const category = await prisma.categories.upsert({
        where: { slug: cat.slug },
        update: {},
        create: {
          name: cat.name,
          slug: cat.slug,
          description: `Browse our collection of ${cat.name.toLowerCase()}`,
          is_active: true
        }
      });
      createdCategories.push(category);
    }
    console.log(`✅ Created ${createdCategories.length} categories\n`);

    // Create more customers
    console.log('👥 Creating customers...');
    const customers = [];
    for (let i = 0; i < 8; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = generateEmail(`${firstName}.${lastName}${i}`, 'customer.amzify.com');
      const password = await bcrypt.hash('Customer@123', 12);
      
      try {
        const customer = await prisma.users.upsert({
          where: { email },
          update: {},
          create: {
            email,
            password_hash: password,
            role: 'customer',
            first_name: firstName,
            last_name: lastName,
            phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
            is_verified: true,
            is_active: true
          }
        });
        customers.push(customer);
      } catch (e) {
        console.log(`  ⏭️  Customer ${email} already exists`);
      }
    }
    console.log(`✅ Created ${customers.length} customers\n`);

    // Create more sellers
    console.log('🏪 Creating sellers...');
    const sellers = [];
    for (let i = 0; i < 5; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = generateEmail(`${firstName}.${lastName}${i}`, 'seller.amzify.com');
      const password = await bcrypt.hash('Seller@123', 12);
      
      try {
        const seller = await prisma.users.upsert({
          where: { email },
          update: {},
          create: {
            email,
            password_hash: password,
            role: 'seller',
            first_name: firstName,
            last_name: lastName,
            phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
            is_verified: true,
            is_active: true
          }
        });
        
        // Create seller profile
        const company = companyNames[i % companyNames.length];
        try {
          await prisma.seller_profiles.upsert({
            where: { user_id: seller.id },
            update: {},
            create: {
              user_id: seller.id,
              company_name: company,
              store_name: `${company} Store`,
              description: 'Premium seller with excellent reviews',
              phone: seller.phone,
              is_approved: true,
              verification_status: 'verified',
              commission_rate: 5 + Math.floor(Math.random() * 3),
              rating: 4 + Math.random()
            }
          });
        } catch (e) {
          console.log(`  ⏭️  Seller profile for ${email} already exists`);
        }
        
        sellers.push(seller);
      } catch (e) {
        console.log(`  ⏭️  Seller ${email} already exists`);
      }
    }
    console.log(`✅ Created ${sellers.length} sellers\n`);

    // Create products
    console.log('📦 Creating products...');
    let productCount = 0;
    for (const product of products) {
      const categoryIdx = Math.floor(Math.random() * createdCategories.length);
      const sellerIdx = Math.floor(Math.random() * sellers.length);
      
      try {
        await prisma.products.create({
          data: {
            name: product.name,
            description: `High-quality ${product.name.toLowerCase()} - Best in class products`,
            price: product.price,
            original_price: product.price + Math.floor(Math.random() * 500) + 100,
            seller_id: sellers[sellerIdx].id,
            category_id: createdCategories[categoryIdx].id,
            stock: product.stock,
            status: 'active',
            image_url: `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}`,
            sku: `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            weight: (Math.random() * 2 + 0.1).toFixed(2),
            dimensions: `${Math.floor(Math.random() * 20) + 10}x${Math.floor(Math.random() * 20) + 10}x${Math.floor(Math.random() * 20) + 5}`,
            is_featured: Math.random() > 0.7
          }
        });
        productCount++;
      } catch (e) {
        console.log(`  ⏭️  Product ${product.name} already exists`);
      }
    }
    console.log(`✅ Created ${productCount} products\n`);

    // Create orders
    console.log('📋 Creating orders...');
    let orderCount = 0;
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    
    for (let i = 0; i < Math.min(15, customers.length * 2); i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const total = Math.floor(Math.random() * 5000) + 500;
      
      try {
        const order = await prisma.orders.create({
          data: {
            user_id: customer.id,
            order_number: `ORD-${Date.now()}-${i}`,
            status,
            total_amount: total,
            tax_amount: Math.round(total * 0.18),
            shipping_address: '123 Main Street, New Delhi, 110001, India',
            payment_method: 'credit_card',
            payment_status: status === 'pending' ? 'pending' : 'completed',
            notes: 'Standard delivery'
          }
        });
        
        // Add order items
        const numItems = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numItems; j++) {
          const product = await prisma.products.findFirst({
            skip: Math.floor(Math.random() * 18),
            take: 1
          });
          
          if (product) {
            await prisma.order_items.create({
              data: {
                order_id: order.id,
                product_id: product.id,
                quantity: Math.floor(Math.random() * 3) + 1,
                price: product.price,
                seller_id: product.seller_id
              }
            });
          }
        }
        orderCount++;
      } catch (e) {
        // Order might already exist, continue
      }
    }
    console.log(`✅ Created ${orderCount} orders\n`);

    // Create feedback
    console.log('⭐ Creating customer feedback...');
    let feedbackCount = 0;
    const feedbackTypes = ['general', 'complaint', 'suggestion', 'compliment'];
    const messages = [
      'Great experience with the platform!',
      'Product quality exceeded my expectations',
      'Delivery was faster than expected',
      'Need better customer support',
      'Amazing variety of products',
      'Prices are competitive',
      'User interface is intuitive',
      'Would recommend to friends'
    ];
    
    for (let i = 0; i < Math.min(10, customers.length); i++) {
      const customer = customers[i];
      try {
        await prisma.customer_feedback.create({
          data: {
            customer_id: customer.id,
            customer_name: `${customer.first_name} ${customer.last_name}`,
            customer_email: customer.email,
            type: feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)],
            rating: Math.floor(Math.random() * 5) + 1,
            message: messages[Math.floor(Math.random() * messages.length)],
            status: 'new'
          }
        });
        feedbackCount++;
      } catch (e) {
        // Feedback might already exist
      }
    }
    console.log(`✅ Created ${feedbackCount} feedback entries\n`);

    // Create addresses
    console.log('📍 Creating addresses...');
    let addressCount = 0;
    const cities = ['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune'];
    const states = ['Delhi', 'Maharashtra', 'Karnataka', 'Telangana', 'Maharashtra'];
    
    for (const customer of customers) {
      try {
        const cityIdx = Math.floor(Math.random() * cities.length);
        await prisma.addresses.create({
          data: {
            user_id: customer.id,
            type: 'shipping',
            street_address: `${Math.floor(Math.random() * 999) + 1} Main Street`,
            city: cities[cityIdx],
            state: states[cityIdx],
            postal_code: `${Math.floor(Math.random() * 900000) + 100000}`,
            country: 'India',
            is_default: true
          }
        });
        addressCount++;
      } catch (e) {
        // Address might already exist
      }
    }
    console.log(`✅ Created ${addressCount} addresses\n`);

    console.log('═══════════════════════════════════════');
    console.log('✅ Database enrichment completed!');
    console.log('═══════════════════════════════════════\n');
    console.log('📊 Data Summary:');
    console.log(`   📁 Categories: ${createdCategories.length}`);
    console.log(`   👥 Customers: ${customers.length}`);
    console.log(`   🏪 Sellers: ${sellers.length}`);
    console.log(`   📦 Products: ${productCount}`);
    console.log(`   📋 Orders: ${orderCount}`);
    console.log(`   ⭐ Feedback: ${feedbackCount}`);
    console.log(`   📍 Addresses: ${addressCount}`);
    console.log('\n✨ Your Render database is now populated with realistic test data!');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
