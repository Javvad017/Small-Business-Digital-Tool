import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  ShoppingCart, Plus, Minus, Trash2, Receipt, X,
  Loader2, CheckCircle, Printer, Search, Zap, Tag
} from 'lucide-react';

/* ── Invoice Modal ──────────────────────────────────────── */
function InvoiceModal({ bill, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth:680, background:'white', padding:0, overflow:'hidden' }}>
        <div className="no-print" style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 20px', background:'linear-gradient(135deg,#10B981,#059669)'
        }}>
          <span style={{ color:'white', fontWeight:700, fontSize:14 }}>📄 Invoice — {bill.billNumber}</span>
          <div style={{ display:'flex', gap:8 }}>
            <button
              style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', color:'white', padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:12.5, fontFamily:'inherit', display:'flex', alignItems:'center', gap:5 }}
              onClick={() => window.print()}
            >
              <Printer size={13}/> Print
            </button>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'white', padding:'6px 11px', borderRadius:8, cursor:'pointer' }}>
              <X size={14}/>
            </button>
          </div>
        </div>
        <div className="invoice-container">
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:28 }}>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:'#10B981' }}>SmartBiz</div>
              <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>Business Management System</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:18, fontWeight:800 }}>INVOICE</div>
              <div style={{ fontSize:12, color:'#6B7280' }}>#{bill.billNumber}</div>
              <div style={{ fontSize:12, color:'#6B7280' }}>{new Date(bill.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</div>
            </div>
          </div>
          <div style={{ background:'#F9FAFB', borderRadius:10, padding:'12px 16px', marginBottom:22 }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>Bill To</div>
            <div style={{ fontWeight:700, fontSize:14 }}>{bill.customerName}</div>
            {bill.customerPhone && <div style={{ fontSize:12, color:'#6B7280' }}>📞 {bill.customerPhone}</div>}
            <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>Payment: {bill.paymentMethod?.toUpperCase()}</div>
          </div>
          <table className="invoice-table" style={{ marginBottom:20 }}>
            <thead>
              <tr>
                <th>#</th><th>Description</th>
                <th style={{ textAlign:'center' }}>Qty</th>
                <th style={{ textAlign:'right' }}>Price</th>
                <th style={{ textAlign:'right' }}>GST</th>
                <th style={{ textAlign:'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item,i) => (
                <tr key={i}>
                  <td style={{ color:'#9CA3AF' }}>{i+1}</td>
                  <td style={{ fontWeight:500 }}>{item.productName}</td>
                  <td style={{ textAlign:'center' }}>{item.quantity}</td>
                  <td style={{ textAlign:'right' }}>${item.price?.toFixed(2)}</td>
                  <td style={{ textAlign:'right', color:'#8B5CF6' }}>{item.gstRate||0}%</td>
                  <td style={{ textAlign:'right', fontWeight:700 }}>${item.totalWithGst?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <div style={{ width:260 }}>
              {[['Subtotal (excl. GST)', `$${bill.subtotal?.toFixed(2)}`],['Total GST', `$${bill.totalGst?.toFixed(2)}`]].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #F3F4F6', fontSize:13 }}>
                  <span style={{ color:'#6B7280' }}>{l}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', fontSize:17, fontWeight:800 }}>
                <span>TOTAL</span>
                <span style={{ color:'#10B981' }}>${bill.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign:'center', marginTop:28, paddingTop:16, borderTop:'1px solid #F3F4F6', fontSize:12, color:'#9CA3AF' }}>
            Thank you for your business! 🙏 — Generated by SmartBiz
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Cart Item ──────────────────────────────────────────── */
function CartItem({ item, onRemove, onQty }) {
  const gst = (item.price * item.cartQty * (item.gstRate||0)) / 100;
  const total = item.price * item.cartQty + gst;
  return (
    <div style={{
      background:'var(--bg-elevated)', borderRadius:14,
      padding:'12px 14px', border:'1px solid var(--border)',
      transition:'border-color 0.2s ease'
    }}
    onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(16,185,129,0.2)'}
    onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <span style={{ fontSize:13.5, fontWeight:600, color:'var(--text-primary)', flex:1 }}>{item.name}</span>
        <button onClick={() => onRemove(item._id)}
          style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:2, borderRadius:4, flexShrink:0, marginLeft:8 }}
          onMouseEnter={e=>e.currentTarget.style.color='#F87171'}
          onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}
        >
          <X size={13}/>
        </button>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <button onClick={() => onQty(item._id,-1)}
            style={{ width:26, height:26, borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-surface)', color:'var(--text-secondary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(16,185,129,0.4)';e.currentTarget.style.color='var(--neon-green)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)';}}
          ><Minus size={11}/></button>
          <span style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', minWidth:24, textAlign:'center' }}>{item.cartQty}</span>
          <button onClick={() => onQty(item._id,1)}
            style={{ width:26, height:26, borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-surface)', color:'var(--text-secondary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(16,185,129,0.4)';e.currentTarget.style.color='var(--neon-green)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)';}}
          ><Plus size={11}/></button>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:14, fontWeight:800, color:'var(--neon-green)' }}>${total.toFixed(2)}</div>
          {gst > 0 && <div style={{ fontSize:10.5, color:'var(--text-purple)' }}>GST ${gst.toFixed(2)}</div>}
        </div>
      </div>
    </div>
  );
}

/* ── Main Billing Page ──────────────────────────────────── */
export default function Billing() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [billGenerated, setBillGenerated] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [search, setSearch] = useState('');

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data.filter(p => p.quantity > 0));
    } catch (err) {
      toast.error('Failed to load products: ' + (err.response?.data?.message || err.message));
    } finally { setProductsLoading(false); }
  };

  useEffect(() => { loadProducts(); }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i._id === product._id);
      if (ex) {
        if (ex.cartQty >= product.quantity) { toast.error(`Only ${product.quantity} available`); return prev; }
        return prev.map(i => i._id === product._id ? { ...i, cartQty: i.cartQty+1 } : i);
      }
      return [...prev, { ...product, cartQty:1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i._id !== id) return i;
      const q = i.cartQty + delta;
      if (q < 1) return i;
      if (q > i.quantity) { toast.error(`Max ${i.quantity} available`); return i; }
      return { ...i, cartQty:q };
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i._id !== id));

  // Totals
  const subtotalEx = cart.reduce((s,i) => s + i.price * i.cartQty, 0);
  const totalGst   = cart.reduce((s,i) => s + (i.price * i.cartQty * (i.gstRate||0))/100, 0);
  const grandTotal = subtotalEx + totalGst;

  const handleGenerateBill = async () => {
    if (cart.length === 0) { toast.error('Add at least one product'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/billing', {
        items: cart.map(i => ({ productId:i._id, quantity:i.cartQty })),
        customerName: customerName || 'Walk-in Customer',
        customerPhone, paymentMethod
      });
      setBillGenerated(data);
      toast.success('Invoice generated! 🎉');
      setCart([]); setCustomerName(''); setCustomerPhone('');
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    } finally { setLoading(false); }
  };

  const filteredProducts = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.category||'').toLowerCase().includes(search.toLowerCase()))
    : products;

  const paymentIcons = { cash:'💵', card:'💳', upi:'📱', other:'🔄' };

  return (
    <div className="page-content" style={{ maxWidth:'none' }}>
      {showInvoice && billGenerated && <InvoiceModal bill={billGenerated} onClose={() => setShowInvoice(false)}/>}

      {/* Header */}
      <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <h1 className="page-title">Billing & POS</h1>
          <p className="page-sub">Select products · Add to cart · Generate invoice</p>
        </div>
        {billGenerated && !showInvoice && (
          <div style={{
            display:'flex', alignItems:'center', gap:12, padding:'12px 18px',
            background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)',
            borderRadius:14
          }}>
            <CheckCircle size={18} color="var(--neon-green)"/>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--neon-green)' }}>{billGenerated.billNumber}</div>
              <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>${billGenerated.totalAmount?.toFixed(2)}</div>
            </div>
            <button className="btn-primary" style={{ fontSize:12, padding:'7px 14px' }} onClick={() => setShowInvoice(true)}>
              <Printer size={12}/> Invoice
            </button>
            <button className="btn-secondary" style={{ fontSize:12, padding:'7px 12px' }} onClick={() => setBillGenerated(null)}>
              New Bill
            </button>
          </div>
        )}
      </div>

      {/* POS Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:22, alignItems:'start' }}>

        {/* ── Left: Products ── */}
        <div className="glass-card" style={{ padding:24 }}>
          {/* Search */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>
              Products <span style={{ color:'var(--text-muted)', fontWeight:400, fontSize:12 }}>({filteredProducts.length} in stock)</span>
            </h2>
            <div style={{ position:'relative', width:200 }}>
              <Search size={13} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
              <input
                className="form-input"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft:32, height:36, fontSize:13 }}
              />
            </div>
          </div>

          {productsLoading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height:110, borderRadius:14 }}/>)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
              <ShoppingCart size={32} style={{ margin:'0 auto 12px', display:'block', opacity:0.2 }}/>
              <p style={{ fontWeight:600, marginBottom:4 }}>No products in stock</p>
              <p style={{ fontSize:12 }}>Add products in Inventory first</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
              {filteredProducts.map(p => {
                const inCart = cart.find(i => i._id === p._id);
                const priceWithGst = p.price * (1 + (p.gstRate||0)/100);
                return (
                  <div key={p._id}
                    className={`product-card ${inCart ? 'in-cart' : ''}`}
                    onClick={() => addToCart(p)}
                  >
                    {inCart && (
                      <div style={{
                        position:'absolute', top:8, right:8,
                        background:'var(--neon-green)', color:'#0B0F19',
                        borderRadius:20, fontSize:10, fontWeight:800,
                        padding:'2px 8px', zIndex:1
                      }}>
                        {inCart.cartQty}×
                      </div>
                    )}
                    <div style={{
                      width:32, height:32, borderRadius:9, marginBottom:10,
                      background:`rgba(${p.category==='Electronics'?'139,92,246':p.category==='Office'?'16,185,129':p.category==='Health'?'239,68,68':'245,158,11'},0.12)`,
                      border:`1px solid rgba(${p.category==='Electronics'?'139,92,246':p.category==='Office'?'16,185,129':p.category==='Health'?'239,68,68':'245,158,11'},0.25)`,
                      display:'flex', alignItems:'center', justifyContent:'center'
                    }}>
                      <Tag size={14} color={p.category==='Electronics'?'#A78BFA':p.category==='Office'?'#10B981':p.category==='Health'?'#F87171':'#FCD34D'} strokeWidth={2}/>
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:6, lineHeight:1.3 }}>{p.name}</div>
                    <div style={{ fontSize:17, fontWeight:800, color:'var(--neon-green)', marginBottom:2 }}>
                      ${priceWithGst.toFixed(2)}
                    </div>
                    {p.gstRate > 0 && (
                      <div style={{ fontSize:10, color:'var(--text-purple)', marginBottom:4 }}>incl. {p.gstRate}% GST</div>
                    )}
                    <div style={{
                      fontSize:10.5, fontWeight:600,
                      color: p.quantity < 5 ? '#FCD34D' : 'var(--text-muted)'
                    }}>
                      {p.quantity < 5 && '⚠ '}{p.quantity} in stock
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: Cart ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:14, position:'sticky', top:80 }}>
          {/* Cart */}
          <div className="glass-card" style={{ padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h2 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:7 }}>
                <ShoppingCart size={15} color="var(--neon-green)"/>
                Cart
                {cart.length > 0 && (
                  <span style={{ background:'var(--neon-green)', color:'#0B0F19', borderRadius:20, padding:'1px 8px', fontSize:11, fontWeight:800 }}>
                    {cart.length}
                  </span>
                )}
              </h2>
              {cart.length > 0 && (
                <button onClick={() => setCart([])}
                  style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:11.5, fontWeight:500 }}
                  onMouseEnter={e=>e.currentTarget.style.color='#F87171'}
                  onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}
                >Clear all</button>
              )}
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign:'center', padding:'28px 0', color:'var(--text-muted)' }}>
                <ShoppingCart size={22} style={{ margin:'0 auto 8px', display:'block', opacity:0.2 }}/>
                <p style={{ fontSize:13 }}>Click a product to add</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:300, overflowY:'auto' }}>
                {cart.map(item => (
                  <CartItem key={item._id} item={item} onRemove={removeFromCart} onQty={updateQty}/>
                ))}
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="glass-card" style={{ padding:20 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label className="form-label">Customer Name</label>
                <input className="form-input" placeholder="Walk-in Customer" value={customerName} onChange={e=>setCustomerName(e.target.value)} style={{ height:38 }}/>
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+91 98765 43210" value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} style={{ height:38 }}/>
              </div>
              <div>
                <label className="form-label">Payment</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {['cash','card','upi','other'].map(m => (
                    <button key={m} onClick={() => setPaymentMethod(m)}
                      style={{
                        padding:'8px 0', borderRadius:10, border:'1px solid',
                        cursor:'pointer', fontFamily:'inherit', fontSize:12.5, fontWeight:600,
                        transition:'all 0.2s ease',
                        background: paymentMethod===m ? 'rgba(16,185,129,0.12)' : 'var(--bg-elevated)',
                        borderColor: paymentMethod===m ? 'rgba(16,185,129,0.4)' : 'var(--border)',
                        color: paymentMethod===m ? 'var(--neon-green)' : 'var(--text-muted)',
                        boxShadow: paymentMethod===m ? 'var(--glow-sm-green)' : 'none'
                      }}
                    >
                      {paymentIcons[m]} {m.charAt(0).toUpperCase()+m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Totals + Generate */}
          <div className="glass-card" style={{ padding:20, border:'1px solid rgba(16,185,129,0.15)' }}>
            {/* Breakdown */}
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-muted)' }}>
                <span>Subtotal</span><span>${subtotalEx.toFixed(2)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-purple)' }}>
                <span>GST</span><span>${totalGst.toFixed(2)}</span>
              </div>
              <div style={{ height:1, background:'var(--border)', margin:'4px 0' }}/>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:22, fontWeight:900, letterSpacing:'-0.03em' }}>
                <span style={{ color:'var(--text-primary)' }}>Total</span>
                <span style={{ color:'var(--neon-green)', textShadow:'0 0 20px rgba(16,185,129,0.4)' }}>
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleGenerateBill}
              disabled={loading || cart.length === 0}
              style={{ width:'100%', justifyContent:'center', fontSize:14, padding:'13px 0', borderRadius:12, letterSpacing:'0.01em' }}
            >
              {loading ? <Loader2 size={16} className="spinner"/> : <Zap size={16}/>}
              {loading ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
