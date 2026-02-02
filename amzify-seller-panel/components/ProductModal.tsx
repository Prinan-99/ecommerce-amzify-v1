import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Upload, Save, Trash2, Eye, Edit, Package, 
  DollarSign, Tag, Image, FileText, BarChart3, Star,
  Camera, Layers, ShoppingCart, TrendingUp, AlertCircle
} from 'lucide-react';
import { sellerApiService } from '../services/sellerApi';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSave: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    compare_price: '',
    cost_price: '',
    sku: '',
    stock_quantity: '',
    category_id: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    seo_title: '',
    seo_description: '',
    status: 'draft'
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'inventory' | 'seo' | 'images'>('basic');

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          short_description: product.short_description || '',
          price: product.price?.toString() || '',
          compare_price: product.compare_price?.toString() || '',
          cost_price: product.cost_price?.toString() || '',
          sku: product.sku || '',
          stock_quantity: product.stock_quantity?.toString() || '',
          category_id: product.category_id || '',
          weight: product.weight?.toString() || '',
          dimensions: product.dimensions || { length: '', width: '', height: '' },
          seo_title: product.seo_title || '',
          seo_description: product.seo_description || '',
          status: product.status || 'draft'
        });
        if (product.images) {
          setImagePreview(product.images);
        }
      } else {
        // Reset form for new product
        setFormData({
          name: '',
          description: '',
          short_description: '',
          price: '',
          compare_price: '',
          cost_price: '',
          sku: '',
          stock_quantity: '',
          category_id: '',
          weight: '',
          dimensions: { length: '', width: '', height: '' },
          seo_title: '',
          seo_description: '',
          status: 'draft'
        });
        setImages([]);
        setImagePreview([]);
      }
    }
  }, [isOpen, product]);

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Load categories error:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions.length ? formData.dimensions : null
      };

      let savedProduct;
      if (product?.id) {
        savedProduct = await sellerApiService.updateProduct(product.id, productData);
      } else {
        savedProduct = await sellerApiService.createProduct(productData);
      }

      // Upload images if any
      if (images.length > 0) {
        await sellerApiService.uploadProductImages(savedProduct.product?.id || product?.id, images);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Save product error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return isNaN(num) ? '₹0' : new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {product ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-slate-600">
                {product ? 'Update your product details' : 'Create a new product listing'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-8">
          {[
            { id: 'basic', label: 'Basic Info', icon: FileText },
            { id: 'pricing', label: 'Pricing', icon: DollarSign },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'images', label: 'Images', icon: Image },
            { id: 'seo', label: 'SEO', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[50vh] overflow-y-auto">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Product SKU"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Short Description</label>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Brief product description"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Detailed product description"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Selling Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Price customers will pay</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Compare Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                    <input
                      type="number"
                      value={formData.compare_price}
                      onChange={(e) => setFormData({...formData, compare_price: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Original price (for discounts)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cost Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                    <input
                      type="number"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Your cost (for profit calculation)</p>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-slate-50 p-6 rounded-2xl">
                <h4 className="font-bold text-slate-900 mb-4">Pricing Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(formData.price)}</p>
                    <p className="text-sm text-slate-600">Selling Price</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {formData.price && formData.cost_price 
                        ? formatCurrency((parseFloat(formData.price) - parseFloat(formData.cost_price)).toString())
                        : '₹0'
                      }
                    </p>
                    <p className="text-sm text-slate-600">Profit</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {formData.price && formData.cost_price 
                        ? `${(((parseFloat(formData.price) - parseFloat(formData.cost_price)) / parseFloat(formData.price)) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </p>
                    <p className="text-sm text-slate-600">Margin</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dimensions (cm)</label>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="number"
                    value={formData.dimensions.length}
                    onChange={(e) => setFormData({
                      ...formData, 
                      dimensions: {...formData.dimensions, length: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Length"
                  />
                  <input
                    type="number"
                    value={formData.dimensions.width}
                    onChange={(e) => setFormData({
                      ...formData, 
                      dimensions: {...formData.dimensions, width: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Width"
                  />
                  <input
                    type="number"
                    value={formData.dimensions.height}
                    onChange={(e) => setFormData({
                      ...formData, 
                      dimensions: {...formData.dimensions, height: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Height"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Product Images</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Camera className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">Click to upload images</p>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB each</p>
                  </label>
                </div>
              </div>

              {imagePreview.length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-4">Image Preview</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SEO Title</label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="SEO optimized title"
                />
                <p className="text-xs text-slate-500 mt-1">Recommended: 50-60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SEO Description</label>
                <textarea
                  value={formData.seo_description}
                  onChange={(e) => setFormData({...formData, seo_description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="SEO meta description"
                />
                <p className="text-xs text-slate-500 mt-1">Recommended: 150-160 characters</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-8 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !formData.name || !formData.price}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 inline mr-2" />
                {product ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;