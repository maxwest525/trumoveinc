-- 1. Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs (actor_id);
CREATE INDEX idx_audit_logs_table ON public.audit_logs (table_name);
CREATE INDEX idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX idx_audit_logs_record ON public.audit_logs (table_name, record_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only owners/admins can read; only service role / triggers can write
CREATE POLICY "Owners and admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE POLICY "Service role manages audit logs"
  ON public.audit_logs FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 2. Generic trigger function
CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_email TEXT;
  v_record_id TEXT;
  v_old JSONB;
  v_new JSONB;
  v_changed TEXT[];
BEGIN
  -- Resolve actor email (best effort)
  IF v_actor IS NOT NULL THEN
    SELECT email INTO v_email FROM public.profiles WHERE id = v_actor LIMIT 1;
  END IF;

  IF (TG_OP = 'DELETE') THEN
    v_old := to_jsonb(OLD);
    v_record_id := COALESCE(v_old->>'id', '');
  ELSIF (TG_OP = 'INSERT') THEN
    v_new := to_jsonb(NEW);
    v_record_id := COALESCE(v_new->>'id', '');
  ELSE -- UPDATE
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_record_id := COALESCE(v_new->>'id', v_old->>'id', '');
    SELECT array_agg(key) INTO v_changed
      FROM jsonb_each(v_new)
      WHERE v_new->key IS DISTINCT FROM v_old->key;
  END IF;

  INSERT INTO public.audit_logs
    (actor_id, actor_email, action, table_name, record_id, old_data, new_data, changed_fields)
  VALUES
    (v_actor, v_email, TG_OP, TG_TABLE_NAME, v_record_id, v_old, v_new, v_changed);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 3. Attach to sensitive tables
CREATE TRIGGER audit_leads
  AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER audit_deals
  AFTER INSERT OR UPDATE OR DELETE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER audit_customer_portal_access
  AFTER INSERT OR UPDATE OR DELETE ON public.customer_portal_access
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- 4. Purge function (1-year retention)
CREATE OR REPLACE FUNCTION public.purge_old_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.audit_logs
   WHERE created_at < (now() - INTERVAL '365 days');
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- 5. Schedule daily purge (3:15 AM UTC)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'purge-audit-logs-daily',
  '15 3 * * *',
  $$ SELECT public.purge_old_audit_logs(); $$
);