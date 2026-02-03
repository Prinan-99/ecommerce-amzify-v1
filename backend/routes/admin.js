import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { mockUserStore } from '../services/mockUserStore.js';

const router = express.Router();

// Create mock seller (dev fallback)
router.post('/mock-sellers', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
  body('storeName').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, storeName, phone } = req.body;
    const [firstName, ...rest] = name.split(' ');
    const lastName = rest.length > 0 ? rest.join(' ') : 'Seller';

    const user = {
      id: `mock-seller-${Date.now()}`,
      email,
      role: 'seller',
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      is_verified: true,
      is_active: true,
      company_name: storeName,
      seller_approved: true,
      password_hash: await bcrypt.hash(password, 10)
    };

    await mockUserStore.upsertUser(user);

    res.json({
      message: 'Mock seller created',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        is_verified: user.is_verified,
        company_name: user.company_name,
        seller_approved: user.seller_approved
      }
    });
  } catch (error) {
    console.error('Mock seller create error:', error);
    res.status(500).json({ error: 'Failed to create mock seller' });
  }
});

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Try to fetch from database first
    try {
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
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User',
        email: user.email,
        role: user.role,
        status: user.is_active ? 'ACTIVE' : 'SUSPENDED',
        createdAt: user.created_at,
        lastLoginIp: null,
        lastActive: user.created_at,
        company_name: user.seller_profiles[0]?.company_name,
        seller_approved: user.seller_profiles[0]?.is_approved
      }));

      return res.json({
        users: formattedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (dbError) {
      // Fallback to mock store
      console.log('Database failed, using mock store fallback');
      const allMockUsers = await mockUserStore.getUsers();
      const mockUsers = allMockUsers
        .filter(u => !role || u.role === role)
        .slice(offset, offset + parseInt(limit));

      const formattedUsers = mockUsers.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User',
        email: user.email,
        role: user.role,
        status: user.is_active ? 'ACTIVE' : 'SUSPENDED',
        createdAt: user.created_at || new Date(),
        lastLoginIp: null,
        lastActive: user.created_at || new Date(),
        company_name: user.company_name,
        seller_approved: user.seller_approved
      }));

      const totalMockUsers = allMockUsers.filter(u => !role || u.role === role).length;
      
      return res.json({
        users: formattedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalMockUsers,
          pages: Math.ceil(totalMockUsers / limit)
        }
      });
    }
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all sellers (with fallback to mockUserStore)
router.get('/sellers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Try to fetch from database first
    try {
      const [sellers, total] = await Promise.all([
        prisma.users.findMany({
          where: { role: 'seller' },
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
        prisma.users.count({ where: { role: 'seller' } })
      ]);

      const formattedSellers = sellers.map(seller => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        email: seller.email,
        role: seller.role,
        phone: seller.phone,
        status: seller.is_active ? 'ACTIVE' : 'SUSPENDED',
        company_name: seller.seller_profiles[0]?.company_name || 'N/A',
        is_approved: seller.seller_profiles[0]?.is_approved || false,
        is_verified: seller.is_verified,
        created_at: seller.created_at
      }));

      return res.json({
        sellers: formattedSellers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (dbError) {
      // Fallback to mock store
      const allMockUsers = await mockUserStore.getUsers();
      const mockSellers = allMockUsers
        .filter(u => u.role === 'seller')
        .slice(offset, offset + parseInt(limit));

      const totalMockSellers = allMockUsers.filter(u => u.role === 'seller').length;
      
      return res.json({
        sellers: mockSellers.map(seller => ({
          id: seller.id,
          name: `${seller.first_name} ${seller.last_name}`,
          email: seller.email,
          role: seller.role,
          phone: seller.phone,
          status: seller.is_active ? 'ACTIVE' : 'SUSPENDED',
          company_name: seller.company_name || 'N/A',
          is_approved: seller.seller_approved || false,
          is_verified: seller.is_verified,
          created_at: seller.created_at || new Date()
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalMockSellers,
          pages: Math.ceil(totalMockSellers / limit)
        }
      });
    }
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({ error: 'Failed to fetch sellers' });
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

// Get feedback statistics
router.get('/feedback/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [allFeedback, newCount, reviewedCount, respondedCount] = await Promise.all([
      prisma.customer_feedback.findMany({
        select: { rating: true }
      }),
      prisma.customer_feedback.count({ where: { status: 'new' } }),
      prisma.customer_feedback.count({ where: { status: 'reviewed' } }),
      prisma.customer_feedback.count({ where: { status: 'responded' } })
    ]);

    const avgRating = allFeedback.length > 0
      ? (allFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / allFeedback.length).toFixed(1)
      : 0;

    res.json({
      new: newCount,
      under_review: reviewedCount,
      responded: respondedCount,
      avg_rating: parseFloat(avgRating)
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback stats' });
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