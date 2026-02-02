import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Truck, MapPin, Check, Loader2 } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onConfirmOrder: (orderData: any) => Promise<void>;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, items, onConfirmOrder }) => {
  const [step, setStep] = useState<'address' | 'payment' | 'confirmation'>('address');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
  const total = subtotal + tax + shipping;

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirmation');
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    try {
      await onConfirmOrder({
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        card_details: paymentMethod === 'card' ? cardDetails : undefined
      });
      onClose();
    } catch (error) {
      console.error('Order confirmation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-[3rem] border-b border-slate-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">Checkout</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 'address' ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'
              }`}>
                {step === 'address' ? '1' : <Check className="w-4 h-4" />}
              </div>
              <div className={`h-1 w-16 ${step !== 'address' ? 'bg-green-600' : 'bg-slate-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 'payment' ? 'bg-indigo-600 text-white' : 
                step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step === 'confirmation' ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className={`h-1 w-16 ${step === 'confirmation' ? 'bg-green-600' : 'bg-slate-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 'confirmation' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Address Step */}
          {step === 'address' && (
            <form onSubmit={handleAddressSubmit} className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-900">Shipping Address</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street_address}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, street_address: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="123 Main Street, Apartment 4B"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Maharashtra"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postal_code}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="400001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
                    readOnly
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
              >
                Continue to Payment
              </button>
            </form>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-900">Payment Method</h3>
              </div>

              <div className="space-y-4">
                <div 
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-slate-600" />
                    <span className="font-medium text-slate-900">Credit/Debit Card</span>
                  </div>
                </div>

                <div 
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === 'upi' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-slate-600" />
                    <span className="font-medium text-slate-900">UPI Payment</span>
                  </div>
                </div>

                <div 
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-slate-600" />
                    <span className="font-medium text-slate-900">Cash on Delivery</span>
                  </div>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">CVV</label>
                      <input
                        type="text"
                        required
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="123"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
              >
                Review Order
              </button>
            </form>
          )}

          {/* Confirmation Step */}
          {step === 'confirmation' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Check className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-slate-900">Order Confirmation</h3>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="font-bold text-slate-900 mb-4">Order Summary</h4>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100'} 
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-900">{formatINR(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-slate-200 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="text-slate-900">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax (18% GST)</span>
                    <span className="text-slate-900">{formatINR(tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="text-slate-900">{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                    <span className="text-slate-900">Total</span>
                    <span className="text-slate-900">{formatINR(total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="font-bold text-slate-900 mb-3">Shipping Address</h4>
                <p className="text-slate-700">
                  {shippingAddress.street_address}<br />
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}<br />
                  {shippingAddress.country}
                </p>
              </div>

              {/* Payment Method */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="font-bold text-slate-900 mb-3">Payment Method</h4>
                <p className="text-slate-700 capitalize">
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : 
                   paymentMethod === 'upi' ? 'UPI Payment' : 'Credit/Debit Card'}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Please confirm your order details before proceeding with payment.</strong> 
                  Once confirmed, your order will be processed and you will receive a confirmation email.
                </p>
              </div>

              <button
                onClick={handleConfirmOrder}
                disabled={isProcessing}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing Order...
                  </>
                ) : (
                  `Confirm Order - ${formatINR(total)}`
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;