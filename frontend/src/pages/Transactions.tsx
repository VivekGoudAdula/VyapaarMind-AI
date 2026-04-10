import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, X, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InvoiceModal from '../components/InvoiceModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ amount: '', type: 'expense', category: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    if (user?.uid) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = () => {
    if (!user?.uid) return;
    setLoading(true);
    fetch(`${API_URL}/transactions/${user.uid}`)
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching transactions:", err);
        setLoading(false);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || submitting) return;

    setSubmitting(true);
    fetch(`${API_URL}/transactions/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...formData, 
        amount: Number(formData.amount),
        user_id: user.uid
      })
    })
    .then(res => res.json())
    .then(() => {
      fetchTransactions();
      window.dispatchEvent(new Event('transaction-updated'));
      setIsModalOpen(false);
      setFormData({ amount: '', type: 'expense', category: '', date: new Date().toISOString().split('T')[0] });
    })
    .catch(err => console.error("Error adding transaction:", err))
    .finally(() => setSubmitting(false));
  };


  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Transactions</h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Ledger Command Center</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsInvoiceModalOpen(true)}
            className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-white/10 transition-all group"
          >
            <FileText className="w-5 h-5 text-indigo-400" />
            Generate Invoice
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/40 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="p-6 border-b border-white/5 flex items-center justify-between gap-6 relative z-10">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search ledger..." 
              className="w-full pl-12 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
            />
          </div>
          <button className="w-12 h-12 flex items-center justify-center border border-white/10 rounded-2xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-600 font-black uppercase tracking-widest text-xs">Syncing Ledger...</td></tr>
              ) : transactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5 text-sm text-slate-400 font-medium">{t.date}</td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{t.category}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                      t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-8 py-5 text-lg font-black text-right tracking-tight ${
                    t.type === 'income' ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl p-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full" />
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <h3 className="text-2xl font-black tracking-tight uppercase">New Entry</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors text-slate-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Amount (₹)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white text-xl font-black"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Type</label>
                    <select 
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white font-bold appearance-none"
                    >
                      <option value="expense" className="bg-slate-900">Expense</option>
                      <option value="income" className="bg-slate-900">Income</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Date</label>
                    <input 
                      required
                      type="date" 
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
                  <input 
                    required
                    type="text" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white font-bold"
                    placeholder="e.g. Rent, Sales, Marketing"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/40 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Committing...' : 'Commit to Ledger'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <InvoiceModal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setIsInvoiceModalOpen(false)} 
      />
    </div>
  );
}
