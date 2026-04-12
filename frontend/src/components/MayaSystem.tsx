import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, X, MessageSquare, Volume2, Sparkles, Brain } from 'lucide-react';
import MayaAvatar from './MayaAvatar';
import { generateMayaResponse, speak, MayaMessage } from '../utils/mayaBrain';
import { useAuth } from '../context/AuthContext';

// Cinematic Activation Sound (Generic URL for demo, can be replaced)
const ACTIVATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";

export default function MayaSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<MayaMessage[]>([
    { role: 'maya', content: "I'm watching your business. Try not to embarrass yourself with a stupid question." }
  ]);
  const [isListening, setIsListening] = useState(false);
  const { user } = useAuth();
  const userName = user?.displayName || user?.email?.split('@')[0] || "Partner";
  const location = useLocation();

  // Hide Maya on public pages
  const hideOnPaths = ['/', '/login', '/signup'];
  if (hideOnPaths.includes(location.pathname)) return null;
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        // 1. Wake word detection
        if (transcript.includes('hey maya') || transcript.includes('ok maya') || transcript.includes('hello maya')) {
          activateMaya();
          return;
        } 
        
        // 2. Chat internal processing
        if (isOpen && transcript.trim() && !isSpeaking && !isThinking) {
           handleSendMessage(transcript);
        }
      };

      recognitionRef.current.start();
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isThinking]);

  const playActivationSound = () => {
    const audio = new Audio(ACTIVATION_SOUND);
    audio.volume = 0.5;
    audio.play().catch(() => {}); // Ignore autoplay blocks
  };

  const activateMaya = () => {
    if (!isOpen) {
      setIsOpen(true);
      playActivationSound();
    }
  };

  const handleSendMessage = async (text: string = userInput) => {
    if (!text.trim() || isThinking) return;

    const newHistory: MayaMessage[] = [...chatHistory, { role: 'user', content: text }];
    setChatHistory(newHistory);
    setUserInput("");
    setIsThinking(true);

    try {
      const response = await generateMayaResponse(text, user?.uid || "anonymous", userName);
      setChatHistory(prev => [...prev, { role: 'maya', content: response }]);
      setIsThinking(false);
      setIsSpeaking(true);
      speak(response, () => setIsSpeaking(false));
    } catch (err) {
      console.error(err);
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Docked Mode (Bottom Right) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 100 }}
            className="fixed bottom-8 right-8 z-[200] group"
          >
             <div className="absolute -top-12 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                "Hey MAYA"
             </div>
             <MayaAvatar mode="dock" onClick={activateMaya} />
             {/* Small status indicator */}
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#020617] animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Mode (Overlay) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8"
          >
            {/* Backdrop Blur */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-6xl h-[80vh] bg-slate-900/50 border border-white/10 rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(79,70,229,0.2)]"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors z-50"
              >
                <X className="w-6 h-6 text-white/50" />
              </button>

              {/* Left Side: Chat Interface */}
              <div className="flex-1 flex flex-col p-8 md:p-12 relative z-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Brain className="w-6 h-6 text-white" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">MAYA Intelligent CFO</h2>
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Active Intelligence
                      </p>
                   </div>
                </div>

                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-hide mb-8"
                >
                  {chatHistory.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-6 rounded-3xl text-sm font-medium leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-sm' 
                          : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl rounded-tl-sm flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100" />
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-200" />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="relative mt-auto">
                    <input 
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask your CFO anything..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 pr-24 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                       <button 
                        onClick={() => setIsListening(!isListening)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                       >
                         <Mic className="w-5 h-5" />
                       </button>
                       <button 
                        onClick={() => handleSendMessage()}
                        className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-500 transition-colors"
                       >
                         <Send className="w-5 h-5" />
                       </button>
                    </div>
                </div>
              </div>

              {/* Right Side: MAYA Avatar */}
              <div className="hidden md:flex flex-[0.8] items-center justify-center bg-gradient-to-br from-indigo-600/10 to-transparent relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
                <MayaAvatar mode="active" isSpeaking={isSpeaking} />
                
                {/* Visualizer when speaking */}
                {isSpeaking && (
                   <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 bg-indigo-600/20 backdrop-blur-xl border border-indigo-500/30 rounded-full">
                     <Volume2 className="w-5 h-5 text-indigo-400" />
                     <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <motion.div 
                            key={i}
                            animate={{ height: [4, 16, 4] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                            className="w-1 bg-indigo-400 rounded-full"
                          />
                        ))}
                     </div>
                   </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
