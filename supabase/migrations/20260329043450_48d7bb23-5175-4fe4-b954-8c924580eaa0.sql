
-- Fix view to use SECURITY INVOKER (safe for RLS)
DROP VIEW IF EXISTS public.gsc_connections_safe;
CREATE VIEW public.gsc_connections_safe 
  WITH (security_invoker = true)
AS
  SELECT id, user_id, selected_property, token_expires_at, connected_at, updated_at
  FROM public.gsc_connections;
