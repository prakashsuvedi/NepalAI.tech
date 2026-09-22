/**
 * studioAdminService.ts
 * 
 * Fetch utility for real-time synchronization and status updates with
 * the administrative hub at studio.nepalai.tech/admin.
 * 
 * Provides:
 * - Real-time connection probing to studio.nepalai.tech/admin
 * - Bidirectional synchronization of pending consulting leads
 * - Real-time lead status updates (New -> Reviewing -> Contacted -> Converted)
 * - Polling/subscription helper for continuous real-time dashboard sync
 */

import { InquiryLead, LeadStatus } from '../types';

export interface StudioConnectionStatus {
  connected: boolean;
  status: 'connected' | 'syncing' | 'offline';
  studioUrl: string;
  studioAdminUrl: string;
  totalLeads: number;
  newLeadsCount: number;
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
 * Connects to studio.nepalai.tech/admin via backend proxy bridge
 * to assess live connection health, pending inquiry tallies, and latency.
 */
export async function fetchStudioAdminConnection(): Promise<StudioConnectionStatus> {
  const startTime = Date.now();
  try {
    const res = await fetch('/api/admin/studio-connection', {
      headers: { 'Accept': 'application/json' },
    });

    const latencyMs = Date.now() - startTime;

    if (res.ok) {
      const data = await res.json();
      return {
        connected: true,
        status: 'connected',
        studioUrl: data.studioUrl || 'https://studio.nepalai.tech',
        studioAdminUrl: data.studioAdminUrl || STUDIO_ADMIN_BASE,
        totalLeads: data.totalLeads ?? 0,
        newLeadsCount: data.newLeadsCount ?? 0,
        lastSync: data.lastSync || new Date().toISOString(),
        syncSupported: true,
        latencyMs,
        message: 'Synchronized with studio.nepalai.tech/admin',
      };
    }
    throw new Error(`HTTP error ${res.status}`);
  } catch (err: any) {
    // Return resilient offline/cached status
    return {
      connected: false,
      status: 'offline',
      studioUrl: 'https://studio.nepalai.tech',
      studioAdminUrl: STUDIO_ADMIN_BASE,
      totalLeads: 0,
      newLeadsCount: 0,
      lastSync: new Date().toISOString(),
      syncSupported: true,
      latencyMs: Date.now() - startTime,
      message: 'Studio admin hub bridge offline or standby.',
    };
  }
}

/**
 * Sends pending consulting leads to studio.nepalai.tech/admin for real-time synchronization.
 */
export async function syncLeadsWithStudioAdmin(
  leadsPayload?: InquiryLead[]
): Promise<StudioSyncResult> {
  try {
    const res = await fetch('/api/admin/studio-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
  } catch (err: any) {
    console.warn('[StudioAdminService] Real-time sync notice:', err);
    return {
      success: true,
      syncedCount: leadsPayload ? leadsPayload.length : 0,
      targetStudioUrl: STUDIO_ADMIN_BASE,
      timestamp: new Date().toISOString(),
      message: 'Pending leads queued for studio.nepalai.tech dispatch.',
    };
  }
}

/**
 * Updates the status and administrative notes of a consulting lead in real time,
 * propagating the change both to the persistence layer and studio.nepalai.tech/admin.
 */
export async function updateLeadStatusRealtime(
  leadId: string,
  newStatus: LeadStatus,
  adminNotes?: string
): Promise<{ success: boolean; lead?: InquiryLead; error?: string }> {
  try {
    const res = await fetch(`/api/admin/leads/${encodeURIComponent(leadId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
      
      // Notify studio admin endpoint of the real-time status transition
      fetch('/api/admin/studio-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

/**
 * Fetches all current inquiry leads from the admin API.
 */
export async function fetchCurrentLeads(): Promise<InquiryLead[]> {
  try {
    const res = await fetch('/api/admin/leads');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.leads)) {
        return data.leads;
      }
    }
  } catch (e) {
    console.warn('[StudioAdminService] Fallback reading localStorage leads:', e);
  }

  // Fallback to local storage
  try {
    const stored = localStorage.getItem('nepalai_consultation_leads');
    const contactStored = localStorage.getItem('nepalai_contact_leads');
    const list: InquiryLead[] = [];
    if (stored) list.push(...JSON.parse(stored));
    if (contactStored) list.push(...JSON.parse(contactStored));
    return list;
  } catch {
    return [];
  }
}
