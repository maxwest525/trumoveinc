
Fix the preview/login loop by correcting auth state + route restore behavior.

What’s actually happening
- This does not look like a broken preview renderer.
- On preview domains, `/` intentionally goes to `/dashboard`.
- Protected marketing routes like `/marketing/content-seo` use `RoleGuard`. If you are logged out, it immediately redirects you to `/dashboard`, so the page you were trying to preview is lost.
- After sign-in, `WorkspaceHub` and `RoleGuard` both rely on `useUserRoles()`, but that hook only fetches roles once on mount. If login happens after mount, roles stay empty until a hard refresh.
- Result: you get bounced away from the page, and after login the app can still behave like you have no access.

Plan
1. Make role loading reactive
   - Update `useUserRoles` to listen for auth changes and re-fetch roles whenever the session/user changes.
   - Keep loading true until auth is resolved for the current user, so guards do not decide too early.

2. Preserve the page you were trying to open
   - Update `RoleGuard` so:
     - not signed in → redirect to `/dashboard` with a saved `from` route
     - signed in but wrong role → show a clear access state instead of silently bouncing back
   - This keeps deep links like `/marketing/content-seo` intact through login.

3. Send users back to the preview after login
   - Update `WorkspaceHub` to read the saved `from` route and navigate there once auth + roles are ready.
   - Keep the current workspace chooser for normal `/dashboard` visits.

4. Make the failure state understandable
   - If the account truly lacks `owner`/`marketing` access in `user_roles`, show an explicit “no access to Marketing” state with a path back to the workspace hub.
   - No more “disappearing preview” behavior.

5. Validate the real flows
   - Logged out → open `/marketing/content-seo` → sign in → return to `/marketing/content-seo`
   - Logged in owner/marketing user → deep link works without refresh
   - Logged in non-marketing user → clear access message, no redirect loop
   - Sign out and sign back in on mobile preview

Files likely affected
- `src/hooks/useUserRoles.ts`
- `src/components/RoleGuard.tsx`
- `src/pages/WorkspaceHub.tsx`
- Possibly `src/components/auth/PortalAuthForm.tsx`

Technical details
- Current root causes are in:
  - `RoleGuard.tsx` redirecting all failures to `/dashboard`
  - `useUserRoles.ts` fetching once only, with no auth subscription
  - `WorkspaceHub.tsx` having no “return to requested page” logic after login
- I would also verify that your account really has the expected role in `user_roles`; if the role is missing, the app should still deny access, but it should do so clearly instead of looking like the preview vanished.
- I would not change auth provider settings or preview domain config first; the main issue is client-side auth/routing flow.
