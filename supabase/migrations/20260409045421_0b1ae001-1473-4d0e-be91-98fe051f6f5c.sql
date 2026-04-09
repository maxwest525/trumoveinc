
-- Fix 1: Set search_path on update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix 2: gsc_page_data - the authenticated SELECT with USING(true) is intentional for read access
-- but ensure no other always-true policies exist for write ops (currently only service_role ALL which is fine)

-- Fix 3: pipeline_stages - restrict write operations to owner/admin only
DROP POLICY IF EXISTS "Anyone authed can read stages" ON public.pipeline_stages;

CREATE POLICY "Anyone authed can read stages" ON public.pipeline_stages
  FOR SELECT TO authenticated
  USING (true);

-- Add write policies restricted to admin roles
CREATE POLICY "Admins can insert stages" ON public.pipeline_stages
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE POLICY "Admins can update stages" ON public.pipeline_stages
  FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE POLICY "Admins can delete stages" ON public.pipeline_stages
  FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));
