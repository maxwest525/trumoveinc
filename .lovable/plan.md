

# Morning Ops Tracker — Marketing Dashboard

## What We're Building

A prominent **Morning Operations Tracker** pinned to the top of the Marketing Dashboard. This is an ordered workflow checklist that tells you exactly what needs attention when you open the dashboard each day — pending changes, stale data, alerts, recommendations awaiting action, and completed items with timestamps.

## How It Works

The tracker aggregates signals from across the marketing system into a single ordered checklist:

1. **Critical Alerts** — Implementation Center items needing approval, rolled-back changes
2. **AI Recommendations** — Pending high-priority recommendations from the engine
3. **Content Updates** — Blog posts needing refresh, scheduled content going live
4. **Data Freshness** — Stale integrations, sections not updated recently (from activity log)
5. **Routine Checks** — Ad performance review, SEO rank checks, CRO experiment status

Each item shows:
- Status indicator (pending / done / alert / skipped)
- Title and source module
- Timestamp when completed (or "awaiting action")
- Direct link to the relevant page

A progress bar at the top shows "6 of 11 items complete" so you can see at a glance how far through your morning ops you are.

## Technical Approach

### New Component: `MorningOpsTracker.tsx`
- Created in `src/components/marketing/MorningOpsTracker.tsx`
- Consumes `useImplementationQueue()` context to pull pending/approved changes
- Reads the activity log data already loaded in the dashboard
- Generates a deterministic ordered checklist combining:
  - Implementation queue items with `pending` or `approved` status
  - Seed workflow steps (review ads, check SEO rankings, review CRO experiments, check content calendar, verify integrations)
  - Activity log staleness warnings
- Each item can be marked "done" (stored in component state for the session) or links out to the relevant module page
- Collapsible design — expanded by default, can minimize to a summary bar

### Dashboard Integration
- Import and render `MorningOpsTracker` at the very top of `MarketingDashboard.tsx`, immediately after the header and before the integration status bar
- Pass activity log data and implementation queue data as props

### UI Design
- Card with a gradient accent border (subtle premium feel)
- Header: "Morning Ops" with a sun/clipboard icon, date stamp, and progress indicator
- Ordered list with step numbers, checkboxes, category badges, timestamps
- Items link to their respective pages (Implementation Center, Recommendations, Content Center, etc.)
- Completed items show a green check + timestamp; pending items pulse subtly

No database changes required — this aggregates existing data sources client-side.

