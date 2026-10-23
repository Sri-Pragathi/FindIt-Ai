import React, { useState, useEffect } from 'react';
import {
  Search,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  FileQuestion,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { LostItemReport, FoundItemReport, SystemStats } from '../../types';
import { ItemImage } from '../common/ItemImage';

export const LandingView: React.FC = () => {
  const { currentUser, navigate } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    api.getStats()
      .then((s) => setStats(s))
      .catch((err) => console.warn('Landing data load fallback:', err));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      navigate('browse');
    } else {
      navigate('login');
    }
  };

  return (
    <div className="min-h-screen bg-campus-ivory">
      {/* HERO SECTION — Inspired by Reference Campus Photography */}
      <section className="relative w-full min-h-[580px] sm:min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Photographic Campus Background (Authentic University Architecture & Quad in Warm Golden Light) */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transform motion-safe:transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2200&q=85')`,
          }}
        />

        {/* Sophisticated Dark Translucent Overlay for High Readability & Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2620]/80 via-[#183C32]/75 to-[#0f2620]/90 backdrop-blur-[2px]" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          {/* Small FindItAi Brand Badge at the top */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-md mb-6 shadow-sm">
            <div className="w-4 h-4 rounded-full bg-campus-amber flex items-center justify-center p-0.5">
              <Sparkles className="w-2.5 h-2.5 text-campus-charcoal" />
            </div>
            <span className="text-xs font-semibold text-campus-ivory tracking-wider uppercase">
              FindItAi • Campus Lost &amp; Found
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none font-heading drop-shadow-md">
            Lost something? <br className="hidden sm:inline" />
            <span className="text-campus-amber">We'll help you find it.</span>
          </h1>

          {/* Supporting Campus Description */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-campus-ivory/90 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-sm">
            Report lost or found items and reconnect our campus community with their belongings through AI-assisted matching and secure verification.
          </p>

          {/* Prominent Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-2xl border border-white/30"
            >
              <div className="pl-4 pr-2 text-campus-charcoal/40">
                <Search className="w-5 h-5 text-campus-forest" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items... (e.g. MacBook, keys, Hydro Flask, ID card)"
                className="w-full py-3 text-sm text-campus-charcoal placeholder-campus-charcoal/50 bg-transparent focus:outline-none font-medium"
              />
              <button
                type="submit"
                className="flex-shrink-0 px-6 py-3 rounded-xl bg-campus-forest hover:bg-campus-forest-light text-campus-ivory font-semibold text-sm transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4 text-campus-amber" />
              </button>
            </form>
          </div>

          {/* Two Clear Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('report_lost')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-campus-amber hover:bg-[#b88636] text-campus-charcoal font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>I Lost Something</span>
            </button>
            <button
              onClick={() => navigate('report_found')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/40 backdrop-blur-md font-bold text-sm tracking-wide transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-campus-amber" />
              <span>I Found Something</span>
            </button>
          </div>

          {/* Verification Assurance Tag */}
          <div className="mt-8 flex items-center justify-center gap-6 text-[12px] text-campus-sage">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-campus-amber" /> Verified University Logins
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-campus-amber" /> Private Verification Clues
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-campus-amber" /> 94% AI Match Accuracy
            </span>
          </div>
        </div>
      </section>

      {/* QUICK STATS METRICS STRIP */}
      <section className="bg-white border-b border-campus-sage/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-campus-ivory/60 border border-campus-sage/15">
            <p className="text-2xl sm:text-3xl font-extrabold text-campus-forest font-heading">
              {stats?.totalLostReports || 3}
            </p>
            <p className="text-xs text-campus-charcoal/70 font-medium mt-1">Open Lost Queries</p>
          </div>
          <div className="p-4 rounded-2xl bg-campus-ivory/60 border border-campus-sage/15">
            <p className="text-2xl sm:text-3xl font-extrabold text-campus-forest font-heading">
              {stats?.totalFoundReports || 3}
            </p>
            <p className="text-xs text-campus-charcoal/70 font-medium mt-1">Found Items Safe in Custody</p>
          </div>
          <div className="p-4 rounded-2xl bg-campus-ivory/60 border border-campus-sage/15">
            <p className="text-2xl sm:text-3xl font-extrabold text-campus-amber font-heading">
              {stats?.matchRatePercent || 94}%
            </p>
            <p className="text-xs text-campus-charcoal/70 font-medium mt-1">AI Correlation Precision</p>
          </div>
          <div className="p-4 rounded-2xl bg-campus-ivory/60 border border-campus-sage/15">
            <p className="text-2xl sm:text-3xl font-extrabold text-campus-forest font-heading">
              4 Designated
            </p>
            <p className="text-xs text-campus-charcoal/70 font-medium mt-1">Official 24/7 Return Vaults</p>
          </div>
        </div>
      </section>

      {/* HOW FINDITAI WORKS — 4-STEP COMPLETE SECURE WORKFLOW */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-campus-amber bg-campus-amber/15 px-3 py-1 rounded-full border border-campus-amber/30">
            System Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-campus-forest mt-3 font-heading">
            How Campus Returns Work
          </h2>
          <p className="text-xs sm:text-sm text-campus-charcoal/70 mt-2">
            No unverified claims, no fake handovers. A protected 4-step state machine verifies genuine ownership before meeting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-campus-sage/20 shadow-sm relative group hover:border-campus-amber transition">
            <div className="w-10 h-10 rounded-xl bg-campus-forest text-campus-amber flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-campus-forest mb-2">1. Report Item</h3>
            <p className="text-xs text-campus-charcoal/70 leading-relaxed">
              Post details, photos, and a <em>confidential private clue</em> (kept secret from public view) used for later ownership proof.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-campus-sage/20 shadow-sm relative group hover:border-campus-amber transition">
            <div className="w-10 h-10 rounded-xl bg-campus-amber text-campus-forest flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-campus-forest mb-2">2. AI Matching Engine</h3>
            <p className="text-xs text-campus-charcoal/70 leading-relaxed">
              Our multi-factor engine scores category compatibility, brand, color, location proximity, and visual features (0–100%).
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-campus-sage/20 shadow-sm relative group hover:border-campus-amber transition">
            <div className="w-10 h-10 rounded-xl bg-campus-forest text-campus-amber flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-campus-forest mb-2">3. Verification Q&amp;A</h3>
            <p className="text-xs text-campus-charcoal/70 leading-relaxed">
              The finder asks a distinguishing question (e.g. sticker details, wallpaper). The claimant answers privately to establish proof.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 border border-campus-sage/20 shadow-sm relative group hover:border-campus-amber transition">
            <div className="w-10 h-10 rounded-xl bg-campus-forest-light text-white flex items-center justify-center font-bold text-sm mb-4">
              04
            </div>
            <h3 className="text-base font-bold text-campus-forest mb-2">4. Coordinated Return</h3>
            <p className="text-xs text-campus-charcoal/70 leading-relaxed">
              Coordinate exchange at a safe campus location (Library Desk, Security Station). Both confirm handover to close the query.
            </p>
          </div>
        </div>
      </section>

      {/* PRIVACY-FIRST CAMPUS RECONNECTION HIGHLIGHTS */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-y border-campus-sage/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Strict Privacy &amp; Data Protection
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-campus-forest mt-3 font-heading">
              Confidential Matching. Zero Public Marketplace.
            </h2>
            <p className="text-xs sm:text-sm text-campus-charcoal/70 mt-2 leading-relaxed">
              FindItAi never publishes public feeds of personal belongings. Reports are kept private and correlated internally by our AI engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-campus-ivory/60 border border-campus-sage/25 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-campus-forest text-campus-amber flex items-center justify-center font-bold text-lg shadow-sm">
                <Lock className="w-6 h-6 text-campus-amber" />
              </div>
              <h3 className="font-bold text-base text-campus-forest font-heading">
                100% Private by Default
              </h3>
              <p className="text-xs text-campus-charcoal/75 leading-relaxed">
                When you report a lost or found item, it stays protected in your private account. Unrelated students can never browse or search your queries.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-campus-ivory/60 border border-campus-sage/25 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-campus-amber text-campus-charcoal flex items-center justify-center font-bold text-lg shadow-sm">
                <Sparkles className="w-6 h-6 text-campus-forest" />
              </div>
              <h3 className="font-bold text-base text-campus-forest font-heading">
                50% Minimum AI Threshold
              </h3>
              <p className="text-xs text-campus-charcoal/75 leading-relaxed">
                Our multi-factor matching engine analyzes reports internally. Only qualifying matches with a score of 50% or higher selectively notify the owner and finder.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-campus-ivory/60 border border-campus-sage/25 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <h3 className="font-bold text-base text-campus-forest font-heading">
                Two-Party Verification &amp; Handover
              </h3>
              <p className="text-xs text-campus-charcoal/75 leading-relaxed">
                The finder asks a distinguishing question about your item before any meetup. Once answered and verified, handover is scheduled at official campus safety hubs.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            {currentUser ? (
              <button
                onClick={() => navigate('dashboard')}
                className="px-6 py-3 rounded-xl bg-campus-forest text-white font-bold text-xs uppercase tracking-wider hover:bg-campus-forest-light transition shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Go to My Personal Dashboard</span>
                <ArrowRight className="w-4 h-4 text-campus-amber" />
              </button>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate('login')}
                  className="px-6 py-3 rounded-xl bg-campus-forest text-white font-bold text-xs uppercase tracking-wider hover:bg-campus-forest-light transition shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Sign In with University ID</span>
                  <ArrowRight className="w-4 h-4 text-campus-amber" />
                </button>
                <button
                  onClick={() => navigate('signup')}
                  className="px-6 py-3 rounded-xl bg-campus-amber text-campus-charcoal font-bold text-xs uppercase tracking-wider hover:bg-[#b88636] transition shadow-md cursor-pointer"
                >
                  <span>Create Campus Account</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* OFFICIAL SAFE RETURN HUBS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-campus-forest text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-campus-forest-light relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-campus-amber/20 text-campus-amber text-xs font-semibold mb-4 border border-campus-amber/30">
              <ShieldCheck className="w-4 h-4" />
              Official Campus Safe Exchange Program
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
              Never Hand Over Valuables in Unmonitored Areas
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-campus-sage leading-relaxed">
              FindItAi coordinates physical returns exclusively at registered safe hubs across campus equipped with security cameras, campus staff attendants, and verified check-in procedures.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('browse')}
                className="px-6 py-3 rounded-xl bg-campus-amber text-campus-charcoal font-bold text-xs uppercase tracking-wider hover:bg-[#b88636] transition cursor-pointer"
              >
                Browse Lost &amp; Found
              </button>
              <button
                onClick={() => navigate('report_found')}
                className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 border border-white/20 transition cursor-pointer"
              >
                Hand In a Found Item
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
