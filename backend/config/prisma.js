import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  console.log('🔌 Disconnecting from database...');
  await prisma.$disconnect();
});

export default prisma;