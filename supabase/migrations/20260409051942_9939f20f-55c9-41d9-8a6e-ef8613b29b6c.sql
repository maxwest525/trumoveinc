
-- Add RLS policy on realtime.messages to restrict channel subscriptions to internal staff
-- RLS is already enabled on this table, but no policies exist

CREATE POLICY "Staff can subscribe to realtime channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['owner'::public.app_role, 'admin'::public.app_role, 'manager'::public.app_role, 'agent'::public.app_role, 'marketing'::public.app_role, 'accounting'::public.app_role])
);

CREATE POLICY "Staff can broadcast to realtime channels"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['owner'::public.app_role, 'admin'::public.app_role, 'manager'::public.app_role, 'agent'::public.app_role, 'marketing'::public.app_role, 'accounting'::public.app_role])
);
