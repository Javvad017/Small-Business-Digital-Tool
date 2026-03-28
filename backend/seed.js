/**
 * Seed Script — populates the DB with a demo user + products + bills
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Bill = require('./models/Bill');

const DEMO_EMAIL = 'demo@smartbiz.com';
const DEMO_PASSWORD = 'demo1234';

const PRODUCTS_DATA = [
  { name: 'Wireless Mouse', price: 25.99, quantity: 20, category: 'Electronics', description: 'Ergonomic wireless mouse' },
  { name: 'USB Hub (4-Port)', price: 15.49, quantity: 3, category: 'Electronics', description: '4 port USB 3.0 hub' },
  { name: 'Notebook A4', price: 3.99, quantity: 50, category: 'Office', description: '200 page ruled notebook' },
  { name: 'Blue Ballpen (box)', price: 4.50, quantity: 2, category: 'Office', description: 'Box of 12 blue ballpens' },
  { name: 'Desk Lamp', price: 34.99, quantity: 8, category: 'Electronics', description: 'LED adjustable desk lamp' },
  { name: 'Hand Sanitizer 500ml', price: 6.99, quantity: 0, category: 'Health', description: '70% alcohol gel' },
  { name: 'Coffee Mug', price: 8.99, quantity: 15, category: 'General', description: 'Ceramic coffee mug 350ml' },
  { name: 'Sticky Notes Pack', price: 2.99, quantity: 4, category: 'Office', description: '100 sheets multi-colour' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Create or find demo user
    let user = await User.findOne({ email: DEMO_EMAIL });
    if (!user) {
      user = new User({ name: 'Demo User', email: DEMO_EMAIL, password: DEMO_PASSWORD, businessName: 'Demo Store' });
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
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(10 + Math.floor(Math.random() * 8), 0, 0, 0);

      const numBills = Math.floor(Math.random() * 3) + 1;
      for (let b = 0; b < numBills; b++) {
        const selectedProducts = products.sort(() => 0.5 - Math.random()).slice(0, 2);
        const items = selectedProducts.map(p => ({
          product: p._id,
          productName: p.name,
          price: p.price,
          quantity: Math.floor(Math.random() * 2) + 1,
          subtotal: 0
        }));
        items.forEach(i => { i.subtotal = i.price * i.quantity; });
        const totalAmount = items.reduce((s, i) => s + i.subtotal, 0);

        const bill = new Bill({
          items,
          totalAmount,
          customerName: ['John D.', 'Sarah K.', 'Mike R.', 'Walk-in Customer', 'Alex P.'][Math.floor(Math.random() * 5)],
          paymentMethod: ['cash', 'card', 'upi'][Math.floor(Math.random() * 3)],
          user: user._id,
          status: 'completed',
          createdAt: date,
          updatedAt: date
        });
        bills.push(bill);
      }
    }

    for (const bill of bills) {
      await bill.save();
    }
    console.log(`✅ Created ${bills.length} sample transactions`);

    console.log('\n🎉 Seed complete!');
    console.log(`📧 Login: ${DEMO_EMAIL}`);
    console.log(`🔑 Password: ${DEMO_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
