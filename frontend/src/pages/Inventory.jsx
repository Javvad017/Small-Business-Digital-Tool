import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, AlertTriangle, Package, X, Loader2, Download, ChevronDown } from 'lucide-react';

const CATEGORIES = ['General','Electronics','Clothing','Food & Beverages','Health','Office','Other'];
const GST_RATES   = [0, 5, 12, 18, 28];
const EMPTY       = { name:'', price:'', costPrice:'', quantity:'', gstRate:0, category:'General', description:'', supplier:'' };

/* ── Product Modal ──────────────────────────────────────── */
function ProductModal({ product, suppliers, onClose, onSave }) {
  const [form, setForm] = useState(product ? {
    ...product, supplier: product.supplier?._id || product.supplier || ''
  } : EMPTY);
  const [loading, setLoading] = useState(false);
  const h = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, supplier: form.supplier || undefined };
      let res;
      if (product?._id) { res = await api.put(`/products/${product._id}`, payload); toast.success('Product updated!'); }
      else { res = await api.post('/products', payload); toast.success('Product added!'); }
      onSave(res.data, !!product?._id);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:560 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <h2 style={{ fontSize:17, fontWeight:800, color:'var(--text-primary)' }}>
              {product?._id ? '✏️ Edit Product' : '➕ Add Product'}
            </h2>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Fill in the details below</p>
          </div>
          <button onClick={onClose} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-muted)', cursor:'pointer', padding:'6px 8px', display:'flex' }}>
            <X size={16}/>
          </button>
        </div>

        <div style={{ height:1, background:'var(--border)', marginBottom:22 }}/>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label className="form-label">Product Name *</label>
            <input className="form-input" name="name" placeholder="e.g. Wireless Mouse" value={form.name} onChange={h} required/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div>
              <label className="form-label">Sell Price *</label>
              <input className="form-input" name="price" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={h} required/>
            </div>
            <div>
              <label className="form-label">Cost Price</label>
              <input className="form-input" name="costPrice" type="number" min="0" step="0.01" placeholder="0.00" value={form.costPrice} onChange={h}/>
            </div>
            <div>
              <label className="form-label">Quantity *</label>
              <input className="form-input" name="quantity" type="number" min="0" placeholder="0" value={form.quantity} onChange={h} required/>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label className="form-label">GST Rate (%)</label>
              <select className="form-input" name="gstRate" value={form.gstRate} onChange={h}>
                {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Category</label>
              <select className="form-input" name="category" value={form.category} onChange={h}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {suppliers.length > 0 && (
            <div>
              <label className="form-label">Supplier (optional)</label>
              <select className="form-input" name="supplier" value={form.supplier} onChange={h}>
                <option value="">— No Supplier —</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="form-label">Notes</label>
            <input className="form-input" name="description" placeholder="Optional description..." value={form.description} onChange={h}/>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex:2, justifyContent:'center' }}>
              {loading && <Loader2 size={14} className="spinner"/>}
              {loading ? 'Saving...' : product?._id ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Stock Badge ────────────────────────────────────────── */
function StockBadge({ qty }) {
  if (qty === 0)  return <span className="badge badge-red">⬤ Out of Stock</span>;
  if (qty < 5)    return <span className="badge badge-yellow">⚠ Low</span>;
  return <span className="badge badge-green">✓ In Stock</span>;
}

/* ── Main Inventory ─────────────────────────────────────── */
export default function Inventory() {
  const [products, setProducts]   = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const fetchData = async () => {
    try {
      const [pr, su] = await Promise.all([api.get('/products'), api.get('/suppliers')]);
      setProducts(pr.data);
      setSuppliers(su.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(p => p.filter(x => x._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleSave = (saved, isEdit) => {
    setProducts(p => isEdit ? p.map(x => x._id === saved._id ? saved : x) : [saved, ...p]);
    setShowModal(false); setEditProduct(null);
  };

  const exportCSV = () => {
    const token = localStorage.getItem('token');
    window.location.href = `/api/export/inventory?token=${token}`;
  };

  const filtered = products.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || (p.category||'').toLowerCase().includes(search.toLowerCase());
    const mst = stockFilter==='all'
      || (stockFilter==='low' && p.quantity>0 && p.quantity<5)
      || (stockFilter==='out' && p.quantity===0)
      || (stockFilter==='ok'  && p.quantity>=5);
    return ms && mst;
  });

  const lowCount = products.filter(p => p.quantity < 5).length;

  const catColor = {
    'Electronics': '#A78BFA', 'Office': '#10B981', 'Health': '#F87171',
    'Food & Beverages': '#FBBF24', 'Clothing': '#60A5FA', 'General': '#9CA3AF', 'Other': '#FB923C'
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-sub">
            {products.length} products ·{' '}
            <span style={{ color: lowCount>0 ? '#FCD34D' : 'var(--neon-green)' }}>
              {lowCount>0 ? `${lowCount} low stock` : 'All stocked'}
            </span>
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn-secondary" onClick={exportCSV} style={{ fontSize:13 }}>
            <Download size={14}/> Export CSV
          </button>
          <button className="btn-primary" onClick={() => { setEditProduct(null); setShowModal(true); }}>
            <Plus size={15}/> Add Product
          </button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowCount > 0 && (
        <div className="low-stock-pulse" style={{
          background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)',
          borderRadius:14, padding:'12px 18px',
          display:'flex', alignItems:'center', gap:10, marginBottom:22
        }}>
          <AlertTriangle size={15} color="#FCD34D"/>
          <span style={{ color:'#FCD34D', fontSize:13, fontWeight:600 }}>
            {lowCount} item(s) need restocking — quantity below 5 units
          </span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:220 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
          <input
            className="form-input"
            placeholder="Search by name or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft:36, height:40 }}
          />
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[['all','All'],['ok','In Stock'],['low','Low'],['out','Out']].map(([val,lbl]) => (
            <button key={val} onClick={() => setStockFilter(val)}
              style={{
                padding:'9px 16px', borderRadius:10, cursor:'pointer', fontSize:12.5, fontWeight:600,
                fontFamily:'inherit', border:'1px solid',
                background: stockFilter===val ? 'rgba(16,185,129,0.1)' : 'var(--bg-elevated)',
                borderColor: stockFilter===val ? 'rgba(16,185,129,0.35)' : 'var(--border)',
                color: stockFilter===val ? 'var(--neon-green)' : 'var(--text-muted)',
                boxShadow: stockFilter===val ? 'var(--glow-sm-green)' : 'none',
                transition:'all 0.2s ease'
              }}
            >{lbl}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>
            <Loader2 size={22} className="spinner" style={{ margin:'0 auto 10px', display:'block' }}/>
            Loading inventory...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:64, textAlign:'center', color:'var(--text-muted)' }}>
            <Package size={36} style={{ margin:'0 auto 12px', display:'block', opacity:0.2 }}/>
            <p style={{ fontWeight:600, marginBottom:4 }}>No products found</p>
            <p style={{ fontSize:12 }}>Try adjusting your filters or add a new product</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Sell Price</th>
                  <th>Cost</th>
                  <th>GST</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Supplier</th>
                  <th style={{ textAlign:'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id} style={{ animation:'slideIn 0.2s ease' }}>
                    <td>
                      <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:13.5 }}>{p.name}</div>
                      {p.description && <div style={{ fontSize:11.5, color:'var(--text-muted)', marginTop:2 }}>{p.description}</div>}
                    </td>
                    <td>
                      <span style={{
                        display:'inline-flex', alignItems:'center', padding:'3px 10px',
                        borderRadius:20, fontSize:11, fontWeight:700,
                        background: {
                          Electronics:'rgba(139,92,246,0.12)', Office:'rgba(16,185,129,0.12)',
                          Health:'rgba(239,68,68,0.12)', 'Food & Beverages':'rgba(251,191,36,0.12)',
                          Clothing:'rgba(96,165,250,0.12)', General:'rgba(156,163,175,0.12)', Other:'rgba(251,146,60,0.12)'
                        }[p.category] || 'rgba(156,163,175,0.1)',
                        color: catColor[p.category] || '#9CA3AF'
                      }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ fontWeight:700, color:'var(--neon-green)', fontSize:14 }}>
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td style={{ color:'var(--text-muted)' }}>${Number(p.costPrice||0).toFixed(2)}</td>
                    <td>
                      {p.gstRate > 0
                        ? <span className="badge badge-purple">{p.gstRate}%</span>
                        : <span style={{ color:'var(--text-muted)', fontSize:12 }}>—</span>
                      }
                    </td>
                    <td>
                      <span style={{
                        fontWeight:700, fontSize:14,
                        color: p.quantity===0 ? '#F87171' : p.quantity<5 ? '#FCD34D' : 'var(--text-primary)'
                      }}>
                        {p.quantity}
                      </span>
                    </td>
                    <td><StockBadge qty={p.quantity}/></td>
                    <td style={{ fontSize:12, color:'var(--text-muted)' }}>{p.supplier?.name || '—'}</td>
                    <td>
                      <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                        <button
                          onClick={() => { setEditProduct(p); setShowModal(true); }}
                          style={{
                            padding:'6px 10px', borderRadius:8, border:'1px solid var(--border)',
                            background:'var(--bg-elevated)', color:'var(--text-secondary)', cursor:'pointer',
                            display:'flex', alignItems:'center', gap:4, fontSize:12, fontFamily:'inherit',
                            transition:'all 0.15s'
                          }}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(16,185,129,0.3)';e.currentTarget.style.color='var(--neon-green)';}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)';}}
                        >
                          <Pencil size={12}/>
                        </button>
                        <button className="btn-danger" style={{ padding:'6px 10px' }} onClick={() => handleDelete(p._id)}>
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={editProduct}
          suppliers={suppliers}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
