const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const signToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userPayload = (user) => ({
  id: user._id, name: user.name, email: user.email,
  businessName: user.businessName, role: user.role
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, businessName, role } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const user = new User({ name, email, password, businessName,
      role: role === 'staff' ? 'staff' : 'admin' });
    await user.save();
    res.status(201).json({ token: signToken(user), user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ message: 'Invalid email or password' });
    res.json({ token: signToken(user), user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/create-staff  (admin creates staff accounts)
router.post('/create-staff', async (req, res) => {
  const { name, email, password, businessName } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });
    const user = new User({ name, email, password, businessName: businessName || 'Staff', role: 'staff' });
    await user.save();
    res.status(201).json({ user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
