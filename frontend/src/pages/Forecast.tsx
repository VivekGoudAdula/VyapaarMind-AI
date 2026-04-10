import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Zap, Brain, ArrowRight, Timer, Ghost, Sparkles, AlertCircle, TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface ForecastMonth {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

interface ForecastData {
  months: ForecastMonth[];
  trend: 'growing' | 'declining' | 'stable';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export default function Forecast() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/forecast/${user?.uid}`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching forecast:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchForecast();
    }
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020617]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isDeclining = data?.trend === 'declining';
  const finalBalance = data?.months[2]?.balance || 0;
  const initialBalance = data?.months[0]?.balance || 0;
  const growth = finalBalance - initialBalance;
  
  const chartColor = isDeclining ? "#ef4444" : "#22c55e";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] border border-white/5 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-slate-500 font-bold mb-1 uppercase text-[10px] tracking-widest">{label}</p>
          <p className={`text-lg font-black ${isDeclining ? 'text-rose-500' : 'text-emerald-500'}`}>
            ₹{payload[0].value.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Projected Balance</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 space-y-8 bg-[#020617] min-h-screen text-slate-100 flex flex-col max-w-[1600px] mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                <Brain size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-black tracking-tighter">AI FUTURE INTELLIGENCE</h1>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Autonomous Predictive Subsystem v2.0</p>
             </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">This is not data. This is behavior.</span>
        </div>
      </div>

      {/* HERO OUTCOME SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center py-6"
      >
        {isDeclining ? (
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
              ⚠️ YOU WILL <span className="text-rose-500 italic">RUN OUT OF MONEY</span> IN <span className="underline decoration-rose-500/30 underline-offset-8">45 DAYS</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium">Your current financial velocity is leading towards a liquidity critical state.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
              🚀 YOUR BUSINESS WILL <span className="text-emerald-400 italic">GROW ₹{(growth/100000).toFixed(1)}L</span> IN 3 MONTHS
            </h1>
            <p className="text-slate-500 text-lg font-medium">Momentum is strong. You are outperforming historical averages.</p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start flex-1">
        
        {/* LEFT SIDE: TRADING STYLE GRAPH */}
        <div className="lg:col-span-3 bg-[#0a0f1e] border border-white/5 rounded-[3rem] p-10 h-[600px] relative overflow-hidden group shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-1">90-Day Market Projection</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">₹{finalBalance.toLocaleString()}</span>
                    <span className={`text-xs font-bold ${isDeclining ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isDeclining ? '↓' : '↑'} {(Math.abs(growth/initialBalance)*100).toFixed(1)}%
                    </span>
                </div>
            </div>
            <div className="flex gap-2">
                <div className="px-3 py-1 rounded-lg text-[10px] font-black tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 uppercase">
                    3-Month Projection
                </div>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.months} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 10, fontWeight: 900}} 
                    interval={3}
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    orientation="right"
                    tick={{fill: '#475569', fontSize: 10, fontWeight: 900}}
                    tickFormatter={(value) => `₹${(value/1000)}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1}} />
                <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke={chartColor} 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorBalance)" 
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Open</p>
                        <p className="text-xs font-bold text-white">₹{initialBalance.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">High</p>
                        <p className="text-xs font-bold text-white">₹{Math.max(...(data?.months.map(m => m.balance) || [0])).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Low</p>
                        <p className="text-xs font-bold text-white">₹{Math.min(...(data?.months.map(m => m.balance) || [0])).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">LIVE ENGINE TRACKING</span>
                </div>
          </div>
        </div>

        {/* RIGHT SIDE: INTELLIGENCE PANEL */}
        <div className="lg:col-span-2 space-y-6">
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-[2.5rem] p-8 border flex flex-col justify-between h-[250px] shadow-2xl relative overflow-hidden group
                ${isDeclining ? 'bg-rose-600/10 border-rose-500/20' : 'bg-emerald-600/10 border-emerald-500/20'}`}
          >
            <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity rotate-12
                ${isDeclining ? 'text-rose-500' : 'text-emerald-500'}`}>
                {isDeclining ? <TrendingDown size={140} /> : <TrendingUp size={140} />}
            </div>

            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDeclining ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        <Zap className="w-4 h-4" />
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-[0.3em] opacity-60">MAYA'S VERDICT</span>
                </div>
                
                <h2 className={`text-4xl font-black mb-2 leading-none tracking-tighter
                    ${isDeclining ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isDeclining ? "CUT COSTS IMMEDIATELY" : "INVEST FOR GROWTH"}
                </h2>
                <p className="text-slate-400 text-sm font-bold max-w-[90%] font-medium">
                    {isDeclining 
                        ? "Your current burn rate is unsustainable. Strategic cost optimization required." 
                        : "Surplus capital identified. Strategic acquisition or expansion suggested."}
                </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                    ${isDeclining ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    Confidence: 98.4%
                </div>
            </div>
          </motion.div>

          <button 
                onClick={() => navigate('/ai-cfo')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all hover:scale-[1.02] shadow-2xl shadow-indigo-600/20 uppercase tracking-[0.2em] text-sm group"
            >
                Fix My Future <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>

          <div className="bg-orange-500/5 border border-orange-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl flex-1">
               <div className="absolute top-0 right-0 p-8 opacity-5 text-orange-500 group-hover:opacity-10 transition-opacity">
                    <Ghost size={120} />
               </div>

               <div className="flex items-center gap-3 mb-6">
                    <Timer className="w-5 h-5 text-orange-500" />
                    <span className="font-black text-[10px] uppercase tracking-[0.3em] text-orange-500/60 text-xs">Cost of Inaction</span>
               </div>
               
               <div className="space-y-4">
                    {[
                        "Net worth stagnates vs regional competitors",
                        "Missed acquisition & growth opportunities",
                        `Opportunity cost: ₹${(Math.abs(growth) * 0.15).toLocaleString()} lost`,
                        "Competitive disadvantage as rivals optimize"
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                            <p className="text-slate-300 text-sm font-bold leading-tight">{item}</p>
                        </div>
                    ))}
               </div>
          </div>

        </div>
      </div>
    </div>
  );
}
