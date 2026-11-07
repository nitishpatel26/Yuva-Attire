const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');

// Create New Order (Customer or Guest)
router.post('/', optionalAuth, (req, res) => {
  const {
    items,
    shippingAddress,
    customerName,
    customerEmail,
    customerPhone,
    paymentMethod = 'razorpay',
    couponCode,
    razorpayOrderId,
    razorpayPaymentId
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart items are required' });
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
    return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
  }

  // Check VIP status of user
  let isVip = false;
  let currentUser = null;
  if (req.user?.id) {
    currentUser = db.findById('users', req.user.id);
    if (currentUser && currentUser.isVip && (!currentUser.vipExpiry || new Date(currentUser.vipExpiry) > new Date())) {
      isVip = true;
    }
  }

  // Validate items and calculate prices
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const product = db.findById('products', item.productId);
    if (!product) {
      return res.status(400).json({ success: false, message: `Product not found: ${item.title || item.productId}` });
    }

    if (product.isSoldOut || product.totalStock <= 0) {
      return res.status(400).json({ success: false, message: `Product "${product.title}" is currently Sold Out` });
    }

    const itemPrice = product.discountPrice || product.price;
    const qty = Number(item.quantity) || 1;
    const itemSubtotal = itemPrice * qty;
    subtotal += itemSubtotal;

    processedItems.push({
      productId: product.id,
      title: product.title,
      image: product.images[0] || '',
      size: item.size || 'Standard',
      color: item.color || product.colors?.[0] || 'Default',
      quantity: qty,
      price: itemPrice,
      subtotal: itemSubtotal
    });

    // INVENTORY MANAGEMENT: Deduct stock from specific size and total stock
    let updatedSizes = product.sizes || [];
    let sizeMatched = false;

    if (updatedSizes.length > 0) {
      updatedSizes = updatedSizes.map((s) => {
        if (s.size === item.size && s.stock > 0) {
          sizeMatched = true;
          return { ...s, stock: Math.max(0, s.stock - qty) };
        }
        return s;
      });
      // If exact size not matched, deduct from first available size
      if (!sizeMatched) {
        updatedSizes[0].stock = Math.max(0, updatedSizes[0].stock - qty);
      }
    }

    const newTotalStock = Math.max(0, product.totalStock - qty);
    const isNowSoldOut = newTotalStock === 0;

    db.updateById('products', product.id, {
      sizes: updatedSizes,
      totalStock: newTotalStock,
      isSoldOut: isNowSoldOut
    });
  }

  // Calculate Discounts
  let couponDiscount = 0;
  if (couponCode) {
    const coupon = db.findOne('coupons', (c) => c.code.toUpperCase() === couponCode.toUpperCase());
    if (coupon && subtotal >= (coupon.minOrder || 0)) {
      const calculated = (subtotal * coupon.discountPercent) / 100;
      couponDiscount = Math.min(calculated, coupon.maxDiscount || calculated);
    }
  }

  // VIP Member Benefit: Dynamic discount percentage + Free Express Shipping
  let vipDiscount = 0;
  if (isVip) {
    const vipConfig = db.get('vipConfig', { discountPercentage: 15 });
    const discountRate = (vipConfig.discountPercentage || 15) / 100;
    vipDiscount = Math.round((subtotal - couponDiscount) * discountRate);
  }

  // Shipping fee (Free if VIP or order > ₹999, else ₹99)
  const shippingFee = (isVip || subtotal >= 999) ? 0 : 99;
  const tax = 0; // Inclusive of GST
  const totalAmount = Math.max(0, Math.round(subtotal - couponDiscount - vipDiscount + shippingFee));

  const orderId = `ord_${uuidv4().slice(0, 8)}`;
  const orderNumber = `YUV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder = {
    id: orderId,
    orderNumber,
    userId: req.user?.id || null,
    customerName: customerName || req.user?.name || shippingAddress.name,
    customerEmail: customerEmail || req.user?.email || 'customer@example.com',
    customerPhone: customerPhone || req.user?.phone || shippingAddress.phone || '',
    shippingAddress,
    items: processedItems,
    subtotal,
    discount: couponDiscount,
    vipDiscount,
    shippingFee,
    tax,
    totalAmount,
    paymentMethod, // 'razorpay', 'cod', 'upi'
    paymentStatus: paymentMethod === 'cod' ? 'PENDING' : (razorpayPaymentId ? 'PAID' : 'PENDING'),
    orderStatus: 'PLACED',
    razorpayOrderId: razorpayOrderId || null,
    razorpayPaymentId: razorpayPaymentId || null,
    trackingNumber: `DELHIVERY-${orderNumber}`,
    createdAt: new Date().toISOString()
  };

  db.insert('orders', newOrder);

  // If paid via Razorpay upon placement, also record in payments
  if (razorpayPaymentId) {
    db.insert('payments', {
      id: `pay_tx_${uuidv4().slice(0, 8)}`,
      transactionId: `TXN_YUV_${Math.floor(100000 + Math.random() * 900000)}`,
      orderId: newOrder.id,
      userId: req.user?.id || null,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail,
      amount: totalAmount,
      currency: 'INR',
      method: 'Razorpay Instant',
      status: 'SUCCESS',
      razorpayOrderId: razorpayOrderId || 'order_instant',
      razorpayPaymentId,
      razorpaySignature: 'sig_verified_instant',
      type: 'ORDER',
      createdAt: new Date().toISOString()
    });
  }

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    order: newOrder
  });
});

// GET My Orders (Authenticated user)
router.get('/my-orders', verifyToken, (req, res) => {
  const orders = db.find('orders', (o) => o.userId === req.user.id);
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    total: orders.length,
    orders
  });
});

// GET Single Order by ID
router.get('/:id', optionalAuth, (req, res) => {
  const order = db.findById('orders', req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({
    success: true,
    order
  });
});

// ADMIN: GET All Orders with filters
router.get('/', requireAdmin, (req, res) => {
  let orders = db.find('orders');
  const { status, paymentStatus, search } = req.query;

  if (status && status !== 'all') {
    orders = orders.filter((o) => o.orderStatus.toLowerCase() === status.toLowerCase());
  }

  if (paymentStatus && paymentStatus !== 'all') {
    orders = orders.filter((o) => o.paymentStatus.toLowerCase() === paymentStatus.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
    );
  }

  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    total: orders.length,
    orders
  });
});

// ADMIN: Update Order Status & Tracking
router.patch('/:id/status', requireAdmin, (req, res) => {
  const { orderStatus, paymentStatus, trackingNumber } = req.body;
  const updates = {};

  if (orderStatus) updates.orderStatus = orderStatus;
  if (paymentStatus) updates.paymentStatus = paymentStatus;
  if (trackingNumber) updates.trackingNumber = trackingNumber;

  const updatedOrder = db.updateById('orders', req.params.id, updates);
  if (!updatedOrder) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({
    success: true,
    message: 'Order status updated',
    order: updatedOrder
  });
});

module.exports = router;
