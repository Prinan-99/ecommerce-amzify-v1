import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

// Product data with various categories
const productData = [
  // Electronics
  { name: 'iPhone 15 Pro Max', description: 'Latest Apple flagship smartphone with A17 Pro chip', price: 129999, stock: 50, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1696446702683-22e8b0c6c7d0?w=400' },
  { name: 'Samsung Galaxy S24 Ultra', description: 'Premium Android smartphone with S Pen', price: 124999, stock: 45, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400' },
  { name: 'MacBook Pro 16"', description: 'Powerful laptop with M3 Max chip', price: 249999, stock: 30, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400' },
  { name: 'Dell XPS 15', description: 'Premium Windows laptop for professionals', price: 149999, stock: 35, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400' },
  { name: 'Sony WH-1000XM5', description: 'Industry-leading noise cancelling headphones', price: 29999, stock: 100, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcf?w=400' },
  { name: 'AirPods Pro 2', description: 'Apple wireless earbuds with ANC', price: 24999, stock: 120, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400' },
  { name: 'iPad Air M2', description: 'Versatile tablet with Apple Pencil support', price: 59999, stock: 60, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400' },
  { name: 'Apple Watch Series 9', description: 'Advanced health and fitness smartwatch', price: 41999, stock: 75, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400' },
  
  // Fashion
  { name: 'Levi\'s 501 Original Jeans', description: 'Classic straight fit denim jeans', price: 4999, stock: 200, category: 'Fashion', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400' },
  { name: 'Nike Air Max 270', description: 'Comfortable lifestyle sneakers', price: 12999, stock: 150, category: 'Fashion', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
  { name: 'Adidas Ultraboost 22', description: 'Premium running shoes with boost technology', price: 16999, stock: 130, category: 'Fashion', image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400' },
  { name: 'Ray-Ban Aviator Sunglasses', description: 'Iconic pilot-style sunglasses', price: 7999, stock: 90, category: 'Fashion', image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400' },
  { name: 'Zara Leather Jacket', description: 'Premium genuine leather biker jacket', price: 14999, stock: 70, category: 'Fashion', image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
  { name: 'H&M Cotton T-Shirt Pack', description: 'Set of 3 premium cotton t-shirts', price: 1499, stock: 300, category: 'Fashion', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
  
  // Home & Living
  { name: 'Dyson V15 Detect', description: 'Cordless vacuum with laser detection', price: 54999, stock: 40, category: 'Home', image_url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400' },
  { name: 'KitchenAid Stand Mixer', description: 'Professional 5-qt stand mixer', price: 34999, stock: 50, category: 'Home', image_url: 'https://images.unsplash.com/photo-1594385208974-2e75f8888780?w=400' },
  { name: 'Philips Air Fryer XXL', description: 'Large capacity healthy cooking air fryer', price: 18999, stock: 80, category: 'Home', image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400' },
  { name: 'Instant Pot Duo Plus', description: '9-in-1 programmable pressure cooker', price: 11999, stock: 100, category: 'Home', image_url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400' },
  { name: 'IKEA POÄNG Armchair', description: 'Comfortable bentwood armchair', price: 8999, stock: 60, category: 'Home', image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400' },
  
  // Sports & Fitness
  { name: 'Bowflex Adjustable Dumbbells', description: 'Space-saving weight set 5-52.5 lbs', price: 39999, stock: 45, category: 'Sports', image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400' },
  { name: 'Yoga Mat Premium', description: 'Non-slip exercise mat with carrying strap', price: 2999, stock: 200, category: 'Sports', image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400' },
  { name: 'Fitbit Charge 6', description: 'Advanced fitness tracker with GPS', price: 14999, stock: 110, category: 'Sports', image_url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400' },
  { name: 'Wilson Evolution Basketball', description: 'Official size composite basketball', price: 3999, stock: 80, category: 'Sports', image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400' },
  
  // Books & Media
  { name: 'Atomic Habits - James Clear', description: 'Bestselling self-improvement book', price: 599, stock: 250, category: 'Books', image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400' },
  { name: 'The Psychology of Money', description: 'Timeless lessons on wealth', price: 499, stock: 300, category: 'Books', image_url: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400' },
  { name: 'Kindle Paperwhite', description: 'Waterproof e-reader with adjustable light', price: 12999, stock: 90, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1592422746590-f0fcf3d2695f?w=400' },
  
  // Beauty & Personal Care
  { name: 'Olaplex Hair Treatment Set', description: 'Professional bond-building hair care', price: 4999, stock: 150, category: 'Beauty', image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400' },
  { name: 'The Ordinary Skincare Set', description: 'Complete skincare routine bundle', price: 3499, stock: 180, category: 'Beauty', image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400' },
  { name: 'Philips OneBlade Pro', description: 'Hybrid electric trimmer and shaver', price: 4999, stock: 120, category: 'Beauty', image_url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=400' },
];

// Customer names for realistic data
const customerNames = [
  { first: 'Rahul', last: 'Sharma', email: 'rahul.sharma@example.com' },
  { first: 'Priya', last: 'Patel', email: 'priya.patel@example.com' },
  { first: 'Amit', last: 'Kumar', email: 'amit.kumar@example.com' },
  { first: 'Sneha', last: 'Reddy', email: 'sneha.reddy@example.com' },
  { first: 'Rohan', last: 'Mehta', email: 'rohan.mehta@example.com' },
  { first: 'Anjali', last: 'Singh', email: 'anjali.singh@example.com' },
  { first: 'Vikram', last: 'Gupta', email: 'vikram.gupta@example.com' },
  { first: 'Neha', last: 'Joshi', email: 'neha.joshi@example.com' },
  { first: 'Arjun', last: 'Nair', email: 'arjun.nair@example.com' },
  { first: 'Pooja', last: 'Rao', email: 'pooja.rao@example.com' },
  { first: 'Karthik', last: 'Iyer', email: 'karthik.iyer@example.com' },
  { first: 'Divya', last: 'Menon', email: 'divya.menon@example.com' },
  { first: 'Aditya', last: 'Desai', email: 'aditya.desai@example.com' },
  { first: 'Kavya', last: 'Pillai', email: 'kavya.pillai@example.com' },
  { first: 'Siddharth', last: 'Agarwal', email: 'siddharth.agarwal@example.com' },
  { first: 'Riya', last: 'Malhotra', email: 'riya.malhotra@example.com' },
  { first: 'Varun', last: 'Khanna', email: 'varun.khanna@example.com' },
  { first: 'Meera', last: 'Bose', email: 'meera.bose@example.com' },
  { first: 'Nikhil', last: 'Chopra', email: 'nikhil.chopra@example.com' },
  { first: 'Isha', last: 'Bansal', email: 'isha.bansal@example.com' },
];

// Addresses for orders
const addresses = [
  '123, MG Road, Bangalore, Karnataka - 560001',
  '456, Connaught Place, New Delhi, Delhi - 110001',
  '789, Marine Drive, Mumbai, Maharashtra - 400002',
  '234, Park Street, Kolkata, West Bengal - 700016',
  '567, Anna Salai, Chennai, Tamil Nadu - 600002',
  '890, Banjara Hills, Hyderabad, Telangana - 500034',
  '321, Koramangala, Bangalore, Karnataka - 560034',
  '654, Gachibowli, Hyderabad, Telangana - 500032',
  '987, Whitefield, Bangalore, Karnataka - 560066',
  '147, Powai, Mumbai, Maharashtra - 400076',
];

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed'];
const paymentMethods = ['card', 'upi', 'cod', 'netbanking'];

async function main() {
  console.log('🚀 Starting database seeding...\n');

  try {
    // Get the existing seller account
    const seller = await prisma.users.findFirst({
      where: { 
        email: 'seller@example.com',
        role: 'seller'
      },
      include: { seller_profiles: true }
    });

    if (!seller || !seller.seller_profiles || seller.seller_profiles.length === 0) {
      console.error('❌ Seller account not found. Please run createTestSeller.js first.');
      return;
    }

    console.log(`✅ Found seller: ${seller.email} (ID: ${seller.id})\n`);

    // 1. Create Products
    console.log('📦 Creating products...');
    const products = [];
    for (const productInfo of productData) {
      const baseSlug = productInfo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const uniqueSlug = `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const product = await prisma.products.create({
        data: {
          name: productInfo.name,
          slug: uniqueSlug,
          description: productInfo.description,
          price: productInfo.price,
          stock_quantity: productInfo.stock,
          images: JSON.stringify([productInfo.image_url]),
          seller_id: seller.id,
          status: 'active',
        }
      });
      products.push(product);
    }
    console.log(`✅ Created ${products.length} products\n`);

    // 2. Create Customers
    console.log('👥 Creating customers...');
    const hashedPassword = await bcrypt.hash('customer123', 10);
    const customers = [];
    
    for (const customerInfo of customerNames) {
      try {
        const user = await prisma.users.create({
          data: {
            email: customerInfo.email,
            password: hashedPassword,
            first_name: customerInfo.first,
            last_name: customerInfo.last,
            role: 'customer',
            is_active: true,
          }
        });
        customers.push(user);
      } catch (error) {
        // Skip if customer already exists
        const existingUser = await prisma.users.findUnique({
          where: { email: customerInfo.email }
        });
        if (existingUser) {
          customers.push(existingUser);
        }
      }
    }
    console.log(`✅ Created/found ${customers.length} customers\n`);

    // 3. Create Orders with Order Items
    console.log('🛒 Creating orders...');
    let orderCount = 0;
    let totalRevenue = 0;

    // Create 100+ orders spread over the last 90 days
    const daysBack = 90;
    for (let i = 0; i < 150; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const randomDaysAgo = Math.floor(Math.random() * daysBack);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - randomDaysAgo);

      // Randomly select 1-5 products for this order
      const numItems = Math.floor(Math.random() * 5) + 1;
      const selectedProducts = [];
      const usedIndices = new Set();
      
      while (selectedProducts.length < numItems) {
        const randomIndex = Math.floor(Math.random() * products.length);
        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          selectedProducts.push(products[randomIndex]);
        }
      }

      // Calculate total
      let orderTotal = 0;
      const orderItems = selectedProducts.map(product => {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemTotal = product.price * quantity;
        orderTotal += itemTotal;
        return {
          product_id: product.id,
          quantity,
          price: product.price,
        };
      });

      // Determine status based on order age
      let status;
      if (randomDaysAgo < 2) {
        status = orderStatuses[Math.floor(Math.random() * 2)]; // pending or processing
      } else if (randomDaysAgo < 7) {
        status = orderStatuses[Math.floor(Math.random() * 3) + 1]; // processing or shipped
      } else if (randomDaysAgo < 14) {
        status = orderStatuses[Math.floor(Math.random() * 2) + 2]; // shipped or delivered
      } else {
        status = 'completed';
      }

      const shippingAddress = addresses[Math.floor(Math.random() * addresses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      try {
        const order = await prisma.orders.create({
          data: {
            customer_id: customer.id,
            order_number: orderNumber,
            subtotal: orderTotal,
            total_amount: orderTotal,
            status,
            payment_method: paymentMethod,
            payment_status: status === 'completed' ? 'paid' : (status === 'pending' ? 'pending' : 'processing'),
            shipping_address: { address: shippingAddress },
            created_at: orderDate,
            updated_at: orderDate,
            orderItems: {
              create: orderItems.map(item => ({
                product_id: item.product_id,
                product_name: products.find(p => p.id === item.product_id)?.name || 'Product',
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity,
              }))
            }
          }
        });

        orderCount++;
        if (status === 'completed') {
          totalRevenue += orderTotal;
        }

        if (orderCount % 25 === 0) {
          console.log(`   Created ${orderCount} orders...`);
        }
      } catch (error) {
        console.error(`   Error creating order: ${error.message}`);
      }
    }

    console.log(`✅ Created ${orderCount} orders\n`);

    // 4. Summary
    console.log('═══════════════════════════════════════');
    console.log('✨ DATABASE SEEDING COMPLETED! ✨');
    console.log('═══════════════════════════════════════');
    console.log(`📦 Products: ${products.length}`);
    console.log(`👥 Customers: ${customers.length}`);
    console.log(`🛒 Orders: ${orderCount}`);
    console.log(`💰 Total Revenue: ₹${totalRevenue.toLocaleString()}`);
    console.log('═══════════════════════════════════════\n');
    console.log('🎉 Your teammates can now access this data!');
    console.log('📊 Dashboard will show real statistics\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
