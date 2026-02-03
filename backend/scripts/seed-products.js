import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

const productData = [
  {
    name: 'Professional Camera 4K',
    description: 'Ultra HD 4K camera with advanced features for professional photography',
    short_description: 'Pro 4K camera with AI features',
    price: 1299.99,
    compare_price: 1599.99,
    sku: 'CAM-001',
    images: [
      'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1606933248051-5ce98a1fcf00?w=500&h=500&fit=crop'
    ],
    stock_quantity: 45,
    category: 'Electronics',
    seller: 0, // TechVision Store
  },
  {
    name: 'Wireless Headphones Pro',
    description: 'Noise-cancelling wireless headphones with 40-hour battery life',
    short_description: 'Premium wireless headphones with ANC',
    price: 399.99,
    compare_price: 499.99,
    sku: 'HEAD-001',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'
    ],
    stock_quantity: 120,
    category: 'Electronics',
    seller: 0, // TechVision Store
  },
  {
    name: 'Smartwatch Ultra',
    description: 'Advanced smartwatch with health monitoring and fitness tracking',
    short_description: 'All-in-one smartwatch for fitness',
    price: 599.99,
    compare_price: 799.99,
    sku: 'WATCH-001',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'
    ],
    stock_quantity: 89,
    category: 'Electronics',
    seller: 0, // TechVision Store
  },
  {
    name: 'Casual Cotton T-Shirt',
    description: '100% organic cotton t-shirt, comfortable for daily wear',
    short_description: 'Premium casual t-shirt',
    price: 29.99,
    compare_price: 49.99,
    sku: 'TEE-001',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop'
    ],
    stock_quantity: 250,
    category: 'Fashion',
    seller: 1, // FashionHub Pro
  },
  {
    name: 'Denim Jeans Classic',
    description: 'Classic blue denim jeans with perfect fit and durability',
    short_description: 'Classic fit denim jeans',
    price: 79.99,
    compare_price: 119.99,
    sku: 'JEAN-001',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop'
    ],
    stock_quantity: 180,
    category: 'Fashion',
    seller: 1, // FashionHub Pro
  },
  {
    name: 'Summer Dress',
    description: 'Light and breezy summer dress perfect for warm weather',
    short_description: 'Elegant summer dress',
    price: 59.99,
    compare_price: 99.99,
    sku: 'DRESS-001',
    images: [
      'https://images.unsplash.com/photo-1595777707802-221b1eca1dd8?w=500&h=500&fit=crop'
    ],
    stock_quantity: 95,
    category: 'Fashion',
    seller: 1, // FashionHub Pro
  },
  {
    name: 'Wooden Coffee Table',
    description: 'Modern design wooden coffee table with sleek finishing',
    short_description: 'Modern wooden coffee table',
    price: 299.99,
    compare_price: 449.99,
    sku: 'TABLE-001',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop'
    ],
    stock_quantity: 40,
    category: 'Home',
    seller: 2, // HomeStyle Shop
  },
  {
    name: 'LED Table Lamp',
    description: 'Energy-efficient LED lamp with adjustable brightness',
    short_description: 'Smart LED table lamp',
    price: 49.99,
    compare_price: 79.99,
    sku: 'LAMP-001',
    images: [
      'https://images.unsplash.com/photo-1565159664535-e3997f47b550?w=500&h=500&fit=crop'
    ],
    stock_quantity: 150,
    category: 'Home',
    seller: 2, // HomeStyle Shop
  },
  {
    name: 'Bed Sheets Set',
    description: 'Premium cotton bed sheets set with Egyptian quality',
    short_description: 'Egyptian cotton bed sheets',
    price: 89.99,
    compare_price: 149.99,
    sku: 'SHEET-001',
    images: [
      'https://images.unsplash.com/photo-1522708328590-4f4ee5dadc4c?w=500&h=500&fit=crop'
    ],
    stock_quantity: 200,
    category: 'Home',
    seller: 2, // HomeStyle Shop
  },
  {
    name: 'Running Shoes Pro',
    description: 'Professional running shoes with cushioning technology',
    short_description: 'Advanced running shoes',
    price: 129.99,
    compare_price: 179.99,
    sku: 'SHOE-001',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'
    ],
    stock_quantity: 110,
    category: 'Sports',
    seller: 3, // SportsGear Co
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat perfect for all fitness levels',
    short_description: 'Premium yoga mat',
    price: 39.99,
    compare_price: 69.99,
    sku: 'MAT-001',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop'
    ],
    stock_quantity: 220,
    category: 'Sports',
    seller: 3, // SportsGear Co
  },
  {
    name: 'Dumbbell Set',
    description: 'Complete dumbbell set with weights from 5kg to 25kg',
    short_description: 'Complete dumbbell set',
    price: 199.99,
    compare_price: 299.99,
    sku: 'DUMB-001',
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop'
    ],
    stock_quantity: 65,
    category: 'Sports',
    seller: 3, // SportsGear Co
  },
];

const categoryMap = {
  'Electronics': null,
  'Fashion': null,
  'Home': null,
  'Sports': null,
};

const sellerIds = [];

async function seedProducts() {
  try {
    console.log('🌱 Starting products seeding...\n');

    // Get all categories
    console.log('📂 Fetching categories...');
    for (const catName of Object.keys(categoryMap)) {
      const cat = await prisma.categories.findFirst({
        where: { name: catName }
      });
      if (cat) {
        categoryMap[catName] = cat.id;
        console.log(`  ✅ ${catName}: ${cat.id}`);
      }
    }

    // Get all sellers
    console.log('\n👥 Fetching sellers...');
    const sellers = await prisma.users.findMany({
      where: { role: 'seller' },
      take: 4
    });

    if (sellers.length === 0) {
      console.log('❌ No sellers found in database. Please create sellers first.');
      await prisma.$disconnect();
      process.exit(1);
    }

    sellers.forEach((seller, idx) => {
      sellerIds.push(seller.id);
      console.log(`  ✅ Seller ${idx}: ${seller.first_name} ${seller.last_name} (${seller.id})`);
    });

    // Seed products
    console.log('\n📦 Creating products...');
    let createdCount = 0;

    for (const product of productData) {
      const categoryId = categoryMap[product.category];
      const sellerId = sellerIds[product.seller];

      if (!categoryId) {
        console.log(`  ⚠️  Skipping "${product.name}" - category not found`);
        continue;
      }

      if (!sellerId) {
        console.log(`  ⚠️  Skipping "${product.name}" - seller not found`);
        continue;
      }

      const created = await prisma.products.upsert({
        where: { sku: product.sku },
        update: {},
        create: {
          name: product.name,
          slug: product.name.toLowerCase().replace(/\s+/g, '-'),
          description: product.description,
          short_description: product.short_description,
          price: product.price,
          compare_price: product.compare_price,
          sku: product.sku,
          images: product.images,
          stock_quantity: product.stock_quantity,
          status: 'active',
          is_featured: Math.random() > 0.6,
          category_id: categoryId,
          seller_id: sellerId,
        }
      });

      console.log(`  ✅ ${product.name}`);
      createdCount++;
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Products Seeding Complete!');
    console.log('='.repeat(50));
    console.log(`\n📊 Summary: ${createdCount} products created\n`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedProducts();
