import React, { useEffect, useState } from 'react';
import { Mail, Eye, Send, CheckCircle2, Globe, MessageSquare } from 'lucide-react';
import { Language, ThemeMode } from '../../types';
import { TREND_CATEGORIES, isValidWhatsappNumber } from '../../utils/trendsEngine';
import { useToast } from '../../context/ToastContext';

interface DailyInsightsSubscriptionProps {
  theme: ThemeMode;
  language: Language;
  defaultCategories?: string[];
}

export const DailyInsightsSubscription: React.FC<DailyInsightsSubscriptionProps> = ({
  theme,
  language,
  defaultCategories = ['technology-ai', 'business-finance'],
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';
  const { showToast } = useToast();

  const [email, setEmail] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('nepalai_daily_insights_email') || '';
  });
  const [insightsEnabled, setInsightsEnabled] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [cadence, setCadence] = useState<'daily' | 'breaking'>('daily');
  const [preferredLanguage, setPreferredLanguage] = useState<'bilingual' | 'en' | 'ne'>(
    isNe ? 'ne' : 'bilingual'
  );
  const [deliveryChannel, setDeliveryChannel] = useState<'email' | 'whatsapp' | 'both'>('email');
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('nepalai_whatsapp_number') || '';
  });
  const [whatsappWebhookUrl, setWhatsappWebhookUrl] = useState<string>('');

  const [smtpConfigured, setSmtpConfigured] = useState<boolean>(false);
  const [whatsappRelayConfigured, setWhatsappRelayConfigured] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [sendingNow, setSendingNow] = useState<boolean>(false);
  const [testingWa, setTestingWa] = useState<boolean>(false);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<{ subject: string; text: string; matchedCount: number } | null>(null);
  const [activeSubInfo, setActiveSubInfo] = useState<{
    email: string;
    deliveryMode: string;
    deliveryChannel?: string;
    whatsappNumber?: string;
    unsubscribeUrl?: string;
  } | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const qs = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : '';
        const resp = await fetch(`/api/alerts/status${qs}`);
        const data = await resp.json();
        if (resp.ok && data.success) {
          setSmtpConfigured(Boolean(data.smtpConfigured));
          setWhatsappRelayConfigured(Boolean(data.whatsappRelayConfigured));
          if (data.subscription) {
            setInsightsEnabled(Boolean(data.subscription.isVerified));
            if (Array.isArray(data.subscription.categories) && data.subscription.categories.length > 0) {
              setCategories(data.subscription.categories);
            }
            if (data.subscription.cadence === 'breaking' || data.subscription.cadence === 'daily') {
              setCadence(data.subscription.cadence);
            }
            if (
              data.subscription.preferredLanguage === 'en' ||
              data.subscription.preferredLanguage === 'ne' ||
              data.subscription.preferredLanguage === 'bilingual'
            ) {
              setPreferredLanguage(data.subscription.preferredLanguage);
            }
            if (
              data.subscription.deliveryChannel === 'email' ||
              data.subscription.deliveryChannel === 'whatsapp' ||
              data.subscription.deliveryChannel === 'both'
            ) {
              setDeliveryChannel(data.subscription.deliveryChannel);
            }
            if (data.subscription.whatsappNumber) {
              setWhatsappNumber(data.subscription.whatsappNumber);
            }
            if (data.subscription.whatsappWebhookUrl) {
              setWhatsappWebhookUrl(data.subscription.whatsappWebhookUrl);
            }
            if (data.subscription.isVerified) {
              setActiveSubInfo({
                email: data.subscription.email,
                deliveryMode: data.smtpConfigured ? 'smtp_confirmed' : 'saved_digest_queue',
                deliveryChannel: data.subscription.deliveryChannel || 'email',
                whatsappNumber: data.subscription.whatsappNumber || '',
              });
            }
          }
        }
      } catch {
        // Ignore transient status lookup errors
      }
    };

    checkStatus();
  }, []);

  const surfaceCard = isDark
    ? 'border-slate-800 bg-[#0b1220] text-slate-100'
    : 'border-slate-200 bg-white text-slate-900 shadow-2xs';

  const inputClass = isDark
    ? 'border-slate-700 bg-[#080d1a] text-white placeholder:text-slate-400 focus:border-cyan-400'
    : 'border-slate-300 bg-white text-slate-950 placeholder:text-slate-500 focus:border-cyan-600';

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const needsWhatsapp = deliveryChannel === 'whatsapp' || deliveryChannel === 'both';

  const saveSubscription = async (targetEmail: string) => {
    if (needsWhatsapp && !isValidWhatsappNumber(whatsappNumber)) {
      showToast('Enter a valid E.164 WhatsApp number (e.g. +97798XXXXXXXX).', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch('/api/alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail.trim(),
          categories,
          cadence,
          preferredLanguage,
          countryFilter: 'NP',
          deliveryChannel,
          whatsappNumber: needsWhatsapp ? whatsappNumber.trim() : null,
          whatsappWebhookUrl: needsWhatsapp && whatsappWebhookUrl.trim() ? whatsappWebhookUrl.trim() : null,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Failed to activate Daily Insights');
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('nepalai_daily_insights_email', data.subscription.email);
        if (data.subscription.whatsappNumber) {
          window.localStorage.setItem('nepalai_whatsapp_number', data.subscription.whatsappNumber);
        }
      }
      setSmtpConfigured(Boolean(data.smtpConfigured));
      setWhatsappRelayConfigured(Boolean(data.whatsappRelayConfigured));
      setInsightsEnabled(true);
      setActiveSubInfo({
        email: data.subscription.email,
        deliveryMode: data.deliveryMode,
        deliveryChannel: data.subscription.deliveryChannel,
        whatsappNumber: data.subscription.whatsappNumber,
        unsubscribeUrl: data.subscription.unsubscribeUrl,
      });
      showToast(
        isNe ? 'दैनिक एआई इन्साइट्स सदस्यता सक्रिय गरियो!' : 'Subscribed to Daily Insights!',
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Unable to save subscription', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleDailyInsights = async () => {
    const nextState = !insightsEnabled;

    if (nextState) {
      if (!isValidEmail(email)) {
        setInsightsEnabled(true);
        showToast(
          isNe
            ? 'कृपया तल आफ्नो इमेल ठेगाना लेखेर सुरक्षित गर्नुहोस्।'
            : 'Enter your email address below and save to activate alerts.',
          'info'
        );
        return;
      }
      await saveSubscription(email);
    } else {
      setInsightsEnabled(false);
      if (isValidEmail(email)) {
        try {
          await fetch('/api/alerts/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() }),
          });
          setActiveSubInfo(null);
          showToast(
            isNe ? 'दैनिक इन्साइट्स अलर्ट रोकिएको छ।' : 'Daily Insights alerts paused.',
            'info'
          );
        } catch {
          showToast('Could not update subscription preference.', 'error');
        }
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      showToast(isNe ? 'मान्य इमेल ठेगाना राख्नुहोस्।' : 'Please enter a valid email address.', 'error');
      return;
    }
    await saveSubscription(email);
  };

  const handlePreviewDigest = async () => {
    setPreviewLoading(true);
    try {
      const resp = await fetch('/api/alerts/digest-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories, cadence, preferredLanguage }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.error || 'Preview unavailable');
      setPreview({
        subject: data.subject,
        text: data.text,
        matchedCount: data.matchedCount,
      });
    } catch (err: any) {
      showToast(err?.message || 'Unable to preview digest', 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSendInstantDigest = async () => {
    if (!isValidEmail(email)) {
      showToast(isNe ? 'पहिले मान्य इमेल राख्नुहोस्।' : 'Enter a valid email address first.', 'error');
      return;
    }
    if (needsWhatsapp && !isValidWhatsappNumber(whatsappNumber)) {
      showToast('Enter a valid E.164 WhatsApp number (e.g. +97798XXXXXXXX).', 'error');
      return;
    }
    setSendingNow(true);
    try {
      const resp = await fetch('/api/alerts/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          categories,
          cadence,
          preferredLanguage,
          deliveryChannel,
          whatsappNumber: needsWhatsapp ? whatsappNumber.trim() : null,
          whatsappWebhookUrl: needsWhatsapp && whatsappWebhookUrl.trim() ? whatsappWebhookUrl.trim() : null,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.error || 'Failed to send digest');
      setSmtpConfigured(Boolean(data.smtpConfigured));
      setWhatsappRelayConfigured(Boolean(data.whatsappRelayConfigured));
      setInsightsEnabled(true);
      setActiveSubInfo({
        email: email.trim().toLowerCase(),
        deliveryMode: data.deliveryMode,
        deliveryChannel,
        whatsappNumber: needsWhatsapp ? whatsappNumber.trim() : '',
        unsubscribeUrl: data.unsubscribeUrl,
      });
      setPreview({
        subject: data.subject,
        text: data.text,
        matchedCount: data.matchedCount,
      });
      if (data.delivered || data.whatsappDelivered) {
        showToast(
          data.whatsappDelivered && data.delivered
            ? 'Insights dispatched via SMTP Email & WhatsApp Relay!'
            : data.whatsappDelivered
              ? 'Personalized digest dispatched via WhatsApp Webhook!'
              : 'Personalized AI digest dispatched via SMTP!',
          'success'
        );
      } else {
        showToast(
          'Subscription & digest queued cleanly. Set SMTP / WhatsApp webhook env vars for live relay.',
          'info'
        );
      }
    } catch (err: any) {
      showToast(err?.message || 'Unable to send digest', 'error');
    } finally {
      setSendingNow(false);
    }
  };

  const handleTestWhatsappPing = async () => {
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
      if (data.dispatch?.delivered) {
        showToast(`WhatsApp ping delivered to ${data.dispatch.normalizedRecipient}!`, 'success');
      } else if (data.dispatch?.deliveryStatus === 'queued_no_webhook') {
        showToast('WhatsApp alert logged cleanly (configure WHATSAPP_WEBHOOK_URL or custom webhook to send live).', 'info');
      } else {
        showToast(data.dispatch?.errorMessage || 'WhatsApp webhook returned an error.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'WhatsApp test failed', 'error');
    } finally {
      setTestingWa(false);
    }
  };

  const toggleCategory = (slug: string) => {
    setCategories((prev) =>
      prev.includes(slug)
        ? prev.length > 1
          ? prev.filter((c) => c !== slug)
          : prev
        : [...prev, slug].slice(0, 5)
    );
  };

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${surfaceCard}`}>
      {/* Header + Subscribe to Daily Insights Toggle */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400">
            <Mail className="h-4 w-4 shrink-0" />
            <span>{isNe ? 'दैनिक एआई इन्साइट्स' : 'Daily AI Insights'}</span>
          </div>
          <h3 className={`text-base font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-950'}`}>
            Subscribe to Daily Insights
          </h3>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={insightsEnabled}
          aria-label="Subscribe to Daily Insights"
          onClick={handleToggleDailyInsights}
          disabled={submitting}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-hidden ${
            insightsEnabled
              ? 'bg-cyan-600'
              : isDark
                ? 'bg-slate-700'
                : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              insightsEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        {isNe
          ? 'तपाईंले रोजेका नेपाल किबोर्ड वर्गहरूको एआई व्याख्या र ट्रेन्ड गति सिधै इमेल वा WhatsApp मा पाउनुहोस्।'
          : 'Receive personalized AI trend explainers and velocity spikes via SMTP email, WhatsApp Business webhook relay, or both.'}
      </p>

      {/* Channel Capabilities Line */}
      <div
        className={`text-[11px] font-mono flex items-center justify-between px-3 py-1.5 rounded-lg border ${
          isDark ? 'border-slate-800 bg-[#080d1a] text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'
        }`}
      >
        <span>Channels</span>
        <span className="font-semibold text-cyan-700 dark:text-cyan-400">
          {smtpConfigured ? 'SMTP Active' : 'SMTP Queue'} ·{' '}
          {whatsappRelayConfigured || whatsappWebhookUrl.trim() ? 'WA Relay Ready' : 'WA Audit Queue'}
        </span>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-3.5">
        <div>
          <label className="sr-only" htmlFor="daily-insights-email">
            Email address for daily insights
          </label>
          <input
            id="daily-insights-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="analyst@company.com.np"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-hidden ${inputClass}`}
          />
        </div>

        {/* Delivery Channel Switcher: Email / WhatsApp / Both */}
        <div className="space-y-1.5">
          <div className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <MessageSquare className="h-3.5 w-3.5 text-cyan-500" />
            <span>{isNe ? 'अलर्ट माध्यम:' : 'Alert Channel:'}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {([
              { id: 'email', label: 'Email' },
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'both', label: 'Email + WA' },
            ] as const).map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setDeliveryChannel(ch.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
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
        </div>

        {needsWhatsapp && (
          <div className="space-y-2">
            <div className="flex gap-1.5">
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+9779841000000 (WhatsApp)"
                className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono outline-hidden ${inputClass}`}
                aria-label="WhatsApp phone number"
              />
              <button
                type="button"
                onClick={handleTestWhatsappPing}
                disabled={testingWa}
                className={`px-3 py-2 rounded-xl border text-[11px] font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
                  isDark
                    ? 'border-slate-700 text-cyan-300 hover:border-cyan-400'
                    : 'border-slate-300 text-cyan-800 hover:border-cyan-600'
                }`}
              >
                {testingWa ? '...' : 'Test WA'}
              </button>
            </div>
            <input
              type="url"
              value={whatsappWebhookUrl}
              onChange={(e) => setWhatsappWebhookUrl(e.target.value)}
              placeholder="Optional WhatsApp webhook URL (overrides env)"
              className={`w-full px-3 py-1.5 rounded-xl border text-[11px] font-mono outline-hidden ${inputClass}`}
              aria-label="Custom WhatsApp webhook URL"
            />
          </div>
        )}

        {/* Cadence & Insight Language */}
        <div className="grid grid-cols-2 gap-1.5">
          {(['daily', 'breaking'] as const).map((cad) => (
            <button
              key={cad}
              type="button"
              onClick={() => setCadence(cad)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                cadence === cad
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                    : 'bg-cyan-600 text-white border-cyan-600'
                  : isDark
                    ? 'border-slate-800 text-slate-300 hover:border-slate-700'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {cad === 'daily' ? (isNe ? 'दैनिक बिहान' : 'Daily Digest') : isNe ? 'ताजा स्पाइक' : 'Breaking Spikes'}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs inline-flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <Globe className="h-3.5 w-3.5 text-cyan-500" />
            <span>{isNe ? 'भाषा:' : 'Language:'}</span>
          </span>
          <div className="flex items-center gap-1">
            {([
              { id: 'bilingual', label: 'EN+ने' },
              { id: 'en', label: 'EN' },
              { id: 'ne', label: 'नेपाली' },
            ] as const).map((langOpt) => (
              <button
                key={langOpt.id}
                type="button"
                onClick={() => setPreferredLanguage(langOpt.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer ${
                  preferredLanguage === langOpt.id
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                      : 'bg-cyan-50 text-cyan-900 border-cyan-500'
                    : isDark
                      ? 'border-slate-800 text-slate-400'
                      : 'border-slate-200 text-slate-600'
                }`}
              >
                {langOpt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category toggles (up to 5) */}
        <div className="space-y-1.5">
          <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {isNe ? 'वर्गहरू छान्नुहोस् (५ सम्म):' : 'Alert Categories (up to 5):'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TREND_CATEGORIES.slice(0, 8).map((cat) => {
              const selected = categories.includes(cat.slug);
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => toggleCategory(cat.slug)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                    selected
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                        : 'bg-cyan-50 text-cyan-900 border-cyan-400'
                      : isDark
                        ? 'border-slate-800 text-slate-300'
                        : 'border-slate-200 text-slate-700'
                  }`}
                >
                  {isNe ? cat.labelNe : cat.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {submitting
              ? isNe
                ? 'सुरक्षित हुँदै...'
                : 'Saving...'
              : insightsEnabled && activeSubInfo
                ? isNe
                  ? 'सेटिङ अपडेट गर्नुहोस्'
                  : 'Update Preferences'
                : isNe
                  ? 'अलर्ट सुरु गर्नुहोस्'
                  : 'Activate Daily Insights'}
          </button>
          <button
            type="button"
            onClick={handlePreviewDigest}
            disabled={previewLoading}
            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              isDark ? 'border-slate-700 text-slate-200 hover:border-cyan-400' : 'border-slate-300 text-slate-800 hover:border-cyan-600'
            }`}
          >
            <Eye className="h-3.5 w-3.5 text-cyan-500" />
            <span>{previewLoading ? '...' : 'Preview'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSendInstantDigest}
          disabled={sendingNow}
          className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            isDark
              ? 'border-slate-800 bg-[#080d1a] text-cyan-300 hover:border-cyan-500/50'
              : 'border-slate-200 bg-slate-50 text-cyan-800 hover:border-cyan-500'
          }`}
        >
          <Send className="h-3.5 w-3.5" />
          <span>
            {sendingNow
              ? 'Dispatching...'
              : deliveryChannel === 'both'
                ? 'Send Insights Now (SMTP + WhatsApp)'
                : deliveryChannel === 'whatsapp'
                  ? 'Send Insights Now (WhatsApp Relay)'
                  : 'Send Personalized Insights Now (SMTP)'}
          </span>
        </button>
      </form>

      {preview && (
        <div
          className={`p-3 rounded-xl border text-xs space-y-1.5 ${
            isDark ? 'border-slate-700 bg-[#080d1a] text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-800'
          }`}
        >
          <div className="font-bold text-cyan-600 dark:text-cyan-400">{preview.subject}</div>
          <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed max-h-44 overflow-y-auto">
            {preview.text}
          </pre>
        </div>
      )}

      {insightsEnabled && activeSubInfo && (
        <div
          className={`p-3 rounded-xl border text-xs space-y-1 ${
            isDark
              ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200'
              : 'border-emerald-300 bg-emerald-50 text-emerald-900'
          }`}
        >
          <div className="font-semibold inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>
              Active ({activeSubInfo.deliveryChannel || 'email'}): {activeSubInfo.email}
              {activeSubInfo.whatsappNumber ? ` · ${activeSubInfo.whatsappNumber}` : ''}
            </span>
          </div>
          {activeSubInfo.unsubscribeUrl && (
            <div>
              <a
                href={activeSubInfo.unsubscribeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-block text-[11px]"
              >
                Direct unsubscribe link
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

