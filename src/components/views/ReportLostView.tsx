import React, { useState } from 'react';
import {
  PlusCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Camera,
  MapPin,
  Clock,
  ShieldCheck,
  Lock,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ItemCategory } from '../../types';

const CATEGORIES: ItemCategory[] = [
  'Electronics',
  'Books and stationery',
  'ID cards and documents',
  'Bags and wallets',
  'Keys',
  'Clothing and accessories',
  'Jewelry',
  'Water bottles and lunch boxes',
  'Sports equipment',
  'Other',
];

const COMMON_CAMPUS_LOCATIONS = [
  'Main Campus Library',
  'Campbell Student Commons',
  'Turing Hall of Computing',
  'Recreation & Athletics Center',
  'Science & Technology Complex',
  'East Dining Commons',
  'Humanities Quad Bench Area',
  'Campus Shuttle Bus Stop',
  'Other Campus Location',
];

export const ReportLostView: React.FC = () => {
  const { currentUser, navigate, showToast } = useApp();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [description, setDescription] = useState('');
  const [dateLost, setDateLost] = useState(new Date().toISOString().split('T')[0]);
  const [timeLost, setTimeLost] = useState('14:00');
  const [location, setLocation] = useState(COMMON_CAMPUS_LOCATIONS[0]);
  const [locationDetail, setLocationDetail] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [distinguishingFeatures, setDistinguishingFeatures] = useState('');
  const [secretClues, setSecretClues] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Image file size must be under 8MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!title.trim() || !category || !description.trim()) {
        showToast('Please provide an item title, category, and description.', 'error');
        return;
      }
    }
    if (step === 2) {
      if (!location.trim() || !dateLost) {
        showToast('Please specify the date and campus location.', 'error');
        return;
      }
    }
    setStep((s) => (s + 1) as any);
  };

  const handleBack = () => {
    setStep((s) => (s - 1) as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please sign in to submit a report.', 'error');
      navigate('login');
      return;
    }

    setSubmitting(true);
    try {
      const report = await api.createLostReport({
        title,
        category,
        description,
        dateLost,
        timeLost,
        location,
        locationDetail,
        brand,
        color,
        distinguishingFeatures,
        secretClues,
        photoUrl: photoUrl.trim() || undefined,
        reportedBy: currentUser.id,
        reporterName: currentUser.name,
        reporterEmail: currentUser.email,
        reporterRole: currentUser.role,
      });

      setSubmittedReportId(report.id);
      showToast('Lost item report filed! AI matching is scanning campus records.', 'success');
    } catch (err: any) {
      showToast(`Submission failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedReportId) {
    return (
      <div className="min-h-screen bg-campus-ivory py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-campus-sage/20 text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>

          <h2 className="text-2xl font-extrabold text-campus-forest font-heading">
            Report Registered!
          </h2>

          <div className="p-3 rounded-2xl bg-campus-ivory border border-campus-sage/30 text-xs text-campus-charcoal/80 space-y-1">
            <p className="font-semibold text-campus-forest">Unique Report ID: #{submittedReportId}</p>
            <p>Title: <strong>{title}</strong></p>
            <p>Location: {location}</p>
          </div>

          <p className="text-xs text-campus-charcoal/70 leading-relaxed">
            Your report is published to the campus database. FindItAi's multi-factor matching engine is comparing it against newly discovered items. You will receive an in-app notification when a candidate match is found.
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate('dashboard')}
              className="w-full py-3 rounded-xl bg-campus-forest hover:bg-campus-forest-light text-campus-ivory font-bold text-xs uppercase tracking-wider transition shadow-md"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('browse')}
              className="w-full py-3 rounded-xl bg-campus-ivory hover:bg-gray-200 text-campus-forest font-bold text-xs uppercase tracking-wider transition border border-campus-sage/40"
            >
              Browse Other Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-campus-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Lost Belonging Intake
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-campus-forest font-heading">
            Report a Lost Item
          </h1>
          <p className="text-xs sm:text-sm text-campus-charcoal/70 max-w-xl mx-auto">
            Provide as much detail as you remember. Include a confidential clue that will stay private for verifying ownership later.
          </p>
        </div>

        {/* Multi-Step Progress Tracker */}
        <div className="bg-white rounded-2xl p-4 border border-campus-sage/20 shadow-xs flex items-center justify-between text-xs">
          {[
            { num: 1, label: 'Item Basics' },
            { num: 2, label: 'Location & Clues' },
            { num: 3, label: 'Photo & Secret' },
            { num: 4, label: 'Review & Post' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                  step === s.num
                    ? 'bg-campus-forest text-campus-amber shadow-xs'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-campus-ivory text-campus-charcoal/50 border border-campus-sage/30'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`hidden sm:inline font-semibold ${
                  step === s.num ? 'text-campus-forest' : 'text-campus-charcoal/50'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-campus-sage/20 shadow-md">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5 text-xs animate-in fade-in">
              <h2 className="text-base font-bold text-campus-forest border-b border-campus-sage/15 pb-2">
                Step 1: Item Category &amp; Description
              </h2>

              <div>
                <label className="block font-semibold text-campus-forest mb-1">
                  Item Title or Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MacBook Pro 14-inch Space Gray, Leather Wallet, TI-84 Plus Calculator"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-campus-forest mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full px-3 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-campus-forest mb-1">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe appearance, stickers, condition, material, what was inside, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Location, Date, Brand & Color */}
          {step === 2 && (
            <div className="space-y-5 text-xs animate-in fade-in">
              <h2 className="text-base font-bold text-campus-forest border-b border-campus-sage/15 pb-2">
                Step 2: When &amp; Where Was It Lost?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-campus-forest mb-1">
                    Date Lost <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dateLost}
                    onChange={(e) => setDateLost(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-campus-forest mb-1">Approximate Time</label>
                  <input
                    type="time"
                    value={timeLost}
                    onChange={(e) => setTimeLost(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-campus-forest mb-1">
                  Campus Location / Building <span className="text-red-500">*</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs mb-2"
                >
                  {COMMON_CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  placeholder="Specific room, floor, or zone (e.g. '2nd Floor Quiet Cubicles, window row C')"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-campus-forest mb-1">Brand or Manufacturer</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Apple, Sony, Nike, North Face"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-campus-forest mb-1">Primary Color(s)</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Space Gray, Navy Blue, Forest Green"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-campus-forest mb-1">
                  Public Distinguishing Marks
                </label>
                <input
                  type="text"
                  value={distinguishingFeatures}
                  onChange={(e) => setDistinguishingFeatures(e.target.value)}
                  placeholder="Visible scratches, case style, prominent sticker visible to anyone"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Photo Preview & Private Verification Clue */}
          {step === 3 && (
            <div className="space-y-5 text-xs animate-in fade-in">
              <h2 className="text-base font-bold text-campus-forest border-b border-campus-sage/15 pb-2">
                Step 3: Item Photograph &amp; Private Verification Clue
              </h2>

              {/* Private Verification Clue Box */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Confidential Ownership Clue (Kept Safe &amp; Hidden from Public View)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Enter a secret detail only the genuine owner would know (e.g. engraved initials, lockscreen background wallpaper, secret zipper pocket contents). This is never shown on the public browse page.
                </p>
                <textarea
                  rows={2}
                  value={secretClues}
                  onChange={(e) => setSecretClues(e.target.value)}
                  placeholder="e.g. 'Engraved initials A.R. under trackpad area, unique holographic crab sticker near left hinge'"
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-campus-charcoal bg-white focus:outline-none focus:border-campus-forest text-xs"
                />
              </div>

              {/* Genuine Photo Upload */}
              <div>
                <label className="block font-semibold text-campus-forest mb-1">
                  Photograph of Item (Optional)
                </label>
                <p className="text-[11px] text-campus-charcoal/70 mb-2">
                  Upload an authentic photo of your belonging if available. If you do not have one, leave this empty—no artificial or incorrect photo will ever be assigned.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="px-4 py-2.5 rounded-xl bg-campus-forest hover:bg-campus-forest-light text-campus-ivory font-semibold text-xs cursor-pointer inline-flex items-center gap-2 transition shadow-xs">
                    <Camera className="w-4 h-4 text-campus-amber" />
                    <span>Choose Photo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-semibold text-xs transition border border-red-200"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {photoUrl ? (
                  <div className="mt-4 p-2 bg-campus-ivory rounded-2xl border border-campus-sage/30 max-w-xs">
                    <p className="text-[10px] text-campus-charcoal/60 mb-1 font-semibold">Uploaded Photo Preview:</p>
                    <img
                      src={photoUrl}
                      alt="Uploaded item preview"
                      className="w-full h-36 object-cover rounded-xl"
                    />
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-500 italic mt-2">
                    No photograph selected. Report will be saved without an image.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-5 text-xs animate-in fade-in">
              <h2 className="text-base font-bold text-campus-forest border-b border-campus-sage/15 pb-2">
                Step 4: Review Lost Item Report Before Publishing
              </h2>

              <div className="bg-campus-ivory rounded-2xl p-4 border border-campus-sage/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-campus-forest text-sm">{title}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] uppercase">
                    Lost • {category}
                  </span>
                </div>
                <p className="text-campus-charcoal/80 leading-relaxed">{description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-campus-sage/20">
                  <p>
                    <strong className="text-campus-forest">Location:</strong> {location} ({locationDetail || 'General Area'})
                  </p>
                  <p>
                    <strong className="text-campus-forest">Date Lost:</strong> {dateLost} at {timeLost}
                  </p>
                  {brand && (
                    <p>
                      <strong className="text-campus-forest">Brand:</strong> {brand}
                    </p>
                  )}
                  {color && (
                    <p>
                      <strong className="text-campus-forest">Color:</strong> {color}
                    </p>
                  )}
                </div>

                {secretClues && (
                  <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-[11px]">
                    <span className="font-bold text-amber-900">Protected Secret Verification Clue:</span>
                    <p className="text-amber-800 italic mt-0.5">{secretClues}</p>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>
                  Upon submission, FindItAi will immediately run AI multi-factor matching against campus found items. You will receive an instant match notification if a high-confidence match is detected.
                </p>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-campus-sage/20 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-campus-sage/40 text-campus-forest hover:bg-campus-ivory font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-campus-forest hover:bg-campus-forest-light text-campus-ivory font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 text-campus-amber" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-campus-amber hover:bg-[#b88636] text-campus-charcoal font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Publishing...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Report &amp; Run AI Matching</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
