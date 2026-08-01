import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon.jsx';
import { useMember } from '../memberContext.jsx';

const SUGGESTIONS = [
  "What's the family's overall health?",
  'Who has the highest risk?',
  'Tell me about Rajesh diabetes',
  'Who is the healthiest member?',
  'Any check-ups due soon?',
];

function stripHtml(html) {
  return String(html || '').replace(/<[^>]+>/g, '');
}

function buildReply(question, members) {
  const text = question.toLowerCase();
  const firstName = members.find((m) => {
    const first = m.name.split(' ')[0].toLowerCase();
    return first.length > 1 && text.includes(first);
  });

  if (firstName) {
    const m = firstName;
    const maxScore = m.scores.reduce((a, s) => (s.score > a.score ? s : a), { score: 0 });
    return (
      `${m.name} (${m.relation}, ${m.age} yrs) currently shows ${m.risk} risk overall.\n` +
      `Highest score: ${maxScore.label} at ${maxScore.score}%. Key vitals: BP ${m.bp}, HbA1c ${m.hba1c}, BMI ${m.bmi}.\n` +
      `${stripHtml(m.summary)}`
    );
  }

  if (text.includes('diabet')) {
    const lines = members.map((m) => {
      const d = m.scores.find((s) => s.label.includes('Diabet') || s.label.includes('diabet'));
      return `• ${m.name.split(' ')[0]} — ${d ? `${d.level} risk (${d.score}%)` : 'no diabetes score yet'}`;
    });
    return (
      `Here's the diabetes picture across the family:\n${lines.join('\n')}\n\n` +
      `Rajesh carries the highest diabetes risk (HbA1c 8.4%) — an early specialist review is the priority. Regular HbA1c checks keep everyone on track.`
    );
  }

  if (text.includes('bp') || text.includes('blood pressure') || text.includes('pressure')) {
    const lines = members.map((m) => `• ${m.name.split(' ')[0]} — ${m.bp}`);
    return (
      `Here are the latest blood pressure readings:\n${lines.join('\n')}\n\n` +
      `Rajesh (165/100 mmHg) and Sunita (148/92 mmHg) are above target — worth reviewing their medication and daily salt intake with their doctors.`
    );
  }

  if (text.includes('healthiest') || text.includes('lowest') || text.includes('best health')) {
    const sorted = [...members].sort((a, b) => {
      const ra = Math.max(...a.scores.map((s) => s.score));
      const rb = Math.max(...b.scores.map((s) => s.score));
      return ra - rb;
    });
    const m = sorted[0];
    return (
      `Based on the latest assessments, ${m.name} (${m.relation}, ${m.age} yrs) is the healthiest member — max risk score of ${Math.max(...m.scores.map((s) => s.score))}%. ` +
      `${stripHtml(m.summary)}`
    );
  }

  if (text.includes('risk') || text.includes('highest') || text.includes('high risk')) {
    const sorted = [...members].sort((a, b) => {
      const ra = Math.max(...a.scores.map((s) => s.score));
      const rb = Math.max(...b.scores.map((s) => s.score));
      return rb - ra;
    });
    return (
      `Family risk ranking (by highest risk score):\n` +
      sorted
        .map((m, i) => {
          const max = Math.max(...m.scores.map((s) => s.score));
          return `${i + 1}. ${m.name} — max ${max}%`;
        })
        .join('\n') +
      `\n\nRajesh needs the most urgent attention — I'd recommend an endocrinologist and cardiologist review soon.`
    );
  }

  if (text.includes('checkup') || text.includes('appointment') || text.includes('check-up')) {
    const lines = members.map((m) => `• ${m.name.split(' ')[0]} — ${m.checkupList?.length ? m.checkupList[0] : 'no check-ups listed'}`);
    return (
      `Suggested check-ups for the family:\n${lines.join('\n')}\n\n` +
      `You can track scheduled appointments in the Upcoming Checkups section on the Doctors page.`
    );
  }

  return (
    `I can help with your family's health! Right now I have ${members.length} members on record:\n` +
    members.map((m) => `• ${m.name} (${m.relation}) — ${m.risk}`).join('\n') +
    `\n\nAsk me about diabetes risk, blood pressure, who's healthiest, or any specific member's insights.`
  );
}

export default function AiAssistant() {
  const { members } = useMember();
  const [messages, setMessages] = useState([
    {
      id: 'intro',
      role: 'ai',
      text:
        "Hi, I'm VivRose AI \u2014 your family health assistant. I can answer questions about your family's risk scores, vitals, and next steps. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const send = (raw) => {
    const question = (raw ?? input).trim();
    if (!question || typing) return;
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    timerRef.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: 'ai', text: buildReply(question, members) },
      ]);
      setTyping(false);
    }, 900);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">VivRose AI</div>
        <div className="page-subtitle">Ask anything about your family&apos;s health, risks, and next steps.</div>
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
                {m.text.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
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
            <button key={s} className="ai-suggestion" onClick={() => send(s)} disabled={typing}>
              {s}
            </button>
          ))}
        </div>

        <div className="ai-chat-input-row">
          <input
            className="ai-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about your family's health..."
          />
          <button className="btn btn-primary ai-chat-send" onClick={() => send()} disabled={typing || !input.trim()}>
            <Icon name="arrowRight" size="sm" />
            Send
          </button>
        </div>
      </div>
    </>
  );
}
