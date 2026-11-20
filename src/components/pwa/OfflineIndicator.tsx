import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-[#0d1527] border border-cyan-500/40 px-3.5 py-2 text-xs font-medium text-cyan-100 shadow-2xl backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        <WifiOff className="h-4 w-4 text-cyan-300" />
      </div>
      <div>
        <span className="font-bold text-white block">Offline Mode</span>
        <span className="text-xs text-slate-200">All calculators active from local cache.</span>
      </div>
    </div>
  );
};
