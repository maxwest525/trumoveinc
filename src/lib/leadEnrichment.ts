/**
 * Lead enrichment utilities for TruMove.
 * Captures UTM params, consent state, GA client ID, device info, etc.
 */

// ── UTM capture on page load ──────────────────────────────────────
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'] as const;

export function captureUtmParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    const stored: Record<string, string> = JSON.parse(localStorage.getItem('trumove_utm') || '{}');
    let changed = false;
    UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) { stored[k] = v; changed = true; }
    });
    if (changed) localStorage.setItem('trumove_utm', JSON.stringify(stored));
  } catch { /* noop */ }
}

// ── GA Client ID ──────────────────────────────────────────────────
export function getGAClientId(): string | null {
  try {
    const match = document.cookie.match(/_ga=GA\d+\.\d+\.(.+)/);
    if (match) return match[1];
  } catch { /* noop */ }
  return null;
}

// ── Consent state ─────────────────────────────────────────────────
interface ConsentState {
  ad_storage: string;
  analytics_storage: string;
  ad_user_data: string;
  ad_personalization: string;
}

function getConsentState(): ConsentState {
  const denied: ConsentState = {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  };
  try {
    const raw = JSON.parse(localStorage.getItem('userConsent') || 'null');
    if (!raw) return denied;
    const g = raw.choice === 'accepted' ? 'granted' : 'denied';
    return {
      ad_storage: raw.ad_storage === false ? 'denied' : g,
      analytics_storage: raw.analytics_storage === false ? 'denied' : g,
      ad_user_data: raw.ad_user_data === false ? 'denied' : g,
      ad_personalization: raw.ad_personalization === false ? 'denied' : g,
    };
  } catch { return denied; }
}

// ── Device type ───────────────────────────────────────────────────
function getDeviceType(): 'mobile' | 'desktop' {
  return /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
}

// ── Main enrichment function ──────────────────────────────────────
export interface LeadEnrichment {
  ga_client_id: string | null;
  consent_ad_storage: string;
  consent_analytics_storage: string;
  consent_ad_user_data: string;
  consent_ad_personalization: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  referrer: string;
  timestamp: string;
  user_agent: string;
  screen_resolution: string;
  language: string;
  device_type: 'mobile' | 'desktop';
}

export function enrichLead(): LeadEnrichment {
  const utm: Record<string, string> = (() => {
    try { return JSON.parse(localStorage.getItem('trumove_utm') || '{}'); } catch { return {}; }
  })();
  const consent = getConsentState();

  return {
    ga_client_id: getGAClientId(),
    consent_ad_storage: consent.ad_storage,
    consent_analytics_storage: consent.analytics_storage,
    consent_ad_user_data: consent.ad_user_data,
    consent_ad_personalization: consent.ad_personalization,
    utm_source: utm.utm_source || null,
    utm_medium: utm.utm_medium || null,
    utm_campaign: utm.utm_campaign || null,
    utm_term: utm.utm_term || null,
    utm_content: utm.utm_content || null,
    gclid: utm.gclid || null,
    referrer: document.referrer || '',
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
    screen_resolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
    device_type: getDeviceType(),
  };
}
