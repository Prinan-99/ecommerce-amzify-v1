import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testConnection() {
  console.log('🔍 Testing Render database connection...');
  console.log('📍 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
  
  const timeout = setTimeout(() => {
    console.log('❌ Connection timeout after 10 seconds');
    process.exit(1);
  }, 10000);

  try {
    await prisma.$connect();
    clearTimeout(timeout);
    console.log('✅ Successfully connected to database!');
    
    const userCount = await prisma.users.count();
    console.log(`📊 Current users in database: ${userCount}`);
    
    await prisma.$disconnect();
    console.log('👋 Disconnected successfully');
  } catch (error) {
    clearTimeout(timeout);
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
