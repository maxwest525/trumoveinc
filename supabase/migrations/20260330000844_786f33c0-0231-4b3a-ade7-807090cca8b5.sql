
-- Fix 1: Revoke direct authenticated SELECT on gsc_connections to prevent token exposure
-- Users should use gsc_connections_safe view instead
DROP POLICY IF EXISTS "Users can view own GSC connection" ON public.gsc_connections;

-- Fix 2: Restrict pulse-compliance-scripts storage upload/delete to managers+
DROP POLICY IF EXISTS "Authenticated can upload pulse scripts" ON storage.objects;
CREATE POLICY "Managers upload pulse scripts" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pulse-compliance-scripts'
    AND has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role])
  );

DROP POLICY IF EXISTS "Authenticated can delete pulse scripts" ON storage.objects;
CREATE POLICY "Managers delete pulse scripts" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'pulse-compliance-scripts'
    AND has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role])
  );

-- Fix 3: Restrict notifications INSERT to own user only (triggers use SECURITY DEFINER for cross-user)
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Users insert own notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Fix 4: Remove anon INSERT on esign_audit_trail (all inserts go through capture-esign-event edge function with service_role)
DROP POLICY IF EXISTS "Public can insert audit events" ON public.esign_audit_trail;
