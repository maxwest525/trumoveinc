

## Under Construction Gate for Non-Business Pages

### Problem
Customer-facing pages and unused routes are accessible in the CRM environment, causing blank screens and confusion, especially on mobile.

### What counts as "non-business" (needs the gate)
These routes are customer-facing or not actively used by the business CRM:

| Route | What it is |
|---|---|
| `/site` and `/site/*` | Customer website (all pages) |
| `/homepage-2` | Alternate homepage design |
| `/customer-facing-sites` | Site preview launcher |

The `/` root route already redirects to `/dashboard` on CRM/dev, so it stays as-is.

### What stays untouched
All `/agent/*`, `/manager/*`, `/admin/*`, `/marketing/*`, `/dispatch/*`, `/leads/*`, `/kpi`, `/leaderboard`, `/accounting/*`, `/creative/*`, `/dashboard`, `/esign/:refNumber`, `/reset-password`, `/set-password`, `/unsubscribe`, `/tools/:tool`, and auth routes remain fully functional.

### Plan

**1. Create an `UnderConstruction` page component**
- Displays a clean, on-brand message: "Looks like this page is under construction. Looks like TruMove is helping you move back home."
- Detects the hostname:
  - If on `crm.trumoveinc.com` (or dev/preview): show a button linking back to `/dashboard`
  - If on `trumoveinc.com` (production customer domain): auto-redirect to `/` (homepage)
- Premium styling consistent with the rest of the platform

**2. Update `App.tsx` routing**
- Replace the `/site` and `/site/*` route elements with the new `UnderConstruction` component (instead of `SiteRouteGuard`)
- Replace `/homepage-2` route element with `UnderConstruction`
- Replace `/customer-facing-sites` route element with `UnderConstruction`

**3. Clean up nav references**
- Remove the "Customer Sites" link from `GrowthEngineShell.tsx` sidebar (points to `/customer-facing-sites`)
- Remove any other nav items that link to gated routes so users don't land on the construction page from internal navigation

**4. Keep existing code intact**
- Do NOT delete any page files (Index, HomepageV2, SiteRouteGuard, etc.) so they can be restored later
- Simply swap the route elements to point to the construction page

### Files changed
- `src/pages/UnderConstruction.tsx` (new)
- `src/App.tsx` (swap route elements)
- `src/components/layout/GrowthEngineShell.tsx` (remove Customer Sites nav item)

