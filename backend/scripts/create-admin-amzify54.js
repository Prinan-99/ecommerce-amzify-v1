import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user with amzify54@gmail.com...\n');

    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = await prisma.users.upsert({
      where: { email: 'amzify54@gmail.com' },
      update: {
        password_hash: hashedPassword,
        role: 'admin',
        is_verified: true,
        is_active: true,
        first_name: 'Admin',
        last_name: 'User'
      },
      create: {
        email: 'amzify54@gmail.com',
        password_hash: hashedPassword,
        role: 'admin',
        first_name: 'Admin',
        last_name: 'User',
        phone: '+919876543210',
        is_verified: true,
        is_active: true
      }
    });

    console.log('✅ Admin user created/updated successfully!');
    console.log('━'.repeat(50));
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123');
    console.log('👤 Role:', admin.role);
    console.log('━'.repeat(50));

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdmin();
