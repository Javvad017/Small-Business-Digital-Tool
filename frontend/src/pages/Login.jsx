import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Store, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo quick login
  const demoLogin = async () => {
    setForm({ email: 'demo@smartbiz.com', password: 'demo1234' });
    setLoading(true);
    try {
      // Try login first, if fails create demo account
      let res;
      try {
        res = await api.post('/auth/login', { email: 'demo@smartbiz.com', password: 'demo1234' });
      } catch {
        res = await api.post('/auth/signup', {
          name: 'Demo User',
          email: 'demo@smartbiz.com',
          password: 'demo1234',
          businessName: 'Demo Store'
        });
      }
      login(res.data.user, res.data.token);
      toast.success('Logged in as Demo User!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420, padding: '0 16px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
          }}>
            <Store size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>SmartBiz</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Sign in to your business dashboard</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="you@business.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center' }}>
              {loading ? <Loader2 size={16} className="spinner" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ color: '#374151', fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <button className="btn-secondary" type="button" onClick={demoLogin} disabled={loading} style={{ justifyContent: 'center' }}>
              🚀 Try Demo Account
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#6366f1', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
