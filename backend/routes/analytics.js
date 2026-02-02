import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireSeller, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Seller analytics
router.get('/seller/stats', authenticateToken, requireSeller, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    let dateFilter = '';
    switch (timeRange) {
      case '7d':
        dateFilter = "AND o.created_at >= NOW() - INTERVAL '7 days'";
        break;
      case '30d':
        dateFilter = "AND o.created_at >= NOW() - INTERVAL '30 days'";
        break;
      case '90d':
        dateFilter = "AND o.created_at >= NOW() - INTERVAL '90 days'";
        break;
      case '1y':
        dateFilter = "AND o.created_at >= NOW() - INTERVAL '1 year'";
        break;
    }

    // Get basic stats
    const statsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(DISTINCT o.customer_id) as total_customers,
        COALESCE(SUM(oi.total_price), 0) as total_revenue,
        COALESCE(AVG(oi.total_price), 0) as avg_order_value,
        COUNT(DISTINCT p.id) as total_products
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE oi.seller_id = $1 ${dateFilter}
    `, [req.user.id]);

    // Get top selling products
    const topProductsResult = await pool.query(`
      SELECT 
        p.name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE oi.seller_id = $1 ${dateFilter}
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `, [req.user.id]);

    // Get revenue trend
    const trendResult = await pool.query(`
      SELECT 
        DATE_TRUNC('day', o.created_at) as date,
        SUM(oi.total_price) as revenue,
        COUNT(DISTINCT o.id) as orders
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.seller_id = $1 ${dateFilter}
      GROUP BY DATE_TRUNC('day', o.created_at)
      ORDER BY date DESC
      LIMIT 30
    `, [req.user.id]);

    res.json({
      stats: statsResult.rows[0],
      topProducts: topProductsResult.rows,
      trend: trendResult.rows.reverse()
    });
  } catch (error) {
    console.error('Seller analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Admin analytics
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Platform overview
    const overviewResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM users WHERE role = 'seller') as total_sellers,
        (SELECT COUNT(*) FROM products WHERE status = 'active') as active_products,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders) as total_revenue
    `);

    // Recent activity
    const recentOrdersResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM orders 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `);

    const recentUsersResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `);

    // Top sellers by revenue
    const topSellersResult = await pool.query(`
      SELECT 
        u.first_name || ' ' || u.last_name as seller_name,
        sp.company_name,
        COUNT(DISTINCT o.id) as orders_count,
        COALESCE(SUM(oi.total_price), 0) as revenue
      FROM users u
      JOIN seller_profiles sp ON u.id = sp.user_id
      LEFT JOIN order_items oi ON u.id = oi.seller_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE u.role = 'seller' AND sp.is_approved = true
      GROUP BY u.id, u.first_name, u.last_name, sp.company_name
      ORDER BY revenue DESC
      LIMIT 10
    `);

    res.json({
      overview: overviewResult.rows[0],
      recentActivity: {
        orders: recentOrdersResult.rows[0].count,
        users: recentUsersResult.rows[0].count
      },
      topSellers: topSellersResult.rows
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;