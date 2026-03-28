const express = require('express');
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const router = express.Router();

// POST /api/billing  — create bill, calculate GST, reduce stock
router.post('/', auth, async (req, res) => {
  const { items, customerName, customerPhone, paymentMethod } = req.body;
  try {
    const billItems = [];
    let subtotal = 0;
    let totalGst = 0;
    let totalCost = 0;

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, user: req.userId });
      if (!product) return res.status(404).json({ message: `Product not found` });
      if (product.quantity < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.quantity}` });

      const itemSubtotal = product.price * item.quantity;
      const gstAmount = parseFloat(((itemSubtotal * (product.gstRate || 0)) / 100).toFixed(2));
      const totalWithGst = parseFloat((itemSubtotal + gstAmount).toFixed(2));
      const costForItems = (product.costPrice || 0) * item.quantity;

      subtotal += itemSubtotal;
      totalGst += gstAmount;
      totalCost += costForItems;

      billItems.push({
        product: product._id,
        productName: product.name,
        price: product.price,
        costPrice: product.costPrice || 0,
        gstRate: product.gstRate || 0,
        gstAmount,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        totalWithGst
      });

      product.quantity -= item.quantity;
      await product.save();
    }

    const totalAmount = parseFloat((subtotal + totalGst).toFixed(2));
    const profit = parseFloat((subtotal - totalCost).toFixed(2));

    const bill = new Bill({
      items: billItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalGst: parseFloat(totalGst.toFixed(2)),
      totalAmount,
      profit,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      paymentMethod: paymentMethod || 'cash',
      user: req.userId
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/billing  — with optional date filters
router.get('/', auth, async (req, res) => {
  try {
    const { from, to, search } = req.query;
    const query = { user: req.userId };
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }
    if (search) query.billNumber = { $regex: search, $options: 'i' };
    const bills = await Bill.find(query).sort({ createdAt: -1 }).limit(200);
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/billing/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.userId });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
