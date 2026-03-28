import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  DollarSign, Package, ShoppingCart, AlertTriangle,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Zap, Activity
} from 'lucide-react';

/* ── Stat Card ──────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, accentColor, trend, trendUp }) {
  const c = accentColor || 'var(--neon-green)';
  return (
    <div className="stat-card" style={{ cursor:'default' }}>
      {/* Top accent line */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${c}, transparent)`, borderRadius:'16px 16px 0 0' }} />

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{
          width:42, height:42,
          background:`rgba(${hexToRgb(c)},0.1)`,
          border:`1px solid rgba(${hexToRgb(c)},0.25)`,
          borderRadius:12,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:`0 0 16px rgba(${hexToRgb(c)},0.15)`
        }}>
          <Icon size={18} color={c} strokeWidth={2} />
        </div>

        {trend !== undefined && (
          <div style={{
            display:'flex', alignItems:'center', gap:4,
            color: trendUp ? 'var(--neon-green)' : '#F87171',
            fontSize:11.5, fontWeight:700,
            background: trendUp ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${trendUp ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            padding:'3px 8px', borderRadius:20
          }}>
            {trendUp ? <ArrowUpRight size={11}/> : <ArrowDownRight size={11}/>}
            {trend}
          </div>
        )}
      </div>

      <div style={{ fontSize:28, fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.03em', marginBottom:4 }}>
        {value}
      </div>
      <div style={{ fontSize:12.5, color:'var(--text-muted)', fontWeight:500 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4, opacity:0.7 }}>{sub}</div>}
    </div>
  );
}

function hexToRgb(hex) {
  const shortcuts = {
    'var(--neon-green)' : '16,185,129',
    'var(--neon-purple)': '139,92,246',
    '#10B981': '16,185,129',
    '#8B5CF6': '139,92,246',
    '#06B6D4': '6,182,212',
    '#F59E0B': '245,158,11',
    '#EF4444': '239,68,68',
    '#3B82F6': '59,130,246',
  };
  return shortcuts[hex] || '16,185,129';
}

/* ── Custom Tooltip ─────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'var(--bg-surface)', border:'1px solid var(--border)',
      borderRadius:12, padding:'10px 14px', fontSize:12.5,
      boxShadow:'0 8px 32px rgba(0,0,0,0.4)'
    }}>
      <p style={{ color:'var(--text-muted)', marginBottom:6, fontWeight:600 }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color:p.color, fontWeight:700 }}>
          {p.name}: {typeof p.value === 'number' && p.name !== 'Transactions'
            ? `$${p.value.toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  );
};

/* ── Main Dashboard ─────────────────────────────────────── */
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-content">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:18, marginBottom:24 }}>
        {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height:140, borderRadius:16 }}/>)}
      </div>
    </div>
  );

  const statCards = [
    { icon:ShoppingCart, label:"Today's Revenue",  value:`$${(stats?.todaySales||0).toFixed(2)}`,   sub:`${stats?.todayTransactions||0} transactions today`, color:'#10B981', trendUp:true, trend:'+12%' },
    { icon:TrendingUp,   label:"Today's Profit",   value:`$${(stats?.todayProfit||0).toFixed(2)}`,  sub:'Gross (excl. expenses)',                              color:'#8B5CF6', trendUp:true, trend:'+8%' },
    { icon:DollarSign,   label:'Total Revenue',    value:`$${(stats?.totalRevenue||0).toFixed(2)}`, sub:'All time cumulative',                                 color:'#06B6D4' },
    { icon:TrendingDown, label:'Net Profit',        value:`$${(stats?.netProfit||0).toFixed(2)}`,    sub:'Revenue - Expenses',  color:(stats?.netProfit||0)>=0?'#10B981':'#EF4444' },
    { icon:Package,      label:'Total Products',   value:stats?.totalProducts||0,                   sub:`${stats?.lowStockCount||0} items low stock`,          color:'#F59E0B' },
    { icon:Activity,     label:'Total Expenses',   value:`$${(stats?.totalExpenses||0).toFixed(2)}`,sub:'All time',                                            color:'#EF4444' },
  ];

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">
            {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)',
          padding:'8px 16px', borderRadius:20, fontSize:12.5, fontWeight:600,
          color:'var(--neon-green)'
        }}>
          <Zap size={13}/>
          Live Data
        </div>
      </div>

      {/* Low stock alert */}
      {stats?.lowStockCount > 0 && (
        <div className="low-stock-pulse" style={{
          background:'rgba(245,158,11,0.07)',
          border:'1px solid rgba(245,158,11,0.25)',
          borderRadius:14, padding:'12px 18px',
          display:'flex', alignItems:'center', gap:12, marginBottom:24
        }}>
          <AlertTriangle size={16} color="#FCD34D" />
          <span style={{ color:'#FCD34D', fontWeight:600, fontSize:13 }}>
            ⚠ {stats.lowStockCount} product(s) critically low:&nbsp;
            <span style={{ opacity:0.8 }}>{stats.lowStockProducts.map(p => `${p.name} (${p.quantity})`).join(' · ')}</span>
          </span>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:18, marginBottom:28 }}>
        {statCards.map((c,i) => (
          <StatCard key={i} icon={c.icon} label={c.label} value={c.value}
            sub={c.sub} accentColor={c.color} trend={c.trend} trendUp={c.trendUp} />
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20, marginBottom:24 }}>
        {/* Revenue Area Chart */}
        <div className="glass-card" style={{ padding:'24px 20px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>Revenue & Profit</div>
              <div style={{ fontSize:11.5, color:'var(--text-muted)', marginTop:2 }}>Last 7 days</div>
            </div>
            <div style={{ display:'flex', gap:16 }}>
              {[['var(--neon-green)','Revenue'],['#8B5CF6','Profit']].map(([c,l]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, color:'var(--text-muted)', fontWeight:500 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:c }}/>
                  {l}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats?.last7Days||[]} margin={{ top:5, right:5, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false}/>
              <XAxis dataKey="date" tick={{ fill:'var(--text-muted)', fontSize:10.5 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:10.5 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2} fill="url(#gGreen)" dot={{ r:3, fill:'#10B981', strokeWidth:0 }}/>
              <Area type="monotone" dataKey="profit"  name="Profit"  stroke="#8B5CF6" strokeWidth={2} fill="url(#gPurple)" dot={{ r:3, fill:'#8B5CF6', strokeWidth:0 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions Bar Chart */}
        <div className="glass-card" style={{ padding:'24px 20px 16px' }}>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>Daily Transactions</div>
            <div style={{ fontSize:11.5, color:'var(--text-muted)', marginTop:2 }}>Bills generated per day</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.last7Days||[]} margin={{ top:5, right:5, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false}/>
              <XAxis dataKey="date" tick={{ fill:'var(--text-muted)', fontSize:10.5 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:10.5 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Bar dataKey="transactions" name="Transactions" fill="#8B5CF6" radius={[5,5,0,0]}
                style={{ filter:'drop-shadow(0 0 6px rgba(139,92,246,0.4))' }}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      {stats?.topProducts?.length > 0 && (
        <div className="glass-card" style={{ padding:24 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:18 }}>
            🏆 Top Selling Products
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {stats.topProducts.map((p, i) => {
              const maxRev = stats.topProducts[0]?.totalRevenue || 1;
              const pct = (p.totalRevenue / maxRev) * 100;
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{
                    width:28, height:28, borderRadius:8, flexShrink:0,
                    background: i===0 ? 'rgba(16,185,129,0.12)' : i===1 ? 'rgba(139,92,246,0.12)' : 'rgba(245,158,11,0.1)',
                    border: i===0 ? '1px solid rgba(16,185,129,0.25)' : i===1 ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(245,158,11,0.2)',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:13
                  }}>
                    {i===0?'🥇':i===1?'🥈':'🥉'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{p._id}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--neon-green)' }}>${p.totalRevenue?.toFixed(2)}</span>
                    </div>
                    <div style={{ background:'var(--bg-elevated)', borderRadius:4, height:4, overflow:'hidden' }}>
                      <div style={{
                        width:`${pct}%`, height:'100%',
                        background: i===0 ? 'var(--neon-green)' : i===1 ? '#8B5CF6' : '#F59E0B',
                        borderRadius:4,
                        boxShadow: i===0 ? 'var(--glow-sm-green)' : i===1 ? 'var(--glow-sm-purple)' : 'none',
                        transition:'width 1s ease'
                      }}/>
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{p.totalQuantity} units sold</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
