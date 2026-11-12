import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running in standalone mode, do not render
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          onClick={handleInstallClick}
          aria-label="Install NepalAI Web Application"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer shadow-xs min-h-[36px] ${className}`}
        >
          {justInstalled ? (
            <>
              <Check className="h-3.5 w-3.5 text-cyan-400" />
              <span>Installed</span>
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Install App</span>
            </>
          )}
        </button>
      )}

      {/* Guided iOS Safari Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-[#0d1527] border border-cyan-500/30 p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Download className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold font-display">Install on iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                aria-label="Close installation guide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/80 border border-white/5">
                <div className="p-2 rounded-lg bg-white/5 text-cyan-400 shrink-0">
                  <Share2 className="h-4 w-4" />
                </div>
                <div>
                  <strong className="text-white block mb-0.5">Step 1: Tap Share</strong>
                  Tap the Safari <span className="text-cyan-300">Share</span> icon at the bottom of your screen.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/80 border border-white/5">
                <div className="p-2 rounded-lg bg-white/5 text-cyan-400 shrink-0">
                  <PlusSquare className="h-4 w-4" />
                </div>
                <div>
                  <strong className="text-white block mb-0.5">Step 2: Add to Home Screen</strong>
                  Scroll down the share sheet and tap <span className="text-cyan-300">"Add to Home Screen"</span>.
                </div>
              </div>

              <p className="text-[11px] text-slate-400 pt-1">
                Enjoy instant offline access to EV road tax, NEPSE CGT, Preeti converter, and gold bullion rates!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs min-h-[44px]"
            >
              Got it (बुझें)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
