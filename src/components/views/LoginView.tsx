import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const LoginView: React.FC = () => {
  const { loginUser, navigate, showToast, availableUsers } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your college email address.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(email, password);
      loginUser(res.user, res.token);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      navigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoUser = (userId: string) => {
    const u = availableUsers.find((user) => user.id === userId);
    if (u) {
      setEmail(u.email);
      setPassword('password123');
      setError(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col md:flex-row bg-campus-ivory">
      {/* Left Column: Campus Photograph & Messaging */}
      <div className="relative md:w-1/2 min-h-[280px] md:min-h-auto flex items-center justify-center p-8 bg-campus-forest overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-campus-forest-dark via-campus-forest/80 to-campus-forest/60" />

        <div className="relative z-10 max-w-md text-white space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-campus-amber/20 border border-campus-amber flex items-center justify-center p-2 shadow-inner">
            <img src="/icon.svg" alt="FindItAi logo" className="w-full h-full object-contain" />
          </div>

          <h2 className="text-3xl font-extrabold font-heading text-white tracking-tight">
            Campus Lost &amp; Found, <br />
            <span className="text-campus-amber">Secured by AI.</span>
          </h2>

          <p className="text-sm text-campus-sage leading-relaxed">
            Siddhartha University's centralized platform for students and faculty. Sign in with your official university email to search for belongings, report discovered items, or coordinate safe returns.
          </p>

          <div className="pt-4 border-t border-campus-forest-light space-y-2 text-xs text-campus-ivory/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-campus-amber flex-shrink-0" />
              <span>Restricted to authorized campus accounts (@campus.edu, @siddhartha.edu)</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-campus-amber flex-shrink-0" />
              <span>Multi-factor similarity scoring across images and descriptions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Clean Campus Ivory Login Card */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-campus-sage/20">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-campus-forest font-heading">Sign In to FindItAi</h2>
            <p className="text-xs text-campus-charcoal/70 mt-1">
              Enter your college email credentials to access your reports.
            </p>
          </div>

          {/* Quick Demo Persona Shortcuts */}
          <div className="mb-6 bg-campus-ivory p-3.5 rounded-2xl border border-campus-sage/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-campus-forest uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-campus-amber" /> Demo Persona One-Click:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => selectDemoUser('usr_student_alex')}
                className="p-2 rounded-xl bg-white hover:bg-campus-amber/10 border border-campus-sage/30 text-left transition"
              >
                <p className="font-bold text-campus-forest truncate">Alex Rivera</p>
                <p className="text-[10px] text-campus-charcoal/60 truncate">Student (Lost Laptop)</p>
              </button>
              <button
                type="button"
                onClick={() => selectDemoUser('usr_student_sarah')}
                className="p-2 rounded-xl bg-white hover:bg-campus-amber/10 border border-campus-sage/30 text-left transition"
              >
                <p className="font-bold text-campus-forest truncate">Sarah Chen</p>
                <p className="text-[10px] text-campus-charcoal/60 truncate">Student (Finder)</p>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-campus-forest mb-1">
                College Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-campus-charcoal/40">
                  <Mail className="w-4 h-4 text-campus-forest" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@campus.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-campus-sage/40 text-xs text-campus-charcoal bg-campus-ivory/30 focus:bg-white focus:outline-none focus:border-campus-forest transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-campus-forest">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('forgot_password')}
                  className="text-[11px] text-campus-forest hover:text-campus-amber font-medium transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-campus-charcoal/40">
                  <Lock className="w-4 h-4 text-campus-forest" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-campus-sage/40 text-xs text-campus-charcoal bg-campus-ivory/30 focus:bg-white focus:outline-none focus:border-campus-forest transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-campus-charcoal/40 hover:text-campus-forest"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-campus-forest focus:ring-campus-forest"
                />
                <span className="text-campus-charcoal/80 text-[11px]">Remember campus session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-campus-forest hover:bg-campus-forest-light text-campus-ivory font-bold text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-campus-amber" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-campus-sage/20 text-center">
            <p className="text-xs text-campus-charcoal/70">
              Don't have a FindItAi campus account?{' '}
              <button
                type="button"
                onClick={() => navigate('signup')}
                className="font-bold text-campus-forest hover:text-campus-amber transition"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
