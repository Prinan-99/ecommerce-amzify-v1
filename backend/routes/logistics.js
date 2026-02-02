import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all shipments (Admin only)
router.get('/shipments', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        o.id,
        o.order_number,
        o.tracking_number,
        o.status,
        o.shipping_address,
        o.created_at,
        o.updated_at,
        u.first_name || ' ' || u.last_name as customer_name,
        u.email as customer_email,
        COUNT(oi.id) as items_count,
        o.total_amount
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.tracking_number IS NOT NULL
      GROUP BY o.id, u.first_name, u.last_name, u.email
      ORDER BY o.created_at DESC
    `);

    client.release();

    res.json({
      success: true,
      shipments: result.rows
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

// Get order tracking history
router.get('/tracking/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const client = await pool.connect();
    
    // Check if user has access to this order
    const orderCheck = await client.query(`
      SELECT o.*, u.role 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      WHERE o.id = $1 AND (o.user_id = $2 OR $3 = 'admin' OR $3 = 'seller')
    `, [orderId, req.user.id, req.user.role]);

    if (orderCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Order not found or access denied' });
    }

    const trackingResult = await client.query(`
      SELECT * FROM order_tracking 
      WHERE order_id = $1 
      ORDER BY created_at ASC
    `, [orderId]);

    client.release();

    res.json({
      success: true,
      order: orderCheck.rows[0],
      tracking_history: trackingResult.rows
    });
  } catch (error) {
    console.error('Get tracking error:', error);
    res.status(500).json({ error: 'Failed to fetch tracking information' });
  }
});

// Update order tracking (Admin/Seller only)
router.post('/tracking/:orderId', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, description, location } = req.body;

    if (!status || !description) {
      return res.status(400).json({ error: 'Status and description are required' });
    }

    const client = await pool.connect();

    // Add tracking entry
    await client.query(`
      INSERT INTO order_tracking (order_id, status, description, location, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [orderId, status, description, location || null]);

    // Update order status if it's a major status change
    const statusUpdates = {
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };

    if (statusUpdates[status]) {
      await client.query(`
        UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2
      `, [statusUpdates[status], orderId]);
    }

    client.release();

    res.json({
      success: true,
      message: 'Tracking updated successfully'
    });
  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({ error: 'Failed to update tracking' });
  }
});

// Generate tracking number
router.post('/generate-tracking/:orderId', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { carrier } = req.body;

    const trackingNumber = `TRK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const client = await pool.connect();

    await client.query(`
      UPDATE orders 
      SET tracking_number = $1, carrier = $2, updated_at = NOW() 
      WHERE id = $3
    `, [trackingNumber, carrier || 'Standard', orderId]);

    // Add initial tracking entry
    await client.query(`
      INSERT INTO order_tracking (order_id, status, description, created_at)
      VALUES ($1, 'processing', 'Order is being prepared for shipment', NOW())
    `, [orderId]);

    client.release();

    res.json({
      success: true,
      tracking_number: trackingNumber,
      message: 'Tracking number generated successfully'
    });
  } catch (error) {
    console.error('Generate tracking error:', error);
    res.status(500).json({ error: 'Failed to generate tracking number' });
  }
});

// Get logistics statistics (Admin only)
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const client = await pool.connect();
    
    const stats = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'processing') as processing_orders,
        COUNT(*) FILTER (WHERE status = 'shipped') as shipped_orders,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
        COUNT(*) as total_orders
      FROM orders
      WHERE tracking_number IS NOT NULL
    `);

    const avgDeliveryTime = await client.query(`
      SELECT AVG(EXTRACT(DAY FROM (
        SELECT MAX(created_at) FROM order_tracking ot2 
        WHERE ot2.order_id = o.id AND ot2.status = 'delivered'
      ) - o.created_at)) as avg_delivery_days
      FROM orders o
      WHERE o.status = 'delivered'
    `);

    client.release();

    res.json({
      success: true,
      stats: {
        ...stats.rows[0],
        avg_delivery_days: Math.round(avgDeliveryTime.rows[0]?.avg_delivery_days || 0)
      }
    });
  } catch (error) {
    console.error('Get logistics stats error:', error);
    res.status(500).json({ error: 'Failed to fetch logistics statistics' });
  }
});

export default router;