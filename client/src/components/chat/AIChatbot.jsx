import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Sparkles, Brain, Bot, ArrowRight, User, Pill, MapPin, Stethoscope, FileText, HeartPulse } from 'lucide-react';
import { api } from '../../services/api';

const QUICK_QUESTIONS = [
  '💊 Medicine prices & Jan Aushadhi generic savings',
  '🏪 24/7 Pharmacies in Bhopal & Indore',
  '🦷 Root canal & dental evaluation cost',
  '❤️ Cardiologists & ECG clinics in your city',
  '🧪 Lab test costs (CBC, Lipid, Thyroid profile)',
  '🩺 How to hold a 30-min slot with AI triage?',
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Welcome to **PulseCare AI Clinical Advisor** powered by Gemini AI.\n\nAsk me anytime about:\n- **PM Jan Aushadhi Generic Medicine Prices & 80% Discounts**\n- **Live 24/7 Pharmacies & Immediate Hospital OPDs**\n- **Symptoms & Urgency Level Classification**\n- **Specialist Recommendations & 30-Minute Slot Holds**",
      suggestedActions: [
        { label: 'Find Specialists', action: '/patient/doctors' },
        { label: 'Bhopal OPD Clinics', action: '/patient/doctors?city=Bhopal' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const msg = textToSend || input;
    if (!msg.trim() || loading) return;

    const userMessage = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await api.ai.chat({
        message: msg,
        history: historyPayload,
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.reply,
          suggestedActions: res.data.suggestedActions || [],
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm currently unable to connect to the live AI engine. You can still browse verified doctors and hold appointment slots directly on PulseCare AI!",
          suggestedActions: [{ label: 'Find Specialists', action: '/patient/doctors' }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} style={{ height: '6px' }} />;

      if (trimmed.startsWith('####')) {
        return <h5 key={i} style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '8px', marginBottom: '4px' }}>{trimmed.replace(/^####\s*/, '')}</h5>;
      }
      if (trimmed.startsWith('###')) {
        return <h4 key={i} style={{ fontSize: '14px', fontWeight: 800, color: '#4F46E5', marginTop: '10px', marginBottom: '6px' }}>{trimmed.replace(/^###\s*/, '')}</h4>;
      }
      if (trimmed === '---') {
        return <hr key={i} style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #E2E8F0' }} />;
      }

      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
      let content = isBullet ? trimmed.replace(/^[-*]\s*/, '') : trimmed;

      const formatted = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

      if (isBullet) {
        return (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', margin: '3px 0' }}>
            <span style={{ color: '#4F46E5', fontWeight: 800 }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: formatted }} />
          </div>
        );
      }

      return (
        <p key={i} style={{ margin: '3px 0', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #10B981 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '9999px',
            padding: '12px 20px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.45)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={15} color="#FFFFFF" />
          </div>
          <span>Ask PulseCare AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: '420px',
          maxWidth: 'calc(100vw - 32px)',
          height: '580px',
          maxHeight: 'calc(100vh - 80px)',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '24px',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #10B981 100%)',
            padding: '16px 20px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}>
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'white', margin: 0 }}>PulseCare AI Advisor</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>Gemini Clinical Intelligence</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ color: 'white', background: 'rgba(255, 255, 255, 0.2)', border: 'none', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Filter Bar */}
          <div style={{ padding: '8px 12px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '6px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#F8FAFC',
          }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                }}
              >
                {m.role === 'assistant' && (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4F46E5, #10B981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'white',
                  }}>
                    <Sparkles size={14} />
                  </div>
                )}

                <div style={{
                  background: m.role === 'user' ? '#4F46E5' : '#FFFFFF',
                  color: m.role === 'user' ? '#FFFFFF' : '#0F172A',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  fontSize: '13px',
                  border: m.role === 'user' ? 'none' : '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                }}>
                  {renderFormattedText(m.content)}

                  {m.suggestedActions?.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
                      {m.suggestedActions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          onClick={() => { setIsOpen(false); navigate(act.action); }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            background: '#ECFDF5',
                            border: '1px solid #10B981',
                            borderRadius: '16px',
                            color: '#065F46',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {act.label} <ArrowRight size={11} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', alignItems: 'center' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4F46E5, #10B981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}>
                  <Sparkles size={14} />
                </div>
                <div style={{
                  background: '#FFFFFF',
                  padding: '10px 16px',
                  borderRadius: '16px',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  color: '#64748B',
                  fontWeight: 600,
                }}>
                  Analyzing symptoms & pricing...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{
              padding: '12px 14px',
              background: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              className="input-control"
              style={{ fontSize: '13px', padding: '10px 14px' }}
              placeholder="Ask about generic prices, dosage, symptoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading || !input.trim()}
              style={{ padding: '10px 16px', borderRadius: '12px' }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
