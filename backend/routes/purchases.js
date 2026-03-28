const express = require('express');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET /api/purchases
router.get('/', auth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.userId })
      .populate('supplier', 'name phone')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/purchases  — add stock, update product quantities and costPrice
router.post('/', auth, adminOnly, async (req, res) => {
  const { supplierId, supplierName, items, notes } = req.body;
  try {
    const purchaseItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, user: req.userId });
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });

      const subtotal = item.costPrice * item.quantity;
      totalAmount += subtotal;

      purchaseItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        costPrice: item.costPrice,
        subtotal
      });

      // Update stock and cost price
      product.quantity += item.quantity;
      product.costPrice = item.costPrice; // update to latest cost
      await product.save();
    }

    const supplier = supplierId ? await Supplier.findById(supplierId) : null;

    const purchase = new Purchase({
      supplier: supplierId || undefined,
      supplierName: supplier ? supplier.name : (supplierName || 'Direct Purchase'),
      items: purchaseItems,
      totalAmount,
      notes,
      user: req.userId
    });

    await purchase.save();
    res.status(201).json(purchase);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
