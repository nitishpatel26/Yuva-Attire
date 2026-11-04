import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLoginMode) {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Login failed');
      }
    } else {
      if (!name) {
        setLoading(false);
        return setError('Please enter your full name');
      }
      const res = await register(name, email, password, phone);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Registration failed');
      }
    }
  };

  const handleFillDemo = (type) => {
    setIsLoginMode(true);
    if (type === 'customer') {
      setEmail('');
      setPassword('');
    } else if (type === 'admin') {
      setEmail('');
      setPassword('');
    }
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
              : 'Join to receive exclusive kids fashion drops & birthday surprises'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => {
              setIsLoginMode(true);
              setError('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition ${
              isLoginMode
                ? 'bg-white text-brand-pink border-b-2 border-brand-pink shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLoginMode(false);
              setError('');
            }}
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
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Customer Name</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              </div>
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-brand-pink hover:bg-brand-coral text-white font-black text-xs shadow-md shadow-brand-pink/25 transition disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLoginMode ? 'Sign In to Yuva Attire' : 'Create Account & Start Shopping'}
            </button>
          </form>

          {/* Quick Demo Logins Helper */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 text-center mb-2 uppercase tracking-wider">
              1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('customer')}
                className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-brand-pink/10 hover:text-brand-pink text-slate-700 text-xs font-bold border border-slate-200 transition text-center"
              >
                Demo Parent (Riya)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-brand-purple/10 hover:text-brand-purple text-slate-700 text-xs font-bold border border-slate-200 transition text-center"
              >
                Store Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
