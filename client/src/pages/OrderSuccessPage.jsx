import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, Truck, ArrowRight, ShieldCheck, Download, Home, ShoppingBag, Crown } from 'lucide-react';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-500 mt-4">Generating Order Confirmation...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn">
      {/* Top Success Header */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/15">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
          Order Placed Successfully!
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Thank You for Shopping at Yuva Attire!
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          We have received your order and our stylists are carefully packing your little one's joyful apparel.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 bg-slate-50 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 p-6 rounded-t-3xl">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order Reference</p>
            <p className="text-lg font-black text-slate-900 font-mono">{order?.orderNumber || id}</p>
          </div>

          <div className="sm:text-right">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated Delivery</p>
            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 sm:justify-end">
              <Truck className="w-4 h-4" /> 2 - 3 Business Days
            </p>
          </div>
        </div>

        {/* Live Status Tracker Pill */}
        <div className="p-4 rounded-2xl bg-brand-cream/60 border border-brand-pink/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-pink text-white flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">
                Status: <span className="text-brand-pink">{order?.orderStatus || 'PLACED'}</span>
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Tracking: {order?.trackingNumber || 'DELHIVERY-YUV-2026'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase">
            {order?.paymentStatus || 'PAID'}
          </span>
        </div>

        {/* Items List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Items Ordered</h3>
          <div className="space-y-3 divide-y divide-slate-100">
            {order?.items?.map((item, idx) => (
              <div key={idx} className="pt-3 first:pt-0 flex items-center gap-4">
                <img src={item.image} alt="" className="w-12 h-14 object-cover rounded-xl border" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                  <p className="text-[11px] text-slate-400">Size: {item.size} • Qty: {item.quantity}</p>
                </div>
                <span className="text-xs font-black text-slate-900">₹{item.subtotal?.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address & Price Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery Address</h4>
            <p className="font-bold text-slate-800">{order?.shippingAddress?.name}</p>
            <p className="text-slate-600 mt-0.5">{order?.shippingAddress?.street}</p>
            <p className="text-slate-600">{order?.shippingAddress?.city}, {order?.shippingAddress?.state} - {order?.shippingAddress?.pincode}</p>
            <p className="text-slate-500 mt-1">Phone: {order?.shippingAddress?.phone}</p>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Breakdown</h4>
            <div className="flex justify-between sm:justify-end sm:gap-4 text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold">₹{order?.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            {order?.discount > 0 && (
              <div className="flex justify-between sm:justify-end sm:gap-4 text-emerald-600 font-bold">
                <span>Coupon Discount:</span>
                <span>-₹{order?.discount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            {order?.vipDiscount > 0 && (
              <div className="flex justify-between sm:justify-end sm:gap-4 text-amber-600 font-bold">
                <span>VIP Member 15% OFF:</span>
                <span>-₹{order?.vipDiscount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between sm:justify-end sm:gap-4 text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Paid:</span>
              <span className="text-brand-pink">₹{order?.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[11px] text-slate-400 capitalize">Payment Method: {order?.paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Bottom Action CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/profile?tab=orders"
          className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md"
        >
          <Package className="w-4 h-4" />
          <span>View All My Orders</span>
        </Link>

        <Link
          to="/shop"
          className="px-6 py-3 rounded-2xl bg-brand-pink hover:bg-brand-coral text-white font-bold text-xs flex items-center gap-2 shadow-md"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Kids Shopping</span>
        </Link>
      </div>
    </div>
  );
}
