const express = require('express');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET /api/suppliers
router.get('/', auth, async (req, res) => {
  try {
    const suppliers = await Supplier.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/suppliers
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const supplier = new Supplier({ ...req.body, user: req.userId });
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Supplier.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/suppliers/:id/purchases — purchase history for a supplier
router.get('/:id/purchases', auth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ supplier: req.params.id, user: req.userId }).sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
