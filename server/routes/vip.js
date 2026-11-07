const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

function getVipConfig() {
  const defaultConfig = {
    price: 1000,
    discountPercentage: 15,
    durationDays: 365,
    durationLabel: '1 Year (365 Days)',
    isActive: true,
    benefits: [
      'Flat Extra 15% OFF on every single order (No upper limit)',
      'Free Express Shipping with zero minimum order value',
      'Early 24-Hour VIP Access to Mega Sales & Festive Drops',
      'Special ₹500 Birthday Gift Voucher for your child',
      'Dedicated 24/7 Priority Parent Support & Quick Exchanges'
    ]
  };
  return db.get('vipConfig', defaultConfig);
}

// GET Public/Dynamic VIP Configuration & Benefits
router.get('/config', (req, res) => {
  const vipConfig = getVipConfig();
  res.json({
    success: true,
    vipConfig
  });
});

// ADMIN: Update VIP Club Pricing, Discount, Duration & Benefits
router.put('/config', requireAdmin, (req, res) => {
  const currentConfig = getVipConfig();
  const { price, discountPercentage, durationDays, durationLabel, benefits, isActive } = req.body;

  const updatedConfig = {
    ...currentConfig,
    price: price !== undefined ? Number(price) : currentConfig.price,
    discountPercentage: discountPercentage !== undefined ? Number(discountPercentage) : currentConfig.discountPercentage,
    durationDays: durationDays !== undefined ? Number(durationDays) : currentConfig.durationDays,
    durationLabel: durationLabel !== undefined ? durationLabel : currentConfig.durationLabel,
    benefits: Array.isArray(benefits) ? benefits.filter(b => b && b.trim()) : currentConfig.benefits,
    isActive: isActive !== undefined ? Boolean(isActive) : currentConfig.isActive,
    updatedAt: new Date().toISOString()
  };

  db.set('vipConfig', updatedConfig);

  res.json({
    success: true,
    message: 'VIP Club configuration updated successfully',
    vipConfig: updatedConfig
  });
});

// Get VIP Plan details and user's current VIP status
router.get('/status', (req, res) => {
  const authHeader = req.headers.authorization;
  const vipConfig = getVipConfig();

  let user = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../middleware/auth');
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      user = db.findById('users', decoded.id);
    } catch (e) {}
  }

  if (!user) {
    return res.json({
      success: true,
      isVip: false,
      vipExpiry: null,
      remainingDays: 0,
      membership: null,
      planDetails: vipConfig
    });
  }

  let isVip = user.isVip;
  let remainingDays = 0;

  if (user.isVip && user.vipExpiry) {
    const now = new Date();
    const expiry = new Date(user.vipExpiry);
    if (expiry > now) {
      remainingDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    } else {
      isVip = false;
      db.updateById('users', user.id, { isVip: false });
    }
  }

  const membershipRecord = db.findOne('vipMemberships', (m) => m.userId === user.id && m.status === 'ACTIVE');

  res.json({
    success: true,
    isVip,
    vipExpiry: user.vipExpiry,
    remainingDays,
    membership: membershipRecord,
    planDetails: vipConfig
  });
});

// Subscribe to VIP Membership
router.post('/subscribe', verifyToken, (req, res) => {
  const { razorpayPaymentId, razorpayOrderId } = req.body;
  const user = db.findById('users', req.user.id);
  const vipConfig = getVipConfig();

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const durationDays = vipConfig.durationDays || 365;
  const expiryDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
  const price = vipConfig.price || 1000;

  // Update user
  db.updateById('users', user.id, {
    isVip: true,
    vipExpiry: expiryDate
  });

  // Record membership
  const vipRecord = {
    id: `vip_${uuidv4().slice(0, 8)}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    phone: user.phone || '',
    amount: price,
    discountPercentage: vipConfig.discountPercentage || 15,
    plan: vipConfig.durationLabel || '1 Year VIP',
    startDate: new Date().toISOString(),
    endDate: expiryDate,
    razorpayPaymentId: razorpayPaymentId || `pay_vip_${uuidv4().slice(0, 10)}`,
    status: 'ACTIVE',
    totalSavings: 0,
    createdAt: new Date().toISOString()
  };

  db.insert('vipMemberships', vipRecord);

  // Record payment transaction
  db.insert('payments', {
    id: `pay_tx_${uuidv4().slice(0, 8)}`,
    transactionId: `TXN_VIP_${Math.floor(100000 + Math.random() * 900000)}`,
    orderId: vipRecord.id,
    userId: user.id,
    customerName: user.name,
    customerEmail: user.email,
    amount: price,
    currency: 'INR',
    method: 'Razorpay VIP Membership Subscription',
    status: 'SUCCESS',
    razorpayOrderId: razorpayOrderId || 'order_vip_rzp',
    razorpayPaymentId: vipRecord.razorpayPaymentId,
    razorpaySignature: 'sig_vip_verified',
    type: 'VIP_MEMBERSHIP',
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `Congratulations! You are now an active Yuva Attire VIP Club Member (${vipConfig.durationLabel}).`,
    isVip: true,
    vipExpiry: expiryDate,
    membership: vipRecord
  });
});

// ADMIN: Get all VIP members
router.get('/members', requireAdmin, (req, res) => {
  const members = db.find('vipMemberships');
  members.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    total: members.length,
    members
  });
});

module.exports = router;
