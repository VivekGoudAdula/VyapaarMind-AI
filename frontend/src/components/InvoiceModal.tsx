import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Send, Download, CheckCircle2, Building2, User, Mail, Calendar, Hash, IndianRupee, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function InvoiceModal({ isOpen, onClose }: InvoiceModalProps) {
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
    if (isOpen && user?.uid) {
      fetchLatestTransaction();
    }
  }, [isOpen, user]);

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
      // Step 1: Generate PDF from the hidden capture area (Optimized resolution for email)
      const canvas = await html2canvas(invoiceRef.current, { 
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      // Use JPEG with 0.7 compression to keep file size small for Gmail
      const imgData = canvas.toDataURL('image/jpeg', 0.7);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      // Step 2: Local Download for the user
      pdf.save(`INV_${formData.invoiceId}_${formData.clientName.replace(/\s+/g, '_')}.pdf`);

      // Step 3: Send via Email to the client
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-6xl h-full max-h-[900px] bg-slate-900 border border-white/10 rounded-[3rem] shadow-[0_0_100px_-10px_rgba(79,70,229,0.3)] overflow-hidden flex flex-col md:flex-row"
          >
            {/* Header / Sidebar info for mobile might be needed but let's stick to split view */}
            
            {/* LEFT: FORM SECTION */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto border-r border-white/5 bg-slate-900/50">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black tracking-tight uppercase text-white">VyapaarMind AI</h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Professional Invoice Generator</p>
                </div>
                <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-colors text-slate-500 md:hidden">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-10">
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

                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center italic">
                  🔮 AI-powered invoice generation based on your transaction history
                </p>

                 {/* ACTION BUTTONS */}
                <div className="pt-6">
                  <button 
                    onClick={handleGenerate}
                    disabled={loading || !formData.clientName || !formData.amount || !formData.email}
                    className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-500/40 flex items-center justify-center gap-4 active:scale-[0.98]"
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
                  <p className="text-center mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-60">
                    PDF will be downloaded and sent to client instantly
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: LIVE PREVIEW SECTION */}
            <div className="flex-1 p-8 md:p-12 bg-slate-800/30 overflow-y-auto flex flex-col items-center justify-center relative border-l border-white/5">
              <div className="absolute top-8 left-12 right-12 flex items-center justify-between z-20">
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Live Preview</h4>
                <button onClick={onClose} className="w-10 h-10 hidden md:flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors text-slate-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* THE VISUAL PREVIEW CARD */}
              <div className="flex-shrink-0 animate-in fade-in zoom-in duration-500">
                <InvoiceCard formData={formData} />
              </div>

              {/* HIDDEN CAPTURE AREA (Only for PDF generation) */}
              <div className="absolute top-0 -left-[9999px] pointer-events-none opacity-0 transition-none" style={{ background: 'white' }}>
                 <div ref={invoiceRef}>
                    <InvoiceCard formData={formData} isCaptureMode />
                 </div>
              </div>

              {/* Toast Feedback */}
              <AnimatePresence>
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    className="mt-8 px-6 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-emerald-400 font-bold uppercase text-[10px] tracking-widest relative z-[200]"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {success === 'generated' ? 'Invoice generated' : 'Reminder sent to client'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InvoiceCard({ formData, isCaptureMode = false }: { formData: any, isCaptureMode?: boolean }) {
  // Use fixed large dimensions for capture to ensure everything fits perfectly
  const cardWidth = isCaptureMode ? '800px' : '480px';
  const cardHeight = isCaptureMode ? '1130px' : '678px';
  
  return (
    <div 
      className="rounded-[2.5rem] shadow-2xl p-10 flex flex-col relative overflow-hidden"
      style={{ 
        width: cardWidth, 
        height: cardHeight,
        backgroundColor: '#ffffff', 
        color: '#0f172a',
        flexShrink: 0
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom right, rgba(79,70,229,0.06), transparent)' }} />
      
      <div className="flex justify-between items-start mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: '#4f46e5' }}>
              <Building2 className="w-7 h-7" />
            </div>
            <span className="font-extrabold text-3xl tracking-tighter" style={{ color: '#010101' }}>VyapaarMind AI</span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] ml-2" style={{ color: '#94a3b8' }}>Autonomous SME Ledger</p>
        </div>
        <div className="text-right">
          <h1 className="text-5xl font-black text-indigo-600 tracking-tighter leading-none mb-2 opacity-90">INVOICE</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: '#cbd5e1' }}>#{formData.invoiceId}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-20 relative z-10">
        <div>
          <label className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 block" style={{ color: '#94a3b8' }}>Issued By</label>
          <p className="text-lg font-black" style={{ color: '#0f172a' }}>VyapaarMind AI Systems</p>
          <p className="text-sm font-medium mt-1" style={{ color: '#64748b' }}>Bengaluru Innovation Hub, IN</p>
          <p className="text-sm font-medium" style={{ color: '#64748b' }}>automated-billing@vyapaarmind.io</p>
        </div>
        <div className="text-right">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 block" style={{ color: '#94a3b8' }}>Bill To</label>
          <p className="text-lg font-black" style={{ color: '#0f172a' }}>{formData.clientName || 'Valued Client'}</p>
          <p className="text-sm font-medium mt-1" style={{ color: '#64748b' }}>{formData.businessName || 'Business Organization'}</p>
          <p className="text-sm font-medium" style={{ color: '#64748b' }}>{formData.email || 'client@example.com'}</p>
        </div>
      </div>

      <div className="flex-1 relative z-10">
        <div className="border-b-2 mb-8 pb-3" style={{ borderColor: '#f1f5f9' }}>
          <div className="grid grid-cols-[1fr_150px] text-[12px] font-black uppercase tracking-[0.3em] px-2" style={{ color: '#94a3b8' }}>
            <span>Project Description</span>
            <span className="text-right">Net Amount</span>
          </div>
        </div>
        <div className="space-y-8 px-2">
          <div className="grid grid-cols-[1fr_150px] items-center">
            <p className="text-xl font-bold leading-relaxed pr-8" style={{ color: '#1e293b' }}>{formData.description || 'Professional SME Services'}</p>
            <p className="text-xl font-black text-right" style={{ color: '#010101' }}>₹ {Number(formData.amount || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="mt-auto relative z-10">
        <div className="p-10 rounded-[2.5rem] flex justify-between items-center" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
          <div className="flex flex-col">
            <span className="text-[12px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: '#94a3b8' }}>Total Amount due</span>
            <span className="text-sm font-bold" style={{ color: '#64748b' }}>Due upon receipt</span>
          </div>
          <span className="text-6xl font-black tracking-tighter" style={{ color: '#4f46e5' }}>₹{Number(formData.amount || 0).toLocaleString()}</span>
        </div>
        
        <div className="mt-16 text-center pb-4">
          <p className="text-sm font-bold italic mb-5" style={{ color: '#94a3b8' }}>"The future of SMEs is autonomous."</p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#818cf8' }} />
            <p className="text-[12px] font-black uppercase tracking-[0.5em]" style={{ color: '#818cf8' }}>Powered by VyapaarMind AI</p>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#818cf8' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
