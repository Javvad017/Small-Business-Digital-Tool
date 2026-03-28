import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, CreditCard, Download, Calendar } from 'lucide-react';

const CATEGORIES = ['Rent','Electricity','Water','Salaries','Marketing','Maintenance','Transport','Packaging','Other'];
const CAT_COLORS = { Rent:'badge-blue', Electricity:'badge-yellow', Water:'badge-blue', Salaries:'badge-purple', Marketing:'badge-orange', Maintenance:'badge-yellow', Transport:'badge-green', Packaging:'badge-blue', Other:'badge-yellow' };
const EMPTY = { title:'', amount:'', category:'Other', description:'', date: new Date().toISOString().split('T')[0] };

function ExpenseModal({ expense, onClose, onSave }) {
  const [form, setForm] = useState(expense ? { ...expense, date: expense.date?.split('T')[0] || EMPTY.date } : EMPTY);
  const [loading, setLoading] = useState(false);
  const h = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      let res;
      if (expense?._id) { res = await api.put(`/expenses/${expense._id}`, form); toast.success('Expense updated!'); }
      else { res = await api.post('/expenses', form); toast.success('Expense added!'); }
      onSave(res.data, !!expense?._id);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <h2 style={{ fontSize:17, fontWeight:700, color:'var(--text-primary)' }}>{expense?._id ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}><X size={19} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <div>
            <label className="form-label">Expense Title *</label>
            <input className="form-input" name="title" placeholder="e.g. Monthly Rent" value={form.title} onChange={h} required />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label className="form-label">Amount ($) *</label>
              <input className="form-input" name="amount" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={h} required />
            </div>
            <div>
              <label className="form-label">Date</label>
              <input className="form-input" name="date" type="date" value={form.date} onChange={h} />
            </div>
          </div>
          <div>
            <label className="form-label">Category</label>
            <select className="form-input" name="category" value={form.category} onChange={h}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Description</label>
            <input className="form-input" name="description" placeholder="Optional details" value={form.description} onChange={h} />
          </div>
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button className="btn-secondary" type="button" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</button>
            <button className="btn-primary" type="submit" disabled={loading} style={{ flex:1, justifyContent:'center' }}>
              {loading && <Loader2 size={14} className="spinner" />}
              {loading ? 'Saving...' : expense?._id ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const { data } = await api.get(`/expenses?${params}`);
      setExpenses(data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [from, to]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try { await api.delete(`/expenses/${id}`); setExpenses(p => p.filter(x => x._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const handleSave = (saved, isEdit) => {
    setExpenses(p => isEdit ? p.map(x => x._id === saved._id ? saved : x) : [saved, ...p]);
    setShowModal(false); setEditExpense(null);
  };

  const exportCSV = () => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    window.location.href = `/api/export/expenses?${params}`;
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  // Group by category
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="page-content">
      <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-sub">{expenses.length} records · Total: <span style={{ color:'#f87171' }}>${total.toFixed(2)}</span></p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn-secondary" onClick={exportCSV}><Download size={14} /> Export CSV</button>
          <button className="btn-primary" onClick={() => { setEditExpense(null); setShowModal(true); }}><Plus size={15} /> Add Expense</button>
        </div>
      </div>

      {/* Category summary cards */}
      {Object.keys(byCategory).length > 0 && (
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
          {Object.entries(byCategory).sort((a,b) => b[1]-a[1]).map(([cat, amt]) => (
            <div key={cat} style={{
              background:'var(--bg-card)', border:'1px solid var(--border)',
              borderRadius:10, padding:'10px 14px',
              display:'flex', alignItems:'center', gap:8
            }}>
              <span className={`badge ${CAT_COLORS[cat]||'badge-yellow'}`}>{cat}</span>
              <span style={{ fontWeight:700, color:'var(--text-primary)', fontSize:14 }}>${amt.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Date filter */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <Calendar size={14} color="var(--text-muted)" />
        <input className="form-input" type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ width:150 }} />
        <span style={{ color:'var(--text-muted)', fontSize:12 }}>to</span>
        <input className="form-input" type="date" value={to} onChange={e => setTo(e.target.value)} style={{ width:150 }} />
        {(from||to) && <button className="btn-secondary" style={{ padding:'8px 12px', fontSize:12.5 }} onClick={() => { setFrom(''); setTo(''); }}>Clear</button>}
      </div>

      <div className="glass-card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}><Loader2 size={22} className="spinner" style={{ margin:'0 auto 8px', display:'block' }} />Loading...</div>
        ) : expenses.length === 0 ? (
          <div style={{ padding:60, textAlign:'center', color:'var(--text-muted)' }}>
            <CreditCard size={36} style={{ margin:'0 auto 10px', display:'block', opacity:.3 }} />
            <p style={{ fontWeight:600 }}>No expenses recorded</p>
            <p style={{ fontSize:13, marginTop:4 }}>Add expenses to track your operating costs</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Description</th><th>Amount</th><th>Actions</th></tr></thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e._id}>
                    <td style={{ color:'var(--text-secondary)', fontSize:12.5 }}>{new Date(e.date).toLocaleDateString()}</td>
                    <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{e.title}</td>
                    <td><span className={`badge ${CAT_COLORS[e.category]||'badge-yellow'}`}>{e.category}</span></td>
                    <td style={{ color:'var(--text-muted)', fontSize:12.5 }}>{e.description || '—'}</td>
                    <td style={{ fontWeight:700, color:'#f87171', fontSize:14 }}>${e.amount?.toFixed(2)}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn-secondary" style={{ padding:'5px 9px', fontSize:12 }} onClick={() => { setEditExpense(e); setShowModal(true); }}><Pencil size={12} /></button>
                        <button className="btn-danger" onClick={() => handleDelete(e._id)}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <ExpenseModal expense={editExpense} onClose={() => { setShowModal(false); setEditExpense(null); }} onSave={handleSave} />}
    </div>
  );
}
