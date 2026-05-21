import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiArrowRight, FiCheckCircle, FiZap, FiUsers, FiBarChart2 } from 'react-icons/fi';

// Floating particle component
const Particle = ({ style }) => (
  <div
    className="absolute w-1 h-1 rounded-full bg-violet-400/40 pointer-events-none"
    style={style}
  />
);

const FEATURES = [
  { icon: FiZap, title: 'Real-Time Sync', desc: 'Live Kanban board updates across your whole team instantly.' },
  { icon: FiUsers, title: 'Team Collaboration', desc: 'Chat, assign tasks, and track progress together.' },
  { icon: FiBarChart2, title: 'Smart Analytics', desc: 'Insightful dashboards to keep projects on track.' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Generate floating particles
  useEffect(() => {
    const ps = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      bottom: `${Math.random() * 20}%`,
      width: `${2 + Math.random() * 3}px`,
      height: `${2 + Math.random() * 3}px`,
      animationDuration: `${4 + Math.random() * 6}s`,
      animationDelay: `${Math.random() * 6}s`,
      opacity: 0.3 + Math.random() * 0.5,
    }));
    setParticles(ps);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please fill in all fields');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) navigate('/');
    else setError(result.error);
  };

  return (
    <div className="min-h-screen bg-[#020817] flex overflow-hidden">
      {/* ── LEFT PANEL – Branding ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 auth-grid-bg" />

        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/15 blur-[100px] animate-orb-1 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-[80px] animate-orb-2 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

        {/* Floating particles */}
        {particles.map(p => (
          <Particle
            key={p.id}
            style={{
              left: p.left,
              bottom: p.bottom,
              width: p.width,
              height: p.height,
              opacity: p.opacity,
              animation: `particle-float ${p.animationDuration} ${p.animationDelay} ease-in-out infinite`,
            }}
          />
        ))}

        {/* Brand content */}
        <div className="relative z-10 max-w-sm text-center space-y-10">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-2xl animate-glow-pulse">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-white fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </div>
              {/* Orbit ring */}
              <div className="absolute inset-0 -m-3 rounded-full border border-violet-500/20 animate-spin-slow" />
              <div className="absolute inset-0 -m-6 rounded-full border border-indigo-500/10 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight shimmer-text">TaskPilot</h1>
              <p className="text-slate-500 text-sm font-medium mt-1">Collaborative Project Workspace</p>
            </div>
          </div>

          {/* Features list */}
          <div className="space-y-4 text-left">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start glass rounded-2xl p-4">
                <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {['A','B','C','D'].map((l, i) => (
                <div
                  key={l}
                  className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: ['#7c3aed','#4f46e5','#6d28d9','#5b21b6'][i] }}
                >
                  {l}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Join <span className="text-slate-300 font-bold">1,200+</span> teams using TaskPilot
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL – Login Form ──────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative">
        {/* Mobile background effects */}
        <div className="lg:hidden absolute inset-0 auth-grid-bg opacity-50" />
        <div className="lg:hidden absolute top-0 left-0 w-72 h-72 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />
        <div className="lg:hidden absolute bottom-0 right-0 w-72 h-72 rounded-full bg-indigo-500/8 blur-[80px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md animate-slide-right">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </div>
            <h1 className="text-xl font-black shimmer-text">TaskPilot</h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Welcome back
              <span className="text-violet-400">.</span>
            </h2>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              Sign in to your workspace to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <p className="text-rose-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors duration-200">
                  <FiMail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/80 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-2xl text-slate-100 placeholder-slate-600 transition-all duration-200 text-sm font-medium"
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors duration-200">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-900/80 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-2xl text-slate-100 placeholder-slate-600 transition-all duration-200 text-sm font-medium"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold text-sm rounded-2xl transition-all duration-200 shadow-xl shadow-violet-600/20 hover:shadow-violet-600/30 hover:-translate-y-0.5 cursor-pointer disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group select-none"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing you in...
                </>
              ) : (
                <>
                  Sign In
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600 font-medium">New here?</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Register CTA */}
          <div className="mt-5">
            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-sm rounded-2xl transition-all duration-200 group"
            >
              <FiCheckCircle className="w-4 h-4 text-violet-400" />
              Create a free account
            </Link>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-[11px] text-slate-600 font-medium leading-relaxed">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
