const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// List coupons (all coupons for admin/client with normalized id and isActive)
router.get('/', (req, res) => {
  const coupons = db.find('coupons').map((c) => ({
    id: c.id || `cpn_${c.code.toLowerCase()}`,
    code: c.code.toUpperCase(),
    discountPercent: Number(c.discountPercent) || 0,
    minOrder: Number(c.minOrder) || 0,
    maxDiscount: Number(c.maxDiscount) || 0,
    description: c.description || '',
    expiryDate: c.expiryDate || null,
    isActive: c.isActive !== false,
    createdAt: c.createdAt || new Date().toISOString()
  }));

  res.json({
    success: true,
    coupons
  });
});

// Validate & Apply Coupon at checkout
router.post('/apply', (req, res) => {
  const { code, orderAmount } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required' });
  }

  const cleanCode = code.toUpperCase().trim();
  const coupon = db.findOne('coupons', (c) => c.code.toUpperCase() === cleanCode);
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid coupon code' });
  }

  if (coupon.isActive === false) {
    return res.status(400).json({ success: false, message: 'This coupon is currently inactive' });
  }

  if (coupon.expiryDate) {
    const expiry = new Date(coupon.expiryDate);
    if (!isNaN(expiry.getTime()) && new Date() > expiry) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }
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
      id: coupon.id || `cpn_${coupon.code.toLowerCase()}`,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discount
    }
  });
});

// ADMIN: Create New Coupon
router.post('/', requireAdmin, (req, res) => {
  const { code, discountPercent, minOrder, maxDiscount, description, expiryDate, isActive } = req.body;

  if (!code || !discountPercent) {
    return res.status(400).json({ success: false, message: 'Coupon code and discount percentage are required' });
  }

  const cleanCode = code.toUpperCase().trim();
  const existing = db.findOne('coupons', (c) => c.code.toUpperCase() === cleanCode);
  if (existing) {
    return res.status(400).json({ success: false, message: `Coupon with code "${cleanCode}" already exists` });
  }

  const newCoupon = {
    id: `cpn_${uuidv4().slice(0, 8)}`,
    code: cleanCode,
    discountPercent: Number(discountPercent),
    minOrder: Number(minOrder) || 0,
    maxDiscount: Number(maxDiscount) || 0,
    description: description || `Get ${discountPercent}% off on orders above ₹${minOrder || 0}`,
    expiryDate: expiryDate || null,
    isActive: isActive !== false,
    createdAt: new Date().toISOString()
  };

  db.insert('coupons', newCoupon);

  res.status(201).json({
    success: true,
    message: `Coupon "${cleanCode}" created successfully`,
    coupon: newCoupon
  });
});

// ADMIN: Update Coupon
router.put('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const coupon = db.findOne('coupons', (c) => c.id === id || c.code === id || `cpn_${c.code?.toLowerCase()}` === id);

  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }

  const { code, discountPercent, minOrder, maxDiscount, description, expiryDate, isActive } = req.body;

  const targetId = coupon.id || id;
  const updates = {};
  if (code) updates.code = code.toUpperCase().trim();
  if (discountPercent !== undefined) updates.discountPercent = Number(discountPercent);
  if (minOrder !== undefined) updates.minOrder = Number(minOrder);
  if (maxDiscount !== undefined) updates.maxDiscount = Number(maxDiscount);
  if (description !== undefined) updates.description = description;
  if (expiryDate !== undefined) updates.expiryDate = expiryDate;
  if (isActive !== undefined) updates.isActive = !!isActive;

  // If the coupon in DB didn't have an ID, assign one
  if (!coupon.id) {
    coupon.id = targetId;
  }

  const updated = db.updateById('coupons', targetId, updates) || { ...coupon, ...updates };

  res.json({
    success: true,
    message: 'Coupon updated successfully',
    coupon: updated
  });
});

// ADMIN: Toggle Coupon Active Status
router.patch('/:id/toggle', requireAdmin, (req, res) => {
  const { id } = req.params;
  const coupon = db.findOne('coupons', (c) => c.id === id || c.code === id || `cpn_${c.code?.toLowerCase()}` === id);

  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }

  const targetId = coupon.id || id;
  if (!coupon.id) coupon.id = targetId;

  const newStatus = coupon.isActive === false ? true : false;
  const updated = db.updateById('coupons', targetId, { isActive: newStatus }) || { ...coupon, isActive: newStatus };

  res.json({
    success: true,
    message: `Coupon "${coupon.code}" is now ${newStatus ? 'Active' : 'Inactive'}`,
    coupon: updated
  });
});

// ADMIN: Delete Coupon
router.delete('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const coupon = db.findOne('coupons', (c) => c.id === id || c.code === id || `cpn_${c.code?.toLowerCase()}` === id);

  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }

  const targetId = coupon.id || id;
  db.deleteById('coupons', targetId);

  res.json({
    success: true,
    message: `Coupon "${coupon.code}" deleted successfully`
  });
});

module.exports = router;
