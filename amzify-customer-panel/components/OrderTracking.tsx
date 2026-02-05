import React, { useState, useEffect } from 'react';
import {
  Package, MapPin, CheckCircle, Clock, Truck, Home, AlertCircle, 
  Phone, MessageSquare, Download, Share2, RotateCcw, Star,
  Calendar, User, DollarSign, Tag, TrendingUp, Award, Gift
} from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingProps {
  orderId: string;
  onBack: () => void;
}

interface TrackingStep {
  status: 'completed' | 'current' | 'pending';
  title: string;
  description: string;
  timestamp?: string;
  location?: string;
  icon: React.ReactNode;
}

const ORDER_STATUSES: Record<string, TrackingStep[]> = {
  'pending': [
    {
      status: 'completed',
      title: 'Order Confirmed',
      description: 'Your order has been confirmed',
      timestamp: '2024-01-15, 10:30 AM',
      icon: <CheckCircle className="w-6 h-6 text-green-500" />
    },
    {
      status: 'current',
      title: 'Payment Processing',
      description: 'We are processing your payment',
      location: 'Payment Gateway',
      icon: <Clock className="w-6 h-6 text-amber-500" />
    },
    {
      status: 'pending',
      title: 'Order Processing',
      description: 'Your items are being prepared',
      icon: <Package className="w-6 h-6 text-slate-400" />
    },
    {
      status: 'pending',
      title: 'Ready for Shipment',
      description: 'Items will be shipped soon',
      icon: <Truck className="w-6 h-6 text-slate-400" />
    },
    {
      status: 'pending',
      title: 'Delivered',
      description: 'Order delivered to your address',
      icon: <Home className="w-6 h-6 text-slate-400" />
    }
  ],
  'confirmed': [
    {
      status: 'completed',
      title: 'Order Confirmed',
      description: 'Your order has been confirmed',
      timestamp: '2024-01-15, 10:30 AM',
      icon: <CheckCircle className="w-6 h-6 text-green-500" />
    },
    {
      status: 'completed',
      title: 'Payment Processed',
      description: 'Payment received successfully',
      timestamp: '2024-01-15, 10:35 AM',
      icon: <DollarSign className="w-6 h-6 text-green-500" />
    },
    {
      status: 'current',
      title: 'Order Processing',
      description: 'Your items are being prepared',
      location: 'Warehouse',
      icon: <Package className="w-6 h-6 text-amber-500" />
    },
    {
      status: 'pending',
      title: 'Ready for Shipment',
      description: 'Items will be shipped soon',
      icon: <Truck className="w-6 h-6 text-slate-400" />
    },
    {
      status: 'pending',
      title: 'Delivered',
      description: 'Order delivered to your address',
      icon: <Home className="w-6 h-6 text-slate-400" />
    }
  ],
  'shipped': [
    {
      status: 'completed',
      title: 'Order Confirmed',
      description: 'Your order has been confirmed',
      timestamp: '2024-01-15, 10:30 AM',
      icon: <CheckCircle className="w-6 h-6 text-green-500" />
    },
    {
      status: 'completed',
      title: 'Payment Processed',
      description: 'Payment received successfully',
      timestamp: '2024-01-15, 10:35 AM',
      icon: <DollarSign className="w-6 h-6 text-green-500" />
    },
    {
      status: 'completed',
      title: 'Order Processed',
      description: 'Items have been prepared',
      timestamp: '2024-01-16, 02:00 AM',
      location: 'Warehouse',
      icon: <Package className="w-6 h-6 text-green-500" />
    },
    {
      status: 'current',
      title: 'In Transit',
      description: 'Your package is on its way',
      location: 'Mumbai, Maharashtra',
      timestamp: '2024-01-16, 08:00 AM',
      icon: <Truck className="w-6 h-6 text-amber-500" />
    },
    {
      status: 'pending',
      title: 'Out for Delivery',
      description: 'Package will be delivered today',
      icon: <Home className="w-6 h-6 text-slate-400" />
    }
  ],
  'delivered': [
    {
      status: 'completed',
      title: 'Order Confirmed',
      description: 'Your order has been confirmed',
      timestamp: '2024-01-15, 10:30 AM',
      icon: <CheckCircle className="w-6 h-6 text-green-500" />
    },
    {
      status: 'completed',
      title: 'Payment Processed',
      description: 'Payment received successfully',
      timestamp: '2024-01-15, 10:35 AM',
      icon: <DollarSign className="w-6 h-6 text-green-500" />
    },
    {
      status: 'completed',
      title: 'Order Processed',
      description: 'Items have been prepared',
      timestamp: '2024-01-16, 02:00 AM',
      location: 'Warehouse',
      icon: <Package className="w-6 h-6 text-green-500" />
    },
    {
      status: 'completed',
      title: 'Out for Delivery',
      description: 'Package is on the way',
      timestamp: '2024-01-17, 09:00 AM',
      location: 'En route',
      icon: <Truck className="w-6 h-6 text-green-500" />
    },
    {
      status: 'completed',
      title: 'Delivered',
      description: 'Order delivered successfully',
      timestamp: '2024-01-17, 05:30 PM',
      location: '123 Main St, Mumbai',
      icon: <Home className="w-6 h-6 text-green-500" />
    }
  ]
};

const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, onBack }) => {
  const [currentStatus] = useState<string>('shipped');
  const [trackingSteps] = useState<TrackingStep[]>(ORDER_STATUSES[currentStatus] || ORDER_STATUSES['confirmed']);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const mockOrder = {
    id: orderId,
    order_number: 'AMZ#1234567890',
    created_at: '2024-01-15',
    total_amount: 2999,
    items_count: 3,
    shipping_address: '123 Main Street, Mumbai, Maharashtra 400001',
    estimated_delivery: '2024-01-18',
    carrier: 'Express Delivery Co.',
    tracking_number: 'TRK123456789'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-3xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black mb-2">{mockOrder.order_number}</h1>
            <p className="text-blue-100 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Ordered on {mockOrder.created_at}
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl font-bold transition-all border border-white/20"
          >
            ← Back
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-sm opacity-80 mb-1">Order Total</div>
            <div className="text-2xl font-black">₹{mockOrder.total_amount}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-sm opacity-80 mb-1">Items</div>
            <div className="text-2xl font-black">{mockOrder.items_count}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-sm opacity-80 mb-1">Est. Delivery</div>
            <div className="text-2xl font-black">{mockOrder.estimated_delivery}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-sm opacity-80 mb-1">Carrier</div>
            <div className="text-lg font-bold">{mockOrder.carrier}</div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tracking Timeline - 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
            <Truck className="w-6 h-6 text-indigo-600" />
            Tracking Progress
          </h2>

          {/* Timeline */}
          <div className="space-y-0">
            {trackingSteps.map((step, index) => (
              <div
                key={index}
                onClick={() => setSelectedStep(selectedStep === index ? null : index)}
                className="cursor-pointer"
              >
                <div className="flex gap-6 pb-8 relative group">
                  {/* Timeline line */}
                  {index < trackingSteps.length - 1 && (
                    <div
                      className={`absolute left-3 top-12 w-1 h-16 transition-colors ${
                        step.status === 'completed' || step.status === 'current'
                          ? 'bg-gradient-to-b from-green-500 to-green-300'
                          : 'bg-slate-200'
                      }`}
                    />
                  )}

                  {/* Icon */}
                  <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border-2 border-slate-200 group-hover:border-indigo-400 transition-colors">
                    {step.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className="font-bold text-slate-900 text-lg">{step.title}</h3>
                    <p className="text-slate-600 mb-2">{step.description}</p>
                    {step.timestamp && (
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {step.timestamp}
                      </div>
                    )}
                    {step.location && (
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {step.location}
                      </div>
                    )}

                    {/* Expand for more details */}
                    {selectedStep === index && (
                      <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                        <p className="text-sm text-slate-700">
                          More details about this stage of your order tracking...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Delivery Address
            </h3>
            <p className="text-slate-700 font-medium">{mockOrder.shipping_address}</p>
          </div>

          {/* Tracking Info */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-600" />
              Tracking Info
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs uppercase font-bold text-slate-500">Carrier</div>
                <div className="font-bold text-slate-900">{mockOrder.carrier}</div>
              </div>
              <div>
                <div className="text-xs uppercase font-bold text-slate-500">Tracking #</div>
                <div className="font-mono font-bold text-slate-900 text-sm">{mockOrder.tracking_number}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-3">
            <button className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download Invoice
            </button>
            <button className="w-full px-4 py-3 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Contact Support
            </button>
            <button className="w-full px-4 py-3 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Tracking
            </button>
          </div>

          {/* Estimated Delivery Badge */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-xs uppercase font-bold text-green-700">Est. Delivery</div>
                <div className="font-black text-green-900 text-lg">{mockOrder.estimated_delivery}</div>
              </div>
            </div>
            <p className="text-sm text-green-700">
              Your order is on track. You'll receive it by the estimated date.
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
          <Package className="w-6 h-6 text-indigo-600" />
          Order Items
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-lg flex items-center justify-center text-2xl">
                📦
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">Premium Wireless Headphones</h4>
                <p className="text-sm text-slate-600">Seller: Quality Electronics</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">₹{999}</div>
                <div className="text-sm text-slate-600">Qty: 1</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-200 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-amber-900 mb-1">Need Help?</h3>
          <p className="text-sm text-amber-800">
            If you have any issues with your order, our support team is here to help. Contact us via email or phone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
