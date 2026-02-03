/**
 * Database Initialization with Mock Fallback
 * This module handles connecting to the database or using mock data
 */

import prismaModule from '../generated/prisma/index.js';
const { PrismaClient } = prismaModule;

let prisma = null;
let isMocked = false;

const mockPrisma = {
  $disconnect: async () => {},
  $connect: async () => {},
  products: {
    findMany: async () => [],
    findUnique: async () => null,
    count: async () => 0,
  },
  users: {
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    create: async (data) => ({ ...data.data, id: 'mock-id' }),
    update: async (data) => ({ ...data.data, id: 'mock-id' }),
  },
  categories: {
    findMany: async () => [],
    findUnique: async () => null,
  },
  cart_items: {
    findMany: async () => [],
    create: async (data) => data.data,
    delete: async () => ({}),
  },
  orders: {
    findMany: async () => [],
    create: async (data) => data.data,
  },
};

export const initPrisma = async () => {
  try {
    prisma = new PrismaClient({
      errorFormat: 'minimal',
      log: [],
    });

    // Test connection with a simple query
    await prisma.$executeRawUnsafe('SELECT 1');
    console.log('✅ Connected to PostgreSQL database');
    isMocked = false;
    return prisma;
  } catch (error) {
    console.warn('⚠️  Database connection failed:', error.message.split('\n')[0]);
    console.warn('📦 Running in MOCK MODE - database features will use sample data');
    isMocked = true;
    return mockPrisma;
  }
};

export const getPrisma = () => {
  if (!prisma) {
    console.warn('⚠️  Prisma not initialized, using mock data');
    return mockPrisma;
  }
  return prisma;
};

export const isMockMode = () => isMocked;

export default initPrisma;
