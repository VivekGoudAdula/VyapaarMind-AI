import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, AlertTriangle, CheckCircle2, Info, BrainCircuit, Activity, ChevronRight, MessageSquareText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Decision {
  verdict: string;
  logic: string;
  riskLevel: string;
  suggestedAction: string;
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
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [hasSupervityRun, setHasSupervityRun] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isChatting]);

  const { user } = useAuth();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAnalysing || !user?.uid) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const question = input;
    setInput('');
    
    // Only show analyzing state if Supervity hasn't run yet
    if (!hasSupervityRun) {
      setIsAnalysing(true);
    }
    setIsChatting(true);
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // 1. PHASE 1: Fast Conversational Groq Response
    fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.uid, question })
    })
      .then(res => res.json())
      .then(data => {
        const chatMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response
        };
        setMessages(prev => [...prev, chatMsg]);
        setIsChatting(false);
      })
      .catch(err => {
        console.error("Chat error:", err);
        setIsChatting(false);
      });

    // 2. PHASE 2: Deep Supervity Analysis (Slow) - ONLY ONCE PER SESSION
    if (!hasSupervityRun) {
      setHasSupervityRun(true);
      try {
        const res = await fetch(`${API_URL}/ai/decision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.uid, question })
        });
        const data = await res.json();
        
        let parsedDecision: Decision | null = null;
        try {
          if (typeof data.decision === 'string') {
            parsedDecision = JSON.parse(data.decision);
          } else {
            parsedDecision = data.decision;
          }
        } catch (err) {
          parsedDecision = {
            verdict: "ANALYSIS COMPLETED",
            logic: typeof data.decision === 'string' ? data.decision : "No detailed logic available.",
            riskLevel: "Reviewed",
            suggestedAction: "See logic above"
          };
        }
        
        setCurrentDecision(parsedDecision);
        
        // 3. PHASE 3: Post-Decision "Elite Wisdom"
        if (parsedDecision) {
           const wisdomMsg: Message = {
             id: (Date.now() + 2).toString(),
             role: 'assistant',
             content: `The Supervity Engine has finalized its verdict: ${parsedDecision.verdict}. I've populated the Workspace with the deep-dive logic. Based on this, I recommend focusing immediately on ${parsedDecision.suggestedAction.split('.')[0]}.`
           };
           setMessages(prev => [...prev, wisdomMsg]);
        }
      } catch (err) {
        console.error("Decision error:", err);
        setHasSupervityRun(false); // Allow retry if it failed
      } finally {
        setIsAnalysing(false);
      }
    }
  };

  return (
    <div className="h-full flex flex-col max-w-[1600px] mx-auto relative px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <Bot className="w-7 h-7 relative z-10 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase">MAYA Intelligence Hub</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Global Neural Network Active</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Compute Status</span>
            <div className="flex gap-1.5">
               <div className={`w-1.5 h-1.5 rounded-full ${isChatting ? 'bg-indigo-500 animate-pulse' : 'bg-slate-700'}`} />
               <div className={`w-1.5 h-1.5 rounded-full ${isAnalysing ? 'bg-rose-500 animate-pulse' : 'bg-slate-700'}`} />
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Split Screen Container */}
      <div className="flex-1 flex gap-8 min-h-0 mb-6">
        {/* LEFT: Conversation Area */}
        <div className="flex-1 flex flex-col bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
             <div className="flex items-center gap-3">
                <MessageSquareText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Conversational Interface</h3>
             </div>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/10"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border border-white/10 ${
                      msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-indigo-400'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-5 rounded-[1.8rem] text-sm leading-relaxed shadow-xl ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600/10 border border-indigo-500/30 text-white rounded-tr-none' 
                        : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none font-medium'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isChatting && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                   <div className="flex gap-4 items-center pl-12">
                      <div className="flex gap-1.5">
                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">MAYA is thinking...</span>
                   </div>
                </motion.div>
            )}
          </div>

          <div className="p-6 bg-white/[0.02] border-t border-white/10">
            <form onSubmit={handleSend} className="relative group">
              <div className="absolute inset-0 bg-indigo-600/10 blur-2xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask MAYA to analyze a decision..."
                className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-base text-white relative z-10"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isAnalysing}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-30 shadow-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Decision Workspace Area */}
        <div className="w-[400px] flex flex-col bg-slate-900/50 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-md">
           <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
              <div className="flex items-center gap-3">
                 <BrainCircuit className="w-5 h-5 text-rose-500" />
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Decision Workspace</h3>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!currentDecision && !isAnalysing && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                     <Activity className="w-12 h-12 text-slate-700 mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Workspace Awaiting Data...</p>
                     <p className="text-[9px] font-bold text-slate-600 mt-2 max-w-[200px]">Send a query to trigger Elite Supervity Analysis</p>
                  </div>
              )}

              {isAnalysing && !currentDecision && (
                  <div className="space-y-6">
                     <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-4 border border-rose-500/30">
                           <Activity className="w-6 h-6 text-rose-500 animate-pulse" />
                        </div>
                        <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-1">Supervity Active</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">Wait while Supervity analyses your thing... Initiating Deep Risk Diagnostics.</p>
                     </div>
                     
                     <div className="space-y-4 opacity-50">
                        <div className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                        <div className="h-40 bg-white/5 rounded-2xl animate-pulse [animation-delay:0.2s]" />
                     </div>
                  </div>
              )}

              {currentDecision && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`border rounded-3xl p-6 shadow-2xl space-y-6 backdrop-blur-2xl w-full border-t flex flex-col relative overflow-hidden ${
                      currentDecision.verdict.toLowerCase().includes('reject') || currentDecision.verdict.toLowerCase().includes('halt')
                        ? 'bg-gradient-to-br from-red-500/10 to-black/60 border-red-500/30 shadow-red-500/20'
                        : 'bg-gradient-to-br from-emerald-500/10 to-black/60 border-emerald-500/30 shadow-emerald-500/20'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center pb-4 border-b border-white/10 relative z-10">
                      <div className={`px-4 py-1.5 rounded-full border mb-4 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                          currentDecision.riskLevel.toLowerCase().includes('high') || currentDecision.riskLevel.toLowerCase().includes('critical')
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        Risk Exposure: {currentDecision.riskLevel}
                      </div>
                      
                      <h3 className={`text-3xl font-black leading-tight uppercase tracking-tighter mb-2 ${
                          currentDecision.verdict.toLowerCase().includes('reject') || currentDecision.verdict.toLowerCase().includes('halt')
                            ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                            : 'text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                        }`}
                      >
                        {currentDecision.verdict}
                      </h3>
                    </div>

                    <div className="bg-indigo-600/90 rounded-2xl p-5 shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 blur-[30px] rounded-full" />
                      <h4 className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Strategic Action</h4>
                      <p className="text-sm font-black text-white leading-snug">{currentDecision.suggestedAction}</p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                      <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Info className="w-3 h-3" /> Analysis Logic</h4>
                      <div className="space-y-3">
                        {currentDecision.logic.split("WARNING:")[0].split("\n").filter(l => l.trim()).map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                            <p className="text-[11px] font-bold text-slate-300 leading-tight">{item.replace(/^[-•]\s*/, "").trim()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {currentDecision.logic.includes("WARNING:") && (
                        <div className="p-4 bg-red-950/40 border-l-4 border-red-500 rounded-xl">
                           <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1 leading-none">Critical Warning</p>
                           <p className="text-[11px] font-bold text-red-100 leading-tight">
                              {currentDecision.logic.split("WARNING:")[1].trim()}
                           </p>
                        </div>
                    )}
                    
                    <button 
                      onClick={() => setCurrentDecision(null)}
                      className="w-full py-3 mt-4 bg-white/5 hover:bg-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest rounded-xl transition-all border border-white/5"
                    >
                       Archive Decision
                    </button>
                  </motion.div>
              )}
           </div>
           
           <div className="p-6 bg-white/[0.03] border-t border-white/5">
              <div className="flex items-center gap-4">
                 <div className="flex-1">
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: isAnalysing ? '60%' : '100%' }}
                         transition={{ duration: isAnalysing ? 10 : 0.5 }}
                         className={`h-full ${isAnalysing ? 'bg-indigo-500' : 'bg-emerald-500'}`} 
                       />
                    </div>
                 </div>
                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    {isAnalysing ? 'Analyzing...' : 'Standby'}
                 </span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
