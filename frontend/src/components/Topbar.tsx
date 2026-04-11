import { useState, useEffect } from 'react';
import { User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const formatCurrency = (num: number) => {
  if (num >= 10000000) return "₹" + (num / 10000000).toFixed(2) + " Cr";
  if (num >= 100000) return "₹" + (num / 100000).toFixed(2) + " L";
  return "₹" + num.toLocaleString();
};

export default function Topbar() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);

  const fetchBalance = () => {
    if (!user?.uid) return;
    fetch(`${API_URL}/summary/${user.uid}`)
      .then(res => res.json())
      .then(data => setBalance(data.balance))
      .catch(err => console.error("Error fetching balance for topbar:", err));
  };

  useEffect(() => {
    fetchBalance();

    window.addEventListener('transaction-updated', fetchBalance);
    return () => window.removeEventListener('transaction-updated', fetchBalance);
  }, [user]);

  return (
    <header className="h-20 bg-[#020617]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 relative z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Live</span>
        </div>
        <h1 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Overview / Dashboard</h1>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Available Liquidity</span>
          <span className="text-xl font-black text-white tracking-tight">
            {balance !== null ? formatCurrency(balance) : '₹0'}
          </span>
        </div>

        <div className="h-10 w-px bg-white/10" />

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all relative group">
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#020617]" />
          </button>
          <div className="flex items-center gap-3 pl-2 group cursor-pointer">
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-sm font-bold text-white">{user?.displayName || user?.name || 'Vivek Goud'}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Founder</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
