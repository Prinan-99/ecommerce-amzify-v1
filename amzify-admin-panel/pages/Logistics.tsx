
import React, { useEffect, useState } from 'react';
import { AdminApi } from '../services/api';
import { Shipment, DeliveryPartner, ShipmentStatus } from '../types';
import StatusBadge from '../components/logistics/StatusBadge';
import TimelineItem from '../components/logistics/TimelineItem';
import FilterDropdown from '../components/logistics/FilterDropdown';

const Logistics: React.FC = () => {
  // State management
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courierFilter, setCourierFilter] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters when search or filters change
  useEffect(() => {
    applyFilters();
  }, [shipments, searchQuery, statusFilter, courierFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shipmentData, partnerData] = await Promise.all([
        AdminApi.getShipments(),
        AdminApi.getDeliveryPartners()
      ]);
      setShipments(shipmentData);
      setPartners(partnerData);
      if (shipmentData.length > 0) {
        setSelectedShipment(shipmentData[0]);
      }
    } catch (error) {
      console.error('Failed to fetch logistics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...shipments];

    // Search filter (tracking number or order ID)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.trackingNumber.toLowerCase().includes(query) ||
        s.orderId.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Courier filter
    if (courierFilter) {
      filtered = filtered.filter(s => s.courierPartner === courierFilter);
    }

    setFilteredShipments(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const shipmentData = await AdminApi.getShipments();
      setShipments(shipmentData);
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedShipment || !newStatus) return;

    setSubmitting(true);
    try {
      await AdminApi.updateShipmentStatus(selectedShipment.id, newStatus, remarks);
      // Optimistically update UI
      const updated = shipments.map(s =>
        s.id === selectedShipment.id
          ? { ...s, status: newStatus as ShipmentStatus }
          : s
      );
      setShipments(updated);
      setSelectedShipment({
        ...selectedShipment,
        status: newStatus as ShipmentStatus
      });
      setShowStatusModal(false);
      setNewStatus('');
      setRemarks('');
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackingUpdate = async () => {
    if (!selectedShipment || !newTrackingNumber) return;

    setSubmitting(true);
    try {
      await AdminApi.updateTrackingNumber(selectedShipment.id, newTrackingNumber);
      const updated = shipments.map(s =>
        s.id === selectedShipment.id
          ? { ...s, trackingNumber: newTrackingNumber }
          : s
      );
      setShipments(updated);
      setSelectedShipment({
        ...selectedShipment,
        trackingNumber: newTrackingNumber
      });
      setShowTrackingModal(false);
      setNewTrackingNumber('');
    } catch (error) {
      console.error('Failed to update tracking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCourierChange = async () => {
    if (!selectedShipment || !selectedCourier) return;

    setSubmitting(true);
    try {
      await AdminApi.updateCourierPartner(
        selectedShipment.id,
        selectedCourier,
        selectedShipment.trackingNumber
      );
      const courier = partners.find(p => p.id === selectedCourier);
      const updated = shipments.map(s =>
        s.id === selectedShipment.id
          ? { ...s, deliveryPartnerId: selectedCourier, deliveryPartnerName: courier?.name || '' }
          : s
      );
      setShipments(updated);
      setSelectedShipment({
        ...selectedShipment,
        deliveryPartnerId: selectedCourier,
        deliveryPartnerName: courier?.name || ''
      });
      setShowCourierModal(false);
      setSelectedCourier('');
    } catch (error) {
      console.error('Failed to update courier:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate stats
  const stats = {
    processing: shipments.filter(s => s.status === ShipmentStatus.PICKUP_PENDING).length,
    inTransit: shipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT).length,
    outForDelivery: shipments.filter(s => s.status === ShipmentStatus.OUT_FOR_DELIVERY).length,
    delivered: shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length,
    failed: shipments.filter(s => s.status === ShipmentStatus.RETURNED || s.status === ShipmentStatus.EXCEPTION).length
  };

  // Get unique courier partners for filter
  const courierPartners = Array.from(new Set(shipments.map(s => s.courierPartner)));

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 p-8">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-xs">Loading Logistics Data</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Logistics & Tracking</h2>
          <p className="text-slate-500 font-bold mt-1">Manage shipments, tracking, and delivery status</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-full font-bold text-sm hover:bg-red-700 disabled:opacity-50 transition-all"
        >
          <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Processing', count: stats.processing, color: 'bg-amber-50 text-amber-600', icon: '📦' },
          { label: 'In Transit', count: stats.inTransit, color: 'bg-blue-50 text-blue-600', icon: '🚚' },
          { label: 'Out for Delivery', count: stats.outForDelivery, color: 'bg-purple-50 text-purple-600', icon: '📍' },
          { label: 'Delivered', count: stats.delivered, color: 'bg-green-50 text-green-600', icon: '✓' },
          { label: 'Failed/Returned', count: stats.failed, color: 'bg-red-50 text-red-600', icon: '⚠️' }
        ].map((card, i) => (
          <button
            key={i}
            onClick={() => setStatusFilter(
              i === 0 ? ShipmentStatus.PICKUP_PENDING :
              i === 1 ? ShipmentStatus.IN_TRANSIT :
              i === 2 ? ShipmentStatus.OUT_FOR_DELIVERY :
              i === 3 ? ShipmentStatus.DELIVERED : ''
            )}
            className={`p-4 rounded-2xl border-2 transition-all ${
              card.color
            } hover:shadow-lg cursor-pointer transform hover:scale-105 ${
              (statusFilter === ShipmentStatus.PICKUP_PENDING && i === 0) ||
              (statusFilter === ShipmentStatus.IN_TRANSIT && i === 1) ||
              (statusFilter === ShipmentStatus.OUT_FOR_DELIVERY && i === 2) ||
              (statusFilter === ShipmentStatus.DELIVERED && i === 3)
                ? 'ring-2 ring-offset-2'
                : ''
            }`}
          >
            <p className="text-3xl mb-2">{card.icon}</p>
            <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">{card.label}</p>
            <p className="text-2xl font-black">{card.count}</p>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipment List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
          {/* Search and Filters */}
          <div className="p-6 border-b border-slate-200 space-y-4">
            <input
              type="text"
              placeholder="Search by tracking number or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3 flex-wrap">
              <FilterDropdown
                label="Status"
                options={[
                  { value: ShipmentStatus.PICKUP_PENDING, label: 'Pickup Pending' },
                  { value: ShipmentStatus.IN_TRANSIT, label: 'In Transit' },
                  { value: ShipmentStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery' },
                  { value: ShipmentStatus.DELIVERED, label: 'Delivered' },
                  { value: ShipmentStatus.RETURNED, label: 'Returned' },
                  { value: ShipmentStatus.EXCEPTION, label: 'Exception' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="All Statuses"
              />
              {courierPartners.length > 0 && (
                <FilterDropdown
                  label="Courier"
                  options={courierPartners.map(cp => ({ value: cp, label: cp }))}
                  value={courierFilter}
                  onChange={setCourierFilter}
                  placeholder="All Couriers"
                />
              )}
            </div>
          </div>

          {/* Shipments Table */}
          <div className="flex-1 overflow-y-auto">
            {filteredShipments.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p className="text-sm font-bold">No shipments found</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Order / Tracking</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Courier</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Est. Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredShipments.map(shipment => (
                    <tr
                      key={shipment.id}
                      onClick={() => setSelectedShipment(shipment)}
                      className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                        selectedShipment?.id === shipment.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{shipment.orderId}</p>
                        <p className="text-xs text-slate-500 font-mono">{shipment.trackingNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">{shipment.customerName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={shipment.status} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {shipment.courierPartner}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-slate-600">
                          {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Shipment Details Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-full">
          {selectedShipment ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-black text-slate-900 mb-1">Shipment Details</h3>
                <p className="text-xs text-slate-500 font-bold uppercase">{selectedShipment.id}</p>
              </div>

              {/* Details Content */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {/* Basic Info */}
                <div className="space-y-3">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Order Information</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Order ID:</span>
                      <span className="font-bold text-slate-900">{selectedShipment.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Customer:</span>
                      <span className="font-bold text-slate-900">{selectedShipment.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Seller:</span>
                      <span className="font-bold text-slate-900">{selectedShipment.sellerName}</span>
                    </div>
                  </div>
                </div>

                {/* Tracking Info */}
                <div className="space-y-3">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tracking Information</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-slate-600">Tracking #:</span>
                      <span className="font-mono font-bold text-blue-600">{selectedShipment.trackingNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Courier:</span>
                      <span className="font-bold text-slate-900">{selectedShipment.courierPartner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <StatusBadge status={selectedShipment.status} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div className="space-y-3">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Route Information</p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-slate-600 text-xs mb-1">From:</p>
                      <p className="font-bold text-slate-900">{selectedShipment.origin}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-xs mb-1">To:</p>
                      <p className="font-bold text-slate-900">{selectedShipment.destination}</p>
                    </div>
                    {selectedShipment.currentLocation && (
                      <div>
                        <p className="text-slate-600 text-xs mb-1">Current Location:</p>
                        <p className="font-bold text-slate-900">{selectedShipment.currentLocation}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-600 text-xs mb-1">Est. Delivery:</p>
                      <p className="font-bold text-slate-900">
                        {new Date(selectedShipment.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all"
                  >
                    Update Status
                  </button>
                  <button
                    onClick={() => setShowTrackingModal(true)}
                    className="w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-300 transition-all"
                  >
                    Update Tracking
                  </button>
                  <button
                    onClick={() => setShowCourierModal(true)}
                    className="w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-300 transition-all"
                  >
                    Change Courier
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <p className="text-lg font-black text-slate-400">📦</p>
              <p className="text-sm font-bold text-slate-600 mt-2">Select a shipment to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Section */}
      {selectedShipment && selectedShipment.updates.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6">
          <h3 className="text-xl font-black text-slate-900 mb-6">Shipment Timeline</h3>
          <div className="space-y-0">
            {selectedShipment.updates.map((update, idx) => (
              <TimelineItem
                key={update.id}
                update={update}
                isLatest={idx === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-black text-slate-900 mb-4">Update Shipment Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select status...</option>
                  <option value={ShipmentStatus.PICKUP_PENDING}>Pickup Pending</option>
                  <option value={ShipmentStatus.IN_TRANSIT}>In Transit</option>
                  <option value={ShipmentStatus.OUT_FOR_DELIVERY}>Out for Delivery</option>
                  <option value={ShipmentStatus.DELIVERED}>Delivered</option>
                  <option value={ShipmentStatus.RETURNED}>Returned</option>
                  <option value={ShipmentStatus.EXCEPTION}>Exception</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Remarks (Optional)</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any remarks..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-bold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Update Modal */}
      {showTrackingModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-black text-slate-900 mb-4">Update Tracking Number</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={newTrackingNumber}
                  onChange={(e) => setNewTrackingNumber(e.target.value)}
                  placeholder={selectedShipment.trackingNumber}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTrackingModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-bold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTrackingUpdate}
                  disabled={!newTrackingNumber || submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courier Change Modal */}
      {showCourierModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-black text-slate-900 mb-4">Change Courier Partner</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Courier</label>
                <select
                  value={selectedCourier}
                  onChange={(e) => setSelectedCourier(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a courier...</option>
                  {partners.map(partner => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} ({partner.provider}) - Rating: {partner.rating}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCourierModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-bold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCourierChange}
                  disabled={!selectedCourier || submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Change'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logistics;

