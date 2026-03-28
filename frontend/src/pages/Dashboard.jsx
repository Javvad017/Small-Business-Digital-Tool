import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { DollarSign, Package, ShoppingCart, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{
        width: 44, height: 44,
        background: `${color}20`,
        border: `1px solid ${color}40`,
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={20} color={color} />
      </div>
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4ade80', fontSize: 12, fontWeight: 600 }}>
          <ArrowUpRight size={14} />
          {trend}
        </div>
      )}
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</div>
    {sub && <div style={{ fontSize: 12, color: '#4b5563', marginTop: 4 }}>{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10, padding: '10px 14px', fontSize: 13
      }}>
        <p style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#a5b4fc', fontWeight: 600 }}>${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 24 }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#e2e8f0' }}>Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Low stock alert banner */}
      {stats?.lowStockCount > 0 && (
        <div className="low-stock-pulse" style={{
          background: 'rgba(234,179,8,0.08)',
          border: '1px solid rgba(234,179,8,0.3)',
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20
        }}>
          <AlertTriangle size={18} color="#facc15" />
          <div style={{ flex: 1 }}>
            <span style={{ color: '#facc15', fontWeight: 600, fontSize: 14 }}>
              ⚠️ {stats.lowStockCount} product{stats.lowStockCount > 1 ? 's' : ''} running low on stock:
            </span>
            <span style={{ color: '#94a3b8', fontSize: 13, marginLeft: 6 }}>
              {stats.lowStockProducts.map(p => `${p.name} (${p.quantity} left)`).join(' · ')}
            </span>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
        <StatCard
          icon={DollarSign}
          label="Today's Sales"
          value={`$${(stats?.todaySales || 0).toFixed(2)}`}
          sub={`${stats?.todayTransactions || 0} transactions today`}
          color="#6366f1"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toFixed(2)}`}
          sub="All time earnings"
          color="#8b5cf6"
        />
        <StatCard
          icon={Package}
          label="Total Products"
          value={stats?.totalProducts || 0}
          sub={`${stats?.lowStockCount || 0} low stock`}
          color="#06b6d4"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={stats?.lowStockCount || 0}
          sub="Quantity below 5"
          color={stats?.lowStockCount > 0 ? '#eab308' : '#4ade80'}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Revenue chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Revenue — Last 7 Days</h2>
              <p style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Daily earnings overview</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.last7Days || []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Daily Transactions</h2>
            <p style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Number of bills per day</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.last7Days || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#a5b4fc' }}
              />
              <Bar dataKey="transactions" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products */}
      {stats?.topProducts?.length > 0 && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>🏆 Top Selling Products</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.topProducts.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 28, height: 28,
                  background: i === 0 ? 'rgba(250,204,21,0.15)' : i === 1 ? 'rgba(148,163,184,0.15)' : 'rgba(180,120,60,0.15)',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{p._id}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{p.totalQuantity} units sold</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80' }}>${p.totalRevenue.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
