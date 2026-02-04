import React, { useEffect, useState } from 'react';
import { sellerApiService } from '../services/sellerApi';
import { PremiumCard } from './PremiumCard';
import { 
  Package, 
  Truck, 
  MapPin, 
  RotateCcw, 
  Clock, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Warehouse
} from 'lucide-react';

interface LogisticsData {
  warehouse: {
    totalProducts: number;
    activeOrders: number;
    pendingShipments: number;
    warehouseCapacity: number;
    avgProcessingTime: string;
  };
  transportation: {
    deliveredOrders: number;
    inTransit: number;
    firstMile: number;
    lastMile: number;
    onTimeDelivery: number;
    avgDeliveryTime: string;
    carriers: Array<{ name: string; percentage: number; orders: number }>;
  };
  reverseLogistics: {
    totalReturns: number;
    totalReturnValue: number;
    pendingReturns: number;
    processedReturns: number;
    returns: Array<any>;
  };
}

export const LogisticsTab: React.FC = () => {
  const [data, setData] = useState<LogisticsData | null>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'shipments' | 'returns'>('overview');

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  const fetchLogisticsData = async () => {
    try {
      setLoading(true);
      const [overview, shipmentsData] = await Promise.all([
        sellerApiService.request('/seller/logistics/overview'),
        sellerApiService.request('/seller/logistics/shipments')
      ]);
      
      setData(overview);
      setShipments(shipmentsData.shipments || []);
      setError(null);
    } catch (err) {
      console.error('Logistics data fetch error:', err);
      setError('Failed to load logistics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-slate-200 rounded-3xl"></div>
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <PremiumCard variant="glass" className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">Error Loading Logistics Data</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
              <button
                onClick={fetchLogisticsData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </PremiumCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Logistics & Fulfillment</h1>
              <p className="text-sm text-slate-600 mt-1">End-to-end supply chain management</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchLogisticsData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <div className="flex gap-2">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeView === 'overview'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('shipments')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeView === 'shipments'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Shipments
              </button>
              <button
                onClick={() => setActiveView('returns')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeView === 'returns'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Returns
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <PremiumCard variant="gradient" interactive className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Warehouse Stock</p>
                    <p className="text-4xl font-black text-slate-900 mt-2">{data.warehouse.totalProducts}</p>
                    <p className="text-xs text-slate-500 mt-2">Products in stock</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
                    <Warehouse className="w-6 h-6 text-white" />
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard variant="gradient" interactive className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">In Transit</p>
                    <p className="text-4xl font-black text-slate-900 mt-2">{data.transportation.inTransit}</p>
                    <p className="text-xs text-slate-500 mt-2">Active shipments</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard variant="gradient" interactive className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">On-Time Delivery</p>
                    <p className="text-4xl font-black text-slate-900 mt-2">{data.transportation.onTimeDelivery}%</p>
                    <p className="text-xs text-slate-500 mt-2">Performance rate</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-600 to-green-700 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard variant="gradient" interactive className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Returns</p>
                    <p className="text-4xl font-black text-slate-900 mt-2">{data.reverseLogistics.totalReturns}</p>
                    <p className="text-xs text-slate-500 mt-2">Pending processing</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl">
                    <RotateCcw className="w-6 h-6 text-white" />
                  </div>
                </div>
              </PremiumCard>
            </div>

            {/* Warehousing & Fulfillment */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">📦 Warehousing & Fulfillment</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PremiumCard variant="glass" className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Warehouse Capacity</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Storage Utilization</span>
                        <span className="font-bold text-slate-900">{data.warehouse.warehouseCapacity}%</span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${data.warehouse.warehouseCapacity}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-600">Active Orders</p>
                        <p className="text-2xl font-bold text-slate-900">{data.warehouse.activeOrders}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-600">Pending Shipments</p>
                        <p className="text-2xl font-bold text-slate-900">{data.warehouse.pendingShipments}</p>
                      </div>
                    </div>
                  </div>
                </PremiumCard>

                <PremiumCard variant="glass" className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Processing Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Avg Processing Time</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{data.warehouse.avgProcessingTime}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-slate-700">Pick & Pack Accuracy</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">99.2%</span>
                    </div>
                  </div>
                </PremiumCard>
              </div>
            </div>

            {/* Transportation */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">🚚 Transportation & Delivery</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PremiumCard variant="glass" className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Delivery Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">First Mile</span>
                      <span className="font-bold text-slate-900">{data.transportation.firstMile}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Last Mile</span>
                      <span className="font-bold text-slate-900">{data.transportation.lastMile}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Delivered</span>
                      <span className="font-bold text-green-600">{data.transportation.deliveredOrders}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-200">
                      <span className="text-xs text-slate-600">Avg Delivery Time</span>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{data.transportation.avgDeliveryTime}</p>
                    </div>
                  </div>
                </PremiumCard>

                <PremiumCard variant="glass" className="p-6 lg:col-span-2">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Carrier Distribution</h3>
                  <div className="space-y-4">
                    {data.transportation.carriers.map((carrier, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-slate-700">{carrier.name}</span>
                          <span className="text-slate-600">{carrier.orders} orders ({carrier.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              idx === 0 ? 'bg-gradient-to-r from-blue-600 to-blue-500' :
                              idx === 1 ? 'bg-gradient-to-r from-purple-600 to-purple-500' :
                              'bg-gradient-to-r from-pink-600 to-pink-500'
                            }`}
                            style={{ width: `${carrier.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </PremiumCard>
              </div>
            </div>

            {/* Reverse Logistics */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">🔄 Reverse Logistics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <PremiumCard variant="gradient" className="p-6">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Returns</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{data.reverseLogistics.totalReturns}</p>
                </PremiumCard>
                <PremiumCard variant="gradient" className="p-6">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Return Value</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">₹{(data.reverseLogistics.totalReturnValue).toLocaleString()}</p>
                </PremiumCard>
                <PremiumCard variant="gradient" className="p-6">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Pending</p>
                  <p className="text-3xl font-black text-orange-600 mt-2">{data.reverseLogistics.pendingReturns}</p>
                </PremiumCard>
                <PremiumCard variant="gradient" className="p-6">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Processed</p>
                  <p className="text-3xl font-black text-green-600 mt-2">{data.reverseLogistics.processedReturns}</p>
                </PremiumCard>
              </div>
            </div>

            {/* Technology Integration */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">⚡ Technology Integration</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PremiumCard variant="glass" className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">WMS Integration</h3>
                      <p className="text-xs text-slate-600">Warehouse Management System</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">System Status</span>
                      <span className="flex items-center gap-2 text-green-600 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Real-time Sync</span>
                      <span className="font-medium text-slate-900">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Last Updated</span>
                      <span className="font-medium text-slate-900">2 mins ago</span>
                    </div>
                  </div>
                </PremiumCard>

                <PremiumCard variant="glass" className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Truck className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">TMS Integration</h3>
                      <p className="text-xs text-slate-600">Transportation Management System</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">System Status</span>
                      <span className="flex items-center gap-2 text-green-600 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">GPS Tracking</span>
                      <span className="font-medium text-slate-900">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Route Optimization</span>
                      <span className="font-medium text-slate-900">AI-Powered</span>
                    </div>
                  </div>
                </PremiumCard>
              </div>
            </div>
          </div>
        )}

        {activeView === 'shipments' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Active Shipments</h2>
            <PremiumCard variant="glass" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tracking #</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Est. Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shipments.map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-slate-900">{shipment.trackingNumber}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{shipment.customer}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            shipment.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            shipment.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {shipment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{shipment.items}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{shipment.estimatedDelivery}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PremiumCard>
          </div>
        )}

        {activeView === 'returns' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Return Management</h2>
            <PremiumCard variant="glass" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Order #</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.reverseLogistics.returns.map((return_item) => (
                      <tr key={return_item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{return_item.orderNumber}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{return_item.customer}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{return_item.items}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">₹{return_item.value.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            {return_item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PremiumCard>
          </div>
        )}
      </div>
    </div>
  );
};
