-- Fix #1: Remove blanket "any authenticated user can read all profiles" policy.
-- Self-view + staff-view policies already exist and are sufficient.
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Fix #2: Remove redundant overly-permissive pulse_watch_patterns policy.
-- "Users can manage own watch patterns" + "Staff can manage shared watch patterns"
-- already cover the legitimate access cases without the OR (user_id IS NULL) leak.
DROP POLICY IF EXISTS "Users manage own watch_patterns" ON public.pulse_watch_patterns;

-- Fix #3: Revoke direct client read access to OAuth token columns on gsc_connections.
-- Service role (used by edge functions) retains full access.
REVOKE SELECT (access_token, refresh_token) ON public.gsc_connections FROM authenticated, anon;