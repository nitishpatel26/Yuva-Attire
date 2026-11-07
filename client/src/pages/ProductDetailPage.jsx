import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, Heart, ShoppingBag, Crown, ShieldCheck, Truck, 
  RefreshCcw, Sparkles, Check, ChevronRight, HelpCircle, Share2, 
  ArrowRight, MessageSquare, ThumbsUp, Send, User, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/common/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user, isVip, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pincode, setPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Review Form States
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState(user?.name || '');
  const [reviewEmail, setReviewEmail] = useState(user?.email || '');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.product) {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);
          setReviewsList(data.reviews || []);
          setSelectedSize(data.product.sizes?.[0]?.size || 'Standard');
          setSelectedColor(data.product.colors?.[0] || 'Default');
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      if (!reviewAuthor) setReviewAuthor(user.name);
      if (!reviewEmail) setReviewEmail(user.email);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-500 mt-4">Loading Kids Fashion Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <Link to="/shop" className="mt-4 inline-block text-xs font-bold text-brand-pink underline">
          Back to Store Catalog
        </Link>
      </div>
    );
  }

  const currentSizeObj = product.sizes?.find((s) => s.size === selectedSize);
  const originalPrice = currentSizeObj?.price || product.price;
  const price = currentSizeObj?.discountPrice || currentSizeObj?.price || product.discountPrice || product.price;
  const discountPercentage = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : (product.discountPercentage || 0);
  const vipPrice = Math.round(price * 0.85);
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (product.isSoldOut || product.totalStock <= 0) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const handleBuyNow = () => {
    if (product.isSoldOut || product.totalStock <= 0) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/checkout');
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeMessage('🚚 Standard Delivery by 2-3 Business Days | Express Available for VIP Members');
    } else {
      setPincodeMessage('Please enter a valid 6-digit postal code');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSuccessMsg('');
    setReviewErrorMsg('');

    if (!reviewComment.trim()) {
      return setReviewErrorMsg('Please write a short review or comment');
    }

    setReviewSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('yuva_token')
            ? { Authorization: `Bearer ${localStorage.getItem('yuva_token')}` }
            : {})
        },
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          userName: reviewAuthor || 'Verified Parent',
          userEmail: reviewEmail || 'parent@example.com'
        })
      });

      const data = await res.json();
      setReviewSubmitting(false);

      if (data.success && data.review) {
        setReviewSuccessMsg('✨ Thank you! Your review has been submitted.');
        setReviewsList((prev) => [data.review, ...prev]);
        setProduct((prev) => ({
          ...prev,
          rating: data.updatedRating || prev.rating,
          reviewsCount: data.updatedReviewsCount || (prev.reviewsCount + 1)
        }));
        setReviewComment('');
        setReviewTitle('');
        setTimeout(() => setIsWritingReview(false), 2000);
      } else {
        setReviewErrorMsg(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewSubmitting(false);
      setReviewErrorMsg(err.message || 'Review submission error');
    }
  };

  // Dynamic Ratings Calculation from approved reviews list
  const hasReviews = reviewsList.length > 0;
  const totalReviewsCount = reviewsList.length;
  const averageRating = hasReviews
    ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : null;
  const rating5Count = reviewsList.filter((r) => r.rating === 5).length;
  const rating4Count = reviewsList.filter((r) => r.rating === 4).length;
  const rating3Count = reviewsList.filter((r) => r.rating === 3).length;
  const rating2Count = reviewsList.filter((r) => r.rating === 2).length;
  const rating1Count = reviewsList.filter((r) => r.rating === 1).length;
  const pct5 = hasReviews ? Math.round((rating5Count / totalReviewsCount) * 100) : 0;
  const pct4 = hasReviews ? Math.round((rating4Count / totalReviewsCount) * 100) : 0;
  const pct3 = hasReviews ? Math.round((rating3Count / totalReviewsCount) * 100) : 0;
  const pct2 = hasReviews ? Math.round((rating2Count / totalReviewsCount) * 100) : 0;
  const pct1 = hasReviews ? Math.round((rating1Count / totalReviewsCount) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-bold text-slate-400">
        <Link to="/" className="hover:text-slate-800">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?category=${product.category}`} className="hover:text-slate-800 capitalize">{product.category}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm relative">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover object-top"
            />
            {product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-brand-pink text-white text-xs font-black uppercase tracking-wider shadow-md">
                {product.discountPercentage}% OFF
              </span>
            )}
            {product.isSoldOut || product.totalStock === 0 ? (
              <span className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider shadow-md">
                SOLD OUT
              </span>
            ) : null}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition ${
                    activeImageIndex === idx ? 'border-brand-pink shadow-md' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Buy Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              <span className="text-brand-pink">{product.gender}</span> • <span>{product.category}</span> • <span>Age: {product.ageGroup}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">SKU: {product.sku}</p>

            {/* Rating */}
            {hasReviews ? (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-xs font-bold text-slate-800">{averageRating}</span>
                <span className="text-xs text-slate-400">({totalReviewsCount} verified parent {totalReviewsCount === 1 ? 'review' : 'reviews'})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
                <Star className="w-4 h-4 text-slate-300" />
                <span>No reviews yet</span>
              </div>
            )}
          </div>

          {/* Price Card with VIP Discount */}
          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {originalPrice > price && (
                <span className="text-base text-slate-400 line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discountPercentage > 0 && (
                <span className="px-2.5 py-0.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-black">
                  Save {discountPercentage}%
                </span>
              )}
            </div>

            {/* VIP Club Special Price Box */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-900 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 font-black text-xs">
                <Crown className="w-4 h-4 fill-slate-900" />
                <span>VIP Club Member Price:</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black">₹{vipPrice.toLocaleString('en-IN')}</span>
                <span className="text-[10px] font-bold block text-slate-800">(Extra 15% OFF)</span>
              </div>
            </div>
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Select Kids Size / Age: <span className="text-brand-pink">{selectedSize}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowSizeChart(true)}
                  className="text-xs font-bold text-brand-pink hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Size Chart Guide
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((s) => {
                  const sizePrice = s.discountPrice || s.price;
                  return (
                    <button
                      key={s.size}
                      disabled={s.stock === 0}
                      onClick={() => setSelectedSize(s.size)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition flex flex-col items-center gap-0.5 ${
                        selectedSize === s.size
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : s.stock === 0
                          ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{s.size}</span>
                        {sizePrice && sizePrice !== (product.discountPrice || product.price) && (
                          <span className={`text-[11px] font-black ${selectedSize === s.size ? 'text-amber-300' : 'text-brand-pink'}`}>
                            • ₹{sizePrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      {s.stock > 0 && s.stock <= 4 && (
                        <span className="text-[10px] text-amber-400 font-normal">
                          Only {s.stock} left
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">
                Color: <span className="text-slate-600">{selectedColor}</span>
              </label>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                      selectedColor === c
                        ? 'bg-brand-pink text-white border-brand-pink shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <button
                disabled={product.isSoldOut || product.totalStock === 0}
                onClick={handleAddToCart}
                className={`flex-1 py-4 px-6 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                  product.isSoldOut || product.totalStock === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : isAdded
                    ? 'bg-emerald-500 text-white'
                    : 'bg-brand-pink hover:bg-brand-coral text-white shadow-brand-pink/25'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" /> Added to Shopping Bag
                  </>
                ) : product.isSoldOut || product.totalStock === 0 ? (
                  'Currently Sold Out'
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> Add to Shopping Bag
                  </>
                )}
              </button>

              <button
                disabled={product.isSoldOut || product.totalStock === 0}
                onClick={handleBuyNow}
                className="py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm transition shadow-md"
              >
                Direct Buy
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-4 rounded-2xl border transition ${
                  wishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Shortlist / Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-pink" />
              <span>Check Doorstep Delivery Estimate</span>
            </label>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit Pincode"
                className="w-48 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-pink"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition"
              >
                Check
              </button>
            </form>
            {pincodeMessage && <p className="text-xs font-semibold text-emerald-600">{pincodeMessage}</p>}
          </div>

          {/* Product Specifications & Fabric Info */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Product Highlights</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-2xl bg-brand-cream/60">
                <span className="font-bold text-slate-800 block">Fabric & Material</span>
                <span className="text-slate-500">{product.fabric || '100% Breathable Soft Cotton'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-brand-cream/60">
                <span className="font-bold text-slate-800 block">Wash Care</span>
                <span className="text-slate-500">{product.careInstructions || 'Gentle hand wash in cold water'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER REVIEWS & RATINGS SECTION */}
      <section className="pt-12 border-t border-slate-100 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-brand-pink uppercase tracking-wider">Parent Feedback</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Customer Reviews & Ratings</h2>
          </div>

          <button
            onClick={() => setIsWritingReview(!isWritingReview)}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm w-max"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isWritingReview ? 'Cancel Review' : 'Write a Parent Review'}</span>
          </button>
        </div>

        {/* Write Review Form Card */}
        {isWritingReview && (
          <div className="p-6 sm:p-8 rounded-3xl bg-brand-cream/40 border border-brand-pink/20 shadow-sm space-y-4 animate-fadeIn">
            <h3 className="text-sm font-black text-slate-800">Share Your Experience with this Outfit / Toy</h3>
            <p className="text-xs text-slate-500">Help other parents choose the perfect fit and comfort for their children.</p>

            {reviewSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{reviewSuccessMsg}</span>
              </div>
            )}

            {reviewErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{reviewErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              {/* Star Rating Picker */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Your Rating *</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-slate-300 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoverRating || reviewRating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-black text-slate-800 text-sm">{reviewRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline / Review Title</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Excellent fabric! Looked stunning at birthday party"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-brand-pink"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Review & Fit Feedback *</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell other parents about fabric softness, stitching, true-to-size fit, comfort..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-brand-pink"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="e.g. Ananya Deshmukh"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email (Private)</label>
                  <input
                    type="email"
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="py-3 px-6 rounded-2xl bg-brand-pink hover:bg-brand-coral text-white font-black text-xs shadow-md shadow-brand-pink/20 transition flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{reviewSubmitting ? 'Submitting...' : 'Post Customer Review'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Ratings Breakdown Summary Card */}
        {hasReviews ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm">
            {/* Average Box */}
            <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-100 text-center">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 font-display">
                {averageRating}
              </span>
              <div className="flex items-center text-amber-400 my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(Number(averageRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 font-bold">
                Based on {totalReviewsCount} verified {totalReviewsCount === 1 ? 'rating' : 'ratings'}
              </p>
            </div>

            {/* Rating Bars */}
            <div className="md:col-span-2 space-y-2 flex flex-col justify-center text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-600 w-12">5 Star</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct5}%` }}></div>
                </div>
                <span className="font-bold text-slate-400 w-8">{pct5}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-600 w-12">4 Star</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct4}%` }}></div>
                </div>
                <span className="font-bold text-slate-400 w-8">{pct4}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-600 w-12">3 Star</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct3}%` }}></div>
                </div>
                <span className="font-bold text-slate-400 w-8">{pct3}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-600 w-12">2 Star</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct2}%` }}></div>
                </div>
                <span className="font-bold text-slate-400 w-8">{pct2}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-600 w-12">1 Star</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct1}%` }}></div>
                </div>
                <span className="font-bold text-slate-400 w-8">{pct1}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 text-amber-400 flex items-center justify-center">
              <Star className="w-6 h-6 stroke-1 fill-amber-100" />
            </div>
            <p className="text-sm font-bold text-slate-700">No reviews available currently</p>
            <p className="text-xs text-slate-400">Be the first parent to review this product!</p>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsList.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 text-xs text-slate-400">
              No reviews available currently. Be the first parent to review this product!
            </div>
          ) : (
            reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-pink to-brand-blue text-white font-black text-xs flex items-center justify-center">
                      {rev.userName?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{rev.userName}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-0.5">
                            <Check className="w-3 h-3 text-emerald-600" /> Verified Parent
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.title && (
                  <h4 className="text-xs font-black text-slate-800">{rev.title}</h4>
                )}

                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>

                <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                  <button className="flex items-center gap-1 hover:text-slate-600 transition">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful review</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-slate-100">
          <div className="mb-6">
            <span className="text-xs font-black text-brand-pink uppercase tracking-wider">You May Also Like</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Matching Kids Attire & Accessories</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setShowSizeChart(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              ✕
            </button>
            <h3 className="text-base font-black text-slate-800 mb-1">Yuva Attire Kids Size Guide</h3>
            <p className="text-xs text-slate-400 mb-4">Standard measurements for comfortable fit</p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-2.5 rounded-l-xl">Age Group</th>
                    <th className="p-2.5">Chest (Inches)</th>
                    <th className="p-2.5">Height (cm)</th>
                    <th className="p-2.5 rounded-r-xl">Weight (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  <tr><td className="p-2.5">0-6 Months</td><td className="p-2.5">17 - 18"</td><td className="p-2.5">62 - 68 cm</td><td className="p-2.5">5 - 7 kg</td></tr>
                  <tr><td className="p-2.5">6-12 Months</td><td className="p-2.5">18 - 19"</td><td className="p-2.5">68 - 80 cm</td><td className="p-2.5">7 - 10 kg</td></tr>
                  <tr><td className="p-2.5">1-2 Years</td><td className="p-2.5">19 - 20"</td><td className="p-2.5">80 - 92 cm</td><td className="p-2.5">10 - 12 kg</td></tr>
                  <tr><td className="p-2.5">2-4 Years</td><td className="p-2.5">21 - 22"</td><td className="p-2.5">92 - 104 cm</td><td className="p-2.5">12 - 16 kg</td></tr>
                  <tr><td className="p-2.5">4-6 Years</td><td className="p-2.5">23 - 24"</td><td className="p-2.5">104 - 116 cm</td><td className="p-2.5">16 - 20 kg</td></tr>
                  <tr><td className="p-2.5">6-8 Years</td><td className="p-2.5">25 - 26"</td><td className="p-2.5">116 - 128 cm</td><td className="p-2.5">20 - 25 kg</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
