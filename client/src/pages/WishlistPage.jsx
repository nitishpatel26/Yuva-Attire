import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistPage() {
  const { wishlistProducts, wishlistCount, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleMoveToCart = (product) => {
    addToCart(product, product.sizes?.[0]?.size || 'Standard', product.colors?.[0] || 'Default', 1);
    toggleWishlist(product);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Shortlisted Wishlist</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved for your little stars
          </p>
        </div>

        {wishlistCount > 0 && (
          <Link
            to="/shop"
            className="text-xs font-bold text-brand-pink hover:underline hidden sm:inline-flex items-center gap-1"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="aspect-[4/5] rounded-3xl bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : wishlistProducts.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Your wishlist is currently empty</h3>
          <p className="text-xs text-slate-400">
            Tap the heart icon on any kids frock, tuxedo, footwear or toy to shortlist and track them here!
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-4 px-6 py-3 rounded-2xl bg-brand-pink text-white font-bold text-xs shadow-md shadow-brand-pink/25 hover:bg-brand-coral transition"
          >
            Explore Kids Collections
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition flex flex-col"
            >
              <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
                <Link to={`/product/${product.id}`} className="block w-full h-full">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white transition shadow-md"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {product.gender} • {product.category}
                  </span>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-1 hover:text-brand-pink">
                      {product.title}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-black text-slate-900">
                      ₹{(product.discountPrice || product.price).toLocaleString('en-IN')}
                    </span>
                    {product.discountPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleMoveToCart(product)}
                  className="mt-4 w-full py-2.5 px-3 rounded-2xl bg-brand-pink text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-coral transition shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" /> Move to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
