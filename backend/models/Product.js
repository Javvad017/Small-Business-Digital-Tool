const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },        // selling price
  costPrice: { type: Number, default: 0, min: 0 },        // purchase/cost price
  quantity: { type: Number, required: true, min: 0, default: 0 },
  gstRate: { type: Number, default: 0, min: 0, max: 100 }, // GST % e.g. 18
  category: { type: String, default: 'General', trim: true },
  description: { type: String, default: '' },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
