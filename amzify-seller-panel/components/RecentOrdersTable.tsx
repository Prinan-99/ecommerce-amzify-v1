import React from 'react';
import { Eye, Truck, Trash2, Calendar, User, DollarSign } from 'lucide-react';
import { RecentOrder } from '../hooks/useSellerDashboard';

interface RecentOrdersTableProps {
  orders: RecentOrder[];
  isLoading: boolean;
  onViewOrder?: (orderId: string) => void;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  orders,
  isLoading,
  onViewOrder
}) => {
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-slate-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">No recent orders</p>
        <p className="text-slate-500 text-sm">Orders will appear here when customers purchase</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.slice(0, 5).map(order => (
        <div
          key={order.id}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div>
                  <p className="font-bold text-slate-900">{order.order_number}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <User className="w-3 h-3" />
                    <span>{order.customer_name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-slate-900">{formatINR(order.total_amount)}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>

              <button
                onClick={() => onViewOrder?.(order.id)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-600 hover:text-indigo-600"
                title="View order details"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
