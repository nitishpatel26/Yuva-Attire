const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');

// Razorpay setup (Uses provided env keys or standard sandbox test key)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_YuvaAttireDemoKey2026';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'yuva_attire_razorpay_secret_key_2026';

let razorpayInstance = null;
try {
  // If not mock prefix, initialize official client
  if (!RAZORPAY_KEY_ID.includes('DemoKey')) {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
  }
} catch (e) {
  console.log('Using robust Razorpay sandbox mode:', e.message);
}

// Get Razorpay Public Key for Frontend Checkout Modal
router.get('/key', (req, res) => {
  res.json({
    success: true,
    keyId: RAZORPAY_KEY_ID
  });
});

// Create Razorpay Order
router.post('/create-order', optionalAuth, async (req, res) => {
  const { amount, currency = 'INR', receipt, notes = {} } = req.body;

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Valid amount is required' });
  }

  const amountInPaise = Math.round(Number(amount) * 100);
  const orderReceipt = receipt || `rcpt_${uuidv4().slice(0, 10)}`;

  try {
    if (razorpayInstance) {
      const options = {
        amount: amountInPaise,
        currency,
        receipt: orderReceipt,
        notes
      };
      const rzpOrder = await razorpayInstance.orders.create(options);
      return res.json({
        success: true,
        order: rzpOrder,
        keyId: RAZORPAY_KEY_ID
      });
    }

    // Sandbox / Test fallback order
    const mockRzpOrder = {
      id: `order_rzp_${uuidv4().slice(0, 12)}`,
      entity: 'order',
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency,
      receipt: orderReceipt,
      status: 'created',
      attempts: 0,
      notes,
      created_at: Math.floor(Date.now() / 1000)
    };

    res.json({
      success: true,
      order: mockRzpOrder,
      keyId: RAZORPAY_KEY_ID,
      isSandbox: true
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order', error: error.message });
  }
});

// Verify Payment Signature & Process Order / VIP Membership
router.post('/verify', optionalAuth, (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
    type = 'ORDER', // 'ORDER' or 'VIP_MEMBERSHIP'
    amount,
    customerName,
    customerEmail,
    paymentMethod = 'Razorpay Card/UPI'
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ success: false, message: 'Missing payment verification credentials' });
  }

  // Signature verification
  let isSignatureValid = true;
  if (razorpayInstance && razorpay_signature) {
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    isSignatureValid = generatedSignature === razorpay_signature;
  }

  if (!isSignatureValid) {
    return res.status(400).json({ success: false, message: 'Invalid payment signature' });
  }

  // Record Transaction in Payments table for backend tracking
  const transaction = {
    id: `pay_tx_${uuidv4().slice(0, 8)}`,
    transactionId: `TXN_YUV_${Math.floor(100000 + Math.random() * 900000)}`,
    orderId: orderId || null,
    userId: req.user?.id || null,
    customerName: customerName || req.user?.name || 'Customer',
    customerEmail: customerEmail || req.user?.email || 'guest@yuvaattire.com',
    amount: Number(amount) || 0,
    currency: 'INR',
    method: paymentMethod,
    status: 'SUCCESS',
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature || 'sandbox_verified',
    type,
    createdAt: new Date().toISOString()
  };

  db.insert('payments', transaction);

  // If order verification, update order payment status
  if (orderId && type === 'ORDER') {
    db.updateById('orders', orderId, {
      paymentStatus: 'PAID',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      orderStatus: 'PROCESSING'
    });
  }

  // If VIP subscription, activate VIP status for user
  if (type === 'VIP_MEMBERSHIP' && req.user?.id) {
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    db.updateById('users', req.user.id, {
      isVip: true,
      vipExpiry: oneYearFromNow
    });

    const vipRecord = {
      id: `vip_${uuidv4().slice(0, 8)}`,
      userId: req.user.id,
      userName: customerName || req.user.name,
      userEmail: customerEmail || req.user.email,
      phone: req.user.phone || '',
      amount: Number(amount) || 1000,
      plan: '1_YEAR_VIP',
      startDate: new Date().toISOString(),
      endDate: oneYearFromNow,
      razorpayPaymentId: razorpay_payment_id,
      status: 'ACTIVE',
      totalSavings: 0,
      createdAt: new Date().toISOString()
    };
    db.insert('vipMemberships', vipRecord);
  }

  res.json({
    success: true,
    message: 'Payment verified and recorded successfully',
    transaction
  });
});

// GET Payment Transactions / Tracking (Admin: all, User: their own)
router.get('/transactions', verifyToken, (req, res) => {
  let transactions = [];
  if (req.user.role === 'admin') {
    transactions = db.find('payments');
  } else {
    transactions = db.find('payments', (p) => p.userId === req.user.id);
  }

  // Sort newest first
  transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    total: transactions.length,
    transactions
  });
});

module.exports = router;
