import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/NotificationToast';
import { HeartPulse, Mail, Lock, Eye, EyeOff, ArrowRight, User, Stethoscope, ShieldCheck, Sparkles, Zap } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      const data = await login({ email, password });
      addToast(`Welcome back, ${data.user.firstName}!`, 'success');
      const searchParams = new URLSearchParams(location.search);
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl && redirectUrl.startsWith('/')) {
        navigate(redirectUrl, { replace: true });
      } else {
        navigate(`/${data.user.role}`, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }
    handleLogin(form.email, form.password);
  };

  const BETA_DEMO_ACCOUNTS = [
    {
      role: 'Patient',
      name: 'Rohan Verma',
      email: 'rohan@patient.demo',
      password: 'Patient@123456',
      desc: 'Health Hub & 5-min slot reservation',
      icon: User,
      color: '#4F46E5',
      bg: '#EEF2FF',
    },
    {
      role: 'Doctor',
      name: 'Dr. Priya Sharma',
      email: 'dr.priya@healthsync.demo',
      password: 'Doctor@123456',
      desc: 'Cardiology schedule & clinical notes',
      icon: Stethoscope,
      color: '#10B981',
      bg: '#ECFDF5',
    },
    {
      role: 'Admin',
      name: 'Platform Admin',
      email: 'admin@healthsync.demo',
      password: 'Admin@123456',
      desc: 'Queue manager & platform stats',
      icon: ShieldCheck,
      color: '#7C3AED',
      bg: '#F5F3FF',
    },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 76px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)',
            color: '#FFFFFF',
          }}>
            <HeartPulse size={24} strokeWidth={2.4} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
            Sign In to PulseCare AI
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
            Access your unified clinical appointment portal
          </p>
        </div>

        {/* 1-Click Evaluation Buttons */}
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', border: '1.5px solid rgba(79, 70, 229, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Zap size={15} color="#F59E0B" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Instant 1-Click Demo Logins
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {BETA_DEMO_ACCOUNTS.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLogin(acc.email, acc.password)}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: acc.bg,
                  border: `1px solid ${acc.color}30`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = acc.color}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = `${acc.color}30`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <acc.icon size={18} color={acc.color} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{acc.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{acc.desc}</div>
                  </div>
                </div>
                <span className="badge" style={{ background: '#FFFFFF', color: acc.color, border: `1px solid ${acc.color}40`, fontSize: '11px' }}>
                  {acc.role} →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Regular Login Card */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          {error && (
            <div style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              color: '#9F1239',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              marginBottom: '1rem',
              fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="input-control"
                  placeholder="name@domain.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-control"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#4F46E5', fontWeight: 700 }}>
              Create Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
