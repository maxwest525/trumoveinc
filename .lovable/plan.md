

## Analysis: What Data We're Missing

After reviewing the full FMCSA QC API documentation, the `carrier-lookup` edge function, the `carrier-safer-scrape` scraper, and the `CarrierSnapshotCard` UI, here's a comprehensive breakdown.

### What We Already Grab and Display

From the **QC API** (always available):
- Carrier identity (legal name, DBA, DOT, MC, address, phone)
- Authority statuses (common, contract, broker)
- Insurance on file (BIPD, cargo, bond)
- All 6 BASIC scores with percentiles, deficiency flags, violation counts, snapshot dates
- OOS rates + national averages (vehicle, driver, hazmat)
- Inspection counts + OOS counts
- Fleet details (power units, drivers, vehicle type breakdown)
- Crash history (fatal, injury, tow-away)
- Cargo types, operation types, docket numbers
- Safety rating, MCS-150 date, complaint count, OOS status

From the **scraper** (when it works):
- Insurance policy details (Li-Public)
- BOC-3 status/date
- Authority history
- Violation summary with codes
- Activity summary (last investigation, etc.)
- Enforcement cases
- Licensing & Insurance authority types
- Entity type, mileage, DUNS number
- Canadian inspections/crashes

### What the QC API Returns But We're NOT Using

The official FMCSA API documentation is minimal -- it only documents the fields we're already extracting. The carrier object returns exactly what we're already pulling. **We are using all documented QC API fields.**

### What the Scraper Returns But We're NOT Displaying

These fields exist in the scraper response and the UI types but depend on the scraper succeeding:

1. **`safetyReview`** - The scraper extracts `ratingDate`, `reviewDate`, `rating`, `reviewType` from SAFER. We show `safety.rating` from the API, but the `reviewDate` and `reviewType` from API are in the data model but **not displayed** in the card. We show rating in the footer but not the review date/type.

2. **`canadianInspections`** - Vehicle/driver inspections and OOS in Canada. Typed in the interface but **never rendered** in the card.

3. **`canadianCrashes`** - Fatal/injury/tow-away crashes in Canada. Typed but **never rendered**.

4. **`stateCarrierId`** - State-level carrier identifier. In the scraper but **not shown**.

5. **`operatingAuthorityText`** - Full authority description text. Available but **not shown**.

6. **`iepInspections`** - Intermodal Equipment Provider inspections. In the data model but **not shown** in the inspection breakdown table.

### What's Actually Missing That We Should Add

Given that the QC API is already fully utilized, the real gaps are:

1. **Safety Review Details** -- Show `reviewDate`, `reviewType`, and `ratingDate` alongside the safety rating (already in API data, just not displayed)
2. **Canadian Inspections & Crashes** -- Already scraped, never rendered. Important for cross-border carriers.
3. **IEP Inspections** -- Already in the inspection data, not shown in the breakdown table
4. **Hazmat Compliance BASIC** -- The scraper extracts a 7th BASIC (`hazmatCompliance`) that we never display. The QC API only returns 5 official BASICs per documentation, but the scraper may find it on the SMS page.

### Recommended Changes

**1. `CarrierSnapshotCard.tsx` -- Show safety review details**
- In the footer, expand the safety rating line to include review date and type when available from `data.safety.reviewDate` / `data.safety.reviewType`

**2. `CarrierSnapshotCard.tsx` -- Add Canadian data sections**
- When `data.scraped.canadianInspections` exists, add a "Canadian Inspections" table mirroring the US roadside inspection breakdown
- When `data.scraped.canadianCrashes` exists, add a "Canadian Crashes" section

**3. `CarrierSnapshotCard.tsx` -- Add IEP row to inspection table**
- Add IEP inspections row to the Roadside Inspections table when `data.scraped.inspectionDetails?.iepInspections > 0`

**4. `CarrierSnapshotCard.tsx` -- Show Hazmat Compliance BASIC**
- If available from scraper (`data.scraped.basicMeasures?.hazmatCompliance`), add a 7th BASIC score bar

**5. `CarrierSnapshotCard.tsx` -- Show state carrier ID and operating authority text**
- Add these to the "Additional Details" section alongside entity type, mileage, and DUNS

### Summary

The QC API is fully exhausted -- we're using every field it provides. The gaps are all on the **display side**: fields we already have from both the API and scraper that aren't being rendered. No new API endpoints or data sources needed.

