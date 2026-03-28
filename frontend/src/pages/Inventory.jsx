import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, AlertTriangle, Package, X, Loader2 } from 'lucide-react';

const EMPTY_FORM = { name: '', price: '', quantity: '', category: 'General', description: '' };
const CATEGORIES = ['General', 'Electronics', 'Clothing', 'Food & Beverages', 'Health', 'Office', 'Other'];

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (product?._id) {
        res = await api.put(`/products/${product._id}`, form);
        toast.success('Product updated!');
      } else {
        res = await api.post('/products', form);
        toast.success('Product added!');
      }
      onSave(res.data, !!product?._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>
            {product?._id ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Product Name *</label>
            <input className="form-input" name="name" placeholder="e.g. Blue Pen" value={form.name} onChange={handleChange} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Price ($) *</label>
              <input className="form-input" name="price" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">Quantity *</label>
              <input className="form-input" name="quantity" type="number" min="0" placeholder="0" value={form.quantity} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <label className="form-label">Category</label>
            <select className="form-input" name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Description (optional)</label>
            <input className="form-input" name="description" placeholder="Brief product description" value={form.description} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn-secondary" type="button" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button className="btn-primary" type="submit" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <Loader2 size={14} className="spinner" /> : null}
              {loading ? 'Saving...' : product?._id ? 'Update' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(p => p.filter(x => x._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSave = (saved, isEdit) => {
    if (isEdit) {
      setProducts(p => p.map(x => x._id === saved._id ? saved : x));
    } else {
      setProducts(p => [saved, ...p]);
    }
    setShowModal(false);
    setEditProduct(null);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = products.filter(p => p.quantity < 5).length;

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#e2e8f0' }}>Inventory</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            {products.length} products total · <span style={{ color: lowStockCount > 0 ? '#facc15' : '#4ade80' }}>{lowStockCount} low stock</span>
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setEditProduct(null); setShowModal(true); }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Low stock banner */}
      {lowStockCount > 0 && (
        <div style={{
          background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)',
          borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20
        }}>
          <AlertTriangle size={16} color="#facc15" />
          <span style={{ color: '#facc15', fontSize: 13, fontWeight: 600 }}>
            {lowStockCount} item{lowStockCount > 1 ? 's' : ''} with low stock (quantity {'<'} 5) — restock soon!
          </span>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input
          className="form-input"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={24} className="spinner" style={{ margin: '0 auto 8px', display: 'block' }} />
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            <p style={{ fontWeight: 600 }}>{search ? 'No products match your search' : 'No products yet'}</p>
            {!search && <p style={{ fontSize: 13, marginTop: 4 }}>Click "Add Product" to get started</p>}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{product.name}</div>
                      {product.description && <div style={{ fontSize: 12, color: '#4b5563', marginTop: 2 }}>{product.description}</div>}
                    </td>
                    <td><span className="badge badge-blue">{product.category}</span></td>
                    <td style={{ fontWeight: 600, color: '#4ade80' }}>${Number(product.price).toFixed(2)}</td>
                    <td style={{ fontWeight: 600, color: product.quantity < 5 ? '#facc15' : '#e2e8f0' }}>
                      {product.quantity} units
                    </td>
                    <td>
                      {product.quantity === 0
                        ? <span className="badge badge-red">Out of Stock</span>
                        : product.quantity < 5
                          ? <span className="badge badge-yellow">⚠ Low Stock</span>
                          : <span className="badge badge-green">✓ In Stock</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => { setEditProduct(product); setShowModal(true); }}
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button className="btn-danger" onClick={() => handleDelete(product._id)}>
                          <Trash2 size={12} />
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
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
