

## Carrier Vetting Section Redesign

### Current state
The section has a headline, 3 small selector tabs, and a result card. It works but feels like raw data, not a product preview.

### What changes

**File: `src/pages/Index.tsx` (lines 1678-1804)**

Replace the current carrier selector + result card with a mini SAFER-style lookup UI inspired by the uploaded screenshot:

1. **Fake SAFER search bar** at the top of the section:
   - A decorative "window chrome" bar with three colored dots and "SAFER DATABASE QUERY" label
   - Three filter toggle buttons: Name, DOT, MC (purely decorative, Name is "active")
   - A search input pre-filled with the selected carrier's name (read-only/cosmetic)
   - Small disclaimer text below: "All carriers are filtered and continuously monitored per official FMCSA Safety Measurement System (SMS) criteria..."

2. **Three carrier result cards below the search** — laid out as a vertical stack or horizontal cards (horizontal on desktop, stacked on mobile). Each card is a self-contained row showing:
   - Carrier name + DOT/MC + Authorized/Not Authorized badge
   - 3 inline metrics: Vehicle OOS, Driver OOS, Crashes — compact, one line
   - Compliance chips row (Authority, OOS Orders, Safety Rating, Insurance)
   - Verdict banner (Pass / Caution / Fail)
   - Click any card to "select" it (highlight ring), no separate selector needed

3. **Remove** the separate 3-tab selector grid at top — the cards themselves serve as the selectable items, reducing visual clutter.

4. **Confirm fake companies** — yes, all three (Sunrise Moving & Storage LLC, Fast & Cheap Movers LLC, Regional Van Lines Inc) are fictitious mock data from `mockCarriers.ts`. No changes needed there.

5. **CTA** stays at the bottom linking to carrier vetting page (fix current link from `/site/online-estimate` to `/site/vetting`).

### Technical details

- Same `MOCK_CARRIERS` import, same `carrierIdx` state
- The SAFER chrome bar is purely decorative CSS (rounded-t-xl with flex dots)
- Search input updates its placeholder text when a carrier card is clicked
- Cards use a clean 2-row layout: header row + metrics row, making them scannable
- All within `max-w-2xl mx-auto`

