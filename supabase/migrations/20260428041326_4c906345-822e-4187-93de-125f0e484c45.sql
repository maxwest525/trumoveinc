CREATE TABLE IF NOT EXISTS public.marketing_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  last_updated timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marketing_activity_log_section_key UNIQUE (section)
);

CREATE TABLE IF NOT EXISTS public.integration_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  is_connected boolean DEFAULT false,
  property_id text DEFAULT '',
  account_id text DEFAULT '',
  credentials jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT integration_credentials_provider_key UNIQUE (provider)
);

INSERT INTO public.marketing_activity_log (section, last_updated) VALUES
  ('seo_meta', now() - interval '999 days'),
  ('keywords', now() - interval '999 days'),
  ('backlinks', now() - interval '999 days'),
  ('ppc_campaigns', now() - interval '999 days'),
  ('blog_posts', now() - interval '999 days'),
  ('competitor_intel', now() - interval '999 days')
ON CONFLICT (section) DO NOTHING;

INSERT INTO public.integration_credentials (provider, is_connected) VALUES
  ('ga4', false),
  ('gsc', false),
  ('google_ads', false),
  ('meta', false)
ON CONFLICT (provider) DO NOTHING;

ALTER TABLE public.marketing_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_manage_marketing_activity_log" ON public.marketing_activity_log;
DROP POLICY IF EXISTS "staff_manage_integration_credentials" ON public.integration_credentials;

CREATE POLICY "staff_manage_marketing_activity_log"
ON public.marketing_activity_log
FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::public.app_role[]));

CREATE POLICY "staff_manage_integration_credentials"
ON public.integration_credentials
FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::public.app_role[]));

DROP TRIGGER IF EXISTS update_marketing_activity_log_updated_at ON public.marketing_activity_log;
CREATE TRIGGER update_marketing_activity_log_updated_at
BEFORE UPDATE ON public.marketing_activity_log
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_integration_credentials_updated_at ON public.integration_credentials;
CREATE TRIGGER update_integration_credentials_updated_at
BEFORE UPDATE ON public.integration_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();