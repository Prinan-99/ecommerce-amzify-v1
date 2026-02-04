import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

const categoriesData = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices and gadgets'
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing and fashion items'
  },
  {
    name: 'Home',
    slug: 'home',
    description: 'Home furnishings and decor'
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Sports and fitness equipment'
  }
];

async function seedCategories() {
  try {
    console.log('🌱 Creating categories...\n');

    for (const cat of categoriesData) {
      await prisma.categories.upsert({
        where: { slug: cat.slug },
        update: {},
        create: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description
        }
      });

      console.log(`✅ ${cat.name}`);
    }

    console.log('\n✨ Categories created!');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedCategories();
