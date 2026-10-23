import React, { useState, useEffect } from 'react';
import {
  FileText,
  PlusCircle,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { LostItemReport, FoundItemReport, ClaimRequest, ItemMatch } from '../../types';
import { ItemImage } from '../common/ItemImage';

export const MyReportsView: React.FC = () => {
  const { currentUser, navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'lost' | 'found' | 'claims' | 'completed'>('lost');
  const [lostReports, setLostReports] = useState<LostItemReport[]>([]);
  const [foundReports, setFoundReports] = useState<FoundItemReport[]>([]);
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    Promise.all([
      api.getLostReports({ reporterId: currentUser.id }),
      api.getFoundReports({ reporterId: currentUser.id }),
      api.getClaims(currentUser.id),
      api.getMatches(currentUser.id),
    ])
      .then(([lost, found, userClaims, userMatches]) => {
        setLostReports(lost);
        setFoundReports(found);
        setClaims(userClaims);
        // Only matches scoring 50% or higher
        setMatches((userMatches || []).filter((m) => m.score >= 50));
      })
      .catch((err) => console.warn('MyReports fetch fallback:', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const activeClaims = claims.filter((c) => c.status === 'active');
  const completedClaims = claims.filter((c) => c.status === 'completed');

  return (
    <div className="min-h-screen bg-campus-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-campus-forest font-heading">
              My Campus Records &amp; Claims
            </h1>
            <p className="text-xs sm:text-sm text-campus-charcoal/70 mt-1">
              Manage your active inquiries, custody status, and verification progress.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('report_lost')}
              className="px-3.5 py-2 rounded-xl bg-campus-amber text-campus-charcoal font-bold text-xs uppercase tracking-wider hover:bg-[#b88636] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Lost</span>
            </button>
            <button
              onClick={() => navigate('report_found')}
              className="px-3.5 py-2 rounded-xl bg-campus-forest text-campus-ivory font-bold text-xs uppercase tracking-wider hover:bg-campus-forest-light transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-campus-amber" />
              <span>Report Found</span>
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center p-1.5 rounded-2xl bg-white border border-campus-sage/30 shadow-xs overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'lost'
                ? 'bg-campus-forest text-white shadow-xs'
                : 'text-campus-charcoal/70 hover:text-campus-forest'
            }`}
          >
            My Lost Items ({lostReports.length})
          </button>
          <button
            onClick={() => setActiveTab('found')}
            className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'found'
                ? 'bg-campus-forest text-white shadow-xs'
                : 'text-campus-charcoal/70 hover:text-campus-forest'
            }`}
          >
            My Found Items ({foundReports.length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'claims'
                ? 'bg-campus-forest text-white shadow-xs'
                : 'text-campus-charcoal/70 hover:text-campus-forest'
            }`}
          >
            Active Claims ({activeClaims.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-campus-forest text-white shadow-xs'
                : 'text-campus-charcoal/70 hover:text-campus-forest'
            }`}
          >
            Completed Returns ({completedClaims.length})
          </button>
        </div>

        {/* Content Panel */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-campus-forest border-t-transparent animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* LOST TAB */}
            {activeTab === 'lost' && (
              <>
                {lostReports.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-campus-sage/20 space-y-3">
                    <p className="text-sm font-semibold text-campus-forest">
                      You haven't filed any lost item reports.
                    </p>
                    <button
                      onClick={() => navigate('report_lost')}
                      className="px-4 py-2 rounded-xl bg-campus-amber text-campus-charcoal font-bold text-xs uppercase"
                    >
                      Report a Lost Item
                    </button>
                  </div>
                ) : (
                  lostReports.map((item) => {
                    const itemMatches = matches.filter(
                      (m) => m.lostReportId === item.id && m.status === 'suggested'
                    );
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-5 border border-campus-sage/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-campus-ivory/50 flex items-center justify-center">
                            <ItemImage
                              src={item.photoUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              showPlaceholderIcon={false}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-campus-forest">{item.title}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                                {item.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-campus-charcoal/70 line-clamp-2 mt-1">
                              {item.description}
                            </p>
                            <p className="text-[11px] text-campus-charcoal/60 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-campus-amber" /> {item.location} &bull; Lost {item.dateLost}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                          {itemMatches.length > 0 && (
                            <button
                              onClick={() => navigate('match_review', { matchId: itemMatches[0].id })}
                              className="px-3.5 py-2 rounded-xl bg-campus-amber hover:bg-[#b88636] text-campus-charcoal font-bold text-xs flex items-center gap-1.5 shadow-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{itemMatches.length} AI Match Found!</span>
                            </button>
                          )}
                          <button
                            onClick={() => navigate('item_detail', { itemId: item.id, itemType: 'lost' })}
                            className="px-3 py-2 rounded-xl border border-campus-sage/40 text-campus-forest hover:bg-campus-ivory font-semibold text-xs transition"
                          >
                            View Record
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* FOUND TAB */}
            {activeTab === 'found' && (
              <>
                {foundReports.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-campus-sage/20 space-y-3">
                    <p className="text-sm font-semibold text-campus-forest">
                      You haven't logged any found items.
                    </p>
                    <button
                      onClick={() => navigate('report_found')}
                      className="px-4 py-2 rounded-xl bg-campus-forest text-white font-bold text-xs uppercase"
                    >
                      Report a Found Item
                    </button>
                  </div>
                ) : (
                  foundReports.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-5 border border-campus-sage/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-campus-ivory/50 flex items-center justify-center">
                          <ItemImage
                            src={item.photoUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            showPlaceholderIcon={false}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-campus-forest">{item.title}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                              {item.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-campus-charcoal/70 line-clamp-2 mt-1">
                            {item.description}
                          </p>
                          <p className="text-[11px] text-campus-charcoal/60 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-campus-amber" /> {item.location} &bull; Custody: {item.custodyStatus.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => navigate('item_detail', { itemId: item.id, itemType: 'found' })}
                          className="px-3 py-2 rounded-xl border border-campus-sage/40 text-campus-forest hover:bg-campus-ivory font-semibold text-xs transition"
                        >
                          View Custody Record
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* CLAIMS TAB */}
            {activeTab === 'claims' && (
              <>
                {activeClaims.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-campus-sage/20">
                    <p className="text-sm font-semibold text-campus-forest">
                      No active claims in progress.
                    </p>
                    <p className="text-xs text-campus-charcoal/60 mt-1">
                      When you claim a found item or someone claims your report, it will show up here.
                    </p>
                  </div>
                ) : (
                  activeClaims.map((claim) => (
                    <div
                      key={claim.id}
                      onClick={() => navigate('claim_detail', { claimId: claim.id })}
                      className="bg-white rounded-2xl p-5 border border-campus-sage/20 shadow-xs hover:border-campus-amber transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                            <span className="px-2 py-0.5 rounded-full bg-campus-amber/20 text-campus-charcoal font-semibold text-[10px] uppercase">
                              {claim.stage.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-campus-charcoal/80 mt-1">
                            Claimant: <strong>{claim.claimantName}</strong> &bull; Finder: <strong>{claim.finderName}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <span className="text-xs font-semibold text-campus-forest flex items-center gap-1">
                          Open State Machine <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* COMPLETED TAB */}
            {activeTab === 'completed' && (
              <>
                {completedClaims.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-campus-sage/20">
                    <p className="text-sm font-semibold text-campus-forest">
                      No completed returns yet.
                    </p>
                    <p className="text-xs text-campus-charcoal/60 mt-1">
                      Once both participants confirm a physical handover, the resolved queries appear here.
                    </p>
                  </div>
                ) : (
                  completedClaims.map((claim) => (
                    <div
                      key={claim.id}
                      onClick={() => navigate('claim_detail', { claimId: claim.id })}
                      className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-xs text-campus-forest">
                            Claim #{claim.id} — Successfully Returned
                          </p>
                          <p className="text-xs text-campus-charcoal/70">
                            Returned to {claim.claimantName} by {claim.finderName}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700">
                        View Audit Log &rarr;
                      </span>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
