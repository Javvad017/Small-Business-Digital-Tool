const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Virtual for low stock
productSchema.virtual('isLowStock').get(function() {
  return this.quantity < 5;
});

module.exports = mongoose.model('Product', productSchema);
