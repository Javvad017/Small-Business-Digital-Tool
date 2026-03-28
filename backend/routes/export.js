const express = require('express');
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const Expense = require('../models/Expense');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Helper: convert array to CSV string
function toCSV(headers, rows) {
  const escape = (val) => {
    const str = val == null ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [headers.join(','), ...rows.map(r => r.map(escape).join(','))];
  return lines.join('\r\n');
}

// Middleware: support token via query param (for window.location.href downloads)
const authOrQuery = (req, res, next) => {
  const jwt = require('jsonwebtoken');
  let token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) token = req.query.token;
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET /api/export/sales?from=&to=
router.get('/sales', authOrQuery, async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = { user: req.userId, status: 'completed' };
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) { const d = new Date(to); d.setHours(23,59,59,999); query.createdAt.$lte = d; }
    }
    const bills = await Bill.find(query).sort({ createdAt: -1 });

    const headers = ['Bill No', 'Date', 'Customer', 'Payment', 'Subtotal', 'GST', 'Total', 'Profit'];
    const rows = bills.map(b => [
      b.billNumber,
      new Date(b.createdAt).toLocaleDateString(),
      b.customerName,
      b.paymentMethod,
      b.subtotal?.toFixed(2),
      b.totalGst?.toFixed(2),
      b.totalAmount?.toFixed(2),
      b.profit?.toFixed(2)
    ]);

    const csv = toCSV(headers, rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sales.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/export/inventory
router.get('/inventory', authOrQuery, async (req, res) => {
  try {
    const products = await Product.find({ user: req.userId }).populate('supplier', 'name');
    const headers = ['Name', 'Category', 'Selling Price', 'Cost Price', 'GST %', 'Quantity', 'Stock Value', 'Supplier'];
    const rows = products.map(p => [
      p.name, p.category,
      p.price?.toFixed(2),
      p.costPrice?.toFixed(2),
      p.gstRate || 0,
      p.quantity,
      ((p.costPrice || 0) * p.quantity).toFixed(2),
      p.supplier?.name || 'N/A'
    ]);
    const csv = toCSV(headers, rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/export/expenses?from=&to=
router.get('/expenses', authOrQuery, async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = { user: req.userId };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) { const d = new Date(to); d.setHours(23,59,59,999); query.date.$lte = d; }
    }
    const expenses = await Expense.find(query).sort({ date: -1 });
    const headers = ['Date', 'Title', 'Category', 'Amount', 'Description'];
    const rows = expenses.map(e => [
      new Date(e.date).toLocaleDateString(),
      e.title, e.category,
      e.amount?.toFixed(2),
      e.description || ''
    ]);
    const csv = toCSV(headers, rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
