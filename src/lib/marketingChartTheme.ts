/**
 * Shared TruMove chart palette for all marketing analytics charts.
 * Keep all marketing charts (Area, Bar, Pie, Line) using these tokens
 * so the brand palette stays consistent across every page.
 */

export const TM_CHART = {
  navy: "#1A365D",
  navyLight: "#2C5282",
  green: "#22C55E",
  greenDeep: "#15803D",
  gold: "#D69E2E",
  slate: "#94A3B8",
  muted: "#E5E7EB",
} as const;

/**
 * Ordered categorical palette for series like channels, sources, segments.
 * Use indexed access (PALETTE[i % PALETTE.length]) for dynamic data.
 */
export const TM_CHART_PALETTE: string[] = [
  TM_CHART.green,
  TM_CHART.navy,
  TM_CHART.gold,
  TM_CHART.navyLight,
  TM_CHART.greenDeep,
  TM_CHART.slate,
];

/** Common semantic mappings used across marketing dashboards. */
export const TM_CHART_SEMANTIC = {
  organic: TM_CHART.green,
  paid: TM_CHART.navy,
  direct: TM_CHART.gold,
  referral: TM_CHART.navyLight,
  owned: TM_CHART.greenDeep,
  bought: TM_CHART.navy,
  positive: TM_CHART.green,
  neutral: TM_CHART.slate,
  background: TM_CHART.muted,
} as const;
