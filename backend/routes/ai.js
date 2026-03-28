const express = require('express');
const OpenAI = require('openai');
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route  POST /api/ai/chat
// @desc   AI assistant powered by OpenAI
router.post('/chat', auth, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    // Gather business context data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch real data for AI context
    const [products, todayBills, allBills, lowStockProducts] = await Promise.all([
      Product.find({ user: req.userId }),
      Bill.find({ user: req.userId, createdAt: { $gte: today, $lt: tomorrow }, status: 'completed' }),
      Bill.find({ user: req.userId, status: 'completed' }).sort({ createdAt: -1 }).limit(10),
      Product.find({ user: req.userId, quantity: { $lt: 5 } })
    ]);

    const todaySales = todayBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalRevenue = allBills.reduce((sum, b) => sum + b.totalAmount, 0);

    // Build context string
    const businessContext = `
You are an AI business assistant for a small business. Here is the current business data:

TODAY'S STATS:
- Today's Total Sales: $${todaySales.toFixed(2)}
- Today's Transactions: ${todayBills.length}

INVENTORY (${products.length} products total):
${products.map(p => `- ${p.name}: ${p.quantity} units @ $${p.price} each (${p.quantity < 5 ? '⚠️ LOW STOCK' : 'OK'})`).join('\n')}

LOW STOCK ALERTS (quantity < 5):
${lowStockProducts.length === 0 ? 'None - all products are well stocked!' : lowStockProducts.map(p => `- ${p.name}: ${p.quantity} units remaining`).join('\n')}

RECENT TRANSACTIONS:
${allBills.slice(0, 5).map(b => `- Bill ${b.billNumber}: $${b.totalAmount.toFixed(2)} on ${new Date(b.createdAt).toLocaleDateString()}`).join('\n')}

OVERALL REVENUE: $${totalRevenue.toFixed(2)}

Answer the user's question based on this data. Be concise, helpful, and use bullet points where appropriate. If asked for advice, provide actionable suggestions.
    `;

    // Check if OpenAI key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      // Fallback responses without OpenAI
      const fallbackResponse = generateFallbackResponse(message, {
        todaySales,
        todayTransactions: todayBills.length,
        products,
        lowStockProducts,
        totalRevenue,
        allBills
      });
      return res.json({ reply: fallbackResponse });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: businessContext },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('AI Error:', err.message);
    res.status(500).json({ message: 'AI service error', error: err.message });
  }
});

// Smart fallback responses when OpenAI key not configured
function generateFallbackResponse(message, data) {
  const msg = message.toLowerCase();

  if (msg.includes('sales') || msg.includes('revenue') || msg.includes('today')) {
    return `📊 **Today's Sales Summary:**\n- Total Sales: $${data.todaySales.toFixed(2)}\n- Transactions: ${data.todayTransactions}\n- All-time Revenue: $${data.totalRevenue.toFixed(2)}`;
  }

  if (msg.includes('low stock') || msg.includes('stock') || msg.includes('inventory')) {
    if (data.lowStockProducts.length === 0) {
      return `✅ **Great news!** All ${data.products.length} products are well stocked. No items below 5 units.`;
    }
    const items = data.lowStockProducts.map(p => `• ${p.name}: ${p.quantity} units`).join('\n');
    return `⚠️ **Low Stock Alert!** ${data.lowStockProducts.length} product(s) need restocking:\n${items}`;
  }

  if (msg.includes('product') || msg.includes('item')) {
    return `📦 **Inventory Summary:**\n- Total Products: ${data.products.length}\n- Low Stock Items: ${data.lowStockProducts.length}\n${data.products.slice(0, 5).map(p => `• ${p.name}: ${p.quantity} units`).join('\n')}`;
  }

  if (msg.includes('transaction') || msg.includes('bill') || msg.includes('order')) {
    const recent = data.allBills.slice(0, 3);
    if (recent.length === 0) {
      return `📋 No transactions found yet. Start billing to see your order history!`;
    }
    const items = recent.map(b => `• ${b.billNumber}: $${b.totalAmount.toFixed(2)}`).join('\n');
    return `📋 **Recent Transactions:**\n${items}\n\nTotal Revenue: $${data.totalRevenue.toFixed(2)}`;
  }

  if (msg.includes('help')) {
    return `🤖 **I can help you with:**\n• Today's sales & revenue\n• Low stock alerts\n• Inventory overview\n• Transaction history\n\nTry asking: "What are today's sales?" or "Which products are low in stock?"`;
  }

  return `🤖 Hi! I'm your business assistant. I have access to your real-time business data.\n\n**Quick Stats:**\n• Today's Sales: $${data.todaySales.toFixed(2)}\n• Total Products: ${data.products.length}\n• Low Stock Items: ${data.lowStockProducts.length}\n\nAsk me about sales, inventory, or transactions!`;
}

module.exports = router;
