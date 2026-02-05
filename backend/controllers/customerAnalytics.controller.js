import prisma from '../config/prisma.js';
import { Parser } from 'json2csv';

// Helper function to calculate customer type
const getCustomerType = (orderCount, firstOrderDate) => {
  const daysSinceFirst = Math.floor((new Date() - new Date(firstOrderDate)) / (1000 * 60 * 60 * 24));
  
  if (orderCount >= 3) return 'loyal';
  if (orderCount > 1) return 'returning';
  if (daysSinceFirst <= 30) return 'new';
  return 'new';
};

// Helper function to calculate customer segment
const getCustomerSegment = (orderCount, totalSpent, lastOrderDate) => {
  const daysSinceLastOrder = lastOrderDate 
    ? Math.floor((new Date() - new Date(lastOrderDate)) / (1000 * 60 * 60 * 24))
    : 999;
  
  if (orderCount >= 3) return 'loyal';
  if (parseFloat(totalSpent) > 5000) return 'high_value';
  if (daysSinceLastOrder > 60 && orderCount > 0) return 'at_risk';
  if (daysSinceLastOrder <= 30 && orderCount === 1) return 'new';
  return 'regular';
};

export const customerAnalyticsController = {
  // Get customer analytics overview
  async getOverview(req, res) {
    try {
      const sellerId = req.user.id;
      const { startDate, endDate } = req.query;

      // Build date filter
      const dateFilter = {};
      if (startDate || endDate) {
        dateFilter.created_at = {};
        if (startDate) dateFilter.created_at.gte = new Date(startDate);
        if (endDate) dateFilter.created_at.lte = new Date(endDate);
      }

      // Get total customers (who bought from this seller)
      const totalCustomers = await prisma.users.count({
        where: {
          role: 'customer',
          orders: {
            some: {
              order_items: {
                some: {
                  seller_id: sellerId
                }
              }
            }
          }
        }
      });

      // Get new customers this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const newCustomersThisMonth = await prisma.users.count({
        where: {
          role: 'customer',
          created_at: {
            gte: firstDayOfMonth
          },
          orders: {
            some: {
              order_items: {
                some: {
                  seller_id: sellerId
                }
              }
            }
          }
        }
      });

      // Get all customer order data for calculations
      const customersWithOrders = await prisma.$queryRaw`
        SELECT 
          u.id,
          COUNT(DISTINCT o.id) as order_count,
          SUM(oi.total_price) as total_spent,
          MAX(o.created_at) as last_order_date,
          MIN(o.created_at) as first_order_date
        FROM users u
        INNER JOIN orders o ON o.customer_id = u.id
        INNER JOIN order_items oi ON oi.order_id = o.id
        WHERE oi.seller_id = ${sellerId}::uuid
        AND u.role = 'customer'
        GROUP BY u.id
      `;

      // Calculate metrics
      let returningCustomers = 0;
      let totalOrders = 0;
      let totalRevenue = 0;
      let repeatPurchases = 0;

      customersWithOrders.forEach(customer => {
        const orderCount = parseInt(customer.order_count);
        const spent = parseFloat(customer.total_spent || 0);
        
        totalOrders += orderCount;
        totalRevenue += spent;
        
        if (orderCount > 1) {
          returningCustomers++;
          repeatPurchases += (orderCount - 1);
        }
      });

      const repeatPurchaseRate = totalCustomers > 0 
        ? ((returningCustomers / totalCustomers) * 100).toFixed(1)
        : 0;

      const averageOrderValue = totalOrders > 0 
        ? (totalRevenue / totalOrders).toFixed(2)
        : 0;

      const customerLifetimeValue = totalCustomers > 0 
        ? (totalRevenue / totalCustomers).toFixed(2)
        : 0;

      res.json({
        totalCustomers,
        newCustomersThisMonth,
        returningCustomers,
        repeatPurchaseRate: parseFloat(repeatPurchaseRate),
        averageOrderValue: parseFloat(averageOrderValue),
        customerLifetimeValue: parseFloat(customerLifetimeValue)
      });
    } catch (error) {
      console.error('Error fetching customer analytics overview:', error);
      res.status(500).json({ error: 'Failed to fetch customer analytics' });
    }
  },

  // Get customers list with search and filters
  async getCustomers(req, res) {
    try {
      const sellerId = req.user.id;
      const { 
        search, 
        segment, 
        startDate, 
        endDate,
        page = 1, 
        limit = 50 
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build search filter for SQL
      let searchFilter = '';
      if (search) {
        searchFilter = `AND (u.email ILIKE '%${search}%' OR u.first_name ILIKE '%${search}%' OR u.last_name ILIKE '%${search}%' OR u.phone ILIKE '%${search}%')`;
      }

      // Build date filter
      let dateFilter = '';
      if (startDate) {
        dateFilter += `AND o.created_at >= '${startDate}'::timestamp `;
      }
      if (endDate) {
        dateFilter += `AND o.created_at <= '${endDate}'::timestamp `;
      }

      // Get customers with their order statistics
      const customers = await prisma.$queryRawUnsafe(`
        SELECT 
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.phone,
          COUNT(DISTINCT o.id) as total_orders,
          COALESCE(SUM(oi.total_price), 0) as total_spent,
          MAX(o.created_at) as last_order_date,
          MIN(o.created_at) as first_order_date
        FROM users u
        INNER JOIN orders o ON o.customer_id = u.id
        INNER JOIN order_items oi ON oi.order_id = o.id
        WHERE oi.seller_id = '${sellerId}'::uuid
        AND u.role = 'customer'
        ${searchFilter}
        ${dateFilter}
        GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone
        ORDER BY total_spent DESC
        LIMIT ${parseInt(limit)} OFFSET ${offset}
      `);

      // Calculate customer type for each customer
      const enrichedCustomers = customers.map(customer => {
        const orderCount = parseInt(customer.total_orders);
        const totalSpent = parseFloat(customer.total_spent);
        const customerType = getCustomerType(orderCount, customer.first_order_date);
        const customerSegment = getCustomerSegment(orderCount, totalSpent, customer.last_order_date);
        
        return {
          id: customer.id,
          name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'N/A',
          email: customer.email,
          phone: customer.phone || 'N/A',
          total_orders: orderCount,
          total_spent: totalSpent,
          last_order_date: customer.last_order_date,
          customer_type: customerType,
          customer_segment: customerSegment
        };
      });

      // Apply segment filter if provided
      let filteredCustomers = enrichedCustomers;
      if (segment) {
        filteredCustomers = enrichedCustomers.filter(c => c.customer_segment === segment);
      }

      // Get total count for pagination
      const totalCount = await prisma.$queryRawUnsafe(`
        SELECT COUNT(DISTINCT u.id) as count
        FROM users u
        INNER JOIN orders o ON o.customer_id = u.id
        INNER JOIN order_items oi ON oi.order_id = o.id
        WHERE oi.seller_id = '${sellerId}'::uuid
        AND u.role = 'customer'
        ${searchFilter}
        ${dateFilter}
      `);

      res.json({
        customers: filteredCustomers,
        total: parseInt(totalCount[0].count),
        page: parseInt(page),
        totalPages: Math.ceil(parseInt(totalCount[0].count) / parseInt(limit))
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  },

  // Get customer profile details
  async getCustomerProfile(req, res) {
    try {
      const sellerId = req.user.id;
      const { customerId } = req.params;

      // Get customer basic info
      const customer = await prisma.users.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          phone: true,
          created_at: true,
          addresses: true
        }
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Get order history for this seller
      const orders = await prisma.orders.findMany({
        where: {
          customer_id: customerId,
          order_items: {
            some: {
              seller_id: sellerId
            }
          }
        },
        include: {
          order_items: {
            where: {
              seller_id: sellerId
            },
            include: {
              products: {
                select: {
                  name: true,
                  images: true
                }
              }
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      // Get support tickets
      const tickets = await prisma.support_tickets.findMany({
        where: {
          user_id: customerId
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 10
      });

      // Calculate order statistics
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => {
        const orderTotal = order.order_items.reduce((s, item) => s + parseFloat(item.total_price), 0);
        return sum + orderTotal;
      }, 0);

      const customerType = getCustomerType(totalOrders, customer.created_at);

      res.json({
        profile: {
          id: customer.id,
          name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'N/A',
          email: customer.email,
          phone: customer.phone,
          joinedDate: customer.created_at,
          customer_type: customerType
        },
        stats: {
          totalOrders,
          totalSpent: totalSpent.toFixed(2),
          averageOrderValue: totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : 0
        },
        orders,
        addresses: customer.addresses,
        tickets
      });
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      res.status(500).json({ error: 'Failed to fetch customer profile' });
    }
  },

  // Get customer activity timeline
  async getCustomerActivity(req, res) {
    try {
      const { customerId } = req.params;
      const sellerId = req.user.id;

      // Check if customer_activity table exists, if not return mock data
      try {
        const activities = await prisma.$queryRaw`
          SELECT * FROM customer_activity 
          WHERE customer_id = ${customerId}::uuid 
          ORDER BY created_at DESC 
          LIMIT 50
        `;
        
        res.json({ activities });
      } catch (err) {
        // Table might not exist yet, return empty array
        res.json({ activities: [] });
      }
    } catch (error) {
      console.error('Error fetching customer activity:', error);
      res.status(500).json({ error: 'Failed to fetch customer activity' });
    }
  },

  // Get customer segmentation data
  async getSegmentation(req, res) {
    try {
      const sellerId = req.user.id;

      const customersWithOrders = await prisma.$queryRaw`
        SELECT 
          u.id,
          COUNT(DISTINCT o.id) as order_count,
          SUM(oi.total_price) as total_spent,
          MAX(o.created_at) as last_order_date,
          MIN(o.created_at) as first_order_date
        FROM users u
        INNER JOIN orders o ON o.customer_id = u.id
        INNER JOIN order_items oi ON oi.order_id = o.id
        WHERE oi.seller_id = ${sellerId}::uuid
        AND u.role = 'customer'
        GROUP BY u.id
      `;

      const segments = {
        loyal: 0,
        high_value: 0,
        at_risk: 0,
        new: 0,
        regular: 0
      };

      customersWithOrders.forEach(customer => {
        const segment = getCustomerSegment(
          parseInt(customer.order_count),
          customer.total_spent,
          customer.last_order_date
        );
        segments[segment]++;
      });

      res.json({ segments });
    } catch (error) {
      console.error('Error fetching customer segmentation:', error);
      res.status(500).json({ error: 'Failed to fetch segmentation data' });
    }
  },

  // Export customers to CSV
  async exportCustomers(req, res) {
    try {
      const sellerId = req.user.id;
      const { startDate, endDate } = req.query;

      let dateFilter = '';
      if (startDate) dateFilter += `AND o.created_at >= '${startDate}'::timestamp `;
      if (endDate) dateFilter += `AND o.created_at <= '${endDate}'::timestamp `;

      const customers = await prisma.$queryRawUnsafe(`
        SELECT 
          u.email,
          u.first_name,
          u.last_name,
          u.phone,
          COUNT(DISTINCT o.id) as total_orders,
          COALESCE(SUM(oi.total_price), 0) as total_spent,
          MAX(o.created_at) as last_order_date
        FROM users u
        INNER JOIN orders o ON o.customer_id = u.id
        INNER JOIN order_items oi ON oi.order_id = o.id
        WHERE oi.seller_id = '${sellerId}'::uuid
        AND u.role = 'customer'
        ${dateFilter}
        GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone
        ORDER BY total_spent DESC
      `);

      const fields = ['email', 'first_name', 'last_name', 'phone', 'total_orders', 'total_spent', 'last_order_date'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(customers);

      res.header('Content-Type', 'text/csv');
      res.attachment(`customers_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } catch (error) {
      console.error('Error exporting customers:', error);
      res.status(500).json({ error: 'Failed to export customers' });
    }
  },

  // Export purchase report
  async exportPurchaseReport(req, res) {
    try {
      const sellerId = req.user.id;
      const { startDate, endDate } = req.query;

      let dateFilter = '';
      if (startDate) dateFilter += `AND o.created_at >= '${startDate}'::timestamp `;
      if (endDate) dateFilter += `AND o.created_at <= '${endDate}'::timestamp `;

      const purchases = await prisma.$queryRawUnsafe(`
        SELECT 
          u.email,
          u.first_name || ' ' || u.last_name as customer_name,
          o.order_number,
          o.created_at as order_date,
          oi.product_name,
          oi.quantity,
          oi.unit_price,
          oi.total_price
        FROM orders o
        INNER JOIN users u ON u.id = o.customer_id
        INNER JOIN order_items oi ON oi.order_id = o.id
        WHERE oi.seller_id = '${sellerId}'::uuid
        ${dateFilter}
        ORDER BY o.created_at DESC
      `);

      const fields = ['email', 'customer_name', 'order_number', 'order_date', 'product_name', 'quantity', 'unit_price', 'total_price'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(purchases);

      res.header('Content-Type', 'text/csv');
      res.attachment(`purchase_report_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } catch (error) {
      console.error('Error exporting purchase report:', error);
      res.status(500).json({ error: 'Failed to export purchase report' });
    }
  },

  // Export repeat customers
  async exportRepeatCustomers(req, res) {
    try {
      const sellerId = req.user.id;

      const repeatCustomers = await prisma.$queryRawUnsafe(`
        SELECT 
          u.email,
          u.first_name,
          u.last_name,
          u.phone,
          COUNT(DISTINCT o.id) as total_orders,
          COALESCE(SUM(oi.total_price), 0) as total_spent,
          MAX(o.created_at) as last_order_date,
          MIN(o.created_at) as first_order_date
        FROM users u
        INNER JOIN orders o ON o.customer_id = u.id
        INNER JOIN order_items oi ON oi.order_id = o.id
        WHERE oi.seller_id = '${sellerId}'::uuid
        AND u.role = 'customer'
        GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone
        HAVING COUNT(DISTINCT o.id) > 1
        ORDER BY total_orders DESC
      `);

      const fields = ['email', 'first_name', 'last_name', 'phone', 'total_orders', 'total_spent', 'last_order_date', 'first_order_date'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(repeatCustomers);

      res.header('Content-Type', 'text/csv');
      res.attachment(`repeat_customers_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } catch (error) {
      console.error('Error exporting repeat customers:', error);
      res.status(500).json({ error: 'Failed to export repeat customers' });
    }
  },

  // Get AI insights for customer
  async getAIInsights(req, res) {
    try {
      const sellerId = req.user.id;
      const { customerId } = req.params;

      // Get customer order history
      const orders = await prisma.orders.findMany({
        where: {
          customer_id: customerId,
          order_items: {
            some: {
              seller_id: sellerId
            }
          }
        },
        include: {
          order_items: {
            where: {
              seller_id: sellerId
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      if (orders.length === 0) {
        return res.json({
          nextPurchasePrediction: 'No purchase history available',
          suggestedDiscount: null,
          churnRisk: 'low'
        });
      }

      // Calculate insights
      const totalOrders = orders.length;
      const lastOrderDate = new Date(orders[0].created_at);
      const daysSinceLastOrder = Math.floor((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24));
      
      // Calculate average days between orders
      let avgDaysBetweenOrders = 30;
      if (orders.length > 1) {
        const orderDates = orders.map(o => new Date(o.created_at)).sort((a, b) => a - b);
        let totalDays = 0;
        for (let i = 1; i < orderDates.length; i++) {
          totalDays += Math.floor((orderDates[i] - orderDates[i-1]) / (1000 * 60 * 60 * 24));
        }
        avgDaysBetweenOrders = Math.floor(totalDays / (orderDates.length - 1));
      }

      // Predict next purchase
      const expectedNextPurchaseInDays = Math.max(0, avgDaysBetweenOrders - daysSinceLastOrder);
      let nextPurchasePrediction;
      if (expectedNextPurchaseInDays <= 7) {
        nextPurchasePrediction = 'Within next 7 days';
      } else if (expectedNextPurchaseInDays <= 30) {
        nextPurchasePrediction = `Within next ${expectedNextPurchaseInDays} days`;
      } else {
        nextPurchasePrediction = 'More than 30 days';
      }

      // Suggest discount
      let suggestedDiscount = null;
      if (daysSinceLastOrder > avgDaysBetweenOrders * 1.5) {
        suggestedDiscount = '15% to re-engage';
      } else if (totalOrders >= 5) {
        suggestedDiscount = '10% loyalty reward';
      }

      // Determine churn risk
      let churnRisk;
      if (daysSinceLastOrder > avgDaysBetweenOrders * 2) {
        churnRisk = 'high';
      } else if (daysSinceLastOrder > avgDaysBetweenOrders * 1.3) {
        churnRisk = 'medium';
      } else {
        churnRisk = 'low';
      }

      res.json({
        nextPurchasePrediction,
        suggestedDiscount,
        churnRisk,
        orderFrequency: `${avgDaysBetweenOrders} days`,
        daysSinceLastOrder
      });
    } catch (error) {
      console.error('Error getting AI insights:', error);
      res.status(500).json({ error: 'Failed to get AI insights' });
    }
  }
};
