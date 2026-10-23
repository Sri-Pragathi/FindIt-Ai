import React, { useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-xl bg-campus-amber hover:bg-[#b88636] text-campus-charcoal font-semibold shadow-sm transition-all text-xs tracking-wide cursor-pointer ${
          compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2'
        }`}
        title="Install FindItAi as a PWA on your device"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-campus-sage/40 bg-white/10 hover:bg-white/20 text-campus-ivory font-medium transition text-xs ${
            compact ? 'px-2 py-1' : 'px-3 py-1.5'
          }`}
          title="Install on iPhone / iPad"
        >
          <Share2 className="w-3.5 h-3.5 text-campus-amber" />
          <span>Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#F8F6F0] p-6 shadow-2xl border border-campus-sage/30 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-campus-sage/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-campus-forest flex items-center justify-center text-campus-amber font-bold text-sm">
                    F
                  </div>
                  <h3 className="text-base font-bold text-campus-forest">Install FindItAi on iOS</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-black/5 text-campus-charcoal/60"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-campus-charcoal/80">
                <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-campus-sage/20">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-campus-forest text-campus-ivory flex items-center justify-center text-xs font-bold">1</span>
                  <p>Tap the <strong>Share</strong> icon in the Safari toolbar at the bottom of your screen.</p>
                </div>
                <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-campus-sage/20">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-campus-forest text-campus-ivory flex items-center justify-center text-xs font-bold">2</span>
                  <p>Scroll down in the action sheet and tap <strong>"Add to Home Screen"</strong>.</p>
                </div>
                <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-campus-sage/20">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-campus-forest text-campus-ivory flex items-center justify-center text-xs font-bold">3</span>
                  <p>Tap <strong>Add</strong> in the top-right corner to launch directly from your home screen.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-campus-forest py-2.5 text-sm font-semibold text-campus-ivory hover:bg-campus-forest-light transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop ambient indicator
  return null;
};
