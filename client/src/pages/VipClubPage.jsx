import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Crown, Sparkles, Check, Gift, Truck, Zap, HeartHandshake, 
  ShieldCheck, ArrowRight, Star, Clock, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RazorpayModal from '../components/common/RazorpayModal';

export default function VipClubPage() {
  const { user, isAuthenticated, isVip, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [vipStatus, setVipStatus] = useState(null);
  const [vipConfig, setVipConfig] = useState({
    price: 1000,
    discountPercentage: 15,
    durationDays: 365,
    durationLabel: '1 Year (365 Days)',
    benefits: [
      'Flat Extra 15% OFF on every single order (No upper limit)',
      'Free Express Shipping with zero minimum order value',
      'Early 24-Hour VIP Access to Mega Sales & Festive Drops',
      'Special ₹500 Birthday Gift Voucher for your child',
      'Dedicated 24/7 Priority Parent Support & Quick Exchanges'
    ]
  });
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Fetch VIP config & current user VIP status
    const token = localStorage.getItem('yuva_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch('/api/vip/status', { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVipStatus(data);
          if (data.planDetails) {
            setVipConfig(data.planDetails);
          }
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleSubscribeClick = () => {
    if (!isAuthenticated) {
      setErrorMessage('Please sign in or create an account before subscribing to VIP Club');
      return;
    }
    setIsRazorpayOpen(true);
  };

  const handleRazorpaySuccess = async (rzpResult) => {
    setLoading(true);
    try {
      const res = await fetch('/api/vip/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('yuva_token')}`
        },
        body: JSON.stringify({
          razorpayPaymentId: rzpResult.razorpay_payment_id,
          razorpayOrderId: rzpResult.razorpay_order_id
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSuccessMessage('🎉 Congratulations! You are now an active Yuva Attire VIP Club Member for 1 Year!');
        await refreshUser();
        try {
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
        } catch (e) {}
      } else {
        setErrorMessage(data.message || 'Failed to activate VIP');
      }
    } catch (e) {
      setLoading(false);
      setErrorMessage(e.message || 'VIP Subscription error');
    }
  };

  const currentPrice = vipConfig.price ?? 1000;
  const currentDiscount = vipConfig.discountPercentage ?? 15;
  const currentDurationLabel = vipConfig.durationLabel || `${vipConfig.durationDays || 365} Days`;
  const benefitsList = vipConfig.benefits || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-900 shadow-2xl p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 border-2 border-amber-300">
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Crown className="w-4 h-4 fill-amber-300" />
            <span>YUVA ATTIRE VIP CLUB</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Unlock Year-Round {currentDiscount}% Extra Savings for Just ₹{currentPrice.toLocaleString('en-IN')}!
          </h1>

          <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
            The ultimate smart shopping club for stylish parents. Enjoy flat {currentDiscount}% discount on all kids apparel, shoes, and toys, plus free express shipping for {currentDurationLabel}.
          </p>

          {isVip ? (
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-lg">
              <div>
                <p className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 fill-amber-300" /> YOUR VIP STATUS IS ACTIVE
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  {vipStatus?.vipExpiry ? `Valid until: ${new Date(vipStatus.vipExpiry).toLocaleDateString()}` : `Validity: ${currentDurationLabel}`} (Auto-applied in cart & checkout)
                </p>
              </div>
              <button
                onClick={() => navigate('/shop')}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-900 font-black text-xs hover:bg-amber-300"
              >
                Shop Now
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                disabled={loading}
                onClick={handleSubscribeClick}
                className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl transition"
              >
                <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Join VIP Club • ₹{currentPrice.toLocaleString('en-IN')} ({currentDurationLabel})</span>
              </button>

              <span className="text-xs font-bold text-slate-800">
                🔒 Instant Razorpay Activation
              </span>
            </div>
          )}
        </div>

        <div className="w-full md:w-auto flex justify-center">
          <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-md shadow-xl border border-white max-w-xs text-center space-y-3">
            <span className="text-[11px] font-black uppercase text-amber-800 tracking-wider">ANNUAL VIP PASS</span>
            <div className="text-4xl font-black text-slate-900">
              ₹{currentPrice.toLocaleString('en-IN')}
              <span className="text-xs font-bold text-slate-500"> / {vipConfig.durationDays || 365} days</span>
            </div>
            <p className="text-xs font-semibold text-slate-600">
              Average parent saves <span className="font-bold text-emerald-600">₹4,200+</span> every year!
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Valid for {currentDurationLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 5 Core Benefits Grid */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-black text-amber-600 uppercase tracking-wider">Exclusive Privileges</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Why Parents Love Yuva VIP Club</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefitsList.map((benefit, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                <Crown className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-sm font-black text-slate-800">VIP Benefit #{i + 1}</h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">{benefit}</p>
            </div>
          ))}

          {/* Calculator Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-md flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">ANNUAL SAVINGS BREAKDOWN</span>
              <h3 className="text-sm font-black mt-1">Spend ₹10,000 on Kids Fashion</h3>
              <div className="space-y-1.5 mt-3 text-xs text-slate-300">
                <p className="flex justify-between">
                  <span>{currentDiscount}% VIP Extra Discount:</span>
                  <span className="font-bold text-emerald-400">Save ₹{Math.round(10000 * (currentDiscount / 100)).toLocaleString('en-IN')}</span>
                </p>
                <p className="flex justify-between">
                  <span>Free Express Shipping (6 orders):</span>
                  <span className="font-bold text-emerald-400">Save ₹594</span>
                </p>
                <p className="flex justify-between">
                  <span>Birthday Treat Voucher:</span>
                  <span className="font-bold text-emerald-400">Save ₹500</span>
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-700 flex justify-between items-center text-xs font-black text-amber-300">
              <span>Net Benefit:</span>
              <span className="text-sm font-bold text-amber-400">High Return on VIP Membership!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Subscription Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        amount={currentPrice}
        orderData={{ customerName: user?.name, customerEmail: user?.email }}
        type="VIP_MEMBERSHIP"
        onSuccess={handleRazorpaySuccess}
        onFailure={(msg) => setErrorMessage(msg)}
      />
    </div>
  );
}
