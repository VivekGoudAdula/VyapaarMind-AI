import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ShieldCheck, Smartphone, Info, CheckCircle2, Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const smsSamples = [
  "A/c *6789 debited by ₹45 for UPI:910234 at Tea Stall",
  "A/c *6789 credited by ₹25,000 from UPI:CLIENT-PAYMENT",
  "UPI: ₹1,200 paid to ZOMATO-OFFER from A/c *6789",
  "Transaction of ₹45,000 on A/c *6789 via UPI:VENDOR-BILLING",
  "₹1,250 received in A/c *6789 from UPI:CASHBACK-REWARD",
  "A/c *6789 debited by ₹15 for UPI:662341 at General Store",
  "UPI: ₹5,500 paid to AWS-SERVICES from A/c *6789",
  "A/c *6789 debited by ₹15,000 for UPI:OFFICE-RENTAL",
  "₹65,000 credited to A/c *6789 from UPI:SETTLEMENT-FUND",
  "Payment of ₹32,000 received from UPI:NEW-CLIENT-DEPOSIT",
  "A/c *6789 credited by ₹1,500: Salary Bonus Received",
  "Refund of ₹450 processed to A/c *6789 from UPI:AMAZON-REFUND",
  "Transaction of ₹80 on A/c *6789 successful. Bal: ₹12,450"
];

interface Toast {
  id: number;
  message: string;
  type: 'sms' | 'recorded';
}

export default function LiveSMSFeed() {
  const { user } = useAuth();
  const [activeSms, setActiveSms] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToast = (message: string, type: 'sms' | 'recorded') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const parseSMS = (message: string) => {
    // Improved regex to handle commas in amounts
    const cleanMsg = message.replace(/,/g, '');
    const amountMatch = cleanMsg.match(/₹(\d+)/);
    const amount = amountMatch ? parseInt(amountMatch[1]) : 0;

    let type: 'income' | 'expense' = 'expense'; // Default to expense for safety
    const msgLower = message.toLowerCase();

    // Strong Income Indicators
    const incomeKeywords = ['received', 'credited', 'refunded', 'refund', 'bonus', 'salary', 'income'];
    const expenseKeywords = ['debited', 'paid to', 'spent', 'transaction of', 'payment of'];

    const hasIncomeWord = incomeKeywords.some(word => msgLower.includes(word));
    const hasExpenseWord = expenseKeywords.some(word => msgLower.includes(word));

    if (hasIncomeWord && !msgLower.includes('paid to')) {
      type = 'income';
    } else if (hasExpenseWord) {
      type = 'expense';
    }

    // Extraction logic for names
    let name = "Transaction";
    const upiMatch = message.match(/UPI:([^ ]+)/i);
    const atMatch = message.match(/at\s+([^ ]+)/i);
    const toMatch = message.match(/to\s+([^ ]+)/i);
    const fromMatch = message.match(/from\s+UPI:([^ ]+)/i) || message.match(/from\s+([^ ]+)/i);

    if (atMatch) name = atMatch[1];
    else if (toMatch) name = toMatch[1];
    else if (fromMatch) name = fromMatch[1];
    else if (upiMatch) name = upiMatch[1];

    name = name.replace(/[:]/g, '').trim();

    return { amount, type, name, category: "Auto" };
  };

  const [pulse, setPulse] = useState(false);

  const handleDetectedSMS = async (message: string) => {
    if (!user) return;

    setActiveSms(message);
    setPulse(true);
    setTimeout(() => setPulse(false), 2000);
    addToast(`Incoming SMS: "${message}"`, 'sms');

    setIsProcessing(true);
    const parsed = parseSMS(message);

    // Deliberate delay to make the AI parsing phase visible to the user
    setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/transactions/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.uid,
            amount: parsed.amount,
            type: parsed.type,
            category: parsed.category,
            note: `Auto-detected: ${message}`
          }),
        });

        if (response.ok) {
          addToast(`✅ Transaction of ₹${parsed.amount} auto-recorded`, 'recorded');
          // Dispatch event for dashboard refresh
          window.dispatchEvent(new Event("transaction-updated"));
        }
      } catch (error) {
        console.error("Failed to add transaction:", error);
      } finally {
        setIsProcessing(false);
      }
    }, 2500);
  };

  useEffect(() => {
    if (!user) return;

    // 1. Initial trigger 5 seconds after mount/login
    const initialTimeout = setTimeout(() => {
      const randomSms = smsSamples[Math.floor(Math.random() * smsSamples.length)];
      handleDetectedSMS(randomSms);
    }, 5000);

    // 2. Subsequent triggers every 30 seconds
    const interval = setInterval(() => {
      const randomSms = smsSamples[Math.floor(Math.random() * smsSamples.length)];
      handleDetectedSMS(randomSms);
    }, 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [user]);

  return (
    <>
      <motion.div
        animate={pulse ? {
          boxShadow: ["0 0 0px rgba(99, 102, 241, 0)", "0 0 30px rgba(99, 102, 241, 0.4)", "0 0 0px rgba(99, 102, 241, 0)"],
          borderColor: ["rgba(255,255,255,0.1)", "rgba(99,102,241,0.5)", "rgba(255,255,255,0.1)"]
        } : {}}
        transition={{ duration: 2 }}
        className="bg-slate-900/40 border border-white/10 rounded-[2rem] p-4 backdrop-blur-2xl relative overflow-hidden shadow-2xl group transition-all hover:bg-slate-900/60"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all duration-700" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-[11px] font-black text-white uppercase tracking-wider">Live Detection</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                UPI Listening
              </p>
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="px-1.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          </motion.div>
        </div>

        <div className="space-y-3 relative z-10">
          <AnimatePresence mode="wait">
            {activeSms ? (
              <motion.div
                key={activeSms}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">📩</span>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Latest Detection</p>
                  <p className="text-sm font-semibold text-slate-200 leading-tight">"{activeSms}"</p>
                  {isProcessing && (
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      MAYA Parsing...
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Waiting for simulation...</p>
              </div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowAndroidModal(true)}
            className="w-full py-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group/btn"
          >
            <Smartphone className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
            Connect SMS (Android)
          </button>

          <p className="text-[9px] font-black text-slate-600 text-center uppercase tracking-widest">
            ⚡ Simulation Mode (Production architecture)
          </p>
        </div>
      </motion.div>

      {/* TOAST SYSTEM - MOVED BELOW TOPBAR (top-24) */}
      <div className="fixed top-24 right-8 z-[999999] pointer-events-none flex flex-col items-end gap-3 w-full max-w-sm">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -40, scale: 0.8, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.8, x: 20, transition: { duration: 0.2 } }}
              className={`w-full p-4 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] border backdrop-blur-3xl flex items-center gap-4 pointer-events-auto ${toast.type === 'sms'
                  ? "bg-slate-950/80 border-white/10"
                  : "bg-emerald-950/80 border-emerald-500/20"
                }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${toast.type === 'sms' ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white"
                }`}>
                {toast.type === 'sms' ? <Smartphone className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 text-white">
                    {toast.type === 'sms' ? "MESSAGES" : "VYAPAARMIND"}
                  </p>
                  <span className="text-[9px] font-bold opacity-30 text-white uppercase">now</span>
                </div>
                <p className="text-sm font-bold text-white truncate leading-tight">
                  {toast.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ANDROID CONNECT MODAL */}
      <AnimatePresence>
        {showAndroidModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAndroidModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 shadow-lg">
                    <Smartphone className="w-8 h-8 text-indigo-400" />
                  </div>
                  <button onClick={() => setShowAndroidModal(false)} className="text-slate-500 hover:text-white mt-1">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Mobile Integration</h2>

                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      Real-time SMS ingestion is supported via the <span className="text-indigo-400 font-bold">VyapaarMind Android Bridge</span>.
                      The app uses secure device permissions (<code className="bg-white/5 py-0.5 px-1.5 rounded text-indigo-400">READ_SMS</code>)
                      to instantly sync UPI and banking alerts.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-400">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-wider">End-to-End Encrypted Data Bridge</p>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-amber-500 text-xs font-bold leading-snug">
                    <Info className="w-5 h-5 flex-shrink-0" />
                    <p>THIS DEMO: Currently simulating live financial data ingestion to demonstrate the AI parsing engine.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAndroidModal(false)}
                  className="w-full py-4 bg-white text-slate-950 font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]"
                >
                  Confirm Awareness
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
