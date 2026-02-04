import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'mock-users.json');

const ensureDataFile = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch {
    const seedUsers = [
      {
        id: `mock-admin-${Date.now()}`,
        email: 'amzify54@gmail.com',
        role: 'admin',
        first_name: 'Admin',
        last_name: 'User',
        phone: null,
        is_verified: true,
        is_active: true,
        company_name: null,
        seller_approved: false,
        password_hash: bcrypt.hashSync('admin123', 10)
      },
      {
        id: `mock-seller-${Date.now() + 1}`,
        email: 'seller@amzify.com',
        role: 'seller',
        first_name: 'Seller',
        last_name: 'User',
        phone: null,
        is_verified: true,
        is_active: true,
        company_name: 'Mock Seller Co.',
        seller_approved: true,
        password_hash: bcrypt.hashSync('seller123', 10)
      },
      {
        id: `mock-customer-${Date.now() + 2}`,
        email: 'customer@amzify.com',
        role: 'customer',
        first_name: 'Customer',
        last_name: 'User',
        phone: null,
        is_verified: true,
        is_active: true,
        company_name: null,
        seller_approved: false,
        password_hash: bcrypt.hashSync('customer123', 10)
      }
    ];
    await fs.writeFile(DATA_FILE, JSON.stringify(seedUsers, null, 2));
  }
};

const readUsers = async () => {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
};

const writeUsers = async (users) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
};

export const mockUserStore = {
  async getUsers() {
    return readUsers();
  },
  async findByEmail(email) {
    const users = await readUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  async findById(id) {
    const users = await readUsers();
    return users.find((u) => u.id === id) || null;
  },
  async addUser(user) {
    const users = await readUsers();
    users.push(user);
    await writeUsers(users);
    return user;
  },
  async upsertUser(user) {
    const users = await readUsers();
    const index = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    await writeUsers(users);
    return user;
  }
};
