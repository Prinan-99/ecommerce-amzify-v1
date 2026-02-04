import fetch from 'node-fetch';

const API_URL = process.env.VITE_API_URL ?? 'https://ecommerce-amzify-v1.onrender.com';
const SELLER_EMAIL = 'seller@example.com';
const SELLER_PASSWORD = 'seller123';

const electronicsProducts = [
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise cancellation with premium sound quality. 30-hour battery life, multipoint connection, and touch controls.',
    short_description: 'Premium wireless headphones with industry-leading noise cancellation',
    price: 29999,
    compare_price: 34999,
    stock_quantity: 50,
    sku: 'SONY-WH1000XM5',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&h=800&fit=crop'
    ]
  },
  {
    name: 'Apple AirPods Pro (2nd Generation)',
    description: 'Active noise cancellation, transparency mode, adaptive audio, and personalized spatial audio with dynamic head tracking.',
    short_description: 'Advanced wireless earbuds with active noise cancellation',
    price: 24900,
    compare_price: 27900,
    stock_quantity: 100,
    sku: 'APPLE-AIRPODS-PRO2',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1590658165737-15a047b7a1f5?w=800&h=800&fit=crop'
    ]
  },
  {
    name: 'Samsung Galaxy Buds2 Pro',
    description: 'Intelligent ANC, 360 audio, and HD voice quality. IPX7 water resistance with 8-hour battery life.',
    short_description: 'Premium wireless earbuds with intelligent noise cancellation',
    price: 16999,
    compare_price: 18999,
    stock_quantity: 75,
    sku: 'SAMSUNG-BUDS2PRO',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1598331668585-04b7ce775617?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&h=800&fit=crop'
    ]
  },
  {
    name: 'JBL Flip 6 Portable Bluetooth Speaker',
    description: 'Powerful sound, deep bass, IP67 waterproof and dustproof. 12 hours of playtime.',
    short_description: 'Waterproof portable Bluetooth speaker with powerful sound',
    price: 11999,
    compare_price: 13999,
    stock_quantity: 60,
    sku: 'JBL-FLIP6',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1507646871686-13ccee5f0b44?w=800&h=800&fit=crop'
    ]
  },
  {
    name: 'Bose SoundLink Revolve+ II',
    description: '360-degree Bluetooth speaker with deep, loud, immersive sound. 17-hour battery life, water and dust resistant.',
    short_description: '360-degree portable Bluetooth speaker with premium sound',
    price: 27999,
    compare_price: 32999,
    stock_quantity: 40,
    sku: 'BOSE-REVOLVE2',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1531104985437-603d6490e6d4?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1569317002804-ab77bcf1bce4?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=800&fit=crop'
    ]
  },
  {
    name: 'Anker PowerCore 26800mAh Power Bank',
    description: 'Ultra-high capacity portable charger with 3 USB ports. Fast charging technology for phones, tablets, and more.',
    short_description: 'High-capacity power bank with fast charging',
    price: 3999,
    compare_price: 4999,
    stock_quantity: 150,
    sku: 'ANKER-PC26800',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=800&h=800&fit=crop'
    ]
  },
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    description: 'Advanced wireless mouse with ultra-fast scrolling, 8K DPI sensor, and quiet clicks. Ergonomic design for productivity.',
    short_description: 'Premium wireless mouse for productivity',
    price: 8999,
    compare_price: 10999,
    stock_quantity: 80,
    sku: 'LOGI-MXM3S',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1586920740099-834dfb3513f2?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=800&fit=crop'
    ]
  },
  {
    name: 'Razer BlackWidow V3 Mechanical Gaming Keyboard',
    description: 'Mechanical gaming keyboard with green switches, RGB Chroma lighting, and programmable keys.',
    short_description: 'Mechanical gaming keyboard with RGB lighting',
    price: 11999,
    compare_price: 13999,
    stock_quantity: 45,
    sku: 'RAZER-BWV3',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&h=800&fit=crop'
    ]
  },
  {
    name: 'Belkin 3-in-1 Wireless Charging Stand',
    description: 'Charge your iPhone, Apple Watch, and AirPods simultaneously. Fast wireless charging up to 15W.',
    short_description: '3-in-1 wireless charging station for Apple devices',
    price: 7999,
    compare_price: 9999,
    stock_quantity: 90,
    sku: 'BELKIN-WC3IN1',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1591290619762-7e8b4b5d0c18?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1597792081999-c37efc5c9a07?w=800&h=800&fit=crop'
    ]
  },
  {
    name: 'SanDisk Extreme PRO 1TB Portable SSD',
    description: 'Ultra-fast external SSD with read speeds up to 2000MB/s. Rugged, water and dust resistant.',
    short_description: 'High-speed portable SSD with 1TB storage',
    price: 14999,
    compare_price: 17999,
    stock_quantity: 55,
    sku: 'SANDISK-EXPRO1TB',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1597138578477-57c2c9c02e8c?w=800&h=800&fit=crop'
    ]
  },
  {
    name: 'Xiaomi Mi Smart Band 7',
    description: 'Fitness tracker with AMOLED display, 14-day battery life, SpO2 monitoring, and 120+ workout modes.',
    short_description: 'Smart fitness band with AMOLED display',
    price: 3499,
    compare_price: 4499,
    stock_quantity: 200,
    sku: 'XIAOMI-BAND7',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1557935728-e6d1eaabe558?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&h=800&fit=crop'
    ]
  },
  {
    name: 'TP-Link Archer AX73 WiFi 6 Router',
    description: 'Dual-band WiFi 6 router with speeds up to 5.4Gbps. Covers up to 3000 sq ft with stable connections.',
    short_description: 'High-speed WiFi 6 router for home and office',
    price: 12999,
    compare_price: 15999,
    stock_quantity: 35,
    sku: 'TPLINK-AX73',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&h=800&fit=crop'
    ]
  }
];

async function waitForServer(maxAttempts = 15) {
  console.log('⏳ Waiting for server to be ready...');
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${API_URL.replace('/api', '')}/health`);
      if (response.ok) {
        console.log('✅ Server is ready!');
        return true;
      }
    } catch (error) {
      console.log(`   Attempt ${i + 1}/${maxAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('❌ Server did not start in time');
}

async function loginAndGetToken() {
  console.log('🔐 Logging in as seller...');
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: SELLER_EMAIL,
      password: SELLER_PASSWORD
    })
  });

  if (!response.ok) {
    throw new Error('Login failed. Please check email/password.');
  }

  const data = await response.json();
  console.log('✅ Logged in successfully!');
  return data.accessToken;
}

async function getElectronicsCategoryId(token) {
  console.log('📦 Fetching Electronics category...');
  const response = await fetch(`${API_URL}/categories`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json();
  const electronicsCategory = data.categories?.find(cat => 
    cat.name.toLowerCase() === 'electronics'
  );

  if (!electronicsCategory) {
    throw new Error('Electronics category not found');
  }

  console.log('✅ Found Electronics category:', electronicsCategory.id);
  return electronicsCategory.id;
}

async function addProduct(productData, token, index, total) {
  console.log(`\n📱 [${index + 1}/${total}] Adding: ${productData.name}`);
  
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Failed:', error);
    return null;
  }

  const result = await response.json();
  console.log('   ✅ Added successfully! Price: ₹' + productData.price);
  return result;
}

async function addProductsInRealTime() {
  try {
    // Wait for server to be ready
    await waitForServer();
    
    // Login
    const token = await loginAndGetToken();
    
    // Get Electronics category
    const categoryId = await getElectronicsCategoryId(token);
    
    console.log('\n🚀 Starting to add products in real-time...\n');
    console.log('=' .repeat(60));
    
    // Add products one by one with delay (simulating real-time)
    let successCount = 0;
    for (let i = 0; i < electronicsProducts.length; i++) {
      const product = {
        ...electronicsProducts[i],
        category_id: categoryId
      };
      
      const result = await addProduct(product, token, i, electronicsProducts.length);
      if (result) successCount++;
      
      // Wait 1.5 seconds between products (simulating real user)
      if (i < electronicsProducts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n✨ Completed! Added ${successCount}/${electronicsProducts.length} products`);
    console.log('🎉 Refresh your seller panel to see the new products!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
addProductsInRealTime();
