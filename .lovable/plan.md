

## Plan: Add Notification Badge to Portal Header

### Change
In `src/pages/AgentLogin.tsx`, import `useNotifications` and render the `unreadCount` as a small red badge next to the user's display name in the greeting header area — right after the email/sign-out line, or inline with the name.

### Implementation
- Import `useNotifications` hook (already exists at `src/hooks/useNotifications.ts`)
- Import `Bell` icon from lucide-react
- Add a small destructive-colored badge next to the greeting line or email row showing unread count (e.g., `3 unread`) when count > 0
- Style: small pill badge, consistent with the existing `Badge` component or a simple `span` with `bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-[10px]`

### File changed
- `src/pages/AgentLogin.tsx` — add hook import, render badge in header section

