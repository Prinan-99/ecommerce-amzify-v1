import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...');
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.users.upsert({
      where: { email: 'admin@amzify.com' },
      update: {},
      create: {
        email: 'admin@amzify.com',
        password_hash: hashedPassword,
        role: 'admin',
        first_name: 'Super',
        last_name: 'Admin',
        phone: '+91-9876543210',
        is_verified: true,
        is_active: true,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@amzify.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
