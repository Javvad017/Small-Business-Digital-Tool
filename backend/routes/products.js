const express = require('express');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET /api/products  — all products, supports search & stock filter
// NOTE: both admin and staff (billing) can read products
router.get('/', auth, async (req, res) => {
  try {
    const { search, stock } = req.query;
    const query = { user: req.userId };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (stock === 'low') query.quantity = { $lt: 5, $gt: 0 };
    if (stock === 'out') query.quantity = 0;
    if (stock === 'ok')  query.quantity = { $gte: 5 };
    const products = await Product.find(query)
      .populate('supplier', 'name phone')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/products
router.post('/', auth, async (req, res) => {
  try {
    const product = new Product({ ...req.body, user: req.userId });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
