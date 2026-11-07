const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { JWT_SECRET, verifyToken } = require('../middleware/auth');

// Register Customer (Validates email & required 10-digit mobile number, checks for duplicates)
router.post('/register', (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Please enter your full name.' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Please enter your email address.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  if (!phone || !phone.trim()) {
    return res.status(400).json({ success: false, message: 'Mobile number is required. Please enter a 10-digit mobile number.' });
  }

  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid 10-digit mobile number.'
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.'
    });
  }

  // Duplicate Check 1: Email
  const existingEmail = db.findOne('users', (u) => u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: 'This email is already registered. Please sign in instead.'
    });
  }

  // Duplicate Check 2: Mobile Number
  const existingPhone = db.findOne('users', (u) => {
    if (!u.phone) return false;
    const uClean = u.phone.replace(/\D/g, '');
    return uClean.endsWith(cleanPhone.slice(-10));
  });
  if (existingPhone) {
    return res.status(400).json({
      success: false,
      message: 'This mobile number is already registered. Please sign in instead.'
    });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: `usr_${uuidv4().slice(0, 8)}`,
    name: name.trim(),
    email: cleanEmail,
    password: hashedPassword,
    role: 'customer',
    isVip: false,
    vipExpiry: null,
    phone: `+91 ${cleanPhone.slice(-10)}`,
    addresses: [],
    createdAt: new Date().toISOString()
  };

  db.insert('users', newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name, isVip: newUser.isVip },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    success: true,
    message: 'Registered successfully!',
    token,
    user: userWithoutPassword
  });
});

// Login (Customer or Admin)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  // Reload .env in case user changed ADMIN_EMAIL or ADMIN_PASSWORD recently
  try {
    const dotenv = require('dotenv');
    const path = require('path');
    dotenv.config({ path: path.join(__dirname, '..', '..', '.env'), override: true });
    dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true });
  } catch (e) {
    // ignore
  }

  const inputEmail = email.toLowerCase().trim();
  const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const envAdminPass = process.env.ADMIN_PASSWORD;

  // Direct environment admin match check (seamless PROD/Local switch)
  if (envAdminEmail && inputEmail === envAdminEmail && envAdminPass && password === envAdminPass) {
    let adminUser = db.findOne('users', (u) => u.email.toLowerCase() === envAdminEmail || u.role === 'admin');
    if (!adminUser) {
      adminUser = {
        id: 'usr_admin_01',
        name: 'Yuva Admin',
        email: envAdminEmail,
        password: bcrypt.hashSync(envAdminPass, 10),
        role: 'admin',
        isVip: true,
        phone: '+91 9876543210',
        addresses: [],
        createdAt: new Date().toISOString()
      };
      db.insert('users', adminUser);
    }

    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'admin', name: adminUser.name, isVip: true },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = adminUser;
    return res.json({
      success: true,
      message: 'Logged in successfully as Administrator',
      token,
      user: userWithoutPassword
    });
  }

  const user = db.findOne('users', (u) => u.email.toLowerCase() === inputEmail);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // Check VIP expiration
  let isVip = user.isVip;
  if (user.isVip && user.vipExpiry) {
    if (new Date(user.vipExpiry) < new Date()) {
      isVip = false;
      db.updateById('users', user.id, { isVip: false });
    }
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, isVip },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...userWithoutPassword } = user;
  userWithoutPassword.isVip = isVip;

  res.json({
    success: true,
    message: 'Logged in successfully',
    token,
    user: userWithoutPassword
  });
});

// Get Current User Profile
router.get('/me', verifyToken, (req, res) => {
  const user = db.findById('users', req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Check VIP expiration
  let isVip = user.isVip;
  if (user.isVip && user.vipExpiry) {
    if (new Date(user.vipExpiry) < new Date()) {
      isVip = false;
      db.updateById('users', user.id, { isVip: false });
    }
  }

  const { password: _, ...userWithoutPassword } = user;
  userWithoutPassword.isVip = isVip;

  // Add counts
  const userOrders = db.find('orders', (o) => o.userId === user.id);
  const userWishlist = db.data.wishlists[user.id] || [];

  res.json({
    success: true,
    user: {
      ...userWithoutPassword,
      ordersCount: userOrders.length,
      wishlistCount: userWishlist.length
    }
  });
});

// Update Profile
router.put('/profile', verifyToken, (req, res) => {
  const { name, phone, addresses } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (addresses !== undefined) updates.addresses = addresses;

  const updatedUser = db.updateById('users', req.user.id, updates);
  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { password: _, ...userWithoutPassword } = updatedUser;
  res.json({ success: true, message: 'Profile updated', user: userWithoutPassword });
});

// Add or update Address
router.post('/address', verifyToken, (req, res) => {
  const user = db.findById('users', req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const { name, street, city, state, pincode, phone, isDefault } = req.body;
  const newAddr = {
    id: `addr_${uuidv4().slice(0, 6)}`,
    name: name || user.name,
    street,
    city,
    state,
    pincode,
    phone: phone || user.phone,
    isDefault: !!isDefault
  };

  let addresses = [...(user.addresses || [])];
  if (newAddr.isDefault) {
    addresses = addresses.map((a) => ({ ...a, isDefault: false }));
  } else if (addresses.length === 0) {
    newAddr.isDefault = true;
  }
  addresses.push(newAddr);

  const updatedUser = db.updateById('users', user.id, { addresses });
  const { password: _, ...userWithoutPassword } = updatedUser;

  res.json({ success: true, message: 'Address saved', addresses: updatedUser.addresses, user: userWithoutPassword });
});

module.exports = router;
