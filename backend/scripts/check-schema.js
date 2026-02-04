import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkSchema() {
  try {
    // Check categories table structure
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'categories'
      ORDER BY ordinal_position;
    `;
    console.log('Categories table columns:');
    console.log(result);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
