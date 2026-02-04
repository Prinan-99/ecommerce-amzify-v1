
export enum UserRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPS = 'OPS',
  SUPPORT = 'SUPPORT',
  SELLER = 'SELLER',
  CUSTOMER = 'CUSTOMER',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  SHADOW_BANNED = 'SHADOW_BANNED',
  RESTRICTED = 'RESTRICTED'
}

export enum ProductStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  DISABLED = 'DISABLED',
  FLAGGED = 'FLAGGED',
  REVIEW_REQUESTED = 'REVIEW_REQUESTED'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED'
}

export enum ShipmentStatus {
  PICKUP_PENDING = 'PICKUP_PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  EXCEPTION = 'EXCEPTION'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  lastLoginIp?: string;
  lastActive?: string;
}

export interface Seller extends User {
  storeName: string;
  commissionRate: number;
  totalSales: number;
  healthScore: number;
  violationPoints: number;
  verificationStatus: 'VERIFIED' | 'REJECTED' | 'PENDING';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  sellerId: string;
  sellerName: string;
  status: ProductStatus;
  category: string;
  stock: number;
  imageUrl: string;
  reportsCount: number;
  submittedAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  items: number;
  createdAt: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  provider: string; // e.g., 'FedEx', 'Nexus Express'
  rating: number;
  activeOrders: number;
  status: 'ONLINE' | 'OFFLINE' | 'ON_BREAK';
  vehicleType: 'BIKE' | 'VAN' | 'TRUCK';
}

export interface ShipmentUpdate {
  id: string;
  timestamp: string;
  author: string;
  authorRole: 'SELLER' | 'DELIVERY_PARTNER' | 'SYSTEM';
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS';
}

export interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  sellerName: string;
  customerName: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  courierPartner: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  currentLocation?: string;
  estimatedDelivery: string;
  createdAt: string;
  updates: ShipmentUpdate[];
}

export interface Campaign {
  id: string;
  title: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  budget: number;
  spent: number;
}

export interface Offer {
  id: string;
  title: string;
  sellerId: string | 'GLOBAL';
  sellerName: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderValue: number;
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'REJECTED';
  expiryDate: string;
}

export interface Ticket {
  id: string;
  sellerId: string;
  sellerName: string;
  category: 'PAYMENT' | 'PRODUCT_APPROVAL' | 'CAMPAIGN' | 'ACCOUNT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  subject: string;
  lastUpdate: string;
}

export interface GovernanceRule {
  id: string;
  name: string;
  description: string;
  threshold: number;
  action: 'WARNING' | 'RESTRICT' | 'BLOCK' | 'DELIST';
  isEnabled: boolean;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
  changes: { before: any; after: any };
}

export interface SystemMetric {
  service: string;
  latency: number;
  errorRate: number;
  cpu: number;
  memory: number;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
}
