const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET User's Wishlist Items
router.get('/', verifyToken, (req, res) => {
  const userId = req.user.id;
  const productIds = db.data.wishlists[userId] || [];

  // Fetch full product objects
  const products = productIds
    .map((id) => db.findById('products', id))
    .filter(Boolean);

  res.json({
    success: true,
    productIds,
    products,
    count: products.length
  });
});

// Toggle Item in Wishlist (Add/Remove)
router.post('/toggle', verifyToken, (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  if (!db.data.wishlists[userId]) {
    db.data.wishlists[userId] = [];
  }

  const list = db.data.wishlists[userId];
  const index = list.indexOf(productId);
  let isWishlisted = false;

  if (index > -1) {
    // Remove
    list.splice(index, 1);
    isWishlisted = false;
  } else {
    // Add
    list.push(productId);
    isWishlisted = true;
  }

  db.save();

  res.json({
    success: true,
    isWishlisted,
    productIds: list,
    count: list.length,
    message: isWishlisted ? 'Added to Wishlist' : 'Removed from Wishlist'
  });
});

module.exports = router;
