import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Sparkles, X, MapPin, ShieldCheck, Info, CheckCircle2, Stethoscope, Filter
} from 'lucide-react';
import DoctorCard from '../../components/doctor/DoctorCard';
import LocationSelector, { getStoredCity, setStoredCity, POPULAR_CITIES } from '../../components/common/LocationSelector';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/NotificationToast';

const CORE_DEPARTMENTS = [
  'All',
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Dentistry',
  'Neurology',
  'Orthopaedics',
  'Paediatrics',
  'Gastroenterology',
  'Veterinary & Animal Care',
  'Ophthalmology',
  'ENT',
  'Gynecology',
];

const SkeletonCard = () => (
  <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem' }}>
    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#E2E8F0' }} />
    <div style={{ flex: 1 }}>
      <div style={{ width: '50%', height: '16px', background: '#E2E8F0', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ width: '30%', height: '12px', background: '#E2E8F0', borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ width: '80%', height: '10px', background: '#E2E8F0', borderRadius: '4px' }} />
    </div>
  </div>
);

export default function DoctorDiscovery() {
  const [selectedCity, setSelectedCity] = useState(getStoredCity());
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'bookable' | 'reference'

  // AI Triage state
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { addToast } = useToast();

  const fetchDoctors = useCallback(async (cityToUse, specToUse) => {
    setLoading(true);
    try {
      const currentCity = cityToUse !== undefined ? cityToUse : selectedCity;
      const currentSpec = specToUse !== undefined ? specToUse : specialty;

      const params = { limit: 30 };
      if (currentSpec && currentSpec !== 'All') params.specialization = currentSpec;
      if (currentCity && currentCity !== 'All Cities') params.city = currentCity;

      const data = await api.doctors.search(params);
      setDoctors(data.data.doctors || []);
    } catch {
      addToast('Failed to load specialist network. Please check network connection.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedCity, specialty]);

  const executeSearch = async (textQuery) => {
    const q = textQuery !== undefined ? textQuery : searchQuery;
    if (!q || !q.trim()) {
      fetchDoctors(selectedCity, 'All');
      return;
    }

    setAiLoading(true);
    setLoading(true);

    try {
      const data = await api.doctors.aiSearch(q);
      const { aiMatch, doctors: matchedDocs } = data.data;
      setAiResult(aiMatch);

      if (aiMatch.primarySpecialty) {
        setSpecialty(aiMatch.primarySpecialty);
      }

      if (aiMatch.detectedCity) {
        setSelectedCity(aiMatch.detectedCity);
        setStoredCity(aiMatch.detectedCity);
      }

      if (matchedDocs && matchedDocs.length > 0) {
        setDoctors(matchedDocs);
        addToast(`AI matched '${aiMatch.primarySpecialty}' in ${aiMatch.detectedCity || selectedCity}`, 'success');
      } else {
        fetchDoctors(aiMatch.detectedCity || selectedCity, aiMatch.primarySpecialty || 'All');
      }
    } catch {
      fetchDoctors(selectedCity, 'All');
    } finally {
      setAiLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const qParam = urlParams.get('q');
    const cityParam = urlParams.get('city');

    if (cityParam) {
      setSelectedCity(cityParam);
      setStoredCity(cityParam);
    }

    if (qParam) {
      setSearchQuery(qParam);
      executeSearch(qParam);
    } else {
      fetchDoctors(cityParam || selectedCity, 'All');
    }
  }, []);

  const handleCitySelect = (c) => {
    setSelectedCity(c);
    setStoredCity(c);
    setAiResult(null);
    fetchDoctors(c, specialty);
  };

  const handleSpecialtyClick = (dept) => {
    setSpecialty(dept);
    setAiResult(null);
    fetchDoctors(selectedCity, dept);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setAiResult(null);
    setSpecialty('All');
    fetchDoctors(selectedCity, 'All');
  };

  const bookableDoctors = doctors.filter(d => d.isBookable !== false && d.doctorType !== 'REFERENCE');
  const referenceDoctors = doctors.filter(d => d.isBookable === false || d.doctorType === 'REFERENCE');

  const displayedDoctors = doctors.filter((doc) => {
    if (viewTab === 'bookable') return doc.isBookable !== false && doc.doctorType !== 'REFERENCE';
    if (viewTab === 'reference') return doc.isBookable === false || doc.doctorType === 'REFERENCE';
    return true;
  });

  return (
    <div className="page">
      <div className="container">

        {/* ── 1. NORDIC DIRECTORY HEADER ── */}
        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-indigo">
                  <Stethoscope size={13} />
                  Verified Clinical Specialist Network
                </span>
                <span style={{ color: '#CBD5E1' }}>·</span>
                <LocationSelector currentCity={selectedCity} onCityChange={handleCitySelect} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                Specialists & OPD Clinics in <span style={{ color: '#4F46E5' }}>{selectedCity}</span>
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#64748B', margin: '4px 0 0 0' }}>
                Real-time 30-min booking slots with 5-minute atomic reservation holds.
              </p>
            </div>

            {/* Quick Popular City Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>Quick Switch:</span>
              {POPULAR_CITIES.slice(0, 6).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCitySelect(c)}
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    border: selectedCity === c ? '1.5px solid #4F46E5' : '1px solid #E2E8F0',
                    background: selectedCity === c ? '#4F46E5' : '#FFFFFF',
                    color: selectedCity === c ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 2. AI COMMAND SEARCH BAR ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                className="input-control"
                style={{
                  height: '52px',
                  paddingLeft: '48px',
                  paddingRight: searchQuery ? '40px' : '16px',
                  fontSize: '0.95rem',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                }}
                placeholder="Ask Gemini: 'Cardiologist in Indore', 'Skin rash in Bhopal', 'Dentist for root canal'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={aiLoading}
              style={{
                height: '52px',
                padding: '0 24px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              {aiLoading ? (
                <span>Triage Analyzing...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>AI Triage Search</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── 3. AI MATCH BANNER ── */}
        {aiResult && (
          <div className="glass-card" style={{
            background: '#ECFDF5',
            border: '1.5px solid #10B981',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span className="badge badge-emerald">
                  <Sparkles size={12} /> Gemini Match
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#065F46' }}>
                  {aiResult.primarySpecialty} {aiResult.detectedCity ? `in ${aiResult.detectedCity}` : ''}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>
                {aiResult.reasoning}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearSearch}
              className="btn btn-secondary btn-sm"
              style={{ padding: '5px 12px', fontSize: '11px' }}
            >
              Clear Filter ✕
            </button>
          </div>
        )}

        {/* ── 4. HORIZONTAL SPECIALTY PILL TABS ── */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '1.5rem' }}>
          {CORE_DEPARTMENTS.map((dept) => {
            const isSelected = specialty.toLowerCase() === dept.toLowerCase();
            return (
              <button
                key={dept}
                type="button"
                onClick={() => handleSpecialtyClick(dept)}
                className={`pill-tab ${isSelected ? 'active' : ''}`}
              >
                <span>{dept}</span>
              </button>
            );
          })}
        </div>

        {/* ── 5. DIRECTORY VIEW TABS ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1.5px solid #E2E8F0',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setViewTab('all')}
              style={{
                background: 'none', border: 'none', padding: '10px 0',
                borderBottom: viewTab === 'all' ? '3px solid #4F46E5' : '3px solid transparent',
                color: viewTab === 'all' ? '#4F46E5' : '#64748B',
                fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              }}
            >
              All Specialists ({doctors.length})
            </button>

            <button
              type="button"
              onClick={() => setViewTab('bookable')}
              style={{
                background: 'none', border: 'none', padding: '10px 0',
                borderBottom: viewTab === 'bookable' ? '3px solid #10B981' : '3px solid transparent',
                color: viewTab === 'bookable' ? '#10B981' : '#64748B',
                fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              }}
            >
              ⚡ Instant 5-Min Holdable ({bookableDoctors.length})
            </button>

            <button
              type="button"
              onClick={() => setViewTab('reference')}
              style={{
                background: 'none', border: 'none', padding: '10px 0',
                borderBottom: viewTab === 'reference' ? '3px solid #4F46E5' : '3px solid transparent',
                color: viewTab === 'reference' ? '#4F46E5' : '#64748B',
                fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              }}
            >
              🏥 Hospital OPD Directory ({referenceDoctors.length})
            </button>
          </div>

          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
            Showing {displayedDoctors.length} results in {selectedCity}
          </span>
        </div>

        {/* ── 6. DOCTORS GRID ── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : displayedDoctors.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏥</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
              No specialists found for '{searchQuery || specialty}' in {selectedCity}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '1.5rem' }}>
              Try choosing another department or browse all specialties in {selectedCity}.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm btn-pill"
              onClick={handleClearSearch}
            >
              View All Specialists in {selectedCity}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {displayedDoctors.map((doc) => (
              <DoctorCard key={doc._id} doctor={doc} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
