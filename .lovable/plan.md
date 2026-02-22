

# Remove Customer-Facing Navigation from All Portal Pages

## Problem
Several portal/employee pages still render the customer-facing website header (with "Home", "Meet Trudy", "Connect With Us", etc.) because they use `SiteShell` or have no shell at all. These pages should use the same sidebar + top bar layout as the rest of the portal.

## Affected Pages

| Page | Current Shell | Problem |
|------|--------------|---------|
| AgentPipeline (`/agent/pipeline`) | `SiteShell` | Shows customer header + footer |
| ProfileSettings (`/agent/profile`) | `SiteShell` | Shows customer header + footer |
| AdminIntegrations (`/admin/integrations`) | `SiteShell` | Shows customer header + footer |
| AdminSupportTickets (`/admin/support-tickets`) | None (bare `div`) | No sidebar, just `AgentTopBar` |

Pages already correct (no changes needed): AgentDashboard, AdminDashboard, AdminUsersPage, ManagerDashboard, KpiDashboard.

## Solution

### 1. Wrap AdminIntegrations and AdminSupportTickets with AdminShell
Both are admin pages, so they should use the existing `AdminShell` component (which provides the admin sidebar, top bar with breadcrumbs, theme toggle, etc.).

- **AdminIntegrations**: Replace `SiteShell` + `AgentTopBar` with `AdminShell` and pass `breadcrumb=" / Integrations"`. Remove `SiteShell` and `AgentTopBar` imports.
- **AdminSupportTickets**: Wrap content in `AdminShell` with `breadcrumb=" / Support Tickets"`. Remove `AgentTopBar`.
- Update `AdminShell`'s `NAV_ITEMS` to include "Support Tickets" so it highlights correctly in the sidebar.

### 2. Create an AgentShell shared component
Similar to `AdminShell`, create `src/components/layout/AgentShell.tsx` that wraps agent pages with:
- The existing `AgentSidebar` (left)
- A top bar with breadcrumbs, theme toggle, notifications (matching the pattern in `AgentDashboard`)
- No customer-facing header/footer

### 3. Wrap AgentPipeline and ProfileSettings with AgentShell
- **AgentPipeline**: Replace `SiteShell` + `AgentTopBar` with `AgentShell`.
- **ProfileSettings**: Replace `SiteShell` + `AgentTopBar` with `AgentShell`.

## Technical Details

### New file: `src/components/layout/AgentShell.tsx`
- Accepts `children` and optional `breadcrumb` string
- Renders `AgentSidebar` on the left
- Renders the same top bar as `AgentDashboard` (Website link, Portal breadcrumb, theme toggle, bell, avatar)
- Calls `setPortalContext("agent")` on mount
- Exposes `onAction` for sidebar modals (workspace, operations, coaching, messaging) -- renders the modal components internally

### Modified files:
- **`src/pages/AgentPipeline.tsx`**: Replace `SiteShell`/`AgentTopBar` with `AgentShell`
- **`src/pages/ProfileSettings.tsx`**: Replace `SiteShell`/`AgentTopBar` with `AgentShell`
- **`src/pages/AdminIntegrations.tsx`**: Replace `SiteShell`/`AgentTopBar` with `AdminShell`
- **`src/pages/AdminSupportTickets.tsx`**: Wrap with `AdminShell`, remove `AgentTopBar`
- **`src/components/layout/AdminShell.tsx`**: Add "Support Tickets" to `NAV_ITEMS`

### Result
Every portal page will have a consistent sidebar + internal top bar layout. The customer-facing website header will never appear on any `/agent/*`, `/admin/*`, or `/manager/*` page.
