# Revised Lead Flow Architecture for Growth Engine

## The Correction

The current Growth Engine assumes GoHighLevel (GHL) is the primary CRM destination. The actual workflow prioritizes **speed-to-lead via Convoso** as the instant-call engine, with GHL/Granot/custom CRM as sync targets, not primary destinations.

**Correct flow:**

```text
Traffic Source → Landing Page / Call Tracking → Attribution Capture
  → Webhook / Router → Convoso (Instant Call) → CRM Sync
  → Backup Follow-Up Logic (SMS if unreached, escalation, after-hours queue, etc.)
```

## Files to Edit

### 1. `src/pages/growth-engine/GrowthIntegrations.tsx`

- **Reposition GHL**: Change category from "CRM" to "CRM Sync" and update description to "Mirror leads and pipeline data to GoHighLevel for backup sequences and reporting." Remove the "connected/warning" mock state; make it optional, not primary.
- **Add Convoso card**: New integration entry with category "Dialer / Speed-to-Lead", description emphasizing instant call attempts, tagged "Essential". Mock as connected + healthy.
- **Add Granot CRM card**: Category "CRM Sync", description as optional record system.
- **Reorder**: Place Convoso before GHL in the list, alongside CallRail in a "Lead Routing" grouping.

### 2. `src/pages/growth-engine/GrowthStubPage.tsx`

- **Update Automation Center description**: Change from "follow-ups, notifications" to reflect the actual backup logic: "Speed-to-lead routing, missed-call recovery, after-hours queuing, duplicate suppression, escalation alerts, and webhook flows."

### 3. `src/pages/growth-engine/GrowthCampaignBuilder.tsx`

- **Update "Quote Forms" goal description**: Change "Great for follow-up" to "Feeds directly into your instant-call workflow for fastest contact."
- **Add a step 7 (Review) enhancement note**: The review/launch summary should reference the lead routing path (Attribution → Webhook → Convoso → CRM Sync) rather than implying leads go to GHL.

### 4. `src/pages/growth-engine/GrowthDashboard.tsx`

- **Update Call Leads card**: Change "Follow-up: 89" label to "In Queue: 89" (reflecting Convoso queue, not passive follow-up).
- **Update AI Recommendations**: Replace any GHL-centric recommendations with speed-to-lead focused ones (e.g., "Lead response time is averaging 4.2 minutes. Target under 60 seconds by reviewing Convoso queue priority rules.").

### 5. `.lovable/plan.md`

- Update the architecture assumptions and automation recipe examples to reflect the corrected flow. All future page builds (Automation Center, Tracking, Leads & Pipeline) will reference:
  - Convoso as the primary instant-call engine
  - GHL/Granot as optional CRM sync targets
  - Backup automation = SMS recovery, escalation, after-hours queuing, duplicate suppression, attribution preservation
  - Not "send to GHL for follow-up sequence"

## Automation Recipe Updates (for future Automation Center build)

Replace the current GHL-centric examples with:

1. New form lead → capture attribution → webhook to Convoso → instant call attempt → sync to CRM
2. Lead not reached after 60s → trigger SMS with quote link
3. No contact after 5 minutes → escalate to supervisor dashboard alert
4. Missed inbound call from paid source → create Convoso callback + alert
5. After-hours form submission → queue for next calling block + send auto-text
6. Duplicate lead detected → suppress in Convoso, tag in CRM
7. Source/campaign changes on re-submission → preserve original attribution in CRM
8. Lead not worked within 2 minutes → flash alert on Growth Dashboard

## Scope

This is a targeted revision pass across 4-5 existing files to correct the architectural assumptions. No new pages created. All changes are data/copy updates to existing mock data, descriptions, and labels.  
  
Also make it visually clear in the product that different businesses may choose a different system of record, but the architecture must support:

- Convoso as the instant-call engine

- one designated CRM/system-of-record per workflow

- optional secondary sync destinations

Avoid any UI or copy that implies all systems are equally primary.  
  
  
Also reflect the status feedback loop where possible:

Convoso call outcome / disposition / queue status should conceptually feed back into the Growth Engine reporting layer so the dashboard can distinguish between:

- new lead

- in queue

- attempted

- connected

- not reached

- escalated

- duplicate

- suppressed  
After-hours logic should be treated as a first-class workflow, not a side case. Make sure the architecture and future UI assume rules for business hours, queue timing, auto-text behavior, and next-call-block scheduling.