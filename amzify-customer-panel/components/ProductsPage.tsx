import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Star, Search, Filter, Loader2, AlertCircle,
  ChevronRight, Store
} from 'lucide-react';
import { customerApiService } from '../services/customerApi';

interface Product {
  id: string;
  name: string;
  price: number;
  images?: any[];
  category_name?: string;
  seller_name?: string;
  stock_quantity?: number;
  created_at?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  product_count: number;
}

interface Seller {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  seller_profiles?: any[];
}

interface ProductsPageProps {
  onAddToCart: (product: Product) => void;
  onSelectSeller?: (seller: Seller) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ onAddToCart, onSelectSeller }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [showSellerModal, setShowSellerModal] = useState(false);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await customerApiService.getTopCategories();
      setCategories(response.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadProducts = async (page: number = 1, filters?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await customerApiService.getProducts(page, ITEMS_PER_PAGE, filters);
      setProducts(response.products || []);
      setTotalPages(response.pagination?.pages || 1);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Load products error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadProducts(1, {
      category: selectedCategory || undefined,
      search: searchQuery || undefined
    });
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
    setCurrentPage(1);
    loadProducts(1, {
      category: categoryId !== selectedCategory ? categoryId : undefined,
      search: searchQuery || undefined
    });
  };

  const handleViewSeller = async (sellerName: string) => {
    // For customer panel, we need to find the seller by name from products
    // Since we don't have direct seller ID lookup from product data alone,
    // we'll fetch seller info based on the product that has this seller
    try {
      setIsLoading(true);
      const product = products.find(p => p.seller_name === sellerName);
      if (!product) {
        console.error('Could not find product for seller');
        return;
      }

      // Fetch all seller-related products that share this seller name
      const sellerProds = products.filter(p => p.seller_name === sellerName);
      
      // Create a mock seller object from product data
      const mockSeller = {
        id: product.id, // Use product ID as reference for API calls
        first_name: sellerName.split(' ')[0],
        last_name: sellerName.split(' ').slice(1).join(' '),
        email: `${sellerName.toLowerCase().replace(/\s+/g, '.')}@seller.com`,
        phone: '+91 XXXXX XXXXX',
        seller_profiles: [{
          company_name: sellerName,
          description: `Welcome to ${sellerName} - Your trusted seller on Amzify`
        }]
      };

      setSelectedSeller(mockSeller);
      setSellerProducts(sellerProds);
      setShowSellerModal(true);
    } catch (err) {
      console.error('Failed to load seller details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white">
      {/* Top Categories Section */}
      {categories.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-black mb-8">TOP CATEGORIES</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`p-4 rounded-xl transition-all text-center ${
                    selectedCategory === category.id
                      ? 'bg-red-600 shadow-lg'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">{category.name}</div>
                  <div className="text-xs opacity-90">{category.product_count} products</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-300 rounded-xl flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
            <p className="text-slate-600">Loading products...</p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Products Found</h3>
            <p className="text-slate-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {products.map(product => (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={
                        product.images?.[0] ||
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 mb-2 line-clamp-2">{product.name}</h4>

                    {/* Category & Seller */}
                    <div className="mb-3 text-xs">
                      {product.category_name && (
                        <div className="text-slate-500 mb-1">{product.category_name}</div>
                      )}
                      {product.seller_name && (
                        <button
                          onClick={() => handleViewSeller(product.seller_name!)}
                          className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                          <Store className="w-3 h-3" />
                          {product.seller_name}
                        </button>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-lg font-black text-slate-900">
                        {formatINR(Number(product.price))}
                      </span>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-4">
                      {product.stock_quantity ? (
                        <span className="text-xs text-green-600 font-medium">
                          {product.stock_quantity} In Stock
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={!product.stock_quantity}
                      className={`w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        product.stock_quantity
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {product.stock_quantity ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mb-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => loadProducts(page, { category: selectedCategory, search: searchQuery })}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Seller Modal */}
      {showSellerModal && selectedSeller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
            {/* Seller Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-black mb-2">
                    {selectedSeller.first_name} {selectedSeller.last_name}
                  </h2>
                  {selectedSeller.seller_profiles?.[0]?.company_name && (
                    <p className="text-xl opacity-90">{selectedSeller.seller_profiles[0].company_name}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowSellerModal(false)}
                  className="text-white hover:opacity-75"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Seller Info */}
            <div className="p-8">
              {selectedSeller.seller_profiles?.[0]?.description && (
                <p className="text-slate-600 mb-6">{selectedSeller.seller_profiles[0].description}</p>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Email</div>
                  <div className="font-medium text-slate-900">{selectedSeller.email}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Phone</div>
                  <div className="font-medium text-slate-900">{selectedSeller.phone}</div>
                </div>
              </div>

              {/* Seller's Products */}
              <div>
                <h3 className="text-2xl font-black mb-6">Products by this Seller</h3>
                {sellerProducts.length === 0 ? (
                  <p className="text-slate-600">No products found</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sellerProducts.map(product => (
                      <div
                        key={product.id}
                        className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="aspect-square bg-slate-100 overflow-hidden">
                          <img
                            src={
                              product.images?.[0] ||
                              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-slate-900 mb-2 line-clamp-2">{product.name}</h4>
                          <div className="mb-4">
                            <span className="text-lg font-black text-slate-900">
                              {formatINR(Number(product.price))}
                            </span>
                          </div>
                          <button
                            onClick={() => onAddToCart(product)}
                            className="w-full py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
