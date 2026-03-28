const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// @route  GET /api/products
// @desc   Get all products for user
router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  POST /api/products
// @desc   Add a new product
router.post('/', auth, async (req, res) => {
  const { name, price, quantity, category, description } = req.body;

  try {
    const product = new Product({
      name,
      price,
      quantity,
      category: category || 'General',
      description: description || '',
      user: req.userId
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  PUT /api/products/:id
// @desc   Update a product
router.put('/:id', auth, async (req, res) => {
  const { name, price, quantity, category, description } = req.body;

  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.userId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name || product.name;
    product.price = price !== undefined ? price : product.price;
    product.quantity = quantity !== undefined ? quantity : product.quantity;
    product.category = category || product.category;
    product.description = description !== undefined ? description : product.description;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  DELETE /api/products/:id
// @desc   Delete a product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/products/low-stock
// @desc   Get low stock products (quantity < 5)
router.get('/low-stock', auth, async (req, res) => {
  try {
    const products = await Product.find({ user: req.userId, quantity: { $lt: 5 } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
