import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkPassword() {
  try {
    const user = await prisma.users.findUnique({
      where: { email: 'seller@example.com' },
      select: {
        id: true,
        email: true,
        password_hash: true,
        role: true,
        is_active: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('User found:');
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Active:', user.is_active);
    console.log('  Password hash:', user.password_hash);
    console.log('');
    
    const testPassword = 'seller123';
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    
    console.log('Password test:');
    console.log('  Testing password:', testPassword);
    console.log('  Match:', isValid ? '✅ YES' : '❌ NO');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword();
