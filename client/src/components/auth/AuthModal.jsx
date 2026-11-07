import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Sparkles, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSwitchTab = (loginMode) => {
    setIsLoginMode(loginMode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLoginMode) {
      setLoading(true);
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } else {
      if (!name.trim()) {
        return setError('Please enter your full name');
      }
      if (!email.trim() || !email.includes('@')) {
        return setError('Please enter a valid email address');
      }

      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        return setError('Mobile number is required. Please enter a valid 10-digit mobile number.');
      }

      if (password.length < 6) {
        return setError('Password must be at least 6 characters long');
      }

      setLoading(true);
      const res = await register(name, email, password, phone);
      setLoading(false);

      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Registration failed');
      }
    }
  };

  // 1-Click Demo Parent Login
  const handleFillDemo = () => {
    setIsLoginMode(true);
    setEmail('riya@example.com');
    setPassword('password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 text-center bg-brand-cream/60 border-b border-slate-100">
          <div className="flex justify-center mb-2">
            <Logo size="md" />
          </div>
          <h3 className="text-base font-black text-slate-800">
            {isLoginMode ? 'Welcome Back to Yuva Attire!' : 'Create Your Yuva Account'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isLoginMode
              ? 'Sign in to access your Wishlist, VIP club benefits & Order tracking'
              : 'Join to receive exclusive kids fashion drops & secure shopping'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => handleSwitchTab(true)}
            className={`flex-1 py-3 text-xs font-bold transition ${
              isLoginMode
                ? 'bg-white text-brand-pink border-b-2 border-brand-pink shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => handleSwitchTab(false)}
            className={`flex-1 py-3 text-xs font-bold transition ${
              !isLoginMode
                ? 'bg-white text-brand-pink border-b-2 border-brand-pink shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Registration Fields */}
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parent / Customer Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Riya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              </div>
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">* (Required)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 flex items-center gap-1 text-slate-500 font-bold text-xs pointer-events-none">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-16 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-brand-pink hover:bg-brand-coral text-white font-black text-xs shadow-md shadow-brand-pink/25 transition disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLoginMode ? 'Sign In to Yuva Attire' : 'Create Account & Start Shopping'}
            </button>
          </form>

          {/* Quick Demo Login Helper */}
          {isLoginMode && (
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-brand-pink/10 hover:text-brand-pink text-slate-600 text-xs font-bold border border-slate-200 transition text-center flex items-center justify-center gap-2"
              >
                <span>⚡ 1-Click Demo Login (Parent Account)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
