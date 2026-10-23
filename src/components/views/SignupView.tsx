import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Building, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const SignupView: React.FC = () => {
  const { loginUser, navigate, showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [college, setCollege] = useState('Siddhartha University');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!agreeTerms) {
      setError('You must accept the campus verification guidelines and privacy policy.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.signup({
        name,
        email,
        password,
        role,
        college,
        department,
      });
      loginUser(res.user, res.token);
      showToast(`Account created! Welcome to FindItAi, ${res.user.name}.`, 'success');
      navigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col md:flex-row bg-campus-ivory">
      {/* Left Column: Campus Photograph & University Identity */}
      <div className="relative md:w-5/12 min-h-[240px] md:min-h-auto flex items-center justify-center p-8 bg-campus-forest overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-campus-forest-dark via-campus-forest/80 to-campus-forest/60" />

        <div className="relative z-10 max-w-sm text-white space-y-4">
          <div className="w-10 h-10 rounded-xl bg-campus-amber/20 border border-campus-amber flex items-center justify-center p-1.5 shadow-inner">
            <img src="/icon.svg" alt="FindItAi logo" className="w-full h-full object-contain" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            Join the Campus Network
          </h2>

          <p className="text-xs text-campus-sage leading-relaxed">
            Create your university account to report lost valuables, log found belongings, and securely verify ownership.
          </p>

          <div className="pt-4 border-t border-campus-forest-light space-y-2 text-xs text-campus-ivory/80">
            <div className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-campus-amber mt-0.5 flex-shrink-0" />
              <span>Automatic matching against active campus queries</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-campus-amber mt-0.5 flex-shrink-0" />
              <span>Confidential verification without sharing personal numbers</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-campus-amber mt-0.5 flex-shrink-0" />
              <span>Safe return coordination at campus security desks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Ivory Registration Form */}
      <div className="md:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-campus-sage/20">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-campus-forest font-heading">Campus Registration</h2>
            <p className="text-xs text-campus-charcoal/70 mt-1">
              Please use your accredited institution email address (@campus.edu or @siddhartha.edu).
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4 text-xs">
            {/* Full Name & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-campus-forest mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-campus-charcoal/40">
                    <UserIcon className="w-4 h-4 text-campus-forest" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/30 focus:bg-white focus:outline-none focus:border-campus-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-campus-forest mb-1">Campus Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2.5 rounded-xl font-bold border transition text-center ${
                      role === 'student'
                        ? 'bg-campus-forest text-white border-campus-forest'
                        : 'bg-campus-ivory text-campus-charcoal border-campus-sage/40'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('faculty')}
                    className={`py-2.5 rounded-xl font-bold border transition text-center ${
                      role === 'faculty'
                        ? 'bg-campus-forest text-white border-campus-forest'
                        : 'bg-campus-ivory text-campus-charcoal border-campus-sage/40'
                    }`}
                  >
                    Faculty
                  </button>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-campus-forest mb-1">
                College Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-campus-charcoal/40">
                  <Mail className="w-4 h-4 text-campus-forest" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. m.lin@campus.edu"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/30 focus:bg-white focus:outline-none focus:border-campus-forest"
                />
              </div>
              <p className="text-[10px] text-campus-charcoal/60 mt-1">
                Must end with @campus.edu, @siddhartha.edu, or registered college domain.
              </p>
            </div>

            {/* Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-campus-forest mb-1">College</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/30 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-campus-forest mb-1">Department / Major</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Life Sciences"
                  className="w-full px-3 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/30 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-campus-forest mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/30 focus:bg-white focus:outline-none focus:border-campus-forest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-campus-charcoal/40"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-campus-forest mb-1">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-3 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/30 focus:bg-white focus:outline-none focus:border-campus-forest"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-campus-forest focus:ring-campus-forest"
                />
                <span className="text-[11px] text-campus-charcoal/80 leading-tight">
                  I agree to the FindItAi Campus Code of Conduct, safe handover guidelines, and university privacy policy.
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-campus-forest hover:bg-campus-forest-light text-campus-ivory font-bold tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Campus Account</span>
                  <ArrowRight className="w-4 h-4 text-campus-amber" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-campus-sage/20 text-center">
            <p className="text-xs text-campus-charcoal/70">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('login')}
                className="font-bold text-campus-forest hover:text-campus-amber transition"
              >
                Log In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
