import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, Receipt, History,
  Bot, LogOut, Menu, X, Store, ChevronRight, Bell
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/billing', icon: Receipt, label: 'Billing' },
  { to: '/history', icon: History, label: 'Order History' },
  { to: '/ai', icon: Bot, label: 'AI Assistant' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 40, height: 40,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Store size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>SmartBiz</div>
              <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 500 }}>Digital Tool</div>
            </div>
          </div>
        </div>

        {/* Business name chip */}
        <div style={{ padding: '12px 20px' }}>
          <div style={{
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            color: '#a5b4fc',
            fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            {user?.businessName || 'My Business'}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '8px 12px', flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 4px', marginBottom: 4 }}>
            Main Menu
          </div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{label}</span>
              <ChevronRight size={14} style={{ opacity: 0.4 }} />
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            marginBottom: 8
          }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button className="btn-danger" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleLogout}>
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content" style={{ flex: 1 }}>
        {/* Top bar (mobile) */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(15,17,23,0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky', top: 0, zIndex: 30
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            className="md:hidden"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div style={{ fontSize: 14, color: '#64748b' }} className="hidden md:block">
            Welcome back, <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{user?.name}</span> 👋
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <Bell size={16} color="#94a3b8" />
            </div>
          </div>
        </div>

        <div style={{ padding: '0' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
