import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Zap,
  BarChart3,
  Globe,
  Lock,
  ChevronRight
} from 'lucide-react';
// import MayaAvatar from '../components/MayaAvatar';
// import MayaOrb from '../components/MayaOrb';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

  return (
    <div ref={containerRef} className="bg-[#020617] text-white selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-8 py-6 flex items-center justify-between max-w-7xl mx-auto backdrop-blur-md bg-[#020617]/50 border-b border-white/5">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
          <img src="/maya-genie.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">VyapaarMind</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
          <a href="#mayai" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">MAYA AI</a>
          <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</Link>
          <Link to="/signup" className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-slate-200 transition-all">Get Started</Link>
        </div>

      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <motion.div
          style={{ opacity, scale, y }}
          className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center relative z-10"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            >
              <Sparkles className="w-3 h-3" />
              The Future of Indian Business
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
            >
              SMART <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
                FINANCIAL <br />
                MIND.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-400 max-w-xl mb-12 leading-relaxed font-medium"
            >
              VyapaarMind is the AI-first CFO platform that turns your business data into strategic growth. Predict cashflow, mitigate risks, and scale faster.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start gap-6"
            >
            <Link to="/signup" className="px-10 py-5 bg-indigo-600 text-white rounded-2xl text-lg font-bold hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/40 flex items-center gap-3 group">
              Get Started Free
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-[#020617] bg-slate-800 overflow-hidden">
                    <img src={`https://picsum.photos/seed/${i + 10}/100/100`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-[#020617] bg-indigo-600 flex items-center justify-center text-xs font-bold">
                  +2k
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, type: "spring" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-indigo-500/20 blur-[150px] rounded-full animate-pulse" />
            <div className="relative z-10 flex justify-center">
               <img src="/maya-genie.png" alt="MAYA" className="w-full max-w-[400px] md:max-w-[600px] lg:max-w-[700px] h-auto object-contain animate-float" />
            </div>

          </motion.div>
        </motion.div>

        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full" />
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-32 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-black tracking-tighter mb-6"
          >
            BUILT FOR THE <br />
            <span className="text-indigo-500">NEXT BILLION</span> BUSINESSES.
          </motion.h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            We've condensed a decade of financial expertise into a single, intelligent interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          <BentoCard
            className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 overflow-hidden group"
            title="MAYA AI Engine"
            description="Our proprietary LLM trained on Indian business contexts, tax laws, and market trends."
            icon={<Bot className="w-8 h-8" />}
          >
            <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-white/10 backdrop-blur-xl rounded-tl-3xl border-t border-l border-white/20 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500" />
                  <div className="h-2 w-24 bg-white/20 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-white/10 rounded" />
                  <div className="h-2 w-4/5 bg-white/10 rounded" />
                  <div className="h-2 w-3/4 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            className="bg-slate-900 border border-white/5"
            title="Real-time Sync"
            description="Connect your bank accounts and ERPs instantly."
            icon={<Zap className="w-6 h-6 text-amber-400" />}
          />

          <BentoCard
            className="bg-slate-900 border border-white/5"
            title="Risk Mitigation"
            description="Identify leaks before they drain your runway."
            icon={<ShieldAlert className="w-6 h-6 text-red-400" />}
          />

          <BentoCard
            className="md:col-span-1 bg-emerald-600/20 border border-emerald-500/20"
            title="Future Forecast"
            description="12-month predictive modeling with 98% accuracy."
            icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
          />

          <BentoCard
            className="md:col-span-2 bg-slate-900 border border-white/5 flex flex-row items-center gap-8"
            title="Global Compliance"
            description="GST, TDS, and international tax standards handled automatically."
            icon={<Globe className="w-6 h-6 text-indigo-400" />}
          >
            <div className="hidden md:block flex-1 h-full bg-gradient-to-l from-indigo-500/10 to-transparent" />
          </BentoCard>
        </div>
      </section>

      {/* Immersive AI Section */}
      <section id="mayai" className="relative py-48 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/5 -skew-y-6 origin-right" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center relative z-10">
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square bg-slate-900 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Bot className="w-32 h-32 text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors duration-700" />
              </div>
              {/* Floating UI Elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-12 left-12 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Analyzing Cashflow</span>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute bottom-12 right-12 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Growth: +24%</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-6xl font-black tracking-tighter mb-8 leading-none">
              TALK TO YOUR <br />
              <span className="text-indigo-500">BUSINESS.</span>
            </h2>
            <p className="text-xl text-slate-400 mb-12 leading-relaxed">
              MAYA isn't just a chatbot. It's a deep-learning engine that understands your ledger, your market, and your goals.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center mt-1">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Natural Language Queries</h4>
                  <p className="text-slate-500 text-sm">"Can I afford to hire 3 developers this month?"</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center mt-1">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Scenario Simulation</h4>
                  <p className="text-slate-500 text-sm">"What happens if my main supplier raises prices by 15%?"</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[3rem] p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative z-10">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8">READY TO SCALE?</h2>
            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto font-medium">
              Join 2,000+ Indian businesses making smarter financial decisions with VyapaarMind.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/signup" className="px-10 py-5 bg-white text-black rounded-2xl text-lg font-bold hover:bg-slate-100 transition-all shadow-2xl">
                Get Started Now
              </Link>

              <button className="px-10 py-5 bg-black/20 backdrop-blur-md border border-white/10 text-white rounded-2xl text-lg font-bold hover:bg-black/30 transition-all">
                Schedule Demo
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-6">
              <img src="/maya-genie.png" alt="Logo" className="w-10 h-10 object-contain" />
              <span>VyapaarMind</span>
            </div>
            <p className="text-slate-500 max-w-xs mb-8">
              The AI CFO for the next generation of Indian entrepreneurs.
            </p>
            <div className="flex gap-4">
              {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" />)}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-slate-400">Product</h4>
            <ul className="space-y-4 text-slate-500 text-sm font-medium">
              <li className="hover:text-white cursor-pointer transition-colors">Features</li>
              <li className="hover:text-white cursor-pointer transition-colors">MAYA AI</li>
              <li className="hover:text-white cursor-pointer transition-colors">Pricing</li>
              <li className="hover:text-white cursor-pointer transition-colors">Security</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-slate-400">Company</h4>
            <ul className="space-y-4 text-slate-500 text-sm font-medium">
              <li className="hover:text-white cursor-pointer transition-colors">About</li>
              <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
              <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <p>© 2026 VyapaarMind AI. All rights reserved.</p>
          <div className="flex gap-8">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BentoCard({ title, description, icon, className, children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={cn(
        "relative rounded-[2.5rem] p-8 flex flex-col justify-between transition-all duration-300",
        className
      )}
    >
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center mb-6 border border-white/10">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-400 leading-relaxed font-medium">{description}</p>
      </div>
      {children}
    </motion.div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
