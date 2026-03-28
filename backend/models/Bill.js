const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  price: { type: Number, required: true },          // base price (excl. GST)
  costPrice: { type: Number, default: 0 },          // for profit tracking
  gstRate: { type: Number, default: 0 },            // GST %
  gstAmount: { type: Number, default: 0 },          // GST rupees on this item
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },       // price * qty (excl. GST)
  totalWithGst: { type: Number, required: true }    // subtotal + gstAmount
});

const billSchema = new mongoose.Schema({
  billNumber: { type: String, unique: true },
  items: [billItemSchema],
  subtotal: { type: Number, required: true },       // sum of item subtotals (excl. GST)
  totalGst: { type: Number, default: 0 },           // total GST amount
  totalAmount: { type: Number, required: true },    // final amount incl. GST
  profit: { type: Number, default: 0 },             // revenue - cost
  customerName: { type: String, default: 'Walk-in Customer' },
  customerPhone: { type: String, default: '' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'other'], default: 'cash' },
  status: { type: String, enum: ['completed', 'pending', 'cancelled'], default: 'completed' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

billSchema.pre('save', async function(next) {
  if (!this.billNumber) {
    const count = await this.constructor.countDocuments({ user: this.user });
    this.billNumber = `INV-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);
