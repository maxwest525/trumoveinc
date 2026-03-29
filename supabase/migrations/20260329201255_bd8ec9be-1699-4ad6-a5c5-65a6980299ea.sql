
-- Fix 1: Restrict support_tickets SELECT and UPDATE to staff roles only
DROP POLICY IF EXISTS "Authenticated users can view tickets" ON public.support_tickets;
CREATE POLICY "Staff can view tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));

DROP POLICY IF EXISTS "Authenticated users can update tickets" ON public.support_tickets;
CREATE POLICY "Staff can update tickets" ON public.support_tickets
  FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));

-- Fix 2: Restrict owner role insertion to owners only
DROP POLICY IF EXISTS "Owners and admins can insert roles" ON public.user_roles;
CREATE POLICY "Owners and admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    CASE
      WHEN role = 'owner'::app_role THEN has_role(auth.uid(), 'owner'::app_role)
      ELSE has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role)
    END
  );

-- Also fix UPDATE to prevent admins from changing roles to owner
DROP POLICY IF EXISTS "Owners and admins can update roles" ON public.user_roles;
CREATE POLICY "Owners and admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (
    CASE
      WHEN role = 'owner'::app_role THEN has_role(auth.uid(), 'owner'::app_role)
      ELSE has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role)
    END
  );
