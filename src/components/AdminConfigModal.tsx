import React, { useState, useEffect } from 'react';
import { ConsultingOffering, HeroConfig } from '../types';
import {
  X,
  Save,
  RotateCcw,
  ShieldCheck,
  Check,
  SlidersHorizontal,
  Sparkles,
  Mountain,
  Building2,
  DollarSign,
  Layers,
  Globe
} from 'lucide-react';

interface AdminConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  heroConfig: HeroConfig;
  onSaveHeroConfig: (updated: HeroConfig) => void;
  onResetHeroConfig: () => void;
  offerings: ConsultingOffering[];
  onSaveOfferings: (updated: ConsultingOffering[]) => void;
  onResetOfferings: () => void;
}

export const AdminConfigModal: React.FC<AdminConfigModalProps> = ({
  isOpen,
  onClose,
  heroConfig,
  onSaveHeroConfig,
  onResetHeroConfig,
  offerings,
  onSaveOfferings,
  onResetOfferings,
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'consulting' | 'cultural'>('hero');
  const [localHero, setLocalHero] = useState<HeroConfig>(heroConfig);
  const [localOfferings, setLocalOfferings] = useState<ConsultingOffering[]>(offerings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setLocalHero(heroConfig);
  }, [heroConfig]);

  useEffect(() => {
    setLocalOfferings(offerings);
  }, [offerings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleHeroChange = (field: keyof HeroConfig, value: any) => {
    setLocalHero((prev) => ({ ...prev, [field]: value }));
  };

  const handleOfferingChange = (
    id: string,
    field: 'startingPriceNpr' | 'startingPriceUsd' | 'duration' | 'title' | 'subtitle',
    value: string
  ) => {
    setLocalOfferings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveAll = () => {
    onSaveHeroConfig(localHero);
    onSaveOfferings(localOfferings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 850);
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all Hero text, cultural motifs, and consulting pricing to defaults?')) {
      onResetHeroConfig();
      onResetOfferings();
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0c0e17] p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="admin-modal-title" className="text-base font-bold text-white font-display flex items-center gap-2">
                <span>Enterprise & Content Admin Panel</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  Full Control
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Customize live Hero section content, studio direct links, cultural aesthetics, and consulting rates.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close admin panel"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-white/10 text-xs" role="tablist" aria-label="Admin panel sections">
          <button
            role="tab"
            aria-selected={activeTab === 'hero'}
            onClick={() => setActiveTab('hero')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === 'hero'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Hero & Studio Link</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'consulting'}
            onClick={() => setActiveTab('consulting')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === 'consulting'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Consulting Rates & Scopes</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'cultural'}
            onClick={() => setActiveTab('cultural')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === 'cultural'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            <Mountain className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Himalaya & Mandir Art</span>
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4 text-xs scrollbar-thin">
          
          {/* TAB 1: HERO SECTION CONFIG */}
          {activeTab === 'hero' && (
            <div className="space-y-4">
              
              {/* Studio URL & Eyebrows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-mono block mb-1">
                    Direct Studio URL:
                  </label>
                  <input
                    type="text"
                    value={localHero.studioUrl}
                    onChange={(e) => handleHeroChange('studioUrl', e.target.value)}
                    placeholder="https://studio.nepalai.tech"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-indigo-300 font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-mono block mb-1">
                    Live Credits Label:
                  </label>
                  <input
                    type="text"
                    value={localHero.liveCreditAmount}
                    onChange={(e) => handleHeroChange('liveCreditAmount', e.target.value)}
                    placeholder="500 Daily Free Credits"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Eyebrow texts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Eyebrow (Nepali Devanagari):
                  </label>
                  <input
                    type="text"
                    value={localHero.eyebrowNepali}
                    onChange={(e) => handleHeroChange('eyebrowNepali', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white font-devanagari focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Eyebrow (English Subtext):
                  </label>
                  <input
                    type="text"
                    value={localHero.eyebrowEnglish}
                    onChange={(e) => handleHeroChange('eyebrowEnglish', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Main Headlines */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-semibold">
                  Main Headline (Devanagari Script):
                </label>
                <input
                  type="text"
                  value={localHero.headlineDevanagari}
                  onChange={(e) => handleHeroChange('headlineDevanagari', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white text-sm font-devanagari font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-semibold">
                  Main Subtitle (English):
                </label>
                <input
                  type="text"
                  value={localHero.headlineEnglish}
                  onChange={(e) => handleHeroChange('headlineEnglish', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Hero Paragraph Pitch (Nepali):
                </label>
                <textarea
                  rows={3}
                  value={localHero.descriptionNepali}
                  onChange={(e) => handleHeroChange('descriptionNepali', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-slate-200 font-devanagari leading-relaxed focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* 3 Metric Badges */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  Hero Live Metric Chips:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02]">
                    <span className="text-[10px] text-emerald-400 font-mono block">Metric 1</span>
                    <input
                      type="text"
                      value={localHero.metric1Value}
                      onChange={(e) => handleHeroChange('metric1Value', e.target.value)}
                      placeholder="Value"
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-emerald-400 mb-1"
                    />
                    <input
                      type="text"
                      value={localHero.metric1Label}
                      onChange={(e) => handleHeroChange('metric1Label', e.target.value)}
                      placeholder="Label"
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-300"
                    />
                  </div>

                  <div className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02]">
                    <span className="text-[10px] text-indigo-400 font-mono block">Metric 2</span>
                    <input
                      type="text"
                      value={localHero.metric2Value}
                      onChange={(e) => handleHeroChange('metric2Value', e.target.value)}
                      placeholder="Value"
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-indigo-400 mb-1"
                    />
                    <input
                      type="text"
                      value={localHero.metric2Label}
                      onChange={(e) => handleHeroChange('metric2Label', e.target.value)}
                      placeholder="Label"
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-300"
                    />
                  </div>

                  <div className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02]">
                    <span className="text-[10px] text-amber-400 font-mono block">Metric 3</span>
                    <input
                      type="text"
                      value={localHero.metric3Value}
                      onChange={(e) => handleHeroChange('metric3Value', e.target.value)}
                      placeholder="Value"
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-amber-400 mb-1"
                    />
                    <input
                      type="text"
                      value={localHero.metric3Label}
                      onChange={(e) => handleHeroChange('metric3Label', e.target.value)}
                      placeholder="Label"
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-300"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CONSULTING SERVICES & PRICING */}
          {activeTab === 'consulting' && (
            <div className="space-y-4">
              <p className="text-slate-400 text-xs">
                Update consulting rates in Nepalese Rupees (NPR), USD, and deliverables duration for each offering.
              </p>

              {localOfferings.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleOfferingChange(item.id, 'title', e.target.value)}
                      className="text-sm font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400 font-mono">{item.category} • {item.tier}</span>
                  </div>

                  <input
                    type="text"
                    value={item.subtitle}
                    onChange={(e) => handleOfferingChange(item.id, 'subtitle', e.target.value)}
                    className="w-full text-xs text-slate-400 bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 focus:outline-none"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Price in NPR:</label>
                      <input
                        type="text"
                        value={item.startingPriceNpr || ''}
                        onChange={(e) => handleOfferingChange(item.id, 'startingPriceNpr', e.target.value)}
                        placeholder="NPR 1,80,000"
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Price in USD:</label>
                      <input
                        type="text"
                        value={item.startingPriceUsd || ''}
                        onChange={(e) => handleOfferingChange(item.id, 'startingPriceUsd', e.target.value)}
                        placeholder="$1,400"
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-indigo-300 font-mono focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Duration / Timeline:</label>
                      <input
                        type="text"
                        value={item.duration || ''}
                        onChange={(e) => handleOfferingChange(item.id, 'duration', e.target.value)}
                        placeholder="2 Weeks"
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-white/30 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CULTURAL ART & HERITAGE MOTIFS */}
          {activeTab === 'cultural' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mountain className="h-4 w-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-white block">Himalayan Silhouette Mountain Peaks</span>
                      <span className="text-[11px] text-slate-400">
                        Multi-layer SVG showing Mount Machapuchare (Fishtail) and Everest range with snow cap glow.
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localHero.showHimalayaArt}
                      onChange={(e) => handleHeroChange('showHimalayaArt', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-white block">Mandir Pagoda Temple & Gajur Motif</span>
                      <span className="text-[11px] text-slate-400">
                        Traditional 3-tier Nepalese pagoda temple roofline with golden Gajur spire on the horizon.
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localHero.showMandirMotif}
                      onChange={(e) => handleHeroChange('showMandirMotif', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-dashed border-slate-700 text-[11px] text-slate-400">
                <p>
                  Tip: When toggled on, the Himalayan and Mandir vectors automatically adjust their atmospheric lighting, snow-reflections, and gradients based on whether the user is in <strong>Light Mode</strong> or <strong>Dark Mode</strong>.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All to Defaults</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-sm"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Changes Saved Live!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
