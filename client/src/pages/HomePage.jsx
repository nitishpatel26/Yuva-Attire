import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Crown, ArrowRight, ShieldCheck, Star, Heart, 
  ShoppingBag, Flame, Tag, Gift, Truck, RefreshCcw, Smile 
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import QuickViewModal from '../components/common/QuickViewModal';

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'boys' | 'girls' | 'infants' | 'toys'
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFeaturedProducts(data.products.filter((p) => p.isFeatured || p.isBestSeller));
          setNewArrivals(data.products.filter((p) => p.isNewArrival));
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = activeTab === 'all'
    ? featuredProducts
    : featuredProducts.filter((p) => p.gender === activeTab || p.category === activeTab);

  const heroBanners = [
    {
      title: 'Festive & Celebration Kids Trends!',
      subtitle: 'Playful twirl frocks, dapper suits & festive ethnic sets for your tiny trendsetters.',
      cta: 'Explore Girls & Boys Wear',
      link: '/shop?category=clothing',
      badge: 'FLAT UPTO 40% OFF',
      gradient: 'from-brand-pink via-brand-coral to-brand-yellow',
      image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const ageCategories = [
    { age: '0 - 24 Months', label: 'Infants & Toddlers', value: '0-24M', icon: '👶', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    { age: '2 - 4 Years', label: 'Playgroup & Nursery', value: '2-4Y', icon: '👧', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    { age: '4 - 8 Years', label: 'Little Explorers', value: '4-8Y', icon: '👦', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    { age: '8 - 12 Years', label: 'Big Kids & Juniors', value: '8-12Y', icon: '🌟', bg: 'bg-purple-50 text-purple-700 border-purple-200' }
  ];

  const categoryHighlights = [
    {
      title: 'Princess Frocks & Gowns',
      desc: 'Layered tulle, sequins & satin bows',
      image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80',
      link: '/shop?category=clothing&subCategory=dresses',
      badge: 'Bestseller'
    },
    {
      title: 'Dapper Tuxedos & Blazers',
      desc: '3-Piece party suits & chinos',
      image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80',
      link: '/shop?category=clothing&gender=boys',
      badge: 'Party Ready'
    },
    {
      title: 'Light-Up & Party Footwear',
      desc: 'LED sneakers & glitter ballerina bellies',
      image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80',
      link: '/shop?category=shoes',
      badge: 'Fun Picks'
    },
    {
      title: 'Montessori & Action Toys',
      desc: 'Sensory wooden cubes & stunt cars',
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
      link: '/shop?category=toys',
      badge: 'Brain Boosters'
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-pink via-brand-purple to-brand-blue text-white shadow-2xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-yellow-300 text-xs font-black uppercase tracking-wider border border-white/30">
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Premium Kids Fashion</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Dress Your Little Stars in Joyful & Cheerful Styles!
            </h1>

            <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed">
              Explore 100% skin-safe organic fabrics, dazzling birthday frocks, dapper suits, LED sneakers, and smart wooden toys.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/shop"
                className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-black text-xs hover:bg-yellow-300 transition shadow-lg flex items-center gap-2"
              >
                <span>Shop All Kids Fashion</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/vip-club"
                className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs transition shadow-lg flex items-center gap-2"
              >
                <Crown className="w-4 h-4 fill-slate-900" />
                <span>Join VIP Club (Extra 15% OFF)</span>
              </Link>
            </div>
          </div>

          <div className="relative w-full lg:w-1/2 flex items-center justify-center">
            <div className="relative w-72 sm:w-80 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 rotate-2 hover:rotate-0 transition duration-500">
              <img
                src="https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80"
                alt="Kids Fashion"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-white/90 backdrop-blur-md text-slate-900 shadow-md">
                <p className="text-xs font-black">Twirl Frocks & Birthday Suits</p>
                <p className="text-[11px] text-brand-pink font-bold">Starting from ₹899</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Age Group Explorer Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-black text-brand-pink uppercase tracking-wider">Fast Age Filters</span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Shop by Age for Perfect Fit</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ageCategories.map((item) => (
            <button
              key={item.value}
              onClick={() => navigate(`/shop?ageGroup=${item.value}`)}
              className={`p-5 rounded-3xl border text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${item.bg}`}
            >
              <span className="text-3xl">{item.icon}</span>
              <h3 className="text-base font-black mt-3">{item.age}</h3>
              <p className="text-xs opacity-80 font-semibold">{item.label}</p>
            </button>
          ))}
        </div>
      </section>

      {/* VIP Club Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-900 shadow-xl border border-amber-300 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 fill-amber-300" />
              <span>YUVA ATTIRE VIP CLUB</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pay ₹1,000 & Get Extra 15% OFF On Every Order for 1 Full Year!
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 max-w-xl">
              Includes Free Express Shipping with No Minimum Order Value, Early 24-hr Sale Access, and a ₹500 Birthday Gift Voucher.
            </p>
          </div>

          <Link
            to="/vip-club"
            className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-lg shrink-0 flex items-center gap-2 transition"
          >
            <span>Subscribe VIP for ₹1,000</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black text-brand-pink uppercase tracking-wider">Trending Curations</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Trending Kids Collections</h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-brand-pink hover:underline hidden sm:inline-flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryHighlights.map((cat) => (
            <Link
              key={cat.title}
              to={cat.link}
              className="group relative rounded-3xl overflow-hidden bg-slate-100 aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/60"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider w-max mb-2">
                  {cat.badge}
                </span>
                <h3 className="text-base font-black leading-snug">{cat.title}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured & Bestsellers Catalog Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-black text-brand-pink uppercase tracking-wider">Top Rated By Parents</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Best Selling Picks & Twirlers</h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'girls', label: 'Girls' },
              { id: 'boys', label: 'Boys' },
              { id: 'infants', label: 'Infants' },
              { id: 'toys', label: 'Toys' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-brand-pink shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[4/5] rounded-3xl bg-slate-100 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-brand-pink text-white font-black text-xs shadow-lg transition"
          >
            <span>Explore Entire Store Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
