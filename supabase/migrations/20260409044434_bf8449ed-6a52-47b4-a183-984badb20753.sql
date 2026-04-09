
-- Fix 1: calls table - restrict all policies to authenticated role only
DROP POLICY IF EXISTS "Agents can insert their own calls" ON public.calls;
DROP POLICY IF EXISTS "Agents can update their own calls" ON public.calls;
DROP POLICY IF EXISTS "Agents can view their own calls" ON public.calls;

CREATE POLICY "Agents can insert their own calls" ON public.calls
  FOR INSERT TO authenticated
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Agents can update their own calls" ON public.calls
  FOR UPDATE TO authenticated
  USING (agent_id = auth.uid());

CREATE POLICY "Agents can view their own calls" ON public.calls
  FOR SELECT TO authenticated
  USING (
    agent_id = auth.uid()
    OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role])
  );

-- Fix 2: pulse_notification_settings - remove user_id IS NULL from general access
DROP POLICY IF EXISTS "Users manage own notification_settings" ON public.pulse_notification_settings;

-- Users can only access their own settings
CREATE POLICY "Users manage own notification_settings" ON public.pulse_notification_settings
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role])
  )
  WITH CHECK (
    user_id = auth.uid()
    OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role])
  );
