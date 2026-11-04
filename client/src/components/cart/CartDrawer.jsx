import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Plus, Minus, Tag, Crown, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    coupon,
    applyCoupon,
    removeCoupon,
    totalItemsCount,
    subtotal,
    couponDiscount,
    vipDiscount,
    shippingFee,
    totalAmount,
    totalSavings
  } = useCart();

  const { isVip } = useAuth();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (codeToApply) => {
    setCouponError('');
    setCouponSuccess('');
    const code = codeToApply || couponInput;
    const res = await applyCoupon(code);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-brand-cream/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-pink" />
              <h2 className="text-base font-black text-slate-800">
                Shopping Bag ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-brand-cream flex items-center justify-center text-brand-pink mb-4">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Your bag is empty</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Explore our cheerful kids dresses, party suits, shoes & wooden toys to fill it up!
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/shop');
                }}
                className="mt-6 px-6 py-2.5 rounded-2xl bg-brand-pink text-white font-bold text-xs shadow-md shadow-brand-pink/25 hover:bg-brand-coral transition"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* VIP Member Savings Highlight Banner */}
              {!isVip && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center shrink-0">
                      <Crown className="w-4 h-4 fill-slate-900" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-amber-900">VIP Club Extra 15% OFF</p>
                      <p className="text-[11px] text-amber-700">
                        Join for ₹1,000/yr & save extra ₹{Math.round(subtotal * 0.15)} on this order!
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/vip-club"
                    onClick={() => setIsCartOpen(false)}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] shrink-0"
                  >
                    Join
                  </Link>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3 divide-y divide-slate-100">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="pt-3 first:pt-0 flex gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-20 object-cover rounded-2xl border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                          <button
                            onClick={() => removeFromCart(item.productId, item.size, item.color)}
                            className="text-slate-400 hover:text-rose-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Size: <span className="font-semibold text-slate-600">{item.size}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                          {item.originalPrice > item.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{item.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                            className="w-5 h-5 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:bg-slate-200"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                            className="w-5 h-5 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:bg-slate-200"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-brand-pink" />
                    <span>Apply Discount Coupon</span>
                  </span>
                </div>

                {coupon ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-emerald-800 font-mono">{coupon.code}</span>
                      <p className="text-[11px] text-emerald-600">Saved ₹{coupon.discount} ({coupon.discountPercent}%)</p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="e.g. WELCOME10"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono focus:outline-none focus:ring-1 focus:ring-brand-pink"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition"
                      >
                        Apply
                      </button>
                    </div>
                    {/* Quick Coupon Chips */}
                    <div className="flex gap-1.5 mt-2">
                      {['WELCOME10', 'KIDSFEST20', 'YUVAVIP15'].map((code) => (
                        <button
                          key={code}
                          onClick={() => handleApplyCoupon(code)}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-brand-pink/10 hover:text-brand-pink text-[10px] font-mono font-bold text-slate-600 transition"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {couponError && <p className="text-xs text-rose-500 mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-xs text-emerald-600 mt-1">{couponSuccess}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {vipDiscount > 0 && (
                  <div className="flex justify-between text-amber-600 font-semibold">
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

                <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-base text-brand-pink">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>

                {totalSavings > 0 && (
                  <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 p-2 rounded-xl text-center">
                    🎉 Woohoo! You are saving ₹{totalSavings.toLocaleString('en-IN')} on this order!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Footer Direct Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-white space-y-2">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-pink to-brand-coral hover:from-brand-coral hover:to-brand-pink text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-pink/25 transition"
              >
                <span>Proceed to Online Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Razorpay Secured Instant Payment</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
