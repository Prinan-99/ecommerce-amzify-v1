import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(p.id) as products_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    res.json({ categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category with products
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get category
    const categoryResult = await pool.query(
      'SELECT * FROM categories WHERE id = $1 AND is_active = true',
      [id]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get products in category
    const productsResult = await pool.query(`
      SELECT 
        p.id, p.name, p.slug, p.price, p.compare_price, p.images, 
        p.is_featured, p.created_at,
        u.first_name || ' ' || u.last_name as seller_name,
        sp.company_name
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN seller_profiles sp ON u.id = sp.user_id
      WHERE p.category_id = $1 AND p.status = 'active'
      ORDER BY p.is_featured DESC, p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [id, limit, offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM products WHERE category_id = $1 AND status = $2',
      [id, 'active']
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      category: categoryResult.rows[0],
      products: productsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

export default router;