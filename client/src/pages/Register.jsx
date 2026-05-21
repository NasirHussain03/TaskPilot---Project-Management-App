import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiUser, FiMail, FiLock, FiShield, FiArrowRight,
  FiCheck, FiUsers
} from 'react-icons/fi';

const Particle = ({ style }) => (
  <div className="absolute rounded-full bg-violet-400/30 pointer-events-none" style={style} />
);

const ROLE_OPTIONS = [
  {
    value: 'Member',
    icon: FiUsers,
    label: 'Member',
    desc: 'Collaborate on projects and tasks',
    gradient: 'from-violet-600/20 to-indigo-600/20',
    border: 'border-violet-500',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-600/20',
  },
  {
    value: 'Admin',
    icon: FiShield,
    label: 'Admin',
    desc: 'Full workspace control & management',
    gradient: 'from-amber-600/20 to-orange-600/20',
    border: 'border-amber-500',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
  },
];

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const [strength, setStrength] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const ps = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      bottom: `${Math.random() * 30}%`,
      width: `${2 + Math.random() * 3}px`,
      height: `${2 + Math.random() * 3}px`,
      animationDuration: `${4 + Math.random() * 6}s`,
      animationDelay: `${Math.random() * 6}s`,
      opacity: 0.3 + Math.random() * 0.4,
    }));
    setParticles(ps);
  }, []);

  // Password strength
  useEffect(() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    setStrength(s);
  }, [password]);

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500', 'bg-violet-500'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) return setError('Please fill in all fields');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    const result = await register(name, email, password, role);
    setLoading(false);
    if (result.success) navigate('/');
    else setError(result.error);
  };

  return (
    <div className="min-h-screen bg-[#020817] flex overflow-hidden">
      {/* ── LEFT PANEL ───────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 auth-grid-bg" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-violet-600/15 blur-[100px] animate-orb-1 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-indigo-500/10 blur-[80px] animate-orb-2 pointer-events-none" />

        {particles.map(p => (
          <Particle
            key={p.id}
            style={{
              left: p.left, bottom: p.bottom,
              width: p.width, height: p.height,
              opacity: p.opacity,
              animation: `particle-float ${p.animationDuration} ${p.animationDelay} ease-in-out infinite`,
            }}
          />
        ))}

        <div className="relative z-10 max-w-xs space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center animate-glow-pulse shadow-2xl">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black shimmer-text">TaskPilot</h1>
              <p className="text-xs text-slate-500 font-medium">Collaborative Workspace</p>
            </div>
          </div>

          {/* Value props */}
          <div className="space-y-3">
            {[
              'Kanban boards with drag & drop',
              'Real-time team collaboration',
              'File uploads & comments',
              'Activity logs & smart alerts',
              'Calendar & deadline tracking',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                  <FiCheck className="w-3 h-3 text-violet-400" />
                </div>
                <p className="text-sm text-slate-400 font-medium">{item}</p>
              </div>
            ))}
          </div>

          {/* Decorative card */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-slate-400 font-semibold">LIVE ACTIVITY</p>
            </div>
            <div className="space-y-2.5">
              {['Alex moved "Design Review" to Done', 'Sarah added comment on Sprint #12', 'Mike uploaded wireframes.pdf'].map((msg, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                    style={{ background: ['#7c3aed','#2563eb','#16a34a'][i] }}>
                    {msg[0]}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL – Register Form ───────────────────── */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10 relative overflow-y-auto">
        <div className="lg:hidden absolute inset-0 auth-grid-bg opacity-50" />
        <div className="lg:hidden absolute top-0 right-0 w-64 h-64 rounded-full bg-violet-600/8 blur-[80px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md py-8 animate-slide-right">
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
          <div className="mb-7">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Create your account
              <span className="text-violet-400">.</span>
            </h2>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              Join your team in the TaskPilot workspace
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <p className="text-rose-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                  <FiUser className="w-4 h-4" />
                </div>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/80 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-2xl text-slate-100 placeholder-slate-600 transition-all text-sm font-medium"
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                  <FiMail className="w-4 h-4" />
                </div>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/80 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-2xl text-slate-100 placeholder-slate-600 transition-all text-sm font-medium"
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-900/80 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-2xl text-slate-100 placeholder-slate-600 transition-all text-sm font-medium"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
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
              {/* Password strength meter */}
              {password.length > 0 && (
                <div className="space-y-1.5 animate-fade-in">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-800'}`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Password strength: <span className={`font-bold ${['','text-rose-400','text-amber-400','text-yellow-400','text-emerald-400','text-violet-400'][strength]}`}>{strengthLabel}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Workspace Role</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map(({ value, icon: Icon, label, desc, gradient, border, iconColor, iconBg }) => (
                  <label
                    key={value}
                    className={`relative flex flex-col gap-2 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      role === value
                        ? `bg-gradient-to-br ${gradient} ${border} shadow-lg`
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={role === value}
                      onChange={() => setRole(value)}
                      className="sr-only"
                    />
                    <div className={`w-9 h-9 rounded-xl ${role === value ? iconBg : 'bg-slate-800'} flex items-center justify-center transition-colors`}>
                      <Icon className={`w-4 h-4 ${role === value ? iconColor : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${role === value ? 'text-white' : 'text-slate-400'}`}>{label}</p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{desc}</p>
                    </div>
                    {role === value && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
                        <FiCheck className="w-3 h-3 text-violet-400" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="register-submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold text-sm rounded-2xl transition-all duration-200 shadow-xl shadow-violet-600/20 hover:shadow-violet-600/30 hover:-translate-y-0.5 cursor-pointer disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group select-none"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600 font-medium">Already a member?</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
          <div className="mt-4">
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-sm rounded-2xl transition-all duration-200"
            >
              Sign in to your account
            </Link>
          </div>

          <p className="mt-5 text-center text-[11px] text-slate-600 font-medium leading-relaxed">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
