
import axios from 'axios';
import { 
  User, Seller, Product, Order, Campaign, AuditLog, 
  AccountStatus, ProductStatus, OrderStatus, UserRole,
  Offer, Ticket, GovernanceRule, Shipment, DeliveryPartner, ShipmentStatus
} from '../types';
import { adminApi } from '../../shared/auth/ApiService';

const MOCK_DATA = {
  stats: {
    totalUsers: 245102,
    activeUsers: 12405,
    totalSellers: 4200,
    totalProducts: 890500,
    totalRevenue: 12450000,
    dailyOrders: 3420,
    fraudAlerts: 14,
    pendingApprovals: 423,
    openTickets: 85,
    // New live and growth metrics
    liveCustomers: 1284,
    liveProducts: 754021,
    sellerGrowth: 14.2,
    productGrowth: 8.7,
    customerGrowth: 18.5,
    revenueGrowth: 5.2
  },
  orders: [
    { id: 'ORD-5501', customerName: 'John Doe', totalAmount: 129.00, status: OrderStatus.DELIVERED, items: 2, createdAt: new Date().toISOString() },
    { id: 'ORD-5502', customerName: 'Jane Smith', totalAmount: 450.50, status: OrderStatus.DISPUTED, items: 1, createdAt: new Date().toISOString() },
    { id: 'ORD-5503', customerName: 'Robert Brown', totalAmount: 89.99, status: OrderStatus.PROCESSING, items: 3, createdAt: new Date().toISOString() }
  ],
  shipments: [
    {
      id: 'SHP-9001',
      orderId: 'ORD-5503',
      sellerName: 'Elite Gadgets',
      customerName: 'Robert Brown',
      deliveryPartnerName: 'Nexus Express / Mike R.',
      status: ShipmentStatus.IN_TRANSIT,
      origin: 'San Francisco, CA',
      destination: 'Austin, TX',
      estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(),
      updates: [
        { id: 'u1', timestamp: new Date(Date.now() - 3600000).toISOString(), author: 'Elite Gadgets', authorRole: 'SELLER', message: 'Package handed over to courier', type: 'SUCCESS' },
        { id: 'u2', timestamp: new Date(Date.now() - 7200000).toISOString(), author: 'System', authorRole: 'SYSTEM', message: 'Label generated', type: 'INFO' }
      ]
    },
    {
      id: 'SHP-9002',
      orderId: 'ORD-5504',
      sellerName: 'Fashion Hub',
      customerName: 'Alice Wong',
      deliveryPartnerName: 'FedEx / Global',
      status: ShipmentStatus.PICKUP_PENDING,
      origin: 'New York, NY',
      destination: 'Seattle, WA',
      estimatedDelivery: new Date(Date.now() + 86400000 * 4).toISOString(),
      updates: [
        { id: 'u3', timestamp: new Date(Date.now() - 1800000).toISOString(), author: 'Fashion Hub', authorRole: 'SELLER', message: 'Delayed: Packaging issues at warehouse', type: 'WARNING' }
      ]
    }
  ],
  deliveryPartners: [
    { id: 'DP-1', name: 'Mike Ross', provider: 'Nexus Express', rating: 4.8, activeOrders: 12, status: 'ONLINE', vehicleType: 'VAN' },
    { id: 'DP-2', name: 'Harvey Specter', provider: 'Nexus Express', rating: 4.9, activeOrders: 8, status: 'ONLINE', vehicleType: 'BIKE' },
    { id: 'DP-3', name: 'Donna Paulsen', provider: 'Global Logistics', rating: 4.7, activeOrders: 0, status: 'ON_BREAK', vehicleType: 'TRUCK' }
  ],
  offers: [
    { id: 'off-1', title: 'Summer Bonanza', sellerId: 'GLOBAL', sellerName: 'Nexus Global', discountType: 'PERCENTAGE', value: 20, minOrderValue: 500, status: 'ACTIVE', expiryDate: '2025-08-01' },
    { id: 'off-2', title: 'Flash Clearance', sellerId: 's-1', sellerName: 'Elite Gadgets', discountType: 'FIXED', value: 50, minOrderValue: 2000, status: 'PENDING', expiryDate: '2025-06-15' }
  ],
  tickets: [
    { id: 't-101', sellerId: 's-1', sellerName: 'Elite Gadgets', category: 'PAYMENT', priority: 'HIGH', status: 'OPEN', subject: 'Payout delay for cycle #45', lastUpdate: new Date().toISOString() },
    { id: 't-102', sellerId: 's-3', sellerName: 'Fashion Hub', category: 'PRODUCT_APPROVAL', priority: 'MEDIUM', status: 'IN_PROGRESS', subject: 'Bulk upload stuck in review', lastUpdate: new Date().toISOString() }
  ],
  rules: [
    { id: 'r-1', name: 'Price Manipulation', description: 'Detects 90% drops in under 1 hour', threshold: 90, action: 'DELIST', isEnabled: true },
    { id: 'r-2', name: 'Customer Abuse', description: 'Blocks seller after 5 verified reports', threshold: 5, action: 'BLOCK', isEnabled: true }
  ],
  users: Array.from({ length: 20 }).map((_, i) => ({
    id: `u-${1000 + i}`,
    name: `User ${i}`,
    email: `user${i}@nexus.com`,
    role: i % 10 === 0 ? UserRole.SELLER : UserRole.CUSTOMER,
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString()
  })),
  sellers: Array.from({ length: 10 }).map((_, i) => ({
    id: `s-${i}`,
    name: `Owner ${i}`,
    email: `seller${i}@nexus.com`,
    storeName: `Marketplace ${i}`,
    role: UserRole.SELLER,
    status: AccountStatus.ACTIVE,
    commissionRate: 8.5,
    totalSales: 450000,
    healthScore: 95,
    violationPoints: i % 4 === 0 ? 15 : 0,
    verificationStatus: 'VERIFIED',
    createdAt: new Date().toISOString()
  })),
  products: Array.from({ length: 10 }).map((_, i) => ({
    id: `p-${i}`,
    name: `Enterprise SKU ${i}`,
    price: 129,
    originalPrice: 150,
    sellerId: `s-${i % 5}`,
    sellerName: `Marketplace ${i % 5}`,
    status: i % 3 === 0 ? ProductStatus.PENDING : ProductStatus.APPROVED,
    category: 'Electronics',
    stock: 1200,
    imageUrl: `https://picsum.photos/seed/sku${i}/200/200`,
    reportsCount: i % 5 === 0 ? 2 : 0,
    submittedAt: new Date().toISOString()
  })),
  metrics: [
    { service: 'Auth API', latency: 42, errorRate: 0.01, cpu: 12, memory: 45, status: 'HEALTHY' },
    { service: 'Catalog Service', latency: 156, errorRate: 0.05, cpu: 65, memory: 82, status: 'DEGRADED' }
  ],
  auditLogs: []
};

const api = axios.create({
  baseURL: '/api/admin',
  headers: { 'Content-Type': 'application/json' }
});

export const AdminApi = {
  getStats: async () => { 
    try { 
      return await adminApi.get('/stats'); 
    } catch { 
      return MOCK_DATA.stats; 
    } 
  },
  getUsers: async () => { 
    try { 
      return await adminApi.get('/users'); 
    } catch { 
      return MOCK_DATA.users; 
    } 
  },
  getSellers: async () => { 
    try { 
      return await adminApi.get('/sellers'); 
    } catch { 
      return MOCK_DATA.sellers; 
    } 
  },
  getProducts: async () => { 
    try { 
      return await adminApi.get('/products'); 
    } catch { 
      return MOCK_DATA.products; 
    } 
  },
  getOrders: async () => { 
    try { 
      return await adminApi.get('/orders'); 
    } catch { 
      return MOCK_DATA.orders; 
    } 
  },
  getShipments: async () => { 
    try { 
      return await adminApi.get('/shipments'); 
    } catch { 
      return MOCK_DATA.shipments; 
    } 
  },
  getDeliveryPartners: async () => { 
    try { 
      return await adminApi.get('/delivery-partners'); 
    } catch { 
      return MOCK_DATA.deliveryPartners; 
    } 
  },
  getOffers: async () => { 
    try { 
      return await adminApi.get('/offers'); 
    } catch { 
      return MOCK_DATA.offers; 
    } 
  },
  getTickets: async () => { 
    try { 
      return await adminApi.get('/tickets'); 
    } catch { 
      return MOCK_DATA.tickets; 
    } 
  },
  getRules: async () => { 
    try { 
      return await adminApi.get('/rules'); 
    } catch { 
      return MOCK_DATA.rules; 
    } 
  },
  getSystemMetrics: async () => { 
    try { 
      return await adminApi.get('/metrics'); 
    } catch { 
      return MOCK_DATA.metrics; 
    } 
  },
  getAuditLogs: async () => { 
    try { 
      return await adminApi.get('/audit-logs'); 
    } catch { 
      return MOCK_DATA.auditLogs; 
    } 
  },
  
  updateProductStatus: async (id: string, status: ProductStatus) => adminApi.patch(`/products/${id}/status`, { status }),
  updateOfferStatus: async (id: string, status: string) => adminApi.patch(`/offers/${id}/status`, { status }),
  updateTicketStatus: async (id: string, status: string) => adminApi.patch(`/tickets/${id}/status`, { status }),
  updateRule: async (id: string, updates: any) => adminApi.patch(`/rules/${id}`, updates),
  updateSettings: async (settings: any) => adminApi.post('/settings', settings)
};
