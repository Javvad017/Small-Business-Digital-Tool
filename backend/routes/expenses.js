const express = require('express');
const Expense = require('../models/Expense');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET /api/expenses  (optional ?from=&to=)
router.get('/', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = { user: req.userId };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) { const d = new Date(to); d.setHours(23,59,59,999); query.date.$lte = d; }
    }
    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/expenses
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const expense = new Expense({ ...req.body, user: req.userId });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: 'Not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
