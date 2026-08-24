import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity, Shield, Brain, Calendar, Clock, ChevronRight, Star,
  Zap, Lock, Bell, MapPin, Search, Sparkles, CheckCircle2, Phone,
  Award, Heart, Stethoscope, Building2, UserCheck, ArrowRight, FileText,
  FlaskConical, Check, Pill, AlertTriangle, PhoneCall, Bed, Ambulance,
  HeartPulse, ShieldCheck, HelpCircle, Thermometer, User
} from 'lucide-react';
import { POPULAR_CITIES, setStoredCity, getStoredCity } from '../../components/common/LocationSelector';
import { useToast } from '../../components/ui/NotificationToast';

const CENTRES_OF_EXCELLENCE = [
  {
    id: 'Cardiology',
    title: 'Heart & Vascular Institute',
    spec: 'Cardiology',
    icon: '❤️',
    stat: '14 Board Specialists',
    desc: 'Comprehensive coronary angioplasty, 24/7 primary PCI, electrophysiology & cardiac bypass surgeries.',
    procedures: ['Coronary Angiography', 'ECG & ECHO', 'TMT & Holter', 'Pacemaker Implantation'],
  },
  {
    id: 'Neurology',
    title: 'Institute of Neurosciences & Spine',
    spec: 'Neurology',
    icon: '🧠',
    stat: '9 Board Specialists',
    desc: 'Comprehensive stroke management unit, epilepsy monitoring, neuro-rehabilitation & minimally invasive spine care.',
    procedures: ['Brain MRI & CT', 'EEG / EMG Studies', 'Stroke Rapid Response', 'Spine Reconstruction'],
  },
  {
    id: 'Orthopaedics',
    title: 'Orthopaedics & Joint Replacement',
    spec: 'Orthopaedics',
    icon: '🦴',
    stat: '15 Board Specialists',
    desc: 'Robotic total knee & hip replacement, arthroscopic ligament reconstruction & complex trauma surgery.',
    procedures: ['Robotic Joint Replacement', 'Arthroscopy', 'Sports Injury Clinic', 'Fracture Care'],
  },
  {
    id: 'Dermatology',
    title: 'Dermatology & Cosmetology Center',
    spec: 'Dermatology',
    icon: '🧴',
    stat: '18 Board Specialists',
    desc: 'Clinical management of psoriasis, eczema, acne scar laser revision, and dermatological surgery.',
    procedures: ['Allergy Testing', 'Laser Therapy', 'Skin Biopsy', 'Hair Restoration'],
  },
  {
    id: 'Dentistry',
    title: 'Dental & Maxillofacial Surgery',
    spec: 'Dentistry',
    icon: '🦷',
    stat: '12 Board Specialists',
    desc: 'Microscopic single-sitting root canal treatment, dental implants, orthodontic aligners & oral surgery.',
    procedures: ['Single-Sitting RCT', 'Dental Implants', 'Clear Aligners', 'Teeth Scaling'],
  },
  {
    id: 'General Medicine',
    title: 'Internal Medicine & Critical Care',
    spec: 'General Medicine',
    icon: '👨‍⚕️',
    stat: '24 Board Specialists',
    desc: 'Multidisciplinary outpatient diagnostic clinic, diabetes management, infectious fever panels & 24/7 ICU.',
    procedures: ['Fever & Infection Panel', 'Diabetes Management', 'Hypertension OPD', 'Executive Health Check'],
  },
];

const PREVENTIVE_HEALTH_PACKAGES = [
  {
    title: 'Executive Cardiac Wellness Screen',
    idealFor: 'Age 35+ / History of BP or Cholesterol',
    price: '₹2,499',
    originalPrice: '₹6,800',
    testsCount: '18 Lab & Diagnostic Tests',
    includes: ['12-Lead Resting ECG', '2D Echocardiography', 'Lipid Profile Comprehensive', 'Serum Creatinine', 'Consultation with Senior Cardiologist'],
    tag: 'Recommended',
    spec: 'Cardiology',
  },
  {
    title: 'Comprehensive Master Health Checkup',
    idealFor: 'Full Body Annual Clinical Assessment',
    price: '₹1,799',
    originalPrice: '₹4,500',
    testsCount: '62 Blood & Urine Parameters',
    includes: ['Complete Blood Count (CBC)', 'Liver & Renal Function Tests', 'HbA1c & Fasting Glucose', 'Thyroid Profile (T3, T4, TSH)', 'Internal Medicine Physician Review'],
    tag: 'Popular',
    spec: 'General Medicine',
  },
  {
    title: 'Senior Citizen Comprehensive Panel',
    idealFor: 'Men & Women Age 55+',
    price: '₹2,999',
    originalPrice: '₹8,200',
    testsCount: '70+ Specialized Parameters',
    includes: ['Bone Density (DEXA) Screen', 'Chest X-Ray Digital', 'Cardiac Screen + ECG', 'Vitamin D3 & B12 Levels', 'Geriatric Specialist Consultation'],
    tag: 'Comprehensive',
    spec: 'General Medicine',
  },
];

const JAN_AUSHADHI_PRICING_TABLE = [
  {
    brand: 'Dolo 650',
    salt: 'Paracetamol 650mg IP',
    brandedRate: '₹34 (15 tabs)',
    genericRate: '₹12 (15 tabs)',
    savings: '65% Savings',
    indication: 'Fever, post-operative analgesic, headache & body aches',
  },
  {
    brand: 'Augmentin 625 Duo',
    salt: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    brandedRate: '₹210 (10 tabs)',
    genericRate: '₹65 (10 tabs)',
    savings: '69% Savings',
    indication: 'Respiratory, ENT, dental & soft tissue bacterial infections',
  },
  {
    brand: 'Pan 40',
    salt: 'Pantoprazole Gastro-resistant 40mg',
    brandedRate: '₹125 (15 tabs)',
    genericRate: '₹26 (15 tabs)',
    savings: '79% Savings',
    indication: 'Gastroesophageal reflux disease (GERD) & peptic ulcer prevention',
  },
  {
    brand: 'Telma 40',
    salt: 'Telmisartan 40mg IP',
    brandedRate: '₹135 (15 tabs)',
    genericRate: '₹22 (15 tabs)',
    savings: '84% Savings',
    indication: 'Essential hypertension & cardiovascular risk management',
  },
];

export default function Landing() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(getStoredCity() || 'Bhopal');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      navigate('/patient/doctors');
      return;
    }
    navigate(`/patient/doctors?q=${encodeURIComponent(q)}&ai=true`);
  };

  return (
    <div className="page" style={{ paddingTop: 0 }}>
      
      {/* ========================================================= */}
      {/* 1. CLINICAL EMERGENCY & OPD HERO BANNER */}
      {/* ========================================================= */}
      <section style={{
        background: 'linear-gradient(180deg, #0F2942 0%, #1E3A5F 100%)',
        color: '#FFFFFF',
        padding: '3.5rem 0 4rem 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'center' }}>
            
            {/* Left Column: Hospital Introduction & Search */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <span className="badge badge-emerald">
                  <ShieldCheck size={13} />
                  NABH Accredited Tertiary Care
                </span>
                <span style={{ fontSize: '12px', color: '#93C5FD', fontWeight: 600 }}>
                  Live OPD Appointments Open in {selectedCity}
                </span>
              </div>

              <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                World-Class Clinical Care & <br />
                <span style={{ color: '#38BDF8' }}>Intelligent Doctor Consultations</span>
              </h1>

              <p style={{ fontSize: '1rem', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '580px' }}>
                Book guaranteed 30-minute consultation slots with verified super-specialists. Powered by 5-minute atomic slot reservation holds, clinical symptom triage, and transparent Jan Aushadhi generic pharmacy rates.
              </p>

              {/* Clinical Search Bar */}
              <form onSubmit={handleSearchSubmit} style={{ maxWidth: '600px', marginBottom: '1.25rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#FFFFFF',
                  borderRadius: '10px',
                  padding: '6px 8px 6px 16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                }}>
                  <Search size={18} color="#0284C7" style={{ marginRight: '10px', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Search doctor name, specialty, condition (e.g. 'Cardiology', 'Dr. Priya', 'Fever')..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '14px',
                      color: '#0F172A',
                      fontWeight: 600,
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ padding: '10px 20px', fontWeight: 700 }}
                  >
                    Find Specialists
                  </button>
                </div>
              </form>

              {/* Quick Specialist Links */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px', color: '#94A3B8' }}>
                <span style={{ fontWeight: 700 }}>Frequent OPD:</span>
                {['Cardiology', 'Orthopaedics', 'Dermatology', 'Neurology', 'Dentistry', 'Paediatrics'].map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => navigate(`/patient/doctors?q=${encodeURIComponent(spec)}`)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#E0F2FE',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11.5px',
                      fontWeight: 600,
                    }}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Hospital Live Status & Key Indicators */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '2rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="pulse-indicator" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Hospital Operational Status
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#38BDF8', fontWeight: 700 }}>OPD Active</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(15, 41, 66, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Available Specialists</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>45+</div>
                  <div style={{ fontSize: '11px', color: '#86EFAC' }}>● Real-time OPD Slots</div>
                </div>

                <div style={{ background: 'rgba(15, 41, 66, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Slot Hold Window</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38BDF8' }}>5 Mins</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Zero Double-Booking</div>
                </div>
              </div>

              {/* Rapid Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/patient/doctors')}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'space-between', padding: '12px 18px', borderRadius: '8px' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} />
                    <span>Book Outpatient (OPD) Appointment</span>
                  </span>
                  <ChevronRight size={16} />
                </button>

                <a
                  href="tel:1066"
                  className="btn btn-emergency"
                  style={{ width: '100%', justifyContent: 'space-between', padding: '12px 18px', borderRadius: '8px' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PhoneCall size={16} />
                    <span>Emergency Ambulance (Dial 1066)</span>
                  </span>
                  <span>24/7 Live</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. CENTRES OF EXCELLENCE (SUPER-SPECIALTY INSTITUTES) */}
      {/* ========================================================= */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Building2 size={16} color="#0284C7" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Super-Specialty Clinical Care
                </span>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
                Centres of Clinical Excellence
              </h2>
            </div>

            <button
              type="button"
              onClick={() => navigate('/patient/doctors')}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700 }}
            >
              <span>View All 12 Departments</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Department Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {CENTRES_OF_EXCELLENCE.map((dept) => (
              <div
                key={dept.id}
                className="hospital-card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/patient/doctors?q=${encodeURIComponent(dept.spec)}`)}
              >
                <div className="hospital-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{dept.icon}</span>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
                        {dept.title}
                      </h3>
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                        {dept.stat}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#94A3B8" />
                </div>

                <div className="hospital-card-body">
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {dept.desc}
                  </p>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Key Clinical Procedures:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {dept.procedures.map((p, idx) => (
                        <span key={idx} style={{ fontSize: '11px', fontWeight: 600, background: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: '4px' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284C7' }}>
                      Check Outpatient Slots →
                    </span>
                    <span className="badge badge-navy" style={{ fontSize: '10px' }}>
                      Mon - Sat OPD
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. PREVENTIVE HEALTH CHECKUP PACKAGES */}
      {/* ========================================================= */}
      <section style={{ background: '#F1F5F9', padding: '4rem 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-navy" style={{ marginBottom: '8px' }}>
              <FlaskConical size={13} />
              Preventive Healthcare Diagnostics
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F2942', margin: '0 0 8px 0' }}>
              Executive Health & Wellness Screening Packages
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '640px', margin: '0 auto' }}>
              Early detection saves lives. Schedule comprehensive laboratory diagnostics and specialist doctor reviews with transparent hospital pricing.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {PREVENTIVE_HEALTH_PACKAGES.map((pkg, idx) => (
              <div key={idx} className="hospital-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                
                <div style={{
                  position: 'absolute', top: '14px', right: '14px',
                  background: pkg.tag === 'Recommended' ? '#ECFDF5' : '#E0F2FE',
                  color: pkg.tag === 'Recommended' ? '#065F46' : '#0369A1',
                  border: pkg.tag === 'Recommended' ? '1px solid #A7F3D0' : '1px solid #BAE6FD',
                  fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px'
                }}>
                  {pkg.tag}
                </div>

                <div className="hospital-card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F2942', marginBottom: '4px', paddingRight: '80px' }}>
                    {pkg.title}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '1.25rem', fontWeight: 600 }}>
                    {pkg.idealFor}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '1rem', padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F2942' }}>{pkg.price}</span>
                    <span style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'line-through' }}>{pkg.originalPrice}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', marginLeft: 'auto' }}>Includes 18+ Tests</span>
                  </div>

                  <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Package Inclusions:
                    </div>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pkg.includes.map((item, itemIdx) => (
                        <li key={itemIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                          <Check size={14} color="#059669" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/patient/doctors?q=${encodeURIComponent(pkg.spec)}`)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                  >
                    Schedule Package Screening
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. JAN AUSHADHI GENERIC MEDICINE TRANSPARENCY */}
      {/* ========================================================= */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>
                <Pill size={13} />
                Pradhan Mantri Bhartiya Janaushadhi Pariyojana
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F2942', marginBottom: '1rem' }}>
                Clinical Prescription Price Transparency
              </h2>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                PulseCare supports generic medicine substitution under national clinical pharmacopoeia standards. Identical therapeutic bioequivalence at up to 84% lower cost for outpatient prescriptions.
              </p>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#065F46' }}>80%+</div>
                  <div style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>Average Patient Savings</div>
                </div>
                <div style={{ padding: '12px 16px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0369A1' }}>100%</div>
                  <div style={{ fontSize: '11px', color: '#0284C7', fontWeight: 700 }}>NABL Certified Salts</div>
                </div>
              </div>
            </div>

            {/* Price Table Card */}
            <div className="hospital-card" style={{ overflow: 'hidden' }}>
              <div className="hospital-card-header" style={{ background: '#0F2942', color: '#FFFFFF' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    Standard Salt vs. Jan Aushadhi Generic Rate Card
                  </h3>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>Government PMBJK benchmark price comparison</p>
                </div>
              </div>

              <div style={{ padding: '0' }}>
                {JAN_AUSHADHI_PRICING_TABLE.map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderBottom: idx < JAN_AUSHADHI_PRICING_TABLE.length - 1 ? '1px solid #E2E8F0' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                        {row.brand}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {row.salt}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#059669' }}>
                        {row.genericRate}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                        Branded: {row.brandedRate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. CLINICAL ACCREDITATIONS & QUALITY STANDARDS */}
      {/* ========================================================= */}
      <section style={{ background: '#0A192F', color: '#FFFFFF', padding: '3.5rem 0' }}>
        <div className="container">
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#38BDF8', marginBottom: '4px' }}>1,200+</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#E2E8F0' }}>Hospital Beds Capacity</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>ICU, CCU, NICU & Trauma Units</div>
            </div>

            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#4ADE80', marginBottom: '4px' }}>99.4%</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#E2E8F0' }}>Clinical Outcome Rate</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Post-Surgical Success Tracked</div>
            </div>

            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#38BDF8', marginBottom: '4px' }}>45+</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#E2E8F0' }}>Super-Specialty Doctors</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>DM, MCh, FRCS Board Certified</div>
            </div>

            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#FBBF24', marginBottom: '4px' }}>24/7</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#E2E8F0' }}>Emergency & Trauma Care</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Level-1 Trauma & Stroke Unit</div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. HOSPITAL FOOTER & CAMPUS DIRECTORY */}
      {/* ========================================================= */}
      <footer style={{ background: '#0F2942', color: '#94A3B8', padding: '3.5rem 0 2rem 0', fontSize: '13px' }}>
        <div className="container">
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FFFFFF', marginBottom: '12px' }}>
                <Building2 size={24} color="#38BDF8" />
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>PulseCare Medical Institute</span>
              </div>
              <p style={{ lineHeight: 1.6, color: '#CBD5E1', marginBottom: '1rem' }}>
                A multi-specialty tertiary care hospital & clinical research ecosystem dedicated to patient-first medical excellence, rapid diagnostics, and transparent healthcare.
              </p>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                NABH Reference Code: HOSP-2026-TERT-042
              </div>
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>
                Centres of Excellence
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="/patient/doctors?q=Cardiology" style={{ color: '#CBD5E1' }}>Heart & Vascular Institute</a></li>
                <li><a href="/patient/doctors?q=Neurology" style={{ color: '#CBD5E1' }}>Neurosciences & Spine</a></li>
                <li><a href="/patient/doctors?q=Orthopaedics" style={{ color: '#CBD5E1' }}>Orthopaedics & Joint Care</a></li>
                <li><a href="/patient/doctors?q=Dermatology" style={{ color: '#CBD5E1' }}>Dermatology & Cosmetology</a></li>
                <li><a href="/patient/doctors?q=Dentistry" style={{ color: '#CBD5E1' }}>Dental & Maxillofacial</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>
                Clinical Portals
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="/login" style={{ color: '#CBD5E1' }}>Patient Health Hub</a></li>
                <li><a href="/login" style={{ color: '#CBD5E1' }}>Doctor Clinical EMR</a></li>
                <li><a href="/login" style={{ color: '#CBD5E1' }}>Hospital Administration</a></li>
                <li><a href="/patient/doctors" style={{ color: '#CBD5E1' }}>OPD Doctor Schedule</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>
                Hospital Campus Locations
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#CBD5E1' }}>
                <div><strong>Bhopal Campus:</strong> E-8 Arera Colony</div>
                <div><strong>Indore Campus:</strong> AB Road, Vijay Nagar</div>
                <div><strong>Bengaluru Campus:</strong> Whitefield Main Road</div>
                <div><strong>Emergency Desk:</strong> +91 755 408 6000</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: '#64748B', fontSize: '12px' }}>
            <div>
              © 2026 PulseCare Medical & Research Institute. All rights reserved. JCI & NABH Accredited.
            </div>
            <div>
              Medical Disclaimer: Online appointment slots are subject to confirmed clinical availability.
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
