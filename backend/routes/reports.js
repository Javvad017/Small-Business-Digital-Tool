const express = require('express');
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const Expense = require('../models/Expense');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Helper: date range for a given day
function dayRange(date) {
  const start = new Date(date); start.setHours(0,0,0,0);
  const end   = new Date(date); end.setHours(23,59,59,999);
  return { start, end };
}

// GET /api/reports/daily?date=YYYY-MM-DD
router.get('/daily', auth, adminOnly, async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const { start, end } = dayRange(dateStr);

    const [bills, expenses, products] = await Promise.all([
      Bill.find({ user: req.userId, createdAt: { $gte: start, $lte: end }, status: 'completed' }),
      Expense.find({ user: req.userId, date: { $gte: start, $lte: end } }),
      Product.find({ user: req.userId })
    ]);

    const totalSales    = bills.reduce((s, b) => s + b.totalAmount, 0);
    const totalProfit   = bills.reduce((s, b) => s + (b.profit || 0), 0);
    const totalGst      = bills.reduce((s, b) => s + (b.totalGst || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netProfit     = totalProfit - totalExpenses;

    // Item breakdown
    const itemMap = {};
    bills.forEach(b => b.items.forEach(i => {
      if (!itemMap[i.productName]) itemMap[i.productName] = { qty: 0, revenue: 0 };
      itemMap[i.productName].qty += i.quantity;
      itemMap[i.productName].revenue += i.totalWithGst;
    }));
    const topItems = Object.entries(itemMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const lowStock = products.filter(p => p.quantity < 5).map(p => ({
      name: p.name, quantity: p.quantity
    }));

    res.json({
      date: dateStr,
      totalSales, totalProfit, totalGst, totalExpenses, netProfit,
      transactions: bills.length,
      topItems, lowStock,
      expenses: expenses.map(e => ({ title: e.title, category: e.category, amount: e.amount })),
      bills: bills.map(b => ({
        billNumber: b.billNumber, customerName: b.customerName,
        totalAmount: b.totalAmount, paymentMethod: b.paymentMethod,
        time: b.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/reports/dashboard  — main dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayBills, allBills, allExpenses, products] = await Promise.all([
      Bill.find({ user: req.userId, createdAt: { $gte: today, $lt: tomorrow }, status: 'completed' }),
      Bill.find({ user: req.userId, status: 'completed' }),
      Expense.find({ user: req.userId }),
      Product.find({ user: req.userId })
    ]);

    const todaySales = todayBills.reduce((s, b) => s + b.totalAmount, 0);
    const todayProfit = todayBills.reduce((s, b) => s + (b.profit || 0), 0);
    const totalRevenue = allBills.reduce((s, b) => s + b.totalAmount, 0);
    const totalProfit = allBills.reduce((s, b) => s + (b.profit || 0), 0);
    const totalExpenses = allExpenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = totalProfit - totalExpenses;
    const lowStockProducts = products.filter(p => p.quantity < 5);

    // Last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const dEnd = new Date(d); dEnd.setHours(23,59,59,999);
      const dayBills = allBills.filter(b => b.createdAt >= d && b.createdAt <= dEnd);
      last7Days.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: dayBills.reduce((s,b) => s + b.totalAmount, 0),
        profit: dayBills.reduce((s,b) => s + (b.profit||0), 0),
        transactions: dayBills.length
      });
    }

    // Top products
    const productMap = {};
    allBills.forEach(b => b.items.forEach(i => {
      if (!productMap[i.productName]) productMap[i.productName] = { qty: 0, revenue: 0 };
      productMap[i.productName].qty += i.quantity;
      productMap[i.productName].revenue += i.totalWithGst;
    }));
    const topProducts = Object.entries(productMap)
      .map(([name, v]) => ({ _id: name, totalQuantity: v.qty, totalRevenue: v.revenue }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 5);

    res.json({
      todaySales, todayProfit, todayTransactions: todayBills.length,
      totalRevenue, totalProfit, totalExpenses, netProfit,
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map(p => ({ name: p.name, quantity: p.quantity, id: p._id })),
      last7Days, topProducts
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
