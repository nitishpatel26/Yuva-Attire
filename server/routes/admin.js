const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Get Comprehensive Admin Dashboard Overview Stats
router.get('/dashboard', requireAdmin, (req, res) => {
  const products = db.find('products');
  const orders = db.find('orders');
  const payments = db.find('payments');
  const vipMemberships = db.find('vipMemberships');
  const users = db.find('users');
  const reviews = db.find('reviews');

  // Revenue calculations
  const orderRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const vipRevenue = vipMemberships.reduce((sum, v) => sum + (v.amount || 1000), 0);
  const totalRevenue = Math.round(orderRevenue + vipRevenue);

  // Inventory analytics
  const soldOutProducts = products.filter((p) => p.isSoldOut || p.totalStock === 0);
  const lowStockProducts = products.filter((p) => !p.isSoldOut && p.totalStock > 0 && p.totalStock <= 10);

  // Orders status distribution
  const orderStatusCounts = {
    PLACED: orders.filter((o) => o.orderStatus === 'PLACED').length,
    PROCESSING: orders.filter((o) => o.orderStatus === 'PROCESSING').length,
    SHIPPED: orders.filter((o) => o.orderStatus === 'SHIPPED').length,
    DELIVERED: orders.filter((o) => o.orderStatus === 'DELIVERED').length,
    CANCELLED: orders.filter((o) => o.orderStatus === 'CANCELLED').length
  };

  // Category distribution
  const categoryStats = {
    clothing: products.filter((p) => p.category === 'clothing').length,
    shoes: products.filter((p) => p.category === 'shoes').length,
    toys: products.filter((p) => p.category === 'toys').length,
    accessories: products.filter((p) => p.category === 'accessories').length
  };

  // Recent 5 orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Recent 5 transactions
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  res.json({
    success: true,
    kpis: {
      totalRevenue,
      orderRevenue: Math.round(orderRevenue),
      vipRevenue,
      totalOrders: orders.length,
      paidOrders: orders.filter((o) => o.paymentStatus === 'PAID').length,
      totalProducts: products.length,
      soldOutCount: soldOutProducts.length,
      lowStockCount: lowStockProducts.length,
      activeVipMembers: vipMemberships.filter((v) => v.status === 'ACTIVE').length,
      totalCustomers: users.filter((u) => u.role === 'customer').length,
      totalReviews: reviews.length,
      pendingReviews: reviews.filter((r) => r.status === 'PENDING').length
    },
    inventoryAlerts: {
      soldOutProducts: soldOutProducts.map((p) => ({
        id: p.id,
        title: p.title,
        sku: p.sku,
        category: p.category,
        totalStock: p.totalStock
      })),
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        title: p.title,
        sku: p.sku,
        category: p.category,
        totalStock: p.totalStock,
        sizes: p.sizes
      }))
    },
    orderStatusCounts,
    categoryStats,
    recentOrders,
    recentPayments
  });
});

// ADMIN: GET All Reviews with status & search filters
router.get('/reviews', requireAdmin, (req, res) => {
  let reviews = db.find('reviews');
  const { status, search } = req.query;

  if (status && status !== 'ALL') {
    reviews = reviews.filter((r) => (r.status || 'APPROVED').toUpperCase() === status.toUpperCase());
  }

  if (search) {
    const q = search.toLowerCase();
    reviews = reviews.filter(
      (r) =>
        r.productTitle?.toLowerCase().includes(q) ||
        r.userName?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q) ||
        r.title?.toLowerCase().includes(q)
    );
  }

  // Attach fresh product details
  const enrichedReviews = reviews.map((r) => {
    const prod = db.findById('products', r.productId);
    return {
      ...r,
      productTitle: prod?.title || r.productTitle,
      productImage: prod?.images?.[0] || r.productImage,
      productSku: prod?.sku || ''
    };
  });

  enrichedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    total: enrichedReviews.length,
    reviews: enrichedReviews
  });
});

// ADMIN: Update Review Status (APPROVE, REJECT, PENDING)
router.patch('/reviews/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  const review = db.findById('reviews', req.params.id);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  const updatedReview = db.updateById('reviews', req.params.id, {
    status: status.toUpperCase()
  });

  // Recalculate product rating & count based on approved reviews only
  const productId = review.productId;
  const approvedReviews = db.find(
    'reviews',
    (r) => r.productId === productId && (r.status === 'APPROVED' || !r.status)
  );

  const totalReviews = approvedReviews.length;
  const avgRating = totalReviews > 0
    ? Number((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 5.0;

  db.updateById('products', productId, {
    rating: avgRating,
    reviewsCount: totalReviews
  });

  res.json({
    success: true,
    message: `Review status updated to ${status}`,
    review: updatedReview,
    productRating: avgRating,
    productReviewsCount: totalReviews
  });
});

// ADMIN: Delete Review
router.delete('/reviews/:id', requireAdmin, (req, res) => {
  const review = db.findById('reviews', req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  const productId = review.productId;
  db.deleteById('reviews', req.params.id);

  // Recalculate product rating & count
  const approvedReviews = db.find(
    'reviews',
    (r) => r.productId === productId && (r.status === 'APPROVED' || !r.status)
  );

  const totalReviews = approvedReviews.length;
  const avgRating = totalReviews > 0
    ? Number((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 5.0;

  db.updateById('products', productId, {
    rating: avgRating,
    reviewsCount: totalReviews
  });

  res.json({
    success: true,
    message: 'Review deleted successfully',
    productRating: avgRating,
    productReviewsCount: totalReviews
  });
});

module.exports = router;
