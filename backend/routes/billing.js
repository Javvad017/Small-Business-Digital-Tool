const express = require('express');
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// @route  POST /api/billing
// @desc   Create a new bill and reduce stock
router.post('/', auth, async (req, res) => {
  const { items, customerName, paymentMethod } = req.body;

  try {
    // Validate items and calculate totals
    const billItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, user: req.userId });
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}`
        });
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      billItems.push({
        product: product._id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal
      });

      // Reduce stock
      product.quantity -= item.quantity;
      await product.save();
    }

    // Create bill
    const bill = new Bill({
      items: billItems,
      totalAmount,
      customerName: customerName || 'Walk-in Customer',
      paymentMethod: paymentMethod || 'cash',
      user: req.userId,
      status: 'completed'
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/billing
// @desc   Get all bills (order history)
router.get('/', auth, async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/billing/:id
// @desc   Get single bill
router.get('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.userId });
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
