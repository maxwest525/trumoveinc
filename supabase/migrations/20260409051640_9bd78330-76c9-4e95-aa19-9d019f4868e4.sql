
-- Drop any existing policies that conflict
DROP POLICY IF EXISTS "Users insert own pulse_calls" ON public.pulse_calls;
DROP POLICY IF EXISTS "Users read own or managed pulse_calls" ON public.pulse_calls;
DROP POLICY IF EXISTS "Users update own pulse_calls" ON public.pulse_calls;
DROP POLICY IF EXISTS "Users read own or managed pulse_alerts" ON public.pulse_alerts;
DROP POLICY IF EXISTS "Users insert own pulse_alerts" ON public.pulse_alerts;
DROP POLICY IF EXISTS "Users delete own pulse_alerts" ON public.pulse_alerts;
DROP POLICY IF EXISTS "Users read own or managed pulse_agent_messages" ON public.pulse_agent_messages;
DROP POLICY IF EXISTS "Users insert own pulse_agent_messages" ON public.pulse_agent_messages;
DROP POLICY IF EXISTS "Users update own pulse_agent_messages" ON public.pulse_agent_messages;
DROP POLICY IF EXISTS "Users read own or managed pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Users insert own pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Users delete own pulse_transcript_annotations" ON public.pulse_transcript_annotations;

-- Also drop any remaining overpermissive policies
DROP POLICY IF EXISTS "Authenticated can read pulse_calls" ON public.pulse_calls;
DROP POLICY IF EXISTS "Authenticated can insert pulse_calls" ON public.pulse_calls;
DROP POLICY IF EXISTS "Authenticated can update pulse_calls" ON public.pulse_calls;
DROP POLICY IF EXISTS "Authenticated users can read pulse_calls" ON public.pulse_calls;
DROP POLICY IF EXISTS "Authenticated users can insert pulse_calls" ON public.pulse_calls;
DROP POLICY IF EXISTS "Authenticated users can update pulse_calls" ON public.pulse_calls;

DROP POLICY IF EXISTS "Authenticated can read pulse_alerts" ON public.pulse_alerts;
DROP POLICY IF EXISTS "Authenticated can insert pulse_alerts" ON public.pulse_alerts;
DROP POLICY IF EXISTS "Authenticated can delete pulse_alerts" ON public.pulse_alerts;
DROP POLICY IF EXISTS "Authenticated users can read pulse_alerts" ON public.pulse_alerts;
DROP POLICY IF EXISTS "Authenticated users can insert pulse_alerts" ON public.pulse_alerts;
DROP POLICY IF EXISTS "Authenticated users can delete pulse_alerts" ON public.pulse_alerts;

DROP POLICY IF EXISTS "Authenticated can read pulse_agent_messages" ON public.pulse_agent_messages;
DROP POLICY IF EXISTS "Authenticated can insert pulse_agent_messages" ON public.pulse_agent_messages;
DROP POLICY IF EXISTS "Authenticated can update pulse_agent_messages" ON public.pulse_agent_messages;
DROP POLICY IF EXISTS "Authenticated users can read pulse_agent_messages" ON public.pulse_agent_messages;
DROP POLICY IF EXISTS "Authenticated users can insert pulse_agent_messages" ON public.pulse_agent_messages;
DROP POLICY IF EXISTS "Authenticated users can update pulse_agent_messages" ON public.pulse_agent_messages;

DROP POLICY IF EXISTS "Authenticated can read pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Authenticated can insert pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Authenticated can update pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Authenticated can delete pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Authenticated users can read pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Authenticated users can insert pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Authenticated users can update pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Authenticated users can delete pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Managers can insert pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Managers can update pulse_compliance_scripts" ON public.pulse_compliance_scripts;
DROP POLICY IF EXISTS "Managers can delete pulse_compliance_scripts" ON public.pulse_compliance_scripts;

DROP POLICY IF EXISTS "Authenticated can read pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Authenticated can insert pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Authenticated can delete pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Authenticated users can read pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Authenticated users can insert pulse_transcript_annotations" ON public.pulse_transcript_annotations;
DROP POLICY IF EXISTS "Authenticated users can delete pulse_transcript_annotations" ON public.pulse_transcript_annotations;

-- ===== PULSE_CALLS =====
CREATE POLICY "pulse_calls_select_scoped" ON public.pulse_calls
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "pulse_calls_insert_scoped" ON public.pulse_calls
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "pulse_calls_update_scoped" ON public.pulse_calls
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ===== PULSE_ALERTS =====
CREATE POLICY "pulse_alerts_select_scoped" ON public.pulse_alerts
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "pulse_alerts_insert_scoped" ON public.pulse_alerts
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "pulse_alerts_delete_scoped" ON public.pulse_alerts
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ===== PULSE_AGENT_MESSAGES =====
CREATE POLICY "pulse_agent_messages_select_scoped" ON public.pulse_agent_messages
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "pulse_agent_messages_insert_scoped" ON public.pulse_agent_messages
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "pulse_agent_messages_update_scoped" ON public.pulse_agent_messages
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ===== PULSE_COMPLIANCE_SCRIPTS =====
CREATE POLICY "pulse_compliance_scripts_select_all" ON public.pulse_compliance_scripts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "pulse_compliance_scripts_insert_mgr" ON public.pulse_compliance_scripts
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "pulse_compliance_scripts_update_mgr" ON public.pulse_compliance_scripts
  FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "pulse_compliance_scripts_delete_mgr" ON public.pulse_compliance_scripts
  FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ===== PULSE_TRANSCRIPT_ANNOTATIONS =====
CREATE POLICY "pulse_transcript_annotations_select_scoped" ON public.pulse_transcript_annotations
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "pulse_transcript_annotations_insert_scoped" ON public.pulse_transcript_annotations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

CREATE POLICY "pulse_transcript_annotations_delete_scoped" ON public.pulse_transcript_annotations
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role]));

-- ===== NOTIFICATIONS: Fix INSERT =====
DROP POLICY IF EXISTS "Users insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

CREATE POLICY "notifications_insert_own" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ===== STORAGE: Restrict pulse-compliance-scripts =====
DROP POLICY IF EXISTS "Authenticated can upload pulse scripts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete pulse scripts" ON storage.objects;
DROP POLICY IF EXISTS "Managers upload pulse scripts" ON storage.objects;
DROP POLICY IF EXISTS "Managers delete pulse scripts" ON storage.objects;

CREATE POLICY "mgr_upload_pulse_scripts" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pulse-compliance-scripts'
    AND has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role])
  );

CREATE POLICY "mgr_delete_pulse_scripts" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'pulse-compliance-scripts'
    AND has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role])
  );

-- ===== ESIGN AUDIT TRAIL: Restrict anon inserts =====
DROP POLICY IF EXISTS "Public can insert audit events" ON public.esign_audit_trail;
DROP POLICY IF EXISTS "Anon can insert valid audit events" ON public.esign_audit_trail;

CREATE POLICY "esign_audit_anon_insert_validated" ON public.esign_audit_trail
  FOR INSERT TO anon
  WITH CHECK (
    event_type = ANY(ARRAY['viewed', 'opened', 'signed', 'declined', 'consent_given'])
    AND EXISTS (SELECT 1 FROM public.esign_documents WHERE ref_number = esign_audit_trail.ref_number)
  );

-- ===== GSC CONNECTIONS: Remove direct authenticated SELECT =====
DROP POLICY IF EXISTS "Users can view own GSC connection" ON public.gsc_connections;
