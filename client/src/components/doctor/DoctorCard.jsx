import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Languages, Clock, Award, ShieldCheck, Info, X, Phone, Building2, ChevronRight, CheckCircle2 } from 'lucide-react';

const DOCTOR_AVATARS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594824813627-ef3d76e73c38?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
];

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate();
  const [showRefModal, setShowRefModal] = useState(false);

  const user = doctor.userId;
  let name = 'Medical Specialist';
  if (user) {
    const raw = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (raw.startsWith('Dr.') || raw.startsWith('Department') || raw.startsWith('AIIMS') || raw.startsWith('Bansal') || raw.startsWith('Chirayu') || raw.startsWith('City') || raw.includes('Hospital') || raw.includes('Institute')) {
      name = raw;
    } else {
      name = `Dr. ${raw}`;
    }
  }

  const isBookable = doctor.isBookable !== false && doctor.doctorType !== 'REFERENCE';
  const isReference = !isBookable;

  const avatarIdx = Math.abs((doctor._id || '0').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % DOCTOR_AVATARS.length;
  const avatarUrl = doctor.imageUrl || DOCTOR_AVATARS[avatarIdx];

  const handleCardClick = () => {
    if (isBookable) {
      navigate(`/patient/book/${user?._id || doctor._id}`);
    } else {
      setShowRefModal(true);
    }
  };

  return (
    <>
      <div
        id={`doctor-card-${doctor._id}`}
        className="glass-card"
        onClick={handleCardClick}
        style={{
          padding: '0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          border: isReference ? '1px dashed #CBD5E1' : '1px solid #E2E8F0',
          position: 'relative',
        }}
      >
        {/* Top Photo / Header Area */}
        <div style={{ position: 'relative', height: '170px', background: '#F1F5F9', overflow: 'hidden' }}>
          {!name.startsWith('Department') && !name.includes('Hospital') && !name.includes('Institute') ? (
            <img
              src={avatarUrl}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #0F172A, #1E293B)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: 'white', padding: '1rem', textAlign: 'center'
            }}>
              <Building2 size={36} color="#6366F1" style={{ marginBottom: '6px' }} />
              <p style={{ fontSize: '13px', fontWeight: 800 }}>{doctor.hospitalAffiliation || 'Public Medical Institute'}</p>
              <span className="badge badge-dark" style={{ marginTop: '6px', fontSize: '10px' }}>
                Verified OPD Center
              </span>
            </div>
          )}

          {/* Rating Badge */}
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(255, 255, 255, 0.95)', padding: '3px 8px',
            borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '4px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.1)', fontSize: '11px', fontWeight: 800, color: '#0F172A'
          }}>
            <Star size={12} fill="#F59E0B" color="#F59E0B" />
            <span>{doctor.averageRating?.toFixed(1) || '4.8'}</span>
            <span style={{ color: '#64748B', fontWeight: 500 }}>({doctor.totalReviews || 120})</span>
          </div>

          {/* Verification Badge */}
          <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
            {isBookable ? (
              <span className="badge badge-emerald" style={{ fontSize: '10px', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)' }}>
                <CheckCircle2 size={11} /> 5-Min Holdable
              </span>
            ) : (
              <span className="badge badge-indigo" style={{ fontSize: '10px', background: '#FFFFFF', color: '#475569' }}>
                <Info size={11} /> Public Directory
              </span>
            )}
          </div>
        </div>

        {/* Doctor Details Body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px', lineHeight: 1.3 }}>
            {name}
          </h3>

          <p style={{ fontSize: '12px', fontWeight: 700, color: '#4F46E5', marginBottom: '8px' }}>
            {doctor.specialization}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '10px' }}>
            <Award size={13} color="#4F46E5" />
            <span>{doctor.yearsOfExperience} Yrs Experience · {doctor.hospitalAffiliation || doctor.city}</span>
          </div>

          {doctor.bio && (
            <p style={{
              fontSize: '12px',
              color: '#64748B',
              lineHeight: 1.5,
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {doctor.bio}
            </p>
          )}

          {/* Bottom Card Footer */}
          <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Consultation</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                ₹{doctor.consultationFee}
              </div>
            </div>

            {isBookable ? (
              <button
                type="button"
                className="btn btn-primary btn-sm btn-pill"
                onClick={(e) => { e.stopPropagation(); navigate(`/patient/book/${user?._id || doctor._id}`); }}
              >
                <span>Hold Slot</span>
                <ChevronRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-sm btn-pill"
                onClick={(e) => { e.stopPropagation(); setShowRefModal(true); }}
              >
                <span>Clinic Info</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reference Modal */}
      {showRefModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '1rem',
          }}
          onClick={() => setShowRefModal(false)}
        >
          <div
            className="glass-card"
            style={{
              background: '#FFFFFF',
              padding: '2rem',
              maxWidth: '520px', width: '100%',
              boxShadow: '0 25px 50px rgba(15, 23, 42, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-indigo">
                Sourced Public Healthcare Directory
              </span>
              <button onClick={() => setShowRefModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              {name}
            </h3>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#4F46E5', marginBottom: '1rem' }}>
              {doctor.specialization} · {doctor.hospitalAffiliation}
            </p>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569' }}>
                <MapPin size={14} color="#4F46E5" />
                <span><strong>Location:</strong> {doctor.clinicAddress || doctor.city}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569' }}>
                <Clock size={14} color="#4F46E5" />
                <span><strong>OPD Timings:</strong> {doctor.timings || '10:00 AM - 05:00 PM'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569' }}>
                <Phone size={14} color="#4F46E5" />
                <span><strong>Hospital Helpline:</strong> {doctor.phone || '+91 755 408 6000'}</span>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {doctor.bio}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => setShowRefModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                onClick={() => { setShowRefModal(false); navigate('/patient/doctors'); }}
              >
                Browse Bookable Specialists
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
