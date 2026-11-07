import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCcw, Heart, Crown, Phone, Mail, MapPin, Sparkles, CreditCard } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 mt-20 border-t-4 border-brand-pink">
      {/* 4 Value Propositions Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-brand-pink/20 text-brand-pink flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Kid Safe</h4>
              <p className="text-xs text-slate-400">Hypoallergenic & organic gentle fabrics</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-brand-yellow/20 text-brand-yellow flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Express Delivery</h4>
              <p className="text-xs text-slate-400">Fast doorstep delivery across India</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center shrink-0">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Easy 7-Day Returns</h4>
              <p className="text-xs text-slate-400">Zero-hassle exchange & refunds</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-brand-purple/20 text-brand-purple flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Razorpay Secure</h4>
              <p className="text-xs text-slate-400">256-bit encrypted UPI & Card checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Yuva Attire brings cheerful, stylish, and high-comfort kids fashion, trendy footwear, educational wooden toys, and cute accessories. Designed with love for tiny trendsetters.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link to="/vip-club" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-extrabold text-xs shadow-md">
                <Crown className="w-4 h-4" />
                <span>Join VIP Club • ₹1,000/yr</span>
              </Link>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Shop Collections</h5>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><Link to="/shop?gender=boys" className="hover:text-brand-pink transition">Boys Fashion</Link></li>
              <li><Link to="/shop?gender=girls" className="hover:text-brand-pink transition">Girls Dresses & Frocks</Link></li>
              <li><Link to="/shop?gender=infants" className="hover:text-brand-pink transition">Infant & Baby Rompers</Link></li>
              <li><Link to="/shop?category=shoes" className="hover:text-brand-pink transition">Kids Footwear & Light-up Shoes</Link></li>
              <li><Link to="/shop?category=toys" className="hover:text-brand-pink transition">Montessori & Action Toys</Link></li>
              <li><Link to="/shop?subCategory=party-wear" className="hover:text-brand-pink transition">Tuxedos & Princess Gowns</Link></li>
            </ul>
          </div>

          {/* Age Filters */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Shop By Age</h5>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><Link to="/shop?ageGroup=0-24M" className="hover:text-brand-pink transition">0 - 24 Months (Baby)</Link></li>
              <li><Link to="/shop?ageGroup=2-4Y" className="hover:text-brand-pink transition">2 - 4 Years (Toddler)</Link></li>
              <li><Link to="/shop?ageGroup=4-8Y" className="hover:text-brand-pink transition">4 - 8 Years (Little Kids)</Link></li>
              <li><Link to="/shop?ageGroup=8-12Y" className="hover:text-brand-pink transition">8 - 12 Years (Big Kids)</Link></li>
              <li><Link to="/shop?sort=discount" className="hover:text-brand-pink transition">Clearance Mega Deals</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Customer Care</h5>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><Link to="/profile?tab=orders" className="hover:text-brand-pink transition">Track Your Order</Link></li>
              <li><Link to="/wishlist" className="hover:text-brand-pink transition">My Shortlist / Wishlist</Link></li>
              <li><Link to="/vip-club" className="hover:text-brand-pink transition">VIP Club Benefits</Link></li>
              <li><span className="text-slate-400">Support: care@yuvaattire.com</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 Yuva Attire Kids Fashion Pvt Ltd. All rights reserved.</p>
        <p className="flex items-center gap-1 text-slate-400">
          Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for joyful kids and stylish parents.
        </p>
      </div>
    </footer>
  );
}
