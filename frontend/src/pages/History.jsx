import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  ChevronDown, ChevronUp, Search, Loader2, Download,
  Calendar, History as HistIcon, Printer, TrendingUp,
  DollarSign, Receipt, X
} from 'lucide-react';

/* ── Summary Metric Card ────────────────────────────────── */
function MetricBadge({ label, value, color }) {
  return (
    <div style={{
      background:'var(--bg-surface)', border:'1px solid var(--border)',
      borderRadius:12, padding:'12px 18px', flexShrink:0
    }}>
      <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:20, fontWeight:800, color: color || 'var(--text-primary)', letterSpacing:'-0.02em' }}>{value}</div>
    </div>
  );
}

/* ── Bill Row ───────────────────────────────────────────── */
function BillRow({ bill, onPrint }) {
  const [expanded, setExpanded] = useState(false);
  const pmColor = { cash:'badge-green', card:'badge-blue', upi:'badge-purple', other:'badge-yellow' };

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        style={{ cursor:'pointer', transition:'background 0.15s' }}
      >
        <td>
          <span style={{ fontFamily:'monospace', fontSize:12, color:'#A78BFA', fontWeight:700 }}>
            {bill.billNumber}
          </span>
        </td>
        <td>
          <div style={{ fontSize:13, color:'var(--text-primary)', fontWeight:500 }}>
            {new Date(bill.createdAt).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}
          </div>
          <div style={{ fontSize:11, color:'var(--text-muted)' }}>
            {new Date(bill.createdAt).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
          </div>
        </td>
        <td>
          <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:13 }}>{bill.customerName}</div>
          {bill.customerPhone && <div style={{ fontSize:11, color:'var(--text-muted)' }}>{bill.customerPhone}</div>}
        </td>
        <td>
          <span style={{ fontSize:12, color:'var(--text-muted)', background:'var(--bg-elevated)', padding:'3px 9px', borderRadius:20, border:'1px solid var(--border)' }}>
            {bill.items?.length} item{bill.items?.length !== 1 ? 's' : ''}
          </span>
        </td>
        <td><span className={`badge ${pmColor[bill.paymentMethod]||'badge-blue'}`}>{bill.paymentMethod?.toUpperCase()}</span></td>
        <td>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>${bill.subtotal?.toFixed(2)}</div>
          <div style={{ fontSize:10.5, color:'#A78BFA' }}>+${(bill.totalGst||0).toFixed(2)} GST</div>
        </td>
        <td style={{ fontWeight:800, color:'var(--neon-green)', fontSize:15, letterSpacing:'-0.02em' }}>
          ${bill.totalAmount?.toFixed(2)}
        </td>
        <td>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <button
              className="btn-secondary"
              style={{ padding:'5px 9px', fontSize:11.5 }}
              onClick={e => { e.stopPropagation(); onPrint(bill); }}
            >
              <Printer size={11}/>
            </button>
            <div style={{ color:'var(--text-muted)', display:'flex' }}>
              {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            </div>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={8} style={{ padding:0, background:'rgba(16,185,129,0.02)' }}>
            <div style={{ margin:'0 16px 10px', padding:'14px 16px', background:'var(--bg-elevated)', border:'1px solid rgba(16,185,129,0.1)', borderRadius:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--neon-green)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>
                Order Items
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid var(--border)' }}>
                    {['Product','Qty','Unit Price','GST','Total'].map(h => (
                      <th key={h} style={{ textAlign: h==='Product'?'left':'right', color:'var(--text-muted)', fontWeight:700, padding:'6px 10px', fontSize:10.5, textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bill.items?.map((item,i) => (
                    <tr key={i} style={{ borderBottom:'1px solid var(--border-light)' }}>
                      <td style={{ padding:'8px 10px', color:'var(--text-primary)', fontWeight:500 }}>{item.productName}</td>
                      <td style={{ textAlign:'right', padding:'8px 10px', color:'var(--text-secondary)' }}>{item.quantity}</td>
                      <td style={{ textAlign:'right', padding:'8px 10px', color:'var(--text-secondary)' }}>${item.price?.toFixed(2)}</td>
                      <td style={{ textAlign:'right', padding:'8px 10px', color:'#A78BFA' }}>{item.gstRate||0}% (${(item.gstAmount||0).toFixed(2)})</td>
                      <td style={{ textAlign:'right', padding:'8px 10px', fontWeight:700, color:'var(--neon-green)' }}>${item.totalWithGst?.toFixed(2)}</td>
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

/* ── Invoice Print Modal ────────────────────────────────── */
function InvoicePrintModal({ bill, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth:680, background:'white', padding:0, overflow:'hidden' }}>
        <div className="no-print" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', background:'linear-gradient(135deg,#10B981,#059669)' }}>
          <span style={{ color:'white', fontWeight:700, fontSize:14 }}>📄 {bill.billNumber}</span>
          <div style={{ display:'flex', gap:8 }}>
            <button style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', color:'white', padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:12.5, fontFamily:'inherit', display:'flex', alignItems:'center', gap:5 }} onClick={()=>window.print()}>
              <Printer size={12}/> Print
            </button>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'white', padding:'6px 10px', borderRadius:8, cursor:'pointer' }}>✕</button>
          </div>
        </div>
        <div className="invoice-container">
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
            <div><div style={{ fontSize:20, fontWeight:800, color:'#10B981' }}>SmartBiz</div></div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:16, fontWeight:800 }}>INVOICE #{bill.billNumber}</div>
              <div style={{ fontSize:12, color:'#6B7280' }}>{new Date(bill.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          <div style={{ background:'#F9FAFB', borderRadius:8, padding:'10px 14px', marginBottom:18 }}>
            <div style={{ fontWeight:700 }}>{bill.customerName}</div>
            {bill.customerPhone && <div style={{ fontSize:12, color:'#6B7280' }}>{bill.customerPhone}</div>}
            <div style={{ fontSize:12, color:'#6B7280' }}>Payment: {bill.paymentMethod?.toUpperCase()}</div>
          </div>
          <table className="invoice-table" style={{ marginBottom:16 }}>
            <thead><tr><th>#</th><th>Item</th><th style={{ textAlign:'center' }}>Qty</th><th style={{ textAlign:'right' }}>Price</th><th style={{ textAlign:'right' }}>GST</th><th style={{ textAlign:'right' }}>Total</th></tr></thead>
            <tbody>
              {bill.items?.map((item,i) => (
                <tr key={i}>
                  <td>{i+1}</td><td>{item.productName}</td>
                  <td style={{ textAlign:'center' }}>{item.quantity}</td>
                  <td style={{ textAlign:'right' }}>${item.price?.toFixed(2)}</td>
                  <td style={{ textAlign:'right' }}>{item.gstRate||0}%</td>
                  <td style={{ textAlign:'right', fontWeight:700 }}>${item.totalWithGst?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <div style={{ width:240 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, padding:'4px 0', color:'#6B7280' }}><span>Subtotal</span><span>${bill.subtotal?.toFixed(2)}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, padding:'4px 0', color:'#8B5CF6' }}><span>GST</span><span>${bill.totalGst?.toFixed(2)}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:800, padding:'8px 0', borderTop:'2px solid #E5E7EB' }}><span>TOTAL</span><span style={{ color:'#10B981' }}>${bill.totalAmount?.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main History Page ──────────────────────────────────── */
export default function History() {
  const [bills, setBills]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [from, setFrom]         = useState('');
  const [to, setTo]             = useState('');
  const [printBill, setPrintBill] = useState(null);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to)   params.set('to', to);
      const { data } = await api.get(`/billing?${params}`);
      setBills(data);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBills(); }, [from, to]);

  const exportCSV = () => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to)   params.set('to', to);
    params.set('token', token);
    window.location.href = `/api/export/sales?${params}`;
  };

  const filtered = search
    ? bills.filter(b =>
        b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.customerName.toLowerCase().includes(search.toLowerCase())
      )
    : bills;

  const totalRev  = bills.reduce((s,b) => s+b.totalAmount, 0);
  const totalGst  = bills.reduce((s,b) => s+(b.totalGst||0), 0);
  const totalProfit = bills.reduce((s,b) => s+(b.profit||0), 0);

  return (
    <div className="page-content">
      {printBill && <InvoicePrintModal bill={printBill} onClose={() => setPrintBill(null)}/>}

      {/* Header */}
      <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
        <div>
          <h1 className="page-title">Order History</h1>
          <p className="page-sub">Full transaction & billing tracker</p>
        </div>
        <button className="btn-secondary" onClick={exportCSV} style={{ fontSize:13 }}>
          <Download size={14}/> Export CSV
        </button>
      </div>

      {/* Summary Row */}
      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <MetricBadge label="Transactions"  value={bills.length}                    color="var(--text-primary)"/>
        <MetricBadge label="Total Revenue" value={`$${totalRev.toFixed(2)}`}       color="var(--neon-green)"/>
        <MetricBadge label="Total GST"     value={`$${totalGst.toFixed(2)}`}       color="var(--text-purple)"/>
        <MetricBadge label="Total Profit"  value={`$${totalProfit.toFixed(2)}`}    color={totalProfit>=0?'var(--neon-green)':'#F87171'}/>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:22, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:220 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
          <input
            className="form-input"
            placeholder="Search bill # or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft:36, height:40 }}
          />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Calendar size={14} color="var(--text-muted)"/>
          <input className="form-input" type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{ width:160, height:40 }}/>
          <span style={{ color:'var(--text-muted)', fontSize:12, fontWeight:500 }}>to</span>
          <input className="form-input" type="date" value={to} onChange={e=>setTo(e.target.value)} style={{ width:160, height:40 }}/>
          {(from||to) && (
            <button className="btn-secondary" style={{ padding:'9px 12px', fontSize:12 }} onClick={() => { setFrom(''); setTo(''); }}>
              <X size={13}/> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:48, textAlign:'center', color:'var(--text-muted)' }}>
            <Loader2 size={22} className="spinner" style={{ margin:'0 auto 10px', display:'block' }}/>
            Loading transactions...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:64, textAlign:'center', color:'var(--text-muted)' }}>
            <HistIcon size={34} style={{ margin:'0 auto 12px', display:'block', opacity:0.2 }}/>
            <p style={{ fontWeight:600, marginBottom:4 }}>No transactions found</p>
            <p style={{ fontSize:12 }}>Generate some bills in the Billing page first</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill No.</th>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Subtotal + GST</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <BillRow key={b._id} bill={b} onPrint={setPrintBill}/>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
