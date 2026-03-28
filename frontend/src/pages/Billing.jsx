import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, Trash2, Receipt, X, Loader2, CheckCircle } from 'lucide-react';

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [billGenerated, setBillGenerated] = useState(null);

  useEffect(() => {
    api.get('/products').then(({ data }) => {
      setProducts(data.filter(p => p.quantity > 0));
    });
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) {
        if (existing.cartQty >= product.quantity) {
          toast.error(`Only ${product.quantity} available`);
          return prev;
        }
        return prev.map(i => i._id === product._id ? { ...i, cartQty: i.cartQty + 1 } : i);
      }
      return [...prev, { ...product, cartQty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev =>
      prev.map(i => {
        if (i._id !== id) return i;
        const newQty = i.cartQty + delta;
        if (newQty < 1) return i;
        if (newQty > i.quantity) { toast.error(`Max ${i.quantity} available`); return i; }
        return { ...i, cartQty: newQty };
      })
    );
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i._id !== id));

  const total = cart.reduce((sum, item) => sum + item.price * item.cartQty, 0);

  const handleGenerateBill = async () => {
    if (cart.length === 0) { toast.error('Add at least one product'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/billing', {
        items: cart.map(i => ({ productId: i._id, quantity: i.cartQty })),
        customerName: customerName || 'Walk-in Customer',
        paymentMethod
      });
      setBillGenerated(data);
      toast.success('Bill generated successfully! 🎉');
      setCart([]);
      setCustomerName('');
      // Refresh products to reflect reduced stock
      const res = await api.get('/products');
      setProducts(res.data.filter(p => p.quantity > 0));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#e2e8f0' }}>Billing</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Create bills for customers and reduce stock automatically</p>
      </div>

      {/* Bill success view */}
      {billGenerated && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 520 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <CheckCircle size={48} color="#4ade80" style={{ margin: '0 auto 12px', display: 'block' }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0' }}>Bill Generated!</h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>Transaction recorded successfully</p>
            </div>

            {/* Receipt */}
            <div className="bill-receipt">
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>SmartBiz Store</div>
                <div style={{ fontSize: 11, color: '#555' }}>{new Date(billGenerated.createdAt).toLocaleString()}</div>
                <div style={{ fontSize: 11, color: '#555' }}>Bill: {billGenerated.billNumber}</div>
                <div style={{ marginTop: 4, fontSize: 12 }}>Customer: {billGenerated.customerName}</div>
                <hr style={{ borderColor: '#ccc', margin: '8px 0' }} />
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontSize: 11, paddingBottom: 4 }}>Item</th>
                    <th style={{ textAlign: 'center', fontSize: 11 }}>Qty</th>
                    <th style={{ textAlign: 'right', fontSize: 11 }}>Price</th>
                    <th style={{ textAlign: 'right', fontSize: 11 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {billGenerated.items.map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 12, paddingTop: 4 }}>{item.productName}</td>
                      <td style={{ textAlign: 'center', fontSize: 12 }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontSize: 12 }}>${item.price.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontSize: 12, fontWeight: 700 }}>${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <hr style={{ borderColor: '#ccc', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15 }}>
                <span>TOTAL</span>
                <span>${billGenerated.totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#777' }}>
                Payment: {billGenerated.paymentMethod?.toUpperCase()} · Thank you! 🙏
              </div>
            </div>

            <button className="btn-primary" onClick={() => setBillGenerated(null)} style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
              New Bill
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        {/* Product selector */}
        <div className="glass-card" style={{ padding: 20, height: 'fit-content' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>Select Products</h2>
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <ShoppingCart size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
              <p>No products in stock. Add inventory first.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {products.map(product => {
                const inCart = cart.find(i => i._id === product._id);
                return (
                  <div
                    key={product._id}
                    onClick={() => addToCart(product)}
                    style={{
                      background: inCart ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${inCart ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 12,
                      padding: 14,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={e => !inCart && (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)')}
                    onMouseOut={e => !inCart && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{product.name}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#4ade80' }}>${Number(product.price).toFixed(2)}</div>
                    <div style={{ fontSize: 12, color: product.quantity < 5 ? '#facc15' : '#64748b', marginTop: 4 }}>
                      {product.quantity} in stock {inCart ? `· ${inCart.cartQty} in cart` : ''}
                    </div>
                    {inCart && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
                        <span style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 600 }}>Added to cart</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart / Bill summary */}
        <div>
          <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingCart size={16} color="#6366f1" />
              Cart ({cart.length} items)
            </h2>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#4b5563' }}>
                <ShoppingCart size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                <p style={{ fontSize: 13 }}>Click products to add them</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cart.map(item => (
                  <div key={item._id} style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 10,
                    padding: '10px 12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{item.name}</span>
                      <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer' }}>
                        <X size={14} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => updateQty(item._id, -1)} style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', minWidth: 20, textAlign: 'center' }}>{item.cartQty}</span>
                        <button onClick={() => updateQty(item._id, 1)} style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#4ade80' }}>${(item.price * item.cartQty).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bill details */}
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Customer Name</label>
              <input className="form-input" placeholder="Walk-in Customer" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Payment Method</label>
              <select className="form-input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="cash">💵 Cash</option>
                <option value="card">💳 Card</option>
                <option value="upi">📱 UPI</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Total */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14
            }}>
              <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>Total Amount</span>
              <span style={{ fontSize: 24, color: '#4ade80', fontWeight: 800 }}>${total.toFixed(2)}</span>
            </div>

            <button
              className="btn-primary"
              onClick={handleGenerateBill}
              disabled={loading || cart.length === 0}
              style={{ width: '100%', justifyContent: 'center', opacity: cart.length === 0 ? 0.5 : 1 }}
            >
              {loading ? <Loader2 size={16} className="spinner" /> : <Receipt size={16} />}
              {loading ? 'Generating...' : 'Generate Bill'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
