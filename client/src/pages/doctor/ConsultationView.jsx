import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, User, Pill, ChevronLeft, Plus, Trash2, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/NotificationToast';

const URGENCY_CONFIG = {
  Low:      { badge: 'badge-green',  border: 'var(--color-accent-emerald)' },
  Medium:   { badge: 'badge-sky',    border: 'var(--color-accent-sky)' },
  High:     { badge: 'badge-amber',  border: 'var(--color-accent-amber)' },
  Critical: { badge: 'badge-red',    border: 'var(--color-accent-red)' },
};

const EMPTY_MED = { name: '', dosage: '', frequency: '', durationDays: 14, timing: 'after_food', specialInstructions: '' };

export default function ConsultationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState({ clinicalNotes: '', diagnosis: '' });
  const [vitals, setVitals] = useState({ bloodPressure: '', heartRate: '', temperature: '', oxygenSaturation: '', weight: '' });
  const [medications, setMedications] = useState([{ ...EMPTY_MED }]);
  const [warnings, setWarnings] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const pollRef = useRef(null);

  const fetchAppt = () =>
    api.appointments.getById(id)
      .then((d) => setAppt(d.data))
      .catch(() => {});

  useEffect(() => {
    api.appointments.getById(id)
      .then((d) => setAppt(d.data))
      .catch(() => addToast('Failed to load appointment', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  // Poll every 4 s while AI is still PENDING
  useEffect(() => {
    if (appt?.preVisitAI?.status === 'PENDING') {
      pollRef.current = setInterval(() => {
        fetchAppt();
      }, 4000);
    } else {
      clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [appt?.preVisitAI?.status]);

  const addMed = () => setMedications([...medications, { ...EMPTY_MED }]);
  const removeMed = (i) => setMedications(medications.filter((_, idx) => idx !== i));
  const updateMed = (i, field, val) => setMedications(medications.map((m, idx) => idx === i ? { ...m, [field]: val } : m));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.appointments.submitNotes(id, {
        ...notes,
        vitalSigns: vitals,
        prescription: {
          medications,
          followUpDays: 14,
          warnings: warnings ? warnings.split('\n').filter(Boolean) : [],
        },
      });
      setSubmitted(true);
      addToast('Clinical notes saved. AI is generating patient summary & queuing medication reminders.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-20)' }}><div className="spinner spinner-lg" /></div>;
  if (!appt) return <div style={{ textAlign: 'center', padding: 'var(--space-20)' }}><p className="text-secondary">Appointment not found.</p></div>;

  const { preVisitAI, patientId } = appt;
  const urgencyConf = URGENCY_CONFIG[preVisitAI?.urgencyLevel] || URGENCY_CONFIG.Low;
  const aiIsPending = !preVisitAI?.chiefComplaint || preVisitAI?.status === 'PENDING';

  if (submitted) return (
    <div className="page"><div className="container-sm">
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
          <CheckCircle size={40} color="var(--color-accent-emerald)" />
        </div>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>Consultation Complete</h2>
        <p className="text-secondary" style={{ marginBottom: 'var(--space-4)' }}>Clinical notes saved. Post-visit summary email is being sent to the patient.</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          {['✉️ Summary Email Queued', '💊 Medication Reminders Set', '🤖 AI Summary Generating'].map(t => (
            <span key={t} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, color: '#10b981' }}>{t}</span>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/doctor')}>Return to Schedule</button>
      </div>
    </div></div>
  );

  return (
    <div className="page">
      <div className="container-sm">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-6)' }}><ChevronLeft size={16} /> Back</button>

        <div className="page-header">
          <h1 className="page-title">Consultation</h1>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span><User size={14} style={{ display: 'inline' }} /> {patientId?.firstName} {patientId?.lastName}</span>
            <span className="text-muted text-sm">{patientId?.email}</span>
          </div>
        </div>

        {/* AI Pre-visit Insights — with PENDING state */}
        {aiIsPending ? (
          <div className="card" style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid #7c3aed', background: 'rgba(139,92,246,0.04)', position: 'relative', overflow: 'hidden' }}>
            {/* Shimmer top bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#7c3aed,#0284c7,#7c3aed)', backgroundSize: '200% 100%', animation: 'shimmer 1.8s linear infinite' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <Loader2 size={20} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>AI Pre-Visit Briefing</h2>
              <span className="badge badge-amber" style={{ fontSize: '10px' }}>Analyzing…</span>
            </div>
            <p className="text-sm text-secondary">Gemini AI is analyzing the patient's reported symptoms and generating a clinical briefing. This page will refresh automatically.</p>
            {/* Skeleton lines */}
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[80, 60, 90, 50].map((w, i) => (
                <div key={i} style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.06)', width: `${w}%`, animation: `pulse 1.5s ease-in-out ${i * 0.15}s infinite` }} />
              ))}
            </div>
            {appt.symptoms && (
              <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                <p className="text-xs text-muted font-semibold" style={{ marginBottom: 4 }}>RAW PATIENT SYMPTOMS (from intake form)</p>
                <p className="text-sm">{appt.symptoms}</p>
              </div>
            )}
          </div>
        ) : (
        <div className="card" style={{ marginBottom: 'var(--space-6)', borderLeft: `4px solid ${urgencyConf.border}`, background: 'rgba(139,92,246,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Brain size={20} color="var(--color-accent-violet)" />
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>AI Pre-Visit Briefing</h2>
            <span className={`badge ${urgencyConf.badge}`}>{preVisitAI.urgencyLevel} Priority</span>
          </div>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <p className="text-xs text-muted font-semibold" style={{ marginBottom: 4 }}>CHIEF COMPLAINT</p>
            <p className="text-sm">{preVisitAI.chiefComplaint}</p>
          </div>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <p className="text-xs text-muted font-semibold" style={{ marginBottom: 8 }}>PATIENT'S SYMPTOMS</p>
            <p className="text-sm" style={{ padding: 'var(--space-3)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>{appt.symptoms}</p>
          </div>
          {preVisitAI.suggestedDoctorQuestions?.length > 0 && (
            <div>
              <p className="text-xs text-muted font-semibold" style={{ marginBottom: 8 }}>SUGGESTED QUESTIONS</p>
              {preVisitAI.suggestedDoctorQuestions.map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', padding: 'var(--space-3)', background: 'rgba(139,92,246,0.05)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-accent-violet)', minWidth: 20 }}>Q{i+1}</span>
                  <p className="text-sm">{q}</p>
                </div>
              ))}
            </div>
          )}
          </div>
        )}

        {/* Clinical Notes Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Vitals */}
          <div className="card">
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-5)' }}>Vital Signs</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
              {[
                ['bloodPressure', 'Blood Pressure', '120/80 mmHg'],
                ['heartRate', 'Heart Rate (bpm)', '72'],
                ['temperature', 'Temperature (°C)', '37.0'],
                ['oxygenSaturation', 'SpO2 (%)', '98'],
                ['weight', 'Weight (kg)', '70'],
              ].map(([key, label, placeholder]) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" placeholder={placeholder} value={vitals[key]} onChange={(e) => setVitals({ ...vitals, [key]: e.target.value })} />
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="card">
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-5)' }}>Clinical Notes & Diagnosis</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Diagnosis *</label>
                <input className="form-input" placeholder="e.g. Stable Angina Pectoris" value={notes.diagnosis} onChange={(e) => setNotes({ ...notes, diagnosis: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Clinical Notes *</label>
                <textarea className="form-input form-textarea" style={{ minHeight: 150 }} placeholder="Detailed clinical findings, examination notes, and recommendations..." value={notes.clinicalNotes} onChange={(e) => setNotes({ ...notes, clinicalNotes: e.target.value })} required />
              </div>
            </div>
          </div>

          {/* Prescription */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                <Pill size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--color-accent-emerald)' }} />
                Prescription
              </h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addMed}><Plus size={14} /> Add Medication</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {medications.map((med, i) => (
                <div key={i} style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', position: 'relative' }}>
                  {medications.length > 1 && (
                    <button type="button" className="btn btn-danger btn-icon btn-sm" onClick={() => removeMed(i)} style={{ position: 'absolute', top: 12, right: 12 }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    {[
                      ['name', 'Medication Name', 'e.g. Atorvastatin'],
                      ['dosage', 'Dosage', 'e.g. 40mg'],
                      ['frequency', 'Frequency', 'e.g. Once at bedtime'],
                      ['durationDays', 'Duration (days)', '30'],
                    ].map(([field, label, ph]) => (
                      <div key={field} className="form-group">
                        <label className="form-label">{label}</label>
                        <input className="form-input" placeholder={ph} type={field === 'durationDays' ? 'number' : 'text'} value={med[field]} onChange={(e) => updateMed(i, field, e.target.value)} required />
                      </div>
                    ))}
                    <div className="form-group">
                      <label className="form-label">Timing</label>
                      <select className="form-input form-select" value={med.timing} onChange={(e) => updateMed(i, 'timing', e.target.value)}>
                        <option value="before_food">Before meals</option>
                        <option value="after_food">After meals</option>
                        <option value="with_food">With meals</option>
                        <option value="any">Any time</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Special Instructions</label>
                      <input className="form-input" placeholder="Optional" value={med.specialInstructions} onChange={(e) => updateMed(i, 'specialInstructions', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-group" style={{ marginTop: 'var(--space-5)' }}>
              <label className="form-label">Warnings & Special Instructions (one per line)</label>
              <textarea className="form-input form-textarea" style={{ minHeight: 80 }} placeholder="e.g. Seek emergency care if chest pain worsens..." value={warnings} onChange={(e) => setWarnings(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting
              ? <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Saving & Generating AI Summary...</>
              : <><CheckCircle size={20} /> Complete Consultation</>}
          </button>
        </form>
      </div>
    </div>
  );
}
