import express from 'express';
import { body, validationResult, query } from 'express-validator';
import prisma from '../config/prisma.js';
import { authenticateToken, requireSeller, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all products (public)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isUUID(),
  query('search').optional().isLength({ min: 1, max: 100 }),
  query('sort').optional().isIn(['name', 'price', 'created_at', 'rating']),
  query('order').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { category, search, sort = 'created_at', order = 'desc' } = req.query;

    let whereClause = { status: 'active' };

    if (category) {
      whereClause.category_id = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orderBy = {};
    orderBy[sort] = order;

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          short_description: true,
          price: true,
          compare_price: true,
          images: true,
          stock_quantity: true,
          is_featured: true,
          created_at: true,
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
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.products.count({ where: whereClause })
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
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.products.findFirst({
      where: {
        id,
        status: 'active'
      },
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
        },
        product_variants: {
          select: {
            id: true,
            name: true,
            value: true,
            price_adjustment: true,
            stock_quantity: true,
            sku: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Format the response
    const formattedProduct = {
      ...product,
      category_name: product.categories?.name,
      seller_name: product.users ? `${product.users.first_name} ${product.users.last_name}` : null,
      company_name: product.users?.seller_profiles[0]?.company_name,
      variants: product.product_variants,
      categories: undefined,
      users: undefined,
      product_variants: undefined
    };

    res.json({ product: formattedProduct });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (seller only)
router.post('/', authenticateToken, requireSeller, [
  body('name').trim().isLength({ min: 1, max: 255 }),
  body('description').optional().isLength({ max: 5000 }),
  body('short_description').optional().isLength({ max: 500 }),
  body('price').isFloat({ min: 0 }),
  body('compare_price').optional().isFloat({ min: 0 }),
  body('cost_price').optional().isFloat({ min: 0 }),
  body('category_id').isUUID(),
  body('stock_quantity').optional().isInt({ min: 0 }),
  body('sku').optional().isLength({ max: 100 }),
  body('weight').optional().isFloat({ min: 0 }),
  body('images').optional().isArray(),
  body('status').optional().isIn(['draft', 'active', 'inactive'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, description, short_description, price, compare_price, cost_price,
      category_id, stock_quantity = 0, sku, weight, images = [], dimensions, status = 'draft'
    } = req.body;

    // Generate slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();

    const product = await prisma.products.create({
      data: {
        seller_id: req.user.id,
        category_id,
        name,
        slug,
        description,
        short_description,
        price,
        compare_price,
        cost_price,
        stock_quantity,
        sku,
        weight,
        images,
        dimensions: dimensions ? JSON.stringify(dimensions) : null,
        status: status // Use the status from request (draft, active, or inactive)
      }
    });

    const message = status === 'active' 
      ? 'Product created and published successfully!' 
      : 'Product saved as draft.';

    res.status(201).json({
      message,
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 'P2002') { // Unique constraint violation
      return res.status(400).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (seller only - own products)
router.put('/:id', authenticateToken, requireSeller, [
  body('name').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().isLength({ max: 5000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('stock_quantity').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['draft', 'active', 'inactive'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    // Check if product belongs to seller
    const existingProduct = await prisma.products.findFirst({
      where: {
        id,
        seller_id: req.user.id
      }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    // Filter out undefined values
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateData.updated_at = new Date();

    const product = await prisma.products.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (seller only - own products)
router.delete('/:id', authenticateToken, requireSeller, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product belongs to seller
    const existingProduct = await prisma.products.findFirst({
      where: {
        id,
        seller_id: req.user.id
      }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    // Delete related data first (in transaction)
    await prisma.$transaction(async (tx) => {
      // Delete product variants
      await tx.product_variants.deleteMany({
        where: { product_id: id }
      });

      // Delete cart items
      await tx.cart_items.deleteMany({
        where: { product_id: id }
      });

      // Delete wishlist items
      await tx.wishlist_items.deleteMany({
        where: { product_id: id }
      });

      // Finally delete the product
      await tx.products.delete({
        where: { id }
      });
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get seller's products
router.get('/seller/my-products', authenticateToken, requireSeller, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: { seller_id: req.user.id },
        include: {
          categories: {
            select: { name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.products.count({ where: { seller_id: req.user.id } })
    ]);

    // Format the response
    const formattedProducts = products.map(product => ({
      ...product,
      category_name: product.categories?.name,
      categories: undefined
    }));

    res.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get seller dashboard stats
router.get('/seller/dashboard-stats', authenticateToken, requireSeller, async (req, res) => {
  try {
    const sellerId = req.user.userId;
    
    // Get comprehensive seller stats
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      monthlyRevenue,
      topProducts,
      recentOrders
    ] = await Promise.all([
      // Total products count
      prisma.products.count({ where: { seller_id: sellerId } }),
      
      // Active products count  
      prisma.products.count({ where: { seller_id: sellerId, status: 'active' } }),
      
      // Total orders (count of distinct orders with items from this seller)
      prisma.order_items.findMany({
        where: { seller_id: sellerId },
        distinct: ['order_id']
      }).then(items => new Set(items.map(i => i.order_id)).size),
      
      // Pending orders from this seller
      prisma.orders.count({
        where: {
          status: 'pending',
          order_items: {
            some: {
              seller_id: sellerId
            }
          }
        }
      }),
      
      // Total revenue (aggregate from order items)
      prisma.order_items.aggregate({
        where: {
          seller_id: sellerId
        },
        _sum: { 
          subtotal: true 
        }
      }),
      
      // Monthly revenue (last 30 days)
      prisma.order_items.aggregate({
        where: {
          seller_id: sellerId,
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        _sum: { total_price: true }
      }),
      
      // Top performing products
      prisma.products.findMany({
        where: { seller_id: sellerId },
        orderBy: { created_at: 'desc' },
        take: 6,
        include: {
          categories: {
            select: { name: true }
          },
          order_items: {
            where: { seller_id: sellerId },
            select: { quantity: true, total_price: true }
          }
        }
      }),
      
      // Recent orders
      prisma.order_items.findMany({
        where: { seller_id: sellerId },
        include: {
          orders: {
            select: {
              users: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true
                            },
                            include: {
                              users: {
                                select: {
                                  first_name: true,
                                  last_name: true,
                                  email: true
                                }
                              }
                }
              }
            }
          },
          products: {
            select: {
              name: true,
              price: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 10
      }),
      
      // Products by category
      prisma.categories.findMany({
        where: {
          products: {
            some: { seller_id: sellerId }
          }
        },
        include: {
          _count: {
            select: {
              products: {
                where: { seller_id: sellerId }
              }
            }
          }
        }
      })
    ]);

    // Calculate top products with sales data
    const productsWithStats = topProducts.map(product => {
      const totalSold = product.order_items.reduce((sum, item) => sum + item.quantity, 0);
      const totalRevenue = product.order_items.reduce((sum, item) => sum + item.total_price, 0);
      
      return {
        ...product,
        totalSold,
        totalRevenue,
        order_items: undefined // Remove from response
      };
    }).sort((a, b) => b.totalSold - a.totalSold);

    // Format recent orders
    const formattedOrders = recentOrders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: `${order.users.first_name} ${order.users.last_name}`,
      customerEmail: order.users.email,
      totalAmount: order.total_amount,
      status: order.status,
      itemCount: order.order_items.length,
      items: order.order_items.map(item => ({
        productName: item.products.name,
        quantity: item.quantity,
        price: item.products.price
      })),
      createdAt: order.created_at
    }));

    // Calculate growth percentages (mock for now, could be real with date ranges)
    const stats = {
      totalRevenue: totalRevenue._sum.total_price || 0,
      monthlyRevenue: monthlyRevenue._sum.total_price || 0,
      totalProducts: totalProducts,
      activeProducts: activeProducts,
      totalOrders: totalOrders,
      pendingOrders: pendingOrders,
      
      // Growth percentages (could be calculated with historical data)
      revenueGrowth: 12.5,
      ordersGrowth: 8.3,
      productsGrowth: 15.2,
      
      // Additional metrics
      averageOrderValue: totalOrders > 0 ? (totalRevenue._sum.total_price || 0) / totalOrders : 0,
      conversionRate: 3.4, // Could be calculated from analytics
    };

    res.json({
      stats,
      topProducts: productsWithStats.slice(0, 6),
      recentOrders: formattedOrders,
      categoryBreakdown: categoryStats.map(cat => ({
        name: cat.name,
        productCount: cat._count.products,
        percentage: totalProducts > 0 ? (cat._count.products / totalProducts) * 100 : 0
      }))
    });
    
  } catch (error) {
    console.error('Get seller dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get seller revenue analytics (for charts)
router.get('/seller/revenue-analytics', authenticateToken, requireSeller, async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { period = '7d' } = req.query;
    
    let startDate;
    switch(period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get daily revenue data
    const revenueData = await prisma.$queryRaw`
      SELECT 
        DATE(o.created_at) as date,
        COUNT(DISTINCT o.id) as orders,
        SUM(oi.subtotal) as revenue,
        COUNT(DISTINCT o.customer_id) as customers
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = ${sellerId}
      AND o.created_at >= ${startDate}
      GROUP BY DATE(o.created_at)
      ORDER BY date ASC
    `;

    // Format data for charts
    const chartData = revenueData.map(row => ({
      date: row.date.toISOString().split('T')[0],
      revenue: parseFloat(row.revenue) || 0,
      orders: parseInt(row.orders) || 0,
      customers: parseInt(row.customers) || 0
    }));

    res.json({ chartData, period });
    
  } catch (error) {
    console.error('Get seller revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

// Approve product (admin only)
router.patch('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const status = approved ? 'active' : 'inactive';

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
    console.error('Approve product error:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

// Get top categories with product counts
router.get('/categories/top', async (req, res) => {
  try {
    const topCategories = await prisma.categories.findMany({
      where: {
        products: {
          some: {
            status: 'active'
          }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { products: { where: { status: 'active' } } }
        }
      },
      orderBy: {
        products: {
          _count: 'desc'
        }
      },
      take: 8
    });

    const formattedCategories = topCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      product_count: cat._count.products
    }));

    res.json({ categories: formattedCategories });
  } catch (error) {
    console.error('Get top categories error:', error);
    res.status(500).json({ error: 'Failed to fetch top categories' });
  }
});

// Get seller details by ID
router.get('/sellers/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await prisma.users.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        seller_profiles: {
          select: {
            id: true,
            company_name: true,
            business_type: true,
            description: true,
            logo: true,
            banner: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
            country: true
          }
        }
      }
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    res.json({ seller });
  } catch (error) {
    console.error('Get seller details error:', error);
    res.status(500).json({ error: 'Failed to fetch seller details' });
  }
});

// Get all products by a specific seller
router.get('/sellers/:sellerId/products', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const whereClause = {
      seller_id: sellerId,
      status: 'active'
    };

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          stock_quantity: true,
          created_at: true,
          categories: {
            select: { name: true }
          },
          users: {
            select: {
              first_name: true,
              last_name: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.products.count({ where: whereClause })
    ]);

    const formattedProducts = products.map(product => ({
      ...product,
      category_name: product.categories?.name,
      seller_name: product.users ? `${product.users.first_name} ${product.users.last_name}` : null,
      categories: undefined,
      users: undefined
    }));

    res.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ error: 'Failed to fetch seller products' });
  }
});

export default router;