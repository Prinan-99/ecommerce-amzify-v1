import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

async function comprehensiveSeed() {
  console.log('🌱 Starting comprehensive database seeding with real data...');

  try {
    // 1. Create Multiple Users (Admins, Sellers, Customers)
    const passwordHash = await bcrypt.hash('password123', 12);
    
    console.log('Creating users...');
    
    // Admin users
    const admin = await prisma.users.upsert({
      where: { email: 'admin@amzify.com' },
      update: {},
      create: {
        email: 'admin@amzify.com',
        password_hash: passwordHash,
        role: 'admin',
        first_name: 'Super',
        last_name: 'Admin',
        phone: '+919999999999',
        is_active: true,
        is_verified: true
      }
    });

    // Multiple Sellers
    const sellers = [];
    const sellerData = [
      {
        email: 'seller1@amzify.com',
        first_name: 'Rahul',
        last_name: 'Electronics',
        phone: '+918888888881',
        company_name: 'TechWorld Electronics',
        business_type: 'Electronics Retail'
      },
      {
        email: 'seller2@amzify.com', 
        first_name: 'Priya',
        last_name: 'Fashion',
        phone: '+918888888882',
        company_name: 'StyleHub Fashion',
        business_type: 'Fashion & Apparel'
      },
      {
        email: 'seller3@amzify.com',
        first_name: 'Amit',
        last_name: 'Home',
        phone: '+918888888883', 
        company_name: 'HomeComfort Solutions',
        business_type: 'Home & Garden'
      },
      {
        email: 'seller4@amzify.com',
        first_name: 'Sneha',
        last_name: 'Books',
        phone: '+918888888884',
        company_name: 'BookWorld Publishers',
        business_type: 'Books & Education'
      },
      {
        email: 'seller5@amzify.com',
        first_name: 'Vikram',
        last_name: 'Sports',
        phone: '+918888888885',
        company_name: 'FitZone Sports',
        business_type: 'Sports & Fitness'
      }
    ];

    for (const sellerInfo of sellerData) {
      const seller = await prisma.users.upsert({
        where: { email: sellerInfo.email },
        update: {},
        create: {
          email: sellerInfo.email,
          password_hash: passwordHash,
          role: 'seller',
          first_name: sellerInfo.first_name,
          last_name: sellerInfo.last_name,
          phone: sellerInfo.phone,
          is_active: true,
          is_verified: true
        }
      });
      sellers.push({ ...seller, ...sellerInfo });
    }

    // Multiple Customers
    const customers = [];
    const customerData = [
      { email: 'customer1@amzify.com', first_name: 'Arjun', last_name: 'Sharma', phone: '+917777777771' },
      { email: 'customer2@amzify.com', first_name: 'Kavya', last_name: 'Patel', phone: '+917777777772' },
      { email: 'customer3@amzify.com', first_name: 'Rohit', last_name: 'Kumar', phone: '+917777777773' },
      { email: 'customer4@amzify.com', first_name: 'Ananya', last_name: 'Singh', phone: '+917777777774' },
      { email: 'customer5@amzify.com', first_name: 'Karthik', last_name: 'Reddy', phone: '+917777777775' },
      { email: 'customer6@amzify.com', first_name: 'Meera', last_name: 'Nair', phone: '+917777777776' },
      { email: 'customer7@amzify.com', first_name: 'Siddharth', last_name: 'Gupta', phone: '+917777777777' },
      { email: 'customer8@amzify.com', first_name: 'Divya', last_name: 'Rao', phone: '+917777777778' },
    ];

    for (const customerInfo of customerData) {
      const customer = await prisma.users.upsert({
        where: { email: customerInfo.email },
        update: {},
        create: {
          email: customerInfo.email,
          password_hash: passwordHash,
          role: 'customer',
          first_name: customerInfo.first_name,
          last_name: customerInfo.last_name,
          phone: customerInfo.phone,
          is_active: true,
          is_verified: true
        }
      });
      customers.push(customer);
    }

    // 2. Create Seller Profiles
    console.log('Creating seller profiles...');
    for (let i = 0; i < sellers.length; i++) {
      await prisma.seller_profiles.create({
        data: {
          user_id: sellers[i].id,
          company_name: sellers[i].company_name,
          business_type: sellers[i].business_type,
          description: `Premium ${sellers[i].business_type.toLowerCase()} retailer with extensive experience`,
          is_approved: true,
          approval_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'][i],
          state: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Maharashtra'][i],
          postal_code: ['400001', '110001', '560001', '600001', '411001'][i],
          gst_number: `27ABCDE${1234 + i}Z1Z5`,
          pan_number: `ABCDE${1234 + i}F`,
          bank_name: 'HDFC Bank',
          account_number: `1234567890${i}`,
          ifsc_code: 'HDFC0000001',
          account_holder_name: `${sellers[i].first_name} ${sellers[i].last_name}`,
          commission_rate: 0.15
        }
      });
    }

    // 3. Create Categories
    console.log('Creating categories...');
    const categoryData = [
      { name: 'Electronics', slug: 'electronics', description: 'Smartphones, laptops, gadgets and electronic accessories' },
      { name: 'Fashion & Apparel', slug: 'fashion', description: 'Clothing, shoes, accessories and fashion items' },
      { name: 'Home & Garden', slug: 'home-garden', description: 'Home decor, furniture, kitchen and garden supplies' },
      { name: 'Books & Education', slug: 'books', description: 'Books, e-books, stationery and educational materials' },
      { name: 'Sports & Fitness', slug: 'sports', description: 'Sports equipment, fitness gear and outdoor activities' },
      { name: 'Beauty & Personal Care', slug: 'beauty', description: 'Cosmetics, skincare, haircare and personal hygiene' },
      { name: 'Automotive', slug: 'automotive', description: 'Car accessories, spare parts and automotive supplies' },
      { name: 'Toys & Games', slug: 'toys', description: 'Toys, board games, video games and entertainment products' }
    ];

    const categories = [];
    for (const categoryInfo of categoryData) {
      const category = await prisma.categories.upsert({
        where: { slug: categoryInfo.slug },
        update: {},
        create: categoryInfo
      });
      categories.push(category);
    }

    // 4. Create Products
    console.log('Creating products...');
    const productData = [
      // Electronics
      { name: 'iPhone 15 Pro', price: 129900, category_slug: 'electronics', seller_idx: 0, stock: 45 },
      { name: 'Samsung Galaxy S24', price: 89900, category_slug: 'electronics', seller_idx: 0, stock: 38 },
      { name: 'MacBook Air M3', price: 114900, category_slug: 'electronics', seller_idx: 0, stock: 22 },
      { name: 'Sony WH-1000XM5', price: 29990, category_slug: 'electronics', seller_idx: 0, stock: 67 },
      { name: 'iPad Pro 12.9', price: 112900, category_slug: 'electronics', seller_idx: 0, stock: 18 },
      
      // Fashion
      { name: 'Nike Air Jordan 1', price: 12995, category_slug: 'fashion', seller_idx: 1, stock: 89 },
      { name: 'Levi\'s 501 Jeans', price: 4999, category_slug: 'fashion', seller_idx: 1, stock: 156 },
      { name: 'Ray-Ban Aviators', price: 8990, category_slug: 'fashion', seller_idx: 1, stock: 43 },
      { name: 'Zara Formal Shirt', price: 2499, category_slug: 'fashion', seller_idx: 1, stock: 78 },
      
      // Home & Garden
      { name: 'Philips Air Fryer', price: 8999, category_slug: 'home-garden', seller_idx: 2, stock: 34 },
      { name: 'IKEA Study Table', price: 12999, category_slug: 'home-garden', seller_idx: 2, stock: 23 },
      { name: 'Prestige Pressure Cooker', price: 2499, category_slug: 'home-garden', seller_idx: 2, stock: 89 },
      
      // Books
      { name: 'Atomic Habits', price: 599, category_slug: 'books', seller_idx: 3, stock: 234 },
      { name: 'The Psychology of Money', price: 399, category_slug: 'books', seller_idx: 3, stock: 167 },
      
      // Sports
      { name: 'Decathlon Treadmill', price: 45999, category_slug: 'sports', seller_idx: 4, stock: 12 },
      { name: 'Nike Football', price: 1999, category_slug: 'sports', seller_idx: 4, stock: 78 }
    ];

    const products = [];
    for (let i = 0; i < productData.length; i++) {
      const productInfo = productData[i];
      const category = categories.find(c => c.slug === productInfo.category_slug);
      const seller = sellers[productInfo.seller_idx];
      const uniqueSlug = `${productInfo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}-${i}`;
      
      const product = await prisma.products.upsert({
        where: { slug: uniqueSlug },
        update: {},
        create: {
          seller_id: seller.id,
          category_id: category.id,
          name: productInfo.name,
          slug: uniqueSlug,
          description: `High-quality ${productInfo.name} with premium features and excellent build quality. Perfect for daily use.`,
          short_description: `Premium ${productInfo.name}`,
          price: productInfo.price,
          compare_price: productInfo.price * 1.2,
          stock_quantity: productInfo.stock,
          status: 'active',
          is_featured: Math.random() > 0.7,
          images: JSON.stringify([`https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`])
        }
      });
      products.push(product);
    }

    // 5. Create Orders
    console.log('Creating orders...');
    for (let i = 0; i < 187; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const orderProducts = products.slice(0, Math.floor(Math.random() * 3) + 1);
      
      let subtotal = 0;
      const orderItemsData = [];
      
      for (const product of orderProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = parseFloat(product.price);
        const total = price * quantity;
        subtotal += total;
        
        orderItemsData.push({
          product_id: product.id,
          seller_id: product.seller_id,
          product_name: product.name,
          quantity: quantity,
          unit_price: price,
          total_price: total
        });
      }
      
      const order = await prisma.orders.create({
        data: {
          customer_id: customer.id,
          order_number: `AMZ-${String(Date.now()).slice(-6)}-${i}`,
          status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][Math.floor(Math.random() * 5)],
          subtotal: subtotal,
          tax_amount: subtotal * 0.18,
          shipping_amount: subtotal > 500 ? 0 : 50,
          total_amount: subtotal + (subtotal * 0.18) + (subtotal > 500 ? 0 : 50),
          payment_status: ['pending', 'paid', 'failed'][Math.floor(Math.random() * 3)],
          payment_method: ['card', 'upi', 'netbanking', 'cod'][Math.floor(Math.random() * 4)],
          shipping_address: JSON.stringify({
            street: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postal_code: '400001',
            country: 'India'
          }),
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          order_items: {
            create: orderItemsData
          }
        }
      });
    }

    // 6. Create Customer Feedback
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
      const customer = customers[Math.floor(Math.random() * customers.length)];
      await prisma.customer_feedback.create({
        data: {
          customer_id: customer.id,
          customer_name: `${customer.first_name} ${customer.last_name}`,
          customer_email: customer.email,
          rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
          message: feedbackMessages[i],
          status: ['new', 'reviewed', 'responded'][Math.floor(Math.random() * 3)],
          type: ['product', 'service', 'delivery', 'general'][Math.floor(Math.random() * 4)]
        }
      });
    }

    // 7. Create Support Tickets
    console.log('Creating support tickets...');
    for (let i = 0; i < 25; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      await prisma.support_tickets.create({
        data: {
          user_id: customer.id,
          subject: [
            'Order delivery issue',
            'Payment problem',
            'Product defect',
            'Refund request',
            'Account login issue',
            'Product inquiry',
            'Shipping delay'
          ][Math.floor(Math.random() * 7)],
          description: 'I need assistance with my recent order. Please help resolve this issue.',
          status: ['open', 'in_progress', 'resolved', 'closed'][Math.floor(Math.random() * 4)],
          priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
          category: ['Order', 'Payment', 'Product', 'Technical', 'General'][Math.floor(Math.random() * 5)]
        }
      });
    }

    // 8. Create Wishlist Items, Cart Items, and Addresses
    console.log('Creating wishlist items, cart items, and addresses...');
    
    for (const customer of customers.slice(0, 5)) {
      // Create addresses
      await prisma.addresses.create({
        data: {
          user_id: customer.id,
          type: 'shipping',
          street_address: `${Math.floor(Math.random() * 999) + 1} ${['MG Road', 'Park Street', 'Main Street', 'Ring Road'][Math.floor(Math.random() * 4)]}`,
          city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'][Math.floor(Math.random() * 5)],
          state: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Maharashtra'][Math.floor(Math.random() * 5)],
          postal_code: String(400001 + Math.floor(Math.random() * 99999)),
          is_default: true
        }
      });

      // Create wishlist items
      const randomProducts = products.slice(0, 3);
      for (const product of randomProducts) {
        try {
          await prisma.wishlist_items.create({
            data: {
              user_id: customer.id,
              product_id: product.id
            }
          });
        } catch (error) {
          // Skip duplicates
        }
      }

      // Create cart items
      const cartProducts = products.slice(3, 6);
      for (const product of cartProducts) {
        try {
          await prisma.cart_items.create({
            data: {
              user_id: customer.id,
              product_id: product.id,
              quantity: Math.floor(Math.random() * 3) + 1
            }
          });
        } catch (error) {
          // Skip duplicates
        }
      }
    }

    // 9. Create Seller Applications
    console.log('Creating seller applications...');
    const applicationNames = [
      { first: 'Ravi', last: 'Kumar', email: 'ravi@example.com', company: 'TechGadgets Store' },
      { first: 'Sunita', last: 'Sharma', email: 'sunita@example.com', company: 'Fashion Hub' },
      { first: 'Manoj', last: 'Patel', email: 'manoj@example.com', company: 'Home Essentials' }
    ];

    for (const app of applicationNames) {
      await prisma.seller_applications.create({
        data: {
          first_name: app.first,
          last_name: app.last,
          email: app.email,
          phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          password_hash: passwordHash,
          company_name: app.company,
          business_type: 'Retail',
          business_description: `Professional ${app.company.toLowerCase()} business with quality products`,
          status: 'pending'
        }
      });
    }

    console.log('✅ Comprehensive database seeding completed successfully!');
    console.log(`📊 Created:`);
    console.log(`   - ${sellers.length + customers.length + 1} Users (1 Admin, ${sellers.length} Sellers, ${customers.length} Customers)`);
    console.log(`   - ${sellers.length} Seller Profiles`);
    console.log(`   - ${categories.length} Categories`);
    console.log(`   - ${products.length} Products`);
    console.log(`   - 187 Orders with Order Items`);
    console.log(`   - 15 Customer Feedback entries`);
    console.log(`   - 25 Support Tickets`);
    console.log(`   - Multiple Addresses, Wishlist & Cart Items`);
    console.log(`   - ${applicationNames.length} Seller Applications`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveSeed();