const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  costPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

const purchaseSchema = new mongoose.Schema({
  purchaseNumber: { type: String, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  supplierName: { type: String, default: 'Direct Purchase' },
  items: [purchaseItemSchema],
  totalAmount: { type: Number, required: true },
  notes: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

purchaseSchema.pre('save', async function(next) {
  if (!this.purchaseNumber) {
    const count = await this.constructor.countDocuments({ user: this.user });
    this.purchaseNumber = `PO-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Purchase', purchaseSchema);
