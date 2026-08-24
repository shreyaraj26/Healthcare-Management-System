import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity, Shield, Brain, Calendar, Clock, ChevronRight, Star,
  Zap, Lock, Bell, MapPin, Search, Sparkles, CheckCircle2, Phone,
  Award, Heart, Stethoscope, Building2, UserCheck, ArrowRight, FileText,
  FlaskConical, Check, Pill, Flame, AlertCircle, HeartPulse, RefreshCw
} from 'lucide-react';
import { POPULAR_CITIES, setStoredCity, getStoredCity } from '../../components/common/LocationSelector';
import { useToast } from '../../components/ui/NotificationToast';

const SEARCH_SUGGESTIONS = [
  { text: 'Cardiologist in Indore', specialty: 'Cardiology', city: 'Indore' },
  { text: 'Skin rash & itching in Bhopal', specialty: 'Dermatology', city: 'Bhopal' },
  { text: 'Dentist for root canal', specialty: 'Dentistry', city: 'Bhopal' },
  { text: 'Veterinary doctor in Bengaluru', specialty: 'Veterinary & Animal Care', city: 'Bengaluru' },
  { text: 'Orthopaedic joint specialist', specialty: 'Orthopaedics', city: 'Bhopal' },
];

const MEDICINES_DATABASE = [
  {
    name: 'Dolo 650 (Paracetamol)',
    salt: 'Paracetamol 650mg',
    brandedPrice: 34,
    janAushadhiPrice: 12,
    quantity: '15 Tablets',
    savingsPercent: 65,
    indication: 'Fever, mild-to-moderate body aches, post-vaccine pain',
  },
  {
    name: 'Augmentin 625 Duo',
    salt: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    brandedPrice: 210,
    janAushadhiPrice: 65,
    quantity: '10 Tablets',
    savingsPercent: 69,
    indication: 'Bacterial infections, respiratory tract, ENT, dental abscess',
  },
  {
    name: 'Pan 40 (Pantoprazole)',
    salt: 'Pantoprazole Gastro-resistant 40mg',
    brandedPrice: 125,
    janAushadhiPrice: 26,
    quantity: '15 Tablets',
    savingsPercent: 79,
    indication: 'Acid reflux (GERD), gastric ulcer, acidity prevention',
  },
  {
    name: 'Telma 40 (Telmisartan)',
    salt: 'Telmisartan 40mg',
    brandedPrice: 135,
    janAushadhiPrice: 22,
    quantity: '15 Tablets',
    savingsPercent: 84,
    indication: 'Hypertension (High Blood Pressure), cardiovascular risk reduction',
  },
  {
    name: 'Glycomet 500 (Metformin)',
    salt: 'Metformin Hydrochloride 500mg IP',
    brandedPrice: 48,
    janAushadhiPrice: 11,
    quantity: '10 Tablets',
    savingsPercent: 77,
    indication: 'Type 2 Diabetes Mellitus glycemic control',
  },
  {
    name: 'Montair-LC',
    salt: 'Levocetirizine 5mg + Montelukast 10mg',
    brandedPrice: 195,
    janAushadhiPrice: 45,
    quantity: '10 Tablets',
    savingsPercent: 77,
    indication: 'Allergic rhinitis, asthma flare-up, seasonal sneezing & congestion',
  },
];

const SYMPTOM_TRIAGE_SCENARIOS = [
  {
    id: 'chest',
    icon: '❤️',
    label: 'Chest Tightness & Palpitations',
    urgency: 'Critical',
    urgencyColor: '#F43F5E',
    urgencyBg: '#FFF1F2',
    specialty: 'Cardiology',
    advice: 'Immediate ECG & Troponin evaluation. Do not delay.',
    suggestedQuestions: ['Are symptoms radiating to the left arm?', 'Do you have a history of hypertension?'],
  },
  {
    id: 'skin',
    icon: '🧴',
    label: 'Erythematous Skin Rash & Itching',
    urgency: 'Medium',
    urgencyColor: '#F59E0B',
    urgencyBg: '#FEF3C7',
    specialty: 'Dermatology',
    advice: 'Antihistamine symptomatic relief; consult a dermatologist.',
    suggestedQuestions: ['Did this appear after contact with allergens?', 'Any facial swelling or difficulty breathing?'],
  },
  {
    id: 'dental',
    icon: '🦷',
    label: 'Severe Throbbing Toothache',
    urgency: 'Medium',
    urgencyColor: '#F59E0B',
    urgencyBg: '#FEF3C7',
    specialty: 'Dentistry',
    advice: 'Possible dental pulp infection requiring root canal evaluation.',
    suggestedQuestions: ['Is the pain aggravated by hot/cold liquids?', 'Is there visible gum swelling?'],
  },
  {
    id: 'fever',
    icon: '🌡️',
    label: 'High Fever (102°F) with Chills',
    urgency: 'High',
    urgencyColor: '#EA580C',
    urgencyBg: '#FFEDD5',
    specialty: 'General Medicine',
    advice: 'CBC & viral screening recommended; maintain adequate oral hydration.',
    suggestedQuestions: ['How many days has fever persisted?', 'Any persistent vomiting or body aches?'],
  },
  {
    id: 'pet',
    icon: '🐾',
    label: 'Pet Lethargy & Appetite Loss',
    urgency: 'Medium',
    urgencyColor: '#F59E0B',
    urgencyBg: '#FEF3C7',
    specialty: 'Veterinary & Animal Care',
    advice: 'Schedule a clinical checkup with an animal care specialist.',
    suggestedQuestions: ['Is the pet vomiting or refusing all fluids?', 'Is vaccination status up to date?'],
  },
];

const SPECIALTY_DEPARTMENTS = [
  { id: 'Cardiology', label: 'Cardiology', icon: '❤️', doctors: '14 Specialists', desc: 'ECG, Angiography, BP Management, Lipid profiles' },
  { id: 'Dermatology', label: 'Dermatology', icon: '🧴', doctors: '18 Specialists', desc: 'Skin allergies, Acne protocols, Laser, Eczema' },
  { id: 'Dentistry', label: 'Dentistry', icon: '🦷', doctors: '12 Specialists', desc: 'Root canal, Dental implants, Teeth scaling, Aligners' },
  { id: 'Neurology', label: 'Neurology', icon: '🧠', doctors: '9 Specialists', desc: 'Stroke rehabilitation, Migraines, Nerve conduction' },
  { id: 'Orthopaedics', label: 'Orthopaedics', icon: '🦴', doctors: '15 Specialists', desc: 'Joint replacement, Fracture fixation, Spine care' },
  { id: 'General Medicine', label: 'General Medicine', icon: '👨‍⚕️', doctors: '24 Specialists', desc: 'Fever panels, Diabetes, Preventive wellness OPD' },
];

export default function Landing() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(getStoredCity() || 'Bhopal');
  const [activeTriage, setActiveTriage] = useState(SYMPTOM_TRIAGE_SCENARIOS[0]);
  const [selectedMedIndex, setSelectedMedIndex] = useState(0);
  const [medQuantity, setMedQuantity] = useState(2);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      navigate('/patient/doctors');
      return;
    }
    navigate(`/patient/doctors?q=${encodeURIComponent(q)}&ai=true`);
  };

  const handleQuickSuggestion = (item) => {
    setSearchQuery(item.text);
    if (item.city) {
      setSelectedCity(item.city);
      setStoredCity(item.city);
    }
    navigate(`/patient/doctors?q=${encodeURIComponent(item.text)}&ai=true`);
  };

  const selectedMed = MEDICINES_DATABASE[selectedMedIndex];
  const totalBranded = selectedMed.brandedPrice * medQuantity;
  const totalJanAushadhi = selectedMed.janAushadhiPrice * medQuantity;
  const totalSavings = totalBranded - totalJanAushadhi;

  return (
    <div className="page" style={{ paddingTop: '1.5rem' }}>
      <div className="container">
        
        {/* ========================================================= */}
        {/* 1. ASYMMETRIC BENTO GRID HERO */}
        {/* ========================================================= */}
        <div className="bento-grid" style={{ marginBottom: '3.5rem' }}>
          
          {/* Main Hero Card (8 Cols) */}
          <div className="bento-col-8 glass-card" style={{
            padding: '2.5rem',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
            border: '1px solid rgba(79, 70, 229, 0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Top decorative gradient orb */}
            <div style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <span className="badge badge-indigo">
                <Sparkles size={13} />
                Next-Gen Clinical Ecosystem
              </span>
              <span className="badge badge-emerald">
                <CheckCircle2 size={13} />
                2-Phase Atomic Slot Hold
              </span>
            </div>

            <h1 style={{ fontSize: '2.75rem', lineHeight: 1.15, marginBottom: '1.25rem', fontWeight: 800 }}>
              Intelligent Healthcare, <br />
              <span className="gradient-text-primary">Instant Triage & 30-Min Holds.</span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: '600px', lineHeight: 1.6 }}>
              Experience clinical appointment booking powered by Gemini AI triage, zero double-booking 5-minute atomic locks, and transparent Jan Aushadhi generic pharmacy savings.
            </p>

            {/* Live AI Command Search Bar */}
            <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '6px 8px 6px 16px',
                border: '2px solid #E2E8F0',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                transition: 'all 0.2s',
              }}>
                <Search size={20} color="#4F46E5" style={{ marginRight: '10px', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Ask anything: 'Cardiologist in Indore', 'Rash in Bhopal', 'Dentist'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.95rem',
                    color: '#0F172A',
                    fontWeight: 500,
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-pill"
                  style={{ padding: '10px 22px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Sparkles size={15} />
                  <span>AI Triage</span>
                </button>
              </div>
            </form>

            {/* Quick Query Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>Try asking:</span>
              {SEARCH_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickSuggestion(item)}
                  style={{
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    borderRadius: '9999px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4F46E5';
                    e.currentTarget.style.color = '#4F46E5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.color = '#475569';
                  }}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>

          {/* Right Bento Column: Live System Pulse & 1-Click Evaluation (4 Cols) */}
          <div className="bento-col-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Live Metrics Card */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live System Health
                </span>
                <span className="pulse-dot" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4F46E5' }}>5 Min</div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Atomic Slot Hold</div>
                </div>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>80% ↓</div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Generic Drug Savings</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#475569' }}>
                <Shield size={16} color="#10B981" />
                <span>Zero Double-Booking Guarantee via MongoDB locks</span>
              </div>
            </div>

            {/* Quick 1-Click Role Login Bento Box */}
            <div className="glass-card-dark" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Zap size={16} color="#F59E0B" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Instant Demo Portal Access
                  </span>
                </div>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.15rem', marginBottom: '1rem' }}>
                  Evaluate Portals in 1-Click
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={async () => {
                    await login({ email: 'rohan@patient.demo', password: 'Patient@123456' });
                    navigate('/patient');
                  }}
                  className="btn btn-sm"
                  style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.2)', justifyContent: 'space-between' }}
                >
                  <span>👤 Patient Hub (Rohan)</span>
                  <ChevronRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await login({ email: 'dr.priya@healthsync.demo', password: 'Doctor@123456' });
                    navigate('/doctor');
                  }}
                  className="btn btn-sm"
                  style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7', border: '1px solid rgba(16, 185, 129, 0.4)', justifyContent: 'space-between' }}
                >
                  <span>🩺 Doctor Schedule (Dr. Priya)</span>
                  <ChevronRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await login({ email: 'admin@healthsync.demo', password: 'Admin@123456' });
                    navigate('/admin');
                  }}
                  className="btn btn-sm"
                  style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#C7D2FE', border: '1px solid rgba(99, 102, 241, 0.4)', justifyContent: 'space-between' }}
                >
                  <span>🛡️ Admin Command Center</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. INTERACTIVE LIVE AI CLINICAL TRIAGE SIMULATOR */}
        {/* ========================================================= */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>
              <Brain size={13} />
              Interactive Clinical Simulation
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
              Live AI Symptom Triage Simulator
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Tap any clinical scenario below to see real-time AI urgency classification & recommended specialist.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem', border: '1.5px solid rgba(79, 70, 229, 0.2)' }}>
            
            {/* Scenario Chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '2rem' }}>
              {SYMPTOM_TRIAGE_SCENARIOS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTriage(item)}
                  className={`triage-option-chip ${activeTriage.id === item.id ? 'selected' : ''}`}
                >
                  <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                  <span style={{ textAlign: 'left' }}>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Live Triage Output Visualizer */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '16px',
              padding: '1.75rem',
              border: '1px solid #E2E8F0',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 800,
                    background: activeTriage.urgencyBg,
                    color: activeTriage.urgencyColor,
                    border: `1px solid ${activeTriage.urgencyColor}`,
                  }}>
                    Urgency Level: {activeTriage.urgency}
                  </span>
                  <span className="badge badge-indigo">
                    Matched: {activeTriage.specialty}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0F172A' }}>
                  AI Clinical Assessment
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {activeTriage.advice}
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/patient/doctors?q=${encodeURIComponent(activeTriage.specialty)}`)}
                    className="btn btn-primary btn-sm btn-pill"
                  >
                    <span>Book {activeTriage.specialty} Specialist</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Doctor Questions Synthesized */}
              <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '1.5rem' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.04em' }}>
                  Suggested Pre-Visit Questions for Doctor:
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeTriage.suggestedQuestions.map((q, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#334155' }}>
                      <Check size={14} color="#10B981" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. INTERACTIVE JAN AUSHADHI GENERIC MEDICINE CALCULATOR */}
        {/* ========================================================= */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>
              <Pill size={13} />
              Govt PMBJK Jan Aushadhi Intelligence
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
              Generic vs. Branded Medicine Price Calculator
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              See how much you save on identical salt compositions with PM Jan Aushadhi generic equivalents.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem', border: '1.5px solid rgba(16, 185, 129, 0.2)' }}>
            
            {/* Medicine Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '2rem', justifyContent: 'center' }}>
              {MEDICINES_DATABASE.map((med, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedMedIndex(idx)}
                  className={`pill-tab ${selectedMedIndex === idx ? 'active' : ''}`}
                >
                  <Pill size={14} />
                  <span>{med.name}</span>
                </button>
              ))}
            </div>

            {/* Price Comparison Display */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid #E2E8F0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase' }}>
                    Active Salt Composition
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                    {selectedMed.name} ({selectedMed.quantity})
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                    Salt: {selectedMed.salt}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Number of Packs:</span>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '8px', background: '#FFFFFF', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => setMedQuantity(Math.max(1, medQuantity - 1))}
                      style={{ padding: '6px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}
                    >
                      -
                    </button>
                    <span style={{ padding: '6px 12px', fontWeight: 800, color: '#0F172A', minWidth: '30px', textAlign: 'center' }}>
                      {medQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMedQuantity(medQuantity + 1)}
                      style={{ padding: '6px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Comparison Bars */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                
                {/* Branded Box */}
                <div style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Standard Branded Price</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#64748B', textDecoration: 'line-through' }}>
                    ₹{totalBranded}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>₹{selectedMed.brandedPrice} / pack</div>
                </div>

                {/* Jan Aushadhi Box */}
                <div style={{ padding: '1.25rem', background: '#ECFDF5', borderRadius: '12px', border: '1.5px solid #10B981' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#065F46' }}>PM Jan Aushadhi (Generic)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>
                    ₹{totalJanAushadhi}
                  </div>
                  <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>₹{selectedMed.janAushadhiPrice} / pack</div>
                </div>

                {/* Total Savings Hero Box */}
                <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '12px', color: '#FFFFFF', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, opacity: 0.9 }}>Your Instant Savings</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900 }}>
                    ₹{totalSavings}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '9999px', display: 'inline-block' }}>
                    {selectedMed.savingsPercent}% Discount
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. CLINICAL SPECIALTY DEPARTMENTS */}
        {/* ========================================================= */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>
                <Stethoscope size={13} />
                Multi-City Clinical Grid
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
                Explore Clinical Departments
              </h2>
            </div>

            <button
              type="button"
              onClick={() => navigate('/patient/doctors')}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700 }}
            >
              <span>View All Specialists</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {SPECIALTY_DEPARTMENTS.map((dept) => (
              <div
                key={dept.id}
                onClick={() => navigate(`/patient/doctors?q=${encodeURIComponent(dept.id)}`)}
                className="glass-card"
                style={{ padding: '1.5rem', cursor: 'pointer', position: 'relative' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{dept.icon}</span>
                  <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
                    {dept.doctors}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0F172A' }}>
                  {dept.label}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {dept.desc}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#4F46E5' }}>
                  <span>Check Available 30-min Slots</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
