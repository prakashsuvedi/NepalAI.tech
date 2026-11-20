/**
 * studioAdminService.ts
 * 
 * Fetch utility for real-time synchronization and status updates with
 * the administrative hub at studio.nepalai.tech/admin.
 */

import { InquiryLead, LeadStatus } from '../types';
import { auth } from '../lib/firebase';

export interface StudioConnectionStatus {
  connected: boolean;
  status: 'connected' | 'syncing' | 'offline';
  studioUrl: string;
  studioAdminUrl: string;
  totalLeads: number;
  pendingLeadsCount: number;
  newLeadsCount: number;
  reviewingLeadsCount?: number;
  convertedLeadsCount?: number;
  lastSync: string;
  syncSupported: boolean;
  latencyMs?: number;
  message?: string;
}

export interface StudioSyncResult {
  success: boolean;
  syncedCount: number;
  targetStudioUrl: string;
  timestamp: string;
  message: string;
  leads?: InquiryLead[];
}

const STUDIO_ADMIN_BASE = 'https://studio.nepalai.tech/admin';

/**
 * Dynamically resolves Firebase ID token headers in memory without exposing
 * static admin keys or credentials in client-side bundles.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch {
    // Graceful fallback when unauthenticated
  }
  return headers;
}

export async function fetchStudioAdminConnection(): Promise<StudioConnectionStatus> {
  const startTime = Date.now();
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/studio-connection', { headers });
    const latencyMs = Date.now() - startTime;

    if (res.ok) {
      const data = await res.json();
      const newCount = data.newLeadsCount ?? 0;
      const reviewingCount = data.reviewingLeadsCount ?? 0;
      const pendingCount = data.pendingLeadsCount !== undefined ? data.pendingLeadsCount : (newCount + reviewingCount);

      return {
        connected: true,
        status: 'connected',
        studioUrl: data.studioUrl || 'https://studio.nepalai.tech',
        studioAdminUrl: data.studioAdminUrl || STUDIO_ADMIN_BASE,
        totalLeads: data.totalLeads ?? 0,
        pendingLeadsCount: pendingCount,
        newLeadsCount: newCount,
        reviewingLeadsCount: reviewingCount,
        convertedLeadsCount: data.convertedLeadsCount ?? 0,
        lastSync: data.lastSync || new Date().toISOString(),
        syncSupported: true,
        latencyMs,
        message: 'Synchronized with studio.nepalai.tech/admin',
      };
    }
    throw new Error(`HTTP error ${res.status}`);
  } catch {
    return {
      connected: false,
      status: 'offline',
      studioUrl: 'https://studio.nepalai.tech',
      studioAdminUrl: STUDIO_ADMIN_BASE,
      totalLeads: 0,
      pendingLeadsCount: 0,
      newLeadsCount: 0,
      reviewingLeadsCount: 0,
      convertedLeadsCount: 0,
      lastSync: new Date().toISOString(),
      syncSupported: true,
      latencyMs: Date.now() - startTime,
      message: 'Admin sign-in required for live bridge telemetry.',
    };
  }
}

export async function syncLeadsWithStudioAdmin(
  leadsPayload?: InquiryLead[]
): Promise<StudioSyncResult> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/studio-sync', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leads: leadsPayload,
        clientTimestamp: new Date().toISOString(),
        origin: 'AdminConfigModal',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        syncedCount: data.syncedCount ?? (leadsPayload ? leadsPayload.length : 0),
        targetStudioUrl: data.targetStudioUrl || STUDIO_ADMIN_BASE,
        timestamp: data.timestamp || new Date().toISOString(),
        message: data.message || 'Leads synchronized in real time with studio.nepalai.tech/admin.',
        leads: data.leads,
      };
    }
    throw new Error(`Sync responded with ${res.status}`);
  } catch {
    return {
      success: false,
      syncedCount: leadsPayload ? leadsPayload.length : 0,
      targetStudioUrl: STUDIO_ADMIN_BASE,
      timestamp: new Date().toISOString(),
      message: 'Sign in with an administrator account to synchronize.',
    };
  }
}

export async function updateLeadStatusRealtime(
  leadId: string,
  newStatus: LeadStatus,
  adminNotes?: string
): Promise<{ success: boolean; lead?: InquiryLead; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/leads/${encodeURIComponent(leadId)}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: newStatus,
        adminNotes,
        syncedToStudio: true,
        updatedAt: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      const data = await res.json();

      fetch('/api/admin/studio-sync', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'status_transition',
          leadId,
          newStatus,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});

      return {
        success: true,
        lead: data.lead,
      };
    }
    throw new Error(`HTTP ${res.status}`);
  } catch (err: any) {
    console.error('[StudioAdminService] Real-time status update error:', err);
    return {
      success: false,
      error: err?.message || 'Failed to update lead status.',
    };
  }
}

export async function fetchCurrentLeads(): Promise<InquiryLead[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/leads', { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.leads)) {
        return data.leads;
      }
    }
  } catch (e) {
    console.warn('[StudioAdminService] Admin leads fetch notice:', e);
  }
  return [];
}

export interface StudioUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  tier: string;
  credits: number;
  usage: {
    totalTokensUsed: number;
  };
  transactionsCount: number;
  totalPaidUSD: number;
}

export interface StudioUsersResponse {
  success: boolean;
  users: StudioUser[];
  transactions: any[];
  metrics: {
    totalUsers: number;
    totalTokensUsed: number;
    totalRevenueUSD: number;
    activePaidSubscribers: number;
  };
  source?: string;
  timestamp?: string;
}

export interface StudioSuiteVerification {
  success: boolean;
  overallStatus: string;
  auditedAt: string;
  engines: Array<{
    name: string;
    status: string;
    latencyMs: number;
    region?: string;
    provider?: string;
    voices?: string[];
    models?: string[];
  }>;
}

export interface PostgresVerification {
  success: boolean;
  database: string;
  connection: string;
  latencyMs: number;
  tables: string[];
  ssl: string;
}

export interface StudioDiagnostics {
  success: boolean;
  status: string;
  service: string;
  uptimeSeconds: number;
  activeSessions: number;
  memoryUsage?: any;
  nodeVersion?: string;
  latencyMs?: number;
  errorRatePercent?: number;
  timestamp: string;
}

export interface AiCredentialsDiagnostic {
  success: boolean;
  azureOpenAI: { configured: boolean; status: string; model: string; latencyMs?: number; errorRatePercent?: number };
  azureSora2: { configured: boolean; status: string; quota: string; latencyMs?: number; errorRatePercent?: number };
  huggingFace: { configured: boolean; tokenVerified: boolean; modelsAvailable: number; latencyMs?: number; errorRatePercent?: number };
  azureTTS: { configured: boolean; locale: string; engine: string; latencyMs?: number; errorRatePercent?: number };
}

export interface StorageR2Diagnostic {
  success: boolean;
  provider: string;
  bucket: string;
  status: string;
  readLatencyMs: number;
  writeLatencyMs: number;
  errorRatePercent?: number;
  corsConfigured: boolean;
}

export async function fetchStudioUsers(): Promise<StudioUsersResponse> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/studio/users', { headers });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[StudioAdminService] fetchStudioUsers notice:', err);
  }
  return {
    success: false,
    users: [],
    transactions: [],
    metrics: {
      totalUsers: 0,
      totalTokensUsed: 0,
      totalRevenueUSD: 0,
      activePaidSubscribers: 0
    }
  };
}

export async function updateStudioUser(
  userId: string,
  payload: { credits?: number; tier?: string; role?: 'admin' | 'user'; resetTrial?: boolean }
): Promise<{ success: boolean; message: string; user?: StudioUser }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/studio/user/${encodeURIComponent(userId)}/update`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[StudioAdminService] updateStudioUser notice:', err);
  }
  return {
    success: false,
    message: `Authorization required to update user ${userId}.`
  };
}

export async function fetchDailyResetAudit(): Promise<any> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/studio/daily-reset-audit', { headers });
    if (res.ok) return await res.json();
  } catch {}
  return {
    success: false,
    cycle: '24-Hour UTC Midnight Daily Quota Cycle',
    status: 'unauthorized',
    freeTierDailyAllowance: '5,000 Devanagari tokens / day'
  };
}

export async function fetchStudioSuiteVerification(): Promise<StudioSuiteVerification> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/studio/verify-studio-suite', { headers });
    if (res.ok) return await res.json();
  } catch {}
  return {
    success: false,
    overallStatus: 'unauthorized',
    auditedAt: new Date().toISOString(),
    engines: []
  };
}

export async function fetchPostgresVerification(): Promise<PostgresVerification> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/studio/postgres/verify', { headers });
    if (res.ok) return await res.json();
  } catch {}
  return {
    success: false,
    database: 'app_db',
    connection: 'unauthorized',
    latencyMs: 0,
    tables: [],
    ssl: 'CloudSQL_Auth_Proxy'
  };
}

export async function fetchStudioDiagnostics(): Promise<StudioDiagnostics> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/diagnostic', { headers });
    if (res.ok) return await res.json();
  } catch {
    try {
      const headers = await getAuthHeaders();
      const fallback = await fetch('/api/admin/studio/diagnostic', { headers });
      if (fallback.ok) return await fallback.json();
    } catch {}
  }
  return {
    success: false,
    status: 'unauthorized',
    service: 'studio.nepalai.tech-gateway',
    uptimeSeconds: 0,
    activeSessions: 0,
    timestamp: new Date().toISOString()
  };
}

export async function fetchAiCredentialsDiagnostic(): Promise<AiCredentialsDiagnostic> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/diagnostic/ai-credentials', { headers });
    if (res.ok) return await res.json();
  } catch {
    try {
      const headers = await getAuthHeaders();
      const fallback = await fetch('/api/admin/studio/diagnostic/ai-credentials', { headers });
      if (fallback.ok) return await fallback.json();
    } catch {}
  }
  return {
    success: false,
    azureOpenAI: { configured: false, status: 'unauthorized', model: 'gpt-4o-mini-sovereign' },
    azureSora2: { configured: false, status: 'unauthorized', quota: 'restricted' },
    huggingFace: { configured: false, tokenVerified: false, modelsAvailable: 0 },
    azureTTS: { configured: false, locale: 'ne-NP', engine: 'Neural V2' }
  };
}

export async function fetchStorageR2Diagnostic(): Promise<StorageR2Diagnostic> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/diagnostic/storage/r2', { headers });
    if (res.ok) return await res.json();
  } catch {
    try {
      const headers = await getAuthHeaders();
      const fallback = await fetch('/api/admin/studio/diagnostic/storage/r2', { headers });
      if (fallback.ok) return await fallback.json();
    } catch {}
  }
  return {
    success: false,
    provider: 'Cloudflare R2 Sovereign Kathmandu Cache',
    bucket: 'nepalai-studio-media',
    status: 'unauthorized',
    readLatencyMs: 0,
    writeLatencyMs: 0,
    corsConfigured: false
  };
}
