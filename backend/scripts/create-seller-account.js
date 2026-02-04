import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSellerAccount() {
  console.log('🔐 Creating seller account...');
  
  try {
    // Check if seller already exists
    const existingSeller = await prisma.users.findFirst({
      where: { email: 'seller@example.com' }
    });

    if (existingSeller) {
      console.log('✅ Seller account already exists!');
      console.log('📧 Email:', existingSeller.email);
      console.log('👤 Role:', existingSeller.role);
      console.log('✓ Verified:', existingSeller.is_verified);
      return;
    }

    // Create new seller account
    const hashedPassword = await bcrypt.hash('seller123', 12);
    
    const seller = await prisma.users.create({
      data: {
        email: 'seller@example.com',
        password_hash: hashedPassword,
        first_name: 'Amzify',
        last_name: 'Seller',
        phone: '+91 99999 99999',
        role: 'seller',
        is_verified: true
      }
    });

    console.log('✅ Seller account created successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    seller@example.com');
    console.log('🔑 Password: seller123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎯 You can now login to the Seller Panel!');

  } catch (error) {
    console.error('❌ Error creating seller account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSellerAccount();
