import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Megaphone, X, CheckCircle2 } from 'lucide-react';
import { Language, ThemeMode } from '../../types';
import { DIASPORA_COUNTRIES } from '../../utils/trendsEngine';
import { useToast } from '../../context/ToastContext';

export interface DiasporaPartnerSlotDto {
  id: string;
  partnerName: string;
  tagline: string;
  ctaLabel: string;
  ctaUrl: string;
  categoryLabel: string;
  targetCountries: string[];
  sponsorTier: string;
  impressionsCount: number;
  clicksCount: number;
}

interface DiasporaPartnersSectionProps {
  theme: ThemeMode;
  language: Language;
  activeCountry: string;
  partners: DiasporaPartnerSlotDto[];
  onNavigateInternalUrl?: (path: string) => void;
}

export const DiasporaPartnersSection: React.FC<DiasporaPartnersSectionProps> = ({
  theme,
  language,
  activeCountry,
  partners,
  onNavigateInternalUrl,
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';
  const { showToast } = useToast();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('Remittance & FX Corridor');
  const [tagline, setTagline] = useState('');
  const [ctaUrl, setCtaUrl] = useState('https://');
  const [selectedHubs, setSelectedHubs] = useState<string[]>(['US', 'AU', 'GB']);
  const [submitting, setSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  const trackedImpressions = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const p of partners) {
      if (!trackedImpressions.current.has(p.id)) {
        trackedImpressions.current.add(p.id);
        fetch('/api/diaspora/partners/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: p.id, eventType: 'impression' }),
        }).catch(() => null);
      }
    }
  }, [partners]);

  const handlePartnerCta = (partner: DiasporaPartnerSlotDto) => {
    fetch('/api/diaspora/partners/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: partner.id, eventType: 'click' }),
    }).catch(() => null);

    if (partner.ctaUrl.startsWith('/') && onNavigateInternalUrl) {
      onNavigateInternalUrl(partner.ctaUrl);
    } else if (typeof window !== 'undefined') {
      window.location.assign(partner.ctaUrl);
    }
  };

  const toggleHub = (code: string) => {
    setSelectedHubs((prev) =>
      prev.includes(code)
        ? prev.length > 1
          ? prev.filter((c) => c !== code)
          : prev
        : [...prev, code]
    );
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmittedNotice(null);
    try {
      const resp = await fetch('/api/diaspora/partners/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName,
          contactEmail,
          categoryLabel,
          tagline,
          ctaUrl,
          targetCountries: selectedHubs,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Could not submit partner application');
      }
      setSubmittedNotice(data.message || 'Partner placement application received.');
      showToast('Diaspora partner slot application submitted!', 'success');
      setPartnerName('');
      setTagline('');
    } catch (err: any) {
      showToast(err?.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const surfaceCard = isDark
    ? 'border-slate-800 bg-[#0b1220] text-slate-100'
    : 'border-slate-200 bg-white text-slate-900 shadow-2xs';

  const inputClass = isDark
    ? 'border-slate-700 bg-[#080d1a] text-white placeholder:text-slate-400 focus:border-cyan-400'
    : 'border-slate-300 bg-white text-slate-950 placeholder:text-slate-500 focus:border-cyan-600';

  if (partners.length === 0) return null;

  return (
    <section aria-label="Diaspora Trends Sponsored Partners" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {isNe ? 'प्रायोजित प्रवास साझेदार' : 'Sponsored Partner Placements'} ·{' '}
          {activeCountry === 'ALL' ? 'US · AU · UK · UAE · JP · CA' : activeCountry}
        </div>
        <button
          type="button"
          onClick={() => {
            setSubmittedNotice(null);
            setShowApplyModal((prev) => !prev);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer"
        >
          <Megaphone className="h-3.5 w-3.5" />
          <span>{isNe ? 'प्रवास स्लट प्रायोजन गर्नुहोस्' : 'Sponsor a Diaspora Hub'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between gap-3 ${surfaceCard}`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                <span className="text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
                  Sponsored Partner
                </span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  {partner.categoryLabel} · {partner.targetCountries.slice(0, 3).join('/')}
                </span>
              </div>
              <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {partner.partnerName}
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {partner.tagline}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                Hubs: {partner.targetCountries.join(', ')}
              </span>
              <button
                type="button"
                onClick={() => handlePartnerCta(partner)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cyan-600/40 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>{partner.ctaLabel}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showApplyModal && (
        <div className={`rounded-2xl border p-5 space-y-4 ${surfaceCard}`}>
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-bold">
                Reserve a Vetted Diaspora Trends Partner Slot
              </h4>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Appears exclusively on /trending/diaspora for Nepali remittance, travel, gifting, and property brands. Core analytics & exports remain free.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Close sponsor application"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {submittedNotice ? (
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{submittedNotice}</span>
            </div>
          ) : (
            <form onSubmit={handleApplySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                required
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Brand / Service Name (e.g. Himalayan Remit)"
                className={`px-3 py-2 rounded-xl border outline-hidden ${inputClass}`}
              />
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="partnerships@company.com"
                className={`px-3 py-2 rounded-xl border outline-hidden ${inputClass}`}
              />
              <select
                value={categoryLabel}
                onChange={(e) => setCategoryLabel(e.target.value)}
                className={`px-3 py-2 rounded-xl border outline-hidden ${inputClass}`}
              >
                <option value="Remittance & FX Corridor">Remittance & FX Corridor</option>
                <option value="Flights & Trekking Travel">Flights & Trekking Travel</option>
                <option value="Diaspora Gifting & Retail">Diaspora Gifting & Retail</option>
                <option value="Nepal Property & Legal Advisory">Nepal Property & Legal Advisory</option>
              </select>
              <input
                type="url"
                required
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://yourpartnerlink.com"
                className={`px-3 py-2 rounded-xl border outline-hidden ${inputClass}`}
              />
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Concise 1-sentence value proposition for overseas Nepalis..."
                className={`md:col-span-2 px-3 py-2 rounded-xl border outline-hidden ${inputClass}`}
              />
              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Target Hubs:</span>
                  {DIASPORA_COUNTRIES.map((c) => {
                    const active = selectedHubs.includes(c.code);
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => toggleHub(c.code)}
                        className={`px-2 py-1 rounded-md border font-mono text-[11px] cursor-pointer ${
                          active
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : isDark
                              ? 'border-slate-700 text-slate-300'
                              : 'border-slate-300 text-slate-700'
                        }`}
                      >
                        {c.code}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer whitespace-nowrap"
                >
                  {submitting ? 'Submitting...' : 'Submit Partner Slot Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
};
