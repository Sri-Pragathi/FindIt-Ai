import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Users,
  MapPin,
  TrendingUp,
  RotateCcw,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { SystemStats, ClaimRequest, CampusLocation } from '../../types';

export const AdminView: React.FC = () => {
  const { navigate, showToast, resetDemoData } = useApp();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [loading, setLoading] = useState(true);

  // New Domain
  const [newDomain, setNewDomain] = useState('');
  const [allowedDomains, setAllowedDomains] = useState(['campus.edu', 'siddhartha.edu', 'alumni.campus.edu']);

  useEffect(() => {
    Promise.all([api.getStats(), api.getClaims(), api.getLocations()])
      .then(([s, c, l]) => {
        setStats(s);
        setClaims(c);
        setLocations(l);
      })
      .catch((err) => console.warn('Admin fetch fallback:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    const clean = newDomain.trim().toLowerCase().replace(/^@/, '');
    if (!allowedDomains.includes(clean)) {
      setAllowedDomains([...allowedDomains, clean]);
      setNewDomain('');
      showToast(`Domain @${clean} added to authorized student/faculty email list.`, 'success');
    }
  };

  return (
    <div className="min-h-screen bg-campus-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-campus-forest text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-campus-forest-light flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-campus-amber text-campus-charcoal text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" />
              Campus Security &amp; Moderator Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
              FindItAi Administration &amp; Safe Exchange Operations
            </h1>
            <p className="text-xs sm:text-sm text-campus-sage mt-1">
              Siddhartha University Student Affairs &bull; Campus Police Desk Authorization
            </p>
          </div>

          <button
            onClick={resetDemoData}
            className="self-start md:self-center px-4 py-2.5 rounded-xl border border-campus-amber text-campus-amber hover:bg-campus-amber/10 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 border border-campus-sage/20 shadow-xs">
            <span className="text-xs text-campus-charcoal/60 font-semibold block">Total Lost Reports</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-campus-forest font-heading mt-2">
              {stats?.totalLostReports || 3}
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Active Inquiries</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-campus-sage/20 shadow-xs">
            <span className="text-xs text-campus-charcoal/60 font-semibold block">Found Items Logged</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-campus-forest font-heading mt-2">
              {stats?.totalFoundReports || 3}
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">In Secure Custody</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-campus-sage/20 shadow-xs">
            <span className="text-xs text-campus-charcoal/60 font-semibold block">Active Claim Workflows</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-campus-amber font-heading mt-2">
              {claims.filter((c) => c.status === 'active').length}
            </p>
            <span className="text-[10px] text-amber-700 font-semibold mt-1 block">Under Verification</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-campus-sage/20 shadow-xs">
            <span className="text-xs text-campus-charcoal/60 font-semibold block">Return Success Rate</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-heading mt-2">
              {stats?.matchRatePercent || 94}%
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Avg 1.4 Days Resolution</span>
          </div>
        </div>

        {/* CLAIMS IN PROGRESS & DISPUTES */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-campus-sage/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-campus-forest font-heading">
                All Campus Claims &amp; Verification Workflows
              </h2>
              <p className="text-xs text-campus-charcoal/70">
                Inspect 8-stage state machines and step in if a claim is disputed.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {claims.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No active claims on campus yet.</p>
            ) : (
              claims.map((claim) => (
                <div
                  key={claim.id}
                  onClick={() => navigate('claim_detail', { claimId: claim.id })}
                  className="p-4 rounded-2xl bg-campus-ivory/50 border border-campus-sage/30 hover:border-campus-forest transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-campus-forest text-campus-amber flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {claim.stage.split('_')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-campus-forest">Claim #{claim.id}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            claim.status === 'disputed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-campus-amber/20 text-campus-charcoal'
                          }`}
                        >
                          {claim.stage.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-campus-charcoal/80 mt-1">
                        Owner: <strong>{claim.claimantName}</strong> &bull; Finder: <strong>{claim.finderName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-campus-forest">
                      Review State Machine &rarr;
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DOMAIN SETTINGS & SAFE HUBS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allowed Domains */}
          <div className="bg-white rounded-3xl p-6 border border-campus-sage/20 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-campus-forest font-heading">
              Authorized College Email Domains
            </h3>
            <p className="text-xs text-campus-charcoal/70">
              Only registrations from verified educational domains are admitted into the lost-and-found system.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {allowedDomains.map((d) => (
                <span
                  key={d}
                  className="px-3 py-1 rounded-xl bg-campus-ivory border border-campus-sage/40 text-campus-forest text-xs font-semibold"
                >
                  @{d}
                </span>
              ))}
            </div>

            <form onSubmit={handleAddDomain} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="e.g. state.edu"
                className="flex-1 px-3 py-2 rounded-xl border border-campus-sage/40 text-xs focus:outline-none focus:border-campus-forest"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-campus-forest hover:bg-campus-forest-light text-campus-ivory font-bold text-xs uppercase"
              >
                Add Domain
              </button>
            </form>
          </div>

          {/* Designated Safe Exchange Spots */}
          <div className="bg-white rounded-3xl p-6 border border-campus-sage/20 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-campus-forest font-heading">
              Official Safe Return Locations
            </h3>
            <p className="text-xs text-campus-charcoal/70">
              Campus monitored zones with camera surveillance and staffed desks for physical handovers.
            </p>

            <div className="space-y-2.5">
              {locations.map((loc) => (
                <div key={loc.id} className="p-3 rounded-xl bg-campus-ivory/50 border border-campus-sage/30 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-campus-forest">{loc.name}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      24/7 Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-campus-charcoal/70 mt-0.5">
                    {loc.building} ({loc.room || 'Main Desk'}) &bull; {loc.hours}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
