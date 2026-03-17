

## The Problem

You're right — the Pulse pages are not mapped up correctly. Here's what's happening:

1. **Standalone `/pulse/*` routes still exist** (`/pulse`, `/pulse/agent`, `/pulse/dashboard`, `/pulse/call/:id`, `/pulse/manager`) — these render without any workspace shell (no sidebar, no header, no chat buttons, no notifications).

2. **Internal links point to standalone routes** — When you click "View Call Review" from the Pulse Dashboard, it links to `/pulse/call/:id` (standalone), not a workspace-wrapped version. The "Back to Dashboard" link in Call Review also points to `/pulse/dashboard` (standalone).

3. **Result**: You click through from your Manager/Admin/Agent workspace and suddenly lose your entire shell — sidebar, chat, notifications all disappear.

## The Fix

1. **Make PulseCallReview embeddable** — Add the same `embedded` prop pattern used by PulseAgent, PulseDashboard, and PulseManager, so it can render inside any workspace shell.

2. **Create workspace-wrapped Call Review pages**:
   - `/agent/pulse/call/:callId` → AgentShell + PulseCallReview
   - `/manager/pulse/call/:callId` → ManagerShell + PulseCallReview
   - `/admin/pulse/call/:callId` → AdminShell + PulseCallReview

3. **Make internal links context-aware** — PulseDashboard's "View Call Review" link and PulseCallReview's "Back to Dashboard" link need to use the correct workspace prefix based on whether they're embedded and which portal they're in. Pass a `basePath` prop (e.g., `/agent/pulse`, `/manager/pulse`) so links resolve correctly.

4. **Remove or redirect standalone `/pulse/*` routes** — Either remove them entirely or redirect them to the appropriate workspace route based on user role.

5. **Register new routes in App.tsx**:
   - `/agent/pulse/call/:callId`
   - `/manager/pulse/call/:callId`
   - `/admin/pulse/call/:callId`

## Files to Change

- `src/pages/pulse/PulseCallReview.tsx` — Add `embedded` and `basePath` props
- `src/pages/pulse/PulseDashboard.tsx` — Accept and use `basePath` prop for call review links
- `src/pages/AgentPulse.tsx` — Pass `basePath="/agent/pulse"` to PulseAgent/PulseDashboard
- `src/pages/ManagerPulse.tsx` — Pass `basePath="/manager/pulse"`
- `src/pages/AdminPulse.tsx` — Pass `basePath="/admin/pulse"`
- `src/App.tsx` — Add new call review routes, optionally remove standalone `/pulse/*` routes
- New files: `AgentPulseCallReview.tsx`, `ManagerPulseCallReview.tsx`, `AdminPulseCallReview.tsx` (thin wrappers)

