

# Fix: Remove Client-Side Token Exposure on gsc_connections

## Problem
The `gsc_connections` table has a SELECT policy (`Users can view own GSC connection`) that returns **all columns** — including `access_token` and `refresh_token` — to authenticated users via the client API. Even though no client code currently queries this table directly (all token access goes through edge functions using `service_role`), the policy is an open door. Any future client-side query or browser dev tools could read raw OAuth tokens.

A `gsc_connections_safe` view (without token columns) already exists but isn't enforced as the sole read path.

## What Changes

### 1. Database Migration — Drop the Authenticated SELECT Policy
Remove the `Users can view own GSC connection` SELECT policy from the base table. This ensures tokens are **only** readable server-side via `service_role`.

```sql
DROP POLICY IF EXISTS "Users can view own GSC connection" ON public.gsc_connections;
```

The `service_role` ALL policy remains, so edge functions (`gsc-auth`, `gsc-data`) continue working unchanged.

### 2. No Code Changes Needed
- Edge functions (`gsc-auth/index.ts`, `gsc-data/index.ts`) use `SUPABASE_SERVICE_ROLE_KEY` — unaffected by this policy change.
- No client-side `.tsx`/`.ts` code queries the `gsc_connections` base table. The safe view is available if client reads are ever needed.
- The INSERT, UPDATE, and DELETE policies remain scoped to `user_id = auth.uid()` for user-initiated operations (connecting, selecting property, disconnecting).

## Impact
- Tokens become completely inaccessible from the client API
- All existing functionality (connect, disconnect, list properties, fetch data) continues working through edge functions
- The `gsc_connections_safe` view remains available for any future client-side status checks

