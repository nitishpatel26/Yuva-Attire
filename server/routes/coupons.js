const express = require('express');
const router = express.Router();
const db = require('../db');

// List active coupons
router.get('/', (req, res) => {
  const coupons = db.find('coupons');
  res.json({
    success: true,
    coupons
  });
});

// Validate & Apply Coupon
router.post('/apply', (req, res) => {
  const { code, orderAmount } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required' });
  }

  const coupon = db.findOne('coupons', (c) => c.code.toUpperCase() === code.toUpperCase().trim());
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
  }

  const amount = Number(orderAmount) || 0;
  if (coupon.minOrder && amount < coupon.minOrder) {
    return res.status(400).json({
      success: false,
      message: `Minimum order value of ₹${coupon.minOrder} required for coupon ${coupon.code}`
    });
  }

  const calculatedDiscount = Math.round((amount * coupon.discountPercent) / 100);
  const discount = Math.min(calculatedDiscount, coupon.maxDiscount || calculatedDiscount);

  res.json({
    success: true,
    message: `Coupon ${coupon.code} applied! You saved ₹${discount}`,
    coupon: {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discount
    }
  });
});

module.exports = router;
