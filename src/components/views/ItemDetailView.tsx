import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { LostItemReport, FoundItemReport, ItemMatch } from '../../types';
import { ItemImage } from '../common/ItemImage';

export const ItemDetailView: React.FC = () => {
  const { selectedItemId, selectedItemType, currentUser, navigate, showToast } = useApp();
  const [item, setItem] = useState<LostItemReport | FoundItemReport | null>(null);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedItemId || !selectedItemType) return;
    setLoading(true);
    setError(null);

    api.getItemDetail(selectedItemType, selectedItemId, currentUser?.id)
      .then((data) => {
        setItem(data);
        return api.getMatchesForReport(selectedItemId);
      })
      .then((mList) => {
        setMatches(mList || []);
      })
      .catch((err) => {
        setError(err.message || 'Access denied. This report is private.');
      })
      .finally(() => setLoading(false));
  }, [selectedItemId, selectedItemType, currentUser?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-campus-ivory py-16 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-campus-forest border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-campus-ivory py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-campus-sage/30 shadow-lg text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-campus-forest font-heading">
            Private Campus Record
          </h2>
          <p className="text-xs text-campus-charcoal/70 leading-relaxed">
            {error || 'This report is private and only visible to the owner and verified participants with a 50%+ AI match.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('browse')}
              className="px-5 py-2.5 rounded-xl bg-campus-forest text-white font-bold text-xs uppercase cursor-pointer"
            >
              Return to My Records
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLost = selectedItemType === 'lost';
  const isOwner = currentUser && item.reportedBy === currentUser.id;
  const isFound = !isLost;

  const handleInitiateClaim = async () => {
    if (!currentUser) {
      showToast('Please sign in to claim an item.', 'error');
      navigate('login');
      return;
    }

    // Find the user's open lost report to link to this claim
    try {
      const myLost = await api.getLostReports({ reporterId: currentUser.id });
      if (myLost.length === 0) {
        showToast(
          'Please first report your lost item so our system can link the claim and verification questions.',
          'info'
        );
        navigate('report_lost');
        return;
      }

      // Link with the first open report or matching category
      const matchingLost =
        myLost.find((l) => l.category === item.category && l.status === 'open') || myLost[0];

      const claim = await api.initiateClaim({
        lostReportId: matchingLost.id,
        foundReportId: item.id,
        claimantId: currentUser.id,
      });

      showToast('Claim initiated! The finder has been notified.', 'success');
      navigate('claim_detail', { claimId: claim.id });
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-campus-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigate('browse')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-campus-forest hover:text-campus-amber transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Browse
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-3xl overflow-hidden border border-campus-sage/25 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Photograph */}
            <div className="relative h-72 md:h-full min-h-[300px] bg-campus-ivory/50 overflow-hidden flex items-center justify-center">
              <ItemImage
                src={item.photoUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                showPlaceholderIcon={true}
              />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md ${
                    isLost ? 'bg-amber-600 text-white' : 'bg-emerald-700 text-white'
                  }`}
                >
                  {isLost ? 'Lost Item' : 'Found Item'}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-black/60 text-white backdrop-blur-xs">
                  {item.category}
                </span>
              </div>
            </div>

            {/* Right: Details */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs text-campus-charcoal/60 mb-2">
                  <span>Report #{item.id}</span>
                  <span className="capitalize font-semibold text-campus-forest">
                    Status: {item.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-campus-forest font-heading">
                  {item.title}
                </h1>

                <p className="text-xs text-campus-charcoal/80 mt-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Specs Grid */}
                <div className="mt-6 pt-4 border-t border-campus-sage/20 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-campus-charcoal/60 font-semibold block text-[11px]">
                      {isLost ? 'Date Lost' : 'Date Found'}
                    </span>
                    <span className="font-bold text-campus-forest">
                      {isLost ? (item as LostItemReport).dateLost : (item as FoundItemReport).dateFound}
                    </span>
                  </div>

                  <div>
                    <span className="text-campus-charcoal/60 font-semibold block text-[11px]">
                      Campus Location
                    </span>
                    <span className="font-bold text-campus-forest truncate block">
                      {item.location}
                    </span>
                  </div>

                  {item.brand && (
                    <div>
                      <span className="text-campus-charcoal/60 font-semibold block text-[11px]">
                        Brand / Make
                      </span>
                      <span className="font-bold text-campus-forest">{item.brand}</span>
                    </div>
                  )}

                  {item.color && (
                    <div>
                      <span className="text-campus-charcoal/60 font-semibold block text-[11px]">
                        Color
                      </span>
                      <span className="font-bold text-campus-forest">{item.color}</span>
                    </div>
                  )}

                  {isFound && (
                    <div className="col-span-2">
                      <span className="text-campus-charcoal/60 font-semibold block text-[11px]">
                        Current Custody
                      </span>
                      <span className="font-bold text-emerald-800 capitalize">
                        {(item as FoundItemReport).custodyStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confidential Clues notice or display */}
                {isOwner && item.secretClues && (
                  <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      Your Confidential Verification Clue:
                    </span>
                    <p className="text-[11px] text-amber-800">{item.secretClues}</p>
                    <p className="text-[10px] text-amber-700/70">
                      (Visible only to you and verified campus moderators)
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-campus-sage/20 space-y-3">
                {isFound && !isOwner && (
                  <button
                    onClick={handleInitiateClaim}
                    className="w-full py-3 px-4 rounded-xl bg-campus-amber hover:bg-[#b88636] text-campus-charcoal font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>This Might Be Mine (Initiate Claim)</span>
                  </button>
                )}

                {matches.length > 0 && (
                  <div className="p-3 rounded-xl bg-campus-forest text-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-campus-amber" />
                      <span>{matches.length} AI Potential Match Available</span>
                    </div>
                    <button
                      onClick={() => navigate('match_review', { matchId: matches[0].id })}
                      className="px-3 py-1 rounded-lg bg-campus-amber text-campus-charcoal font-bold text-xs hover:bg-[#b88636]"
                    >
                      Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
