import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestSeller() {
  try {
    const email = 'seller@example.com';
    const password = 'seller123';
    
    console.log('=== Creating/Updating Test Seller ===');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('');
    
    // Check if user exists
    let user = await prisma.users.findUnique({
      where: { email },
      include: { seller_profiles: true }
    });
    
    if (user) {
      console.log('✓ User already exists');
      
      // Update password if user exists
      const passwordHash = await bcrypt.hash(password, 12);
      user = await prisma.users.update({
        where: { id: user.id },
        data: {
          password_hash: passwordHash,
          role: 'seller',
          is_active: true
        },
        include: { seller_profiles: true }
      });
      
      console.log('✓ Password updated');
      console.log('✓ Role set to seller');
      console.log('✓ Account activated');
      
      // Check/create seller profile
      if (user.seller_profiles.length === 0) {
        console.log('Creating seller profile...');
        await prisma.seller_profiles.create({
          data: {
            user_id: user.id,
            company_name: 'Test Store',
            business_type: 'Retail',
            description: 'Test seller account',
            is_approved: true,
            approval_date: new Date(),
            commission_rate: 0.15
          }
        });
        console.log('✓ Seller profile created and approved');
      } else {
        // Update existing profile to be approved
        await prisma.seller_profiles.update({
          where: { id: user.seller_profiles[0].id },
          data: {
            is_approved: true,
            approval_date: new Date()
          }
        });
        console.log('✓ Seller profile approved');
      }
    } else {
      console.log('Creating new seller user...');
      
      // Create new user with seller profile
      const passwordHash = await bcrypt.hash(password, 12);
      
      user = await prisma.users.create({
        data: {
          email,
          password_hash: passwordHash,
          role: 'seller',
          first_name: 'Test',
          last_name: 'Seller',
          phone: '1234567890',
          is_verified: true,
          is_active: true,
          seller_profiles: {
            create: {
              company_name: 'Test Store',
              business_type: 'Retail',
              description: 'Test seller account',
              is_approved: true,
              approval_date: new Date(),
              commission_rate: 0.15
            }
          }
        },
        include: { seller_profiles: true }
      });
      
      console.log('✓ New seller created');
      console.log('✓ Seller profile created and approved');
    }
    
    console.log('');
    console.log('=== SUCCESS ===');
    console.log('Test seller is ready to use!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Seller Approved:', user.seller_profiles[0]?.is_approved);
    
  } catch (error) {
    console.error('Error creating test seller:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSeller();
