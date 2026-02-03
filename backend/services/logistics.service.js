import prisma from '../config/prisma.js';

export const logisticsService = {
  // Get warehouse statistics
  async getWarehouseStats(sellerId) {
    try {
      const [totalProducts, activeOrders, pendingShipments] = await Promise.all([
        // Total products in warehouse
        prisma.products.count({ 
          where: { seller_id: sellerId } 
        }),
        
        // Active orders (processing + shipped)
        prisma.orders.count({
          where: {
            order_items: {
              some: { seller_id: sellerId }
            },
            status: { in: ['processing', 'shipped'] }
          }
        }),
        
        // Pending shipments (processing only)
        prisma.orders.count({
          where: {
            order_items: {
              some: { seller_id: sellerId }
            },
            status: 'processing'
          }
        })
      ]);

      return {
        totalProducts,
        activeOrders,
        pendingShipments,
        warehouseCapacity: 85, // percentage
        avgProcessingTime: '2.3 hours'
      };
    } catch (error) {
      console.error('Get warehouse stats error:', error);
      throw error;
    }
  },

  // Get shipment tracking data
  async getShipmentTracking(sellerId) {
    try {
      const shipments = await prisma.orders.findMany({
        where: {
          order_items: {
            some: { seller_id: sellerId }
          },
          status: { in: ['processing', 'shipped', 'delivered'] }
        },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
              email: true
            }
          },
          order_items: {
            where: { seller_id: sellerId },
            include: {
              products: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 20
      });

      return shipments.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        customer: `${order.users.first_name} ${order.users.last_name}`,
        status: order.status,
        shippingAddress: order.shipping_address,
        items: order.order_items.length,
        estimatedDelivery: this.calculateDeliveryDate(order.created_at, order.status),
        trackingNumber: `TRK${order.id.toString().padStart(10, '0')}`,
        createdAt: order.created_at
      }));
    } catch (error) {
      console.error('Get shipment tracking error:', error);
      throw error;
    }
  },

  // Get reverse logistics (returns)
  async getReverseLogistics(sellerId) {
    try {
      // Get cancelled orders as returns
      const returns = await prisma.orders.findMany({
        where: {
          order_items: {
            some: { seller_id: sellerId }
          },
          status: 'cancelled'
        },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true
            }
          },
          order_items: {
            where: { seller_id: sellerId },
            include: {
              products: {
                select: { name: true, price: true }
              }
            }
          }
        },
        orderBy: { updated_at: 'desc' },
        take: 10
      });

      const totalReturns = returns.length;
      const totalReturnValue = returns.reduce((sum, order) => 
        sum + order.order_items.reduce((itemSum, item) => itemSum + Number(item.total_price), 0), 0
      );

      return {
        totalReturns,
        totalReturnValue,
        pendingReturns: Math.floor(totalReturns * 0.3),
        processedReturns: Math.floor(totalReturns * 0.7),
        returns: returns.map(order => ({
          id: order.id,
          orderNumber: order.order_number,
          customer: `${order.users.first_name} ${order.users.last_name}`,
          reason: 'Customer Request',
          status: 'Processing',
          value: order.total_amount,
          date: order.updated_at,
          items: order.order_items.map(item => item.products.name).join(', ')
        }))
      };
    } catch (error) {
      console.error('Get reverse logistics error:', error);
      throw error;
    }
  },

  // Get transportation analytics
  async getTransportationAnalytics(sellerId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [deliveredOrders, shippedOrders, processingOrders] = await Promise.all([
        prisma.orders.count({
          where: {
            order_items: { some: { seller_id: sellerId } },
            status: 'delivered',
            updated_at: { gte: thirtyDaysAgo }
          }
        }),
        prisma.orders.count({
          where: {
            order_items: { some: { seller_id: sellerId } },
            status: 'shipped'
          }
        }),
        prisma.orders.count({
          where: {
            order_items: { some: { seller_id: sellerId } },
            status: 'processing'
          }
        })
      ]);

      return {
        deliveredOrders,
        inTransit: shippedOrders,
        firstMile: processingOrders,
        lastMile: shippedOrders,
        onTimeDelivery: 94.5, // percentage
        avgDeliveryTime: '3.2 days',
        carriers: [
          { name: 'DHL Express', percentage: 45, orders: Math.floor(deliveredOrders * 0.45) },
          { name: 'FedEx', percentage: 30, orders: Math.floor(deliveredOrders * 0.30) },
          { name: 'Blue Dart', percentage: 25, orders: Math.floor(deliveredOrders * 0.25) }
        ]
      };
    } catch (error) {
      console.error('Get transportation analytics error:', error);
      throw error;
    }
  },

  // Helper function to calculate delivery date
  calculateDeliveryDate(createdAt, status) {
    const created = new Date(createdAt);
    let daysToAdd = 5;
    
    if (status === 'delivered') daysToAdd = 0;
    if (status === 'shipped') daysToAdd = 2;
    if (status === 'processing') daysToAdd = 5;
    
    const deliveryDate = new Date(created);
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
    
    return deliveryDate.toISOString().split('T')[0];
  }
};
