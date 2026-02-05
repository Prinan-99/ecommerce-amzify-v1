import React from 'react';
import { Order, OrderStatus } from '../types';
import { Package, ChevronRight } from 'lucide-react';

interface OrderHistoryProps {
  orders: Order[];
  onSeeAll?: () => void;
  onOrderClick?: (id: string) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onSeeAll, onOrderClick }) => {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case OrderStatus.SHIPPED: return 'bg-blue-50 text-blue-700 border-blue-100';
      case OrderStatus.PROCESSING: return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <section className="px-4 mt-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Recent Orders</h3>
        <button 
          onClick={onSeeAll}
          className="text-amber-600 text-xs font-bold hover:underline"
        >
          See All
        </button>
      </div>
      
      <div className="space-y-3">
        {orders.map((order) => (
          <div 
            key={order.id}
            onClick={() => onOrderClick?.(order.id)}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-amber-100 transition-all cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors text-gray-400">
                <Package size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-gray-900 text-sm">{order.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{order.date}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span>{order.itemsCount} {order.itemsCount === 1 ? 'Item' : 'Items'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-900 text-sm">₹{order.amount.toLocaleString()}</span>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OrderHistory;