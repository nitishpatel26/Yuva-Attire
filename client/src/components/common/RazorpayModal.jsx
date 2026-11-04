import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Smartphone, Building, CheckCircle2, X, AlertCircle, Sparkles, Lock } from 'lucide-react';

export default function RazorpayModal({
  isOpen,
  onClose,
  amount,
  orderData,
  type = 'ORDER', // 'ORDER' | 'VIP_MEMBERSHIP'
  onSuccess,
  onFailure
}) {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardName, setCardName] = useState('Riya Sharma');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select' | 'otp' | 'success'
  const [otp, setOtp] = useState('123456');

  if (!isOpen) return null;

  const handleSimulatePayment = async (status = 'SUCCESS') => {
    setIsProcessing(true);

    // Simulate gateway delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (status === 'SUCCESS') {
      const mockPaymentId = `pay_rzp_${Math.random().toString(36).substring(2, 10)}`;
      const mockOrderId = `order_rzp_${Math.random().toString(36).substring(2, 10)}`;
      const mockSignature = `sig_${Math.random().toString(36).substring(2, 14)}`;

      try {
        // Send verification to backend
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('yuva_token')
              ? { Authorization: `Bearer ${localStorage.getItem('yuva_token')}` }
              : {})
          },
          body: JSON.stringify({
            razorpay_order_id: mockOrderId,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSignature,
            orderId: orderData?.orderId || null,
            type,
            amount,
            customerName: orderData?.customerName || 'Yuva Attire Customer',
            customerEmail: orderData?.customerEmail || 'customer@example.com',
            paymentMethod: activeTab === 'upi' ? 'UPI (Google Pay/PhonePe)' : activeTab === 'card' ? 'Visa / Mastercard' : 'Netbanking'
          })
        });

        const data = await res.json();
        setIsProcessing(false);
        if (data.success) {
          onSuccess({
            razorpay_payment_id: mockPaymentId,
            razorpay_order_id: mockOrderId,
            razorpay_signature: mockSignature,
            transaction: data.transaction
          });
          onClose();
        } else {
          onFailure(data.message || 'Payment verification failed');
        }
      } catch (err) {
        setIsProcessing(false);
        onFailure(err.message || 'Payment error');
      }
    } else {
      setIsProcessing(false);
      onFailure('Payment was cancelled or declined by user');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        {/* Header - Razorpay Branding Style */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md">
              <span className="font-display font-black text-blue-700 text-xl tracking-tighter">R</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wide text-sm uppercase text-blue-200">Razorpay Trusted Gateway</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  TEST SANDBOX
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Yuva Attire Kids Store</h3>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/15 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-wider text-blue-200">
              {type === 'VIP_MEMBERSHIP' ? 'VIP Club 1-Year Membership' : 'Total Payable Amount'}
            </span>
            <div className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
              <span>₹{Number(amount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Selection */}
        <div className="p-6">
          <div className="flex border-b border-slate-100 mb-6 gap-2">
            <button
              onClick={() => setActiveTab('upi')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${
                activeTab === 'upi'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="w-4 h-4" /> UPI / QR
            </button>

            <button
              onClick={() => setActiveTab('card')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${
                activeTab === 'card'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Cards
            </button>

            <button
              onClick={() => setActiveTab('netbanking')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${
                activeTab === 'netbanking'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Building className="w-4 h-4" /> Netbanking
            </button>
          </div>

          {/* UPI TAB */}
          {activeTab === 'upi' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((app) => (
                  <div key={app} className="p-2.5 text-center border border-slate-200 rounded-xl bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition">
                    <span className="text-[11px] font-bold text-slate-700">{app}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Enter UPI VPA ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="username@okhdfcbank"
                />
              </div>
            </div>
          )}

          {/* CARD TAB */}
          {activeTab === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="4111 2222 3333 4444"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Name on card"
                />
              </div>
            </div>
          )}

          {/* NETBANKING TAB */}
          {activeTab === 'netbanking' && (
            <div className="grid grid-cols-3 gap-2.5">
              {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak', 'Others'].map((b) => (
                <div key={b} className="p-3 text-center border border-slate-200 rounded-xl bg-slate-50 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition">
                  <span className="text-xs font-bold text-slate-700">{b}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <button
              disabled={isProcessing}
              onClick={() => handleSimulatePayment('SUCCESS')}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Razorpay Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{Number(amount).toLocaleString('en-IN')} (Simulate Success)</span>
                </>
              )}
            </button>

            <button
              disabled={isProcessing}
              onClick={() => handleSimulatePayment('FAILURE')}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-rose-500 transition text-center"
            >
              Simulate Cancel / Failure
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit End-to-End SSL Encryption | Powered by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
