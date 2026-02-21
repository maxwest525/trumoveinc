

# CRM Pipeline Backend + Agent Dashboard

## Overview
Bring Pipedrive-style CRM functionality into TruMove, purpose-built for the moving industry. This adds the data backbone your agent tools are missing -- real leads, deals with stages, activity tracking, and reporting -- plus a visual Kanban pipeline UI.

## Phase 1: Database Foundation (Backend)

Create the core CRM tables:

### New Tables

**leads**
- id, created_at, updated_at
- first_name, last_name, email, phone
- source (website, referral, PPC, walk-in)
- status (new, contacted, qualified, lost)
- assigned_agent_id (references profiles.id)
- notes, tags
- move_date, origin_address, destination_address
- estimated_weight, estimated_value

**deals**
- id, created_at, updated_at
- lead_id (references leads)
- stage (qualified, estimate_sent, follow_up, booked, dispatched, in_transit, delivered, closed_won, closed_lost)
- deal_value, actual_revenue
- carrier_id, carrier_name
- assigned_agent_id
- expected_close_date, actual_close_date
- loss_reason (if closed_lost)

**activities**
- id, created_at
- deal_id (references deals), lead_id (references leads)
- agent_id (references profiles)
- type (call, email, note, follow_up, meeting, text)
- subject, description
- due_date, completed_at
- is_done

**pipeline_stages** (configurable)
- id, name, display_order, color, is_default
- stage_key (matches deal.stage enum)

**deal_history** (audit log)
- id, deal_id, changed_by
- field_changed, old_value, new_value, changed_at

### RLS Policies
- Agents can only see leads/deals assigned to them
- Managers (role-based via profiles) can see all
- All tables require authenticated access

### Triggers
- Auto-create activity when deal stage changes
- Auto-update deal.updated_at on any change
- Auto-log stage changes to deal_history

## Phase 2: Agent Pipeline Dashboard (Frontend)

### Kanban Board View
- New page at `/agent/pipeline`
- Columns for each stage: New Lead > Contacted > Estimate Sent > Booked > Dispatched > In Transit > Delivered
- Drag-and-drop cards between columns (already have @dnd-kit installed)
- Each card shows: customer name, move date, deal value, days in stage
- Color-coded urgency (green = on track, yellow = stale 2+ days, red = stale 5+ days)

### Lead Detail Slide-out
- Click a card to open a side panel
- Shows: contact info, move details, full activity timeline
- Quick action buttons: Log Call, Send Email, Add Note, Schedule Follow-up
- Stage change dropdown right in the panel

### Activity Feed
- Chronological timeline of all interactions per deal
- Icons per type (phone, email, note, calendar)
- "Add Activity" button with type selector

## Phase 3: Reporting Dashboard

### Key Metrics Cards
- Total pipeline value
- Conversion rate (leads to booked)
- Average deal cycle time
- Revenue this month vs. goal

### Charts (using existing recharts)
- Funnel chart: leads by stage
- Line chart: deals closed over time
- Bar chart: revenue by agent
- Pie chart: lead sources breakdown

## Phase 4: AI Deal Assistant

- Use Lovable AI (gemini-2.5-flash) to power contextual suggestions
- "This lead matches a pattern of leads that book within 48 hours"
- "Suggested follow-up: offer $X discount based on similar moves"
- Auto-draft follow-up emails based on deal context
- Surface in a small widget on the deal detail panel

## Technical Details

### Database Migration SQL
- 5 new tables with proper indexes on foreign keys and commonly filtered columns
- RLS policies scoped to agent ownership + manager override
- Triggers for audit logging and timestamp updates
- Seed pipeline_stages with moving-industry defaults

### Frontend Components
- `src/pages/AgentPipeline.tsx` -- main Kanban page
- `src/components/pipeline/PipelineBoard.tsx` -- drag-drop board
- `src/components/pipeline/DealCard.tsx` -- individual card
- `src/components/pipeline/DealDetailPanel.tsx` -- slide-out detail
- `src/components/pipeline/ActivityTimeline.tsx` -- activity feed
- `src/components/pipeline/PipelineReports.tsx` -- reporting dashboard
- `src/components/pipeline/DealAIAssistant.tsx` -- AI suggestions widget

### Route Addition
- `/agent/pipeline` added to App.tsx

### Implementation Order
1. Database tables + RLS + triggers
2. Kanban board with static data
3. Wire up to real database with react-query
4. Lead detail panel + activity logging
5. Reporting charts
6. AI assistant integration

