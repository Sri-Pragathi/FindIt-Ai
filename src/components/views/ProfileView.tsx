import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Building,
  ShieldCheck,
  Bell,
  LogOut,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProfileView: React.FC = () => {
  const { currentUser, availableUsers, switchUser, resetDemoData, logout, navigate, showToast } = useApp();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [handoverReminders, setHandoverReminders] = useState(true);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-campus-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-campus-forest font-heading">
          Campus Profile &amp; Preferences
        </h1>

        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-campus-sage/20 shadow-md space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={
                currentUser.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
              }
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-campus-amber shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-campus-forest font-heading">
                  {currentUser.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-campus-amber/20 text-campus-charcoal font-bold text-[10px] uppercase tracking-wider">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-campus-charcoal/70 mt-0.5">{currentUser.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified University Identity
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-campus-sage/15 text-xs">
            <div>
              <span className="font-semibold text-campus-charcoal/60 block text-[11px]">Institution</span>
              <span className="font-bold text-campus-forest">{currentUser.college}</span>
            </div>
            <div>
              <span className="font-semibold text-campus-charcoal/60 block text-[11px]">Department / Division</span>
              <span className="font-bold text-campus-forest">
                {currentUser.department || 'Campus Community'}
              </span>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-3xl p-6 border border-campus-sage/20 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-campus-forest uppercase tracking-wider">
            Notification Preferences
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-campus-ivory/50 cursor-pointer">
              <div>
                <p className="font-bold text-campus-forest">AI Match Alerts</p>
                <p className="text-[11px] text-campus-charcoal/70">
                  Notify me immediately when AI finds a candidate match for my lost report.
                </p>
              </div>
              <input
                type="checkbox"
                checked={matchAlerts}
                onChange={(e) => {
                  setMatchAlerts(e.target.checked);
                  showToast('Preference saved', 'info');
                }}
                className="w-4 h-4 rounded text-campus-forest focus:ring-campus-forest"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-campus-ivory/50 cursor-pointer">
              <div>
                <p className="font-bold text-campus-forest">Handover &amp; Verification Reminders</p>
                <p className="text-[11px] text-campus-charcoal/70">
                  Send notifications when verification questions are asked or meeting time is agreed.
                </p>
              </div>
              <input
                type="checkbox"
                checked={handoverReminders}
                onChange={(e) => {
                  setHandoverReminders(e.target.checked);
                  showToast('Preference saved', 'info');
                }}
                className="w-4 h-4 rounded text-campus-forest focus:ring-campus-forest"
              />
            </label>
          </div>
        </div>

        {/* Quick Demo Switcher Section */}
        <div className="bg-white rounded-3xl p-6 border border-campus-sage/20 shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-sm text-campus-forest uppercase tracking-wider">
            Demo Persona Switcher
          </h3>
          <p className="text-campus-charcoal/70 text-[11px]">
            Quickly switch personas to experience and verify both sides of the lost-item verification and handover workflow:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {availableUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => switchUser(u.id)}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  currentUser.id === u.id
                    ? 'bg-campus-forest text-white border-campus-forest'
                    : 'bg-campus-ivory border-campus-sage/30 hover:border-campus-amber'
                }`}
              >
                <div>
                  <p className="font-bold text-xs">{u.name}</p>
                  <p className={`text-[10px] ${currentUser.id === u.id ? 'text-campus-sage' : 'text-gray-500'}`}>
                    {u.role.toUpperCase()} &bull; {u.department || u.college}
                  </p>
                </div>
                {currentUser.id === u.id && <CheckCircle2 className="w-4 h-4 text-campus-amber" />}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={resetDemoData}
            className="px-4 py-2.5 rounded-xl border border-campus-amber text-campus-amber hover:bg-campus-amber/10 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
