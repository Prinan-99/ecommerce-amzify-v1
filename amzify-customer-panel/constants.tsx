
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Zenith Wireless Pro',
    description: 'Noise-cancelling over-ear headphones with 40-hour battery life and premium leather cushions. Experience high-fidelity audio like never before.',
    price: 24999,
    category: 'electronics',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=600'
    ],
    rating: 4.8,
    featured: true,
    stock: 42,
    sales: 124
  },
  {
    id: '2',
    name: 'Aura Silk Evening Gown',
    description: 'Elegant midi-length silk dress, perfect for evening events. Hand-stitched with ethically sourced mulberry silk.',
    price: 15499,
    category: 'fashion',
    images: [
      'https://images.unsplash.com/photo-1539109132314-34a9c615b2b0?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600'
    ],
    rating: 4.9,
    featured: true,
    stock: 8,
    sales: 89
  },
  {
    id: '3',
    name: 'Amzify Series 7 Watch',
    description: 'Health tracking, notifications, and timeless design in one sophisticated aerospace-grade aluminum package.',
    price: 32900,
    category: 'electronics',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1508685096489-7abac8f1baad?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600'
    ],
    rating: 4.7,
    stock: 25,
    sales: 210
  },
  {
    id: '4',
    name: 'Nordic Oak Desk Lamp',
    description: 'Minimalist desk lamp crafted from sustainable oak wood with adjustable warm-to-cool brightness.',
    price: 4500,
    category: 'home',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed657f9971?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=600'
    ],
    rating: 4.5,
    stock: 15,
    sales: 45
  },
  {
    id: '5',
    name: 'Suede Weekender Bag',
    description: 'Spacious and durable travel bag with Italian suede accents. Your perfect short-trip companion.',
    price: 8999,
    category: 'accessories',
    images: [
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600'
    ],
    rating: 4.6,
    stock: 30,
    sales: 67
  },
  {
    id: '6',
    name: 'Cashmere Blend Sweater',
    description: 'Ultra-soft ethically sourced cashmere and wool blend. Breathable, warm, and timeless.',
    price: 6499,
    category: 'fashion',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&q=80&w=600'
    ],
    rating: 4.8,
    stock: 12,
    sales: 56
  },
  {
    id: '7',
    name: 'Artisan Ceramic Set',
    description: 'Hand-thrown ceramic coffee set including a dripper and carafe for the perfect morning ritual.',
    price: 3200,
    category: 'home',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1517254456976-ee8682099819?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=600'
    ],
    rating: 4.9,
    stock: 18,
    sales: 34
  },
  {
    id: '8',
    name: 'Titanium Sunglasses',
    description: 'Ultra-light titanium frames with polarized UV400 lenses. Designed for ultimate clarity and comfort.',
    price: 12500,
    category: 'accessories',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1511499767390-a8a197599624?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600'
    ],
    rating: 4.7,
    stock: 5,
    sales: 12
  }
];
