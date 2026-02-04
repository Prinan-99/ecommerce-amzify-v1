import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  order_id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count?: number;
}

interface RecentOrdersProps {
  orders?: Order[];
  isLoading?: boolean;
  onOrderClick?: (orderId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'pending':
    case 'processing':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'shipped':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'pending':
    case 'processing':
      return <Clock className="w-4 h-4" />;
    case 'cancelled':
      return <AlertCircle className="w-4 h-4" />;
    case 'shipped':
      return <Package className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

export const RecentOrders: React.FC<RecentOrdersProps> = ({
  orders = [],
  isLoading = false,
  onOrderClick
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Orders</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center justify-between py-4 border-b border-slate-100">
              <div className="flex-1">
                <div className="h-4 bg-slate-300 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
              <div className="h-6 bg-slate-300 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Orders</h3>
      <div className="space-y-0">
        {orders.map((order, idx) => (
          <div
            key={order.order_id}
            onClick={() => onOrderClick?.(order.order_id)}
            className={`flex items-center justify-between py-4 px-2 hover:bg-slate-50 transition-colors cursor-pointer group ${
              idx !== orders.length - 1 ? 'border-b border-slate-100' : ''
            }`}
          >
            <div className="flex-1">
              <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                Order #{String(order.order_id).slice(-6).toUpperCase()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {order.customer_name} • {order.items_count || 1} item{(order.items_count || 1) > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {order.created_at ? format(new Date(order.created_at), 'MMM dd, yyyy • HH:mm') : 'Date unknown'}
              </p>
            </div>

            <div className="flex items-center gap-4 ml-4">
              <div className="text-right">
                <p className="font-bold text-slate-900">₹{(order.total_amount || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
              </div>

              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border font-medium text-xs whitespace-nowrap ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span>{order.status || 'Unknown'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
