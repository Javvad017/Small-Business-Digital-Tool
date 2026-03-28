const express = require('express');
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard  — main dashboard stats
router.get('/', auth, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayBills, allBills, products] = await Promise.all([
      Bill.find({ user: req.userId, createdAt: { $gte: today, $lt: tomorrow }, status: 'completed' }),
      Bill.find({ user: req.userId, status: 'completed' }),
      Product.find({ user: req.userId })
    ]);

    const todaySales         = todayBills.reduce((s, b) => s + b.totalAmount, 0);
    const todayTransactions  = todayBills.length;
    const totalRevenue       = allBills.reduce((s, b) => s + b.totalAmount, 0);
    const lowStockProducts   = products.filter(p => p.quantity < 5);

    // Last 7 days chart data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart); dayEnd.setHours(23, 59, 59, 999);
      const dayBills = allBills.filter(b => b.createdAt >= dayStart && b.createdAt <= dayEnd);
      last7Days.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: dayBills.reduce((s, b) => s + b.totalAmount, 0),
        transactions: dayBills.length
      });
    }

    // Top products from bills
    const productMap = {};
    allBills.forEach(b => b.items.forEach(i => {
      if (!productMap[i.productName]) productMap[i.productName] = { qty: 0, revenue: 0 };
      productMap[i.productName].qty += i.quantity;
      productMap[i.productName].revenue += i.subtotal;
    }));
    const topProducts = Object.entries(productMap)
      .map(([name, v]) => ({ _id: name, totalQuantity: v.qty, totalRevenue: v.revenue }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 5);

    res.json({
      todaySales,
      todayTransactions,
      totalRevenue,
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map(p => ({ name: p.name, quantity: p.quantity, id: p._id })),
      last7Days,
      topProducts
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
