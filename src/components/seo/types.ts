/** Shared SEO module types across all phases */

export type PhaseStatus = "not_connected" | "connected" | "syncing" | "error" | "coming_soon";

export interface PhaseInfo {
  id: number;
  label: string;
  status: PhaseStatus;
  lastSync?: string | null;
}

export interface UrlMetrics {
  url: string;
  // Phase 1: Audit
  issues?: number;
  title?: string | null;
  description?: string | null;
  h1?: string | null;
  // Phase 2: Search Console
  topQueries?: SearchConsoleQuery[];
  impressions?: number;
  clicks?: number;
  ctr?: number;
  avgPosition?: number;
  // Phase 3: GA4
  sessions?: number;
  conversions?: number;
  conversionRate?: number;
  // Phase 4: Backlinks
  backlinks?: number;
  referringDomains?: number;
  domainAuthority?: number;
}

export interface SearchConsoleQuery {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

export interface GA4PageData {
  url: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
  bounceRate?: number;
  avgEngagementTime?: number;
}

export interface BacklinkData {
  url: string;
  backlinks: number;
  referringDomains: number;
  domainAuthority: number;
  topReferrers?: string[];
}
