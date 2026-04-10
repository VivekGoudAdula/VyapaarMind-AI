import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Wallet, AlertCircle, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // FINAL PHASE STATES
  const [autoDecision, setAutoDecision] = useState<any>(null);
  const [loadingMaya, setLoadingMaya] = useState(false);
  const [simAmount, setSimAmount] = useState("");
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  const fetchSummary = () => {
    if (!user?.uid) return;
    setLoading(true);
    fetch(`${API_URL}/summary/${user.uid}`)
      .then(res => res.json())
      .then(data => {
        const chartData = Object.entries(data.category_breakdown).map(([name, value]) => ({
          name,
          value
        }));
        setSummary({
          ...data,
          chartData: chartData.length > 0 ? chartData : [{ name: 'No Expenses', value: 0 }]
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching summary:", err);
        setLoading(false);
      });
  };

  const fetchPrediction = () => {
    if (!user?.uid) return;
    fetch(`${API_URL}/predict/${user.uid}`)
      .then(res => res.json())
      .then(setPrediction)
      .catch(console.error);
  };

  const fetchAllAlerts = () => {
    if (!user?.uid) return;
    fetch(`${API_URL}/alerts/${user.uid}`)
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        if (data && data.length > 0) {
          // If the first alert is very new, show it in the banner
          const isFresh = (new Date().getTime() - new Date(data[0].created_at).getTime()) < 30000;
          if (isFresh) {
            setActiveAlert(data[0]);
            
            // Trigger Maya if high risk detected
            if (data[0].severity === "High") {
              triggerMayaAnalysis();
            }

            setTimeout(() => setActiveAlert(null), 3000);
          }
        }
      })
      .catch(console.error);
  };

  const triggerMayaAnalysis = () => {
    setLoadingMaya(true);
    setTimeout(() => {
      fetch(`${API_URL}/latest-decision/${user?.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.detail) {
            setAutoDecision(data);
          }
          setLoadingMaya(false);
        })
        .catch(() => setLoadingMaya(false));
    }, 2000);
  };

  const runSimulation = async () => {
    if (!user?.uid || !simAmount) return;
    
    // Extract the first number found in the string
    const match = simAmount.replace(/,/g, '').match(/(\d+)/);
    const amount = match ? Number(match[0]) : null;

    if (amount === null) {
      alert("Please include a number in your scenario (e.g. 'Invest ₹50,000')");
      return;
    }

    setSimLoading(true);
    try {
      const res = await fetch(`${API_URL}/simulate/${user.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      setSimResult({ ...data, scenario: simAmount });
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchSummary();
      fetchPrediction();
      fetchAllAlerts();
    }

    const handleUpdate = () => {
      fetchSummary();
      fetchPrediction();
      fetchAllAlerts();
    };

    window.addEventListener('transaction-updated', handleUpdate);
    return () => window.removeEventListener('transaction-updated', handleUpdate);
  }, [user]);

  if (loading || !summary) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <span className="text-xs font-black uppercase tracking-widest text-slate-500">Initializing Command Center...</span>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* LATEST ALERT BANNER - AUTO HIDES IN 3 SECS */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className={`p-4 rounded-2xl text-sm font-bold shadow-2xl flex items-center justify-between gap-3 backdrop-blur-xl border overflow-hidden ${
              activeAlert.severity === "High"
                ? "bg-red-500/10 border-red-500/50 text-red-400"
                : activeAlert.severity === "Positive"
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/50 text-amber-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeAlert.severity === "Positive" ? "✅" : "⚠️"}</span>
              <div>
                <p className="uppercase text-[10px] tracking-widest opacity-60">{activeAlert.severity} Priority Alert</p>
                <p>{activeAlert.message}</p>
              </div>
            </div>
            <div className="w-1 h-8 bg-white/10 rounded-full hidden md:block" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title="Total Income" 
          value={`₹${summary.total_income.toLocaleString()}`} 
          change="+12.5%" 
          trend="up"
          icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
          color="emerald"
        />
        <StatCard 
          title="Total Expenses" 
          value={`₹${summary.total_expenses.toLocaleString()}`} 
          change="+4.2%" 
          trend="down"
          icon={<TrendingDown className="w-6 h-6 text-red-400" />}
          color="red"
        />
        <StatCard 
          title="Net Balance" 
          value={`₹${summary.balance.toLocaleString()}`} 
          change="+8.1%" 
          trend="up"
          icon={<Wallet className="w-6 h-6 text-indigo-400" />}
          color="indigo"
        />
      </div>
      
      {/* Intelligence Highlights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Prediction Engine Section */}
          {prediction && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-2xl relative overflow-hidden group shadow-2xl h-full flex flex-col justify-center"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-indigo-500/10 transition-all duration-700" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110",
                    prediction.status === 'safe' ? "bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20" : 
                    prediction.status === 'warning' ? "bg-amber-500/20 text-amber-500 shadow-amber-500/20" : 
                    "bg-red-500/20 text-red-500 shadow-red-500/20"
                  )}>
                    {prediction.status === 'safe' ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-xl font-black tracking-tight uppercase text-white">🔮 Financial Prediction</h4>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        prediction.status === 'safe' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                        prediction.status === 'warning' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                        "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {prediction.status}
                      </span>
                    </div>
                    <p className="text-slate-400 font-bold max-w-2xl leading-relaxed">
                      {prediction.prediction_message}
                    </p>
                  </div>
                </div>

                {prediction.status !== 'safe' && prediction.days_to_risk !== null && prediction.days_to_risk >= 0 && (
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Time Remaining</span>
                    <div className="flex items-baseline gap-2">
                      <span className={cn(
                        "text-5xl font-black tracking-tighter",
                        prediction.status === 'warning' ? "text-amber-500" : "text-red-500"
                      )}>
                        {prediction.days_to_risk}
                      </span>
                      <span className="text-xl font-black text-slate-400 uppercase tracking-widest">Days</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-2xl shadow-2xl h-full">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Intelligence</h4>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            
            <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2 scrollbar-none">
              {alerts && alerts.length > 0 ? (
                alerts.slice(0, 5).map((alert: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      alert.severity === 'High' ? 'bg-red-500/20 text-red-500' : 
                      alert.severity === 'Positive' ? 'bg-emerald-500/20 text-emerald-500' : 
                      'bg-amber-500/20 text-amber-500'
                    )}>
                      {alert.severity === 'Positive' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 leading-tight uppercase tracking-wide group-hover:text-white transition-colors">{alert.message}</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/20 mb-2" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No Active Risks</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FUTURE SIMULATOR UI */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-[2.5rem] p-8 backdrop-blur-2xl shadow-2xl mt-8">
        <h4 className="text-xl font-black uppercase tracking-tight text-white mb-6 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-indigo-400" />
          Future Runway Simulator
        </h4>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g. 'What if I invest ₹1,00,000?'"
              value={simAmount}
              onChange={(e) => setSimAmount(e.target.value)}
              className="w-full p-4 pl-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={runSimulation}
            disabled={simLoading || !simAmount}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
          >
            {simLoading ? "Calculating..." : "Run Simulation"}
          </button>
        </div>

        <AnimatePresence>
          {simResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white/5 rounded-[2rem] border border-white/10"
            >
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Balance</p>
                <p className="text-2xl font-black text-white">₹{simResult.new_balance.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Runway</p>
                <p className="text-2xl font-black text-white">{simResult.runway} Days</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scenario Risk</p>
                <p className={`text-2xl font-black ${
                  simResult.risk === "HIGH" ? "text-red-400" :
                  simResult.risk === "MEDIUM" ? "text-yellow-400" :
                  "text-emerald-400"
                }`}>
                  {simResult.risk}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MAYA AUTO DECISION CARD */}
      <AnimatePresence>
        {(loadingMaya || autoDecision) && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            {loadingMaya && (
              <div className="flex items-center gap-4 text-indigo-400 font-black uppercase tracking-widest text-xs animate-pulse p-10 bg-indigo-500/5 rounded-[3rem] border border-indigo-500/20">
                <span className="text-3xl">🧠</span>
                MAYA is analyzing your financial future and calculating risks...
              </div>
            )}

            {autoDecision && !loadingMaya && (
              <div className="p-10 bg-gradient-to-br from-red-500/10 via-slate-900 to-slate-900 border-2 border-red-500/30 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 blur-[100px] rounded-full -mr-40 -mt-40" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30 shadow-lg shadow-red-500/20">
                        <span className="text-3xl">💀</span>
                      </div>
                      <div>
                        <h2 className="text-red-400 text-3xl font-black tracking-tight uppercase">MAYA AUTO DECISION</h2>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Autonomous Strategic Intervention</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAutoDecision(null)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                  
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-6">
                    <p className="text-white text-xl font-bold leading-relaxed whitespace-pre-line italic">
                      "{autoDecision.result}"
                    </p>
                  </div>

                  <div className="mt-8 flex items-center gap-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Decision Finalized</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full" />
          <h3 className="text-xl font-black tracking-tight mb-8 uppercase text-slate-400">Expense Breakdown</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {summary.chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>


        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full" />
          <h3 className="text-xl font-black tracking-tight mb-8 uppercase text-slate-400">Monthly Cashflow</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Jan', income: 40000, expense: 24000 },
                { name: 'Feb', income: 30000, expense: 13980 },
                { name: 'Mar', income: 20000, expense: 9800 },
                { name: 'Apr', income: 27800, expense: 3908 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="income" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, trend, icon, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group"
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-500/10 blur-[40px] rounded-full group-hover:bg-${color}-500/20 transition-colors duration-500`} />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-500/10 border border-${color}-500/20 shadow-inner`}>
          {icon}
        </div>
        <span className={cn(
          "text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1 uppercase tracking-widest",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
        )}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </span>
      </div>
      <h4 className="text-xs font-black text-slate-500 mb-2 uppercase tracking-widest relative z-10">{title}</h4>
      <p className="text-4xl font-black tracking-tight text-white relative z-10">{value}</p>
    </motion.div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
