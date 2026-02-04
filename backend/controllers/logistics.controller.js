import { logisticsService } from '../services/logistics.service.js';

export const logisticsController = {
  // GET /api/seller/logistics/overview
  async getLogisticsOverview(req, res) {
    try {
      const sellerId = req.user.id;

      const [warehouse, transportation, reverseLogistics] = await Promise.all([
        logisticsService.getWarehouseStats(sellerId),
        logisticsService.getTransportationAnalytics(sellerId),
        logisticsService.getReverseLogistics(sellerId)
      ]);

      res.json({
        warehouse,
        transportation,
        reverseLogistics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get logistics overview error:', error);
      res.status(500).json({ error: 'Failed to fetch logistics data' });
    }
  },

  // GET /api/seller/logistics/shipments
  async getShipments(req, res) {
    try {
      const sellerId = req.user.id;
      const shipments = await logisticsService.getShipmentTracking(sellerId);

      res.json({
        shipments,
        total: shipments.length
      });
    } catch (error) {
      console.error('Get shipments error:', error);
      res.status(500).json({ error: 'Failed to fetch shipments' });
    }
  },

  // GET /api/seller/logistics/returns
  async getReturns(req, res) {
    try {
      const sellerId = req.user.id;
      const returns = await logisticsService.getReverseLogistics(sellerId);

      res.json(returns);
    } catch (error) {
      console.error('Get returns error:', error);
      res.status(500).json({ error: 'Failed to fetch returns data' });
    }
  }
};
