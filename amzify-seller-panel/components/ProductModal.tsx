import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Plus, Upload, Save, Trash2, Eye, Edit, Package, 
  DollarSign, Tag, Image, FileText, BarChart3, Star,
  Camera, Layers, ShoppingCart, TrendingUp, AlertCircle, Download, Sparkles, Wand2
} from 'lucide-react';
import { sellerApiService } from '../services/sellerApi';
import JsBarcode from 'jsbarcode';
import { generateProductDescription, generateSEOContent, generateShortDescription, improveDescription } from '../services/aiService';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSave: () => void;
  onSuccess?: (message: string) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, onSave, onSuccess }) => {
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
  const [hasExistingSKU, setHasExistingSKU] = useState(false);
  const [generatedBarcode, setGeneratedBarcode] = useState<string | null>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryConfirm, setShowCategoryConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
          dimensions: product.dimensions || { length: '', width: '', height: '' },
          seo_title: product.seo_title || '',
          seo_description: product.seo_description || '',
          status: product.status || 'draft'
        });
        if (product.sku) {
          setHasExistingSKU(true);
        }
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
          dimensions: { length: '', width: '', height: '' },
          seo_title: '',
          seo_description: '',
          status: 'draft'
        });
        setHasExistingSKU(false);
        setImages([]);
        setImagePreview([]);
        setHasExistingSKU(false);
      }
    }
  }, [isOpen, product]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    setCategoryError(null);
    try {
      const response = await sellerApiService.request('/categories');
      if (response.categories && response.categories.length > 0) {
        setCategories(response.categories);
        setCategoryError(null);
      } else {
        setCategories([]);
        setCategoryError('No categories available. Please contact admin to add categories.');
      }
    } catch (error: any) {
      console.error('Load categories error:', error);
      setCategoryError(error?.message || 'Failed to load categories. Please try again.');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
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
      // Validation
      if (!formData.name.trim()) {
        alert('Please enter a product name');
        return;
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        alert('Please enter a valid price');
        return;
      }
      if (!formData.category_id || formData.category_id.trim() === '') {
        alert('Please select a category');
        return;
      }
      
      setIsLoading(true);
      
      const productData: any = {
        name: formData.name,
        description: formData.description,
        short_description: formData.short_description,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price && formData.compare_price.trim() !== '' ? parseFloat(formData.compare_price) : null,
        cost_price: formData.cost_price && formData.cost_price.trim() !== '' ? parseFloat(formData.cost_price) : null,
        stock_quantity: formData.stock_quantity && formData.stock_quantity.trim() !== '' ? parseInt(formData.stock_quantity) : 0,
        category_id: formData.category_id,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        status: formData.status,
        dimensions: formData.dimensions.length && formData.dimensions.length.trim() !== '' ? formData.dimensions : null
      };
      
      // Only include SKU for new products (SKU is permanent once set)
      if (!product?.id || !product?.sku) {
        productData.sku = formData.sku;
      }

      let savedProduct;
      if (product?.id) {
        savedProduct = await sellerApiService.updateProduct(product.id, productData);
        onSuccess?.('Product updated successfully!');
      } else {
        savedProduct = await sellerApiService.createProduct(productData);
        onSuccess?.(formData.status === 'active' 
          ? 'Product created and published successfully!' 
          : 'Product saved as draft!');
      }

      // Upload images if any
      if (images.length > 0) {
        await sellerApiService.uploadProductImages(savedProduct.product?.id || product?.id, images);
      }

      onSave();
      onClose();
    } catch (error: any) {
      
      // Show detailed validation errors if available
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map((e: any) => `${e.path || e.param}: ${e.msg}`).join('\n');
        alert(`Validation errors:\n${errorMessages}`);
      } else {
        alert(error?.response?.data?.error || error?.message || 'Failed to save product. Please try again.');
      }
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

  const generateSKU = () => {
    // Generate 12-character SKU: PREFIX(3) + RANDOM(6) + CHECKSUM(3)
    const prefix = 'AMZ';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-3);
    const sku = `${prefix}${random}${timestamp}`;
    setFormData({...formData, sku});
    generateBarcodeImage(sku);
  };

  const generateBarcodeImage = (skuCode: string) => {
    if (barcodeRef.current && skuCode.length >= 8 && skuCode.length <= 12) {
      try {
        JsBarcode(barcodeRef.current, skuCode, {
          format: 'CODE128',
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 14,
          margin: 10
        });
        setGeneratedBarcode(skuCode);
      } catch (error) {
        console.error('Barcode generation error:', error);
      }
    }
  };

  const downloadBarcode = () => {
    if (!barcodeRef.current || !generatedBarcode) return;

    const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const productName = formData.name ? formData.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 'product';
          link.download = `barcode-${productName}-${generatedBarcode}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  useEffect(() => {
    if (formData.sku && formData.sku.length >= 8 && formData.sku.length <= 12) {
      generateBarcodeImage(formData.sku);
    }
  }, [formData.sku]);

  const handleGenerateDescription = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a product name first');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const categoryName = categories.find(c => c.id === formData.category_id)?.name;
      const description = await generateProductDescription(
        formData.name,
        categoryName,
        formData.short_description
      );
      setFormData({ ...formData, description });
    } catch (error) {
      console.error('AI Description Error:', error);
      alert('Failed to generate description. Please check your API key.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateShortDescription = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a product name first');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const categoryName = categories.find(c => c.id === formData.category_id)?.name;
      const shortDesc = await generateShortDescription(formData.name, categoryName);
      setFormData({ ...formData, short_description: shortDesc });
    } catch (error) {
      console.error('AI Short Description Error:', error);
      alert('Failed to generate short description. Please check your API key.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateSEO = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please enter product name and description first');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const seoContent = await generateSEOContent(formData.name, formData.description);
      setFormData({
        ...formData,
        seo_title: seoContent.title || formData.name,
        seo_description: seoContent.description || formData.description.substring(0, 160)
      });
    } catch (error) {
      console.error('AI SEO Error:', error);
      alert('Failed to generate SEO content. Please check your API key.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleImproveDescription = async (tone: 'professional' | 'casual' | 'luxury') => {
    if (!formData.description.trim()) {
      alert('Please enter a description first');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const improved = await improveDescription(formData.description, tone);
      setFormData({ ...formData, description: improved });
    } catch (error) {
      console.error('AI Improve Description Error:', error);
      alert('Failed to improve description. Please check your API key.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDelete = async () => {
    if (!product?.id) return;

    setIsDeleting(true);
    try {
      await sellerApiService.deleteProduct(product.id);
      setShowDeleteConfirm(false);
      onClose();
      onSave(); // Refresh the product list
      if (onSuccess) {
        onSuccess('Product deleted successfully');
      }
    } catch (error: any) {
      if (onSuccess) {
        onSuccess(error?.response?.data?.error || 'Failed to delete product');
      }
    } finally {
      setIsDeleting(false);
    }
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
                    onChange={(e) => {
                      if (e.target.value === '__CREATE_NEW__') {
                        // Show confirmation dialog
                        setShowCategoryConfirm(true);
                      } else {
                        setFormData({...formData, category_id: e.target.value});
                      }
                    }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    disabled={loadingCategories}
                  >
                    <option value="">
                      {loadingCategories ? 'Loading categories...' : 'Select Category'}
                    </option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                    <option value="__CREATE_NEW__" className="font-semibold text-indigo-600">
                      + Create New Category
                    </option>
                  </select>
                  {categoryError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {categoryError}
                      </p>
                      <button
                        type="button"
                        onClick={loadCategories}
                        className="mt-2 text-sm text-red-700 underline hover:text-red-800"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                  {!categoryError && !loadingCategories && categories.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600">
                      No categories available. Please contact admin.
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Short Description</label>
                    <button
                      type="button"
                      onClick={handleGenerateShortDescription}
                      disabled={isGeneratingAI || !formData.name}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      {isGeneratingAI ? 'Generating...' : 'AI Generate'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Brief product description"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Full Description</label>
                    <div className="flex gap-2">
                      {formData.description && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleImproveDescription('professional')}
                            disabled={isGeneratingAI}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 transition-all"
                            title="Professional tone"
                          >
                            Pro
                          </button>
                          <button
                            type="button"
                            onClick={() => handleImproveDescription('casual')}
                            disabled={isGeneratingAI}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-all"
                            title="Casual tone"
                          >
                            Casual
                          </button>
                          <button
                            type="button"
                            onClick={() => handleImproveDescription('luxury')}
                            disabled={isGeneratingAI}
                            className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 transition-all"
                            title="Luxury tone"
                          >
                            Luxury
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingAI || !formData.name}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <Wand2 className="w-3 h-3" />
                        {isGeneratingAI ? 'Writing...' : 'AI Write'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Detailed product description - or let AI write it for you!"
                  />
                  {isGeneratingAI && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-purple-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                      AI is crafting your content...
                    </div>
                  )}
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
              {/* SKU/Barcode Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-600" />
                  Product Identification (SKU/Barcode)
                </h3>
                
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                    <input
                      type="checkbox"
                      checked={hasExistingSKU}
                      onChange={(e) => {
                        setHasExistingSKU(e.target.checked);
                        if (!e.target.checked && !formData.sku) {
                          generateSKU();
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    I have an existing SKU code
                  </label>
                </div>

                {hasExistingSKU ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Enter SKU Code (8-12 characters) * {product?.sku && <span className="text-xs text-amber-600">(Permanent)</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => {
                        if (!product?.sku) {
                          const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                          if (value.length <= 12) {
                            setFormData({...formData, sku: value});
                          }
                        }
                      }}
                      className={"w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono" + (product?.sku ? " bg-slate-100 cursor-not-allowed" : "")}
                      placeholder="e.g., AMZABC123456"
                      minLength={8}
                      maxLength={12}
                      required
                      readOnly={!!product?.sku}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.sku.length}/12 characters
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Auto-Generated SKU {product?.sku && <span className="text-xs text-amber-600">(Permanent)</span>}
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={formData.sku}
                        readOnly
                        className="flex-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600"
                        placeholder={product?.sku ? "SKU is permanent" : "Click generate to create SKU"}
                      />
                      <button
                        type="button"
                        onClick={generateSKU}
                        disabled={!!product?.sku || !!formData.sku}
                        className={"px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap " + (product?.sku || formData.sku ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700")}
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        {formData.sku ? 'Generated' : 'Generate'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Barcode Display & Download */}
                {formData.sku && formData.sku.length >= 8 && (
                  <div className="mt-6 bg-white p-6 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-slate-700">Generated Barcode</h4>
                      <button
                        type="button"
                        onClick={downloadBarcode}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download PNG
                      </button>
                    </div>
                    <div className="flex justify-center p-4 bg-slate-50 rounded-lg">
                      <svg ref={barcodeRef}></svg>
                    </div>
                    <p className="text-xs text-center text-slate-500 mt-2">
                      Barcode format: CODE128 | SKU: {formData.sku}
                    </p>
                  </div>
                )}
              </div>

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
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">AI SEO Optimization</h3>
                    <p className="text-xs text-slate-600">Generate SEO-optimized title and meta description</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateSEO}
                    disabled={isGeneratingAI || !formData.name || !formData.description}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingAI ? 'Generating...' : 'Generate SEO'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SEO Title</label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="SEO optimized title"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Recommended: 50-60 characters | Current: {formData.seo_title.length}
                </p>
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
                <p className="text-xs text-slate-500 mt-1">
                  Recommended: 150-160 characters | Current: {formData.seo_description.length}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-8 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            {product && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Product
              </button>
            )}
          </div>
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

      {/* Category Creation Confirmation Modal */}
      {showCategoryConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Create New Category?</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    This will close the product form and take you to create a new category.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowCategoryConfirm(false)}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCategoryConfirm(false);
                    onClose();
                    // Trigger navigation to categories tab
                    window.dispatchEvent(new CustomEvent('navigate-to-categories'));
                  }}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Delete Product?</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Are you sure you want to delete "{formData.name}"? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductModal;