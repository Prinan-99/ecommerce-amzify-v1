import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/prisma.js';
import { authenticateToken, requireCustomer, requireSeller } from '../middleware/auth.js';

const router = express.Router();

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `AMZ${timestamp.slice(-6)}${random}`;
};

// Create order from cart
router.post('/', authenticateToken, requireCustomer, [
  body('shipping_address').isObject(),
  body('shipping_address.street_address').trim().isLength({ min: 1 }),
  body('shipping_address.city').trim().isLength({ min: 1 }),
  body('shipping_address.state').trim().isLength({ min: 1 }),
  body('shipping_address.postal_code').trim().isLength({ min: 1 }),
  body('payment_method').isIn(['card', 'upi', 'cod']),
  body('billing_address').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shipping_address, billing_address, payment_method, notes } = req.body;

    // Get cart items with product details
    const cartItems = await prisma.cart_items.findMany({
      where: { user_id: req.user.id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            seller_id: true,
            stock_quantity: true,
            sku: true,
            status: true
          }
        },
        product_variants: {
          select: {
            id: true,
            price_adjustment: true,
            stock_quantity: true
          }
        }
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      if (item.products.status !== 'active') {
        return res.status(400).json({ 
          error: `Product ${item.products.name} is no longer available`
        });
      }

      const availableStock = item.product_variants?.stock_quantity || item.products.stock_quantity;
      
      if (item.quantity > availableStock) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.products.name}`,
          available: availableStock,
          requested: item.quantity
        });
      }

      const unitPrice = item.products.price + (item.product_variants?.price_adjustment || 0);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        product_id: item.products.id,
        variant_id: item.variant_id,
        seller_id: item.products.seller_id,
        product_name: item.products.name,
        product_sku: item.products.sku,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice
      });
    }

    const taxAmount = subtotal * 0.18; // 18% GST
    const shippingAmount = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Create order and order items in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const orderNumber = generateOrderNumber();
      
      const order = await tx.orders.create({
        data: {
          customer_id: req.user.id,
          order_number: orderNumber,
          subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
          payment_method,
          shipping_address,
          billing_address,
          notes
        }
      });

      // Create order items and update stock
      for (const item of orderItems) {
        await tx.order_items.create({
          data: {
            order_id: order.id,
            ...item
          }
        });

        // Update stock
        if (item.variant_id) {
          await tx.product_variants.update({
            where: { id: item.variant_id },
            data: {
              stock_quantity: {
                decrement: item.quantity
              }
            }
          });
        } else {
          await tx.products.update({
            where: { id: item.product_id },
            data: {
              stock_quantity: {
                decrement: item.quantity
              }
            }
          });
        }
      }

      // Clear cart
      await tx.cart_items.deleteMany({
        where: { user_id: req.user.id }
      });

      return { order, items: orderItems };
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: result.order,
      items: result.items
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get customer orders
router.get('/my-orders', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where: { customer_id: req.user.id },
        include: {
          order_items: {
            select: { id: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.orders.count({ where: { customer_id: req.user.id } })
    ]);

    // Format the response
    const formattedOrders = orders.map(order => ({
      ...order,
      items_count: order.order_items.length,
      order_items: undefined
    }));

    res.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let whereClause = { id };

    // Apply role-based access control
    if (req.user.role === 'customer') {
      whereClause.customer_id = req.user.id;
    } else if (req.user.role === 'seller') {
      // For sellers, check if they have items in this order
      const hasItems = await prisma.order_items.findFirst({
        where: {
          order_id: id,
          seller_id: req.user.id
        }
      });

      if (!hasItems) {
        return res.status(404).json({ error: 'Order not found' });
      }
    }
    // Admin can see all orders

    const order = await prisma.orders.findFirst({
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
          include: {
            products: {
              select: { images: true }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status (seller for their items, admin for all)
router.patch('/:id/status', authenticateToken, [
  body('status').isIn(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Check permissions
    if (req.user.role === 'seller') {
      // Seller can only update orders containing their products
      const hasItems = await prisma.order_items.findFirst({
        where: {
          order_id: id,
          seller_id: req.user.id
        }
      });

      if (!hasItems) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const order = await prisma.orders.update({
      where: { id },
      data: {
        status,
        updated_at: new Date()
      }
    });

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get seller orders
router.get('/seller/my-orders', authenticateToken, requireSeller, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get orders that contain items from this seller
    const [orderItems, total] = await Promise.all([
      prisma.order_items.findMany({
        where: { seller_id: req.user.id },
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
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.order_items.count({ where: { seller_id: req.user.id } })
    ]);

    // Group by order and calculate seller-specific totals
    const ordersMap = new Map();
    
    orderItems.forEach(item => {
      const order = item.orders;
      if (!ordersMap.has(order.id)) {
        ordersMap.set(order.id, {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total_amount: order.total_amount,
          created_at: order.created_at,
          first_name: order.users.first_name,
          last_name: order.users.last_name,
          email: order.users.email,
          my_items_count: 0,
          my_total: 0
        });
      }
      
      const orderData = ordersMap.get(order.id);
      orderData.my_items_count += 1;
      orderData.my_total += parseFloat(item.total_price);
    });

    const orders = Array.from(ordersMap.values());

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;