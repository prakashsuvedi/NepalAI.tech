import React, { useEffect, useState } from 'react';
import { BellRing, Trash2, Play, Plus } from 'lucide-react';
import { Language, ThemeMode } from '../../types';
import { TREND_CATEGORIES, isValidWhatsappNumber } from '../../utils/trendsEngine';
import { useToast } from '../../context/ToastContext';

interface VelocityAlertDto {
  id: string;
  email: string;
  keywordFilter?: string | null;
  category: string;
  country: string;
  minVelocityScore: number;
  minVelocityDelta: number;
  deliveryChannel?: string;
  whatsappNumber?: string | null;
  whatsappWebhookUrl?: string | null;
  isActive: boolean;
  cooldownMinutes: number;
  lastTriggeredAt?: string | null;
  lastTriggeredKeyword?: string | null;
  lastTriggeredScore?: number | null;
  triggerCount: number;
}

interface VelocityThresholdAlertsProps {
  theme: ThemeMode;
  language: Language;
  ownerKey: string;
  defaultKeyword?: string;
  defaultCategory?: string;
}

export const VelocityThresholdAlerts: React.FC<VelocityThresholdAlertsProps> = ({
  theme,
  language,
  ownerKey,
  defaultKeyword = '',
  defaultCategory = 'all',
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';
  const { showToast } = useToast();

  const [alerts, setAlerts] = useState<VelocityAlertDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [smtpConfigured, setSmtpConfigured] = useState<boolean>(false);
  const [whatsappRelayConfigured, setWhatsappRelayConfigured] = useState<boolean>(false);
  const [waRelayMode, setWaRelayMode] = useState<string>('unconfigured');

  const [email, setEmail] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('nepalai_daily_insights_email') || '';
  });
  const [deliveryChannel, setDeliveryChannel] = useState<'email' | 'whatsapp' | 'both'>('whatsapp');
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('nepalai_whatsapp_number') || '';
  });
  const [whatsappWebhookUrl, setWhatsappWebhookUrl] = useState<string>('');
  const [keywordFilter, setKeywordFilter] = useState<string>(defaultKeyword);
  const [category, setCategory] = useState<string>(defaultCategory);
  const [minVelocityScore, setMinVelocityScore] = useState<number>(75);
  const [minVelocityDelta, setMinVelocityDelta] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);
  const [testingWa, setTestingWa] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [lastEvalSummary, setLastEvalSummary] = useState<string | null>(null);
  const [showWaLogs, setShowWaLogs] = useState<boolean>(false);
  const [waLogs, setWaLogs] = useState<
    Array<{
      id: string;
      sourceType: string;
      recipientNumber: string;
      deliveryStatus: string;
      httpStatus?: number | null;
      payloadPreview: string;
      createdAt: string;
    }>
  >([]);

  useEffect(() => {
    setKeywordFilter(defaultKeyword);
  }, [defaultKeyword]);

  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/alerts/thresholds?ownerKey=${encodeURIComponent(ownerKey)}`);
      const data = await resp.json();
      if (resp.ok && data.success) {
        setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
        setSmtpConfigured(Boolean(data.smtpConfigured));
        setWhatsappRelayConfigured(Boolean(data.whatsappRelayConfigured));
        if (typeof data.activeMode === 'string') setWaRelayMode(data.activeMode);
      }
    } catch {
      // Ignore transient errors cleanly
    } finally {
      setLoading(false);
    }
  };

  const loadWhatsappLogs = async () => {
    try {
      const resp = await fetch('/api/alerts/whatsapp/logs');
      const data = await resp.json();
      if (resp.ok && data.success && Array.isArray(data.logs)) {
        setWaLogs(data.logs.slice(0, 6));
      }
    } catch {
      // Ignore transient errors
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [ownerKey]);

  const surfaceCard = isDark
    ? 'border-slate-800 bg-[#0b1220] text-slate-100'
    : 'border-slate-200 bg-white text-slate-900 shadow-2xs';

  const inputClass = isDark
    ? 'border-slate-700 bg-[#080d1a] text-white placeholder:text-slate-400 focus:border-cyan-400'
    : 'border-slate-300 bg-white text-slate-950 placeholder:text-slate-500 focus:border-cyan-600';

  const needsWhatsapp = deliveryChannel === 'whatsapp' || deliveryChannel === 'both';
  const needsEmail = deliveryChannel === 'email' || deliveryChannel === 'both';

  const handleTestWhatsapp = async () => {
    if (!isValidWhatsappNumber(whatsappNumber)) {
      showToast('Enter a valid E.164 WhatsApp number (e.g. +97798XXXXXXXX).', 'error');
      return;
    }
    setTestingWa(true);
    try {
      const resp = await fetch('/api/alerts/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsappNumber: whatsappNumber.trim(),
          whatsappWebhookUrl: whatsappWebhookUrl.trim() || null,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.error || 'WhatsApp test failed');
      setWhatsappRelayConfigured(Boolean(data.whatsappRelayConfigured));
      if (typeof data.activeMode === 'string') setWaRelayMode(data.activeMode);
      const statusMsg = data.dispatch?.delivered
        ? `WhatsApp alert delivered via ${data.dispatch.targetMode} to ${data.dispatch.normalizedRecipient}.`
        : `WhatsApp test queued (${data.dispatch?.deliveryStatus}) for ${data.dispatch?.normalizedRecipient}.`;
      setLastEvalSummary(statusMsg);
      showToast(statusMsg, data.dispatch?.delivered ? 'success' : 'info');
      loadWhatsappLogs();
    } catch (err: any) {
      showToast(err?.message || 'Unable to test WhatsApp relay', 'error');
    } finally {
      setTestingWa(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showToast(isNe ? 'मान्य इमेल राख्नुहोस्।' : 'Please enter a valid alert email.', 'error');
      return;
    }
    if (needsWhatsapp && !isValidWhatsappNumber(whatsappNumber)) {
      showToast('Enter a valid E.164 WhatsApp number (e.g. +97798XXXXXXXX).', 'error');
      return;
    }
    setSaving(true);
    try {
      const resp = await fetch('/api/alerts/thresholds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim() || undefined,
          ownerKey,
          keywordFilter: keywordFilter.trim() || null,
          category,
          country: 'NP',
          minVelocityScore,
          minVelocityDelta,
          deliveryChannel,
          whatsappNumber: needsWhatsapp ? whatsappNumber.trim() : null,
          whatsappWebhookUrl: needsWhatsapp && whatsappWebhookUrl.trim() ? whatsappWebhookUrl.trim() : null,
          triggerInstantCheck: true,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.error || 'Could not save alert rule');
      if (typeof window !== 'undefined') {
        if (email.trim()) {
          window.localStorage.setItem('nepalai_daily_insights_email', email.trim().toLowerCase());
        }
        if (data.alert?.whatsappNumber) {
          window.localStorage.setItem('nepalai_whatsapp_number', data.alert.whatsappNumber);
        }
      }
      setAlerts((prev) => [data.alert, ...prev]);
      setSmtpConfigured(Boolean(data.smtpConfigured));
      setWhatsappRelayConfigured(Boolean(data.whatsappRelayConfigured));
      if (typeof data.activeMode === 'string') setWaRelayMode(data.activeMode);

      if (data.instantEval?.triggeredRules > 0) {
        const top = data.instantEval.matches?.[0];
        const instantMsg = `Rule saved & matched immediately: ${top?.topKeyword} (${top?.topScore}/100) · WhatsApp sent: ${data.instantEval.whatsappDelivered || 0}`;
        setLastEvalSummary(instantMsg);
        showToast(instantMsg, 'success');
        loadWhatsappLogs();
      } else {
        showToast(
          isNe ? 'वेग थ्रेसहोल्ड अलर्ट सुरक्षित भयो।' : 'Velocity threshold alert rule saved.',
          'success'
        );
      }
    } catch (err: any) {
      showToast(err?.message || 'Unable to save threshold alert', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRule = async (rule: VelocityAlertDto) => {
    try {
      const resp = await fetch(`/api/alerts/thresholds/${encodeURIComponent(rule.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerKey, isActive: !rule.isActive }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setAlerts((prev) => prev.map((r) => (r.id === rule.id ? data.alert : r)));
      }
    } catch {
      showToast('Failed to update rule state.', 'error');
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const resp = await fetch(
        `/api/alerts/thresholds/${encodeURIComponent(id)}?ownerKey=${encodeURIComponent(ownerKey)}`,
        { method: 'DELETE' }
      );
      if (resp.ok) {
        setAlerts((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      showToast('Failed to delete rule.', 'error');
    }
  };

  const handleEvaluateNow = async () => {
    setEvaluating(true);
    try {
      const resp = await fetch('/api/alerts/thresholds/evaluate', { method: 'POST' });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.error || 'Evaluation failed');
      setSmtpConfigured(Boolean(data.smtpConfigured));
      setWhatsappRelayConfigured(Boolean(data.whatsappRelayConfigured));
      if (data.triggeredRules > 0) {
        const topMatch = data.matches?.[0];
        const totalDelivered = (data.emailsDelivered || 0) + (data.whatsappDelivered || 0);
        const summaryText =
          totalDelivered > 0
            ? `Triggered ${data.triggeredRules} rule(s) (SMTP: ${data.emailsDelivered || 0}, WhatsApp: ${data.whatsappDelivered || 0} · top: ${topMatch?.topKeyword} @ ${topMatch?.topScore}/100).`
            : `Matched ${data.triggeredRules} threshold rule(s) (top: ${topMatch?.topKeyword} @ ${topMatch?.topScore}/100). Configure SMTP or WhatsApp webhook env vars for live delivery.`;
        setLastEvalSummary(summaryText);
        showToast(summaryText, totalDelivered > 0 ? 'success' : 'info');
        loadAlerts();
      } else {
        const noneText = `Checked ${data.evaluatedRules} active rule(s): no current keywords exceed configured thresholds.`;
        setLastEvalSummary(noneText);
        showToast(noneText, 'info');
      }
    } catch (err: any) {
      showToast(err?.message || 'Threshold check failed', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${surfaceCard}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400">
            <BellRing className="h-4 w-4 shrink-0" />
            <span>{isNe ? 'वेग थ्रेसहोल्ड अलर्ट' : 'Velocity Threshold Alerts'}</span>
          </div>
          <h3 className={`text-base font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-950'}`}>
            {isNe ? 'किबोर्ड गति सीमा अलर्ट राख्नुहोस्' : 'Set Custom Velocity Thresholds'}
          </h3>
        </div>
      </div>

      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        {isNe
          ? 'कुनै विषय वा वर्गको खोज गति सीमाभन्दा माथि गएमा SMTP इमेल वा WhatsApp वेबहुक मार्फत अलर्ट पठाउँछ।'
          : 'Background monitor checks live keyword velocity against your saved rules and relays alerts via SMTP email and/or WhatsApp Business webhook.'}
      </p>

      <form onSubmit={handleCreateRule} className="space-y-3">
        {/* Channel Toggle: WhatsApp / SMTP + WA / Email */}
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { id: 'whatsapp', label: 'WhatsApp' },
            { id: 'both', label: 'SMTP + WA' },
            { id: 'email', label: 'SMTP Email' },
          ] as const).map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => setDeliveryChannel(ch.id)}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors ${
                deliveryChannel === ch.id
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                    : 'bg-cyan-600 text-white border-cyan-600'
                  : isDark
                    ? 'border-slate-800 text-slate-300 hover:border-slate-700'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {needsWhatsapp && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+9779841000000 (WhatsApp E.164)"
                className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono outline-hidden ${inputClass}`}
                aria-label="Threshold alert WhatsApp number"
              />
              <button
                type="button"
                onClick={handleTestWhatsapp}
                disabled={testingWa || !whatsappNumber.trim()}
                className={`px-3 py-2 rounded-xl border text-[11px] font-semibold cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50 ${
                  isDark
                    ? 'border-slate-700 text-cyan-300 hover:border-cyan-400'
                    : 'border-slate-300 text-cyan-700 hover:border-cyan-600'
                }`}
              >
                {testingWa ? 'Pinging...' : 'Test WA'}
              </button>
            </div>
            <input
              type="url"
              value={whatsappWebhookUrl}
              onChange={(e) => setWhatsappWebhookUrl(e.target.value)}
              placeholder="Optional webhook override (default: WHATSAPP_PHONE_NUMBER_ID Cloud API)"
              className={`w-full px-3 py-1.5 rounded-xl border text-[11px] font-mono outline-hidden ${inputClass}`}
              aria-label="Threshold alert custom WhatsApp webhook URL"
            />
          </div>
        )}

        {needsEmail && (
          <div>
            <label className="sr-only" htmlFor="threshold-alert-email">
              Notification email
            </label>
            <input
              id="threshold-alert-email"
              type="email"
              required={needsEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alerts@company.com.np"
              className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-hidden ${inputClass}`}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="sr-only" htmlFor="threshold-keyword-filter">
              Keyword filter
            </label>
            <input
              id="threshold-keyword-filter"
              type="text"
              value={keywordFilter}
              onChange={(e) => setKeywordFilter(e.target.value)}
              placeholder={isNe ? 'किबोर्ड (ऐच्छिक)' : 'Keyword (optional)'}
              className={`w-full px-3 py-2 rounded-xl border text-xs outline-hidden ${inputClass}`}
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="threshold-category">
              Category filter
            </label>
            <select
              id="threshold-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-xs font-medium outline-hidden ${inputClass}`}
            >
              <option value="all">{isNe ? 'सबै वर्गहरू' : 'All Categories'}</option>
              {TREND_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {isNe ? c.labelNe : c.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Min Velocity Threshold Slider */}
        <div
          className={`p-3 rounded-xl border space-y-2 ${
            isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              {isNe ? 'न्यूनतम गति सीमा' : 'Alert when Velocity ≥'}
            </span>
            <span className="font-mono tabular-nums font-bold text-cyan-600 dark:text-cyan-400">
              {minVelocityScore} / 100
            </span>
          </div>
          <input
            type="range"
            min={30}
            max={98}
            step={1}
            value={minVelocityScore}
            onChange={(e) => setMinVelocityScore(Number(e.target.value))}
            className="w-full accent-cyan-600 cursor-pointer"
            aria-label="Minimum velocity threshold"
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Min traffic jump:
            </span>
            <select
              value={minVelocityDelta}
              onChange={(e) => setMinVelocityDelta(Number(e.target.value))}
              className={`px-2 py-1 rounded-lg border text-[11px] font-mono outline-hidden ${inputClass}`}
              aria-label="Minimum traffic delta"
            >
              <option value={0}>Any delta</option>
              <option value={5000}>+5,000+ surge</option>
              <option value={20000}>+20,000+ breakout</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2 px-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{saving ? 'Saving...' : isNe ? 'अलर्ट नियम थप्नुहोस्' : 'Save Threshold Alert'}</span>
          </button>

          <button
            type="button"
            onClick={handleEvaluateNow}
            disabled={evaluating || alerts.length === 0}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50 ${
              isDark
                ? 'border-slate-700 text-slate-200 hover:border-cyan-400'
                : 'border-slate-300 text-slate-800 hover:border-cyan-600'
            }`}
          >
            <Play className="h-3 w-3 text-cyan-500" />
            <span>{evaluating ? 'Checking...' : 'Check Now'}</span>
          </button>
        </div>
      </form>

      {lastEvalSummary && (
        <div
          className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
            isDark ? 'border-slate-700 bg-[#080d1a] text-cyan-200' : 'border-cyan-200 bg-cyan-50 text-cyan-950'
          }`}
        >
          {lastEvalSummary}
        </div>
      )}

      {/* Saved Threshold Rules */}
      {!loading && alerts.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Saved Rules ({alerts.length})</span>
            <span>
              {smtpConfigured ? 'SMTP Live' : 'SMTP Queue'} ·{' '}
              {waRelayMode === 'meta_cloud_api'
                ? 'Meta Cloud API'
                : whatsappRelayConfigured
                  ? 'WA Webhook'
                  : 'WA Audit'}
            </span>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {alerts.map((rule) => {
              const catName =
                rule.category === 'all'
                  ? 'All Categories'
                  : TREND_CATEGORIES.find((c) => c.slug === rule.category)?.labelEn || rule.category;
              const channelLabel =
                rule.deliveryChannel === 'both'
                  ? 'SMTP+WA'
                  : rule.deliveryChannel === 'whatsapp'
                    ? 'WA'
                    : 'SMTP';
              return (
                <div key={rule.id} className="py-2.5 flex items-start justify-between gap-2 text-xs">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="font-semibold truncate">
                      {rule.keywordFilter ? `"${rule.keywordFilter}"` : catName}{' '}
                      <span className="font-mono text-cyan-600 dark:text-cyan-400">
                        ≥ {rule.minVelocityScore}/100 · {channelLabel}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {rule.email}
                      {rule.whatsappNumber ? ` · ${rule.whatsappNumber}` : ''}
                      {rule.lastTriggeredKeyword
                        ? ` · Fired: ${rule.lastTriggeredKeyword} (${rule.lastTriggeredScore}/100)`
                        : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={rule.isActive}
                      aria-label="Toggle threshold alert"
                      onClick={() => handleToggleRule(rule)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        rule.isActive ? 'bg-cyan-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                          rule.isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                      aria-label="Delete threshold alert"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                const next = !showWaLogs;
                setShowWaLogs(next);
                if (next) loadWhatsappLogs();
              }}
              className="text-[11px] font-mono font-semibold text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              {showWaLogs ? 'Hide WhatsApp Relay Logs ↑' : 'Inspect WhatsApp Relay Audit Logs ↓'}
            </button>

            {showWaLogs && (
              <div className="mt-2 space-y-1.5">
                {waLogs.length === 0 ? (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    No WhatsApp relay dispatches logged yet.
                  </p>
                ) : (
                  waLogs.map((lg) => (
                    <div
                      key={lg.id}
                      className={`p-2 rounded-lg border text-[11px] font-mono space-y-0.5 ${
                        isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold">{lg.recipientNumber}</span>
                        <span
                          className={
                            lg.deliveryStatus === 'sent'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : lg.deliveryStatus === 'failed'
                                ? 'text-red-500'
                                : 'text-amber-600 dark:text-amber-400'
                          }
                        >
                          {lg.deliveryStatus}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {lg.sourceType} · {lg.payloadPreview}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

