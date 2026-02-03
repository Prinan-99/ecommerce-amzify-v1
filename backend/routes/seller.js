import express from 'express';
import { sellerDashboardController } from '../controllers/sellerDashboard.controller.js';
import { logisticsController } from '../controllers/logistics.controller.js';
import { authenticateToken, requireSeller } from '../middleware/auth.js';

const router = express.Router();

// All routes require seller authentication
router.use(authenticateToken, requireSeller);

// Get complete dashboard data
router.get('/dashboard', sellerDashboardController.getDashboard);

// Get seller orders
router.get('/orders', sellerDashboardController.getOrders);

// Get top products
router.get('/top-products', sellerDashboardController.getTopProducts);

// Get analytics
router.get('/analytics', sellerDashboardController.getAnalytics);

// Get trend analysis
router.get('/dashboard/trends', sellerDashboardController.getTrendAnalysis);

// Logistics routes
router.get('/logistics/overview', logisticsController.getLogisticsOverview);
router.get('/logistics/shipments', logisticsController.getShipments);
router.get('/logistics/returns', logisticsController.getReturns);

export default router;
