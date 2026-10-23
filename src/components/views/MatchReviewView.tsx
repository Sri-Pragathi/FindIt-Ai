import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  MapPin,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ItemMatch, LostItemReport, FoundItemReport } from '../../types';
import { ItemImage } from '../common/ItemImage';

export const MatchReviewView: React.FC = () => {
  const { selectedMatchId, currentUser, navigate, showToast } = useApp();
  const [match, setMatch] = useState<ItemMatch | null>(null);
  const [lostReport, setLostReport] = useState<LostItemReport | null>(null);
  const [foundReport, setFoundReport] = useState<FoundItemReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const matches = await api.getMatches(currentUser?.id);
        const foundMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];
        if (!foundMatch || foundMatch.score < 50) {
          showToast('No qualifying match record found (minimum 50% score required).', 'error');
          navigate('dashboard');
          return;
        }

        setMatch(foundMatch);
        const [lost, found] = await Promise.all([
          api.getItemDetail('lost', foundMatch.lostReportId) as Promise<LostItemReport>,
          api.getItemDetail('found', foundMatch.foundReportId) as Promise<FoundItemReport>,
        ]);
        setLostReport(lost);
        setFoundReport(found);
      } catch (err: any) {
        showToast(`Failed loading match: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedMatchId, navigate, showToast]);

  const handleAcceptMatch = async () => {
    if (!match || !lostReport || !foundReport || !currentUser) return;
    setProcessing(true);
    try {
      const claim = await api.initiateClaim({
        matchId: match.id,
        lostReportId: lostReport.id,
        foundReportId: foundReport.id,
        claimantId: currentUser.id,
      });
      showToast('Claim initiated! Stage 1 complete. Proceeding to verification questions.', 'success');
      navigate('claim_detail', { claimId: claim.id });
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDismissMatch = async () => {
    if (!match || !currentUser) return;
    setProcessing(true);
    try {
      await api.dismissMatch(match.id, currentUser.id);
      showToast('Candidate match dismissed.', 'info');
      navigate('dashboard');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !match || !lostReport || !foundReport) {
    return (
      <div className="min-h-screen bg-campus-ivory py-16 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-campus-forest border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-campus-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-campus-forest hover:text-campus-amber transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <span className="text-xs text-campus-charcoal/60">Match ID: #{match.id}</span>
        </div>

        {/* AI Correlation Hero Banner */}
        <div className="bg-campus-forest text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-campus-forest-light relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-campus-amber/20 text-campus-amber text-xs font-bold border border-campus-amber/30 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Assisted Candidate Match
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                Review Potential Belonging Match
              </h1>
              <p className="text-xs sm:text-sm text-campus-sage leading-relaxed">
                {match.breakdown.aiAnalysisSummary ||
                  'The AI matching engine identified high correlation between your lost report and this discovered item.'}
              </p>
            </div>

            {/* Score Ring / Gauge */}
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20 self-start md:self-center flex-shrink-0">
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-campus-amber font-heading">
                  {match.score}%
                </p>
                <p className="text-[10px] text-campus-sage uppercase font-bold tracking-wider">
                  Overall Score
                </p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-campus-amber text-campus-charcoal text-[10px] font-bold uppercase tracking-wider">
                  {match.confidenceLevel} Confidence
                </span>
                <p className="text-[11px] text-campus-sage mt-1">Multi-factor verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lost Item Card */}
          <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
                  Your Lost Report
                </span>
                <span className="text-xs text-gray-500">#{lostReport.id}</span>
              </div>
              <span className="text-xs font-semibold text-campus-forest">{lostReport.reporterName}</span>
            </div>

            <div className="h-44 rounded-2xl overflow-hidden bg-campus-ivory/50 flex items-center justify-center">
              <ItemImage
                src={lostReport.photoUrl}
                alt={lostReport.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="font-bold text-base text-campus-forest">{lostReport.title}</h3>
              <p className="text-xs text-campus-charcoal/70 mt-1 leading-relaxed">
                {lostReport.description}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-campus-charcoal/80">
              <p>
                <strong className="text-campus-forest">Location:</strong> {lostReport.location}
              </p>
              <p>
                <strong className="text-campus-forest">Date Lost:</strong> {lostReport.dateLost}
              </p>
              {lostReport.brand && (
                <p>
                  <strong className="text-campus-forest">Brand:</strong> {lostReport.brand}
                </p>
              )}
              {lostReport.color && (
                <p>
                  <strong className="text-campus-forest">Color:</strong> {lostReport.color}
                </p>
              )}
            </div>
          </div>

          {/* Found Item Card */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider">
                  Discovered Item
                </span>
                <span className="text-xs text-gray-500">#{foundReport.id}</span>
              </div>
              <span className="text-xs font-semibold text-campus-forest">Reported by Finder</span>
            </div>

            <div className="h-44 rounded-2xl overflow-hidden bg-campus-ivory/50 flex items-center justify-center">
              <ItemImage
                src={foundReport.photoUrl}
                alt={foundReport.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="font-bold text-base text-campus-forest">{foundReport.title}</h3>
              <p className="text-xs text-campus-charcoal/70 mt-1 leading-relaxed">
                {foundReport.description}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-campus-charcoal/80">
              <p>
                <strong className="text-campus-forest">Location:</strong> {foundReport.location}
              </p>
              <p>
                <strong className="text-campus-forest">Date Found:</strong> {foundReport.dateFound}
              </p>
              {foundReport.brand && (
                <p>
                  <strong className="text-campus-forest">Brand:</strong> {foundReport.brand}
                </p>
              )}
              {foundReport.color && (
                <p>
                  <strong className="text-campus-forest">Color:</strong> {foundReport.color}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown Factors & Reasoning Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-campus-sage/20 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-campus-forest font-heading">
            Similarity Breakdown &amp; Supporting Evidence
          </h2>

          {/* Sub-scores */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-3 rounded-2xl bg-campus-ivory/60 border border-campus-sage/20 text-center">
              <p className="text-xs text-campus-charcoal/70 font-semibold">Category</p>
              <p className="text-lg font-bold text-campus-forest mt-1">
                {match.breakdown.categoryCompatibility}%
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-campus-ivory/60 border border-campus-sage/20 text-center">
              <p className="text-xs text-campus-charcoal/70 font-semibold">Text Similarity</p>
              <p className="text-lg font-bold text-campus-forest mt-1">
                {match.breakdown.textScore}%
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-campus-ivory/60 border border-campus-sage/20 text-center">
              <p className="text-xs text-campus-charcoal/70 font-semibold">Color &amp; Brand</p>
              <p className="text-lg font-bold text-campus-forest mt-1">
                {match.breakdown.colorBrandScore}%
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-campus-ivory/60 border border-campus-sage/20 text-center">
              <p className="text-xs text-campus-charcoal/70 font-semibold">Location</p>
              <p className="text-lg font-bold text-campus-forest mt-1">
                {match.breakdown.locationScore}%
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-campus-ivory/60 border border-campus-sage/20 text-center">
              <p className="text-xs text-campus-charcoal/70 font-semibold">Date Alignment</p>
              <p className="text-lg font-bold text-campus-forest mt-1">
                {match.breakdown.dateScore}%
              </p>
            </div>
          </div>

          {/* Bullet Reasons */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-campus-forest uppercase tracking-wider">
              Key Evidence Points:
            </p>
            <ul className="space-y-1.5 text-xs text-campus-charcoal/80">
              {match.breakdown.reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* DECISION ACTION BAR (Stage 2) */}
        <div className="bg-campus-ivory rounded-3xl p-6 border border-campus-sage/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-campus-forest">Is this your belonging?</h4>
            <p className="text-xs text-campus-charcoal/70 mt-0.5">
              Claiming initiates the verification process where the finder will ask a distinguishing question.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleDismissMatch}
              disabled={processing}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4 text-gray-500" />
              <span>Not My Item</span>
            </button>
            <button
              onClick={handleAcceptMatch}
              disabled={processing}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-campus-amber hover:bg-[#b88636] text-campus-charcoal font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>This Might Be Mine (Initiate Claim)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
