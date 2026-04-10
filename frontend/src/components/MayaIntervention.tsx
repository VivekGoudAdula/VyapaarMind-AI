import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ShieldAlert, TrendingDown, Wallet, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface InterruptionData {
  reason: string[];
  balance: number;
  runway: number | null;
  risk: string;
}

export default function MayaIntervention() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showInterruption, setShowInterruption] = useState(false);
  const [interruptionData, setInterruptionData] = useState<InterruptionData | null>(null);
  const [flash, setFlash] = useState(false);
  const [lastTriggerTime, setLastTriggerTime] = useState(0);

  const triggerInterruption = (data: InterruptionData) => {
    // Cooldown logic: 2 minutes
    const now = Date.now();
    if (now - lastTriggerTime < 120000) return;

    setInterruptionData(data);
    setLastTriggerTime(now);

    // Step 1: Flash screen
    setFlash(true);
    
    // Play sound if possible
    playAlertSound();

    setTimeout(() => {
      setFlash(false);
      setShowInterruption(true);
    }, 500); // 0.5s flash
  };

  const playAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Sound blocked by browser policy");
    }
  };

  const checkRisk = useCallback(async () => {
    if (!user?.uid) return;

    // Don't check if we are already showing or in cooldown (internal check to avoid extra fetches)
    if (showInterruption || Date.now() - lastTriggerTime < 120000) return;

    try {
      const [summaryRes, predictionRes] = await Promise.all([
        fetch(`${API_URL}/summary/${user.uid}`),
        fetch(`${API_URL}/predict/${user.uid}`)
      ]);

      if (!summaryRes.ok || !predictionRes.ok) return;

      const summary = await summaryRes.json();
      const prediction = await predictionRes.json();

      const reasons: string[] = [];
      if (summary.balance < 0) reasons.push("Negative balance detected");
      if (prediction.days_to_risk !== null && prediction.days_to_risk <= 3) reasons.push(`Runway exhausted (${prediction.days_to_risk} days left)`);
      if (summary.total_expenses > summary.total_income && summary.total_income > 0) {
          if (summary.total_expenses > 1.5 * summary.total_income) {
              reasons.push("Critical Cashflow Ratio (Exp > 150% Inc)");
          }
      }
      
      const isHighRisk = prediction.status === 'danger' || summary.balance < 0 || (prediction.days_to_risk !== null && prediction.days_to_risk <= 3);

      if (reasons.length > 0 && isHighRisk) {
        triggerInterruption({
          reason: reasons,
          balance: summary.balance,
          runway: prediction.days_to_risk,
          risk: "HIGH"
        });
      }
    } catch (error) {
      console.error("Error checking risk:", error);
    }
  }, [user?.uid, lastTriggerTime, showInterruption]);

  useEffect(() => {
    if (user?.uid) {
      // Initial check after a short delay
      const initialTimer = setTimeout(checkRisk, 3000);
      
      const handleUpdate = () => {
        checkRisk();
      };

      window.addEventListener('transaction-updated', handleUpdate);
      return () => {
        clearTimeout(initialTimer);
        window.removeEventListener('transaction-updated', handleUpdate);
      };
    }
  }, [user?.uid, checkRisk]);

  useEffect(() => {
    if (showInterruption) {
      const timer = setTimeout(() => {
        setShowInterruption(false);
      }, 5000); // Auto-hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showInterruption]);

  return (
    <>
      {/* Flash Overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] bg-red-600 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Intervention Modal */}
      <AnimatePresence>
        {showInterruption && interruptionData && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              onClick={() => setShowInterruption(false)}
            />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                x: [0, -4, 4, -4, 4, 0] 
              }}
              transition={{ 
                duration: 0.4, 
                x: { duration: 0.4, times: [0, 0.1, 0.3, 0.5, 0.7, 1] } 
              }}
              className="relative w-[95vw] max-w-2xl min-h-[450px] flex flex-col items-center justify-center bg-gradient-to-b from-red-950/95 to-[#020617] border border-red-500/40 rounded-[3rem] overflow-hidden shadow-[0_0_120px_-10px_rgba(239,68,68,0.8)]"
            >
              {/* Background red pulse */}
              <motion.div 
                animate={{ opacity: [0.1, 0.3, 0.1] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-red-600/10 pointer-events-none" 
              />
              
              <div className="relative z-10 w-full p-10 md:p-14 text-center flex flex-col items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-red-500/20 rounded-[2rem] flex items-center justify-center border border-red-500/40 shadow-lg shadow-red-500/20 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-red-500 font-black uppercase tracking-[0.5em] text-[10px]">⚠️ MAYA SYSTEM OVERRIDE</h4>
                    <h2 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">CRITICAL RISK</h2>
                  </div>
                </div>

                <div className="w-full py-6 border-y border-white/5 bg-red-500/5 backdrop-blur-sm">
                  <h3 className="text-red-100 text-3xl md:text-4xl font-black tracking-tight uppercase leading-none italic">
                    INTERVENTION REQUIRED
                  </h3>
                </div>

                <div className="space-y-4 w-full">
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Alerts:</p>
                    <div className="flex flex-col items-center gap-2">
                      {interruptionData.reason.map((r, i) => (
                        <div key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                          <p className="text-[11px] font-black text-red-200 uppercase tracking-wide">
                            {r}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl mt-2">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">MAYA DIRECTIVE:</p>
                    <p className="text-xl md:text-2xl font-black text-white leading-tight uppercase italic drop-shadow-sm">
                      "FREEZE ALL NON-ESSENTIAL EXPENSES"
                    </p>
                  </div>
                </div>

                {/* Progress bar for 5s auto-hide */}
                <div className="absolute bottom-0 left-0 h-2 bg-red-600/20 w-full overflow-hidden">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)]"
                  />
                </div>
              </div>

              {/* Close Button UI but minimal */}
              <button 
                onClick={() => setShowInterruption(false)}
                className="absolute top-8 right-8 p-2 text-slate-500 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
