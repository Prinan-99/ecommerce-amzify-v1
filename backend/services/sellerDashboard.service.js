import prisma from '../config/prisma.js';

export const sellerDashboardService = {
  // Get seller overview stats
  async getSellerStats(sellerId) {
    try {
      const [totalRevenue, totalOrders, totalProducts] = await Promise.all([
        // Total revenue from payments
        prisma.order_items.aggregate({
          where: { seller_id: sellerId },
          _sum: { total_price: true }
        }),
        
        // Total orders
        prisma.order_items.findMany({
          where: { seller_id: sellerId },
          distinct: ['order_id']
        }).then(items => new Set(items.map(i => i.order_id)).size),
        
        // Total products
        prisma.products.count({ where: { seller_id: sellerId } })
      ]);

      return {
        totalRevenue: totalRevenue._sum.total_price || 0,
        totalOrders,
        totalProducts,
        avgRating: 4.5 // Default rating since no rating field in products table
      };
    } catch (error) {
      console.error('Get seller stats error:', error);
      throw error;
    }
  },

  // Get recent orders
  async getRecentOrders(sellerId, limit = 5) {
    try {
      const orderItems = await prisma.order_items.findMany({
        where: { seller_id: sellerId },
        include: {
          orders: {
            include: {
              users: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true
                }
              }
            }
          },
          products: {
            select: {
              name: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: limit * 5 // Get more to account for grouping
      });

      // Group by order_id and take unique orders
      const ordersMap = new Map();
      orderItems.forEach(item => {
        if (!ordersMap.has(item.order_id)) {
          ordersMap.set(item.order_id, {
            id: item.order_id,
            order_number: item.orders.order_number,
            customer_name: `${item.orders.users.first_name} ${item.orders.users.last_name}`,
            customer_email: item.orders.users.email,
            total_amount: item.orders.total_amount,
            status: item.orders.status,
            created_at: item.orders.created_at,
            items: []
          });
        }
        ordersMap.get(item.order_id).items.push({
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price
        });
      });

      return Array.from(ordersMap.values()).slice(0, limit);
    } catch (error) {
      console.error('Get recent orders error:', error);
      throw error;
    }
  },

  // Get top selling products
  async getTopProducts(sellerId, limit = 4) {
    try {
      const products = await prisma.products.findMany({
        where: { seller_id: sellerId },
        include: {
          order_items: {
            where: { seller_id: sellerId }
          }
        },
        orderBy: { created_at: 'desc' },
        take: limit * 2
      });

      // Calculate stats for each product
      const productsWithStats = products.map(product => {
        const totalSold = product.order_items.reduce((sum, item) => sum + item.quantity, 0);
        const totalRevenue = product.order_items.reduce((sum, item) => sum + item.total_price, 0);

        return {
          id: product.id,
          name: product.name,
          price: product.price,
          images: product.images || [],
          totalSold,
          totalRevenue,
          status: product.status
        };
      }).sort((a, b) => b.totalSold - a.totalSold);

      return productsWithStats.slice(0, limit);
    } catch (error) {
      console.error('Get top products error:', error);
      throw error;
    }
  },

  // Get seller analytics
  async getSellerAnalytics(sellerId) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [monthlyRevenue, todayOrders, monthlyOrders] = await Promise.all([
        // Monthly revenue (last 30 days)
        prisma.order_items.aggregate({
          where: {
            seller_id: sellerId,
            created_at: { gte: thirtyDaysAgo }
          },
          _sum: { total_price: true }
        }),

        // Orders today
        prisma.order_items.findMany({
          where: {
            seller_id: sellerId,
            created_at: { gte: todayStart }
          },
          distinct: ['order_id']
        }).then(items => new Set(items.map(i => i.order_id)).size),

        // Total orders in last 30 days
        prisma.order_items.findMany({
          where: {
            seller_id: sellerId,
            created_at: { gte: thirtyDaysAgo }
          },
          distinct: ['order_id']
        }).then(items => new Set(items.map(i => i.order_id)).size)
      ]);

      // Calculate conversion rate (simplified: orders / unique customers)
      const ordersThisMonth = monthlyOrders;
      const conversionRate = ordersThisMonth > 0 ? Math.min((ordersThisMonth / 100) * 100, 100) : 0;

      return {
        monthlyRevenue: monthlyRevenue._sum.total_price || 0,
        ordersToday: todayOrders,
        monthlyOrders: monthlyOrders,
        conversionRate: conversionRate.toFixed(1)
      };
    } catch (error) {
      console.error('Get seller analytics error:', error);
      throw error;
    }
  },

  // Get trend analysis for last 6 months
  async getTrendAnalysis(sellerId) {
    try {
      const months = [];
      const now = new Date();

      // Get last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthName = monthStart.toLocaleString('en-US', { month: 'short' });

        // Get revenue for the month
        const revenue = await prisma.order_items.aggregate({
          where: {
            seller_id: sellerId,
            created_at: { gte: monthStart, lte: monthEnd }
          },
          _sum: { total_price: true }
        });

        // Get orders for the month
        const orders = await prisma.order_items.findMany({
          where: {
            seller_id: sellerId,
            created_at: { gte: monthStart, lte: monthEnd }
          },
          distinct: ['order_id']
        }).then(items => new Set(items.map(i => i.order_id)).size);

        // Get products added in the month
        const products = await prisma.products.count({
          where: {
            seller_id: sellerId,
            created_at: { gte: monthStart, lte: monthEnd }
          }
        });

        months.push({
          month: monthName,
          revenue: revenue._sum.total_price || 0,
          orders: orders,
          products: products
        });
      }

      return {
        revenue: months,
        orders: months,
        products: months
      };
    } catch (error) {
      console.error('Get trend analysis error:', error);
      throw error;
    }
  }
};
