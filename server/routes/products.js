const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAdmin, optionalAuth } = require('../middleware/auth');

// Get all products with rich filtering, search, sorting & pagination for Infinite Scroll
router.get('/', (req, res) => {
  // Aggregate real approved reviews by productId
  const allApprovedReviews = db.find('reviews', (r) => r.status === 'APPROVED' || !r.status);
  const reviewsCountMap = {};
  const reviewsSumMap = {};
  allApprovedReviews.forEach((r) => {
    reviewsCountMap[r.productId] = (reviewsCountMap[r.productId] || 0) + 1;
    reviewsSumMap[r.productId] = (reviewsSumMap[r.productId] || 0) + (Number(r.rating) || 0);
  });

  let products = db.find('products').map((p) => {
    const count = reviewsCountMap[p.id] || 0;
    const avg = count > 0 ? Number((reviewsSumMap[p.id] / count).toFixed(1)) : null;
    return {
      ...p,
      reviewsCount: count,
      rating: avg
    };
  });

  const {
    category,
    subCategory,
    gender,
    ageGroup,
    search,
    sort,
    minPrice,
    maxPrice,
    inStockOnly,
    isNewArrival,
    isBestSeller,
    isFeatured,
    tag,
    page,
    limit
  } = req.query;

  // Filter by category
  if (category && category !== 'all') {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by subCategory
  if (subCategory && subCategory !== 'all') {
    products = products.filter((p) => p.subCategory?.toLowerCase() === subCategory.toLowerCase());
  }

  // Filter by gender
  if (gender && gender !== 'all') {
    products = products.filter(
      (p) => p.gender.toLowerCase() === gender.toLowerCase() || p.gender.toLowerCase() === 'unisex'
    );
  }

  // Filter by ageGroup
  if (ageGroup && ageGroup !== 'all') {
    products = products.filter((p) => p.ageGroup === ageGroup);
  }

  // Filter by search query
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q)
    );
  }

  // Price range filter
  if (minPrice) {
    products = products.filter((p) => (p.discountPrice || p.price) >= Number(minPrice));
  }
  if (maxPrice) {
    products = products.filter((p) => (p.discountPrice || p.price) <= Number(maxPrice));
  }

  // Stock filter
  if (inStockOnly === 'true') {
    products = products.filter((p) => !p.isSoldOut && p.totalStock > 0);
  }

  // Badges filter
  if (isNewArrival === 'true') {
    products = products.filter((p) => p.isNewArrival);
  }
  if (isBestSeller === 'true') {
    products = products.filter((p) => p.isBestSeller);
  }
  if (isFeatured === 'true') {
    products = products.filter((p) => p.isFeatured);
  }

  // Tag filter
  if (tag) {
    products = products.filter((p) => p.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()));
  }

  // Sorting
  if (sort === 'price_asc') {
    products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sort === 'price_desc') {
    products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'discount') {
    products.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
  } else if (sort === 'newest') {
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    // Default: Popular / Best sellers first
    products.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
  }

  const total = products.length;

  // Pagination for Infinite Scrolling
  if (page && limit) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const pagedProducts = products.slice(startIndex, endIndex);

    return res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore: endIndex < total,
      products: pagedProducts
    });
  }

  res.json({
    success: true,
    total,
    products
  });
});

// Meta information for filters and categories
router.get('/meta/categories', (req, res) => {
  const allProducts = db.find('products');

  const categoryCounts = {
    all: allProducts.length,
    clothing: allProducts.filter((p) => p.category === 'clothing').length,
    shoes: allProducts.filter((p) => p.category === 'shoes').length,
    toys: allProducts.filter((p) => p.category === 'toys').length,
    accessories: allProducts.filter((p) => p.category === 'accessories').length
  };

  const genderCounts = {
    boys: allProducts.filter((p) => p.gender === 'boys').length,
    girls: allProducts.filter((p) => p.gender === 'girls').length,
    infants: allProducts.filter((p) => p.gender === 'infants').length,
    unisex: allProducts.filter((p) => p.gender === 'unisex').length
  };

  const ageGroups = ['0-24M', '2-4Y', '4-8Y', '8-12Y', '12-16Y'];

  res.json({
    success: true,
    categoryCounts,
    genderCounts,
    ageGroups
  });
});

// Get single product by ID with approved reviews & related items
router.get('/:id', (req, res) => {
  const rawProduct = db.findById('products', req.params.id);
  if (!rawProduct) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Fetch approved reviews for this product
  const reviews = db.find(
    'reviews',
    (r) => r.productId === rawProduct.id && (r.status === 'APPROVED' || !r.status)
  );

  reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? Number((reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / totalReviews).toFixed(1))
    : null;

  const product = {
    ...rawProduct,
    reviewsCount: totalReviews,
    rating: avgRating
  };

  // Fetch related products in same category/gender with dynamic reviews
  const relatedProducts = db
    .find(
      'products',
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.gender === product.gender)
    )
    .slice(0, 4)
    .map((p) => {
      const relReviews = db.find('reviews', (r) => r.productId === p.id && (r.status === 'APPROVED' || !r.status));
      const relCount = relReviews.length;
      return {
        ...p,
        reviewsCount: relCount,
        rating: relCount > 0 ? Number((relReviews.reduce((sum, r) => sum + r.rating, 0) / relCount).toFixed(1)) : null
      };
    });

  res.json({
    success: true,
    product,
    relatedProducts,
    reviews
  });
});

// GET reviews for specific product
router.get('/:id/reviews', (req, res) => {
  const reviews = db.find(
    'reviews',
    (r) => r.productId === req.params.id && (r.status === 'APPROVED' || !r.status)
  );
  reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    total: reviews.length,
    reviews
  });
});

// POST submit a review for specific product
router.post('/:id/reviews', optionalAuth, (req, res) => {
  const productId = req.params.id;
  const product = db.findById('products', productId);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const { rating, comment, title, userName, userEmail } = req.body;

  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({ success: false, message: 'Rating between 1 and 5 is required' });
  }

  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Comment is required' });
  }

  const newReview = {
    id: `rev_${uuidv4().slice(0, 8)}`,
    productId,
    productTitle: product.title,
    productImage: product.images?.[0] || '',
    userId: req.user?.id || null,
    userName: userName || req.user?.name || 'Verified Parent',
    userEmail: userEmail || req.user?.email || 'parent@example.com',
    rating: Number(rating),
    title: title || '',
    comment: comment.trim(),
    status: 'APPROVED', // Default to approved so it appears immediately, admin can moderate in admin tab
    isVerifiedPurchase: true,
    createdAt: new Date().toISOString()
  };

  db.insert('reviews', newReview);

  // Recalculate average rating & review count for the product
  const approvedReviews = db.find(
    'reviews',
    (r) => r.productId === productId && (r.status === 'APPROVED' || !r.status)
  );

  const totalReviews = approvedReviews.length;
  const avgRating = totalReviews > 0
    ? Number((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : Number(rating);

  db.updateById('products', productId, {
    rating: avgRating,
    reviewsCount: totalReviews
  });

  res.status(201).json({
    success: true,
    message: 'Thank you! Your review has been submitted successfully.',
    review: newReview,
    updatedRating: avgRating,
    updatedReviewsCount: totalReviews
  });
});

// ADMIN: Create New Product Listing
router.post('/', requireAdmin, (req, res) => {
  const {
    title,
    description,
    category,
    subCategory,
    gender,
    ageGroup,
    price,
    discountPrice,
    images,
    sizes,
    tags,
    colors,
    fabric,
    careInstructions,
    isNewArrival,
    isBestSeller,
    isFeatured
  } = req.body;

  if (!title || !category || !price) {
    return res.status(400).json({ success: false, message: 'Title, category, and price are required' });
  }

  const numPrice = Number(price);
  const numDiscountPrice = discountPrice ? Number(discountPrice) : numPrice;
  const discountPercentage =
    numPrice > numDiscountPrice ? Math.round(((numPrice - numDiscountPrice) / numPrice) * 100) : 0;

  // Process sizes, size-specific pricing and stock calculation
  const processedSizes = Array.isArray(sizes) && sizes.length > 0
    ? sizes.map((s) => ({
        size: s.size || 'Standard',
        stock: Number(s.stock) || 0,
        price: s.price !== undefined && s.price !== '' ? Number(s.price) : numPrice,
        discountPrice: s.discountPrice !== undefined && s.discountPrice !== '' ? Number(s.discountPrice) : numDiscountPrice
      }))
    : [{ size: 'Standard', stock: 10, price: numPrice, discountPrice: numDiscountPrice }];

  const totalStock = processedSizes.reduce((sum, s) => sum + s.stock, 0);

  const newProduct = {
    id: `prod_${uuidv4().slice(0, 8)}`,
    title,
    description: description || '',
    category: category.toLowerCase(),
    subCategory: subCategory ? subCategory.toLowerCase() : 'casuals',
    gender: gender ? gender.toLowerCase() : 'unisex',
    ageGroup: ageGroup || '2-4Y',
    price: numPrice,
    discountPrice: numDiscountPrice,
    discountPercentage,
    sku: `YUV-${category.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    rating: null,
    reviewsCount: 0,
    isNewArrival: !!isNewArrival,
    isBestSeller: !!isBestSeller,
    isFeatured: !!isFeatured,
    images: Array.isArray(images) && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: processedSizes,
    totalStock,
    isSoldOut: totalStock === 0,
    tags: Array.isArray(tags) ? tags : ['Kids Fashion', category],
    colors: Array.isArray(colors) ? colors : ['Multi-color'],
    fabric: fabric || '100% Breathable Cotton',
    careInstructions: careInstructions || 'Gentle wash in cold water'
  };

  db.insert('products', newProduct);

  res.status(201).json({
    success: true,
    message: 'Product listed successfully',
    product: newProduct
  });
});

// ADMIN: Update Product Listing
router.put('/:id', requireAdmin, (req, res) => {
  const existing = db.findById('products', req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const updates = { ...req.body };

  if (updates.price !== undefined) {
    updates.price = Number(updates.price);
    const disc = updates.discountPrice !== undefined ? Number(updates.discountPrice) : (existing.discountPrice || updates.price);
    updates.discountPrice = disc;
    updates.discountPercentage =
      updates.price > disc ? Math.round(((updates.price - disc) / updates.price) * 100) : 0;
  }

  if (updates.sizes && Array.isArray(updates.sizes)) {
    const basePrice = updates.price !== undefined ? Number(updates.price) : (existing.price || 0);
    const baseDisc = updates.discountPrice !== undefined ? Number(updates.discountPrice) : (existing.discountPrice || basePrice);

    updates.sizes = updates.sizes.map((s) => ({
      size: s.size,
      stock: Number(s.stock) || 0,
      price: s.price !== undefined && s.price !== '' ? Number(s.price) : basePrice,
      discountPrice: s.discountPrice !== undefined && s.discountPrice !== '' ? Number(s.discountPrice) : baseDisc
    }));
    updates.totalStock = updates.sizes.reduce((sum, s) => sum + s.stock, 0);
    updates.isSoldOut = updates.totalStock === 0;
  }

  const updated = db.updateById('products', req.params.id, updates);

  res.json({
    success: true,
    message: 'Product updated successfully',
    product: updated
  });
});

// ADMIN: Quick Inventory Update (Size Stock & Sold Out toggle)
router.patch('/:id/inventory', requireAdmin, (req, res) => {
  const existing = db.findById('products', req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const { sizes, isSoldOut, addStock } = req.body;
  const updates = {};

  if (sizes && Array.isArray(sizes)) {
    updates.sizes = sizes.map((s) => ({ size: s.size, stock: Number(s.stock) || 0 }));
    updates.totalStock = updates.sizes.reduce((sum, s) => sum + s.stock, 0);
    updates.isSoldOut = updates.totalStock === 0;
  } else if (addStock !== undefined) {
    const additional = Number(addStock) || 0;
    updates.totalStock = Math.max(0, (existing.totalStock || 0) + additional);
    updates.sizes = (existing.sizes || []).map((s) => ({
      ...s,
      stock: s.stock + Math.floor(additional / (existing.sizes.length || 1))
    }));
    updates.isSoldOut = updates.totalStock === 0;
  }

  if (isSoldOut !== undefined) {
    updates.isSoldOut = !!isSoldOut;
    if (updates.isSoldOut) {
      updates.totalStock = 0;
      updates.sizes = (existing.sizes || []).map((s) => ({ ...s, stock: 0 }));
    }
  }

  const updated = db.updateById('products', req.params.id, updates);

  res.json({
    success: true,
    message: 'Inventory updated successfully',
    product: updated
  });
});

// ADMIN: Delete Product
router.delete('/:id', requireAdmin, (req, res) => {
  const deleted = db.deleteById('products', req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

module.exports = router;
