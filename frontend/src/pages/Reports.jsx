import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { BarChart3, Download, Calendar, Loader2, TrendingUp, DollarSign, ShoppingCart, TrendingDown, Wallet, Printer } from 'lucide-react';

export default function Reports() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/daily?date=${date}`);
      setReport(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report');
    } finally { setLoading(false); }
  };

  const handlePrint = () => window.print();

  return (
    <div className="page-content">
      <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title">Daily Reports</h1>
          <p className="page-sub">Generate end-of-day business summaries</p>
        </div>
        {report && (
          <button className="btn-secondary" onClick={handlePrint}><Printer size={14} /> Print Report</button>
        )}
      </div>

      {/* Date selector */}
      <div className="glass-card" style={{ padding:20, marginBottom:22 }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:14, flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:200 }}>
            <label className="form-label">Select Date</label>
            <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
          </div>
          <button className="btn-primary" onClick={fetchReport} disabled={loading} style={{ height:40 }}>
            {loading ? <Loader2 size={14} className="spinner" /> : <BarChart3 size={14} />}
            {loading ? 'Generating...' : 'Generate End-of-Day Report'}
          </button>
        </div>
      </div>

      {report && (
        <div id="report-print">
          {/* Report header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
            <div>
              <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text-primary)' }}>
                📊 Daily Report — {new Date(report.date + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
              </h2>
              <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:3 }}>Generated at {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:14, marginBottom:22 }}>
            {[
              { icon:ShoppingCart, label:'Total Sales',     val:`$${report.totalSales?.toFixed(2)}`,     color:'#6366f1' },
              { icon:TrendingUp,   label:'Gross Profit',    val:`$${report.totalProfit?.toFixed(2)}`,    color:'#4ade80' },
              { icon:BarChart3,    label:'Transactions',    val:report.transactions,                     color:'#06b6d4' },
              { icon:DollarSign,   label:'Total GST',       val:`$${report.totalGst?.toFixed(2)}`,      color:'#a78bfa' },
              { icon:TrendingDown, label:'Expenses',        val:`$${report.totalExpenses?.toFixed(2)}`,  color:'#f87171' },
              { icon:Wallet,       label:'Net Profit',      val:`$${report.netProfit?.toFixed(2)}`,      color: report.netProfit >= 0 ? '#4ade80' : '#f87171' },
            ].map(({ icon:Icon, label, val, color }) => (
              <div key={label} className="stat-card" style={{ padding:18 }}>
                <div style={{ width:36, height:36, background:`${color}18`, border:`1px solid ${color}30`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                  <Icon size={17} color={color} />
                </div>
                <div style={{ fontSize:22, fontWeight:800, color:color }}>{val}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
            {/* Top items */}
            {report.topItems?.length > 0 && (
              <div className="glass-card" style={{ padding:20 }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:14 }}>🏆 Top Selling Items Today</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                  {report.topItems.map((item, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:11 }}>
                      <div style={{ width:24, height:24, borderRadius:6, background:'rgba(99,102,241,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : `${i+1}`}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{item.name}</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{item.qty} units</div>
                      </div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#4ade80' }}>${item.revenue?.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses today */}
            <div className="glass-card" style={{ padding:20 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:14 }}>💸 Expenses Today</h3>
              {report.expenses?.length === 0 ? (
                <div style={{ color:'var(--text-muted)', fontSize:13 }}>No expenses recorded today</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {report.expenses?.map((e, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{e.title}</div>
                        <span className="badge badge-yellow" style={{ fontSize:10.5 }}>{e.category}</span>
                      </div>
                      <div style={{ fontWeight:700, color:'#f87171' }}>${e.amount?.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Low stock */}
          {report.lowStock?.length > 0 && (
            <div className="glass-card" style={{ padding:20, marginBottom:20 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#facc15', marginBottom:12 }}>⚠️ Low Stock Alerts</h3>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {report.lowStock.map((p, i) => (
                  <div key={i} style={{ background:'rgba(234,179,8,0.08)', border:'1px solid rgba(234,179,8,0.25)', borderRadius:9, padding:'8px 14px', fontSize:13 }}>
                    <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{p.name}</span>
                    <span style={{ color:'#facc15', marginLeft:8, fontWeight:700 }}>{p.quantity} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction list */}
          {report.bills?.length > 0 && (
            <div className="glass-card" style={{ overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>📋 All Transactions ({report.transactions})</h3>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Bill No.</th><th>Time</th><th>Customer</th><th>Payment</th><th>Total</th></tr></thead>
                  <tbody>
                    {report.bills.map((b, i) => (
                      <tr key={i}>
                        <td><span style={{ fontFamily:'monospace', color:'#a5b4fc', fontSize:12.5 }}>{b.billNumber}</span></td>
                        <td style={{ color:'var(--text-muted)', fontSize:12 }}>{new Date(b.time).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}</td>
                        <td style={{ color:'var(--text-primary)', fontWeight:500 }}>{b.customerName}</td>
                        <td><span className="badge badge-blue" style={{ fontSize:11 }}>{b.paymentMethod}</span></td>
                        <td style={{ fontWeight:700, color:'#4ade80' }}>${b.totalAmount?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!report && !loading && (
        <div className="glass-card" style={{ padding:60, textAlign:'center', color:'var(--text-muted)' }}>
          <BarChart3 size={40} style={{ margin:'0 auto 12px', display:'block', opacity:.3 }} />
          <p style={{ fontWeight:600, fontSize:15 }}>Select a date and click Generate to view the daily report</p>
          <p style={{ fontSize:13, marginTop:6 }}>Reports include sales, profit, expenses, GST breakdown, and low stock alerts</p>
        </div>
      )}
    </div>
  );
}
