import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Heart, ShoppingBag, Crown, User, Sparkles, 
  Menu, X, ChevronDown, ShieldCheck, Flame, Tag, LogOut, Package, LayoutDashboard, SlidersHorizontal 
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function Header({ onOpenAuth }) {
  const { user, isAuthenticated, isAdmin, isVip, logout } = useAuth();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search suggestions
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timer = setTimeout(() => {
        fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setSearchResults(data.products.slice(0, 5));
              setIsSearching(true);
            }
          })
          .catch(() => {});
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: 'Boys', path: '/shop?gender=boys', icon: '👦' },
    { name: 'Girls', path: '/shop?gender=girls', icon: '👧' },
    { name: 'Baby & Toddlers', path: '/shop?gender=infants', icon: '👶' },
    { name: 'Footwear', path: '/shop?category=shoes', icon: '👟' },
    { name: 'Toys & Games', path: '/shop?category=toys', icon: '🧸' },
    { name: 'Accessories', path: '/shop?category=accessories', icon: '🎒' },
    { name: 'Party Wear', path: '/shop?subCategory=party-wear', icon: '👑', highlight: true },
    { name: 'Sale & Offers', path: '/shop?sort=discount', icon: '🔥', sale: true }
  ];

  const agePills = [
    { label: '0-24 Months', value: '0-24M' },
    { label: '2-4 Years', value: '2-4Y' },
    { label: '4-8 Years', value: '4-8Y' },
    { label: '8-12 Years', value: '8-12Y' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-100">
      {/* Top VIP & Promo Announcement Banner */}
      <div className="bg-gradient-to-r from-brand-pink via-brand-purple to-brand-blue text-white px-4 py-1.5 text-xs font-bold text-center flex items-center justify-between overflow-hidden">
        <div className="hidden md:flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-yellow animate-spin" style={{ animationDuration: '6s' }} />
          <span>100% Kid-Safe & Organic Fabrics</span>
        </div>

        <div className="mx-auto flex items-center gap-3">
          <span className="bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase border border-white/30">
            VIP OFFER
          </span>
          <Link to="/vip-club" className="underline decoration-yellow-300 font-extrabold hover:text-yellow-200 transition">
            Join VIP Club for ₹1,000/yr: Get Flat Extra 15% OFF + Free Shipping
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-[11px] bg-black/20 px-2 py-0.5 rounded-md font-mono">
            CODE: <span className="text-yellow-300 font-bold">WELCOME10</span>
          </span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Logo size="md" />
          </div>

          {/* Quick Age Selectors */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Age:</span>
            {agePills.map((age) => (
              <button
                key={age.value}
                onClick={() => navigate(`/shop?ageGroup=${age.value}`)}
                className="px-2.5 py-1 text-xs font-bold rounded-xl text-slate-600 hover:text-brand-pink hover:bg-white transition shadow-sm"
              >
                {age.label}
              </button>
            ))}
          </div>

          {/* Search Bar with Live Suggestions */}
          <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search frock, tuxedos, shoes, toys, dino bags..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-pink focus:bg-white transition"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Live Search Popup */}
            {isSearching && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fadeIn">
                <div className="p-2 border-b border-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                  Matching Products
                </div>
                <div className="divide-y divide-slate-50">
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      to={`/product/${item.id}`}
                      onClick={() => setIsSearching(false)}
                      className="flex items-center gap-3 p-2.5 hover:bg-brand-cream/60 transition"
                    >
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded-xl border border-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-400 capitalize">{item.category} • {item.ageGroup}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-brand-pink">
                          ₹{item.discountPrice || item.price}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="p-2 bg-slate-50 text-center">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-bold text-brand-pink hover:underline"
                  >
                    View all matching results →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* VIP Club Membership Badge Link */}
            <Link
              to="/vip-club"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition border shadow-sm ${
                isVip
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 border-amber-300 shadow-amber-200'
                  : 'bg-brand-cream text-brand-purple border-brand-purple/20 hover:bg-brand-purple hover:text-white'
              }`}
            >
              <Crown className={`w-4 h-4 ${isVip ? 'text-slate-900 fill-slate-900' : 'text-brand-purple'}`} />
              <span>{isVip ? 'VIP ACTIVE' : 'VIP CLUB'}</span>
            </Link>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-2xl text-slate-600 hover:text-brand-pink hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-pink text-white text-[10px] font-black flex items-center justify-center shadow-md animate-bounce">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-2xl bg-brand-pink text-white hover:bg-brand-coral transition shadow-md shadow-brand-pink/25 flex items-center gap-2"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden md:inline font-bold text-xs">Cart</span>
              {totalItemsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-brand-pink text-[11px] font-black flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            <div ref={userMenuRef} className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-pink to-brand-blue text-white text-xs font-black flex items-center justify-center">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold text-slate-700 max-w-[80px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-slate-50">
                        <p className="text-xs font-bold text-slate-800">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        {isVip && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            <Crown className="w-3 h-3 fill-amber-700" /> VIP Member (15% OFF)
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <User className="w-4 h-4 text-slate-400" /> My Profile
                        </Link>
                        <Link
                          to="/profile?tab=orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Package className="w-4 h-4 text-slate-400" /> My Orders & Tracking
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Heart className="w-4 h-4 text-slate-400" /> My Wishlist
                        </Link>
                        <Link
                          to="/vip-club"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50"
                        >
                          <Crown className="w-4 h-4 text-amber-500" /> VIP Club Dashboard
                        </Link>

                      </div>

                      <div className="pt-1 border-t border-slate-50">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  <User className="w-4 h-4" />
                  <span>Login / Register</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Category Navigation Bar */}
      <nav className="bg-white border-t border-slate-100 hidden lg:block overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-between gap-1 py-1.5">
            {categories.map((cat) => (
              <li key={cat.name}>
                <Link
                  to={cat.path}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    cat.sale
                      ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 font-black animate-pulse'
                      : cat.highlight
                      ? 'text-brand-purple bg-brand-purple/10 hover:bg-brand-purple hover:text-white'
                      : 'text-slate-600 hover:text-brand-pink hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-4/5 max-w-sm h-full overflow-y-auto p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <Logo size="sm" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="my-4">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search kids fashion..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </form>
              </div>

              {/* Categories */}
              <div className="space-y-1 py-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Shop Categories</p>
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    to={cat.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-brand-cream"
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>

              {/* VIP Link */}
              <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 shadow-md">
                <div className="flex items-center gap-2 font-black text-xs">
                  <Crown className="w-4 h-4" /> Yuva Attire VIP Club
                </div>
                <p className="text-[11px] font-semibold mt-1">Get flat 15% OFF on every order for ₹1,000/yr.</p>
                <Link
                  to="/vip-club"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mt-2 block text-center py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                  Join VIP Club
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
