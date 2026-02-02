import 'dotenv/config';
import prisma from '../config/prisma.js';

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');
    
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        first_name: true,
        last_name: true,
        is_verified: true,
        is_active: true
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('Run: npm run seed');
    } else {
      console.log(`✅ Found ${users.length} users:\n`);
      users.forEach(user => {
        console.log(`${user.email} (${user.role}) - ${user.first_name} ${user.last_name}`);
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
