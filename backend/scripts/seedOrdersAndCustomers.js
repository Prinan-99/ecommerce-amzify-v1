import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

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
  { first: 'Kunal', last: 'Shah', email: 'kunal.shah@example.com' },
  { first: 'Simran', last: 'Kaur', email: 'simran.kaur@example.com' },
  { first: 'Harsh', last: 'Verma', email: 'harsh.verma@example.com' },
  { first: 'Tanvi', last: 'Sinha', email: 'tanvi.sinha@example.com' },
  { first: 'Rajesh', last: 'Nambiar', email: 'rajesh.nambiar@example.com' },
  { first: 'Deepika', last: 'Yadav', email: 'deepika.yadav@example.com' },
  { first: 'Abhishek', last: 'Pandey', email: 'abhishek.pandey@example.com' },
  { first: 'Sakshi', last: 'Trivedi', email: 'sakshi.trivedi@example.com' },
  { first: 'Manish', last: 'Choudhary', email: 'manish.choudhary@example.com' },
  { first: 'Aarti', last: 'Kapoor', email: 'aarti.kapoor@example.com' },
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
  console.log('🚀 Starting customers and orders seeding...\n');

  try {
    // 1. Get all existing products
    console.log('📦 Fetching products...');
    const products = await prisma.products.findMany({
      where: { status: 'active' }
    });
    
    if (products.length === 0) {
      console.error('❌ No products found. Please run seedDatabase.js first.');
      return;
    }
    
    console.log(`✅ Found ${products.length} products\n`);

    // 2. Create Customers
    console.log('👥 Creating customers...');
    const hashedPassword = await bcrypt.hash('customer123', 10);
    const customers = [];
    
    for (const customerInfo of customerNames) {
      try {
        const user = await prisma.users.create({
          data: {
            email: customerInfo.email,
            password_hash: hashedPassword,
            first_name: customerInfo.first,
            last_name: customerInfo.last,
            role: 'customer',
            is_active: true,
          }
        });
        customers.push(user);
        if (customers.length % 10 === 0) {
          console.log(`   Created ${customers.length} customers...`);
        }
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

    // Create 200+ orders spread over the last 90 days
    const daysBack = 90;
    for (let i = 0; i < 200; i++) {
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
        const itemTotal = Number(product.price) * quantity;
        orderTotal += itemTotal;
        return {
          product_id: product.id,
          product_name: product.name,
          quantity,
          unit_price: product.price,
          total_price: itemTotal,
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
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

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
            order_items: {
              create: orderItems
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
    console.log('✨ SEEDING COMPLETED! ✨');
    console.log('═══════════════════════════════════════');
    console.log(`📦 Products: ${products.length}`);
    console.log(`👥 Customers: ${customers.length}`);
    console.log(`🛒 Orders: ${orderCount}`);
    console.log(`💰 Total Revenue: ₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);
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
