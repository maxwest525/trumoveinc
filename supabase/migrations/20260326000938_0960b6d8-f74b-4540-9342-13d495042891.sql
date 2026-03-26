
CREATE TABLE public.seo_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url_path text NOT NULL UNIQUE,
  title text,
  description text,
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_overrides ENABLE ROW LEVEL SECURITY;

-- Anyone can read (needed for public pages to pick up overrides)
CREATE POLICY "Public can read seo_overrides"
  ON public.seo_overrides FOR SELECT
  TO public
  USING (true);

-- Marketing/admin/owner can manage
CREATE POLICY "Staff can insert seo_overrides"
  ON public.seo_overrides FOR INSERT
  TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'marketing'::app_role, 'manager'::app_role]));

CREATE POLICY "Staff can update seo_overrides"
  ON public.seo_overrides FOR UPDATE
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'marketing'::app_role, 'manager'::app_role]));

CREATE POLICY "Staff can delete seo_overrides"
  ON public.seo_overrides FOR DELETE
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'marketing'::app_role, 'manager'::app_role]));
