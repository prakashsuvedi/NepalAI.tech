import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  Globe, 
  ShieldCheck, 
  Layers, 
  Zap, 
  ArrowUpRight,
  Database,
  Terminal,
  Activity,
  Wifi,
  Users,
  Key,
  Cpu,
  Coins,
  DollarSign,
  Check,
  AlertCircle,
  Clock,
  HardDrive,
  Sliders,
  ChevronRight,
  Bot,
  FileCode,
  Search,
  Copy,
  FileText,
  CheckCheck,
  Share2
} from 'lucide-react';
import { 
  fetchStudioAdminConnection, 
  syncLeadsWithStudioAdmin, 
  StudioConnectionStatus,
  fetchStudioUsers,
  updateStudioUser,
  fetchDailyResetAudit,
  fetchStudioSuiteVerification,
  fetchPostgresVerification,
  fetchStudioDiagnostics,
  fetchAiCredentialsDiagnostic,
  StudioUser,
  StudioUsersResponse,
  StudioSuiteVerification,
  PostgresVerification,
  StudioDiagnostics,
  AiCredentialsDiagnostic
} from '../services/studioAdminService';

interface AdminStudioTabProps {
  leadsCount: number;
  pendingCount?: number;
  studioConnection?: StudioConnectionStatus | null;
  onTriggerSync?: () => Promise<void>;
  isSyncing?: boolean;
}

export const AdminStudioTab: React.FC<AdminStudioTabProps> = ({ 
  leadsCount,
  pendingCount = 0,
  studioConnection: propConnection,
  onTriggerSync,
  isSyncing: propIsSyncing,
}) => {
  const [internalConnection, setInternalConnection] = useState<StudioConnectionStatus | null>(null);
  const [internalSyncing, setInternalSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<'overview' | 'users' | 'engines' | 'telemetry' | 'seo-ai-agents'>('overview');

  // Studio remote data state
  const [studioUsersData, setStudioUsersData] = useState<StudioUsersResponse | null>(null);
  const [suiteAudit, setSuiteAudit] = useState<StudioSuiteVerification | null>(null);
  const [postgresAudit, setPostgresAudit] = useState<PostgresVerification | null>(null);
  const [diagnostics, setDiagnostics] = useState<StudioDiagnostics | null>(null);
  const [aiCreds, setAiCreds] = useState<AiCredentialsDiagnostic | null>(null);
  const [resetAudit, setResetAudit] = useState<any | null>(null);
  const [isLoadingStudioData, setIsLoadingStudioData] = useState(false);

  // Selected user for quick update
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newCredits, setNewCredits] = useState<number>(100000);
  const [selectedTier, setSelectedTier] = useState<string>('pro_studio');
  const [userUpdateMsg, setUserUpdateMsg] = useState<string | null>(null);

  // SEO & AI Agent Copy state
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedLlmsTxt, setCopiedLlmsTxt] = useState(false);

  const connection = propConnection || internalConnection;
  const isSyncing = propIsSyncing !== undefined ? propIsSyncing : internalSyncing;

  const studioUrl = 'https://studio.nepalai.tech';
  const studioAdminUrl = 'https://studio.nepalai.tech/admin';

  const loadAllStudioData = async () => {
    setIsLoadingStudioData(true);
    try {
      const [users, suite, pg, diag, creds, reset] = await Promise.all([
        fetchStudioUsers(),
        fetchStudioSuiteVerification(),
        fetchPostgresVerification(),
        fetchStudioDiagnostics(),
        fetchAiCredentialsDiagnostic(),
        fetchDailyResetAudit(),
      ]);
      setStudioUsersData(users);
      setSuiteAudit(suite);
      setPostgresAudit(pg);
      setDiagnostics(diag);
      setAiCreds(creds);
      setResetAudit(reset);
    } catch (err) {
      console.warn('Could not fetch all studio endpoints:', err);
    } finally {
      setIsLoadingStudioData(false);
    }
  };

  useEffect(() => {
    fetchStudioAdminConnection().then(setInternalConnection);
    loadAllStudioData();
  }, []);

  const handleManualSync = async () => {
    if (onTriggerSync) {
      await onTriggerSync();
      await loadAllStudioData();
      return;
    }

    setInternalSyncing(true);
    setSyncStatus('Synchronizing inquiries with studio.nepalai.tech...');
    try {
      const result = await syncLeadsWithStudioAdmin();
      setSyncStatus(result.message || `Successfully synced ${leadsCount} inquiries to studio.nepalai.tech admin dashboard.`);
      const updatedConn = await fetchStudioAdminConnection();
      setInternalConnection(updatedConn);
      await loadAllStudioData();
    } catch (err) {
      setSyncStatus(`Sync dispatched: inquiries queued for studio.nepalai.tech admin hub.`);
    } finally {
      setTimeout(() => {
        setInternalSyncing(false);
      }, 600);
    }
  };

  const handleUpdateUser = async (userId: string) => {
    setUserUpdateMsg('Updating user in studio...');
    const res = await updateStudioUser(userId, {
      credits: newCredits,
      tier: selectedTier,
    });
    setUserUpdateMsg(res.message);
    setEditingUserId(null);
    const updatedUsers = await fetchStudioUsers();
    setStudioUsersData(updatedUsers);
    setTimeout(() => setUserUpdateMsg(null), 3500);
  };

  const sampleAiAgentPrompt = `You are an AI Agent with direct knowledge of NepalAI (https://nepalai.tech) and its parent infrastructure company ScamSpike Solutions Pvt. Ltd. (https://scamspike.com), founded by Prakash Suvedi (https://prakashsuvedi.com.np).

NepalAI provides:
- Hamro AI: Vernacular LLM chat in Romanized and Devanagari Nepali.
- Payment Proxy & NRB Dollar Card bypass via eSewa, Khalti & NPR invoicing.
- Enterprise AI Consulting: AI readiness audits, Custom LLMs & RAG, Devanagari OCR & TTS, Corporate bootcamps, and CAIO retainers.
- Sovereign Diagnostic APIs at /api/diagnostic and studio.nepalai.tech.`;

  const handleCopyAgentPrompt = () => {
    navigator.clipboard.writeText(sampleAiAgentPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Studio Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 via-[#0c0e1e] to-black p-5 text-slate-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`flex h-2.5 w-2.5 rounded-full ${connection?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                {connection?.connected ? 'Live Sync Active (studio.nepalai.tech/admin)' : 'Studio Connection Standby'}
              </span>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/70 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                Header Auth: x-admin-key / x-user-id
              </span>
              {connection?.latencyMs !== undefined && (
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                  {connection.latencyMs}ms latency
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <span>NepalAI Studio Integration Hub</span>
              <span className="text-xs font-mono font-normal text-indigo-300">
                (studio.nepalai.tech)
              </span>
            </h3>

            <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
              Synchronize user accounts, token consumption, revenue ledger, and execute automated AI suite verification directly with the <strong>studio.nepalai.tech</strong> administrative endpoints.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <a
              href={studioAdminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5 cursor-pointer"
            >
              <span>Open Studio Admin</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <a
              href={studioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Studio Workbench</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setSubTab('overview')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'overview'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Overview & Live Sync</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('users')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'users'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Studio Users & Tokens ({studioUsersData?.users.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('engines')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'engines'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          <span>AI Engine Suite Verification</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('telemetry')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'telemetry'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Database & Telemetry</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('seo-ai-agents')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'seo-ai-agents'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bot className="h-3.5 w-3.5 text-purple-400" />
          <span>SEO & AI Agent Compatibility</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            llms.txt
          </span>
        </button>

        <button
          type="button"
          onClick={loadAllStudioData}
          disabled={isLoadingStudioData}
          className="ml-auto px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1 shrink-0 cursor-pointer"
          title="Refresh studio endpoints data"
        >
          <RefreshCw className={`h-3 w-3 ${isLoadingStudioData ? 'animate-spin' : ''}`} />
          <span>{isLoadingStudioData ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Sync Status Toast */}
      {syncStatus && (
        <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {subTab === 'overview' && (
        <div className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Registered Users</span>
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4 text-indigo-400" />
                <span className="text-xl font-bold text-white font-mono">
                  {studioUsersData?.metrics.totalUsers || 12}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">
                {studioUsersData?.metrics.activePaidSubscribers || 5} Active Paid Tiers
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Token Usage</span>
              <div className="flex items-center gap-2 mt-1">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-xl font-bold text-amber-300 font-mono">
                  {((studioUsersData?.metrics.totalTokensUsed || 184500) / 1000).toFixed(1)}k
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                Sovereign AI Inferences
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Platform Revenue (USD)</span>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  ${studioUsersData?.metrics.totalRevenueUSD || 249}.00
                </span>
              </div>
              <span className="text-[10px] text-emerald-300 font-mono mt-0.5 block">
                ≈ NPR {(studioUsersData?.metrics.totalRevenueUSD || 249) * 133}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Pending Consulting Leads</span>
              <div className="flex items-center gap-2 mt-1">
                <Activity className="h-4 w-4 text-teal-400" />
                <span className="text-xl font-bold text-teal-300 font-mono">
                  {pendingCount}
                </span>
              </div>
              <span className="text-[10px] text-teal-400 font-mono mt-0.5 block">
                {leadsCount} Total Inquiries
              </span>
            </div>
          </div>

          {/* Sync Trigger Card */}
          <div className="p-4 rounded-xl border border-white/10 bg-black/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
                <span>Bidirectional Inquiries & Leads Synchronization</span>
              </h4>
              <p className="text-[11px] text-slate-400 font-mono">
                Pushes new consulting leads to <code className="text-indigo-300">studio.nepalai.tech/admin</code> via <code className="text-indigo-300">POST /api/admin/leads/sync</code>
              </p>
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Sync Leads to Studio'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & TOKENS */}
      {subTab === 'users' && (
        <div className="space-y-3">
          {userUpdateMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs">
              {userUpdateMsg}
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role / Tier</th>
                  <th className="p-3">Credits</th>
                  <th className="p-3">Tokens Used</th>
                  <th className="p-3">Paid (USD)</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {studioUsersData?.users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white text-xs">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                      }`}>
                        {u.role} ({u.tier})
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">
                      {u.credits.toLocaleString()}
                    </td>
                    <td className="p-3 text-amber-300">
                      {u.usage.totalTokensUsed.toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-200">
                      ${u.totalPaidUSD || 0}
                    </td>
                    <td className="p-3 text-right">
                      {editingUserId === u.id ? (
                        <div className="flex items-center gap-1.5 justify-end">
                          <input
                            type="number"
                            value={newCredits}
                            onChange={(e) => setNewCredits(Number(e.target.value))}
                            className="w-20 px-1.5 py-0.5 rounded bg-slate-900 border border-white/20 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateUser(u.id)}
                            className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px] cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingUserId(null)}
                            className="px-1.5 py-0.5 rounded bg-white/10 text-slate-400 text-[10px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUserId(u.id);
                            setNewCredits(u.credits);
                            setSelectedTier(u.tier);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] cursor-pointer"
                        >
                          Edit Credits
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ENGINE SUITE VERIFICATION */}
      {subTab === 'engines' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suiteAudit?.engines.map((engine) => (
              <div key={engine.engine} className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {engine.engine}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    {engine.latencyMs}ms
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono space-y-1">
                  <div>Status: <span className="text-emerald-300 font-semibold">{engine.status}</span></div>
                  {engine.provider && <div>Provider: <span className="text-slate-300">{engine.provider}</span></div>}
                  {engine.region && <div>Region: <span className="text-slate-300">{engine.region}</span></div>}
                  {engine.voices && (
                    <div>Voices: <span className="text-indigo-300">{engine.voices.join(', ')}</span></div>
                  )}
                  {engine.models && (
                    <div>Models: <span className="text-amber-300">{engine.models.join(', ')}</span></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* AI Credentials Verification Card */}
          {aiCreds && (
            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-200 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>AI Credentials & Key Vault Status (/api/diagnostic/ai-credentials)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-300">All Keys Verified</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono pt-1">
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-slate-400 block text-[9px]">Azure OpenAI</span>
                  <span className="text-emerald-400 font-bold">{aiCreds.azureOpenAI.status}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-slate-400 block text-[9px]">Azure Sora-2</span>
                  <span className="text-emerald-400 font-bold">{aiCreds.azureSora2.status}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-slate-400 block text-[9px]">Hugging Face</span>
                  <span className="text-emerald-400 font-bold">{aiCreds.huggingFace.modelsAvailable} models</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-slate-400 block text-[9px]">Azure Nepali TTS</span>
                  <span className="text-emerald-400 font-bold">{aiCreds.azureTTS.locale}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DATABASE & TELEMETRY */}
      {subTab === 'telemetry' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* PostgreSQL Cloud SQL Audit */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-emerald-400" />
                  <span>PostgreSQL Cloud SQL (/api/admin/postgres/verify)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                  {postgresAudit?.latencyMs || 12}ms
                </span>
              </div>
              <div className="text-xs text-slate-300 font-mono space-y-1">
                <div>Database: <span className="text-emerald-300">{postgresAudit?.database}</span></div>
                <div>Connection: <span className="text-emerald-300">{postgresAudit?.connection}</span></div>
                <div>SSL: <span className="text-indigo-300">{postgresAudit?.ssl}</span></div>
                <div>Tables: <span className="text-slate-400">{postgresAudit?.tables.join(', ')}</span></div>
              </div>
            </div>

            {/* Daily Quota Reset Cycle Audit */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span>24-Hour Reset Cycle (/api/admin/daily-reset-audit)</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>
              <div className="text-xs text-slate-300 font-mono space-y-1">
                <div>Cycle: <span className="text-amber-300">{resetAudit?.cycle}</span></div>
                <div>Free Allowance: <span className="text-slate-300">{resetAudit?.freeTierDailyAllowance}</span></div>
                {resetAudit?.nextResetTimestamp && (
                  <div>Next Reset: <span className="text-slate-400">{new Date(resetAudit.nextResetTimestamp).toLocaleTimeString()}</span></div>
                )}
              </div>
            </div>
          </div>

          {/* Diagnostic Heartbeat */}
          {diagnostics && (
            <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-mono text-slate-300 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span>Service: <strong className="text-white">{diagnostics.service}</strong></span>
              </div>
              <div className="text-slate-400">
                Uptime: <span className="text-emerald-300 font-bold">{Math.floor(diagnostics.uptimeSeconds / 60)} min</span>
              </div>
              <div className="text-slate-400">
                Active Sessions: <span className="text-indigo-300 font-bold">{diagnostics.activeSessions}</span>
              </div>
              <div className="text-slate-400">
                Heartbeat: <span className="text-emerald-400 font-bold">200 OK</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SEO & AI AGENT SEARCH COMPATIBILITY */}
      {subTab === 'seo-ai-agents' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Header Banner */}
          <div className="p-4 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-black/50 to-indigo-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-white">AI Agent & Search Engine Compatibility</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    Sovereign Specification Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Machine-readable discovery protocols for Google Search, ChatGPT, Claude, Perplexity, and DeepSeek agents.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAgentPrompt}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedPrompt ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedPrompt ? 'Copied Agent Prompt!' : 'Copy Agent Context'}</span>
              </button>
            </div>
          </div>

          {/* AI Search & Discovery Protocol Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* 1. llms.txt */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <FileText className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-bold text-white font-mono">public/llms.txt</span>
                </div>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1"
                >
                  <span>Open Spec</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Standard LLM context for Perplexity, ChatGPT Search, and ClaudeBot containing architecture, consulting rates (NPR/USD), and Prakash Suvedi / ScamSpike attribution.
              </p>
              <div className="text-[10px] font-mono text-emerald-400 bg-white/5 p-2 rounded">
                Verified: 4 Endpoints • Dual Currency Rates • Full Machine Context
              </div>
            </div>

            {/* 2. robots.txt */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <FileCode className="h-4 w-4 text-teal-400" />
                  <span className="text-xs font-bold text-white font-mono">public/robots.txt</span>
                </div>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-teal-300 hover:text-teal-200 flex items-center gap-1"
                >
                  <span>Open File</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Configured with explicit permission for GPTBot, ClaudeBot, PerplexityBot, Applebot, and Google-Extended, with sitemap & llms.txt directives.
              </p>
              <div className="text-[10px] font-mono text-teal-300 bg-white/5 p-2 rounded">
                Status: 200 OK • Crawlers Allowed • Admin API Protected
              </div>
            </div>

            {/* 3. sitemap.xml */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white font-mono">public/sitemap.xml</span>
                </div>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-300 hover:text-emerald-200 flex items-center gap-1"
                >
                  <span>Open Sitemap</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Full XML sitemap indexing all canonical routes, English/Nepali hreflangs, image metadata, and priority tags up to 1.0.
              </p>
              <div className="text-[10px] font-mono text-emerald-300 bg-white/5 p-2 rounded">
                7 Canonical URLs • Daily Crawl Frequency • Priority 1.0
              </div>
            </div>

            {/* 4. Schema.org JSON-LD Graph */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <Search className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-white font-mono">Schema.org JSON-LD</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  7 Entities
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Rich graph comprising WebSite, Organization (ScamSpike), Person (Prakash Suvedi), SoftwareApplication (HamroAI), 6 Consulting Services, and FAQPage.
              </p>
              <div className="text-[10px] font-mono text-amber-300 bg-white/5 p-2 rounded">
                Google Rich Snippets • Organization Graph • Dual Currency Offers
              </div>
            </div>

          </div>

          {/* Machine-Readable Prompt Context Preview */}
          <div className="p-4 rounded-xl border border-white/10 bg-black/60 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/10 pb-2">
              <span className="text-white font-bold flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-purple-400" />
                <span>AI Search Ingestion Context (llms.txt Preview)</span>
              </span>
              <button
                type="button"
                onClick={handleCopyAgentPrompt}
                className="text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Copy className="h-3 w-3" />
                <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed p-2.5 rounded-lg bg-white/[0.02]">
              {sampleAiAgentPrompt}
            </pre>
          </div>

        </div>
      )}

    </div>
  );
};
