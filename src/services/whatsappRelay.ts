import crypto from 'crypto';
import { normalizeWhatsappNumber, isValidWhatsappNumber } from '../utils/trendsEngine.ts';
import { recordWhatsappDeliveryLog } from '../db/trends.ts';

export interface WhatsappDispatchInput {
  sourceType: 'daily_digest' | 'velocity_threshold' | 'test_ping';
  referenceId?: string | null;
  recipientNumber: string;
  messageText: string;
  webhookOverrideUrl?: string | null;
  metadata?: Record<string, unknown>;
}

export interface WhatsappDispatchResult {
  delivered: boolean;
  deliveryStatus: 'sent' | 'queued_no_webhook' | 'failed';
  targetMode: 'custom_webhook' | 'env_webhook' | 'meta_cloud_api' | 'unconfigured';
  httpStatus?: number | null;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  normalizedRecipient: string;
}

export function getWhatsappRelayCapabilities() {
  const hasMetaCloud = Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN?.trim() && process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
  );
  const hasWebhook = Boolean(process.env.WHATSAPP_WEBHOOK_URL?.trim());
  const activeMode = hasMetaCloud
    ? 'meta_cloud_api'
    : hasWebhook
      ? 'webhook_relay'
      : 'unconfigured';
  return {
    whatsappRelayConfigured: hasMetaCloud || hasWebhook,
    hasMetaCloud,
    hasWebhook,
    phoneNumberIdConfigured: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()),
    activeMode,
  };
}

export function verifyWhatsappWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader?: string
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();
  if (!appSecret) return true; // Verification optional when secret not set
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;
  const expected = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');
  const provided = signatureHeader.slice(7).trim();
  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(provided, 'utf8'));
}

function isAllowedHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

async function sendViaWebhookTarget(
  targetUrl: string,
  targetMode: 'custom_webhook' | 'env_webhook',
  normalizedRecipient: string,
  input: WhatsappDispatchInput
): Promise<WhatsappDispatchResult> {
  const payload = {
    event: 'nepalai.trends.whatsapp_alert',
    sourceType: input.sourceType,
    referenceId: input.referenceId || null,
    to: normalizedRecipient,
    message: input.messageText,
    timestamp: new Date().toISOString(),
    metadata: input.metadata || {},
  };
  const bodyString = JSON.stringify(payload);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'NepalAI-Trends-Relay/1.0',
  };
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET?.trim();
  if (secret) {
    const signature = crypto
      .createHmac('sha256', secret)
      .update(bodyString)
      .digest('hex');
    headers['X-NepalAI-Signature'] = `sha256=${signature}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: bodyString,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const delivered = resp.ok;
    const deliveryStatus = delivered ? 'sent' : 'failed';
    const errorMessage = delivered ? null : `Webhook returned HTTP ${resp.status}`;

    await recordWhatsappDeliveryLog({
      sourceType: input.sourceType,
      referenceId: input.referenceId || null,
      recipientNumber: normalizedRecipient,
      webhookTarget: targetUrl,
      payloadPreview: input.messageText.slice(0, 320),
      deliveryStatus,
      httpStatus: resp.status,
      errorMessage,
    });

    return {
      delivered,
      deliveryStatus,
      targetMode,
      httpStatus: resp.status,
      errorMessage,
      normalizedRecipient,
    };
  } catch (err: any) {
    const errorMessage = err?.message || 'WhatsApp webhook request failed';
    await recordWhatsappDeliveryLog({
      sourceType: input.sourceType,
      referenceId: input.referenceId || null,
      recipientNumber: normalizedRecipient,
      webhookTarget: targetUrl,
      payloadPreview: input.messageText.slice(0, 320),
      deliveryStatus: 'failed',
      httpStatus: null,
      errorMessage,
    });
    return {
      delivered: false,
      deliveryStatus: 'failed',
      targetMode,
      httpStatus: null,
      errorMessage,
      normalizedRecipient,
    };
  }
}

export async function dispatchWhatsappAlertMessage(
  input: WhatsappDispatchInput
): Promise<WhatsappDispatchResult> {
  const normalizedRecipient = normalizeWhatsappNumber(input.recipientNumber);
  if (!isValidWhatsappNumber(normalizedRecipient)) {
    const err = 'Invalid WhatsApp E.164 number (example: +9779841000000).';
    await recordWhatsappDeliveryLog({
      sourceType: input.sourceType,
      referenceId: input.referenceId || null,
      recipientNumber: input.recipientNumber || 'invalid',
      webhookTarget: 'validation',
      payloadPreview: input.messageText.slice(0, 320),
      deliveryStatus: 'failed',
      httpStatus: 400,
      errorMessage: err,
    });
    return {
      delivered: false,
      deliveryStatus: 'failed',
      targetMode: 'unconfigured',
      httpStatus: 400,
      errorMessage: err,
      normalizedRecipient: input.recipientNumber,
    };
  }

  const overrideUrl = input.webhookOverrideUrl?.trim() || '';
  const envWebhookUrl = process.env.WHATSAPP_WEBHOOK_URL?.trim() || '';
  const metaToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() || '';
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || '';

  // Priority 1: Explicit per-rule custom webhook override URL
  if (overrideUrl && isAllowedHttpUrl(overrideUrl)) {
    return sendViaWebhookTarget(overrideUrl, 'custom_webhook', normalizedRecipient, input);
  }

  // Priority 2: Official Meta WhatsApp Business Cloud API (WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN)
  if (metaToken && metaPhoneId) {
    const graphUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(metaPhoneId)}/messages`;
    const toDigits = normalizedRecipient.replace(/^\+/, '');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const resp = await fetch(graphUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: toDigits,
          type: 'text',
          text: {
            preview_url: true,
            body: input.messageText.slice(0, 3800),
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const respJson: any = await resp.json().catch(() => null);
      const providerMessageId = Array.isArray(respJson?.messages)
        ? String(respJson.messages[0]?.id || '')
        : null;
      const delivered = resp.ok;
      const deliveryStatus = delivered ? 'sent' : 'failed';
      const errorMessage = delivered
        ? null
        : respJson?.error?.message || `Meta Cloud API HTTP ${resp.status}`;

      await recordWhatsappDeliveryLog({
        sourceType: input.sourceType,
        referenceId: input.referenceId || null,
        recipientNumber: normalizedRecipient,
        webhookTarget: `meta_cloud:${metaPhoneId}`,
        payloadPreview: input.messageText.slice(0, 320),
        deliveryStatus,
        httpStatus: resp.status,
        errorMessage,
      });

      return {
        delivered,
        deliveryStatus,
        targetMode: 'meta_cloud_api',
        httpStatus: resp.status,
        providerMessageId,
        errorMessage,
        normalizedRecipient,
      };
    } catch (err: any) {
      const errorMessage = err?.message || 'Meta Cloud API request failed';
      await recordWhatsappDeliveryLog({
        sourceType: input.sourceType,
        referenceId: input.referenceId || null,
        recipientNumber: normalizedRecipient,
        webhookTarget: `meta_cloud:${metaPhoneId}`,
        payloadPreview: input.messageText.slice(0, 320),
        deliveryStatus: 'failed',
        httpStatus: null,
        errorMessage,
      });
      return {
        delivered: false,
        deliveryStatus: 'failed',
        targetMode: 'meta_cloud_api',
        httpStatus: null,
        errorMessage,
        normalizedRecipient,
      };
    }
  }

  // Priority 3: Global signed webhook relay (WHATSAPP_WEBHOOK_URL)
  if (envWebhookUrl && isAllowedHttpUrl(envWebhookUrl)) {
    return sendViaWebhookTarget(envWebhookUrl, 'env_webhook', normalizedRecipient, input);
  }

  // Fallback: Audit queue record when neither WHATSAPP_PHONE_NUMBER_ID+WHATSAPP_ACCESS_TOKEN nor WHATSAPP_WEBHOOK_URL is configured
  await recordWhatsappDeliveryLog({
    sourceType: input.sourceType,
    referenceId: input.referenceId || null,
    recipientNumber: normalizedRecipient,
    webhookTarget: 'queued_unconfigured',
    payloadPreview: input.messageText.slice(0, 320),
    deliveryStatus: 'queued_no_webhook',
    httpStatus: null,
    errorMessage:
      'Configure WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN or WHATSAPP_WEBHOOK_URL for live WhatsApp delivery.',
  });

  return {
    delivered: false,
    deliveryStatus: 'queued_no_webhook',
    targetMode: 'unconfigured',
    httpStatus: null,
    errorMessage: null,
    normalizedRecipient,
  };
}
