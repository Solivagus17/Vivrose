import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon.jsx';
import { useMember } from '../memberContext.jsx';
import { apiGet, apiPost } from '../api.js';

const SUGGESTIONS = [
  "What's the family's overall health?",
  'Who has the highest risk?',
  'Tell me about my family',
  'Who is the healthiest member?',
  'Any check-ups due soon?',
];

const DOCTOR_DISCLAIMER = "\n\n*Note: It's always better to consult a real doctor for medical advice and clinical evaluation.*";

function stripHtml(html) {
  return String(html || '').replace(/<[^>]+>/g, '');
}

function formatInlineBold(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('*') && part.endsWith('*') && part.length > 2)) {
      const boldText = part.slice(part.startsWith('**') ? 2 : 1, part.endsWith('**') ? -2 : -1);
      return <strong key={i} style={{ fontWeight: 600 }}>{boldText}</strong>;
    }
    return part;
  });
}

function renderFormattedText(text) {
  if (!text) return null;
  const lines = String(text).split('\n');

  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={idx} style={{ height: 6 }} />;

    if (trimmed.toLowerCase().includes('note:') || trimmed.toLowerCase().includes('disclaimer:')) {
      const cleaned = trimmed.replace(/^\*+|\*+$/g, '');
      return (
        <div key={idx} style={{
          marginTop: 10,
          marginBottom: 4,
          padding: '8px 12px',
          background: 'rgba(212, 154, 42, 0.08)',
          borderLeft: '3px solid #d49a2a',
          borderRadius: 6,
          fontSize: '0.85rem',
          color: '#475569',
          fontStyle: 'italic',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <Icon name="alert" size="xs" />
          <span>{cleaned}</span>
        </div>
      );
    }

    if (trimmed.startsWith('###') || trimmed.startsWith('##') || (trimmed.endsWith(':') && trimmed.length < 50 && !trimmed.includes('http'))) {
      const headerText = trimmed.replace(/^#+\s*/, '').replace(/:$/, '');
      return (
        <div key={idx} style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 8, marginBottom: 4, color: '#0f172a' }}>
          {headerText}
        </div>
      );
    }

    if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletContent = trimmed.replace(/^[•\-\*]\s*/, '');
      return (
        <div key={idx} style={{ display: 'flex', gap: 8, marginTop: 3, marginBottom: 3, paddingLeft: 4 }}>
          <span style={{ color: '#0d9488', fontWeight: 700 }}>•</span>
          <div>{formatInlineBold(bulletContent)}</div>
        </div>
      );
    }

    return (
      <div key={idx} style={{ marginBottom: 4 }}>
        {formatInlineBold(line)}
      </div>
    );
  });
}

function buildReply(question, members) {
  if (!members || members.length === 0) {
    return "I don't have any family members to review yet. Add a family member first, then ask me about their health." + DOCTOR_DISCLAIMER;
  }
  const text = question.toLowerCase();
  const found = members.find((m) => {
    const first = (m.name || '').split(' ')[0].toLowerCase();
    return first.length > 1 && text.includes(first);
  });

  let ans = '';

  if (found) {
    const scores = Array.isArray(found.scores) ? found.scores : [];
    const maxScore = scores.length ? scores.reduce((a, s) => (s.score > a.score ? s : a), { score: 0, label: 'Unknown' }) : { score: 0, label: 'Unknown' };
    ans = (
      `${found.name} (${found.relation || 'Member'}, ${found.age || '?'} yrs) currently shows ${found.risk || 'unknown'} risk overall.\n` +
      `Highest score: ${maxScore.label} at ${maxScore.score}%. Key vitals: BP ${found.bp || '—'}, HbA1c ${found.hba1c || '—'}, BMI ${found.bmi || '—'}.\n` +
      `${stripHtml(found.summary || found.reportSummary || '')}`
    );
  } else if (text.includes('diabet')) {
    const lines = members.map((m) => {
      const scores = Array.isArray(m.scores) ? m.scores : [];
      const d = scores.find((s) => (s.label || '').toLowerCase().includes('diabet'));
      return `• ${(m.name || 'Member').split(' ')[0]} — ${d ? `${d.level} risk (${d.score}%)` : 'no diabetes score yet'}`;
    });
    ans = `Here's the diabetes picture across the family:\n${lines.join('\n')}`;
  } else if (text.includes('bp') || text.includes('blood pressure') || text.includes('pressure')) {
    const lines = members.map((m) => `• ${(m.name || 'Member').split(' ')[0]} — ${m.bp || 'not recorded'}`);
    ans = `Here are the latest blood pressure readings:\n${lines.join('\n')}`;
  } else if (text.includes('healthiest') || text.includes('lowest') || text.includes('best health')) {
    const sorted = [...members].sort((a, b) => {
      const ra = Math.max(0, ...(Array.isArray(a.scores) ? a.scores.map((s) => s.score) : [0]));
      const rb = Math.max(0, ...(Array.isArray(b.scores) ? b.scores.map((s) => s.score) : [0]));
      return ra - rb;
    });
    const m = sorted[0];
    const maxRisk = Math.max(0, ...(Array.isArray(m.scores) ? m.scores.map((s) => s.score) : [0]));
    ans = (
      `Based on the latest assessments, ${m.name} (${m.relation || 'Member'}, ${m.age || '?'} yrs) is the healthiest family member — max risk score of ${maxRisk}%. ` +
      `${stripHtml(m.summary || m.reportSummary || '')}`
    );
  } else if (text.includes('risk') || text.includes('highest') || text.includes('high risk')) {
    const sorted = [...members].sort((a, b) => {
      const ra = Math.max(0, ...(Array.isArray(a.scores) ? a.scores.map((s) => s.score) : [0]));
      const rb = Math.max(0, ...(Array.isArray(b.scores) ? b.scores.map((s) => s.score) : [0]));
      return rb - ra;
    });
    ans = (
      `Family risk ranking (highest to lowest):\n` +
      sorted.map((m, i) => {
        const max = Math.max(0, ...(Array.isArray(m.scores) ? m.scores.map((s) => s.score) : [0]));
        return `${i + 1}. ${m.name} — max ${max}%`;
      }).join('\n')
    );
  } else if (text.includes('family') || text.includes('member') || text.includes('who')) {
    ans = (
      `Here's a quick overview of your ${members.length} family member(s):\n` +
      members.map((m) => {
        const maxRisk = Math.max(0, ...(Array.isArray(m.scores) ? m.scores.map((s) => s.score) : [0]));
        return `• ${m.name} (${m.relation || 'Member'}) — ${m.risk || 'Unknown'} risk, top score ${maxRisk}%`;
      }).join('\n')
    );
  } else {
    ans = (
      `I can help with your family's health! Right now I have ${members.length} member(s) on record:\n` +
      members.map((m) => `• ${m.name} (${m.relation || 'Member'}) — ${m.risk || 'Unknown risk'}`).join('\n') +
      `\n\nAsk me about diabetes risk, blood pressure, who's healthiest, or any specific member's insights.`
    );
  }

  return ans + DOCTOR_DISCLAIMER;
}

export default function AiAssistant() {
  const { members } = useMember();
  const [messages, setMessages] = useState([
    {
      id: 'intro',
      role: 'ai',
      text: "Hi, I'm VivRose AI \u2014 your family health assistant. I can answer questions about your family's risk scores, vitals, medical advice, and next steps. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [llmLogs, setLlmLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await apiGet('/api/assistant/logs');
      setLlmLogs(data?.logs || []);
    } catch (err) {
      console.warn('Failed to fetch LLM logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const openLogsModal = () => {
    setShowLogs(true);
    fetchLogs();
  };

  const send = async (raw) => {
    const question = (raw ?? input).trim();
    if (!question || typing) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: question };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setTyping(true);

    const history = nextMessages
      .slice(-6)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text }));

    try {
      const res = await apiPost('/api/assistant/chat', {
        message: question,
        history,
        members,
      });

      const replyText = res && res.reply;
      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: 'ai', text: replyText || buildReply(question, members) },
      ]);
    } catch (err) {
      console.warn('Backend LLM chat unavailable, using local CDSS engine:', err);
      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: 'ai', text: buildReply(question, members) },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">VivRose AI</div>
          <div className="page-subtitle">Ask anything about your family&apos;s health, risks, and next steps.</div>
        </div>
        <button
          className="btn btn-sm"
          onClick={openLogsModal}
          style={{ background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Icon name="sparkles" size="xs" />
          View LLM Logs
        </button>
      </div>

      <div className="ai-chat-card">
        <div className="ai-chat-scroll" ref={scrollRef}>
          {messages.map((m) => (
            <div key={m.id} className={`ai-chat-msg ${m.role === 'user' ? 'user' : ''}`}>
              {m.role === 'ai' && (
                <span className="ai-chat-avatar">
                  <Icon name="sparkles" size="sm" />
                </span>
              )}
              <div className="ai-chat-bubble">
                {renderFormattedText(m.text)}
              </div>
            </div>
          ))}
          {typing && (
            <div className="ai-chat-msg">
              <span className="ai-chat-avatar">
                <Icon name="sparkles" size="sm" />
              </span>
              <div className="ai-chat-bubble ai-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        <div className="ai-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="ai-suggestion" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="ai-chat-input-row">
          <input
            type="text"
            className="ai-chat-input"
            placeholder="Ask VivRose AI about health, risks, or appointments..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button className="btn btn-primary btn-icon" onClick={() => send()} disabled={!input.trim() || typing}>
            <Icon name="sparkles" size="sm" />
          </button>
        </div>
      </div>

      {showLogs && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 850,
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Live LLM API Conversation Logs</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Step-by-step requests &amp; responses exchanged between VivRose and Groq</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm" onClick={fetchLogs} disabled={loadingLogs}>
                  <Icon name="sparkles" size="xs" /> {loadingLogs ? 'Refreshing...' : 'Refresh'}
                </button>
                <button className="btn btn-sm" onClick={() => setShowLogs(false)}>Close</button>
              </div>
            </div>

            <div style={{ padding: 20, overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
              {loadingLogs && llmLogs.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading LLM API logs...</div>
              ) : llmLogs.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                  No LLM API conversation logs recorded yet. Send a chat message or run an AI Assessment to generate logs!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {llmLogs.map((log) => (
                    <div key={log.id} style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: 16,
                      fontSize: '0.875rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: log.status === 'SUCCESS' ? '#dcfce7' : '#fee2e2',
                            color: log.status === 'SUCCESS' ? '#15803d' : '#b91c1c'
                          }}>
                            {log.statusCode} {log.status}
                          </span>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{log.callType}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {new Date(log.timestamp).toLocaleTimeString()} · {log.durationMs}ms
                        </div>
                      </div>

                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>REQUEST SENT TO GROQ:</div>
                        <pre style={{
                          background: '#0f172a',
                          color: '#e2e8f0',
                          padding: 12,
                          borderRadius: 8,
                          fontSize: '0.78rem',
                          maxHeight: 180,
                          overflowY: 'auto',
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                        }}>
                          {JSON.stringify(log.messages, null, 2)}
                        </pre>
                      </div>

                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>GROQ RESPONSE:</div>
                        <pre style={{
                          background: log.status === 'SUCCESS' ? '#f0fdf4' : '#fff1f2',
                          border: `1px solid ${log.status === 'SUCCESS' ? '#bbf7d0' : '#fecdd3'}`,
                          color: log.status === 'SUCCESS' ? '#166534' : '#991b1b',
                          padding: 12,
                          borderRadius: 8,
                          fontSize: '0.78rem',
                          maxHeight: 220,
                          overflowY: 'auto',
                          margin: 0,
                          whiteSpace: 'pre-wrap'
                        }}>
                          {log.response || log.error || 'No content returned'}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
