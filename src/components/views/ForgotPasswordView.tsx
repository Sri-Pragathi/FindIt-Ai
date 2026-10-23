import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ForgotPasswordView: React.FC = () => {
  const { navigate, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    showToast(`Password reset link dispatched to ${email}`, 'success');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-campus-ivory">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-campus-sage/20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-campus-amber/20 border border-campus-amber mx-auto flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-campus-forest" />
        </div>

        <h2 className="text-2xl font-bold text-campus-forest font-heading">
          Reset Campus Password
        </h2>
        <p className="text-xs text-campus-charcoal/70 mt-2 mb-6">
          Enter your university email address. We'll send an authenticated link to reset your password.
        </p>

        {submitted ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-semibold text-sm">Reset Instructions Sent</p>
            <p>
              Check your campus inbox at <strong>{email}</strong> for instructions.
            </p>
            <button
              onClick={() => navigate('login')}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-campus-forest hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-campus-forest mb-1">
                College Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@campus.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-xs text-campus-charcoal bg-campus-ivory/30 focus:bg-white focus:outline-none focus:border-campus-forest"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-campus-forest hover:bg-campus-forest-light text-campus-ivory font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
            >
              Send Reset Link
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('login')}
                className="text-xs font-semibold text-campus-charcoal/70 hover:text-campus-forest flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
