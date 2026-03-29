import { useState, useEffect } from "react";
import { X, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { enrichLead } from "@/lib/leadEnrichment";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
interface ConsentRecord {
  choice: 'accepted' | 'rejected' | 'custom';
  ad_storage: boolean;
  analytics_storage: boolean;
  ad_user_data: boolean;
  ad_personalization: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'userConsent';

function getStored(): ConsentRecord | null {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}

function persist(record: ConsentRecord) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  // Push consent update to Google tag
  if (typeof window.gtag === 'function') {
    const val = (b: boolean) => b ? 'granted' : 'denied';
    window.gtag('consent', 'update', {
      ad_storage: val(record.ad_storage),
      analytics_storage: val(record.analytics_storage),
      ad_user_data: val(record.ad_user_data),
      ad_personalization: val(record.ad_personalization),
    });
  }
}

/* ── Toggle row ─────────────────────────────────────────────── */
function Toggle({ label, description, checked, onChange, disabled }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="pr-4">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-emerald-500" : "bg-gray-300",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        <span className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )} />
      </button>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Per-category toggles for settings modal
  const [analytics, setAnalytics] = useState(true);
  const [adStorage, setAdStorage] = useState(true);
  const [adUserData, setAdUserData] = useState(true);
  const [adPersonalization, setAdPersonalization] = useState(true);

  useEffect(() => {
    if (getStored()) return; // Already consented
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Insert a passive lead with enrichment data when user interacts with cookie banner
  const insertCookieLead = async (record: ConsentRecord) => {
    try {
      const e = enrichLead();
      await supabase.from("leads").insert({
        first_name: "Website",
        last_name: "Visitor",
        source: "website" as const,
        status: "new" as const,
        assigned_agent_id: null,
        ga_client_id: e.ga_client_id,
        consent_ad_storage: record.ad_storage ? "granted" : "denied",
        consent_analytics_storage: record.analytics_storage ? "granted" : "denied",
        consent_ad_user_data: record.ad_user_data ? "granted" : "denied",
        consent_ad_personalization: record.ad_personalization ? "granted" : "denied",
        utm_source: e.utm_source,
        utm_medium: e.utm_medium,
        utm_campaign: e.utm_campaign,
        utm_term: e.utm_term,
        utm_content: e.utm_content,
        gclid: e.gclid,
        referrer: e.referrer,
        user_agent: e.user_agent,
        screen_resolution: e.screen_resolution,
        browser_language: e.language,
        device_type: e.device_type,
        enrichment_timestamp: e.timestamp,
        landing_page_url: e.landing_page_url,
      });
    } catch (err) {
      console.error("Cookie lead insert error:", err);
    }
  };

  const handleAcceptAll = () => {
    const r: ConsentRecord = {
      choice: 'accepted', ad_storage: true, analytics_storage: true,
      ad_user_data: true, ad_personalization: true, timestamp: new Date().toISOString(),
    };
    persist(r);
    insertCookieLead(r);
    setVisible(false);
    setShowSettings(false);
  };

  const handleReject = () => {
    const r: ConsentRecord = {
      choice: 'rejected', ad_storage: false, analytics_storage: false,
      ad_user_data: false, ad_personalization: false, timestamp: new Date().toISOString(),
    };
    persist(r);
    insertCookieLead(r);
    setVisible(false);
    setShowSettings(false);
  };

  const handleSaveCustom = () => {
    const allGranted = analytics && adStorage && adUserData && adPersonalization;
    const allDenied = !analytics && !adStorage && !adUserData && !adPersonalization;
    const r: ConsentRecord = {
      choice: allGranted ? 'accepted' : allDenied ? 'rejected' : 'custom',
      ad_storage: adStorage, analytics_storage: analytics,
      ad_user_data: adUserData, ad_personalization: adPersonalization,
      timestamp: new Date().toISOString(),
    };
    persist(r);
    insertCookieLead(r);
    setVisible(false);
    setShowSettings(false);
  };

  if (!visible) return null;

  /* ── Settings Modal ────────────────────────────────────────── */
  if (showSettings) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40 z-[9998] backdrop-blur-sm" onClick={() => setShowSettings(false)} />

        {/* Modal */}
        <div className="fixed z-[9999] inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-semibold text-gray-900">Cookie Settings</h2>
            </div>
            <button onClick={() => setShowSettings(false)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-3">
            <p className="text-xs text-gray-500 mb-4">
              Choose which cookies you'd like to allow. Essential cookies are always active.
            </p>

            <Toggle label="Essential" description="Required for the site to function" checked disabled onChange={() => {}} />
            <Toggle label="Analytics" description="Help us understand how you use the site" checked={analytics} onChange={setAnalytics} />
            <Toggle label="Ad Storage" description="Used for advertising measurement" checked={adStorage} onChange={setAdStorage} />
            <Toggle label="Ad User Data" description="Share data with advertising partners" checked={adUserData} onChange={setAdUserData} />
            <Toggle label="Ad Personalization" description="Show you personalized ads" checked={adPersonalization} onChange={setAdPersonalization} />
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
            <button
              onClick={handleReject}
              className="flex-1 h-10 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Reject All
            </button>
            <button
              onClick={handleSaveCustom}
              className="flex-1 h-10 rounded-xl bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ── Banner ────────────────────────────────────────────────── */
  return (
    <div
      className={cn(
        "fixed z-[9999] animate-in slide-in-from-bottom-4 fade-in duration-300",
        // Mobile: full-width bottom card
        "bottom-4 left-4 right-4",
        // Desktop: small card bottom-right
        "sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-[380px]"
      )}
    >
      <div className="bg-[#f8f9fa] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200/60 p-4">
        {/* Icon + Text */}
        <div className="flex gap-3 mb-3">
          <div className="shrink-0 mt-0.5">
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[13px] leading-snug text-gray-700">
              We use cookies to improve your experience, analyze traffic, and show relevant ads.
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 mt-1.5 transition-colors"
            >
              Cookie settings <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Buttons — stack on small mobile, side-by-side otherwise */}
        <div className="flex gap-2 flex-col min-[480px]:flex-row">
          <button
            onClick={handleReject}
            className="flex-1 h-9 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={handleAcceptAll}
            className="flex-1 h-9 rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600 shadow-sm transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
