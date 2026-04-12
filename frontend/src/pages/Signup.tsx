import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bot, ArrowRight, Sparkles, CheckCircle2, TrendingUp, Globe } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
// import MayaOrb from '../components/MayaOrb';

import GoogleButton from '../components/GoogleButton';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });
      // You might want to save additional info like businessName to Firestore here
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden">
      {/* Left Side: Immersive Visual */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>

        <div className="relative z-10 w-full max-w-lg px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-12"
          >
            <img src="/maya-genie.png" alt="MAYA" className="w-64 h-64 object-contain mx-auto animate-float" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-8"
          >
            <h2 className="text-5xl font-black tracking-tight leading-tight">
              Join the future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
                Indian Business.
              </span>
            </h2>

            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">AI-First Decision Making</h4>
                  <p className="text-slate-500 text-sm">Let MAYA analyze your ledger and suggest growth moves.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center mt-1">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Predictive Cashflow</h4>
                  <p className="text-slate-500 text-sm">See your financial future 12 months ahead with 98% accuracy.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mt-1">
                  <Globe className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Global Compliance</h4>
                  <p className="text-slate-500 text-sm">GST, TDS, and international standards handled automatically.</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md py-12"
        >
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl tracking-tight mb-12 group">
            <img src="/maya-genie.png" alt="Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">VyapaarMind</span>
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tight mb-3">Get started.</h1>
            <p className="text-slate-400 font-medium">Create your account and start scaling your business.</p>
          </div>

          <div className="space-y-4">
            <GoogleButton />

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#020617] px-4 text-slate-500 font-bold tracking-widest">Or create account with email</span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSignup}>
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Vivek"
                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Goud"
                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  placeholder="Goud Enterprises"
                  className="w-full px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@company.com"
                  className="w-full px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 mt-6 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? 'Creating Account...' : 'Create My Account'}
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </form>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 font-medium">
              Already have an account? <Link to="/login" className="text-white font-bold hover:text-indigo-400 transition-colors">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

