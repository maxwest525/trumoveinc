// Shared marketing KPI snapshot.
// Single source of truth used by both the Metrics Dashboard
// and the Action Items generator so AI recommendations reflect
// the same numbers the dashboard displays.

export const trafficData = [
  { month: "Oct", organic: 0, paid: 0, direct: 40 },
  { month: "Nov", organic: 120, paid: 80, direct: 55 },
  { month: "Dec", organic: 180, paid: 140, direct: 70 },
  { month: "Jan", organic: 240, paid: 190, direct: 85 },
  { month: "Feb", organic: 310, paid: 220, direct: 90 },
  { month: "Mar", organic: 420, paid: 280, direct: 110 },
];

export const leadData = [
  { month: "Oct", leads: 12, booked: 3 },
  { month: "Nov", leads: 28, booked: 8 },
  { month: "Dec", leads: 41, booked: 14 },
  { month: "Jan", leads: 55, booked: 19 },
  { month: "Feb", leads: 68, booked: 24 },
  { month: "Mar", leads: 84, booked: 31 },
];

export const channelMix = [
  { name: "Organic", value: 38 },
  { name: "Paid", value: 29 },
  { name: "Direct", value: 18 },
  { name: "Referral", value: 15 },
];

export const ownedVsBought = [
  { name: "Owned", value: 38 },
  { name: "Bought", value: 62 },
];

export const costPerBookedSource = [
  { source: "Organic", cost: 42 },
  { source: "Google Ads", cost: 185 },
  { source: "Meta", cost: 210 },
  { source: "Vendors", cost: 290 },
  { source: "Referral", cost: 18 },
];

export const headlineMetrics = {
  bookedJobs7d: 31,
  revenue7d: 48200,
  costPerBookedJob: 142,
  roas: 3.4,
  ownedLeadPct: 38,
};

/**
 * Builds the KPI payload sent to the AI action item generator.
 * Mirrors the values rendered on the Metrics Dashboard so
 * recommendations are grounded in the same data the user sees.
 */
export function buildCurrentKpiSnapshot() {
  const last = trafficData[trafficData.length - 1];
  const prev = trafficData[trafficData.length - 2];
  const lastLead = leadData[leadData.length - 1];
  const prevLead = leadData[leadData.length - 2];

  const totalTrafficLast = last.organic + last.paid + last.direct;
  const totalTrafficPrev = prev.organic + prev.paid + prev.direct;
  const trafficGrowthPct = totalTrafficPrev
    ? Math.round(((totalTrafficLast - totalTrafficPrev) / totalTrafficPrev) * 100)
    : 0;

  const conversionRatePct = lastLead.leads
    ? Math.round((lastLead.booked / lastLead.leads) * 100)
    : 0;
  const prevConversionRatePct = prevLead.leads
    ? Math.round((prevLead.booked / prevLead.leads) * 100)
    : 0;

  const owned = ownedVsBought.find((s) => s.name === "Owned")?.value ?? 0;
  const bought = ownedVsBought.find((s) => s.name === "Bought")?.value ?? 0;

  return {
    period: `${prev.month}–${last.month}`,
    organicTrafficLast30d: last.organic,
    paidTrafficLast30d: last.paid,
    directTrafficLast30d: last.direct,
    trafficGrowthPctMoM: trafficGrowthPct,
    totalLeadsLast30d: lastLead.leads,
    bookedJobsLast30d: lastLead.booked,
    conversionRatePct,
    prevConversionRatePct,
    revenueLast7d: headlineMetrics.revenue7d,
    costPerLead: headlineMetrics.costPerBookedJob, // current proxy
    costPerBookedJob: headlineMetrics.costPerBookedJob,
    roas: headlineMetrics.roas,
    ownedLeadPct: owned,
    vendorDependencyPct: bought,
    channelMix: channelMix.map((c) => ({ channel: c.name, sharePct: c.value })),
    costPerBookedBySource: costPerBookedSource.map((s) => ({
      source: s.source,
      costUsd: s.cost,
    })),
    topPriorityIssues: [
      "12 broken internal links detected",
      "3 ad groups with $200+ spend and 0 conversions",
      "DA stagnant at 24 vs competitors 55-72",
    ],
  };
}

export type CurrentKpiSnapshot = ReturnType<typeof buildCurrentKpiSnapshot>;
