import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, CreditCard, Truck, CheckCircle2, Lock, 
  MapPin, Phone, Mail, User, AlertCircle, Crown, ShoppingBag 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import RazorpayModal from '../components/common/RazorpayModal';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, subtotal, coupon, couponDiscount, vipDiscount, shippingFee, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated, isVip } = useAuth();

  const [name, setName] = useState(user?.name || 'Riya Sharma');
  const [email, setEmail] = useState(user?.email || 'riya@example.com');
  const [phone, setPhone] = useState(user?.phone || '+91 9123456789');
  const [street, setStreet] = useState(user?.addresses?.[0]?.street || 'Flat 402, Sunshine Heights, Indiranagar');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || 'Bengaluru');
  const [state, setState] = useState(user?.addresses?.[0]?.state || 'Karnataka');
  const [pincode, setPincode] = useState(user?.addresses?.[0]?.pincode || '560038');

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Your bag is empty</h2>
        <p className="text-xs text-slate-400">Add products to proceed to checkout.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 rounded-2xl bg-brand-pink text-white font-bold text-xs">
          Explore Kids Catalog
        </Link>
      </div>
    );
  }

  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!street || !city || !pincode || !name || !email) {
      setErrorMessage('Please fill in all required shipping address fields');
      return;
    }

    if (paymentMethod === 'razorpay') {
      // Trigger Razorpay Payment Dialog
      setIsRazorpayOpen(true);
    } else {
      // Cash on Delivery
      setLoading(true);
      try {
        const orderPayload = {
          items: cartItems,
          shippingAddress: { name, street, city, state, pincode, phone },
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          paymentMethod: 'cod',
          couponCode: coupon?.code || null
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('yuva_token')
              ? { Authorization: `Bearer ${localStorage.getItem('yuva_token')}` }
              : {})
          },
          body: JSON.stringify(orderPayload)
        });

        const data = await res.json();
        setLoading(false);

        if (data.success && data.order) {
          clearCart();
          navigate(`/order-success/${data.order.id}`);
        } else {
          setErrorMessage(data.message || 'Failed to place order');
        }
      } catch (err) {
        setLoading(false);
        setErrorMessage(err.message || 'Order error');
      }
    }
  };

  const handleRazorpaySuccess = async (rzpResult) => {
    setLoading(true);
    try {
      const orderPayload = {
        items: cartItems,
        shippingAddress: { name, street, city, state, pincode, phone },
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        paymentMethod: 'razorpay',
        couponCode: coupon?.code || null,
        razorpayOrderId: rzpResult.razorpay_order_id,
        razorpayPaymentId: rzpResult.razorpay_payment_id
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('yuva_token')
            ? { Authorization: `Bearer ${localStorage.getItem('yuva_token')}` }
            : {})
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      setLoading(false);

      if (data.success && data.order) {
        clearCart();
        navigate(`/order-success/${data.order.id}`);
      } else {
        setErrorMessage(data.message || 'Failed to create order record');
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Payment processing error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Express Checkout</h1>
        <p className="text-xs text-slate-400 mt-1">100% Secure Payment Powered by Razorpay</p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrderSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Shipping Details & Payment Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address Box */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-brand-pink" />
              <h2 className="text-sm font-black text-slate-800">1. Delivery Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parent's Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-pink"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address for Updates *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-pink"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Flat / House No / Street Address *</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 402, Green Valley Apartments"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-pink font-mono"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-brand-pink" />
              <h2 className="text-sm font-black text-slate-800">2. Select Payment Method</h2>
            </div>

            <div className="space-y-3">
              {/* Razorpay Online */}
              <label
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === 'razorpay'
                    ? 'border-brand-pink bg-brand-pink/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="accent-brand-pink"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">Razorpay Online Payment</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                        Cards • UPI • GPay • Netbanking
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Instant checkout with 256-bit encrypted Razorpay sandbox</p>
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </label>

              {/* Cash on Delivery */}
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === 'cod'
                    ? 'border-brand-pink bg-brand-pink/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-brand-pink"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-900">Cash on Delivery (COD)</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pay in cash or UPI at the time of doorstep delivery</p>
                  </div>
                </div>
                <Truck className="w-5 h-5 text-slate-400" />
              </label>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Order Summary & Place Button */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-800 pb-3 border-b border-slate-100">
              Order Summary ({cartItems.length} items)
            </h2>

            {/* Item Mini List */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 text-xs">
                  <img src={item.image} alt="" className="w-10 h-12 object-cover rounded-xl border" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400">Qty: {item.quantity} • Size: {item.size}</p>
                  </div>
                  <span className="font-black text-slate-800">₹{item.subtotal.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon ({coupon?.code})</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {vipDiscount > 0 && (
                <div className="flex justify-between text-amber-600 font-bold">
                  <span className="flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 fill-amber-500" /> VIP Member 15% OFF
                  </span>
                  <span>-₹{vipDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shippingFee}`}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
                <span>Total Payable</span>
                <span className="text-brand-pink text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-brand-pink to-brand-coral hover:from-brand-coral hover:to-brand-pink text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-pink/25 transition disabled:opacity-50"
            >
              {loading ? (
                'Processing Order...'
              ) : paymentMethod === 'razorpay' ? (
                <>
                  <Lock className="w-4 h-4" /> Pay ₹{totalAmount.toLocaleString('en-IN')} via Razorpay
                </>
              ) : (
                'Place Order (Cash on Delivery)'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Razorpay Interactive Test Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        amount={totalAmount}
        orderData={{ customerName: name, customerEmail: email }}
        type="ORDER"
        onSuccess={handleRazorpaySuccess}
        onFailure={(msg) => setErrorMessage(msg)}
      />
    </div>
  );
}
