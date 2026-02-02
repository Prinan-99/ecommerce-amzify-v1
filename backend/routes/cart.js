import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/prisma.js';
import { authenticateToken, requireCustomer } from '../middleware/auth.js';

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const cartItems = await prisma.cart_items.findMany({
      where: { user_id: req.user.id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock_quantity: true,
            status: true
          }
        },
        product_variants: {
          select: {
            id: true,
            name: true,
            value: true,
            price_adjustment: true,
            stock_quantity: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Filter out inactive products and calculate totals
    const activeItems = cartItems.filter(item => item.products.status === 'active');
    
    let subtotal = 0;
    const items = activeItems.map(item => {
      const price = item.products.price + (item.product_variants?.price_adjustment || 0);
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      
      return {
        id: item.id,
        quantity: item.quantity,
        created_at: item.created_at,
        product_id: item.products.id,
        name: item.products.name,
        price: item.products.price,
        images: item.products.images,
        stock_quantity: item.products.stock_quantity,
        variant_id: item.product_variants?.id,
        variant_name: item.product_variants?.name,
        variant_value: item.product_variants?.value,
        price_adjustment: item.product_variants?.price_adjustment,
        variant_stock: item.product_variants?.stock_quantity,
        unit_price: price,
        total_price: itemTotal
      };
    });

    res.json({
      items,
      summary: {
        items_count: items.length,
        total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        tax: subtotal * 0.18, // 18% GST
        total: subtotal * 1.18
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/items', authenticateToken, requireCustomer, [
  body('product_id').isUUID(),
  body('variant_id').optional().isUUID(),
  body('quantity').isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, variant_id, quantity } = req.body;

    // Check if product exists and is active
    const product = await prisma.products.findFirst({
      where: {
        id: product_id,
        status: 'active'
      },
      select: {
        id: true,
        stock_quantity: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or inactive' });
    }

    // Check variant if provided
    let availableStock = product.stock_quantity;
    if (variant_id) {
      const variant = await prisma.product_variants.findFirst({
        where: {
          id: variant_id,
          product_id
        },
        select: {
          stock_quantity: true
        }
      });

      if (!variant) {
        return res.status(404).json({ error: 'Product variant not found' });
      }

      availableStock = variant.stock_quantity;
    }

    // Check stock availability
    if (quantity > availableStock) {
      return res.status(400).json({ 
        error: 'Insufficient stock', 
        available: availableStock 
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cart_items.findFirst({
      where: {
        user_id: req.user.id,
        product_id,
        variant_id: variant_id || null
      }
    });

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > availableStock) {
        return res.status(400).json({ 
          error: 'Total quantity exceeds available stock', 
          available: availableStock,
          current_in_cart: existingItem.quantity
        });
      }

      const updatedItem = await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          updated_at: new Date()
        }
      });

      res.json({
        message: 'Cart item updated successfully',
        item: updatedItem
      });
    } else {
      // Add new item
      const newItem = await prisma.cart_items.create({
        data: {
          user_id: req.user.id,
          product_id,
          variant_id,
          quantity
        }
      });

      res.status(201).json({
        message: 'Item added to cart successfully',
        item: newItem
      });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/items/:id', authenticateToken, requireCustomer, [
  body('quantity').isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { quantity } = req.body;

    // Get cart item with product info
    const cartItem = await prisma.cart_items.findFirst({
      where: {
        id,
        user_id: req.user.id
      },
      include: {
        products: {
          select: { stock_quantity: true }
        },
        product_variants: {
          select: { stock_quantity: true }
        }
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const availableStock = cartItem.product_variants?.stock_quantity || cartItem.products.stock_quantity;

    if (quantity > availableStock) {
      return res.status(400).json({ 
        error: 'Insufficient stock', 
        available: availableStock 
      });
    }

    const updatedItem = await prisma.cart_items.update({
      where: { id },
      data: {
        quantity,
        updated_at: new Date()
      }
    });

    res.json({
      message: 'Cart item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart
router.delete('/items/:id', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await prisma.cart_items.deleteMany({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (deletedItem.count === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// Clear cart
router.delete('/', authenticateToken, requireCustomer, async (req, res) => {
  try {
    await prisma.cart_items.deleteMany({
      where: { user_id: req.user.id }
    });
    
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;