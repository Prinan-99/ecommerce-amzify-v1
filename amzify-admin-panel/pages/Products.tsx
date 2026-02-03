
import React, { useEffect, useState } from 'react';
import { adminApiService } from '../services/adminApi';

interface Category {
  id: string;
  name: string;
  slug: string;
  product_count: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_price: number;
  images: string[];
  stock_quantity: number;
  category_name: string;
  seller_id: string;
  seller_name: string;
  company_name: string;
  created_at: string;
}

interface Seller {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  seller_profiles: Array<{
    company_name: string;
    business_type: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
  }>;
}

const Products: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Seller modal states
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [loadingSeller, setLoadingSeller] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, selectedCategory, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [categoriesData, productsData] = await Promise.all([
        adminApiService.getTopCategories(),
        adminApiService.getProducts({
          page,
          limit: 12,
          ...(selectedCategory && { category: selectedCategory }),
          ...(searchQuery && { search: searchQuery })
        })
      ]);

      setCategories(categoriesData.categories || []);
      setProducts(productsData.products || []);
      setTotalPages(productsData.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setCategories([]);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSeller = async (sellerId: string) => {
    try {
      setLoadingSeller(true);
      setShowSellerModal(true);

      const [sellerData, productsData] = await Promise.all([
        adminApiService.getSellerDetails(sellerId),
        adminApiService.getSellerProducts(sellerId, 1, 50)
      ]);

      setSelectedSeller(sellerData.seller);
      setSellerProducts(productsData.products || []);
    } catch (error) {
      console.error('Failed to fetch seller details:', error);
    } finally {
      setLoadingSeller(false);
    }
  };

  const closeSellerModal = () => {
    setShowSellerModal(false);
    setSelectedSeller(null);
    setSellerProducts([]);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="font-black text-slate-400 uppercase tracking-widest">Loading Products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-900">Product Management</h2>
        <p className="text-slate-500 font-medium">Browse products and manage seller relationships</p>
      </div>

      {/* TOP CATEGORIES Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-wide">Top Product Categories</h3>
        {categories.length === 0 ? (
          <p className="text-slate-400 text-sm font-medium">No categories found</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id === selectedCategory ? '' : category.id);
                  setPage(1);
                }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedCategory === category.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <p className="font-black text-slate-900 text-sm mb-1">{category.name}</p>
                <p className="text-xs font-bold text-slate-500">
                  {category.product_count} {category.product_count === 1 ? 'Product' : 'Products'}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <input
          type="text"
          placeholder="Search products by name or description..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        />
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">All Products</h3>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory('')}
              className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-wide"
            >
              Clear Filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p className="font-black text-slate-400 uppercase tracking-widest">Loading...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="font-black text-slate-400 uppercase tracking-widest">No Products Found</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="relative h-48 bg-slate-100">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {product.stock_quantity === 0 && (
                    <div className="absolute top-2 right-2 bg-rose-500 text-white text-xs font-black px-2 py-1 rounded uppercase">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm line-clamp-2">{product.name}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">{product.category_name}</span>
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline space-x-2">
                    <span className="text-lg font-black text-slate-900">${product.price}</span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="text-sm text-slate-400 line-through">${product.compare_price}</span>
                    )}
                  </div>

                  {/* Seller Info - Clickable */}
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Seller</p>
                    <button
                      onClick={() => handleViewSeller(product.seller_id)}
                      className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline text-left"
                    >
                      {product.company_name || product.seller_name}
                    </button>
                  </div>

                  {/* Stock */}
                  <div className="text-xs font-bold text-slate-600">
                    Stock: {product.stock_quantity} units
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-black text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 font-bold text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-black text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Seller Details Modal */}
      {showSellerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeSellerModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Seller Details</h3>
                {selectedSeller && (
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    {selectedSeller.first_name} {selectedSeller.last_name}
                  </p>
                )}
              </div>
              <button
                onClick={closeSellerModal}
                className="text-slate-400 hover:text-slate-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loadingSeller ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                  <p className="font-black text-slate-400 uppercase tracking-widest">Loading...</p>
                </div>
              ) : selectedSeller ? (
                <div className="space-y-6">
                  {/* Seller Info */}
                  <div className="bg-slate-50 rounded-xl p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Company Name</p>
                        <p className="font-bold text-slate-900">
                          {selectedSeller.seller_profiles[0]?.company_name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Business Type</p>
                        <p className="font-bold text-slate-900">
                          {selectedSeller.seller_profiles[0]?.business_type || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Email</p>
                        <p className="font-bold text-slate-900">{selectedSeller.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                        <p className="font-bold text-slate-900">{selectedSeller.phone || 'N/A'}</p>
                      </div>
                      {selectedSeller.seller_profiles[0]?.address && (
                        <div className="col-span-2">
                          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Address</p>
                          <p className="font-bold text-slate-900">
                            {selectedSeller.seller_profiles[0].address}, {selectedSeller.seller_profiles[0].city}, {selectedSeller.seller_profiles[0].state} - {selectedSeller.seller_profiles[0].country}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seller's Products */}
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-4 uppercase tracking-wide">
                      All Products by this Seller ({sellerProducts.length})
                    </h4>
                    {sellerProducts.length === 0 ? (
                      <p className="text-slate-400 text-sm font-medium text-center py-8">No products found</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sellerProducts.map((product) => (
                          <div key={product.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                            <div className="flex space-x-3">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              <div className="flex-1">
                                <h5 className="font-bold text-slate-900 text-sm line-clamp-1">{product.name}</h5>
                                <p className="text-xs text-slate-500 mt-1">{product.category_name}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="font-black text-slate-900">${product.price}</span>
                                  <span className="text-xs text-slate-500">Stock: {product.stock_quantity}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-12">Failed to load seller details</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200">
              <button
                onClick={closeSellerModal}
                className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-wider hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
        {filteredProducts.length === 0 && <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Queue Clear</div>}
      </div>
    </div>
  );
};

export default Products;
