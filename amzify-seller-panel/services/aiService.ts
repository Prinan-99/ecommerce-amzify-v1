// Smart Product-Specific AI Generator (No API Keys Required!)
console.log('🤖 Product-Specific AI Loaded - Analyzes product names for custom descriptions!');

// Product keyword detector
const detectProductType = (productName: string) => {
  const name = productName.toLowerCase();
  
  // Specific product patterns
  const patterns = {
    // Electronics
    headphones: /headphone|earphone|earbud|airpod/i,
    phone: /phone|smartphone|mobile/i,
    laptop: /laptop|notebook|macbook/i,
    tablet: /tablet|ipad/i,
    watch: /watch|smartwatch/i,
    camera: /camera|webcam|gopro/i,
    speaker: /speaker|soundbar/i,
    charger: /charger|adapter|cable/i,
    
    // Fashion
    shirt: /shirt|tshirt|t-shirt|blouse|top/i,
    jeans: /jean|denim|pant|trouser/i,
    dress: /dress|gown|frock/i,
    shoes: /shoe|sneaker|boot|sandal|heel/i,
    bag: /bag|backpack|purse|handbag/i,
    
    // Home
    chair: /chair|seat|stool/i,
    table: /table|desk/i,
    lamp: /lamp|light|chandelier/i,
    bed: /bed|mattress/i,
    
    // Health & Fitness
    yoga: /yoga|pilates/i,
    dumbell: /dumbell|weight|barbell/i,
    bottle: /bottle|flask|tumbler/i,
    
    // Kitchen
    blender: /blender|mixer|grinder/i,
    pan: /pan|pot|cookware/i,
    knife: /knife|cutter/i
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(name)) return type;
  }
  
  return 'generic';
};

const productSpecificDescriptions = {
  headphones: {
    short: [
      'Crystal-clear audio with premium {product} - Immerse yourself in sound',
      'Wireless {product} with superior noise cancellation technology',
      'Experience studio-quality sound with our {product}'
    ],
    full: `Experience audio perfection with our premium {product}. Featuring advanced noise-cancellation technology and high-fidelity drivers, these deliver crystal-clear sound that brings your music to life.

The ergonomic design ensures all-day comfort, while the long-lasting battery keeps you connected for hours. Whether you're commuting, working out, or relaxing at home, enjoy immersive audio that transforms every listening experience.

With intuitive touch controls and seamless Bluetooth connectivity, managing your music has never been easier. The premium build quality and stylish design make these {product} the perfect companion for music lovers who refuse to compromise on quality.`
  },
  
  phone: {
    short: [
      'Powerful {product} with cutting-edge performance and stunning display',
      'Next-gen {product} - Capture life in brilliant detail',
      'Ultra-fast {product} designed for modern life'
    ],
    full: `Introducing the revolutionary {product} that redefines mobile excellence. Powered by the latest processor and stunning display technology, this smartphone delivers blazing-fast performance for everything from gaming to productivity.

Capture professional-quality photos with the advanced camera system featuring AI-enhanced imaging and night mode. The long-lasting battery ensures you stay connected all day, while fast charging gets you back to 100% in minutes.

With 5G connectivity, ample storage, and a sleek design that feels premium in hand, this {product} is engineered for those who demand the best. Experience the future of mobile technology today.`
  },
  
  laptop: {
    short: [
      'Powerful {product} for professionals - Performance meets portability',
      'Ultra-thin {product} with all-day battery life',
      'High-performance {product} built for productivity'
    ],
    full: `Meet your new productivity powerhouse - the {product} designed for professionals who demand excellence. Featuring a powerful processor, stunning high-resolution display, and lightning-fast SSD storage, this laptop handles everything from creative work to data analysis with ease.

The premium aluminum chassis is both durable and lightweight, making it perfect for working on the go. With all-day battery life, you can work unplugged from morning meetings to evening presentations without worrying about charging.

Advanced cooling keeps performance optimal even during intensive tasks, while the backlit keyboard and precision trackpad ensure comfortable, accurate input. Whether you're coding, designing, or managing projects, this {product} delivers the performance and reliability you need to excel.`
  },
  
  shirt: {
    short: [
      'Premium {product} - Comfort and style in perfect harmony',
      'Breathable {product} for all-day comfort',
      'Classic {product} that never goes out of style'
    ],
    full: `Elevate your wardrobe with our premium {product}, crafted from high-quality fabrics that feel as good as they look. The perfect blend of comfort and style, this piece is designed for modern living and timeless fashion.

The breathable material keeps you comfortable throughout the day, while the tailored fit flatters every body type. Whether you're heading to the office, meeting friends, or enjoying a casual weekend, this versatile {product} adapts effortlessly to any occasion.

Easy to care for and built to last, it maintains its shape and color wash after wash. Available in multiple colors and sizes, find your perfect match and experience the difference that quality clothing makes in your daily confidence.`
  },
  
  shoes: {
    short: [
      'Comfortable {product} engineered for all-day wear',
      'Stylish {product} with superior cushioning and support',
      'Premium {product} - Where fashion meets function'
    ],
    full: `Step into comfort and style with our premium {product}, expertly crafted using advanced footwear technology and high-quality materials. The innovative cushioning system provides superior support for all-day wear, whether you're walking, running, or standing.

The breathable design keeps your feet cool and dry, while the durable outsole offers excellent traction on various surfaces. The modern aesthetic seamlessly transitions from gym to street, making these the most versatile {product} in your collection.

With reinforced stitching and quality construction, these are built to withstand daily wear while maintaining their fresh appearance. Experience the perfect combination of performance, comfort, and style that keeps you moving with confidence.`
  },
  
  watch: {
    short: [
      'Smart {product} that tracks your health and keeps you connected',
      'Elegant {product} with advanced fitness monitoring',
      'Premium {product} - Style meets technology'
    ],
    full: `Discover the perfect blend of style and technology with our advanced {product}. This isn't just a timepiece – it's your personal health coach, fitness tracker, and communication hub all wrapped in an elegant design.

Monitor your heart rate, track workouts, analyze sleep patterns, and stay on top of your wellness goals with comprehensive health features. Receive notifications, control music, and stay connected without reaching for your phone, all from your wrist.

The premium build quality features scratch-resistant display and water resistance for everyday durability. With customizable watch faces and interchangeable bands, express your personal style while enjoying cutting-edge technology that enhances your daily life.`
  },
  
  bag: {
    short: [
      'Spacious {product} with organized compartments for modern life',
      'Durable {product} designed for everyday adventures',
      'Stylish {product} - Carry everything in comfort'
    ],
    full: `Organize your life in style with our premium {product}, thoughtfully designed with multiple compartments and pockets to keep everything in its place. From laptops to water bottles, this versatile bag has a dedicated spot for all your essentials.

Crafted from durable, water-resistant materials, it protects your belongings while withstanding daily wear and tear. The padded shoulder straps and ergonomic design ensure comfortable carrying even when fully loaded, making it perfect for commutes, travel, or daily adventures.

The sleek, modern aesthetic transitions seamlessly from professional settings to casual outings. With reinforced stitching and quality zippers built to last, this {product} is an investment in organized, stylish living that serves you reliably for years.`
  },
  
  bottle: {
    short: [
      'Insulated {product} keeps drinks perfect for 24 hours',
      'Eco-friendly {product} for hydration on the go',
      'Leak-proof {product} designed for active lifestyles'
    ],
    full: `Stay hydrated in style with our premium {product}, featuring advanced insulation technology that keeps cold drinks icy for 24 hours and hot beverages steaming for 12 hours. Perfect for workouts, commutes, or outdoor adventures.

The durable, BPA-free construction ensures safe, pure-tasting hydration every time, while the leak-proof cap lets you toss it in your bag worry-free. The ergonomic design fits comfortably in hand and most cup holders for convenient portability.

Easy to clean with a wide mouth opening and available in vibrant colors that resist scratches and fading. Make the sustainable choice without compromising on performance – this {product} is your perfect hydration companion for every activity.`
  },
  
  chair: {
    short: [
      'Ergonomic {product} designed for all-day comfort and support',
      'Premium {product} - Transform your workspace',
      'Stylish {product} with lumbar support'
    ],
    full: `Transform your workspace with our ergonomically designed {product}, engineered to provide optimal support and comfort during long work sessions. The advanced lumbar support and adjustable features promote healthy posture and reduce fatigue.

Premium cushioning and breathable materials keep you comfortable throughout the day, while the sturdy construction supports up to 300 lbs with confidence. Smooth-rolling casters and 360-degree swivel enhance mobility and functionality in any workspace.

The modern, sleek design complements any office décor, from home offices to corporate settings. Easy to assemble and built to last, this {product} is an investment in your health, comfort, and productivity that pays dividends every single day.`
  }
};

const genericTemplate = {
  short: [
    'Premium {product} crafted for excellence and everyday use',
    'High-quality {product} designed to exceed your expectations',
    'Professional-grade {product} at an exceptional value'
  ],
  full: `Discover our exceptional {product}, meticulously crafted to deliver outstanding performance and value. Built with premium materials and attention to detail, this product combines functionality with modern aesthetics.

Whether for professional use or personal enjoyment, the intuitive design ensures ease of use while the durable construction guarantees long-lasting reliability. Experience the perfect balance of quality, innovation, and affordability.

Backed by our commitment to customer satisfaction, this {product} represents a smart investment in quality that enhances your daily life. Join thousands of satisfied customers who have made the upgrade to excellence.`
};

export const generateProductDescription = async (productName: string, category?: string, shortDescription?: string) => {
  try {
    console.log('🤖 Analyzing product:', productName);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const productType = detectProductType(productName);
    const template = productSpecificDescriptions[productType] || genericTemplate;
    
    console.log(`✨ Detected product type: ${productType}`);
    return template.full.replace(/{product}/g, productName);
  } catch (error: any) {
    console.error("Description Generation Error:", error);
    throw new Error(error?.message || 'Failed to generate description');
  }
};

export const generateSEOContent = async (productName: string, description: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const productType = detectProductType(productName);
    const keywords = {
      headphones: 'Wireless, Noise Cancelling, Premium Audio',
      phone: 'Smartphone, 5G, Latest Technology',
      laptop: 'High Performance, Portable, Professional',
      watch: 'Smartwatch, Fitness Tracker, Wearable',
      shirt: 'Fashion, Comfortable, Stylish',
      shoes: 'Footwear, Comfortable, Durable',
      bag: 'Backpack, Spacious, Organized',
      bottle: 'Insulated, Eco-Friendly, Hydration',
      chair: 'Ergonomic, Office, Comfortable'
    };
    
    const keyword = keywords[productType] || 'Premium Quality';
    const title = `${productName} - ${keyword} | Buy Now`;
    const metaDescription = `Shop ${productName} online. ${description.substring(0, 90)}... Fast shipping & great prices.`;
    
    return {
      title: title.substring(0, 60),
      description: metaDescription.substring(0, 160)
    };
  } catch (error: any) {
    console.error("SEO Generation Error:", error);
    throw new Error(error?.message || 'Failed to generate SEO content');
  }
};

export const improveDescription = async (currentDescription: string, tone: 'professional' | 'casual' | 'luxury' = 'professional') => {
  try {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const replacements = {
      professional: {
        'amazing': 'exceptional',
        'great': 'outstanding',
        'good': 'superior',
        'nice': 'premium'
      },
      casual: {
        'exceptional': 'amazing',
        'outstanding': 'awesome',
        'superior': 'great',
        'premium': 'really nice'
      },
      luxury: {
        'good': 'exquisite',
        'great': 'prestigious',
        'nice': 'refined',
        'quality': 'unparalleled quality'
      }
    };
    
    let improved = currentDescription;
    Object.entries(replacements[tone]).forEach(([from, to]) => {
      const regex = new RegExp(from, 'gi');
      improved = improved.replace(regex, to);
    });
    
    return improved;
  } catch (error: any) {
    console.error("Description Improvement Error:", error);
    throw new Error(error?.message || 'Failed to improve description');
  }
};

export const generateShortDescription = async (productName: string, category?: string) => {
  try {
    console.log('🤖 Generating short description for:', productName);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const productType = detectProductType(productName);
    const template = productSpecificDescriptions[productType] || genericTemplate;
    
    const shortOptions = template.short;
    const selected = shortOptions[Math.floor(Math.random() * shortOptions.length)];
    
    return selected.replace(/{product}/g, productName);
  } catch (error: any) {
    console.error("Short Description Error:", error);
    throw new Error(error?.message || 'Failed to generate short description');
  }
};

// Social Media Functions
export const generateSocialMediaPost = async (
  productName: string, 
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube',
  productInfo?: string
) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const posts = {
      facebook: `🎉 Introducing our amazing ${productName}! \n\nWe're excited to share this incredible product with you. Perfect for anyone looking to upgrade their experience with premium quality and outstanding performance.\n\nCheck it out now and see the difference for yourself! 💫`,
      
      instagram: `✨ NEW ARRIVAL ✨\n\n${productName} is here! 🔥\n\nPremium quality meets unbeatable value. \nYour perfect choice for style and performance.\n\n🛍️ Shop now - Link in bio`,
      
      twitter: `🚀 Just dropped: ${productName}\n\nPremium quality | Great value | Fast shipping\n\nGet yours today! 🔥`,
      
      linkedin: `We're proud to announce the launch of our ${productName}.\n\nDeveloped with precision and designed for professionals who demand excellence, this product represents our commitment to quality and innovation.\n\nDiscover how it can enhance your workflow and deliver exceptional results.`,
      
      youtube: `Welcome back! Today we're showcasing our ${productName}.\n\nIn this video, you'll discover all the amazing features and benefits that make this product stand out. Whether you're a beginner or professional, you'll find incredible value here.\n\nWatch till the end for exclusive tips and special offers!\n\nDon't forget to like, subscribe, and hit that notification bell! 🔔`
    };
    
    return posts[platform] || posts.facebook;
  } catch (error: any) {
    console.error("Social Post Generation Error:", error);
    throw new Error(error?.message || 'Failed to generate social media post');
  }
};

export const generateHashtags = async (productName: string, category?: string, postContent?: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const commonHashtags = ['#NewArrival', '#ShopNow', '#QualityProducts', '#OnlineShopping'];
    const categoryHashtags = category ? [`#${category.replace(/\s+/g, '')}`, '#BestOf' + category.split(' ')[0]] : [];
    const productHashtags = [`#${productName.replace(/\s+/g, '')}`];
    
    return [...productHashtags, ...categoryHashtags, ...commonHashtags].slice(0, 10).join(', ');
  } catch (error: any) {
    console.error("Hashtag Generation Error:", error);
    throw new Error(error?.message || 'Failed to generate hashtags');
  }
};

export const improveSocialPost = async (currentPost: string, platform: string, tone: 'engaging' | 'professional' | 'casual' = 'engaging') => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const emojis = {
      engaging: ['🎉', '✨', '🔥', '💫', '⭐'],
      professional: ['📊', '💼', '🎯', '✅', '📈'],
      casual: ['😊', '👍', '💯', '🙌', '❤️']
    };
    
    const emoji = emojis[tone][0];
    return `${emoji} ${currentPost}`;
  } catch (error: any) {
    console.error("Post Improvement Error:", error);
    throw new Error(error?.message || 'Failed to improve social post');
  }
};
