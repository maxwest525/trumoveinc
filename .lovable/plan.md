

## Plan: Use FMCSA QC API Data Directly Instead of Relying on Scraper

### Problem

Most of the "enhanced" data sections (OOS rates vs national average, inspection breakdown, activity summary) are gated behind `data.scraped` which requires the Firecrawl scraper to succeed. The scraper often returns empty data (`{}`), so these sections never appear. Meanwhile, the FMCSA QC API — already being called — returns much of this data on the carrier object itself.

### What the QC API already provides (but is hidden behind scraper gates)

| Data Point | QC API Field | Currently Displayed? |
|---|---|---|
| Vehicle OOS Rate + National Avg | `vehicleOosRate`, `vehicleOosRateNationalAverage` | Only in `data.oos`, not visualized with bar chart |
| Driver OOS Rate + National Avg | `driverOosRate`, `driverOosRateNationalAverage` | Same |
| Hazmat OOS Rate + National Avg | `hazmatOosRate`, `hazmatOosRateNationalAverage` | Same |
| Vehicle/Driver/Hazmat Inspections | `vehicleInsp`, `driverInsp`, `hazmatInsp` | Not shown |
| Vehicle/Driver/Hazmat OOS Inspections | `vehicleOosInsp`, `driverOosInsp`, `hazmatOosInsp` | Not shown |
| BASIC total violations per category | `totalViolation` on each basic | Not shown |
| BASIC inspections with violations | `totalInspectionWithViolation` | Not shown |
| BASIC snapshot date | `snapShotDate` | Not shown |

### What only the scraper can provide

- Violation details (codes, descriptions, severity weights)
- Insurance policy details (insurer names, policy numbers, effective dates)
- BOC-3 filing status and date
- Authority grant/revoke history
- Individual inspection reports

### Changes

**1. `src/components/vetting/CarrierSnapshotCard.tsx`**

Move the following sections OUT of the `data.scraped && !data.scraped.isLoading` gate and render them using `data.oos` directly:

- **OOS Rates vs National Average** — Use `data.oos.vehicleOosRate` / `data.oos.vehicleOosRateNationalAvg` etc. Always show this section when there are inspections.
- **Roadside Inspection Breakdown** — Use `data.oos.vehicleInspections`, `data.oos.vehicleOosInsp`, `data.oos.driverInspections`, `data.oos.driverOosInsp`, `data.oos.hazmatInsp`, `data.oos.hazmatOosInsp`. Always show when any inspections exist.
- **BASIC Score Details** — Under each BASIC bar, show `totalInspectionWithViolation` and `totalViolation` counts from the API data (already in `data.basics`).

Keep scraper-only sections gated behind `data.scraped`:
- Insurance Policies (Li-Public)
- BOC-3 Status
- Authority History
- Violation Summary (detailed codes/descriptions)

**2. `src/pages/CarrierVetting.tsx`**

Update the `CarrierData` interface `oos` to include `hazmatOosInsp`, `vehicleOosInsp`, `driverOosInsp`, `hazmatOosRate`, `hazmatOosRateNationalAvg` (some of these are already there in the edge function response but not typed on the frontend).

**3. `src/components/vetting/CarrierSnapshotCard.tsx` — BASIC enhancement**

For each BASIC score bar, show the inspection/violation count underneath when available:
- "10 inspections with violations / 28 total violations"
- Show snapshot date

This means the full report for DOT 4285236 would show OOS rates (77.8% vehicle, 81.4% driver), inspection counts (43 total), and BASIC details immediately from the API — without waiting for the scraper.

