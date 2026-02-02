
import React, { useEffect, useState } from 'react';
import { AdminApi } from '../services/api';
import { Product, ProductStatus } from '../types';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(ProductStatus.PENDING);

  useEffect(() => {
    AdminApi.getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const handleStatusUpdate = async (id: string, status: ProductStatus) => {
    if (confirm(`Set status to ${status}?`)) {
      await AdminApi.updateProductStatus(id, status);
      setProducts(products.map(p => p.id === id ? { ...p, status } : p));
    }
  };

  const filteredProducts = products.filter(p => p.status === filter);

  if (loading) return <div className="p-8 font-black text-slate-400 uppercase tracking-widest">Scanning SKU Ledger...</div>;

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">SKU Governance</h2>
          <p className="text-slate-500 font-medium">Moderate global inventory before publishing to storefront</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setFilter(ProductStatus.PENDING)}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filter === ProductStatus.PENDING ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
          >
            PENDING ({products.filter(p => p.status === ProductStatus.PENDING).length})
          </button>
          <button 
            onClick={() => setFilter(ProductStatus.APPROVED)}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filter === ProductStatus.APPROVED ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
          >
            PUBLISHED
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product / Merchant</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <img src={product.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-slate-100" alt="" />
                    <div>
                      <p className="text-sm font-black text-slate-900">{product.name}</p>
                      <p className="text-xs font-bold text-blue-600">{product.sellerName}</p>
                      {product.reportsCount > 0 && <span className="text-[10px] bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded font-black uppercase mt-1 inline-block">Flagged: {product.reportsCount} Reports</span>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <p className="text-sm font-black text-slate-900">${product.price}</p>
                   <p className="text-[10px] text-slate-400 line-through">${product.originalPrice}</p>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-700">
                   {product.stock.toLocaleString()} Units
                </td>
                <td className="px-6 py-4">
                   <p className="text-xs font-bold text-slate-500">{new Date(product.submittedAt).toLocaleDateString()}</p>
                   <p className="text-[10px] text-slate-400">{new Date(product.submittedAt).toLocaleTimeString()}</p>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                   {product.status === ProductStatus.PENDING ? (
                     <>
                       <button onClick={() => handleStatusUpdate(product.id, ProductStatus.APPROVED)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">APPROVE</button>
                       <button onClick={() => handleStatusUpdate(product.id, ProductStatus.REJECTED)} className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all">REJECT</button>
                     </>
                   ) : (
                     <button onClick={() => handleStatusUpdate(product.id, ProductStatus.DISABLED)} className="text-slate-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest">Delist SKU</button>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Queue Clear</div>}
      </div>
    </div>
  );
};

export default Products;
