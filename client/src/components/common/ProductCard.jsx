import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Eye, Crown, Sparkles, Check } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({ product, onQuickView }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isVip } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || 'Standard');

  const wishlisted = isWishlisted(product.id);
  const price = product.discountPrice || product.price;
  const vipPrice = Math.round(price * 0.85); // 15% off for VIPs

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.isSoldOut || product.totalStock <= 0) return;

    setIsAdding(true);
    addToCart(product, selectedSize, product.colors?.[0] || 'Default', 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm hover:shadow-xl hover:border-brand-pink/20 transition-all duration-300 flex flex-col">
      {/* Image Container with Badges */}
      <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.discountPercentage > 0 && (
            <span className="px-2.5 py-1 rounded-xl bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 rounded-lg bg-brand-blue text-white text-[9px] font-extrabold uppercase tracking-wider">
              NEW DROP
            </span>
          )}
          {product.isSoldOut || product.totalStock === 0 ? (
            <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              SOLD OUT
            </span>
          ) : product.totalStock <= 5 ? (
            <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wider">
              ONLY {product.totalStock} LEFT
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition shadow-md backdrop-blur-md ${
            wishlisted
              ? 'bg-rose-500 text-white fill-white'
              : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
          }`}
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Button (Desktop Hover) */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-2xl bg-white/95 text-slate-800 text-xs font-bold shadow-lg flex items-center gap-1.5 hover:bg-white hover:text-brand-pink"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Age Group Tag */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
            <span className="capitalize">{product.gender} • {product.category}</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px]">
              {product.ageGroup}
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 hover:text-brand-pink transition leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-700">{product.rating || '4.8'}</span>
            <span className="text-[11px] text-slate-400">({product.reviewsCount || 42})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="mt-3 pt-3 border-t border-slate-50">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-base font-black text-slate-900">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* VIP Price Highlight */}
          <div className="mb-3 px-2 py-1 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-between text-[10px] font-bold text-amber-900">
            <span className="flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-600 fill-amber-600" />
              <span>VIP Club Price:</span>
            </span>
            <span className="font-black text-amber-700">₹{vipPrice.toLocaleString('en-IN')}</span>
          </div>

          {/* Add to Cart Button */}
          <button
            disabled={product.isSoldOut || product.totalStock === 0}
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm ${
              product.isSoldOut || product.totalStock === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isAdding
                ? 'bg-emerald-500 text-white'
                : 'bg-brand-pink/10 hover:bg-brand-pink text-brand-pink hover:text-white'
            }`}
          >
            {isAdding ? (
              <>
                <Check className="w-4 h-4" /> Added to Bag
              </>
            ) : product.isSoldOut || product.totalStock === 0 ? (
              'Sold Out'
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add to Bag
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
