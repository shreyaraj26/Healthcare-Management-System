import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity, LogOut, User, Menu, X,
  Stethoscope, Calendar, Shield, ChevronDown, Home, Sparkles,
  Zap, HeartPulse, UserCheck, Bot
} from 'lucide-react';
import LocationSelector from '../common/LocationSelector';

const ROLE_CONFIG = {
  patient: {
    color: 'var(--color-primary)',
    label: 'Patient Portal',
    badgeClass: 'badge-indigo',
    links: [
      { to: '/patient', label: 'Health Hub', icon: Home, end: true },
      { to: '/patient/doctors', label: 'Find Specialists', icon: Stethoscope },
    ],
  },
  doctor: {
    color: 'var(--color-accent-emerald)',
    label: 'Doctor Portal',
    badgeClass: 'badge-emerald',
    links: [
      { to: '/doctor', label: 'Clinical Schedule', icon: Calendar, end: true },
      { to: '/doctor/leave', label: 'Leave Manager', icon: Activity },
    ],
  },
  admin: {
    color: '#7C3AED',
    label: 'Admin Console',
    badgeClass: 'badge-dark',
    links: [
      { to: '/admin', label: 'Command Center', icon: Shield, end: true },
      { to: '/admin/doctors', label: 'Doctor Directory', icon: Stethoscope },
    ],
  },
};

export default function Navbar() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const profileRef = useRef(null);
  const demoRef = useRef(null);

  const config = user ? ROLE_CONFIG[user.role] : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(e.target)) {
        setDemoOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  const handleQuickLogin = async (email, password, role) => {
    setDemoOpen(false);
    try {
      await login({ email, password });
      navigate(`/${role}`);
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  return (
    <nav className="navbar-clean">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand Logo & Live Pulse */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              onClick={() => navigate('/')} 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                color: '#FFFFFF',
              }}>
                <HeartPulse size={22} strokeWidth={2.4} />
              </div>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                  <span style={{ color: '#4F46E5' }}>Pulse</span>
                  <span style={{ color: '#0F172A' }}>Care</span>
                  <span style={{ color: '#10B981', marginLeft: '3px', fontSize: '1rem', fontWeight: 900 }}>AI</span>
                </span>
              </div>
            </div>

            {/* Live Ecosystem Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: '#ECFDF5',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '11px',
              fontWeight: 700,
              color: '#065F46',
            }}>
              <span className="pulse-dot" />
              <span>Live v1.0</span>
            </div>
          </div>

          {/* Location Selector */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LocationSelector onCityChange={(c) => {
              if (window.location.pathname !== '/patient/doctors') {
                navigate(`/patient/doctors?city=${encodeURIComponent(c)}`);
              }
            }} />
          </div>

          {/* Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {config ? (
              config.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                >
                  <link.icon size={16} strokeWidth={2.2} />
                  <span>{link.label}</span>
                </NavLink>
              ))
            ) : (
              <>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                >
                  <Home size={16} strokeWidth={2.2} />
                  <span>Overview</span>
                </NavLink>
                <NavLink
                  to="/patient/doctors"
                  className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                >
                  <Stethoscope size={16} strokeWidth={2.2} />
                  <span>Find Specialists</span>
                </NavLink>
              </>
            )}
          </div>

          {/* Right Action Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Quick 1-Click Demo Evaluation Dropdown */}
            <div ref={demoRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDemoOpen(!demoOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '9999px',
                  padding: '6px 14px',
                  fontWeight: 700,
                  fontSize: '12px',
                  border: '1px solid rgba(79, 70, 229, 0.3)',
                  color: '#4F46E5',
                  background: '#EEF2FF',
                }}
              >
                <Zap size={14} color="#4F46E5" strokeWidth={2.5} />
                <span>1-Click Demo Logins</span>
                <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: demoOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {demoOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '260px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '12px',
                  zIndex: 1000,
                  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
                }}>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    Instant Role Switcher
                  </p>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('rohan@patient.demo', 'Patient@123456', 'patient')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      background: '#F8FAFC',
                      marginBottom: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4F46E5'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Rohan Verma</div>
                      <div style={{ fontSize: '10px', color: '#4F46E5', fontWeight: 600 }}>Patient Hub</div>
                    </div>
                    <span className="badge badge-indigo">Demo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('dr.priya@healthsync.demo', 'Doctor@123456', 'doctor')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      background: '#F8FAFC',
                      marginBottom: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10B981'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Dr. Priya Sharma</div>
                      <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>Cardiology Specialist</div>
                    </div>
                    <span className="badge badge-emerald">Doctor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@healthsync.demo', 'Admin@123456', 'admin')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Admin Console</div>
                      <div style={{ fontSize: '10px', color: '#7C3AED', fontWeight: 600 }}>Metrics & Queues</div>
                    </div>
                    <span className="badge badge-dark">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div ref={profileRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: '9999px',
                    padding: '4px 12px 4px 6px',
                    border: '1px solid #CBD5E1',
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4F46E5, #10B981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'white',
                  }}>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{user.firstName}</span>
                  <span className={`badge ${config?.badgeClass}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                    {config?.label}
                  </span>
                  <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {profileOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '10px',
                    minWidth: '220px',
                    zIndex: 1000,
                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
                  }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9', marginBottom: '6px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{user.firstName} {user.lastName}</p>
                      <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>{user.email}</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ justifyContent: 'flex-start', color: '#F43F5E', width: '100%', borderRadius: '8px' }}
                      onClick={handleLogout}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate('/login')}
                  style={{ fontWeight: 700 }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm btn-pill"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
