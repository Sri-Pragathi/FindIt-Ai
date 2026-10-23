import React, { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Camera,
  MapPin,
  Clock,
  ShieldCheck,
  Building,
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

export const ReportFoundView: React.FC = () => {
  const { currentUser, navigate, showToast } = useApp();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [description, setDescription] = useState('');
  const [dateFound, setDateFound] = useState(new Date().toISOString().split('T')[0]);
  const [timeFound, setTimeFound] = useState('15:00');
  const [location, setLocation] = useState(COMMON_CAMPUS_LOCATIONS[0]);
  const [locationDetail, setLocationDetail] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [distinguishingFeatures, setDistinguishingFeatures] = useState('');
  const [custodyStatus, setCustodyStatus] = useState<
    'with_finder' | 'handed_to_security' | 'library_desk' | 'ready_for_coordination'
  >('with_finder');
  const [contactPreference, setContactPreference] = useState(
    'Verify through FindItAi verification questions, then meet at Campus Safe Spot.'
  );
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        showToast('Photo attached successfully', 'success');
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
        showToast('Please provide item title, category, and description.', 'error');
        return;
      }
    }
    if (step === 2) {
      if (!location.trim() || !dateFound) {
        showToast('Please specify the date and location found.', 'error');
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
      showToast('Please sign in to report a found item.', 'error');
      navigate('login');
      return;
    }

    setSubmitting(true);
    try {
      const report = await api.createFoundReport({
        title,
        category,
        description,
        dateFound,
        timeFound,
        location,
        locationDetail,
        brand,
        color,
        distinguishingFeatures,
        photoUrl: photoUrl.trim() || undefined,
        custodyStatus,
        contactPreference,
        reportedBy: currentUser.id,
        reporterName: currentUser.name,
        reporterEmail: currentUser.email,
        reporterRole: currentUser.role,
      });

      setSubmittedReportId(report.id);
      showToast('Found item reported! Thank you for helping our campus community.', 'success');
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
            Found Item Logged!
          </h2>

          <div className="p-3 rounded-2xl bg-campus-ivory border border-campus-sage/30 text-xs text-campus-charcoal/80 space-y-1">
            <p className="font-semibold text-campus-forest">Reference Number: #{submittedReportId}</p>
            <p>Title: <strong>{title}</strong></p>
            <p>Custody: <span className="capitalize">{custodyStatus.replace(/_/g, ' ')}</span></p>
          </div>

          <p className="text-xs text-campus-charcoal/70 leading-relaxed">
            Thank you for being an honest member of our campus community. FindItAi is now notifying any students or faculty who reported matching lost items. You will receive an alert when a claim is initiated.
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate('dashboard')}
              className="w-full py-3 rounded-xl bg-campus-forest hover:bg-campus-forest-light text-campus-ivory font-bold text-xs uppercase tracking-wider transition shadow-md"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('browse')}
              className="w-full py-3 rounded-xl bg-campus-ivory hover:bg-gray-200 text-campus-forest font-bold text-xs uppercase tracking-wider transition border border-campus-sage/40"
            >
              Browse Campus Belongings
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
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Found Item Intake
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-campus-forest font-heading">
            Report a Found Item
          </h1>
          <p className="text-xs sm:text-sm text-campus-charcoal/70 max-w-xl mx-auto">
            Help reconnect a student or faculty member with their misplaced belongings through verified campus return.
          </p>
        </div>

        {/* Multi-Step Tracker */}
        <div className="bg-white rounded-2xl p-4 border border-campus-sage/20 shadow-xs flex items-center justify-between text-xs">
          {[
            { num: 1, label: 'Item Details' },
            { num: 2, label: 'Location & Custody' },
            { num: 3, label: 'Photos & Marks' },
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
                Step 1: Found Item Information
              </h2>

              <div>
                <label className="block font-semibold text-campus-forest mb-1">
                  Item Title or Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Space Gray MacBook Pro, Set of Dorm Keys with Lanyard, Hydro Flask"
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
                  Description of Found Item <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe general appearance. You do NOT have to reveal all private markings publicly—save some for the verification question."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Location & Custody */}
          {step === 2 && (
            <div className="space-y-5 text-xs animate-in fade-in">
              <h2 className="text-base font-bold text-campus-forest border-b border-campus-sage/15 pb-2">
                Step 2: Where Was It Found &amp; Current Custody
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-campus-forest mb-1">
                    Date Found <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dateFound}
                    onChange={(e) => setDateFound(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-campus-forest mb-1">Approximate Time</label>
                  <input
                    type="time"
                    value={timeFound}
                    onChange={(e) => setTimeFound(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-campus-forest mb-1">
                  Campus Location Found <span className="text-red-500">*</span>
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
                  placeholder="e.g. Table near cafe, 2nd floor library study carrels, bench outside auditorium"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs"
                />
              </div>

              {/* Custody Status */}
              <div>
                <label className="block font-semibold text-campus-forest mb-2">
                  Current Custody Status <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setCustodyStatus('with_finder')}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      custodyStatus === 'with_finder'
                        ? 'bg-campus-forest text-white border-campus-forest'
                        : 'bg-campus-ivory border-campus-sage/30 hover:border-campus-amber'
                    }`}
                  >
                    <p className="font-bold">Kept Safely by Finder</p>
                    <p className={`text-[11px] mt-0.5 ${custodyStatus === 'with_finder' ? 'text-campus-sage' : 'text-campus-charcoal/60'}`}>
                      In my possession; ready to hand over at official campus spot.
                    </p>
                  </div>

                  <div
                    onClick={() => setCustodyStatus('handed_to_security')}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      custodyStatus === 'handed_to_security'
                        ? 'bg-campus-forest text-white border-campus-forest'
                        : 'bg-campus-ivory border-campus-sage/30 hover:border-campus-amber'
                    }`}
                  >
                    <p className="font-bold">Handed to Campus Security</p>
                    <p className={`text-[11px] mt-0.5 ${custodyStatus === 'handed_to_security' ? 'text-campus-sage' : 'text-campus-charcoal/60'}`}>
                      Deposited at Campus Police Vault (Room 102).
                    </p>
                  </div>

                  <div
                    onClick={() => setCustodyStatus('library_desk')}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      custodyStatus === 'library_desk'
                        ? 'bg-campus-forest text-white border-campus-forest'
                        : 'bg-campus-ivory border-campus-sage/30 hover:border-campus-amber'
                    }`}
                  >
                    <p className="font-bold">Library Circulation Desk</p>
                    <p className={`text-[11px] mt-0.5 ${custodyStatus === 'library_desk' ? 'text-campus-sage' : 'text-campus-charcoal/60'}`}>
                      Left with library staff lost-and-found bin.
                    </p>
                  </div>

                  <div
                    onClick={() => setCustodyStatus('ready_for_coordination')}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      custodyStatus === 'ready_for_coordination'
                        ? 'bg-campus-forest text-white border-campus-forest'
                        : 'bg-campus-ivory border-campus-sage/30 hover:border-campus-amber'
                    }`}
                  >
                    <p className="font-bold">Student Center Coordination</p>
                    <p className={`text-[11px] mt-0.5 ${custodyStatus === 'ready_for_coordination' ? 'text-campus-sage' : 'text-campus-charcoal/60'}`}>
                      Available to meet around campus commons.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Distinguishing Marks & Photo */}
          {step === 3 && (
            <div className="space-y-5 text-xs animate-in fade-in">
              <h2 className="text-base font-bold text-campus-forest border-b border-campus-sage/15 pb-2">
                Step 3: Visual Details &amp; Photograph
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-campus-forest mb-1">Brand / Logo</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Apple, Hydro Flask, Schlage"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-campus-forest mb-1">Color(s)</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Space Gray, Olive Green, Blue"
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
                  placeholder="e.g. Has stickers, scratched corner, attached blue lanyard"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-campus-forest mb-1">
                  Photograph of Found Item (Optional)
                </label>
                <p className="text-[11px] text-campus-charcoal/60 mb-2">
                  Upload an authentic photo if available. If no photo is provided, no picture will be displayed (no stock or generic images).
                </p>

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-3">
                  <label className="px-3.5 py-2 rounded-xl bg-campus-forest text-campus-ivory hover:bg-campus-forest-light font-semibold text-xs cursor-pointer transition shadow-xs flex items-center gap-2">
                    <Camera className="w-4 h-4 text-campus-amber" />
                    <span>Upload Photo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <span className="text-[11px] text-campus-charcoal/50">or enter direct image URL:</span>
                </div>

                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://... (direct link to genuine photo)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs mb-3"
                />

                {photoUrl && (
                  <div className="mt-3 p-3 bg-campus-ivory rounded-2xl border border-campus-sage/30 max-w-sm space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-campus-forest">Attached Photo Preview</span>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-red-600 hover:text-red-700 font-semibold cursor-pointer text-[11px]"
                      >
                        Remove Photo
                      </button>
                    </div>
                    <img src={photoUrl} alt="Found item preview" className="w-full h-40 object-cover rounded-xl border border-campus-sage/20" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Review & Post */}
          {step === 4 && (
            <div className="space-y-5 text-xs animate-in fade-in">
              <h2 className="text-base font-bold text-campus-forest border-b border-campus-sage/15 pb-2">
                Step 4: Review &amp; Safe Return Preferences
              </h2>

              <div className="bg-campus-ivory rounded-2xl p-4 border border-campus-sage/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-campus-forest text-sm">{title}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-bold text-[10px] uppercase">
                    Found • {category}
                  </span>
                </div>
                <p className="text-campus-charcoal/80 leading-relaxed">{description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-campus-sage/20">
                  <p>
                    <strong className="text-campus-forest">Found At:</strong> {location} ({locationDetail || 'General Area'})
                  </p>
                  <p>
                    <strong className="text-campus-forest">Date:</strong> {dateFound} at {timeFound}
                  </p>
                  <p>
                    <strong className="text-campus-forest">Custody:</strong>{' '}
                    <span className="capitalize">{custodyStatus.replace(/_/g, ' ')}</span>
                  </p>
                  {brand && (
                    <p>
                      <strong className="text-campus-forest">Brand:</strong> {brand}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-campus-forest mb-1">
                  Handover &amp; Contact Preference
                </label>
                <input
                  type="text"
                  value={contactPreference}
                  onChange={(e) => setContactPreference(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-campus-sage/40 text-campus-charcoal bg-campus-ivory/20 focus:bg-white focus:outline-none focus:border-campus-forest text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>
                  When someone initiates a claim for this item, you will be prompted to ask them a custom verification question to confirm their ownership before scheduling the exchange.
                </p>
              </div>
            </div>
          )}

          {/* Stepper Navigation */}
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
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Publishing...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Found Report</span>
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
