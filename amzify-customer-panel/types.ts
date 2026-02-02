export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  rating: number;
  featured?: boolean;
  stock: number;
  sales: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'admin';
}

export interface FeedbackData {
  rating: number;
  comment: string;
  category: string;
}