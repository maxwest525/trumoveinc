

## Plan: Unify Phases, Connectors & Integration Status

### Problem
1. **Redundant UI**: The "Connectors" row and the "Phase Status" card in the overview strip show the same information as the phase tabs — three separate places displaying connection status.
2. **GSC/GA4 shown as disconnected**: The `gscConnected` state starts as `false` and only updates when the SearchConsoleTab checks the database. GA4 is hardcoded to `"not_connected"`. Both should check `gsc_connections` and `integration_connections` tables on page load.

### Changes

**1. Remove redundant connector row and merge status into phase tabs** (`MarketingSEO.tsx`)
- Delete the "Connectors:" row (lines 569-580) entirely.
- Remove the `connectorCards` useMemo since it duplicates `phases`.
- The phase tab cards already show status badges — these become the single source of truth.

**2. Remove "Phase Status" card from overview strip** (`SeoOverviewStrip.tsx`)
- Replace the 4th card (Phase Status listing) with a simpler "Last Audit" or keep only 3 KPI cards (URLs Crawled, Total Issues, Integrations count). The phase tabs themselves now carry all status info.

**3. Auto-detect GSC connection on mount** (`MarketingSEO.tsx`)
- Add a `useEffect` that queries `gsc_connections` for the current user on page load. If a row exists with a `refresh_token`, set `gscConnected = true` immediately, so the phase tab shows "Connected" without needing to click into Phase 2 first.

**4. Auto-detect GA4 connection on mount** (`MarketingSEO.tsx`)
- Add a `useEffect` that queries `integration_connections` where `integration_id = 'ga4'` and `connected = true`. If found, update Phase 3 status to "connected".
- Update GA4Tab to also check this on mount rather than always showing "not connected".

### Result
- One place for status: the phase tab cards (Phase 1-4), each with a badge.
- No duplicate connector row or overview strip phase listing.
- GSC and GA4 correctly show as connected based on database state.

