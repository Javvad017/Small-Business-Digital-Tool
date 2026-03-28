import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email:'', password:'' });
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
    } finally { setLoading(false); }
  };

  const demoLogin = async () => {
    setLoading(true);
    try {
      let res;
      try { res = await api.post('/auth/login', { email:'demo@smartbiz.com', password:'demo1234' }); }
      catch { res = await api.post('/auth/signup', { name:'Demo User', email:'demo@smartbiz.com', password:'demo1234', businessName:'Demo Store' }); }
      login(res.data.user, res.data.token);
      toast.success('Logged in as Demo User!');
      navigate('/dashboard');
    } catch { toast.error('Demo login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      {/* Decorative grid */}
      <div style={{
        position:'absolute', inset:0, zIndex:0,
        backgroundImage:'linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)',
        backgroundSize:'60px 60px',
        pointerEvents:'none'
      }}/>

      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:420, padding:'0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{
            width:64, height:64,
            background:'linear-gradient(135deg, var(--neon-green), #059669)',
            borderRadius:20,
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 18px',
            boxShadow:'0 0 30px rgba(16,185,129,0.35), 0 8px 32px rgba(0,0,0,0.4)'
          }}>
            <Zap size={30} color="#0B0F19" strokeWidth={2.5}/>
          </div>
          <h1 style={{ fontSize:30, fontWeight:900, color:'var(--text-primary)', letterSpacing:'-0.03em', marginBottom:6 }}>
            Smart<span style={{ color:'var(--neon-green)' }}>Biz</span>
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>Sign in to your business dashboard</p>
        </div>

        {/* Card */}
        <div style={{
          background:'var(--bg-surface)',
          border:'1px solid var(--border)',
          borderRadius:20,
          padding:28,
          boxShadow:'0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.05)'
        }}>
          {/* Top neon line */}
          <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:1, background:'linear-gradient(90deg, transparent, var(--neon-green), transparent)', borderRadius:'0 0 4px 4px' }}/>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email" name="email"
                placeholder="you@business.com"
                value={form.email} onChange={handleChange} required
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  name="password" placeholder="••••••••"
                  value={form.password} onChange={handleChange} required
                  style={{ paddingRight:44 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', display:'flex' }}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ justifyContent:'center', fontSize:14, padding:'12px 0', borderRadius:12, marginTop:4 }}>
              {loading ? <Loader2 size={16} className="spinner"/> : <Zap size={15}/>}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flex:1, height:1, background:'var(--border)' }}/>
              <span style={{ color:'var(--text-muted)', fontSize:12, fontWeight:500 }}>or</span>
              <div style={{ flex:1, height:1, background:'var(--border)' }}/>
            </div>

            <button type="button" className="btn-secondary" onClick={demoLogin} disabled={loading}
              style={{ justifyContent:'center', fontSize:13.5, padding:'11px 0', borderRadius:12 }}>
              ⚡ Try Demo Account
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:22, fontSize:13, color:'var(--text-muted)' }}>
            No account?{' '}
            <Link to="/signup" style={{ color:'var(--neon-green)', fontWeight:700, textDecoration:'none' }}>Create one free</Link>
          </p>
        </div>

        {/* Bottom hint */}
        <p style={{ textAlign:'center', marginTop:20, fontSize:11.5, color:'var(--text-muted)' }}>
          Demo: demo@smartbiz.com · demo1234
        </p>
      </div>
    </div>
  );
}
