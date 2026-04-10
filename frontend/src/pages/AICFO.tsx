import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  decision?: {
    verdict: string;
    logic: string;
    riskLevel: string;
    suggestedAction: string;
  };
}

export default function AICFO() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Hello! I am MAYA, your AI CFO. How can I help you with your business decisions today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const { user } = useAuth();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !user?.uid) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/ai/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.uid, question: input })
      });
      const data = await res.json();
      
      let parsedDecision = null;
      try {
        if (typeof data.decision === 'string') {
          parsedDecision = JSON.parse(data.decision);
        } else {
          parsedDecision = data.decision;
        }
      } catch (err) {
        parsedDecision = {
          verdict: "Response",
          logic: typeof data.decision === 'string' ? data.decision : "No detailed logic available.",
          riskLevel: "Reviewed",
          suggestedAction: "See logic above"
        };
      }
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `MAYA is making a financial decision...`,
        decision: parsedDecision
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto relative">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <Bot className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Ask MAYA</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Neural Engine Active</p>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-8 pr-6 scrollbar-thin scrollbar-thumb-white/10"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border border-white/10 shadow-lg ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-indigo-400 backdrop-blur-md'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className="space-y-4">
                  <div className={`p-5 rounded-[2rem] shadow-2xl backdrop-blur-xl border ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600/20 border-indigo-500/30 text-white rounded-tr-none' 
                      : 'bg-white/5 border-white/10 text-slate-200 rounded-tl-none'
                  }`}>
                    <p className="leading-relaxed font-medium">{msg.content}</p>
                  </div>

                  {msg.decision && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`border rounded-[2.5rem] p-8 shadow-2xl space-y-8 backdrop-blur-2xl w-full border-t flex flex-col relative overflow-hidden ${
                        msg.decision.verdict.toLowerCase().includes('reject') || msg.decision.verdict.toLowerCase().includes('halt')
                          ? 'bg-gradient-to-br from-red-500/10 to-black/40 border-red-500/30 shadow-red-500/20'
                          : 'bg-gradient-to-br from-emerald-500/10 to-black/40 border-emerald-500/30 shadow-emerald-500/20'
                      }`}
                    >
                      <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full pointer-events-none z-0 opacity-60 ${
                        msg.decision.verdict.toLowerCase().includes('reject') || msg.decision.verdict.toLowerCase().includes('halt')
                          ? 'bg-red-500/20'
                          : 'bg-emerald-500/20'
                      }`} />
                      
                      {/* VERDICT HERO SECTION */}
                      <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-white/10 relative z-10">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className={`px-5 py-2 rounded-full border mb-6 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-2xl ${
                            msg.decision.riskLevel.toLowerCase().includes('high') || msg.decision.riskLevel.toLowerCase().includes('critical')
                              ? 'bg-red-500/10 text-red-400 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Risk Exposure: {msg.decision.riskLevel}
                        </motion.div>
                        
                        <motion.h3 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className={`text-4xl md:text-5xl font-black leading-tight uppercase tracking-tighter mb-4 px-4 ${
                            msg.decision.verdict.toLowerCase().includes('reject') || msg.decision.verdict.toLowerCase().includes('halt')
                              ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-600 drop-shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                              : 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                          }`}
                        >
                          {msg.decision.verdict}
                        </motion.h3>
                        
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-90 italic">
                          <Sparkles className="w-3 h-3 inline-block mr-1 -mt-0.5 text-indigo-400" />
                          This decision could impact your next 30 days of survival.
                        </p>
                      </div>

                      {/* STRATEGIC ACTION (MAIN CTA) */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-indigo-600 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden z-10 border border-indigo-500/30"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full" />
                        <div className="flex items-start gap-4 relative z-10">
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1 shadow-inner">
                            <CheckCircle2 className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-2">Strategic Action</h4>
                            <p className="text-xl md:text-2xl font-black text-white leading-snug whitespace-pre-wrap">{msg.decision.suggestedAction}</p>
                          </div>
                        </div>
                      </motion.div>

                      {/* CORE LOGIC & WARNING */}
                      <div className="space-y-6 relative z-10">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/5 shadow-inner"
                        >
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Info className="w-4 h-4" /> Core Logic
                          </h4>
                          <div className="space-y-5">
                            {msg.decision.logic.split("WARNING:")[0].split("\n").filter(l => l.trim()).map((item, idx) => (
                              <div key={idx} className="flex items-start gap-4 group">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 shadow-[0_0_12px_rgba(99,102,241,1)] group-hover:scale-150 transition-transform" />
                                <p className="text-base font-bold text-slate-200 leading-relaxed tracking-wide">{item.replace(/^[-•]\s*/, "").trim()}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>

                        {msg.decision.logic.includes("WARNING:") && (
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-start gap-5 bg-red-950/40 border border-red-500/30 p-6 md:p-8 rounded-3xl shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-1.5 bg-red-500 h-full shadow-[0_0_20px_rgba(239,68,68,1)]" />
                            <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 animate-pulse mt-1" />
                            <div>
                              <p className="text-[11px] font-black text-red-400 uppercase tracking-[0.2em] mb-2">Critical Impact Warning</p>
                              <p className="text-lg font-black text-red-100 leading-tight tracking-wide">
                                {msg.decision.logic.split("WARNING:")[1].trim()}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-indigo-400 flex items-center justify-center animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] rounded-tl-none shadow-2xl flex gap-3 items-center backdrop-blur-md">
              <span className="text-sm font-bold text-slate-300">MAYA is analyzing risk, cashflow, and future impact...</span>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="mt-10 relative group">
        <div className="absolute inset-0 bg-indigo-600/20 blur-2xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask MAYA... (e.g. Should I invest ₹50,000 in inventory?)"
          className="w-full pl-8 pr-16 py-6 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg text-white placeholder:text-slate-600 relative z-10"
        />
        <button 
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/40 relative z-20 group"
        >
          <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </form>
    </div>
  );
}
