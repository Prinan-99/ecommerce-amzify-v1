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

export enum MembershipTier {
  MEMBER = 'Member',
  GOLD = 'Gold',
  PLATINUM = 'Platinum'
}

export enum OrderStatus {
  DELIVERED = 'Delivered',
  SHIPPED = 'Shipped',
  PROCESSING = 'Processing',
  CANCELLED = 'Cancelled'
}

export interface UserProfile {
  name: string;
  initial: string;
  tier: MembershipTier;
  memberSince: string;
  currentSpend: number;
  rewardPoints: number;
  nextTierThreshold: number;
  upgradeDeadline: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Order {
  id: string;
  date: string;
  amount: number;
  status: OrderStatus;
  itemsCount: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
}

// Additional types for existing components
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface GroundingSource {
  title: string;
  url: string;
  snippet: string;
}

export interface LoyaltyStats {
  points: number;
  tier: string;
  nextTierPoints: number;
  lifetimeSpent: number;
}

export interface UserPreferences {
  categories: string[];
  priceRange: { min: number; max: number };
  brands: string[];
  notifications: boolean;
}

export type SellerTab = 'dashboard' | 'products' | 'orders' | 'analytics' | 'customers' | 'support';

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
}

export interface Inquiry {
  id: string;
  customer: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  date: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'completed';
  reach: number;
  conversions: number;
  platform?: string;
  engagement?: string;
  product?: string;
}