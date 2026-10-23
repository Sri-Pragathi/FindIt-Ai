import React from 'react';
import { ShieldCheck, MapPin, Sparkles, HeartHandshake } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { navigate, resetDemoData } = useApp();

  return (
    <footer className="bg-campus-forest-dark text-campus-sage border-t border-campus-sage/20 mt-auto">
      {/* Upper Info Strip */}
      <div className="border-b border-campus-forest-light/30 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-campus-sage/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-campus-amber/20 text-campus-amber flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Safe Handover Locations</p>
              <p className="text-[11px]">All exchanges verified at official 24/7 campus safety spots.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-campus-amber/20 text-campus-amber flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">AI-Powered Matching</p>
              <p className="text-[11px]">Multi-factor text and feature correlation for rapid recovery.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-campus-amber/20 text-campus-amber flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Campus Community First</p>
              <p className="text-[11px]">Exclusively for authenticated students, faculty &amp; campus staff.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-campus-amber/20 border border-campus-amber flex items-center justify-center p-1">
                <img src="/icon.svg" alt="FindItAi icon" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-lg text-white font-heading">
                FindIt<span className="text-campus-amber">Ai</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-campus-sage">
              "Lost something? We'll help you find it." Reconnecting our university campus community with lost belongings through AI-assisted matching and secure verification.
            </p>
            <p className="text-[11px] text-campus-sage/60">
              Designed for Siddhartha University students, faculty, and campus security staff.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Campus System</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('landing')} className="hover:text-campus-amber transition">
                  Campus Landing Page
                </button>
              </li>
              <li>
                <button onClick={() => navigate('browse')} className="hover:text-campus-amber transition">
                  Browse All Items
                </button>
              </li>
              <li>
                <button onClick={() => navigate('report_lost')} className="hover:text-campus-amber transition">
                  Report a Lost Item
                </button>
              </li>
              <li>
                <button onClick={() => navigate('report_found')} className="hover:text-campus-amber transition">
                  Report a Found Item
                </button>
              </li>
              <li>
                <button onClick={() => navigate('my_reports')} className="hover:text-campus-amber transition">
                  My Reports &amp; Claims
                </button>
              </li>
            </ul>
          </div>

          {/* Handover Spots */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Safe Return Hubs</h4>
            <ul className="space-y-2 text-xs text-campus-sage">
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-campus-amber flex-shrink-0 mt-0.5" />
                <span>Campus Safety Police Vault (24/7)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-campus-amber flex-shrink-0 mt-0.5" />
                <span>Sterling Library Circulation Desk</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-campus-amber flex-shrink-0 mt-0.5" />
                <span>Student Union Level 1 Help Desk</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-campus-amber flex-shrink-0 mt-0.5" />
                <span>Turing Hall Computing Reception</span>
              </li>
            </ul>
          </div>

          {/* Demonstration & Admin */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Evaluation &amp; Demo</h4>
            <p className="text-xs text-campus-sage mb-3">
              This system includes 13-step complete interactive state-machine demonstration with sample accounts.
            </p>
            <div className="space-y-2">
              <button
                onClick={resetDemoData}
                className="w-full text-center py-2 px-3 rounded-xl border border-campus-amber/40 text-campus-amber hover:bg-campus-amber/10 text-xs font-semibold transition"
              >
                Reset Demo Environment
              </button>
              <button
                onClick={() => navigate('admin')}
                className="w-full text-center py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-campus-ivory text-xs font-medium transition"
              >
                Campus Admin Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-campus-sage/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-campus-sage/70 gap-3">
          <p>&copy; {new Date().getFullYear()} FindItAi — All rights reserved. University Campus Lost &amp; Found PWA.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer" onClick={() => navigate('landing')}>Privacy Policy</span>
            <span className="hover:text-white cursor-pointer" onClick={() => navigate('landing')}>Safe Handover Rules</span>
            <span className="hover:text-white cursor-pointer" onClick={() => navigate('landing')}>College Verification Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
