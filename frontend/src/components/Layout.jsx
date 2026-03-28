import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Package, Receipt, History, LogOut,
  Menu, X, Store, ChevronRight, Truck, ShoppingBag,
  BarChart3, CreditCard, Sun, Moon, Shield, Zap
} from 'lucide-react';

const adminNav = [
  { label: 'Overview', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/reports',   icon: BarChart3,       label: 'Reports' },
  ]},
  { label: 'Operations', items: [
    { to: '/billing',  icon: Receipt,  label: 'Billing' },
    { to: '/history',  icon: History,  label: 'Order History' },
  ]},
  { label: 'Inventory', items: [
    { to: '/inventory', icon: Package,     label: 'Products' },
    { to: '/purchases', icon: ShoppingBag, label: 'Purchases' },
    { to: '/suppliers', icon: Truck,       label: 'Suppliers' },
  ]},
  { label: 'Finance', items: [
    { to: '/expenses', icon: CreditCard, label: 'Expenses' },
  ]},
];

const staffNav = [
  { label: 'Operations', items: [
    { to: '/billing', icon: Receipt, label: 'Billing' },
  ]},
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const navGroups = isAdmin ? adminNav : staffNav;
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:40, backdropFilter:'blur(4px)' }}
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>

        {/* Logo */}
        <div style={{ padding:'20px 18px 16px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <div style={{
              width:38, height:38, borderRadius:12, flexShrink:0,
              background:'linear-gradient(135deg, var(--neon-green), #059669)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'var(--glow-sm-green)'
            }}>
              <Store size={18} color="#0B0F19" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>SmartBiz</div>
              <div style={{ fontSize:10, color:'var(--neon-green)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>Pro Dashboard</div>
            </div>
          </div>

          {/* Business chip */}
          <div style={{
            background:'rgba(16,185,129,0.07)',
            border:'1px solid rgba(16,185,129,0.15)',
            borderRadius:10, padding:'8px 12px',
            display:'flex', alignItems:'center', gap:8
          }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--neon-green)', flexShrink:0, boxShadow:'var(--glow-sm-green)' }} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, color:'var(--text-primary)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user?.businessName || 'My Business'}
              </div>
              <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>
                {isAdmin ? '⚡ Administrator' : '● Staff Member'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding:'8px 10px', flex:1, overflowY:'auto' }}>
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="nav-section-label">{group.label}</div>
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to} to={to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={15} strokeWidth={2} />
                  <span style={{ flex:1, fontSize:13.5 }}>{label}</span>
                  <ChevronRight size={12} style={{ opacity:0.25, flexShrink:0 }} />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom: theme + user */}
        <div style={{ padding:'12px 10px 16px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
          {/* Theme row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 8px', marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'var(--text-muted)', fontWeight:500 }}>
              {isDark ? <Moon size={13}/> : <Sun size={13}/>}
              {isDark ? 'Dark' : 'Light'}
            </div>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" />
          </div>

          {/* User card */}
          <div style={{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
            background:'var(--bg-elevated)', borderRadius:12, marginBottom:10,
            border:'1px solid var(--border)'
          }}>
            <div style={{
              width:32, height:32, borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg, var(--neon-green), var(--neon-purple))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, fontWeight:800, color:'#0B0F19'
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12.5, fontWeight:700, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize:10.5, color:'var(--text-muted)' }}>{user?.email}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:7,
              padding:'9px 0', borderRadius:10, border:'1px solid rgba(239,68,68,0.2)',
              background:'rgba(239,68,68,0.08)', color:'#F87171',
              fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
              transition:'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.2)'; }}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="main-content" style={{ flex:1 }}>
        {/* Topbar */}
        <div className="topbar">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:4, borderRadius:8, display:'flex' }}
          >
            {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
          <div style={{ flex:1 }}/>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Role badge */}
            <div style={{
              display:'flex', alignItems:'center', gap:6, padding:'5px 12px',
              background: isAdmin ? 'rgba(16,185,129,0.08)' : 'rgba(139,92,246,0.08)',
              border: `1px solid ${isAdmin ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.2)'}`,
              borderRadius:20, fontSize:11.5, fontWeight:700,
              color: isAdmin ? 'var(--neon-green)' : 'var(--text-purple)'
            }}>
              {isAdmin ? <Zap size={11}/> : <Shield size={11}/>}
              {isAdmin ? 'Admin' : 'Staff'}
            </div>
            <div style={{ fontSize:13, color:'var(--text-muted)' }}>
              <span style={{ color:'var(--text-primary)', fontWeight:600 }}>{user?.name}</span>
            </div>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
