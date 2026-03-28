const express = require('express');
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// @route  GET /api/dashboard
// @desc   Get dashboard summary stats
router.get('/', auth, async (req, res) => {
  try {
    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sales
    const todayBills = await Bill.find({
      user: req.userId,
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'completed'
    });

    const todaySales = todayBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const todayTransactions = todayBills.length;

    // Total products
    const totalProducts = await Product.countDocuments({ user: req.userId });

    // Low stock products
    const lowStockProducts = await Product.find({ user: req.userId, quantity: { $lt: 5 } });

    // Total revenue (all time)
    const allBills = await Bill.find({ user: req.userId, status: 'completed' });
    const totalRevenue = allBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    // Last 7 days revenue for chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayBills = await Bill.find({
        user: req.userId,
        createdAt: { $gte: dayStart, $lt: dayEnd },
        status: 'completed'
      });

      const dayRevenue = dayBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      last7Days.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        transactions: dayBills.length
      });
    }

    // Top selling products
    const topProducts = await Bill.aggregate([
      { $match: { user: req.userId._id || req.userId } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productName',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      todaySales,
      todayTransactions,
      totalProducts,
      totalRevenue,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map(p => ({
        name: p.name,
        quantity: p.quantity,
        id: p._id
      })),
      last7Days,
      topProducts
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
