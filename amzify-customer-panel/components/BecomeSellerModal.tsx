import React, { useState } from 'react';
import { X, Store, User, Building, Phone, Mail, MapPin, FileText, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface BecomeSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BecomeSellerModal: React.FC<BecomeSellerModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'intro' | 'personal' | 'business' | 'verification' | 'success'>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Business Information
    companyName: '',
    businessType: '',
    businessDescription: '',
    businessAddress: '',
    city: '',
    state: '',
    postalCode: '',
    gstNumber: '',
    panNumber: '',
    
    // Bank Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 'intro') setStep('personal');
    else if (step === 'personal') setStep('business');
    else if (step === 'business') setStep('verification');
    else if (step === 'verification') handleSubmit();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5009/api/auth/apply/seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('success');
      } else {
        throw new Error(data.error || 'Application submission failed');
      }
    } catch (error) {
      console.error('Seller application error:', error);
      alert(error instanceof Error ? error.message : 'Application submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900">Become a Seller</h2>
            {step !== 'intro' && step !== 'success' && (
              <p className="text-xs text-slate-500">Step {step === 'personal' ? '1' : step === 'business' ? '2' : '3'} of 3</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {step !== 'intro' && step !== 'success' && (
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <div className={`h-1.5 flex-1 rounded-full transition-all ${step === 'personal' || step === 'business' || step === 'verification' ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
              <div className={`h-1.5 flex-1 rounded-full transition-all ${step === 'business' || step === 'verification' ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
              <div className={`h-1.5 flex-1 rounded-full transition-all ${step === 'verification' ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Intro Step */}
          {step === 'intro' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Store className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Start Your Selling Journey</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Join Amzify's marketplace and reach millions of customers
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
                    <Store className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">Easy Setup</h4>
                  <p className="text-[10px] text-slate-600">Quick process</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">Customers</h4>
                  <p className="text-[10px] text-slate-600">Large base</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">Secure</h4>
                  <p className="text-[10px] text-slate-600">Fast payments</p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 mx-auto"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Personal Information Step */}
          {step === 'personal' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Personal Information</h3>
                <p className="text-slate-600 text-sm">Tell us about yourself</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all text-sm"
              >
                Continue
              </button>
            </div>
          )}

          {/* Business Information Step */}
          {step === 'business' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Business Information</h3>
                <p className="text-slate-600 text-sm">Tell us about your business</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Company/Store Name</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Your Store Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Business Type</label>
                  <select
                    required
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="">Select Type</option>
                    <option value="individual">Individual</option>
                    <option value="partnership">Partnership</option>
                    <option value="private_limited">Private Ltd</option>
                    <option value="public_limited">Public Ltd</option>
                    <option value="llp">LLP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">GST Number</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Optional"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Business Description</label>
                  <textarea
                    required
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    rows={2}
                    placeholder="What do you sell?"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Business Address</label>
                  <input
                    type="text"
                    required
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Maharashtra"
                  />
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all text-sm"
              >
                Continue
              </button>
            </div>
          )}

          {/* Verification Step */}
          {step === 'verification' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Bank Details</h3>
                <p className="text-slate-600 text-sm">For payments and settlements</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="SBI"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Account Holder</label>
                  <input
                    type="text"
                    required
                    value={formData.accountHolderName}
                    onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Account Number</label>
                  <input
                    type="text"
                    required
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={formData.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="SBIN0001234"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-xs">
                  <strong>Note:</strong> Admin will review your application within 24-48 hours.
                </p>
              </div>

              <button
                onClick={handleNext}
                disabled={isLoading}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Application Submitted!</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  We've received your application and will review it within 24-48 hours
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-sm mx-auto">
                <h4 className="font-bold text-green-900 mb-2 text-sm">What's Next?</h4>
                <ul className="text-xs text-green-800 space-y-1 text-left">
                  <li>• We'll verify your information</li>
                  <li>• You'll receive email confirmation</li>
                  <li>• Start listing products once approved</li>
                </ul>
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all text-sm"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BecomeSellerModal;