import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { LostItemReport, FoundItemReport, ItemMatch, ClaimRequest } from '../../types';
import { ItemImage } from '../common/ItemImage';

export const DashboardView: React.FC = () => {
  const { currentUser, navigate, unreadNotificationCount } = useApp();
  const [myLost, setMyLost] = useState<LostItemReport[]>([]);
  const [myFound, setMyFound] = useState<FoundItemReport[]>([]);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    Promise.all([
      api.getLostReports({ reporterId: currentUser.id }),
      api.getFoundReports({ reporterId: currentUser.id }),
      api.getMatches(currentUser.id),
      api.getClaims(currentUser.id),
    ])
      .then(([lost, found, userMatches, userClaims]) => {
        setMyLost(lost);
        setMyFound(found);
        setClaims(userClaims);

        // Strict 50% minimum AI matching threshold and suggested status
        const relevantMatches = (userMatches || []).filter(
          (m) => m.score >= 50 && m.status === 'suggested'
        );
        setMatches(relevantMatches);
      })
      .catch((err) => console.warn('Dashboard data fetch fallback:', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const activeClaimsCount = claims.filter((c) => c.status === 'active').length;
  const topMatch = matches[0];

  return (
    <div className="min-h-screen bg-campus-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-campus-forest text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-campus-forest-light flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-campus-amber/20 text-campus-amber text-xs font-semibold mb-3 border border-campus-amber/30">
              <span className="w-2 h-2 rounded-full bg-campus-amber animate-pulse" />
              Siddhartha University Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Welcome back, {currentUser?.name || 'Student'}
            </h1>
            <p className="text-xs sm:text-sm text-campus-sage mt-1">
              {currentUser?.department || 'Undergraduate Division'} • {currentUser?.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('report_lost')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-campus-amber hover:bg-[#b88636] text-campus-charcoal font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Lost Item</span>
            </button>
            <button
              onClick={() => navigate('report_found')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-campus-amber" />
              <span>Report Found Item</span>
            </button>
          </div>
        </div>

        {/* HIGH PRIORITY AI MATCH ALERT CARD OR CLEAN EMPTY STATE */}
        {topMatch ? (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-6 shadow-xl border border-amber-300 relative overflow-hidden animate-in fade-in slide-in-from-top-4">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 flex items-center justify-center font-extrabold text-xl shadow-md flex-shrink-0">
                  {topMatch.score}%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                      High Confidence AI Match
                    </span>
                    <span className="text-xs text-amber-100">Match #{topMatch.id}</span>
                  </div>
                  <h2 className="text-lg font-bold font-heading text-white mt-1">
                    Potential Match Discovered for Your Lost Item!
                  </h2>
                  <p className="text-xs text-white/90 max-w-xl mt-1 leading-relaxed">
                    {topMatch.breakdown.aiAnalysisSummary ||
                      'Our AI matching engine found an item that strongly aligns with your reported belongings.'}
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={() => navigate('match_review', { matchId: topMatch.id })}
                  className="px-5 py-3 rounded-xl bg-white text-campus-forest font-bold text-xs tracking-wider uppercase hover:bg-campus-ivory transition shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <span>Review Match</span>
                  <ArrowRight className="w-4 h-4 text-campus-amber" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-5 border border-campus-sage/20 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-campus-ivory text-campus-forest flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-campus-amber" />
            </div>
            <div>
              <p className="text-xs font-bold text-campus-forest">
                No matching items found yet. We'll notify you when a relevant match appears.
              </p>
              <p className="text-[11px] text-campus-charcoal/70 mt-0.5">
                Our AI matching service scans campus reports internally. Matches scoring 50% or higher will connect you and the counter-party privately.
              </p>
            </div>
          </div>
        )}

        {/* SUMMARY CARDS METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div
            onClick={() => navigate('my_reports')}
            className="bg-white rounded-2xl p-5 border border-campus-sage/20 shadow-sm hover:border-campus-amber transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-campus-charcoal/70">My Lost Items</span>
              <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs">
                L
              </span>
            </div>
            <p className="text-2xl font-extrabold text-campus-forest font-heading mt-3">
              {myLost.length}
            </p>
            <p className="text-[11px] text-campus-charcoal/60 mt-1 flex items-center gap-1">
              <span>View status</span> <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>

          <div
            onClick={() => navigate('my_reports')}
            className="bg-white rounded-2xl p-5 border border-campus-sage/20 shadow-sm hover:border-campus-amber transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-campus-charcoal/70">My Found Reports</span>
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold text-xs">
                F
              </span>
            </div>
            <p className="text-2xl font-extrabold text-campus-forest font-heading mt-3">
              {myFound.length}
            </p>
            <p className="text-[11px] text-campus-charcoal/60 mt-1 flex items-center gap-1">
              <span>Manage custody</span> <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>

          <div
            onClick={() => navigate('my_reports')}
            className="bg-white rounded-2xl p-5 border border-campus-sage/20 shadow-sm hover:border-campus-amber transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-campus-charcoal/70">Active Claims</span>
              <span className="w-8 h-8 rounded-xl bg-campus-amber/15 text-campus-forest flex items-center justify-center font-bold text-xs">
                C
              </span>
            </div>
            <p className="text-2xl font-extrabold text-campus-amber font-heading mt-3">
              {activeClaimsCount}
            </p>
            <p className="text-[11px] text-campus-charcoal/60 mt-1 flex items-center gap-1">
              <span>Track stages</span> <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>

          <div
            onClick={() => navigate('notifications')}
            className="bg-white rounded-2xl p-5 border border-campus-sage/20 shadow-sm hover:border-campus-amber transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-campus-charcoal/70">Notifications</span>
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                N
              </span>
            </div>
            <p className="text-2xl font-extrabold text-campus-forest font-heading mt-3">
              {unreadNotificationCount} unread
            </p>
            <p className="text-[11px] text-campus-charcoal/60 mt-1 flex items-center gap-1">
              <span>Inbox updates</span> <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </div>

        {/* ACTIVE CLAIMS IN PROGRESS */}
        {claims.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-campus-sage/20 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-campus-forest font-heading">
                  Active Claims &amp; Verifications
                </h2>
                <p className="text-xs text-campus-charcoal/70">
                  Track verification questions, handover arrangements, and query closure.
                </p>
              </div>
              <button
                onClick={() => navigate('my_reports')}
                className="text-xs font-semibold text-campus-forest hover:text-campus-amber transition"
              >
                View All Claims &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  onClick={() => navigate('claim_detail', { claimId: claim.id })}
                  className="p-4 rounded-2xl bg-campus-ivory/50 border border-campus-sage/30 hover:border-campus-forest transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-campus-forest text-campus-amber flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {claim.stage.split('_')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-campus-forest">
                          Claim #{claim.id}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-campus-amber/20 text-campus-charcoal font-semibold border border-campus-amber/30 uppercase">
                          {claim.stage.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-campus-charcoal/80 mt-1">
                        Claimant: <strong>{claim.claimantName}</strong> &bull; Finder: <strong>{claim.finderName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-semibold text-campus-forest flex items-center gap-1">
                      Manage Claim <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECENT CAMPUS ACTIVITY & QUICK SAFE SPOTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: User's Own Active Reports */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-campus-sage/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-campus-sage/15">
              <div>
                <h3 className="font-bold text-base text-campus-forest font-heading">
                  My Active Reports &amp; Intake
                </h3>
                <p className="text-xs text-campus-charcoal/70">
                  Your personal lost and found filings, custody statuses, and resolution states.
                </p>
              </div>
              <button
                onClick={() => navigate('my_reports')}
                className="text-xs font-bold text-campus-forest hover:text-campus-amber transition"
              >
                Manage All &rarr;
              </button>
            </div>

            {myLost.length === 0 && myFound.length === 0 ? (
              <div className="p-8 text-center bg-campus-ivory/50 rounded-2xl border border-dashed border-campus-sage/30 space-y-3">
                <p className="text-xs text-campus-charcoal/70">
                  You have no active lost or found reports logged yet.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => navigate('report_lost')}
                    className="px-3 py-1.5 rounded-xl bg-campus-amber text-campus-charcoal font-bold text-xs uppercase"
                  >
                    Report Lost Item
                  </button>
                  <button
                    onClick={() => navigate('report_found')}
                    className="px-3 py-1.5 rounded-xl bg-campus-forest text-white font-bold text-xs uppercase"
                  >
                    Report Found Item
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...myLost.map((l) => ({ item: l, type: 'lost' as const })), ...myFound.map((f) => ({ item: f, type: 'found' as const }))].slice(0, 4).map(({ item, type }) => {
                  const isLost = type === 'lost';
                  return (
                    <div
                      key={item.id}
                      onClick={() => navigate('item_detail', { itemId: item.id, itemType: type })}
                      className="p-3 rounded-2xl bg-campus-ivory/40 border border-campus-sage/30 hover:border-campus-amber transition cursor-pointer flex gap-3 group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-campus-ivory flex items-center justify-center">
                        <ItemImage
                          src={item.photoUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          showPlaceholderIcon={false}
                        />
                      </div>
                      <div className="overflow-hidden flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                isLost ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                              }`}
                            >
                              {isLost ? 'Lost' : 'Found'}
                            </span>
                            <span className="text-[10px] text-campus-charcoal/60 truncate">
                              {item.category}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-campus-forest truncate mt-0.5 group-hover:text-campus-amber transition">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-[10px] text-campus-charcoal/60 truncate flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-campus-amber" />
                          {item.location}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Col: Safe Handover Vaults */}
          <div className="bg-campus-forest text-white rounded-3xl p-6 sm:p-7 border border-campus-forest-light shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-campus-amber">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">Safe Handover Hubs</h3>
              </div>
              <p className="text-xs text-campus-sage leading-relaxed">
                When returning or claiming items, always meet at official campus safety hubs with CCTV coverage.
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-semibold text-white">Campus Police Vault</p>
                  <p className="text-[11px] text-campus-sage">Administration Bldg Rm 102 &bull; 24/7</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-semibold text-white">Main Library Circulation</p>
                  <p className="text-[11px] text-campus-sage">Ground Floor Desk &bull; 7:30 AM - 11 PM</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-semibold text-white">Student Union Help Desk</p>
                  <p className="text-[11px] text-campus-sage">Level 1 Central Atrium &bull; 8 AM - 10 PM</p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-campus-forest-light">
              <button
                onClick={() => navigate('browse')}
                className="w-full py-2.5 rounded-xl bg-campus-amber text-campus-charcoal font-bold text-xs uppercase tracking-wider hover:bg-[#b88636] transition cursor-pointer"
              >
                View My Matches &amp; Records
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
