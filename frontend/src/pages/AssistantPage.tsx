import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, Wind, Loader2, AlertCircle } from 'lucide-react';
import { sendChatMessage } from '../utils/api';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  isError?: boolean;
}

const suggested = [
  'What is the current AQI in Delhi?',
  'What is the AQI in Rohini?',
  'What is the AQI in Khan Market and why?',
  'Which areas have the worst air quality right now?',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Hi! I'm AIRA, your AI air quality assistant for Delhi. Ask me about air quality in any location (e.g. 'What is the AQI in Rohini?'), health guidance, or pollution sources.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text);
      setMessages((m) => [...m, { role: 'assistant', text: res.answer || "No response received." }]);
    } catch (err: any) {
      console.error("Chat API error:", err);
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: err.message || "Failed to reach AI chatbot API at http://localhost:8000/chat. Please ensure FastAPI and Ollama are running.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-neutral-900">
      <div className="bg-white rounded-none border border-neutral-300 shadow-sm flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-neutral-300 bg-neutral-800 text-white rounded-none">
          <div className="w-9 h-9 rounded-none bg-neutral-700 border border-neutral-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">AIRA AI Assistant</h3>
            <p className="text-emerald-400 text-[10px] uppercase font-mono font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" /> Live FastAPI (`/chat`) · Grounded RAG
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-100">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-none flex items-center justify-center shrink-0 border ${
                msg.role === 'user' ? 'bg-neutral-700 border-neutral-800 text-white' : msg.isError ? 'bg-red-500 border-red-600 text-white' : 'bg-neutral-800 border-neutral-900 text-white'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : msg.isError ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Wind className="w-4 h-4 text-cyan-400" />
                )}
              </div>
              <div className={`max-w-[80%] p-3.5 rounded-none border ${
                msg.role === 'user'
                  ? 'bg-neutral-800 text-white border-neutral-900'
                  : msg.isError
                  ? 'bg-red-50 text-red-900 border-red-300'
                  : 'bg-white text-neutral-900 border-neutral-300 shadow-sm'
              }`}>
                <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-none bg-neutral-800 border border-neutral-900 flex items-center justify-center shrink-0">
                <Wind className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <div className="bg-white text-neutral-800 p-3.5 rounded-none border border-neutral-300 text-xs font-bold flex items-center gap-2 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
                <span>AIRA is resolving spatial location & running PostGIS RAG reasoning...</span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Suggested Queries */}
        {messages.length <= 2 && !loading && (
          <div className="px-4 pb-2 pt-2 bg-white border-t border-neutral-200 flex flex-wrap gap-2">
            {suggested.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="px-3 py-1.5 rounded-none bg-neutral-100 text-neutral-800 text-xs font-semibold hover:bg-neutral-800 hover:text-white transition border border-neutral-300 uppercase tracking-wide"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-neutral-300 bg-white">
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask about air quality in any location (e.g. 'AQI in Rohini')..."
              className="flex-1 px-3 py-2.5 rounded-none bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs placeholder:text-neutral-500 focus:outline-none focus:bg-white focus:border-neutral-700 font-medium disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-none bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-900 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
