import React, { useState, useEffect } from 'react';
import { ConsultingOffering, HeroConfig, InquiryLead, LeadStatus } from '../types';
import { AdminLeadsTab } from './AdminLeadsTab';
import { AdminStudioTab } from './AdminStudioTab';
import { 
  fetchStudioAdminConnection, 
  syncLeadsWithStudioAdmin, 
  updateLeadStatusRealtime, 
  fetchCurrentLeads,
  StudioConnectionStatus 
} from '../services/studioAdminService';
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
  Globe,
  Inbox,
  Activity,
  RefreshCw,
  ExternalLink,
  Clock,
  Radio
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
  const [activeTab, setActiveTab] = useState<'leads' | 'studio' | 'hero' | 'consulting' | 'cultural'>('leads');
  const [localHero, setLocalHero] = useState<HeroConfig>(heroConfig);
  const [localOfferings, setLocalOfferings] = useState<ConsultingOffering[]>(offerings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [leads, setLeads] = useState<InquiryLead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [studioStatus, setStudioStatus] = useState<StudioConnectionStatus | null>(null);
  const [isStudioSyncing, setIsStudioSyncing] = useState(false);
  const [lastStudioSync, setLastStudioSync] = useState<string | null>(null);
  const [realtimeSyncEnabled, setRealtimeSyncEnabled] = useState(true);

  // Fetch leads and update state
  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const freshLeads = await fetchCurrentLeads();
      if (freshLeads && freshLeads.length >= 0) {
        setLeads(freshLeads);
      }
    } catch (err) {
      console.log('Fetching leads error:', err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  // Fetch utility: Connects and synchronizes pending consulting leads with studio.nepalai.tech/admin
  const handleSyncWithStudio = async () => {
    setIsStudioSyncing(true);
    try {
      const syncResult = await syncLeadsWithStudioAdmin(leads);
      const conn = await fetchStudioAdminConnection();
      setStudioStatus(conn);
      setLastStudioSync(new Date().toLocaleTimeString());
      if (syncResult.leads && Array.isArray(syncResult.leads)) {
        setLeads(syncResult.leads);
      }
    } catch (e) {
      console.warn('Studio real-time sync notice:', e);
    } finally {
      setTimeout(() => {
        setIsStudioSyncing(false);
      }, 500);
    }
  };

  // Real-time synchronization effect: polls studio.nepalai.tech/admin every 10 seconds when open
  useEffect(() => {
    if (!isOpen) return;

    fetchLeads();
    fetchStudioAdminConnection().then((conn) => {
      setStudioStatus(conn);
      setLastStudioSync(new Date().toLocaleTimeString());
    });

    if (!realtimeSyncEnabled) return;

    const interval = setInterval(async () => {
      try {
        const [freshLeads, conn] = await Promise.all([
          fetchCurrentLeads(),
          fetchStudioAdminConnection(),
        ]);
        if (freshLeads.length > 0) {
          setLeads(freshLeads);
        }
        setStudioStatus(conn);
        setLastStudioSync(new Date().toLocaleTimeString());
      } catch (err) {
        console.debug('Real-time sync tick note:', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isOpen, realtimeSyncEnabled]);

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

  // Real-time status update fetch utility: updates lead status and syncs immediately with studio.nepalai.tech/admin
  const handleUpdateLeadStatus = async (id: string, newStatus: LeadStatus, notes?: string) => {
    // Optimistic local state update
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus, ...(notes !== undefined ? { adminNotes: notes } : {}) } : l))
    );

    try {
      const result = await updateLeadStatusRealtime(id, newStatus, notes);
      if (result.success && result.lead) {
        setLeads((prev) => prev.map((l) => (l.id === id ? result.lead! : l)));
        setLastStudioSync(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.log('Update status API note:', err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.log('Delete lead API note:', err);
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

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

  // Count calculations reflecting real-time studio.nepalai.tech/admin status
  const pendingLeadsCount = studioStatus?.pendingLeadsCount !== undefined
    ? studioStatus.pendingLeadsCount
    : leads.filter((l) => l.status === 'new' || l.status === 'reviewing').length;

  const newLeadsCount = studioStatus?.newLeadsCount !== undefined
    ? studioStatus.newLeadsCount
    : leads.filter((l) => l.status === 'new').length;

  const reviewingLeadsCount = studioStatus?.reviewingLeadsCount !== undefined
    ? studioStatus.reviewingLeadsCount
    : leads.filter((l) => l.status === 'reviewing').length;

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
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
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
                Live administration connected with studio.nepalai.tech/admin hub.
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

        {/* REAL-TIME STATUS TRACKER: studio.nepalai.tech/admin Live Bridge */}
        <div className="mt-3 p-3 sm:p-3.5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-black/40 to-emerald-950/30 shadow-inner">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            
            {/* Left: Live Endpoint Connection Status */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
                <Activity className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${studioStatus?.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${studioStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-display">
                    Studio Status Tracker
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight border ${
                    studioStatus?.connected
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  }`}>
                    {studioStatus?.connected ? 'LIVE BRIDGE ACTIVE' : 'CONNECTING...'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                  <span className="text-indigo-300">studio.nepalai.tech/admin</span>
                  {studioStatus?.latencyMs !== undefined && (
                    <>
                      <span>•</span>
                      <span>{studioStatus.latencyMs}ms latency</span>
                    </>
                  )}
                  {lastStudioSync && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline text-slate-400">Synced: {lastStudioSync}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Pending Consulting Leads Counter & Live Action Controls */}
            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-between md:justify-end">
              
              {/* Status Tracker: Current Number of Pending Consulting Leads */}
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 cursor-pointer hover:bg-amber-500/15 transition-colors"
                onClick={() => setActiveTab('leads')}
                title="View pending consulting leads"
              >
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-mono text-amber-300/80 font-semibold leading-none">
                    Pending Consulting Leads
                  </div>
                  <div className="text-xs font-extrabold text-amber-300 tabular-nums flex items-center gap-1.5 leading-tight mt-0.5">
                    <span>{pendingLeadsCount} Pending</span>
                    <span className="text-[10px] font-normal text-amber-400/90 font-mono">
                      ({newLeadsCount} new, {reviewingLeadsCount} reviewing)
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Leads Counter */}
              <div className="hidden lg:flex flex-col justify-center px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
                <span className="text-[9px] uppercase font-mono text-slate-400 font-semibold leading-none">
                  Total Leads
                </span>
                <span className="text-xs font-bold text-white tabular-nums leading-tight mt-0.5">
                  {leads.length} recorded
                </span>
              </div>

              {/* Real-Time Sync Action */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSyncWithStudio}
                  disabled={isStudioSyncing}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="Pull latest pending leads count from studio.nepalai.tech/admin"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isStudioSyncing ? 'animate-spin' : ''}`} />
                  <span>{isStudioSyncing ? 'Pulling...' : 'Pull Status'}</span>
                </button>

                <a
                  href="https://studio.nepalai.tech/admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                  title="Open studio.nepalai.tech/admin Dashboard (opens in new tab)"
                >
                  <span>Studio Admin</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

            </div>

          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 pt-4 pb-2 border-b border-white/10 text-xs overflow-x-auto scrollbar-none" role="tablist" aria-label="Admin panel sections">
          <button
            role="tab"
            aria-selected={activeTab === 'leads'}
            onClick={() => setActiveTab('leads')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            <Inbox className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Inquiries & Leads</span>
            {leads.filter((l) => l.status === 'new').length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'leads' ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {leads.filter((l) => l.status === 'new').length} New
              </span>
            )}
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'studio'}
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Studio.nepalai.tech Dashboard</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'hero'}
            onClick={() => setActiveTab('hero')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
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
          
          {/* TAB 1: INQUIRIES & LEADS */}
          {activeTab === 'leads' && (
            <AdminLeadsTab
              leads={leads}
              onRefreshLeads={fetchLeads}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onDeleteLead={handleDeleteLead}
              isLoading={isLoadingLeads}
              studioConnected={studioStatus?.connected ?? true}
              onSyncStudio={handleSyncWithStudio}
              isStudioSyncing={isStudioSyncing}
              lastStudioSync={lastStudioSync}
              realtimeSyncEnabled={realtimeSyncEnabled}
              onToggleRealtimeSync={() => setRealtimeSyncEnabled((prev) => !prev)}
            />
          )}

          {/* TAB 2: STUDIO INTEGRATION */}
          {activeTab === 'studio' && (
            <AdminStudioTab 
              leadsCount={leads.length}
              pendingCount={leads.filter((l) => l.status === 'new' || l.status === 'reviewing').length}
              studioConnection={studioStatus}
              onTriggerSync={handleSyncWithStudio}
              isSyncing={isStudioSyncing}
            />
          )}

          {/* TAB 3: HERO SECTION CONFIG */}
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
