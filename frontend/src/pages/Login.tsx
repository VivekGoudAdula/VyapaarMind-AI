import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bot, ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import MayaOrb from '../components/MayaOrb';
import GoogleButton from '../components/GoogleButton';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl tracking-tight mb-12 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">V</div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">VyapaarMind</span>
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tight mb-3">Welcome back.</h1>
            <p className="text-slate-400 font-medium">Log in to your AI-powered financial command center.</p>
          </div>

          <div className="space-y-4">
            <GoogleButton />

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#020617] px-4 text-slate-500 font-bold tracking-widest">Or continue with email</span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Password</label>
                  <a href="#" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 mt-8 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? 'Signing In...' : 'Sign In to Dashboard'}
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </form>
          </div>

          <div className="mt-10 pt-10 border-t border-white/5 text-center">
            <p className="text-slate-500 font-medium">
              New to VyapaarMind? <Link to="/signup" className="text-white font-bold hover:text-indigo-400 transition-colors">Create an account</Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Immersive Visual */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>

        <div className="relative z-10 w-full max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mb-12 scale-150"
          >
            <MayaOrb />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Powered by MAYA AI
            </div>
            <h2 className="text-4xl font-black tracking-tight leading-tight">
              Predicting the future <br />
              of your business.
            </h2>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm mb-1">Secure Data</h4>
                <p className="text-xs text-slate-500">Bank-grade encryption for all your financial records.</p>
              </div>
              <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                <Zap className="w-6 h-6 text-amber-400 mb-2" />
                <h4 className="font-bold text-sm mb-1">Instant Sync</h4>
                <p className="text-xs text-slate-500">Real-time updates from your bank and ERP systems.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating background particles */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-emerald-600/10 blur-[100px] rounded-full animate-pulse [animation-delay:1s]" />
      </div>
    </div>
  );
}

