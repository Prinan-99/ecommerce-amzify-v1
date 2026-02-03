import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `AMZ${timestamp.slice(-6)}${random}`;
};

const sampleCustomers = [
  {
    email: 'customer@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+91 98765 43210'
  },
  {
    email: 'jane.smith@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    phone: '+91 98765 43211'
  },
  {
    email: 'mike.johnson@example.com',
    first_name: 'Mike',
    last_name: 'Johnson',
    phone: '+91 98765 43212'
  },
  {
    email: 'sarah.williams@example.com',
    first_name: 'Sarah',
    last_name: 'Williams',
    phone: '+91 98765 43213'
  },
  {
    email: 'david.brown@example.com',
    first_name: 'David',
    last_name: 'Brown',
    phone: '+91 98765 43214'
  }
];

const shippingAddresses = [
  {
    street_address: '123 MG Road',
    city: 'Bangalore',
    state: 'Karnataka',
    postal_code: '560001',
    country: 'India'
  },
  {
    street_address: '456 Park Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400001',
    country: 'India'
  },
  {
    street_address: '789 Anna Salai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postal_code: '600002',
    country: 'India'
  },
  {
    street_address: '321 Nehru Place',
    city: 'New Delhi',
    state: 'Delhi',
    postal_code: '110019',
    country: 'India'
  },
  {
    street_address: '654 FC Road',
    city: 'Pune',
    state: 'Maharashtra',
    postal_code: '411004',
    country: 'India'
  }
];

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentMethods = ['cod', 'upi', 'card'];
const paymentStatuses = ['pending', 'paid', 'failed'];

async function addSampleOrders() {
  try {
    console.log('🚀 Starting to create sample orders...\n');

    // Get seller and their products
    const seller = await prisma.users.findFirst({
      where: {
        email: 'seller@example.com',
        role: 'seller'
      }
    });

    if (!seller) {
      console.error('❌ Seller not found. Please ensure seller@example.com exists.');
      process.exit(1);
    }

    const products = await prisma.products.findMany({
      where: {
        seller_id: seller.id,
        status: 'active'
      },
      take: 10
    });

    if (products.length === 0) {
      console.error('❌ No active products found for seller. Please add products first.');
      process.exit(1);
    }

    console.log(`✅ Found seller: ${seller.email}`);
    console.log(`✅ Found ${products.length} active products\n`);

    // Get or create customer users
    const customers = [];
    for (const customerData of sampleCustomers) {
      let customer = await prisma.users.findUnique({
        where: { email: customerData.email }
      });

      if (!customer) {
        // Create customer if doesn't exist
        customer = await prisma.users.create({
          data: {
            email: customerData.email,
            password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // Dummy hash
            first_name: customerData.first_name,
            last_name: customerData.last_name,
            phone: customerData.phone,
            role: 'customer',
            email_verified: true
          }
        });
        console.log(`✅ Created customer: ${customer.email}`);
      }
      customers.push(customer);
    }

    console.log(`\n📦 Creating 15 sample orders...\n`);

    // Create 15 sample orders
    for (let i = 0; i < 15; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const shippingAddress = shippingAddresses[Math.floor(Math.random() * shippingAddresses.length)];
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const paymentStatus = status === 'delivered' ? 'paid' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

      // Select random 1-3 products for this order
      const numItems = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      for (let j = 0; j < numItems; j++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        if (!selectedProducts.find(p => p.id === randomProduct.id)) {
          selectedProducts.push(randomProduct);
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

      // Create random date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
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
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
          notes: i % 3 === 0 ? 'Please deliver before 6 PM' : null,
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

      console.log(`✅ [${i + 1}/15] Order #${order.order_number} - ${status.toUpperCase()} - ₹${totalAmount.toFixed(2)} - ${customer.first_name} ${customer.last_name}`);
    }

    console.log('\n✨ Successfully created 15 sample orders!');
    console.log('🎉 Refresh your seller panel to see the orders!\n');

  } catch (error) {
    console.error('\n❌ Error creating sample orders:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleOrders();
