import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-campus-amber px-4 py-2.5 text-xs font-semibold text-campus-charcoal shadow-xl border border-white/20 animate-bounce">
      <WifiOff className="w-4 h-4" />
      <span>Offline Mode — Cached campus records active.</span>
    </div>
  );
};
