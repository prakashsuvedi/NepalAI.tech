import React, { useState, useEffect } from 'react';
import { ConsultingOffering } from '../types';
import { X, Save, RotateCcw, ShieldCheck, Check, DollarSign } from 'lucide-react';

interface AdminPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerings: ConsultingOffering[];
  onSaveOfferings: (updated: ConsultingOffering[]) => void;
  onResetOfferings: () => void;
}

export const AdminPricingModal: React.FC<AdminPricingModalProps> = ({
  isOpen,
  onClose,
  offerings,
  onSaveOfferings,
  onResetOfferings,
}) => {
  const [localOfferings, setLocalOfferings] = useState<ConsultingOffering[]>(offerings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setLocalOfferings(offerings);
  }, [offerings]);

  if (!isOpen) return null;

  const handleChange = (id: string, field: 'startingPriceNpr' | 'startingPriceUsd' | 'duration', value: string) => {
    setLocalOfferings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = () => {
    onSaveOfferings(localOfferings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all consulting prices to system defaults?')) {
      onResetOfferings();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 900);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0c0e17] p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span>Admin Pricing & Service Customizer</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  Admin Panel
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Adjust public NPR/USD service rates or customize proposal scopes for clients.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
          {localOfferings.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">{item.category} • {item.tier}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Price in NPR:</label>
                  <input
                    type="text"
                    value={item.startingPriceNpr || ''}
                    onChange={(e) => handleChange(item.id, 'startingPriceNpr', e.target.value)}
                    placeholder="e.g. NPR 1,80,000 or Custom"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Price in USD:</label>
                  <input
                    type="text"
                    value={item.startingPriceUsd || ''}
                    onChange={(e) => handleChange(item.id, 'startingPriceUsd', e.target.value)}
                    placeholder="e.g. $1,400 or Custom"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-indigo-300 font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Duration / Timeline:</label>
                  <input
                    type="text"
                    value={item.duration || ''}
                    onChange={(e) => handleChange(item.id, 'duration', e.target.value)}
                    placeholder="e.g. 2 to 3 Weeks"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Pricing Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
