
import React, { useEffect, useState } from 'react';
import { AdminApi } from '../services/api';
import { Order, OrderStatus } from '../types';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await AdminApi.getOrders();
      setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="p-8">Retrieving transaction logs...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Order Oversight</h2>
          <p className="text-slate-500">Monitor platform transactions and resolve disputes</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Order ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-slate-600">{order.id}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                  <p className="text-xs text-slate-400">{order.items} Items</p>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                  ${order.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700' :
                    order.status === OrderStatus.DISPUTED ? 'bg-red-100 text-red-700 animate-pulse' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-xs font-bold text-blue-600 hover:underline">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
