import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Test connection (lazy - will connect on first query)
// prisma.$connect()
//   .then(() => console.log('✅ Connected to Render PostgreSQL database'))
//   .catch((err) => {
//     console.error('❌ Database connection error:', err.message);
//     console.error('Full error:', err);
//   });

// Handle graceful shutdown
process.on('beforeExit', async () => {
  console.log('🔌 Disconnecting from database...');
  await prisma.$disconnect();
});

export default prisma;