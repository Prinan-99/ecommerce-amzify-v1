import express from 'express';
import prisma from '../config/prisma.js';
import { authenticateToken, requireSeller } from '../middleware/auth.js';

const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.categories.findMany({
      where: { is_active: true },
      include: {
        _count: {
          select: {
            products: {
              where: { status: 'active' }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const formattedCategories = categories.map(cat => ({
      ...cat,
      products_count: cat._count.products
    }));

    res.json({ categories: formattedCategories });
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
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get category
    const category = await prisma.categories.findFirst({
      where: { id, is_active: true }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get products in category
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: { category_id: id, status: 'active' },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          compare_price: true,
          images: true,
          is_featured: true,
          created_at: true,
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
        orderBy: [
          { is_featured: 'desc' },
          { created_at: 'desc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.products.count({
        where: { category_id: id, status: 'active' }
      })
    ]);

    const formattedProducts = products.map(p => ({
      ...p,
      seller_name: `${p.users.first_name} ${p.users.last_name}`,
      company_name: p.users.seller_profiles[0]?.company_name || null,
      users: undefined
    }));

    res.json({
      category,
      products: formattedProducts,
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

// Get seller's categories
router.get('/seller/my-categories', authenticateToken, requireSeller, async (req, res) => {
  try {
    const categories = await prisma.categories.findMany({
      where: { seller_id: req.user.userId },
      include: {
        _count: {
          select: {
            products: {
              where: { seller_id: req.user.userId }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const formattedCategories = categories.map(cat => ({
      ...cat,
      products_count: cat._count.products
    }));

    res.json({ categories: formattedCategories });
  } catch (error) {
    console.error('Get seller categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category (seller)
router.post('/', authenticateToken, requireSeller, async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    const sellerId = req.user.userId;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const category = await prisma.categories.create({
      data: {
        name,
        slug,
        description: description || null,
        seller_id: sellerId,
        is_active: true
      }
    });

    res.status(201).json({ category });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category (seller)
router.put('/:id', authenticateToken, requireSeller, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, is_active } = req.body;
    const sellerId = req.user.userId;

    // First check if category belongs to seller
    const existingCategory = await prisma.categories.findFirst({
      where: { id, seller_id: sellerId }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found or unauthorized' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;

    const category = await prisma.categories.update({
      where: { id },
      data: updateData
    });

    res.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (seller)
router.delete('/:id', authenticateToken, requireSeller, async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.userId;

    // First check if category belongs to seller
    const category = await prisma.categories.findFirst({
      where: { id, seller_id: sellerId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found or unauthorized' });
    }

    if (category._count.products > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with products. Please reassign products first.' 
      });
    }

    await prisma.categories.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;