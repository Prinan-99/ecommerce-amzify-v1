/**
 * Database Connection Handler with Fallback
 * Attempts to connect to real database, falls back to mock DB if unavailable
 */

import { PrismaClient } from '@prisma/client';
import mockDb from './mockDb.js';

let isUsingMockDb = false;
let prisma = null;

const initializeDatabase = async () => {
  try {
    prisma = new PrismaClient({
      errorFormat: 'colorless',
    });

    // Test connection
    await prisma.$executeRawUnsafe('SELECT 1');
    console.log('✅ Connected to PostgreSQL database');
    isUsingMockDb = false;
    return prisma;
  } catch (error) {
    console.warn('⚠️  PostgreSQL connection failed:', error.message);
    console.warn('📦 Falling back to mock database for development');
    isUsingMockDb = true;
    await mockDb.connect();
    return mockDb;
  }
};

export const getDatabase = async () => {
  if (!prisma && !isUsingMockDb) {
    return await initializeDatabase();
  }
  return prisma || mockDb;
};

export const isUsingMock = () => isUsingMockDb;

export default initializeDatabase;
