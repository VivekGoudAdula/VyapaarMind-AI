import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Bell, TrendingDown, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = () => {
    if (!user?.uid) return;
    fetch(`${API_URL}/alerts/${user.uid}`)
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching alerts:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
    window.addEventListener('transaction-updated', fetchAlerts);
    return () => window.removeEventListener('transaction-updated', fetchAlerts);
  }, [user]);

  const handleDismissAll = () => {
    if (!user?.uid) return;
    fetch(`${API_URL}/alerts/user/${user.uid}`, { method: 'DELETE' })
      .then(() => {
        setAlerts([]);
        window.dispatchEvent(new Event('transaction-updated'));
      })
      .catch(console.error);
  };

  // Helper function to map severity to UI styles
  const getUiMapping = (severity: string) => {
    if (severity === "High") {
      return { 
        color: "red", 
        gradient: "from-red-500/20 to-rose-600/5", 
        border: "border-red-500/20",
        icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
        shadow: "shadow-red-500/10"
      };
    } else if (severity === "Positive") {
      return { 
        color: "emerald", 
        gradient: "from-emerald-500/20 to-teal-600/5", 
        border: "border-emerald-500/20",
        icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
        shadow: "shadow-emerald-500/10"
      };
    } else {
      return { 
        color: "amber", 
        gradient: "from-amber-500/20 to-yellow-600/5", 
        border: "border-amber-500/20",
        icon: <TrendingDown className="w-6 h-6 text-amber-400" />,
        shadow: "shadow-amber-500/10"
      };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center text-indigo-400 shadow-2xl backdrop-blur-xl group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
            <Bell className="w-10 h-10 group-hover:rotate-12 transition-transform relative z-10" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 rounded-full border-4 border-slate-950 m-5" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Alerts & Insights</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Strategic Intelligence Feed</p>
            </div>
          </div>
        </div>

        {alerts.length > 0 && (
          <button 
            onClick={handleDismissAll}
            className="px-8 py-4 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-3 backdrop-blur-xl"
          >
            Clear All Intel
          </button>
        )}
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Querying Risk Engine...</p>
          </div>
        ) : alerts.length === 0 ? (
           <div className="bg-white/5 border border-white/10 rounded-[3rem] p-20 text-center backdrop-blur-3xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
               <Bell className="w-10 h-10 text-slate-600" />
             </div>
             <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Feed Neutralized</h3>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active financial risks or signals detected.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {alerts.map((alert, index) => {
              const ui = getUiMapping(alert.severity);
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, type: 'spring', damping: 20 }}
                  whileHover={{ scale: 1.01, x: 10 }}
                  className={`bg-white/5 border ${ui.border} rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-3xl flex flex-col md:flex-row gap-10 items-start md:items-center group relative overflow-hidden`}
                >
                  <div className={`absolute -right-20 -top-20 w-64 h-64 bg-${ui.color}-500/10 blur-[100px] rounded-full group-hover:bg-${ui.color}-500/15 transition-all duration-700 pointer-events-none`} />
                  
                  <div className={`w-20 h-20 rounded-3xl flex-shrink-0 flex items-center justify-center bg-${ui.color}-500/10 border ${ui.border} ${ui.shadow} shadow-lg relative z-10 group-hover:scale-110 transition-transform`}>
                    {ui.icon}
                  </div>

                  <div className="flex-1 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <h3 className="font-black text-2xl tracking-tight text-white uppercase">{alert.severity} Priority Signal</h3>
                        <span className={`px-3 py-1 bg-${ui.color}-500/20 border ${ui.border} text-${ui.color}-400 text-[8px] font-black uppercase tracking-widest rounded-full`}>
                          Active
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-lg font-bold leading-relaxed mb-10 max-w-3xl group-hover:text-white transition-colors">
                      {alert.message}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-1">
                        Execute Action
                      </button>
                      <button 
                        onClick={() => handleDismiss(alert.id)}
                        className="px-10 py-4 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
