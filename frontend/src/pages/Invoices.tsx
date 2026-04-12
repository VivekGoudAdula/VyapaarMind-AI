import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Building2, User, Mail, Calendar, Hash, IndianRupee, Zap, CheckCircle2, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Invoices() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<'generated' | 'sent' | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    clientName: '',
    businessName: '',
    email: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    invoiceId: `INV-${Math.floor(1000 + Math.random() * 9000)}`
  });

  useEffect(() => {
    if (user?.uid) {
      fetchLatestTransaction();
    }
  }, [user]);

  const fetchLatestTransaction = async () => {
    try {
      const res = await fetch(`${API_URL}/transactions/${user?.uid}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const latest = data[0];
        setFormData(prev => ({
          ...prev,
          amount: latest.amount.toString(),
          description: `Services for ${latest.category}`
        }));
      }
    } catch (err) {
      console.error("Error fetching latest transaction:", err);
    }
  };

  const handleGenerate = async () => {
    if (!formData.clientName || !formData.amount || !formData.email || !invoiceRef.current) return;
    setLoading(true);
    
    try {
      const canvas = await html2canvas(invoiceRef.current, { 
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.7);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      pdf.save(`INV_${formData.invoiceId}_${formData.clientName.replace(/\s+/g, '_')}.pdf`);

      const pdfBase64 = pdf.output('datauristring');
      const res = await fetch(`${API_URL}/invoice/send-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          amount: Number(formData.amount),
          client_name: formData.clientName,
          invoice_id: formData.invoiceId,
          pdf_content: pdfBase64
        })
      });
      
      if (res.ok) {
        setSuccess('generated');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Critical Invoice Action Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-black tracking-tight uppercase">Invoices</h2>
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Professional Billing & Client Management</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* LEFT: FORM SECTION */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="space-y-10 relative z-10">
            {/* Section 1: Client Info */}
            <div>
              <h4 className="flex items-center gap-2 text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-6">
                <User className="w-4 h-4" /> Client Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Client Name</label>
                  <input 
                    type="text" 
                    value={formData.clientName}
                    onChange={e => setFormData({...formData, clientName: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white font-bold"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Business Name</label>
                  <input 
                    type="text" 
                    value={formData.businessName}
                    onChange={e => setFormData({...formData, businessName: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white font-bold"
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white font-bold"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Invoice Details */}
            <div>
              <h4 className="flex items-center gap-2 text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-6">
                <FileText className="w-4 h-4" /> Invoice Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="number" 
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white font-black text-xl"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Invoice ID</label>
                  <div className="relative">
                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={formData.invoiceId}
                      readOnly
                      className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 font-bold"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white font-bold h-24 resize-none"
                    placeholder="Project consultation services..."
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Invoice Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={handleGenerate}
                disabled={loading || !formData.clientName || !formData.amount || !formData.email}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-500/40 flex items-center justify-center gap-4 active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    <span>Generate & Send Invoice</span>
                  </>
                )}
              </button>
            </div>
            
            <AnimatePresence>
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center gap-2 text-emerald-400 font-bold uppercase text-[10px] tracking-widest"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Invoice generated & sent to client
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* RIGHT: LIVE PREVIEW SECTION */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center justify-center gap-8"
        >
          <div className="w-full max-w-[480px] bg-white/5 border border-white/10 rounded-[2.5rem] p-4 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[700px]">
             <div className="absolute top-6 left-6 flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Live Preview</h4>
             </div>
             
             <div className="scale-[0.85] md:scale-100 origin-center">
                <InvoiceCard formData={formData} />
             </div>
             
             {/* HIDDEN CAPTURE AREA */}
             <div className="absolute top-0 -left-[9999px] pointer-events-none opacity-0 transition-none" style={{ background: 'white' }}>
                <div ref={invoiceRef}>
                   <InvoiceCard formData={formData} isCaptureMode />
                </div>
             </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-[480px]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed text-center">
              ⚡ VyapaarMind uses high-fidelity PDF rendering to ensure your invoices look professional on all devices.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InvoiceCard({ formData, isCaptureMode = false }: { formData: any, isCaptureMode?: boolean }) {
  const cardWidth = isCaptureMode ? '800px' : '400px';
  const cardHeight = isCaptureMode ? '1130px' : '565px';
  
  // Explicit hex colors to bypass html2canvas oklch parsing bug
  const colors = {
    indigo600: '#4f46e5',
    indigo400: '#818cf8',
    slate900: '#0f172a',
    slate700: '#334155',
    slate500: '#64748b',
    slate400: '#94a3b8',
    slate100: '#f1f5f9',
    slate50: '#f8fafc',
    white: '#ffffff'
  };
  
  return (
    <div 
      className={`p-10 flex flex-col relative overflow-hidden ${isCaptureMode ? '' : 'rounded-[2rem] shadow-2xl'}`}
      style={{ 
        width: cardWidth, 
        height: cardHeight,
        backgroundColor: colors.white, 
        color: colors.slate900,
        flexShrink: 0,
        borderRadius: isCaptureMode ? '0px' : '2rem',
      }}
    >
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: 'linear-gradient(to bottom right, #f5f3ff, transparent)', // Replaced rgba(79,70,229,0.06) with hex gradient
          opacity: 0.5
        }} 
      />
      
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div className="flex items-center gap-3">
          <img src="/maya-genie.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-extrabold text-2xl tracking-tighter" style={{ color: colors.slate900 }}>VyapaarMind</span>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-black tracking-tighter leading-none mb-1" style={{ color: colors.indigo600 }}>INVOICE</h1>
          <p className="text-[10px] font-black uppercase" style={{ color: colors.slate400 }}>#{formData.invoiceId}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12 relative z-10">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: colors.slate400 }}>Issued By</label>
          <p className="text-sm font-black">VyapaarMind AI Systems</p>
          <p className="text-xs font-medium mt-0.5" style={{ color: colors.slate500 }}>Bengaluru Innovation Hub, IN</p>
        </div>
        <div className="text-right">
          <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: colors.slate400 }}>Bill To</label>
          <p className="text-sm font-black">{formData.clientName || 'Valued Client'}</p>
          <p className="text-xs font-medium mt-0.5" style={{ color: colors.slate500 }}>{formData.businessName || 'Business Organization'}</p>
        </div>
      </div>

      <div className="flex-1 relative z-10" style={{ borderTop: `1px solid ${colors.slate100}` }}>
        <div className="mb-6 pb-2" style={{ borderBottom: `2px solid ${colors.slate100}` }}>
          <div className="grid grid-cols-[1fr_100px] text-[10px] font-black uppercase tracking-widest" style={{ color: colors.slate400 }}>
            <span>Description</span>
            <span className="text-right">Amount</span>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_100px] items-center">
          <p className="text-sm font-bold" style={{ color: colors.slate700 }}>{formData.description || 'Professional SME Services'}</p>
          <p className="text-sm font-black text-right">₹{Number(formData.amount || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-auto relative z-10">
        <div className="p-6 rounded-2xl flex justify-between items-center" style={{ backgroundColor: colors.slate50, border: `1px solid ${colors.slate100}` }}>
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.slate400 }}>Total Amount due</span>
          <span className="text-3xl font-black tracking-tighter" style={{ color: colors.indigo600 }}>₹{Number(formData.amount || 0).toLocaleString()}</span>
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: colors.indigo400 }}>Powered by VyapaarMind AI</p>
        </div>
      </div>
    </div>
  );
}

