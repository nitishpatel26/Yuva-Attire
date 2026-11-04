import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, Crown, ShieldCheck, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function QuickViewModal({ product, onClose }) {
  if (!product) return null;

  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || 'Standard');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Default');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const price = product.discountPrice || product.price;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images */}
          <div className="p-6 bg-slate-50 flex flex-col items-center justify-center">
            <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-sm bg-white mb-3">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover object-top"
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                      activeImageIndex === i ? 'border-brand-pink' : 'border-slate-200 opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                <span>{product.gender}</span> • <span>{product.category}</span> • <span className="text-brand-pink">{product.ageGroup}</span>
              </div>

              <h2 className="text-lg font-black text-slate-900 leading-snug">{product.title}</h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-xs font-bold text-slate-800">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviewsCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 my-4">
                <span className="text-2xl font-black text-slate-900">₹{price.toLocaleString('en-IN')}</span>
                {product.discountPrice && (
                  <span className="text-sm text-slate-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 text-xs font-black">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* VIP Club Price */}
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200/80 mb-4 flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-600 fill-amber-600" />
                  <span>VIP Members Pay:</span>
                </span>
                <span className="font-black text-amber-800 text-sm">₹{Math.round(price * 0.85).toLocaleString('en-IN')}</span>
              </div>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Select Size (Age):</label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s.size}
                        onClick={() => setSelectedSize(s.size)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          selectedSize === s.size
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {s.size} {s.stock <= 3 && s.stock > 0 && <span className="text-[10px] text-amber-400 font-normal">({s.stock} left)</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Snippet */}
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                {product.description}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.isSoldOut || product.totalStock === 0}
                  className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                    isAdded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-brand-pink hover:bg-brand-coral text-white shadow-brand-pink/25'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Bag
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-2xl border transition ${
                    wishlisted
                      ? 'bg-rose-50 border-rose-200 text-rose-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>100% Genuine Kids Apparel • 7-Day Easy Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
