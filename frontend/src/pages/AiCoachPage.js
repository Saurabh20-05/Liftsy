import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MdSend, MdPsychology, MdDelete, MdAutoAwesome } from 'react-icons/md';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = ["What should I eat before a workout?","How can I improve my bench press?","Create a 4-day split for muscle gain","How do I fix muscle imbalances?","Best way to lose fat while keeping muscle?","How long should I rest between sets?","Explain progressive overload","I've been training 3 months, what's next?"];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexDirection: isUser ? 'row-reverse' : 'row' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: isUser ? 'var(--accent-dim)' : 'rgba(165,94,234,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div style={{ maxWidth: '80%', background: isUser ? 'var(--accent-dim)' : 'var(--bg-3)', border: `1px solid ${isUser ? 'rgba(232,255,60,0.2)' : 'var(--border)'}`, borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px', padding: '12px 16px' }}>
        {msg.loading ? (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', animation: 'pulse 1.2s infinite', animationDelay: `${i*0.2}s` }} />)}
          </div>
        ) : (
          <div style={{ fontSize: 15, lineHeight: 1.7, color: isUser ? 'var(--accent)' : 'var(--text-1)', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
        )}
        {!msg.loading && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, textAlign: isUser ? 'right' : 'left' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
      </div>
    </div>
  );
}

export default function AiCoachPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([{ role: 'assistant', content: `Hey ${user?.displayName || 'there'}! I am your Liftsy AI Coach. Ask me anything about training, nutrition, recovery, or form tips!`, timestamp: Date.now() }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text.trim(), timestamp: Date.now() };
    const loadingMsg = { role: 'assistant', content: '', loading: true, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setLoading(true);
    try {
      const history = [...messages, userMsg].filter(m => !m.loading).map(m => ({ role: m.role, content: m.content }));
      const res = await aiAPI.coach(history);
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: res.data.message, timestamp: Date.now() }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Unknown error';
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: 'Error: ' + errMsg, timestamp: Date.now() }]);
      toast.error('AI error: ' + errMsg);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => setMessages([{ role: 'assistant', content: 'Chat cleared! Ready for new questions!', timestamp: Date.now() }]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height))', maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ padding: '24px 0 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
            <MdPsychology size={32} color="var(--purple)" /> AI COACH
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 2 }}>Powered by Groq AI (Llama 3.3) - Free and Fast</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={clearChat}><MdDelete size={16} /> Clear</button>
      </div>

      {messages.length === 1 && (
        <div style={{ padding: '16px 0', flexShrink: 0 }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-condensed)', fontWeight: 600 }}>
            <MdAutoAwesome size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Quick Questions
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUICK_PROMPTS.map(prompt => (
              <button key={prompt} onClick={() => sendMessage(prompt)}
                style={{ padding: '7px 14px', borderRadius: 100, fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text-2)', transition: 'all 0.15s', fontFamily: 'var(--font-body)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}>
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column' }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '16px 0 24px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea ref={inputRef} className="form-textarea"
            style={{ flex: 1, minHeight: 48, maxHeight: 120, resize: 'none', lineHeight: 1.5, paddingTop: 12 }}
            placeholder="Ask your AI coach anything..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            disabled={loading} />
          <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}
            style={{ height: 48, width: 48, padding: 0, justifyContent: 'center', flexShrink: 0, borderRadius: 10 }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <MdSend size={20} />}
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, textAlign: 'center' }}>Enter to send - Shift+Enter for new line</p>
      </div>
    </div>
  );
}
