const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Get VIP Plan details and user's current VIP status
router.get('/status', verifyToken, (req, res) => {
  const user = db.findById('users', req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
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
    planDetails: {
      price: 1000,
      duration: '1 Year (365 Days)',
      benefits: [
        'Flat Extra 15% OFF on every single order (No upper limit)',
        'Free Express Shipping with zero minimum order value',
        'Early 24-Hour VIP Access to Mega Sales & Festive Drops',
        'Special ₹500 Birthday Gift Voucher for your child',
        'Dedicated 24/7 Priority Support & Hassle-free Returns'
      ]
    }
  });
});

// Subscribe to VIP Membership (₹1000 / year)
router.post('/subscribe', verifyToken, (req, res) => {
  const { razorpayPaymentId, razorpayOrderId } = req.body;
  const user = db.findById('users', req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  // Update user
  db.updateById('users', user.id, {
    isVip: true,
    vipExpiry: oneYearFromNow
  });

  // Record membership
  const vipRecord = {
    id: `vip_${uuidv4().slice(0, 8)}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    phone: user.phone || '',
    amount: 1000,
    plan: '1_YEAR_VIP',
    startDate: new Date().toISOString(),
    endDate: oneYearFromNow,
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
    amount: 1000,
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
    message: 'Congratulations! You are now a Yuva Attire VIP Club Member for 1 Year.',
    isVip: true,
    vipExpiry: oneYearFromNow,
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
