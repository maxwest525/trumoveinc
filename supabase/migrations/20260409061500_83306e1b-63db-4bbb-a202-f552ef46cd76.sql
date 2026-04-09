
-- Fix 1: agent_coaching_stats - change policies from public to authenticated role
DROP POLICY IF EXISTS "Agents can view their own stats" ON public.agent_coaching_stats;
DROP POLICY IF EXISTS "Agents can insert their own stats" ON public.agent_coaching_stats;
DROP POLICY IF EXISTS "Agents can update their own stats" ON public.agent_coaching_stats;

CREATE POLICY "Agents can view their own stats"
ON public.agent_coaching_stats
FOR SELECT
TO authenticated
USING (agent_id = auth.uid());

CREATE POLICY "Agents can insert their own stats"
ON public.agent_coaching_stats
FOR INSERT
TO authenticated
WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Agents can update their own stats"
ON public.agent_coaching_stats
FOR UPDATE
TO authenticated
USING (agent_id = auth.uid());

-- Fix 2: gsc_connections - ensure no authenticated SELECT policy exposes raw tokens
-- The table already has service_role full access + owner-scoped write policies
-- but no SELECT for authenticated. This is correct - tokens should only be read server-side.
-- However, let's explicitly confirm by dropping any stray SELECT policies and keeping it locked down.
-- The gsc_connections_safe view (without token columns) already exists for client-side reads.
