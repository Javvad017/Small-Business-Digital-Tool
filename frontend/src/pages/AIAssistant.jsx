import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Bot, Send, Mic, MicOff, Sparkles, User, Loader2, Trash2 } from 'lucide-react';

const SUGGESTIONS = [
  "What are today's total sales?",
  "Which products are low in stock?",
  "Show me recent transactions",
  "What is my total revenue?",
  "Which is my best selling product?",
  "How many products do I have?",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "👋 Hi! I'm your **SmartBiz AI Assistant**. I have access to your real-time business data.\n\nAsk me anything about your sales, inventory, or transactions!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice input setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
      };
      recognitionRef.current.onerror = () => setListening(false);
      recognitionRef.current.onend = () => setListening(false);
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input not supported in your browser');
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
      toast('🎤 Listening...', { duration: 2000 });
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { message: msg });
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '❌ Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'ai',
      content: "Chat cleared! How can I help you with your business today?"
    }]);
  };

  // Simple markdown-like formatting
  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div style={{ padding: '24px 28px', height: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)'
          }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#e2e8f0' }}>AI Business Assistant</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'pulse-glow 2s infinite' }} />
              <span style={{ fontSize: 12, color: '#64748b' }}>Connected to your business data</span>
            </div>
          </div>
        </div>
        <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 12 }} onClick={clearChat}>
          <Trash2 size={13} /> Clear Chat
        </button>
      </div>

      {/* Suggestion chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, flexShrink: 0 }}>
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => sendMessage(s)}
            disabled={loading}
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 12,
              color: '#a5b4fc',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, sans-serif'
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="glass-card" style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 16,
        padding: 20, marginBottom: 16
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {msg.role === 'user' ? <User size={14} color="white" /> : <Sparkles size={14} color="#a5b4fc" />}
            </div>
            <div
              className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
            />
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles size={14} color="#a5b4fc" />
            </div>
            <div className="chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="glass-card" style={{
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0
      }}>
        <button
          onClick={toggleVoice}
          style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: listening ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${listening ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: listening ? '#f87171' : '#64748b',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
            animation: listening ? 'pulse-glow 1s infinite' : 'none'
          }}
        >
          {listening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <input
          ref={inputRef}
          className="form-input"
          placeholder="Ask about sales, inventory, transactions..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          style={{ flex: 1 }}
        />

        <button
          className="btn-primary"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{ padding: '10px 16px', opacity: (!input.trim() || loading) ? 0.5 : 1 }}
        >
          {loading ? <Loader2 size={16} className="spinner" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
