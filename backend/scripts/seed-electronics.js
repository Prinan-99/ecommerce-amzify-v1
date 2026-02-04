import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function seedElectronics() {
  try {
    console.log('🌱 Starting electronics products seeding...');

    // Find the seller user
    const seller = await prisma.users.findUnique({
      where: { email: 'customer@example.com' }
    });

    if (!seller) {
      console.error('❌ Seller not found with email: customer@example.com');
      return;
    }

    console.log(`✅ Found seller: ${seller.email} (ID: ${seller.id})`);

    // Find or create Electronics category
    let category = await prisma.categories.findFirst({
      where: {
        slug: 'electronics',
        seller_id: seller.id
      }
    });

    if (!category) {
      category = await prisma.categories.create({
        data: {
          name: 'Electronics',
          slug: 'electronics',
          seller_id: seller.id,
          description: 'Electronic devices and gadgets',
          is_active: true
        }
      });
      console.log('✅ Created Electronics category');
    } else {
      console.log('✅ Using existing Electronics category');
    }

    // Electronics products data
    const products = [
      {
        name: 'iPhone 15 Pro Max',
        slug: 'iphone-15-pro-max-' + Date.now(),
        description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Experience the power of Apple intelligence.',
        short_description: 'Premium flagship smartphone with cutting-edge features',
        price: 134900,
        compare_price: 149900,
        cost_price: 110000,
        sku: 'IP15PM-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 50,
        status: 'active',
        is_featured: true,
        seo_title: 'Buy iPhone 15 Pro Max - Latest Apple Smartphone',
        seo_description: 'Get the new iPhone 15 Pro Max with titanium design and A17 Pro chip',
        images: JSON.stringify(['https://images.unsplash.com/photo-1696446702061-cbd664c6ac50?w=500'])
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra-' + Date.now(),
        description: 'Powerful Android flagship with S Pen, 200MP camera, and AI features. The ultimate productivity and creativity device.',
        short_description: 'Top-tier Android smartphone with S Pen',
        price: 124900,
        compare_price: 134900,
        cost_price: 105000,
        sku: 'SGS24U-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 40,
        status: 'active',
        is_featured: true,
        seo_title: 'Samsung Galaxy S24 Ultra - Premium Android Phone',
        seo_description: 'Experience the power of Galaxy S24 Ultra with 200MP camera',
        images: JSON.stringify(['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'])
      },
      {
        name: 'Sony WH-1000XM5',
        slug: 'sony-wh1000xm5-' + Date.now(),
        description: 'Industry-leading noise cancelling headphones with exceptional sound quality. 30-hour battery life and premium comfort.',
        short_description: 'Premium noise-cancelling headphones',
        price: 29990,
        compare_price: 34990,
        cost_price: 22000,
        sku: 'SONY1000-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 100,
        status: 'active',
        is_featured: false,
        seo_title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
        seo_description: 'Best-in-class noise cancellation and premium audio quality',
        images: JSON.stringify(['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500'])
      },
      {
        name: 'MacBook Pro 16" M3 Max',
        slug: 'macbook-pro-16-m3-max-' + Date.now(),
        description: 'Professional laptop with M3 Max chip, Liquid Retina XDR display, and up to 22 hours battery life. Perfect for creative professionals.',
        short_description: 'High-performance laptop for professionals',
        price: 249900,
        compare_price: 279900,
        cost_price: 210000,
        sku: 'MBP16M3-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 25,
        status: 'active',
        is_featured: true,
        seo_title: 'MacBook Pro 16" with M3 Max Chip',
        seo_description: 'Ultimate performance laptop for creative professionals',
        images: JSON.stringify(['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'])
      },
      {
        name: 'iPad Pro 12.9" M2',
        slug: 'ipad-pro-129-m2-' + Date.now(),
        description: 'Powerful tablet with M2 chip and Liquid Retina XDR display. Perfect for creativity and productivity on the go.',
        short_description: 'Pro-level tablet with desktop-class performance',
        price: 109900,
        compare_price: 119900,
        cost_price: 85000,
        sku: 'IPADPM2-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 60,
        status: 'active',
        is_featured: true,
        seo_title: 'iPad Pro 12.9" with M2 Chip',
        seo_description: 'Most advanced iPad with M2 performance',
        images: JSON.stringify(['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500'])
      },
      {
        name: 'Dell XPS 15',
        slug: 'dell-xps-15-' + Date.now(),
        description: 'Premium Windows laptop with 13th Gen Intel Core i7, NVIDIA RTX 4060, and stunning OLED display.',
        short_description: 'Premium Windows laptop for creators',
        price: 189900,
        compare_price: 209900,
        cost_price: 155000,
        sku: 'DELLXPS-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 30,
        status: 'active',
        is_featured: false,
        seo_title: 'Dell XPS 15 - Premium Windows Laptop',
        seo_description: 'Powerful laptop with OLED display and RTX graphics',
        images: JSON.stringify(['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500'])
      },
      {
        name: 'Apple Watch Series 9',
        slug: 'apple-watch-series-9-' + Date.now(),
        description: 'Advanced smartwatch with health monitoring, fitness tracking, and seamless iPhone integration.',
        short_description: 'Premium smartwatch with health features',
        price: 42900,
        compare_price: 46900,
        cost_price: 35000,
        sku: 'AWS9-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 80,
        status: 'active',
        is_featured: false,
        seo_title: 'Apple Watch Series 9 - Smart Health Companion',
        seo_description: 'Track your health and fitness with Apple Watch',
        images: JSON.stringify(['https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500'])
      },
      {
        name: 'Samsung Galaxy Watch 6',
        slug: 'samsung-galaxy-watch-6-' + Date.now(),
        description: 'Feature-rich smartwatch with comprehensive health tracking, long battery life, and premium design.',
        short_description: 'Advanced Android smartwatch',
        price: 29990,
        compare_price: 34990,
        cost_price: 24000,
        sku: 'SGW6-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 70,
        status: 'active',
        is_featured: false,
        seo_title: 'Samsung Galaxy Watch 6 - Premium Smartwatch',
        seo_description: 'Track health and fitness with Galaxy Watch 6',
        images: JSON.stringify(['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500'])
      },
      {
        name: 'Sony A7 IV Camera',
        slug: 'sony-a7-iv-camera-' + Date.now(),
        description: 'Professional mirrorless camera with 33MP sensor, advanced autofocus, and 4K 60p video recording.',
        short_description: 'Professional mirrorless camera',
        price: 249900,
        compare_price: 269900,
        cost_price: 205000,
        sku: 'SONYA7-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 15,
        status: 'active',
        is_featured: true,
        seo_title: 'Sony A7 IV - Professional Mirrorless Camera',
        seo_description: 'Capture stunning photos and videos with Sony A7 IV',
        images: JSON.stringify(['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500'])
      },
      {
        name: 'Canon EOS R6 Mark II',
        slug: 'canon-eos-r6-mk2-' + Date.now(),
        description: 'Versatile full-frame mirrorless camera with 24MP sensor, exceptional low-light performance, and 4K video.',
        short_description: 'Full-frame mirrorless camera',
        price: 269900,
        compare_price: 289900,
        cost_price: 220000,
        sku: 'CANR6M2-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 12,
        status: 'active',
        is_featured: false,
        seo_title: 'Canon EOS R6 Mark II - Professional Camera',
        seo_description: 'Professional photography with Canon R6 Mark II',
        images: JSON.stringify(['https://images.unsplash.com/photo-1606980638481-5c18e9a6f006?w=500'])
      },
      {
        name: 'Bose QuietComfort Ultra',
        slug: 'bose-qc-ultra-' + Date.now(),
        description: 'Premium noise-cancelling earbuds with spatial audio, exceptional sound quality, and all-day comfort.',
        short_description: 'Premium wireless earbuds',
        price: 24990,
        compare_price: 27990,
        cost_price: 19000,
        sku: 'BOSEQC-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 120,
        status: 'active',
        is_featured: false,
        seo_title: 'Bose QuietComfort Ultra Earbuds',
        seo_description: 'Premium noise cancelling earbuds with spatial audio',
        images: JSON.stringify(['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500'])
      },
      {
        name: 'AirPods Pro (2nd Gen)',
        slug: 'airpods-pro-2-' + Date.now(),
        description: 'Advanced wireless earbuds with adaptive audio, personalized spatial audio, and MagSafe charging case.',
        short_description: 'Apple premium wireless earbuds',
        price: 24900,
        compare_price: 27900,
        cost_price: 20000,
        sku: 'APP2-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 150,
        status: 'active',
        is_featured: true,
        seo_title: 'AirPods Pro 2nd Generation',
        seo_description: 'Premium wireless earbuds with adaptive audio',
        images: JSON.stringify(['https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500'])
      },
      {
        name: 'LG C3 OLED 65"',
        slug: 'lg-c3-oled-65-' + Date.now(),
        description: '4K OLED TV with self-lit pixels, perfect blacks, and vibrant colors. Ideal for gaming with 120Hz refresh rate.',
        short_description: 'Premium 4K OLED smart TV',
        price: 189900,
        compare_price: 219900,
        cost_price: 150000,
        sku: 'LGC365-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 20,
        status: 'active',
        is_featured: true,
        seo_title: 'LG C3 65" 4K OLED TV',
        seo_description: 'Stunning picture quality with OLED technology',
        images: JSON.stringify(['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500'])
      },
      {
        name: 'Samsung QN90C Neo QLED 75"',
        slug: 'samsung-qn90c-75-' + Date.now(),
        description: 'Mini LED TV with quantum dots, exceptional brightness, and anti-glare screen. Perfect for bright rooms.',
        short_description: 'Premium Mini LED smart TV',
        price: 299900,
        compare_price: 339900,
        cost_price: 245000,
        sku: 'SAMQN90-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 15,
        status: 'active',
        is_featured: false,
        seo_title: 'Samsung QN90C 75" Neo QLED TV',
        seo_description: 'Bright, vivid picture with Mini LED technology',
        images: JSON.stringify(['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500'])
      },
      {
        name: 'PlayStation 5',
        slug: 'playstation-5-' + Date.now(),
        description: 'Next-gen gaming console with lightning-fast SSD, ray tracing, and exclusive games. Includes DualSense controller.',
        short_description: 'Latest PlayStation gaming console',
        price: 49990,
        compare_price: 54990,
        cost_price: 42000,
        sku: 'PS5-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 45,
        status: 'active',
        is_featured: true,
        seo_title: 'PlayStation 5 Gaming Console',
        seo_description: 'Experience next-gen gaming with PS5',
        images: JSON.stringify(['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500'])
      },
      {
        name: 'Xbox Series X',
        slug: 'xbox-series-x-' + Date.now(),
        description: 'Powerful gaming console with 4K gaming, ray tracing, and Game Pass access. Fast loading with custom SSD.',
        short_description: 'Microsoft flagship gaming console',
        price: 49990,
        compare_price: 52990,
        cost_price: 41000,
        sku: 'XBSX-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 40,
        status: 'active',
        is_featured: false,
        seo_title: 'Xbox Series X Gaming Console',
        seo_description: '4K gaming powerhouse with Game Pass',
        images: JSON.stringify(['https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500'])
      },
      {
        name: 'Anker PowerCore 26800',
        slug: 'anker-powercore-26800-' + Date.now(),
        description: 'High-capacity portable charger with 26800mAh battery. Charge multiple devices simultaneously with fast charging.',
        short_description: 'Ultra high-capacity power bank',
        price: 4999,
        compare_price: 5999,
        cost_price: 3500,
        sku: 'ANKPB-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 200,
        status: 'active',
        is_featured: false,
        seo_title: 'Anker PowerCore 26800mAh Power Bank',
        seo_description: 'Charge your devices on the go',
        images: JSON.stringify(['https://images.unsplash.com/photo-1609592019013-8887f7b194ae?w=500'])
      },
      {
        name: 'Logitech MX Master 3S',
        slug: 'logitech-mx-master-3s-' + Date.now(),
        description: 'Premium wireless mouse with ergonomic design, customizable buttons, and ultra-precise scrolling.',
        short_description: 'Professional wireless mouse',
        price: 8999,
        compare_price: 10999,
        cost_price: 6500,
        sku: 'LOGMX3-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 100,
        status: 'active',
        is_featured: false,
        seo_title: 'Logitech MX Master 3S Wireless Mouse',
        seo_description: 'Ergonomic mouse for productivity professionals',
        images: JSON.stringify(['https://images.unsplash.com/photo-1527814050087-3793815479db?w=500'])
      },
      {
        name: 'Keychron K8 Pro',
        slug: 'keychron-k8-pro-' + Date.now(),
        description: 'Premium mechanical keyboard with hot-swappable switches, RGB backlighting, and wireless connectivity.',
        short_description: 'Mechanical gaming keyboard',
        price: 9999,
        compare_price: 11999,
        cost_price: 7500,
        sku: 'KEYK8-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 80,
        status: 'active',
        is_featured: false,
        seo_title: 'Keychron K8 Pro Mechanical Keyboard',
        seo_description: 'Premium mechanical keyboard for typing enthusiasts',
        images: JSON.stringify(['https://images.unsplash.com/photo-1595225476474-87563907a212?w=500'])
      },
      {
        name: 'DJI Mini 3 Pro',
        slug: 'dji-mini-3-pro-' + Date.now(),
        description: 'Compact drone with 4K camera, obstacle avoidance, and 34-minute flight time. Perfect for aerial photography.',
        short_description: 'Professional compact drone',
        price: 89900,
        compare_price: 99900,
        cost_price: 72000,
        sku: 'DJIM3P-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        stock_quantity: 25,
        status: 'active',
        is_featured: true,
        seo_title: 'DJI Mini 3 Pro Drone',
        seo_description: 'Capture stunning aerial footage with Mini 3 Pro',
        images: JSON.stringify(['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500'])
      }
    ];

    console.log(`\n📦 Creating ${products.length} electronics products...\n`);

    let createdCount = 0;
    for (const productData of products) {
      try {
        await prisma.products.create({
          data: {
            ...productData,
            seller_id: seller.id,
            category_id: category.id
          }
        });
        createdCount++;
        console.log(`✅ Created: ${productData.name}`);
      } catch (error) {
        console.error(`❌ Failed to create ${productData.name}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully created ${createdCount} out of ${products.length} products!`);
    console.log('🎉 Seeding completed!\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedElectronics();
