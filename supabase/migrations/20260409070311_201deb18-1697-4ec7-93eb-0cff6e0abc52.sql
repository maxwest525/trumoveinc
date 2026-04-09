-- Add a strict user-scoped SELECT policy so only token owners can read their own row
-- This prevents any future policy misconfiguration from exposing all tokens
CREATE POLICY "Users can view own GSC connection"
ON public.gsc_connections
FOR SELECT
TO authenticated
USING (user_id = auth.uid());