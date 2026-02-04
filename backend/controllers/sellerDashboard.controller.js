import { sellerDashboardService } from '../services/sellerDashboard.service.js';

export const sellerDashboardController = {
  // GET /api/seller/dashboard
  async getDashboard(req, res) {
    try {
      const sellerId = req.user.id;

      const [stats, recentOrders, topProducts, analytics] = await Promise.all([
        sellerDashboardService.getSellerStats(sellerId),
        sellerDashboardService.getRecentOrders(sellerId, 5),
        sellerDashboardService.getTopProducts(sellerId, 4),
        sellerDashboardService.getSellerAnalytics(sellerId)
      ]);

      res.json({
        stats,
        recentOrders,
        topProducts,
        analytics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  },

  // GET /api/seller/orders
  async getOrders(req, res) {
    try {
      const sellerId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;

      const recentOrders = await sellerDashboardService.getRecentOrders(sellerId, limit);

      res.json({
        orders: recentOrders,
        total: recentOrders.length
      });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  },

  // GET /api/seller/top-products
  async getTopProducts(req, res) {
    try {
      const sellerId = req.user.id;
      const limit = parseInt(req.query.limit) || 4;

      const topProducts = await sellerDashboardService.getTopProducts(sellerId, limit);

      res.json({
        products: topProducts,
        total: topProducts.length
      });
    } catch (error) {
      console.error('Get top products error:', error);
      res.status(500).json({ error: 'Failed to fetch top products' });
    }
  },

  // GET /api/seller/analytics
  async getAnalytics(req, res) {
    try {
      const sellerId = req.user.id;

      const analytics = await sellerDashboardService.getSellerAnalytics(sellerId);

      res.json(analytics);
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },

  // GET /api/seller/dashboard/trends
  async getTrendAnalysis(req, res) {
    try {
      const sellerId = req.user.id;

      const trends = await sellerDashboardService.getTrendAnalysis(sellerId);

      res.json(trends);
    } catch (error) {
      console.error('Get trends error:', error);
      res.status(500).json({ error: 'Failed to fetch trend analysis' });
    }
  }
};
