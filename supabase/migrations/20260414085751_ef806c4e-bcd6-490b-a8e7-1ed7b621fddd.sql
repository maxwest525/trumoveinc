
-- Drop the existing overly permissive ALL policy
DROP POLICY IF EXISTS "Users can manage own watch patterns" ON public.pulse_watch_patterns;
DROP POLICY IF EXISTS "Users manage own patterns" ON public.pulse_watch_patterns;

-- Users can read/write their own patterns
CREATE POLICY "Users can manage own watch patterns"
  ON public.pulse_watch_patterns
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Only managers/admins/owners can access shared (null user_id) patterns
CREATE POLICY "Staff can manage shared watch patterns"
  ON public.pulse_watch_patterns
  FOR ALL
  TO authenticated
  USING (user_id IS NULL AND has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]))
  WITH CHECK (user_id IS NULL AND has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));
