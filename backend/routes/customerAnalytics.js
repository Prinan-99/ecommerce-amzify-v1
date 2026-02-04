import express from 'express';
import { customerAnalyticsController } from '../controllers/customerAnalytics.controller.js';
import { authenticateToken, requireSeller } from '../middleware/auth.js';

const router = express.Router();

// All routes require seller authentication
router.use(authenticateToken, requireSeller);

// Get customer analytics overview
router.get('/analytics/overview', customerAnalyticsController.getOverview);

// Get customers list with search and filters
router.get('/customers', customerAnalyticsController.getCustomers);

// Get customer profile details
router.get('/customers/:customerId', customerAnalyticsController.getCustomerProfile);

// Get customer activity timeline
router.get('/customers/:customerId/activity', customerAnalyticsController.getCustomerActivity);

// Get customer segmentation data
router.get('/segmentation', customerAnalyticsController.getSegmentation);

// Export customer data
router.get('/export/customers', customerAnalyticsController.exportCustomers);
router.get('/export/purchase-report', customerAnalyticsController.exportPurchaseReport);
router.get('/export/repeat-customers', customerAnalyticsController.exportRepeatCustomers);

// AI insights for customer
router.get('/customers/:customerId/ai-insights', customerAnalyticsController.getAIInsights);

export default router;
