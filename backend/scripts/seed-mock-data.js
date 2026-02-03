import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { mockUserStore } from '../services/mockUserStore.js';

const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Jessica', 'Robert', 'Amanda', 'Chris', 'Maria'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor'];
const companyNames = ['TechVision Store', 'FashionHub Pro', 'HomeStyle Shop', 'SportsGear Co', 'DigitalPro Store', 'StyleWorks', 'HomeComfort Plus', 'ActiveLife Gear'];

const randomPhone = () => `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`;

async function seedMockData() {
  try {
    console.log('🌱 Seeding mock database with initial user and seller data...\n');

    // Seed Users
    console.log('👥 Creating customer users...');
    const users = [];
    for (let i = 0; i < 8; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@customer.amzify.com`;
      
      const user = {
        id: `user-${Date.now()}-${i}`,
        email,
        role: 'customer',
        first_name: firstName,
        last_name: lastName,
        phone: randomPhone(),
        is_verified: Math.random() > 0.3,
        is_active: true,
        password_hash: await bcrypt.hash('Customer@123', 10)
      };

      await mockUserStore.upsertUser(user);
      users.push(user);
      console.log(`  ✅ ${email}`);
    }

    // Seed Sellers
    console.log('\n🏪 Creating seller accounts...');
    const sellers = [];
    for (let i = 0; i < 6; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@seller.amzify.com`;
      const company = companyNames[Math.floor(Math.random() * companyNames.length)];
      
      const seller = {
        id: `seller-${Date.now()}-${i}`,
        email,
        role: 'seller',
        first_name: firstName,
        last_name: lastName,
        phone: randomPhone(),
        is_verified: true,
        is_active: true,
        company_name: company,
        seller_approved: true,
        password_hash: await bcrypt.hash('Seller@123', 10)
      };

      await mockUserStore.upsertUser(seller);
      sellers.push(seller);
      console.log(`  ✅ ${email} (${company})`);
    }

    // Create Admin seed data (backup)
    console.log('\n👨‍💼 Creating admin account...');
    const admin = {
      id: 'admin-001',
      email: 'amzify54@gmail.com',
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      phone: randomPhone(),
      is_verified: true,
      is_active: true,
      password_hash: await bcrypt.hash('admin123', 10)
    };

    await mockUserStore.upsertUser(admin);
    console.log(`  ✅ amzify54@gmail.com`);

    console.log('\n' + '='.repeat(50));
    console.log('✨ Mock Database Seeding Complete!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`  • ${users.length} Customer accounts created`);
    console.log(`  • ${sellers.length} Seller accounts created`);
    console.log(`  • 1 Admin account created`);
    console.log(`  • Total: ${users.length + sellers.length + 1} users\n`);
    
    console.log('🔐 Default Passwords:');
    console.log('  • Customers: Customer@123');
    console.log('  • Sellers: Seller@123');
    console.log('  • Admin: admin123\n');

    console.log('📝 Sample Credentials:');
    console.log('  Admin:');
    console.log('    Email: amzify54@gmail.com');
    console.log('    Password: admin123\n');
    console.log('  Sample Customer:');
    console.log(`    Email: ${users[0].email}`);
    console.log('    Password: Customer@123\n');
    console.log('  Sample Seller:');
    console.log(`    Email: ${sellers[0].email}`);
    console.log('    Password: Seller@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
}

seedMockData();
