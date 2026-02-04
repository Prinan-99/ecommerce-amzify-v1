import React from 'react';
import { Edit, Eye, ToggleRight, Package } from 'lucide-react';
import { TopProduct } from '../hooks/useSellerDashboard';

interface TopProductsProps {
  products: TopProduct[];
  isLoading: boolean;
  onEdit?: (productId: string) => void;
  onView?: (productId: string) => void;
}

export const TopProducts: React.FC<TopProductsProps> = ({
  products,
  isLoading,
  onEdit,
  onView
}) => {
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-200 rounded-xl h-64 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">No products yet</p>
        <p className="text-slate-500 text-sm">Add products to start selling</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.slice(0, 4).map(product => (
        <div
          key={product.id}
          className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
        >
          {/* Product Image */}
          <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
            {product.images && product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-16 h-16 text-slate-400" />
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-bold text-slate-900 text-sm truncate mb-2">{product.name}</h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Units Sold</span>
                <span className="font-bold text-slate-900">{product.totalSold}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Revenue</span>
                <span className="font-bold text-green-600">{formatINR(product.totalRevenue)}</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4 pb-4 border-t border-slate-200 pt-4">
              <p className="text-lg font-black text-slate-900">{formatINR(product.price)}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit?.(product.id)}
                className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => onView?.(product.id)}
                className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-1"
              >
                <Eye className="w-3 h-3" />
                View
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
