/**
 * Seed Script — populates the DB with a demo user + products + bills
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User    = require('./models/User');
const Product = require('./models/Product');
const Bill    = require('./models/Bill');

const DEMO_EMAIL    = 'demo@smartbiz.com';
const DEMO_PASSWORD = 'demo1234';

const PRODUCTS_DATA = [
  { name: 'Wireless Mouse',      price: 25.99, costPrice: 14.00, quantity: 20, gstRate: 18, category: 'Electronics',       description: 'Ergonomic wireless mouse' },
  { name: 'USB Hub (4-Port)',     price: 15.49, costPrice:  8.00, quantity:  3, gstRate: 12, category: 'Electronics',       description: '4 port USB 3.0 hub' },
  { name: 'Notebook A4',         price:  3.99, costPrice:  1.50, quantity: 50, gstRate:  5, category: 'Office',             description: '200 page ruled notebook' },
  { name: 'Blue Ballpen (box)',   price:  4.50, costPrice:  2.00, quantity:  2, gstRate:  5, category: 'Office',             description: 'Box of 12 blue ballpens' },
  { name: 'Desk Lamp',           price: 34.99, costPrice: 18.00, quantity:  8, gstRate: 18, category: 'Electronics',       description: 'LED adjustable desk lamp' },
  { name: 'Hand Sanitizer 500ml',price:  6.99, costPrice:  3.50, quantity:  0, gstRate:  0, category: 'Health',             description: '70% alcohol gel' },
  { name: 'Coffee Mug',          price:  8.99, costPrice:  4.00, quantity: 15, gstRate:  5, category: 'General',            description: 'Ceramic coffee mug 350ml' },
  { name: 'Sticky Notes Pack',   price:  2.99, costPrice:  1.20, quantity:  4, gstRate:  0, category: 'Office',             description: '100 sheets multi-colour' },
];

const CUSTOMERS = ['John D.', 'Sarah K.', 'Mike R.', 'Walk-in Customer', 'Alex P.'];
const METHODS   = ['cash', 'card', 'upi'];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Create or find demo user
    let user = await User.findOne({ email: DEMO_EMAIL });
    if (!user) {
      user = new User({ name: 'Demo User', email: DEMO_EMAIL, password: DEMO_PASSWORD, businessName: 'Demo Store', role: 'admin' });
      await user.save();
      console.log('✅ Demo user created');
    } else {
      console.log('ℹ️  Demo user already exists');
    }

    // Clear existing demo data
    await Product.deleteMany({ user: user._id });
    await Bill.deleteMany({ user: user._id });
    console.log('🗑️  Cleared existing demo data');

    // Create products
    const products = await Product.insertMany(
      PRODUCTS_DATA.map(p => ({ ...p, user: user._id }))
    );
    console.log(`✅ Created ${products.length} products`);

    // Create sample bills over last 7 days
    const bills = [];
    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      const numBills = Math.floor(Math.random() * 3) + 1;
      for (let b = 0; b < numBills; b++) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

        // Pick 1-3 in-stock products
        const inStock = products.filter(p => p.quantity > 0);
        const picked = inStock.sort(() => 0.5 - Math.random()).slice(0, Math.min(2, inStock.length));
        if (picked.length === 0) continue;

        const items = picked.map(p => {
          const qty      = Math.floor(Math.random() * 2) + 1;
          const subtotal = parseFloat((p.price * qty).toFixed(2));
          const gstAmt   = parseFloat(((subtotal * (p.gstRate || 0)) / 100).toFixed(2));
          return {
            product:      p._id,
            productName:  p.name,
            price:        p.price,
            costPrice:    p.costPrice || 0,
            gstRate:      p.gstRate || 0,
            gstAmount:    gstAmt,
            quantity:     qty,
            subtotal:     subtotal,
            totalWithGst: parseFloat((subtotal + gstAmt).toFixed(2))
          };
        });

        const subtotal    = parseFloat(items.reduce((s, i) => s + i.subtotal, 0).toFixed(2));
        const totalGst    = parseFloat(items.reduce((s, i) => s + i.gstAmount, 0).toFixed(2));
        const totalAmount = parseFloat((subtotal + totalGst).toFixed(2));
        const cost        = items.reduce((s, i) => s + (i.costPrice * i.quantity), 0);
        const profit      = parseFloat((subtotal - cost).toFixed(2));

        const bill = new Bill({
          items, subtotal, totalGst, totalAmount, profit,
          customerName:  CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)],
          paymentMethod: METHODS[Math.floor(Math.random() * METHODS.length)],
          user:          user._id,
          status:        'completed'
        });

        // Override timestamps for historical data
        await bill.save();
        await Bill.findByIdAndUpdate(bill._id, { createdAt: date, updatedAt: date });
        bills.push(bill);
      }
    }

    console.log(`✅ Created ${bills.length} sample transactions`);
    console.log('\n🎉 Seed complete!');
    console.log(`📧 Login: ${DEMO_EMAIL}`);
    console.log(`🔑 Password: ${DEMO_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
