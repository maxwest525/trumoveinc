

# Fix SharedSidebar: Restore Role-Based Navigation

## Problem
`SharedSidebar.tsx` hardcodes Marketing nav items for all roles. Every portal sees Marketing links instead of their own.

## Source of truth
The correct nav items per role are already defined in the codebase's TeamChat pages and App.tsx routes. These are the last known working items:

### Admin (from `AdminTeamChat.tsx`)
- Dashboard → `/admin/dashboard`
- Users & Roles → `/admin/users`
- Employee Requests → `/admin/employee-requests`
- Products & Pricing → `/admin/pricing`
- Developer → `/admin/developer`
- Pulse Settings → `/admin/pulse`

### Manager (from `ManagerTeamChat.tsx`)
- Dashboard → `/manager/dashboard`
- Leaderboard → `/leaderboard`
- Pulse Dashboard → `/manager/pulse`

### Agent (from App.tsx routes - main sidebar pages)
- Dashboard → `/agent/dashboard`
- Pipeline → `/agent/pipeline`
- Incoming Leads → `/agent/incoming`
- My Customers → `/agent/customers`
- Operations → `/agent/operations`
- E-Sign → `/agent/esign`
- Dialer → `/agent/dialer`
- Messages → `/agent/messages`
- Pulse → `/agent/pulse`

### Dispatch (from `DispatchTeamChat.tsx`)
- Dashboard → `/dispatch/dashboard`
- Fleet Tracker → `/dispatch/fleet`
- Driver Assignments → `/dispatch/drivers`
- Route Management → `/dispatch/routes`
- Job Board → `/dispatch/jobs`
- E-Sign → `/dispatch/esign`

### Marketing (current SharedSidebar - unchanged)
- Dashboard, Content & SEO, Advertising, Conversion Lab, Action Items, Lead Sources, Competitors, Settings

### Creative Studio
Stays as standalone tabbed layout (no sidebar change needed).

## GitHub note
The repo at `github.com/maxwest525/trumovetransport-247b4200` returns a 404 (private or removed). All nav items above are sourced from the existing codebase files in this project.

## Changes

### 1. `SharedSidebar.tsx`
- Add `role` prop: `"agent" | "manager" | "admin" | "marketing" | "dispatch"`
- Define nav item arrays per role matching the items listed above, with matching icons
- Marketing keeps its 3-group layout (HQ, Engines, Intel); other roles use a flat list
- Wrap logo in `<Link to="/dashboard">` with `cursor-pointer`
- Replace subtitle `truncate` with `line-clamp-2`

### 2. Shell files (pass `role` prop)
- `AdminShell.tsx` → `role="admin"`
- `ManagerShell.tsx` → `role="manager"`
- `MarketingShell.tsx` → `role="marketing"`
- `DispatchShell.tsx` → `role="dispatch"`
- `GrowthEngineShell.tsx` → `role="marketing"`
- `AgentSidebar.tsx` → `role="agent"`

### Files modified
1. `src/components/layout/SharedSidebar.tsx`
2. `src/components/layout/AdminShell.tsx`
3. `src/components/layout/ManagerShell.tsx`
4. `src/components/layout/MarketingShell.tsx`
5. `src/components/layout/DispatchShell.tsx`
6. `src/components/layout/GrowthEngineShell.tsx`
7. `src/components/agent/AgentSidebar.tsx`

