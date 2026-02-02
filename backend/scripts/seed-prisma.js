import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Create admin
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.users.upsert({
      where: { email: 'admin@amzify.com' },
      update: {},
      create: {
        email: 'admin@amzify.com',
        password_hash: adminPassword,
        role: 'admin',
        first_name: 'Super',
        last_name: 'Admin',
        phone: '+91-9876543210',
        is_verified: true,
        is_active: true
      }
    });
    console.log('✅ Admin created');

    // Create customers
    const customerPassword = await bcrypt.hash('customer123', 12);
    const customer = await prisma.users.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        email: 'customer@example.com',
        password_hash: customerPassword,
        role: 'customer',
        first_name: 'Jane',
        last_name: 'Customer',
        phone: '+91-9876543214',
        is_verified: true,
        is_active: true
      }
    });
    console.log('✅ Customer created');

    // Create seller
    const sellerPassword = await bcrypt.hash('seller123', 12);
    const seller = await prisma.users.upsert({
      where: { email: 'seller@example.com' },
      update: {},
      create: {
        email: 'seller@example.com',
        password_hash: sellerPassword,
        role: 'seller',
        first_name: 'John',
        last_name: 'Seller',
        phone: '+91-9876543211',
        is_verified: true,
        is_active: true
      }
    });

    // Create seller profile
    const existingProfile = await prisma.seller_profiles.findFirst({
      where: { user_id: seller.id }
    });

    if (!existingProfile) {
      await prisma.seller_profiles.create({
        data: {
          user_id: seller.id,
          company_name: 'Acme Electronics Inc',
          business_type: 'Electronics',
          description: 'Premium electronics retailer',
          is_approved: true,
          commission_rate: '0.15'
        }
      });
    }
    console.log('✅ Seller created');

    // Create categories
    const electronics = await prisma.categories.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets'
      }
    });

    const fashion = await prisma.categories.upsert({
      where: { slug: 'fashion' },
      update: {},
      create: {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Clothing and accessories'
      }
    });
    console.log('✅ Categories created');

    // Create products
    await prisma.products.upsert({
      where: { slug: 'wireless-headphones' },
      update: {},
      create: {
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'Premium wireless headphones with noise cancellation',
        short_description: 'High-quality sound',
        price: '24999',
        compare_price: '29999',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
        stock_quantity: 45,
        is_featured: true,
        status: 'active',
        category_id: electronics.id,
        seller_id: seller.id
      }
    });

    await prisma.products.upsert({
      where: { slug: 'leather-jacket' },
      update: {},
      create: {
        name: 'Leather Jacket',
        slug: 'leather-jacket',
        description: 'Stylish genuine leather jacket',
        short_description: 'Premium quality',
        price: '14999',
        compare_price: '19999',
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'],
        stock_quantity: 20,
        is_featured: true,
        status: 'active',
        category_id: fashion.id,
        seller_id: seller.id
      }
    });
    console.log('✅ Products created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@amzify.com / admin123');
    console.log('Customer: customer@example.com / customer123');
    console.log('Seller: seller@example.com / seller123');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
