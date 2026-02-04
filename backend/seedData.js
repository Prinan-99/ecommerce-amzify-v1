import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('🌱 Starting data seeding...');

    // Create test seller
    const seller = await prisma.users.upsert({
      where: { email: 'seller1@example.com' },
      update: {},
      create: {
        email: 'seller1@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        role: 'seller',
        first_name: 'John',
        last_name: 'Smith',
        phone: '+1234567890',
        is_active: true,
        is_verified: true,
      },
    });
    console.log('✓ Seller created:', seller.id);

    // Create seller profile
    await prisma.seller_profiles.upsert({
      where: { user_id: seller.id },
      update: {},
      create: {
        user_id: seller.id,
        company_name: 'Smith Electronics',
        is_approved: true,
      },
    });
    console.log('✓ Seller profile created');

    // Create category
    const category = await prisma.categories.create({
      data: {
        name: 'Electronics',
      },
    }).catch(() => 
      prisma.categories.findFirst({ where: { name: 'Electronics' } })
    );
    console.log('✓ Category created/found:', category.id);

    // Create products
    const products = await Promise.all([
      prisma.products.create({
        data: {
          seller_id: seller.id,
          category_id: category.id,
          name: 'Wireless Headphones',
          slug: 'wireless-headphones',
          description: 'Premium wireless headphones with noise cancellation',
          price: 199.99,
          cost_price: 80,
          sku: 'WH-001',
          stock_quantity: 50,
          status: 'active',
        },
      }),
      prisma.products.create({
        data: {
          seller_id: seller.id,
          category_id: category.id,
          name: 'USB-C Cable',
          slug: 'usb-c-cable',
          description: 'Fast charging USB-C cable',
          price: 24.99,
          cost_price: 5,
          sku: 'USC-002',
          stock_quantity: 200,
          status: 'active',
        },
      }),
      prisma.products.create({
        data: {
          seller_id: seller.id,
          category_id: category.id,
          name: 'Bluetooth Speaker',
          slug: 'bluetooth-speaker',
          description: 'Portable Bluetooth speaker',
          price: 79.99,
          cost_price: 30,
          sku: 'BS-003',
          stock_quantity: 30,
          status: 'active',
        },
      }),
    ]);
    console.log('✓ Products created:', products.map(p => p.id));

    // Create test customer
    const customer = await prisma.users.upsert({
      where: { email: 'customer1@example.com' },
      update: {},
      create: {
        email: 'customer1@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        role: 'customer',
        first_name: 'Alice',
        last_name: 'Johnson',
        is_active: true,
        is_verified: true,
      },
    });
    console.log('✓ Customer created:', customer.id);

    // Create orders
    const orders = await Promise.all([
      prisma.orders.create({
        data: {
          customer_id: customer.id,
          order_number: `ORD-${Date.now()}`,
          status: 'completed',
          subtotal: 199.99,
          tax_amount: 20,
          shipping_amount: 10,
          total_amount: 229.99,
          payment_status: 'paid',
          payment_method: 'credit_card',
        },
      }),
      prisma.orders.create({
        data: {
          customer_id: customer.id,
          order_number: `ORD-${Date.now() + 1}`,
          status: 'completed',
          subtotal: 149.97,
          tax_amount: 15,
          shipping_amount: 10,
          total_amount: 174.97,
          payment_status: 'paid',
          payment_method: 'credit_card',
        },
      }),
      prisma.orders.create({
        data: {
          customer_id: customer.id,
          order_number: `ORD-${Date.now() + 2}`,
          status: 'completed',
          subtotal: 79.99,
          tax_amount: 8,
          shipping_amount: 10,
          total_amount: 97.99,
          payment_status: 'paid',
          payment_method: 'credit_card',
        },
      }),
    ]);
    console.log('✓ Orders created:', orders.map(o => o.id));

    // Create order items
    await Promise.all([
      prisma.order_items.create({
        data: {
          order_id: orders[0].id,
          product_id: products[0].id,
          seller_id: seller.id,
          product_name: 'Wireless Headphones',
          product_sku: 'WH-001',
          quantity: 1,
          unit_price: 199.99,
          total_price: 199.99,
        },
      }),
      prisma.order_items.create({
        data: {
          order_id: orders[1].id,
          product_id: products[1].id,
          seller_id: seller.id,
          product_name: 'USB-C Cable',
          product_sku: 'USC-002',
          quantity: 3,
          unit_price: 24.99,
          total_price: 74.97,
        },
      }),
      prisma.order_items.create({
        data: {
          order_id: orders[1].id,
          product_id: products[2].id,
          seller_id: seller.id,
          product_name: 'Bluetooth Speaker',
          product_sku: 'BS-003',
          quantity: 1,
          unit_price: 79.99,
          total_price: 79.99,
        },
      }),
      prisma.order_items.create({
        data: {
          order_id: orders[2].id,
          product_id: products[2].id,
          seller_id: seller.id,
          product_name: 'Bluetooth Speaker',
          product_sku: 'BS-003',
          quantity: 1,
          unit_price: 79.99,
          total_price: 79.99,
        },
      }),
    ]);
    console.log('✓ Order items created');

    console.log('✅ Data seeding completed successfully!');
    console.log('\n📊 Test Credentials:');
    console.log('  Email: seller1@example.com');
    console.log('  Password: password123');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
