import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import prisma from '../config/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all seller applications (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = status ? { status } : {};

    const [applications, total] = await Promise.all([
      prisma.seller_applications.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          company_name: true,
          business_type: true,
          business_description: true,
          business_address: true,
          city: true,
          state: true,
          postal_code: true,
          gst_number: true,
          pan_number: true,
          bank_name: true,
          account_number: true,
          ifsc_code: true,
          account_holder_name: true,
          status: true,
          rejection_reason: true,
          reviewed_by: true,
          reviewed_at: true,
          created_at: true,
          updated_at: true
        }
      }),
      prisma.seller_applications.count({ where })
    ]);

    res.json({
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get application by ID (Admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const application = await prisma.seller_applications.findUnique({
      where: { id: req.params.id }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Approve seller application (Admin only)
router.post('/:id/approve', 
  authenticateToken, 
  requireAdmin,
  [body('category_id').optional().isUUID()],
  async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id } = req.body;
    const adminId = req.user.userId;

    const application = await prisma.seller_applications.findUnique({
      where: { id }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Application already processed' });
    }

    // Check if email is already registered
    const existingUser = await prisma.users.findUnique({
      where: { email: application.email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user and seller profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.users.create({
        data: {
          email: application.email,
          password_hash: application.password_hash,
          role: 'seller',
          first_name: application.first_name,
          last_name: application.last_name,
          phone: application.phone,
          is_verified: true,
          is_active: true
        }
      });

      // Create seller profile
      await tx.seller_profiles.create({
        data: {
          user_id: user.id,
          company_name: application.company_name,
          business_type: application.business_type,
          category_id: category_id || null,
          description: application.business_description,
          business_address: application.business_address,
          city: application.city,
          state: application.state,
          postal_code: application.postal_code,
          gst_number: application.gst_number,
          pan_number: application.pan_number,
          bank_name: application.bank_name,
          account_number: application.account_number,
          ifsc_code: application.ifsc_code,
          account_holder_name: application.account_holder_name,
          is_approved: true,
          approval_date: new Date()
        }
      });

      // Update application status
      const updatedApplication = await tx.seller_applications.update({
        where: { id },
        data: {
          status: 'approved',
          reviewed_by: adminId,
          reviewed_at: new Date()
        }
      });

      return { user, application: updatedApplication };
    });

    res.json({
      message: 'Seller application approved successfully',
      application: result.application
    });
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({ error: 'Failed to approve application' });
  }
});

// Reject seller application (Admin only)
router.post('/:id/reject', 
  authenticateToken, 
  requireAdmin,
  [body('reason').trim().isLength({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.userId;

      const application = await prisma.seller_applications.findUnique({
        where: { id }
      });

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      if (application.status !== 'pending') {
        return res.status(400).json({ error: 'Application already processed' });
      }

      const updatedApplication = await prisma.seller_applications.update({
        where: { id },
        data: {
          status: 'rejected',
          rejection_reason: reason,
          reviewed_by: adminId,
          reviewed_at: new Date()
        }
      });

      res.json({
        message: 'Seller application rejected',
        application: updatedApplication
      });
    } catch (error) {
      console.error('Reject application error:', error);
      res.status(500).json({ error: 'Failed to reject application' });
    }
  }
);

// Get application statistics (Admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [pending, approved, rejected, total] = await Promise.all([
      prisma.seller_applications.count({ where: { status: 'pending' } }),
      prisma.seller_applications.count({ where: { status: 'approved' } }),
      prisma.seller_applications.count({ where: { status: 'rejected' } }),
      prisma.seller_applications.count()
    ]);

    res.json({
      pending,
      approved,
      rejected,
      total
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
