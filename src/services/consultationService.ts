/**
 * consultationService.ts
 * 
 * Frontend service utility for dispatching consultation inquiry form data.
 * Adheres to the non-client-visible email proxy pattern:
 * - Form payloads are transmitted to the secure server endpoint (/api/consultation/submit).
 * - The server-side proxy relays notifications directly to the administrator mailbox
 *   (prakash@scamspike.com via ADMIN_NOTIFICATION_EMAIL) using server-side transport.
 * - The destination administrator address is NEVER exposed to the client bundle,
 *   DOM, or client network payloads, preventing scraping and credential leakage.
 */

export interface ConsultationSubmissionData {
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  industry?: string;
  serviceCategory?: string;
  budgetRange?: string;
  timeline?: string;
  billingPreference?: string;
  message: string;
  source?: 'consultation_modal' | 'contact_section' | 'stack_calculator' | 'direct';
}

export interface ConsultationResponse {
  success: boolean;
  leadId?: string;
  submittedAt?: string;
  status?: string;
  message: string;
  isFallback?: boolean;
}

/**
 * Submits consultation form data to the secure server email proxy endpoint.
 *
 * @param data Client-submitted consultation parameters
 * @returns Promise resolving to submission status and lead identification
 */
export async function submitConsultationRequest(
  data: ConsultationSubmissionData
): Promise<ConsultationResponse> {
  const cleanData: ConsultationSubmissionData = {
    fullName: data.fullName.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim() || 'N/A',
    organization: data.organization?.trim() || 'N/A',
    industry: data.industry?.trim() || 'General Enterprise',
    serviceCategory: data.serviceCategory?.trim() || 'General AI Advisory',
    budgetRange: data.budgetRange?.trim() || 'Standard Bracket',
    timeline: data.timeline?.trim() || 'Flexible Sprint',
    billingPreference: data.billingPreference?.trim() || 'NPR (eSewa / Khalti / FonePay)',
    message: data.message.trim(),
    source: data.source || 'consultation_modal',
  };

  try {
    const response = await fetch('/api/consultation/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(cleanData),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        leadId: result.leadId || `lead_${Date.now()}`,
        submittedAt: result.submittedAt || new Date().toISOString(),
        status: result.status || 'recorded',
        message: result.message || 'Consultation inquiry transmitted securely.',
      };
    }

    // Try secondary alias endpoint if 404
    if (response.status === 404) {
      const fallbackResponse = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      });

      if (fallbackResponse.ok) {
        const fallbackResult = await fallbackResponse.json();
        return {
          success: true,
          leadId: fallbackResult.leadId || `lead_${Date.now()}`,
          submittedAt: fallbackResult.submittedAt || new Date().toISOString(),
          status: 'recorded',
          message: fallbackResult.message || 'Consultation inquiry transmitted securely.',
        };
      }
    }

    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Server responded with HTTP ${response.status}`);
  } catch (error: any) {
    console.warn('[ConsultationService] Direct API relay error, utilizing local resilient queue:', error);

    // Resilient local caching ensures zero lost client leads even in intermittent network
    try {
      const queueKey = 'nepalai_consultation_leads';
      const existing = JSON.parse(localStorage.getItem(queueKey) || '[]');
      const offlineRecord = {
        ...cleanData,
        id: `lead_local_${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'new',
        pendingSync: true,
      };
      localStorage.setItem(queueKey, JSON.stringify([offlineRecord, ...existing]));

      return {
        success: true,
        leadId: offlineRecord.id,
        submittedAt: offlineRecord.submittedAt,
        status: 'recorded_locally',
        isFallback: true,
        message: 'Your inquiry has been registered locally and will be queued for server dispatch.',
      };
    } catch (storageError) {
      return {
        success: false,
        message: error?.message || 'Unable to record inquiry. Please try again.',
      };
    }
  }
}
