import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { History as HistoryIcon, ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react';

function BillRow({ bill }) {
  const [expanded, setExpanded] = useState(false);

  const paymentColors = {
    cash: 'badge-green',
    card: 'badge-blue',
    upi: 'badge-purple',
    other: 'badge-yellow'
  };

  return (
    <>
      <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <td>
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#a5b4fc' }}>{bill.billNumber}</span>
        </td>
        <td style={{ color: '#94a3b8' }}>
          {new Date(bill.createdAt).toLocaleDateString('en-US', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
          <span style={{ color: '#4b5563', marginLeft: 6, fontSize: 12 }}>
            {new Date(bill.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </td>
        <td style={{ color: '#e2e8f0' }}>{bill.customerName}</td>
        <td>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{bill.items.length} item{bill.items.length > 1 ? 's' : ''}</span>
        </td>
        <td>
          <span className={`badge ${paymentColors[bill.paymentMethod] || 'badge-blue'}`}>
            {bill.paymentMethod}
          </span>
        </td>
        <td style={{ fontWeight: 700, color: '#4ade80', fontSize: 15 }}>
          ${bill.totalAmount.toFixed(2)}
        </td>
        <td>
          {expanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} style={{ padding: 0 }}>
            <div style={{
              background: 'rgba(99,102,241,0.04)',
              border: '1px solid rgba(99,102,241,0.1)',
              margin: '0 16px 8px',
              borderRadius: 10,
              padding: '12px 16px'
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Items Breakdown
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontSize: 12, color: '#4b5563', padding: '4px 8px' }}>Product</th>
                    <th style={{ textAlign: 'center', fontSize: 12, color: '#4b5563' }}>Qty</th>
                    <th style={{ textAlign: 'right', fontSize: 12, color: '#4b5563' }}>Unit Price</th>
                    <th style={{ textAlign: 'right', fontSize: 12, color: '#4b5563' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((item, i) => (
                    <tr key={i}>
                      <td style={{ padding: '6px 8px', fontSize: 13, color: '#e2e8f0' }}>{item.productName}</td>
                      <td style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontSize: 13, color: '#94a3b8' }}>${item.price.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#4ade80' }}>${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function History() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/billing').then(({ data }) => {
      setBills(data);
    }).catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bills.filter(b =>
    b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = bills.reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#e2e8f0' }}>Order History</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          {bills.length} total transactions · Total Revenue: <span style={{ color: '#4ade80', fontWeight: 600 }}>${totalRevenue.toFixed(2)}</span>
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input
          className="form-input"
          placeholder="Search bill number or customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={24} className="spinner" style={{ margin: '0 auto 8px', display: 'block' }} />
            Loading transactions...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <HistoryIcon size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            <p style={{ fontWeight: 600 }}>{search ? 'No results found' : 'No transactions yet'}</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Generate your first bill in the Billing section</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill No.</th>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(bill => <BillRow key={bill._id} bill={bill} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
