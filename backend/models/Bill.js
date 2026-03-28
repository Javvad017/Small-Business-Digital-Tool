const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    unique: true
  },
  items: [billItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  customerName: {
    type: String,
    default: 'Walk-in Customer'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'other'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled'],
    default: 'completed'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Auto-generate bill number
billSchema.pre('save', async function(next) {
  if (!this.billNumber) {
    const count = await this.constructor.countDocuments({ user: this.user });
    this.billNumber = `BILL-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);
