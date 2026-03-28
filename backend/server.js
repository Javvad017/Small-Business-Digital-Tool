const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/billing',   require('./routes/billing'));
app.use('/api/sales',     require('./routes/billing'));   // alias: billing = sales
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/expenses',  require('./routes/expenses'));
app.use('/api/reports',   require('./routes/reports'));
app.use('/api/export',    require('./routes/export'));
app.use('/api/ai',        require('./routes/ai'));

app.get('/', (req, res) => res.json({ message: 'SmartBiz API ✅', version: '2.0' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => { console.error('❌ MongoDB:', err.message); process.exit(1); });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
