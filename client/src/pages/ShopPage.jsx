import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ArrowUpDown, Search, Filter, Sparkles, Check, Loader2, ArrowDown } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import QuickViewModal from '../components/common/QuickViewModal';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const observerTarget = useRef(null);

  const PAGE_LIMIT = 8;

  // Filter States initialized from URL params
  const categoryParam = searchParams.get('category') || 'all';
  const subCategoryParam = searchParams.get('subCategory') || 'all';
  const genderParam = searchParams.get('gender') || 'all';
  const ageGroupParam = searchParams.get('ageGroup') || 'all';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'popular';
  const inStockParam = searchParams.get('inStockOnly') === 'true';

  const [category, setCategory] = useState(categoryParam);
  const [subCategory, setSubCategory] = useState(subCategoryParam);
  const [gender, setGender] = useState(genderParam);
  const [ageGroup, setAgeGroup] = useState(ageGroupParam);
  const [search, setSearch] = useState(searchParam);
  const [sort, setSort] = useState(sortParam);
  const [inStockOnly, setInStockOnly] = useState(inStockParam);
  const [maxPrice, setMaxPrice] = useState(5000);

  // Sync state when URL params change
  useEffect(() => {
    setCategory(searchParams.get('category') || 'all');
    setSubCategory(searchParams.get('subCategory') || 'all');
    setGender(searchParams.get('gender') || 'all');
    setAgeGroup(searchParams.get('ageGroup') || 'all');
    setSearch(searchParams.get('search') || '');
    setSort(searchParams.get('sort') || 'popular');
  }, [searchParams]);

  // Fetch products (Page 1 reset when filters change)
  useEffect(() => {
    setLoading(true);
    setPage(1);

    const query = new URLSearchParams();
    if (category !== 'all') query.set('category', category);
    if (subCategory !== 'all') query.set('subCategory', subCategory);
    if (gender !== 'all') query.set('gender', gender);
    if (ageGroup !== 'all') query.set('ageGroup', ageGroup);
    if (search) query.set('search', search);
    if (sort) query.set('sort', sort);
    if (inStockOnly) query.set('inStockOnly', 'true');
    if (maxPrice < 5000) query.set('maxPrice', maxPrice.toString());
    query.set('page', '1');
    query.set('limit', PAGE_LIMIT.toString());

    fetch(`/api/products?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products || []);
          setTotalCount(data.total || 0);
          setHasMore(data.hasMore !== undefined ? data.hasMore : (data.products?.length === PAGE_LIMIT));
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [category, subCategory, gender, ageGroup, search, sort, inStockOnly, maxPrice]);

  // Load next page function
  const loadMoreProducts = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    const query = new URLSearchParams();
    if (category !== 'all') query.set('category', category);
    if (subCategory !== 'all') query.set('subCategory', subCategory);
    if (gender !== 'all') query.set('gender', gender);
    if (ageGroup !== 'all') query.set('ageGroup', ageGroup);
    if (search) query.set('search', search);
    if (sort) query.set('sort', sort);
    if (inStockOnly) query.set('inStockOnly', 'true');
    if (maxPrice < 5000) query.set('maxPrice', maxPrice.toString());
    query.set('page', nextPage.toString());
    query.set('limit', PAGE_LIMIT.toString());

    fetch(`/api/products?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts((prev) => [...prev, ...(data.products || [])]);
          setPage(nextPage);
          setTotalCount(data.total || 0);
          setHasMore(data.hasMore !== undefined ? data.hasMore : (data.products?.length === PAGE_LIMIT));
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingMore(false));
  }, [category, subCategory, gender, ageGroup, search, sort, inStockOnly, maxPrice, page, loading, loadingMore, hasMore]);

  // Intersection Observer for Infinite Scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreProducts, hasMore, loading, loadingMore]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all' || !value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setCategory('all');
    setSubCategory('all');
    setGender('all');
    setAgeGroup('all');
    setSearch('');
    setSort('popular');
    setInStockOnly(false);
    setMaxPrice(5000);
    setSearchParams({});
  };

  const hasActiveFilters =
    category !== 'all' ||
    gender !== 'all' ||
    ageGroup !== 'all' ||
    subCategory !== 'all' ||
    search ||
    inStockOnly ||
    maxPrice < 5000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Sort Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Kids Fashion, Footwear & Toy Store
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing <span className="font-bold text-slate-800">{products.length}</span> of <span className="font-bold text-brand-pink">{totalCount}</span> items
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-800 text-xs font-bold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 pl-2">Sort By:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                updateParam('sort', e.target.value);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 pr-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="popular">Popular & Bestsellers</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Biggest Discount (%)</option>
              <option value="rating">Top Customer Rated</option>
              <option value="newest">Newest Drops</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filters Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 py-4">
          <span className="text-xs font-bold text-slate-400">Active Filters:</span>
          {category !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-pink/10 text-brand-pink text-xs font-bold">
              Category: {category}
              <button onClick={() => { setCategory('all'); updateParam('category', 'all'); }}>✕</button>
            </span>
          )}
          {gender !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-blue/10 text-brand-blue text-xs font-bold">
              Gender: {gender}
              <button onClick={() => { setGender('all'); updateParam('gender', 'all'); }}>✕</button>
            </span>
          )}
          {ageGroup !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-yellow/30 text-amber-900 text-xs font-bold">
              Age: {ageGroup}
              <button onClick={() => { setAgeGroup('all'); updateParam('ageGroup', 'all'); }}>✕</button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
              Search: "{search}"
              <button onClick={() => { setSearch(''); updateParam('search', ''); }}>✕</button>
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="text-xs font-bold text-rose-500 hover:underline ml-2"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Main Grid with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Categories</h3>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Collections' },
                  { id: 'clothing', label: 'Kids Clothing' },
                  { id: 'shoes', label: 'Footwear & Shoes' },
                  { id: 'toys', label: 'Toys & Games' },
                  { id: 'accessories', label: 'Bags & Accessories' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCategory(item.id);
                      updateParam('category', item.id);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      category === item.id
                        ? 'bg-brand-pink text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {category === item.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Filter */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Shop For</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'boys', label: '👦 Boys' },
                  { id: 'girls', label: '👧 Girls' },
                  { id: 'infants', label: '👶 Baby' }
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setGender(g.id);
                      updateParam('gender', g.id);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold text-center border transition ${
                      gender === g.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Group Filter */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Age Groups</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Ages' },
                  { id: '0-24M', label: '0-24M' },
                  { id: '2-4Y', label: '2-4Y' },
                  { id: '4-8Y', label: '4-8Y' },
                  { id: '8-12Y', label: '8-12Y' }
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setAgeGroup(a.id);
                      updateParam('ageGroup', a.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      ageGroup === a.id
                        ? 'bg-brand-pink text-white border-brand-pink shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Max Price</h3>
                <span className="text-xs font-black text-brand-pink">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min={500}
                max={5000}
                step={200}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-pink cursor-pointer"
              />
            </div>

            {/* In-Stock Toggle */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">In-Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-pink focus:ring-brand-pink accent-brand-pink"
              />
            </div>
          </div>
        </aside>

        {/* Products Grid & Infinite Scroll */}
        <main className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="aspect-[4/5] rounded-3xl bg-slate-100 animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <p className="text-4xl">🧸</p>
              <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try loosening your filters or search keywords to explore more kids clothing and toys.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-6 py-2.5 rounded-2xl bg-brand-pink text-white font-bold text-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={`${product.id}-${product.sku}`}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>

              {/* Infinite Scroll Trigger Observer Target */}
              <div ref={observerTarget} className="py-6 flex flex-col items-center justify-center">
                {loadingMore ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-pink bg-brand-pink/10 px-4 py-2.5 rounded-2xl animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading more kids collections...</span>
                  </div>
                ) : hasMore ? (
                  <button
                    onClick={loadMoreProducts}
                    className="px-6 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition"
                  >
                    <ArrowDown className="w-4 h-4 text-brand-pink" />
                    <span>Scroll down or click to load more</span>
                  </button>
                ) : products.length > 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 text-xs font-semibold text-center w-full">
                    ✨ You've explored all {totalCount} items in this collection!
                  </div>
                ) : null}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-4/5 max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800">Filter Products</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">Category</h4>
              <div className="space-y-1">
                {['all', 'clothing', 'shoes', 'toys', 'accessories'].map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCategory(c); updateParam('category', c); }}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold capitalize ${
                      category === c ? 'bg-brand-pink text-white' : 'text-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
