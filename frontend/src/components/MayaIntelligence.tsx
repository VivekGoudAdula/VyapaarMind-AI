import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Star, TrendingUp, Sparkles } from 'lucide-react';

const MESSAGES = [
  "MAYA is learning your spending behavior",
  "Pattern recognition improving",
  "Decision accuracy increasing",
  "Analyzing cashflow stability",
  "Risk assessment models updating",
  "Optimizing financial strategy"
];

export default function MayaIntelligence() {
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem("mayaScore");
    return saved ? parseInt(saved) : 72;
  });
  const [displayScore, setDisplayScore] = useState(score);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Increase score on events
    const handleUpdate = () => {
      setIsUpdating(true);
      setScore(prev => {
        const next = Math.min(prev + Math.floor(Math.random() * 3) + 1, 100);
        localStorage.setItem("mayaScore", next.toString());
        return next;
      });
      setTimeout(() => setIsUpdating(false), 1000);
    };

    window.addEventListener('transaction-updated', handleUpdate);
    window.addEventListener('alert-resolved', handleUpdate);
    window.addEventListener('simulation-run', handleUpdate);

    return () => {
      window.removeEventListener('transaction-updated', handleUpdate);
      window.removeEventListener('alert-resolved', handleUpdate);
      window.removeEventListener('simulation-run', handleUpdate);
    };
  }, []);

  // Count-up animation
  useEffect(() => {
    if (displayScore < score) {
      const timer = setTimeout(() => {
        setDisplayScore(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else if (displayScore > score) {
      setDisplayScore(score);
    }
  }, [displayScore, score]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % MESSAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-white/10 rounded-[2rem] p-6 backdrop-blur-2xl relative overflow-hidden group shadow-2xl"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 blur-[50px] rounded-full -ml-12 -mb-12 group-hover:bg-emerald-500/10 transition-all duration-700" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-0.5">MAYA Intelligence</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                Evolution Score
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(i => (
              <Star key={i} className={`w-3 h-3 ${score > 80 ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
            ))}
          </div>
        </div>

        <div className="flex items-end gap-4 mb-6">
          <motion.div 
            key={displayScore}
            initial={{ scale: 0.8, filter: 'blur(5px)' }}
            animate={{ scale: 1, filter: 'blur(0px)' }}
            className="flex flex-col"
          >
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                {displayScore}
              </span>
              <span className="text-xl font-black text-slate-500 uppercase tracking-widest">%</span>
            </div>
          </motion.div>
          
          <div className="flex-1 pb-2">
            <AnimatePresence mode="wait">
              <motion.p 
                key={messageIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1"
              >
                {MESSAGES[messageIndex]}
              </motion.p>
            </AnimatePresence>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              Processing real-time patterns...
            </p>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          {/* Animated Glow on Update */}
          <AnimatePresence>
            {isUpdating && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/20 blur-md z-20"
              />
            )}
          </AnimatePresence>
          
          {/* Progress Fill */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-500 rounded-full flex items-center justify-end pr-1 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
          </motion.div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Awareness Level: {score > 85 ? 'Superior' : score > 75 ? 'Advanced' : 'Learning'}</span>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">+{Math.floor(score/12)} Evolution pts</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
