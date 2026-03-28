import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Minus, Trash2, X, Loader2, ShoppingBag } from 'lucide-react';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ productId:'', quantity:1, costPrice:'' }]);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try {
      const [pur, pro, sup] = await Promise.all([api.get('/purchases'), api.get('/products'), api.get('/suppliers')]);
      setPurchases(pur.data); setProducts(pro.data); setSuppliers(sup.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const addItem = () => setItems(p => [...p, { productId:'', quantity:1, costPrice:'' }]);
  const removeItem = (i) => setItems(p => p.filter((_,idx) => idx !== i));
  const updateItem = (i, field, val) => setItems(p => p.map((it,idx) => idx===i ? {...it,[field]:val} : it));

  const handleProductChange = (i, productId) => {
    const product = products.find(p => p._id === productId);
    setItems(p => p.map((it,idx) => idx===i ? { ...it, productId, costPrice: product?.costPrice || '' } : it));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some(i => !i.productId || !i.costPrice || i.quantity < 1)) {
      toast.error('Fill all item fields'); return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/purchases', {
        supplierId: supplierId || undefined,
        supplierName: supplierName || undefined,
        items: items.map(i => ({ productId: i.productId, quantity: Number(i.quantity), costPrice: Number(i.costPrice) })),
        notes
      });
      setPurchases(p => [data, ...p]);
      toast.success('Purchase recorded! Stock updated. ✅');
      setShowForm(false); setItems([{ productId:'', quantity:1, costPrice:'' }]);
      setSupplierId(''); setSupplierName(''); setNotes('');
      // Refresh products
      const res = await api.get('/products'); setProducts(res.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const totalCost = items.reduce((s,i) => s + (Number(i.costPrice)||0) * (Number(i.quantity)||0), 0);

  return (
    <div className="page-content">
      <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title">Purchases (Stock In)</h1>
          <p className="page-sub">Record stock purchases and automatically increase inventory</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> New Purchase</button>
      </div>

      {/* New Purchase Form */}
      {showForm && (
        <div className="glass-card" style={{ padding:22, marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>Record New Purchase</h2>
            <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
              <div>
                <label className="form-label">Supplier (optional)</label>
                <select className="form-input" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                  <option value="">— Select Supplier —</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              {!supplierId && (
                <div>
                  <label className="form-label">Supplier Name (manual)</label>
                  <input className="form-input" placeholder="e.g. Local Market" value={supplierName} onChange={e => setSupplierName(e.target.value)} />
                </div>
              )}
            </div>

            {/* Items */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <label className="form-label" style={{ marginBottom:0 }}>Purchase Items</label>
                <button type="button" className="btn-secondary" style={{ padding:'5px 12px', fontSize:12.5 }} onClick={addItem}><Plus size={12} /> Add Row</button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:10, alignItems:'center' }}>
                    <select className="form-input" value={item.productId} onChange={e => handleProductChange(i, e.target.value)} required>
                      <option value="">— Select Product —</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name} (stock: {p.quantity})</option>)}
                    </select>
                    <input className="form-input" type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i,'quantity',e.target.value)} required />
                    <input className="form-input" type="number" min="0" step="0.01" placeholder="Cost/unit" value={item.costPrice} onChange={e => updateItem(i,'costPrice',e.target.value)} required />
                    <button type="button" className="btn-danger" onClick={() => removeItem(i)} style={{ padding:'8px 10px' }}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label className="form-label">Notes</label>
              <input className="form-input" placeholder="Optional purchase notes" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:15, fontWeight:800, color:'var(--text-primary)' }}>
                Total Cost: <span style={{ color:'#f87171' }}>${totalCost.toFixed(2)}</span>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving && <Loader2 size={14} className="spinner" />}
                  {saving ? 'Saving...' : 'Record Purchase & Update Stock'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Purchase history */}
      <div className="glass-card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}><Loader2 size={22} className="spinner" style={{ margin:'0 auto 8px', display:'block' }} />Loading...</div>
        ) : purchases.length === 0 ? (
          <div style={{ padding:60, textAlign:'center', color:'var(--text-muted)' }}>
            <ShoppingBag size={36} style={{ margin:'0 auto 10px', display:'block', opacity:.3}} />
            <p style={{ fontWeight:600 }}>No purchases recorded yet</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead><tr><th>Purchase #</th><th>Date</th><th>Supplier</th><th>Items</th><th>Total Cost</th></tr></thead>
              <tbody>
                {purchases.map(p => (
                  <tr key={p._id}>
                    <td><span style={{ fontFamily:'monospace', color:'#a5b4fc', fontSize:12.5 }}>{p.purchaseNumber}</span></td>
                    <td style={{ color:'var(--text-secondary)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight:500, color:'var(--text-primary)' }}>{p.supplierName}</td>
                    <td style={{ color:'var(--text-secondary)' }}>
                      {p.items?.map((item, i) => (
                        <div key={i} style={{ fontSize:12 }}>{item.productName} × {item.quantity}</div>
                      ))}
                    </td>
                    <td style={{ fontWeight:700, color:'#f87171' }}>${p.totalAmount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
