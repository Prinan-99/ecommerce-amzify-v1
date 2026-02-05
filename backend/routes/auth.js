import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import prisma from '../config/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import emailService from '../services/emailService.js';
import { mockUserStore } from '../services/mockUserStore.js';

const router = express.Router();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

const PASSWORD_RESET_EXPIRES_IN = process.env.PASSWORD_RESET_EXPIRES_IN || '15m';
const PASSWORD_RESET_SECRET = process.env.JWT_RESET_SECRET || process.env.JWT_SECRET;

// Send OTP for email verification
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail(),
  body('type').isIn(['verification', 'password_reset'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, type } = req.body;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await prisma.otp_verifications.create({
      data: {
        email,
        otp,
        type,
        expires_at: expiresAt
      }
    });

    // Send OTP via email
    const emailSent = await emailService.sendOTP(email, otp, type);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.json({ 
      success: true, 
      message: 'OTP sent successfully to your email address',
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
  body('type').isIn(['verification', 'password_reset'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, type } = req.body;

    // Find valid OTP
    const otpRecord = await prisma.otp_verifications.findFirst({
      where: {
        email,
        otp,
        type,
        expires_at: {
          gt: new Date()
        },
        is_used: false
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await prisma.otp_verifications.update({
      where: { id: otpRecord.id },
      data: { is_used: true }
    });

    // If verification type, mark user as verified
    if (type === 'verification') {
      await prisma.users.updateMany({
        where: { email },
        data: { is_verified: true }
      });
    }

    res.json({ 
      success: true, 
      message: 'OTP verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// Forgot Password - Send reset link
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Always respond success to prevent user enumeration
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
    }

    const resetToken = jwt.sign(
      { email, purpose: 'password_reset' },
      PASSWORD_RESET_SECRET,
      { expiresIn: PASSWORD_RESET_EXPIRES_IN }
    );

    const frontendBase = process.env.FRONTEND_URL ?? process.env.VERCEL_URL ?? 'https://ecommerce-amzify-v1.onrender.com';
    const resetLink = `${frontendBase}/?resetToken=${encodeURIComponent(resetToken)}`;

    const emailSent = await emailService.sendPasswordResetLink(email, resetLink);
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    return res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset Password - Verify token and update password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    let payload;
    try {
      payload = jwt.verify(token, PASSWORD_RESET_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (!payload || payload.purpose !== 'password_reset' || !payload.email) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    const user = await prisma.users.findUnique({ where: { email: payload.email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id: user.id },
        data: { password_hash: passwordHash }
      });

      // Invalidate existing refresh tokens after password reset
      await tx.refresh_tokens.deleteMany({ where: { user_id: user.id } });
    });

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Customer Registration with OTP
router.post('/register/customer', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('otp').optional().isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone, otp } = req.body;

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    let isVerified = false;

    // If OTP provided, verify it
    if (otp) {
      const otpRecord = await prisma.otp_verifications.findFirst({
        where: {
          email,
          otp,
          type: 'verification',
          expires_at: {
            gt: new Date()
          },
          is_used: false
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      if (otpRecord) {
        // Mark OTP as used
        await prisma.otp_verifications.update({
          where: { id: otpRecord.id },
          data: { is_used: true }
        });
        isVerified = true;
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and refresh token in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          email,
          password_hash: passwordHash,
          role: 'customer',
          first_name: firstName,
          last_name: lastName,
          phone,
          is_verified: true, // Always verify customers on signup (no OTP required)
          is_active: true
        },
        select: {
          id: true,
          email: true,
          role: true,
          first_name: true,
          last_name: true,
          is_verified: true
        }
      });

      const tokens = generateTokens(user.id);

      // Store refresh token
      await tx.refresh_tokens.create({
        data: {
          user_id: user.id,
          token: tokens.refreshToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      return { user, tokens };
    });

    res.status(201).json({
      message: 'Customer registered successfully',
      user: result.user,
      ...result.tokens,
      requiresVerification: !isVerified
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});
// Seller Application Submission
router.post('/apply/seller', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('companyName').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      email, password, firstName, lastName, phone, 
      companyName, businessType, businessDescription, businessAddress,
      city, state, postalCode, gstNumber, panNumber,
      bankName, accountNumber, ifscCode, accountHolderName
    } = req.body;

    // Check if application already exists
    const existingApplication = await prisma.seller_applications.findFirst({
      where: { 
        email,
        status: { in: ['pending', 'approved'] }
      }
    });
    
    if (existingApplication) {
      return res.status(400).json({ 
        error: existingApplication.status === 'approved' 
          ? 'Email already registered as seller' 
          : 'Application already submitted and under review'
      });
    }

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create seller application
    const application = await prisma.seller_applications.create({
      data: {
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone,
        company_name: companyName,
        business_type: businessType,
        business_description: businessDescription,
        business_address: businessAddress,
        city,
        state,
        postal_code: postalCode,
        gst_number: gstNumber,
        pan_number: panNumber,
        bank_name: bankName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        account_holder_name: accountHolderName,
        status: 'pending'
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        company_name: true,
        status: true,
        created_at: true
      }
    });

    res.status(201).json({
      message: 'Seller application submitted successfully. Admin will review your application soon.',
      application
    });
  } catch (error) {
    console.error('Seller application error:', error);
    res.status(500).json({ error: 'Application submission failed' });
  }
});

// Seller Registration (Direct - for backward compatibility)
router.post('/register/seller', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('companyName').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      email, password, firstName, lastName, phone, 
      companyName, businessType, businessDescription, businessAddress,
      city, state, postalCode, gstNumber, panNumber,
      bankName, accountNumber, ifscCode, accountHolderName
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create seller application for admin review
    const application = await prisma.seller_applications.create({
      data: {
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone: phone || '',
        company_name: companyName,
        business_type: businessType || 'Individual/Sole Proprietor',
        business_description: businessDescription || '',
        business_address: businessAddress || '',
        city: city || '',
        state: state || '',
        postal_code: postalCode || '',
        gst_number: gstNumber || '',
        pan_number: panNumber || '',
        bank_name: bankName || '',
        account_number: accountNumber || '',
        ifsc_code: ifscCode || '',
        account_holder_name: accountHolderName || '',
        status: 'pending'
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        company_name: true,
        status: true,
        created_at: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Seller application submitted successfully! Our admin team will review your application within 24-48 hours. You will receive an email with login credentials once approved.',
      application: {
        ...application,
        is_approved: false
      }
    });
  } catch (error) {
    console.error('Seller registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Get user with seller profile if applicable
      const user = await prisma.users.findUnique({
        where: { 
          email,
          is_active: true
        },
        include: {
          seller_profiles: {
            select: {
              company_name: true,
              is_approved: true
            }
          }
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if user is verified (sellers must be verified, customers auto-verified)
      if (user.role === 'seller' && !user.is_verified) {
        return res.status(403).json({ error: 'Email not verified. Please verify your email first.' });
      }

      // Check if seller is approved
      if (user.role === 'seller' && user.seller_profiles[0] && !user.seller_profiles[0].is_approved) {
        return res.status(403).json({ error: 'Seller account pending approval' });
      }

      const tokens = generateTokens(user.id);

      // Store refresh token
      await prisma.refresh_tokens.create({
        data: {
          user_id: user.id,
          token: tokens.refreshToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      // Format user data for response
      const userData = {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        is_verified: user.is_verified,
        company_name: user.seller_profiles[0]?.company_name,
        seller_approved: user.seller_profiles[0]?.is_approved
      };

      res.json({
        message: 'Login successful',
        user: userData,
        ...tokens
      });
    } catch (dbError) {
      // Database unavailable - use mock credentials
      console.warn('Database login failed, using mock credentials:', dbError.message);

      const mockUser = await mockUserStore.findByEmail(email);
      if (!mockUser) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, mockUser.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const tokens = generateTokens(mockUser.id);

      const userData = {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        phone: mockUser.phone || null,
        is_verified: mockUser.is_verified ?? true,
        company_name: mockUser.company_name || (mockUser.role === 'seller' ? 'Mock Seller Co.' : null),
        seller_approved: mockUser.role === 'seller' ? !!mockUser.seller_approved : false
      };

      res.json({
        message: 'Login successful (mock mode)',
        user: userData,
        ...tokens
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if token exists in database
    const tokenRecord = await prisma.refresh_tokens.findFirst({
      where: {
        token: refreshToken,
        expires_at: {
          gt: new Date()
        }
      }
    });

    if (!tokenRecord) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const tokens = generateTokens(decoded.userId);

    // Update refresh token in database
    await prisma.refresh_tokens.update({
      where: { id: tokenRecord.id },
      data: {
        token: tokens.refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.json(tokens);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Remove refresh token
    await prisma.refresh_tokens.deleteMany({
      where: { user_id: req.user.id }
    });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    try {
      const user = await prisma.users.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          role: true,
          first_name: true,
          last_name: true,
          phone: true,
          is_verified: true,
          seller_profiles: {
            select: {
              company_name: true,
              business_type: true,
              is_approved: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Format response
      const userData = {
        ...user,
        company_name: user.seller_profiles[0]?.company_name,
        business_type: user.seller_profiles[0]?.business_type,
        seller_approved: user.seller_profiles[0]?.is_approved,
        seller_profiles: undefined // Remove the nested object
      };

      res.json({ user: userData });
    } catch (dbError) {
      // Database unavailable - return mock user data based on token
      console.warn('Database /me query failed, using mock user:', dbError.message);
      
      // Extract email from userId if it's a mock ID
      let email = 'user@example.com';
      let role = 'customer';
      let firstName = 'User';
      let lastName = 'Test';
      
      if (req.user.id && req.user.id.includes('mock-')) {
        const parts = req.user.id.split('-');
        if (parts[1]) {
          email = `${parts[1]}@amzify.com`;
          if (parts[1] === 'admin') {
            role = 'admin';
            firstName = 'Admin';
            lastName = 'User';
          } else if (parts[1] === 'seller') {
            role = 'seller';
            firstName = 'Seller';
            lastName = 'User';
          } else if (parts[1] === 'customer') {
            role = 'customer';
            firstName = 'Customer';
            lastName = 'User';
          }
        }
      }

      const userData = {
        id: req.user.id,
        email,
        role,
        first_name: firstName,
        last_name: lastName,
        phone: null,
        is_verified: true,
        company_name: role === 'seller' ? 'Mock Seller Co.' : null,
        seller_approved: role === 'seller'
      };

      res.json({ user: userData });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Submit customer feedback
router.post('/feedback', [
  body('rating').isInt({ min: 1, max: 5 }),
  body('message').trim().isLength({ min: 1 }),
  body('type').optional().isIn(['general', 'product', 'service', 'complaint', 'suggestion'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, message, type = 'general' } = req.body;
    let customerName = 'Anonymous';
    let customerEmail = 'anonymous@example.com';
    let customerId = null;

    // If user is authenticated, get their details
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await prisma.users.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        });

        if (user) {
          customerId = user.id;
          customerEmail = user.email;
          customerName = `${user.first_name} ${user.last_name}`;
        }
      } catch (tokenError) {
        // Token invalid, continue as anonymous
      }
    }

    // Store feedback
    const feedback = await prisma.customer_feedback.create({
      data: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        type,
        rating,
        message
      }
    });

    // Send notification to admin
    try {
      await emailService.sendFeedbackNotification(feedback);
    } catch (emailError) {
      console.error('Failed to send feedback notification:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for your input!',
      feedback: {
        id: feedback.id,
        type: feedback.type,
        rating: feedback.rating,
        created_at: feedback.created_at
      }
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Request account deletion
router.post('/delete-account', authenticateToken, [
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.user.id;

    // Check if user exists and get role
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRole = user.role;

    // For sellers, check if they have active orders or products
    if (userRole === 'seller') {
      const activeOrdersCount = await prisma.order_items.count({
        where: {
          seller_id: userId,
          orders: {
            status: {
              in: ['pending', 'confirmed', 'processing', 'shipped']
            }
          }
        }
      });

      if (activeOrdersCount > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete account with active orders. Please complete all pending orders first.' 
        });
      }
    }

    // Create deletion request
    await prisma.account_deletion_requests.create({
      data: {
        user_id: userId,
        reason: reason || 'User requested account deletion'
      }
    });

    // For immediate deletion (customers), delete the account
    if (userRole === 'customer') {
      await prisma.$transaction(async (tx) => {
        // Delete user data in correct order (respecting foreign key constraints)
        await tx.refresh_tokens.deleteMany({ where: { user_id: userId } });
        await tx.cart_items.deleteMany({ where: { user_id: userId } });
        await tx.wishlist_items.deleteMany({ where: { user_id: userId } });
        await tx.addresses.deleteMany({ where: { user_id: userId } });
        await tx.support_tickets.deleteMany({ where: { user_id: userId } });
        
        // Update feedback to remove customer reference
        await tx.customer_feedback.updateMany({
          where: { customer_id: userId },
          data: { customer_id: null }
        });
        
        // Update deletion request status
        await tx.account_deletion_requests.updateMany({
          where: { user_id: userId },
          data: { 
            status: 'completed',
            processed_at: new Date()
          }
        });
        
        // Finally delete the user
        await tx.users.delete({ where: { id: userId } });
      });
        
      res.json({
        success: true,
        message: 'Account deleted successfully. We\'re sorry to see you go!'
      });
    } else {
      // For sellers, require admin approval
      res.json({
        success: true,
        message: 'Account deletion request submitted. An admin will review your request within 24-48 hours.'
      });
    }
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to process account deletion request' });
  }
});

// Email OTP Routes
import otpService from '../services/otpService.js';

// Send Email OTP
router.post('/send-email-otp', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    await otpService.sendEmailOtp(email);

    res.json({ 
      success: true, 
      message: 'OTP sent to email' 
    });
  } catch (error) {
    console.error('Send email OTP error:', error);
    res.status(500).json({ 
      error: 'Failed to send OTP' 
    });
  }
});

// Verify Email OTP
router.post('/verify-email-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    await otpService.verifyEmailOtp(email, otp);

    res.json({ 
      success: true, 
      message: 'Email verified successfully' 
    });
  } catch (error) {
    console.error('Verify email OTP error:', error);
    res.status(400).json({ 
      error: error.message || 'OTP verification failed' 
    });
  }
});

export default router;