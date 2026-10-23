import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Calendar,
  Send,
  Check,
  X,
  UserCheck,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ClaimRequest, ClaimStage, CampusLocation } from '../../types';

const STAGES: { stage: ClaimStage; label: string; desc: string }[] = [
  { stage: '1_MATCH_DISCOVERED', label: 'Match Found', desc: 'AI correlation identified' },
  { stage: '2_CLAIM_INITIATED', label: 'Claim Opened', desc: 'Owner confirmed interest' },
  { stage: '3_AWAITING_FINDER_QUESTION', label: 'Finder Question', desc: 'Finder poses ownership question' },
  { stage: '4_AWAITING_OWNER_ANSWER', label: 'Owner Response', desc: 'Owner submits private answer' },
  { stage: '5_ANSWER_UNDER_REVIEW', label: 'Review Answer', desc: 'Finder validates response' },
  { stage: '6_HANDOVER_COORDINATION', label: 'Handover Setup', desc: 'Schedule safe campus spot' },
  { stage: '7_HANDOVER_CONFIRMED', label: 'Confirmed Meetup', desc: 'Awaiting physical exchange' },
  { stage: '8_RETURNED_AND_CLOSED', label: 'Returned & Closed', desc: 'Belonging restored to owner' },
];

export const ClaimDetailView: React.FC = () => {
  const { selectedClaimId, currentUser, navigate, showToast } = useApp();
  const [claim, setClaim] = useState<ClaimRequest | null>(null);
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Inputs
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [clarificationReason, setClarificationReason] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Main Campus Library Information & Circulation Desk');
  const [customLocation, setCustomLocation] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingTime, setMeetingTime] = useState('16:00');
  const [handoverInstructions, setHandoverInstructions] = useState('Meet by the desk under the security camera.');
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const fetchClaimData = async () => {
    if (!selectedClaimId) return;
    try {
      const c = await api.getClaim(selectedClaimId);
      setClaim(c);
      const locs = await api.getLocations();
      setLocations(locs);
    } catch (err: any) {
      showToast(`Error loading claim: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimData();
  }, [selectedClaimId]);

  if (loading || !claim) {
    return (
      <div className="min-h-screen bg-campus-ivory py-16 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-campus-forest border-t-transparent animate-spin" />
      </div>
    );
  }

  const isClaimant = currentUser && currentUser.id === claim.claimantId;
  const isFinder = currentUser && currentUser.id === claim.finderId;
  const isParticipant = isClaimant || isFinder;

  // Compute stage index
  const currentStageIndex = STAGES.findIndex((s) => s.stage === claim.stage);

  // --- Handlers for Stage Transitions ---

  // Stage 3 -> 4: Finder submits verification question
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      const updated = await api.submitVerificationQuestion(claim.id, currentUser.id, questionInput);
      setClaim(updated);
      setQuestionInput('');
      showToast('Verification question submitted! The claimant has been notified.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Stage 4 -> 5: Claimant submits answer
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      const updated = await api.submitVerificationAnswer(
        claim.id,
        currentUser.id,
        answerInput,
        evidenceNotes
      );
      setClaim(updated);
      setAnswerInput('');
      setEvidenceNotes('');
      showToast('Answer submitted! The finder is now reviewing your verification response.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Stage 5 -> 6: Finder reviews answer
  const handleReviewAnswer = async (decision: 'accept' | 'clarify' | 'reject') => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const updated = await api.reviewVerificationAnswer(
        claim.id,
        currentUser.id,
        decision,
        decision === 'clarify' ? clarificationReason : undefined
      );
      setClaim(updated);
      if (decision === 'accept') {
        showToast('Verification accepted! Ownership confirmed. Propose a handover location now.', 'success');
      } else if (decision === 'clarify') {
        showToast('Clarification requested from claimant.', 'info');
      } else {
        showToast('Answer rejected. Claim marked for moderator review.', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Stage 6: Propose Handover
  const handleProposeHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const updated = await api.proposeHandover(claim.id, currentUser.id, {
        location: selectedLocation,
        customLocation: selectedLocation === 'Custom Location' ? customLocation : undefined,
        meetingDate,
        meetingTime,
        instructions: handoverInstructions,
      });
      setClaim(updated);
      showToast('Handover meeting proposed! Awaiting confirmation from other participant.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Stage 6 -> 7: Confirm Handover
  const handleConfirmHandover = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const updated = await api.confirmHandoverProposal(claim.id, currentUser.id);
      setClaim(updated);
      showToast('Handover arrangement confirmed! Meeting details locked in.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Stage 7 -> 8: Confirm Receipt or Handover
  const handleConfirmReceiptOrHandover = async (actionType: 'owner_received' | 'finder_handed_over') => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const updated = await api.confirmReceiptOrHandover(claim.id, currentUser.id, actionType);
      setClaim(updated);
      if (actionType === 'owner_received') {
        showToast('Item received! Query successfully resolved and closed.', 'success');
      } else {
        showToast('Finder handover marked completed. Awaiting owner receipt confirmation.', 'success');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Escalate Dispute
  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !disputeReason.trim()) return;
    setSubmitting(true);
    try {
      const updated = await api.disputeClaim(claim.id, currentUser.id, disputeReason);
      setClaim(updated);
      setShowDisputeModal(false);
      showToast('Dispute escalated to Campus Security & Dean of Student Affairs.', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const latestAnswer = claim.answers[claim.answers.length - 1];

  return (
    <div className="min-h-screen bg-campus-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-campus-forest hover:text-campus-amber transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-campus-charcoal/60">Claim Reference: #{claim.id}</span>
            <button
              onClick={() => setShowDisputeModal(true)}
              className="text-xs text-red-600 hover:text-red-700 font-semibold px-2.5 py-1 rounded-lg border border-red-200 hover:bg-red-50"
            >
              Escalate Dispute
            </button>
          </div>
        </div>

        {/* Header Summary */}
        <div className="bg-campus-forest text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-campus-forest-light flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-campus-amber text-campus-charcoal font-bold text-[10px] uppercase tracking-wider">
                Claim In Progress
              </span>
              <span className="text-xs text-campus-sage">
                Initiated {new Date(claim.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white font-heading mt-1">
              Belonging Verification &amp; Safe Handover
            </h1>
            <p className="text-xs text-campus-sage">
              Lost Owner: <strong>{claim.claimantName}</strong> &bull; Finder: <strong>{claim.finderName}</strong>
            </p>
          </div>

          <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-right self-start md:self-center">
            <span className="text-[11px] text-campus-sage uppercase font-bold block">
              Active Stage
            </span>
            <span className="text-sm font-bold text-campus-amber">
              {STAGES[currentStageIndex]?.label || claim.stage}
            </span>
          </div>
        </div>

        {/* 8-STAGE VISUAL PROGRESS TRACKER */}
        <div className="bg-white rounded-3xl p-6 border border-campus-sage/20 shadow-sm overflow-x-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-campus-forest mb-4">
            Return Progression Timeline (8-Stage Verification Protocol)
          </h2>
          <div className="flex items-center justify-between min-w-[700px] relative">
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 z-0" />
            {STAGES.map((s, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={s.stage} className="relative z-10 flex flex-col items-center text-center max-w-[80px]">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPast
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-campus-forest text-campus-amber ring-4 ring-campus-amber/30 shadow-md scale-110'
                        : 'bg-campus-ivory text-gray-400 border border-gray-300'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`mt-2 text-[10px] leading-tight font-semibold ${
                      isCurrent
                        ? 'text-campus-forest font-bold'
                        : isPast
                        ? 'text-emerald-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DYNAMIC ACTION STAGE CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-campus-sage/20 shadow-md">
          {/* STAGE 8: Returned & Closed */}
          {claim.stage === '8_RETURNED_AND_CLOSED' && (
            <div className="text-center py-8 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-extrabold text-campus-forest font-heading">
                Item Successfully Returned!
              </h2>
              <p className="text-xs text-campus-charcoal/70 max-w-md mx-auto leading-relaxed">
                Thank you for helping reconnect our campus community. Both participants confirmed the physical handover, and the query is permanently closed.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('dashboard')}
                  className="px-6 py-2.5 rounded-xl bg-campus-forest text-campus-ivory font-bold text-xs uppercase"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* STAGE 7: Handover Confirmed — Waiting for Physical Exchange */}
          {claim.stage === '7_HANDOVER_CONFIRMED' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  7
                </div>
                <div>
                  <h3 className="font-bold text-base text-campus-forest">
                    Meeting Confirmed — Physical Handover
                  </h3>
                  <p className="text-xs text-campus-charcoal/70">
                    Both parties agreed to meet at the scheduled campus safe spot.
                  </p>
                </div>
              </div>

              {/* Scheduled Card */}
              <div className="p-4 rounded-2xl bg-campus-ivory border border-campus-sage/30 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="font-bold text-campus-forest block text-[11px]">Location</span>
                  <span>{claim.handoverProposal?.location}</span>
                </div>
                <div>
                  <span className="font-bold text-campus-forest block text-[11px]">Date &amp; Time</span>
                  <span>
                    {claim.handoverProposal?.meetingDate} at {claim.handoverProposal?.meetingTime}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-campus-forest block text-[11px]">Instructions</span>
                  <span>{claim.handoverProposal?.instructions || 'Standard safe spot meet'}</span>
                </div>
              </div>

              {/* Physical Handover Confirmations */}
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-xs">
                <h4 className="font-bold text-amber-900">Confirm Physical Exchange After Meeting:</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  {isClaimant && (
                    <button
                      onClick={() => handleConfirmReceiptOrHandover('owner_received')}
                      disabled={submitting || claim.physicalConfirmation.ownerReceived}
                      className="px-6 py-3 rounded-xl bg-campus-forest hover:bg-campus-forest-light text-campus-ivory font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-campus-amber" />
                      <span>{claim.physicalConfirmation.ownerReceived ? 'Receipt Confirmed' : 'I Received My Item'}</span>
                    </button>
                  )}

                  {isFinder && (
                    <button
                      onClick={() => handleConfirmReceiptOrHandover('finder_handed_over')}
                      disabled={submitting || claim.physicalConfirmation.finderHandedOver}
                      className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{claim.physicalConfirmation.finderHandedOver ? 'Handover Recorded' : 'Handover Completed'}</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-amber-800">
                  Once the lost item owner confirms receipt, the report will be resolved and archived.
                </p>
              </div>
            </div>
          )}

          {/* STAGE 6: Handover Coordination */}
          {claim.stage === '6_HANDOVER_COORDINATION' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-campus-amber text-campus-charcoal flex items-center justify-center font-bold">
                  6
                </div>
                <div>
                  <h3 className="font-bold text-base text-campus-forest">
                    Verification Succeeded! Coordinate Safe Campus Handover
                  </h3>
                  <p className="text-xs text-campus-charcoal/70">
                    Propose or confirm a verified safe spot across campus to return the item.
                  </p>
                </div>
              </div>

              {claim.handoverProposal?.status === 'proposed' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
                    <p className="font-bold">Handover Proposal Received:</p>
                    <p>
                      <strong>Location:</strong> {claim.handoverProposal.location}
                    </p>
                    <p>
                      <strong>Proposed Date &amp; Time:</strong> {claim.handoverProposal.meetingDate} at{' '}
                      {claim.handoverProposal.meetingTime}
                    </p>
                    {claim.handoverProposal.instructions && (
                      <p>
                        <strong>Instructions:</strong> {claim.handoverProposal.instructions}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleConfirmHandover}
                      disabled={submitting}
                      className="px-6 py-3 rounded-xl bg-campus-forest hover:bg-campus-forest-light text-campus-ivory font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
                    >
                      Confirm Handover Time &amp; Location
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProposeHandover} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-campus-forest mb-1">
                      Designated Safe Campus Location
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white text-xs"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name} ({loc.hours})
                        </option>
                      ))}
                      <option value="Custom Location">Other Campus Public Spot</option>
                    </select>
                  </div>

                  {selectedLocation === 'Custom Location' && (
                    <div>
                      <label className="block font-semibold text-campus-forest mb-1">
                        Specific Public Spot
                      </label>
                      <input
                        type="text"
                        required
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        placeholder="e.g. Campbell Commons 1st floor cafe tables"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal text-xs"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-campus-forest mb-1">Proposed Date</label>
                      <input
                        type="date"
                        required
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-campus-forest mb-1">Proposed Time</label>
                      <input
                        type="time"
                        required
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-campus-forest mb-1">
                      Instructions or Notes
                    </label>
                    <input
                      type="text"
                      value={handoverInstructions}
                      onChange={(e) => setHandoverInstructions(e.target.value)}
                      placeholder="e.g. Meet by reception desk, I will have a gray backpack"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-campus-amber hover:bg-[#b88636] text-campus-charcoal font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
                  >
                    Submit Handover Proposal
                  </button>
                </form>
              )}
            </div>
          )}

          {/* STAGE 5: Answer Under Review */}
          {claim.stage === '5_ANSWER_UNDER_REVIEW' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-campus-forest text-campus-amber flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h3 className="font-bold text-base text-campus-forest">
                    Verification Answer Under Review
                  </h3>
                  <p className="text-xs text-campus-charcoal/70">
                    Question: "{claim.verificationQuestion?.question}"
                  </p>
                </div>
              </div>

              {latestAnswer && (
                <div className="p-4 rounded-2xl bg-campus-ivory border border-campus-sage/30 space-y-2 text-xs">
                  <p className="font-bold text-campus-forest">
                    Submitted Answer from {claim.claimantName}:
                  </p>
                  <p className="text-campus-charcoal/90 text-sm italic font-medium">
                    "{latestAnswer.answer}"
                  </p>
                  {latestAnswer.evidenceNotes && (
                    <p className="text-[11px] text-campus-charcoal/70">
                      <strong>Additional details:</strong> {latestAnswer.evidenceNotes}
                    </p>
                  )}
                </div>
              )}

              {isFinder ? (
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-semibold text-campus-forest">
                    Does this answer match the private details of the found item?
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleReviewAnswer('accept')}
                      disabled={submitting}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Answer (Verified Owner)</span>
                    </button>
                    <button
                      onClick={() => handleReviewAnswer('clarify')}
                      disabled={submitting}
                      className="px-4 py-2.5 rounded-xl bg-campus-ivory hover:bg-gray-200 text-campus-charcoal font-bold text-xs border border-campus-sage/40 transition cursor-pointer"
                    >
                      Request Clarification
                    </button>
                    <button
                      onClick={() => handleReviewAnswer('reject')}
                      disabled={submitting}
                      className="px-4 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs border border-red-200 transition cursor-pointer"
                    >
                      Reject Answer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    Your answer has been delivered. The finder is reviewing your response against the item.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STAGE 4: Awaiting Owner Answer */}
          {claim.stage === '4_AWAITING_OWNER_ANSWER' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-campus-amber text-campus-charcoal flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-base text-campus-forest">
                    Verification Question from Finder
                  </h3>
                  <p className="text-xs text-campus-charcoal/70">
                    The finder needs distinguishing details before handing over the belonging.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  Question Asked by {claim.finderName}:
                </span>
                <p className="text-sm font-semibold text-amber-950">
                  "{claim.verificationQuestion?.question}"
                </p>
              </div>

              {isClaimant ? (
                <form onSubmit={handleSubmitAnswer} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-campus-forest mb-1">
                      Your Answer <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      placeholder="Provide the exact details requested (e.g. sticker descriptions, engraved marks)..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-campus-forest mb-1">
                      Supporting Evidence Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={evidenceNotes}
                      onChange={(e) => setEvidenceNotes(e.target.value)}
                      placeholder="e.g. 'Can show proof of purchase serial number on student portal'"
                      className="w-full px-3.5 py-2 rounded-xl border border-campus-sage/40 text-campus-charcoal text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-campus-forest hover:bg-campus-forest-light text-campus-ivory font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-campus-amber" />
                    <span>Submit Answer to Finder</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    Waiting for {claim.claimantName} to answer your verification question.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STAGE 3: Awaiting Finder Question */}
          {(claim.stage === '3_AWAITING_FINDER_QUESTION' || claim.stage === '2_CLAIM_INITIATED') && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-campus-forest text-campus-amber flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-base text-campus-forest">
                    Verification Question Required
                  </h3>
                  <p className="text-xs text-campus-charcoal/70">
                    The finder must ask a secret question to ensure the claimant is the true owner.
                  </p>
                </div>
              </div>

              {isFinder ? (
                <form onSubmit={handleSubmitQuestion} className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-campus-ivory border border-campus-sage/30 space-y-2">
                    <p className="font-bold text-campus-forest">
                      Ask a distinguishing detail about the item:
                    </p>
                    <p className="text-[11px] text-campus-charcoal/70">
                      Examples: "What sticker is on the corner?", "What initials are engraved?", "What is attached to the keychain?"
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-campus-forest mb-1">
                      Your Custom Verification Question <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={questionInput}
                      onChange={(e) => setQuestionInput(e.target.value)}
                      placeholder="e.g. Can you describe the sticker or mark on the corner of the device?"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-campus-forest hover:bg-campus-forest-light text-campus-ivory font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-campus-amber" />
                    <span>Send Question to Claimant</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <p className="font-bold">Claim Opened!</p>
                  <p>
                    The finder ({claim.finderName}) has been notified. They are formulating a private verification question to confirm ownership. Check back shortly.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AUDIT LOG TIMELINE */}
        <div className="bg-white rounded-3xl p-6 border border-campus-sage/20 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-campus-forest font-heading">
            Audit Log &amp; State Machine History
          </h3>
          <div className="space-y-3">
            {claim.timeline.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-campus-ivory/40 border border-campus-sage/20 text-xs"
              >
                <div className="w-2 h-2 rounded-full bg-campus-amber mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-campus-forest">{event.action}</span>
                    <span className="text-[10px] text-campus-charcoal/50">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-campus-charcoal/70 mt-0.5">
                    Actor: <strong>{event.actorName}</strong> &bull; {event.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispute Escalation Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-campus-sage/30 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-base text-red-600">Escalate Claim Dispute</h3>
                <button onClick={() => setShowDisputeModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-campus-charcoal/70">
                Disputing a claim summons an official Campus Security moderator or Dean of Student Affairs to arbitrate and inspect physical evidence.
              </p>

              <form onSubmit={handleDispute} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-campus-forest mb-1">Reason for Dispute</label>
                  <textarea
                    rows={3}
                    required
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Describe why verification failed or why ownership is disputed..."
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDisputeModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs uppercase"
                  >
                    Submit Dispute
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
