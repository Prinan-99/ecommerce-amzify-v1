import React from 'react';
import { Star, ShoppingCart, TrendingUp } from 'lucide-react';

interface Product {
  product_id: string;
  name: string;
  category: string;
  total_sold: number;
  total_revenue: number;
  image?: string;
}

interface TopProductsProps {
  products?: Product[];
  isLoading?: boolean;
  onProductClick?: (productId: string) => void;
}

export const TopProducts: React.FC<TopProductsProps> = ({
  products = [],
  isLoading = false,
  onProductClick
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Top Performing Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-slate-100 rounded-xl p-4 animate-pulse">
              <div className="h-40 bg-slate-300 rounded-lg mb-4"></div>
              <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
        <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">No products yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Top Performing Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.product_id}
            onClick={() => onProductClick?.(product.product_id)}
            className="group cursor-pointer"
          >
            {/* Product Image */}
            <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden mb-4 group-hover:shadow-lg transition-shadow flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to icon on image load error
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
              {!product.image && <ShoppingCart className="w-8 h-8 text-slate-400" />}
              {/* Sales Badge */}
              <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                {product.total_sold || 0} sold
              </div>
            </div>

            {/* Product Info */}
            <div>
              <p className="font-semibold text-slate-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                {product.name || 'Untitled Product'}
              </p>
              <p className="text-xs text-slate-500 mt-1">{product.category || 'Uncategorized'}</p>

              {/* Revenue */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-900">
                  ₹{(product.total_revenue || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}
                </p>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  {product.total_sold || 0}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
