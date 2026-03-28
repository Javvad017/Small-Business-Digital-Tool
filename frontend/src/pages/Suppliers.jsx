import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, Truck, Phone, MapPin, Hash } from 'lucide-react';

const EMPTY = { name:'', phone:'', email:'', address:'', company:'', gstNumber:'', notes:'' };

function SupplierModal({ supplier, onClose, onSave }) {
  const [form, setForm] = useState(supplier || EMPTY);
  const [loading, setLoading] = useState(false);
  const h = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      let res;
      if (supplier?._id) { res = await api.put(`/suppliers/${supplier._id}`, form); toast.success('Supplier updated!'); }
      else { res = await api.post('/suppliers', form); toast.success('Supplier added!'); }
      onSave(res.data, !!supplier?._id);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <h2 style={{ fontSize:17, fontWeight:700, color:'var(--text-primary)' }}>{supplier?._id ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}><X size={19} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label className="form-label">Supplier Name *</label>
              <input className="form-input" name="name" placeholder="ABC Supplies" value={form.name} onChange={h} required />
            </div>
            <div>
              <label className="form-label">Company</label>
              <input className="form-input" name="company" placeholder="Company Ltd." value={form.company} onChange={h} />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone" placeholder="+1 555 0000" value={form.phone} onChange={h} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" name="email" type="email" placeholder="supplier@email.com" value={form.email} onChange={h} />
            </div>
          </div>
          <div>
            <label className="form-label">GST Number</label>
            <input className="form-input" name="gstNumber" placeholder="GST/Tax registration number" value={form.gstNumber} onChange={h} />
          </div>
          <div>
            <label className="form-label">Address</label>
            <input className="form-input" name="address" placeholder="Full address" value={form.address} onChange={h} />
          </div>
          <div>
            <label className="form-label">Notes</label>
            <input className="form-input" name="notes" placeholder="Any notes about this supplier" value={form.notes} onChange={h} />
          </div>
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button className="btn-secondary" type="button" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</button>
            <button className="btn-primary" type="submit" disabled={loading} style={{ flex:1, justifyContent:'center' }}>
              {loading && <Loader2 size={14} className="spinner" />}
              {loading ? 'Saving...' : supplier?._id ? 'Update' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);

  const fetch = async () => {
    try { const { data } = await api.get('/suppliers'); setSuppliers(data); }
    catch { toast.error('Failed to load suppliers'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    try { await api.delete(`/suppliers/${id}`); setSuppliers(p => p.filter(x => x._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const handleSave = (saved, isEdit) => {
    setSuppliers(p => isEdit ? p.map(x => x._id === saved._id ? saved : x) : [saved, ...p]);
    setShowModal(false); setEditSupplier(null);
  };

  return (
    <div className="page-content">
      <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-sub">{suppliers.length} vendors registered</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditSupplier(null); setShowModal(true); }}><Plus size={15} /> Add Supplier</button>
      </div>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:160, borderRadius:14 }} />)}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="glass-card" style={{ padding:60, textAlign:'center', color:'var(--text-muted)' }}>
          <Truck size={36} style={{ margin:'0 auto 10px', display:'block', opacity:.3 }} />
          <p style={{ fontWeight:600 }}>No suppliers yet</p>
          <p style={{ fontSize:13, marginTop:4 }}>Add your first supplier to start tracking</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:16 }}>
          {suppliers.map(s => (
            <div key={s._id} className="glass-card" style={{ padding:20 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))', border:'1px solid rgba(99,102,241,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Truck size={17} color="#a5b4fc" />
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>{s.name}</div>
                    {s.company && <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>{s.company}</div>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn-secondary" style={{ padding:'5px 9px', fontSize:12 }} onClick={() => { setEditSupplier(s); setShowModal(true); }}><Pencil size={12} /></button>
                  <button className="btn-danger" onClick={() => handleDelete(s._id)}><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:7, fontSize:12.5, color:'var(--text-secondary)' }}>
                {s.phone && <div style={{ display:'flex', alignItems:'center', gap:7 }}><Phone size={12} color="var(--text-muted)" />{s.phone}</div>}
                {s.address && <div style={{ display:'flex', alignItems:'center', gap:7 }}><MapPin size={12} color="var(--text-muted)" />{s.address}</div>}
                {s.gstNumber && <div style={{ display:'flex', alignItems:'center', gap:7 }}><Hash size={12} color="var(--text-muted)" />{s.gstNumber}</div>}
                {s.notes && <div style={{ padding:'7px 10px', background:'var(--bg-hover)', borderRadius:8, fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{s.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <SupplierModal supplier={editSupplier} onClose={() => { setShowModal(false); setEditSupplier(null); }} onSave={handleSave} />}
    </div>
  );
}
