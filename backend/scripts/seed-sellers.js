import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const sellersData = [
  {
    email: 'tech.vision@seller.com',
    first_name: 'Tech',
    last_name: 'Vision',
    phone: '+91-9876543210',
    company_name: 'TechVision Store',
    business_type: 'Electronics Retailer',
    description: 'Leading electronics retailer with quality products'
  },
  {
    email: 'fashion.hub@seller.com',
    first_name: 'Fashion',
    last_name: 'Hub',
    phone: '+91-9876543211',
    company_name: 'FashionHub Pro',
    business_type: 'Fashion Retailer',
    description: 'Premium fashion and apparel brand'
  },
  {
    email: 'home.style@seller.com',
    first_name: 'Home',
    last_name: 'Style',
    phone: '+91-9876543212',
    company_name: 'HomeStyle Shop',
    business_type: 'Home Decor',
    description: 'Modern home furnishings and decor'
  },
  {
    email: 'sports.gear@seller.com',
    first_name: 'Sports',
    last_name: 'Gear',
    phone: '+91-9876543213',
    company_name: 'SportsGear Co',
    business_type: 'Sports Equipment',
    description: 'Quality sports and fitness equipment'
  }
];

async function seedSellers() {
  try {
    console.log('🌱 Creating seller accounts...\n');

    for (const seller of sellersData) {
      const hashedPassword = await bcrypt.hash('Seller@123', 12);

      const createdSeller = await prisma.users.upsert({
        where: { email: seller.email },
        update: {},
        create: {
          email: seller.email,
          password_hash: hashedPassword,
          role: 'seller',
          first_name: seller.first_name,
          last_name: seller.last_name,
          phone: seller.phone,
          is_verified: true,
          is_active: true,
          seller_profiles: {
            create: {
              company_name: seller.company_name,
              business_type: seller.business_type,
              description: seller.description,
              business_address: '123 Business Street',
              city: 'Mumbai',
              state: 'Maharashtra',
              postal_code: '400001'
            }
          }
        },
        include: {
          seller_profiles: true
        }
      });

      console.log(`✅ ${seller.company_name} (${seller.email})`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Sellers Created Successfully!');
    console.log('='.repeat(50));
    console.log('\n📧 Seller Credentials:');
    console.log('  Password: Seller@123\n');
    sellersData.forEach((s, idx) => {
      console.log(`  ${idx + 1}. ${s.company_name}: ${s.email}`);
    });
    console.log();

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedSellers();
