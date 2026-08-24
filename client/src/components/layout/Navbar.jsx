import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity, LogOut, User, Menu, X,
  Stethoscope, Calendar, Shield, ChevronDown, Home, Sparkles,
  Zap, HeartPulse, Building2, PhoneCall, FileText, FlaskConical,
  Pill, AlertTriangle, CheckCircle2, Bed, Ambulance, Award
} from 'lucide-react';
import LocationSelector from '../common/LocationSelector';

const ROLE_CONFIG = {
  patient: {
    color: '#0284C7',
    label: 'Patient Portal',
    badgeClass: 'badge-navy',
    links: [
      { to: '/patient', label: 'My Health Records', icon: FileText, end: true },
      { to: '/patient/doctors', label: 'Book Specialist', icon: Stethoscope },
    ],
  },
  doctor: {
    color: '#059669',
    label: 'Doctor EMR Portal',
    badgeClass: 'badge-emerald',
    links: [
      { to: '/doctor', label: 'Clinical OPD Queue', icon: Calendar, end: true },
      { to: '/doctor/leave', label: 'Manage Leave', icon: Activity },
    ],
  },
  admin: {
    color: '#0F2942',
    label: 'Hospital Administration',
    badgeClass: 'badge-navy',
    links: [
      { to: '/admin', label: 'Hospital Command', icon: Shield, end: true },
      { to: '/admin/doctors', label: 'Specialist Roster', icon: Stethoscope },
    ],
  },
};

export default function Navbar() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const profileRef = useRef(null);
  const demoRef = useRef(null);
  const deptRef = useRef(null);

  const config = user ? ROLE_CONFIG[user.role] : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(e.target)) {
        setDemoOpen(false);
      }
      if (deptRef.current && !deptRef.current.contains(e.target)) {
        setDeptOpen(false);
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
    <>
      {/* ── 1. TOP EMERGENCY & ACCREDITATION BAR ── */}
      <header className="hospital-top-bar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FCA5A5' }}>
              <PhoneCall size={13} color="#EF4444" />
              <span><strong>24/7 Emergency Trauma:</strong> 1066 / +91 755 408 6000</span>
            </div>
            <span style={{ color: '#334155' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#CBD5E1' }}>
              <Ambulance size={13} color="#38BDF8" />
              <span>24/7 Ambulance & Advanced Cardiac Life Support</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#86EFAC' }}>
              <Award size={13} color="#4ADE80" />
              <span>NABH & JCI Accredited Hospital</span>
            </div>
            <span style={{ color: '#334155' }}>|</span>
            <LocationSelector onCityChange={(c) => {
              if (window.location.pathname !== '/patient/doctors') {
                navigate(`/patient/doctors?city=${encodeURIComponent(c)}`);
              }
            }} />
          </div>
        </div>
      </header>

      {/* ── 2. MAIN HOSPITAL NAVIGATION BAR ── */}
      <nav className="hospital-main-nav">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '76px' }}>
            
            {/* Hospital Brand Logo */}
            <div 
              onClick={() => navigate('/')} 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0F2942 0%, #0284C7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 2px 10px rgba(15, 41, 66, 0.2)',
              }}>
                <Building2 size={24} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F2942', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  PulseCare <span style={{ color: '#0284C7' }}>Hospital</span>
                </div>
                <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Multi-Specialty & Research Institute
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              
              {/* Home */}
              <NavLink to="/" end className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}>
                <Home size={15} />
                <span>Overview</span>
              </NavLink>

              {/* Centres of Excellence Dropdown */}
              <div ref={deptRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setDeptOpen(!deptOpen)}
                  className="nav-item-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Building2 size={15} />
                  <span>Centres of Excellence</span>
                  <ChevronDown size={12} style={{ transform: deptOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {deptOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    width: '320px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '12px',
                    zIndex: 1000,
                    boxShadow: '0 15px 35px rgba(15, 23, 42, 0.12)',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>
                      Clinical Institutes
                    </div>
                    {[
                      { name: 'Cardiology & Heart Institute', spec: 'Cardiology', icon: '❤️' },
                      { name: 'Neurosciences & Brain Center', spec: 'Neurology', icon: '🧠' },
                      { name: 'Orthopaedics & Joint Reconstruction', spec: 'Orthopaedics', icon: '🦴' },
                      { name: 'Dermatology & Cosmetology', spec: 'Dermatology', icon: '🧴' },
                      { name: 'Dental & Maxillofacial Surgery', spec: 'Dentistry', icon: '🦷' },
                      { name: 'Internal Medicine & Critical Care', spec: 'General Medicine', icon: '👨‍⚕️' },
                    ].map((dept, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setDeptOpen(false);
                          navigate(`/patient/doctors?q=${encodeURIComponent(dept.spec)}`);
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#334155',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F0F9FF'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '16px' }}>{dept.icon}</span>
                        <span>{dept.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Find Doctor & Book */}
              <NavLink to="/patient/doctors" className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}>
                <Stethoscope size={15} />
                <span>Find Doctors & OPD</span>
              </NavLink>

              {/* Role-Specific Portal Link if Logged in */}
              {config && (
                <NavLink to={user?.role === 'patient' ? '/patient' : user?.role === 'doctor' ? '/doctor' : '/admin'} className="nav-item-link" style={{ color: config.color }}>
                  <User size={15} />
                  <span>{config.label}</span>
                </NavLink>
              )}
            </div>

            {/* Right Action Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              
              {/* 1-Click Evaluation Dropdown */}
              <div ref={demoRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDemoOpen(!demoOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 700,
                    fontSize: '12px',
                    borderColor: '#CBD5E1',
                    color: '#0F2942',
                  }}
                >
                  <Zap size={14} color="#D97706" />
                  <span>Portal Quick Switch</span>
                  <ChevronDown size={12} style={{ transform: demoOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {demoOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '280px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '12px',
                    zIndex: 1000,
                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Select Healthcare Role
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('rohan@patient.demo', 'Patient@123456', 'patient')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        background: '#F8FAFC',
                        marginBottom: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>Rohan Verma</div>
                        <div style={{ fontSize: '11px', color: '#0284C7' }}>Patient Health Hub</div>
                      </div>
                      <span className="badge badge-navy">Patient</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('dr.priya@healthsync.demo', 'Doctor@123456', 'doctor')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        background: '#F8FAFC',
                        marginBottom: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>Dr. Priya Sharma</div>
                        <div style={{ fontSize: '11px', color: '#059669' }}>Cardiology EMR & Notes</div>
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
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        background: '#F8FAFC',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>Hospital Admin</div>
                        <div style={{ fontSize: '11px', color: '#475569' }}>Queues & System Metrics</div>
                      </div>
                      <span className="badge badge-navy">Admin</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Book Appointment CTA */}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/patient/doctors')}
              >
                <span>Book OPD Slot</span>
              </button>

              {user ? (
                <div ref={profileRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setProfileOpen(!profileOpen)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <User size={15} />
                    <span style={{ fontWeight: 700 }}>{user.firstName}</span>
                    <ChevronDown size={12} />
                  </button>

                  {profileOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '8px',
                      minWidth: '200px',
                      zIndex: 1000,
                      boxShadow: '0 15px 30px rgba(15, 23, 42, 0.12)',
                    }}>
                      <div style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', marginBottom: '6px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{user.firstName} {user.lastName}</p>
                        <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>{user.email}</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#DC2626', width: '100%', justifyContent: 'flex-start' }}
                        onClick={handleLogout}
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate('/login')}
                  style={{ fontWeight: 700 }}
                >
                  Doctor / Staff Sign In
                </button>
              )}
            </div>

          </div>
        </div>
      </nav>
    </>
  );
}
