import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, Wind } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const suggested = [
  'What is the current AQI in Patiala?',
  'Which areas have the worst air quality right now?',
  'Why is the AQI rising today?',
  'Should I go for a run this evening?',
];

const responses: Record<string, string> = {
  'What is the current AQI in Patiala?': 'The current AQI in Patiala is 143, which falls in the "Poor" category. The dominant pollutant is PM2.5 at 65 µg/m³. Sensitive groups should limit prolonged outdoor exertion.',
  'Which areas have the worst air quality right now?': 'The worst air quality is in Connaught Place (AQI 232, Very Poor) and Ranaur (AQI 201, Very Poor). The best air quality is in Pehlana (AQI 89, Moderate) and Bhadson (AQI 98, Moderate).',
  'Why is the AQI rising today?': 'The AQI is rising due to three factors: (1) a temperature inversion trapping pollutants near the surface, (2) NW winds carrying smoke from crop burning contributing ~35% of PM2.5, and (3) peak traffic hours. Expect improvement by tomorrow morning.',
  'Should I go for a run this evening?': 'Not recommended. AQI is expected to peak at 195 around 6 PM (Very Poor). If you must exercise outdoors, wear an N95 mask and choose early morning (before 7 AM) when AQI drops below 110. Indoor exercise is the safest option today.',
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Hi! I'm AIRA, your AI air quality assistant. Ask me anything about current air quality, health advice, or pollution sources.",
    },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    setTimeout(() => {
      const reply = responses[text] || "I'm analyzing that question based on current sensor data. Based on the latest readings, the AQI in Patiala is 143 (Poor) with PM2.5 as the dominant pollutant. Would you like specific health advice or area-wise breakdown?";
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);
    }, 600);
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-slate-700/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">AIRA — AI Assistant</h3>
            <p className="text-emerald-400 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online · Powered by sensor data
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-slate-700' : 'bg-gradient-to-br from-cyan-400 to-blue-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-slate-300" /> : <Wind className="w-4 h-4 text-white" />}
              </div>
              <div className={`max-w-[75%] p-3.5 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-cyan-500/15 text-cyan-100 rounded-tr-sm'
                  : 'bg-slate-900/60 text-slate-200 rounded-tl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Suggested */}
        {messages.length <= 2 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {suggested.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="px-3 py-1.5 rounded-full bg-slate-700/50 text-slate-300 text-xs hover:bg-cyan-500/15 hover:text-cyan-300 transition border border-slate-700/50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-700/50">
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about air quality..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
            />
            <button
              type="submit"
              className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:opacity-90 transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
