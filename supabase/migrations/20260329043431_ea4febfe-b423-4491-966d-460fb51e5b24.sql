
-- ============================================================
-- 1) Add created_by uuid columns to pulse tables
-- ============================================================
ALTER TABLE public.pulse_calls ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.pulse_alerts ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.pulse_agent_messages ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.pulse_transcript_annotations ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================================
-- 2) Fix pulse_calls RLS: scope to creator + managers
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can insert pulse_calls" ON public.pulse_calls;
DROP POLICY IF EXISTS "Authenticated can read pulse_calls" ON public.pulse_calls;
DROP POLICY IF EXISTS "Authenticated can update pulse_calls" ON public.pulse_calls;

CREATE POLICY "Users insert own pulse_calls" ON public.pulse_calls
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users read own pulse_calls" ON public.pulse_calls
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Users update own pulse_calls" ON public.pulse_calls
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ============================================================
-- 3) Fix pulse_alerts RLS: scope to creator + managers
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can insert pulse_alerts" ON public.pulse_alerts;
DROP POLICY IF EXISTS "Authenticated can read pulse_alerts" ON public.pulse_alerts;
DROP POLICY IF EXISTS "Authenticated can delete pulse_alerts" ON public.pulse_alerts;

CREATE POLICY "Users insert own pulse_alerts" ON public.pulse_alerts
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users read own pulse_alerts" ON public.pulse_alerts
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers delete pulse_alerts" ON public.pulse_alerts
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ============================================================
-- 4) Fix pulse_agent_messages RLS: managers write, scoped read
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can insert pulse_agent_messages" ON public.pulse_agent_messages;
DROP POLICY IF EXISTS "Authenticated can read pulse_agent_messages" ON public.pulse_agent_messages;
DROP POLICY IF EXISTS "Authenticated can update pulse_agent_messages" ON public.pulse_agent_messages;

CREATE POLICY "Managers insert pulse_agent_messages" ON public.pulse_agent_messages
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Users read pulse_agent_messages" ON public.pulse_agent_messages
  FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role])
    OR agent_name = (SELECT display_name FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Managers update pulse_agent_messages" ON public.pulse_agent_messages
  FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ============================================================
-- 5) Fix pulse_compliance_scripts RLS: managers write, all auth read
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can delete pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Authenticated can insert pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Authenticated can read pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Authenticated can update pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Authenticated can manage pulse_compliance_scripts" ON public.pulse_compliance_scripts;

CREATE POLICY "All authenticated read pulse_compliance_scripts" ON public.pulse_compliance_scripts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Managers insert pulse_compliance_scripts" ON public.pulse_compliance_scripts
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers update pulse_compliance_scripts" ON public.pulse_compliance_scripts
  FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers delete pulse_compliance_scripts" ON public.pulse_compliance_scripts
  FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ============================================================
-- 6) Fix pulse_transcript_annotations RLS: scope to creator + managers
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can insert pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Authenticated can read pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Authenticated can delete pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Authenticated can manage pulse_transcript_annotations" ON public.pulse_transcript_annotations;

CREATE POLICY "Users insert own annotations" ON public.pulse_transcript_annotations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users read own annotations" ON public.pulse_transcript_annotations
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Users delete own annotations" ON public.pulse_transcript_annotations
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ============================================================
-- 7) Fix pulse_watch_patterns RLS: scope to owner or managers
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can manage pulse_watch_patterns" ON public.pulse_watch_patterns;

CREATE POLICY "Users manage own watch_patterns" ON public.pulse_watch_patterns
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]))
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ============================================================
-- 8) Fix pulse_notification_settings RLS
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can manage pulse_notification_settings" ON public.pulse_notification_settings;

CREATE POLICY "Users manage own notification_settings" ON public.pulse_notification_settings
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]))
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ============================================================
-- 9) Fix user_roles SELECT: own roles + privileged users
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can read roles" ON public.user_roles;

CREATE POLICY "Users read own roles or privileged" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ============================================================
-- 10) Create a safe view for GSC connections (no tokens)
-- ============================================================
CREATE OR REPLACE VIEW public.gsc_connections_safe AS
  SELECT id, user_id, selected_property, token_expires_at, connected_at, updated_at
  FROM public.gsc_connections;
