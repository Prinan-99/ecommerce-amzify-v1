import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = role ? { role } : {};

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          role: true,
          first_name: true,
          last_name: true,
          phone: true,
          is_active: true,
          is_verified: true,
          created_at: true,
          seller_profiles: {
            select: {
              company_name: true,
              is_approved: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.users.count({ where: whereClause })
    ]);

    // Format the response
    const formattedUsers = users.map(user => ({
      ...user,
      company_name: user.seller_profiles[0]?.company_name,
      seller_approved: user.seller_profiles[0]?.is_approved,
      seller_profiles: undefined
    }));

    res.json({
      users: formattedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get pending sellers
router.get('/sellers/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const sellers = await prisma.users.findMany({
      where: {
        role: 'seller',
        seller_profiles: {
          some: {
            is_approved: false
          }
        }
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        created_at: true,
        seller_profiles: {
          select: {
            company_name: true,
            business_type: true,
            description: true,
            created_at: true
          }
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    // Format the response
    const formattedSellers = sellers.map(seller => ({
      id: seller.id,
      email: seller.email,
      first_name: seller.first_name,
      last_name: seller.last_name,
      phone: seller.phone,
      created_at: seller.created_at,
      company_name: seller.seller_profiles[0]?.company_name,
      business_type: seller.seller_profiles[0]?.business_type,
      description: seller.seller_profiles[0]?.description,
      application_date: seller.seller_profiles[0]?.created_at
    }));

    res.json({ sellers: formattedSellers });
  } catch (error) {
    console.error('Get pending sellers error:', error);
    res.status(500).json({ error: 'Failed to fetch pending sellers' });
  }
});

// Approve/reject seller
router.patch('/sellers/:id/approval', authenticateToken, requireAdmin, [
  body('approved').isBoolean(),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { approved } = req.body;

    const sellerProfile = await prisma.seller_profiles.update({
      where: { user_id: id },
      data: {
        is_approved: approved,
        approval_date: new Date(),
        updated_at: new Date()
      }
    });

    res.json({
      message: `Seller ${approved ? 'approved' : 'rejected'} successfully`,
      seller: sellerProfile
    });
  } catch (error) {
    console.error('Seller approval error:', error);
    res.status(500).json({ error: 'Failed to update seller status' });
  }
});

// Get all products for admin review
router.get('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status = 'pending_approval', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: { status },
        include: {
          categories: {
            select: { name: true }
          },
          users: {
            select: {
              first_name: true,
              last_name: true,
              seller_profiles: {
                select: { company_name: true }
              }
            }
          }
        },
        orderBy: { created_at: 'asc' },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.products.count({ where: { status } })
    ]);

    // Format the response
    const formattedProducts = products.map(product => ({
      ...product,
      category_name: product.categories?.name,
      seller_name: product.users ? `${product.users.first_name} ${product.users.last_name}` : null,
      company_name: product.users?.seller_profiles[0]?.company_name,
      categories: undefined,
      users: undefined
    }));

    res.json({
      products: formattedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Approve/reject product
router.patch('/products/:id/approval', authenticateToken, requireAdmin, [
  body('approved').isBoolean(),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { approved } = req.body;

    const status = approved ? 'active' : 'rejected';

    const product = await prisma.products.update({
      where: { id },
      data: {
        status,
        updated_at: new Date()
      }
    });

    res.json({
      message: `Product ${approved ? 'approved' : 'rejected'} successfully`,
      product
    });
  } catch (error) {
    console.error('Product approval error:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

// Get all orders
router.get('/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where: whereClause,
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
              email: true
            }
          },
          order_items: {
            select: { id: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.orders.count({ where: whereClause })
    ]);

    // Format the response
    const formattedOrders = orders.map(order => ({
      ...order,
      customer_name: order.users ? `${order.users.first_name} ${order.users.last_name}` : null,
      customer_email: order.users?.email,
      items_count: order.order_items.length,
      users: undefined,
      order_items: undefined
    }));

    res.json({
      orders: formattedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Toggle user active status
router.patch('/users/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.users.findUnique({
      where: { id },
      select: { is_active: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        is_active: !user.is_active,
        updated_at: new Date()
      }
    });

    res.json({
      message: `User ${updatedUser.is_active ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get all customer feedback
router.get('/feedback', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    const [feedback, total] = await Promise.all([
      prisma.customer_feedback.findMany({
        where: whereClause,
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.customer_feedback.count({ where: whereClause })
    ]);

    // Format the response
    const formattedFeedback = feedback.map(item => ({
      ...item,
      customer_full_name: item.users ? `${item.users.first_name} ${item.users.last_name}` : null,
      users: undefined
    }));

    res.json({
      feedback: formattedFeedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Update feedback status
router.patch('/feedback/:id', authenticateToken, requireAdmin, [
  body('status').isIn(['new', 'reviewed', 'responded', 'closed']),
  body('admin_response').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, admin_response } = req.body;

    const updateData = {
      status,
      updated_at: new Date()
    };

    if (admin_response) {
      updateData.admin_response = admin_response;
      updateData.responded_at = new Date();
    }

    const feedback = await prisma.customer_feedback.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// Respond to feedback
router.post('/feedback/:id/respond', authenticateToken, requireAdmin, [
  body('response').isString().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { response } = req.body;

    const feedback = await prisma.customer_feedback.update({
      where: { id },
      data: {
        admin_response: response,
        status: 'responded',
        responded_at: new Date(),
        updated_at: new Date()
      }
    });

    res.json({
      message: 'Response sent successfully',
      feedback
    });
  } catch (error) {
    console.error('Respond to feedback error:', error);
    res.status(500).json({ error: 'Failed to send response' });
  }
});

export default router;