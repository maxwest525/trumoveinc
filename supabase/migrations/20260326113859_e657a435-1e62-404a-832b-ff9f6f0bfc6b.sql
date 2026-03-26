
CREATE TABLE public.seo_compliance_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.seo_compliance_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view seo compliance settings"
  ON public.seo_compliance_settings FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'marketing'::app_role]));

CREATE POLICY "Admins can insert seo compliance settings"
  ON public.seo_compliance_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE POLICY "Admins can update seo compliance settings"
  ON public.seo_compliance_settings FOR UPDATE
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

CREATE POLICY "Admins can delete seo compliance settings"
  ON public.seo_compliance_settings FOR DELETE
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));

-- Seed defaults
INSERT INTO public.seo_compliance_settings (setting_key, setting_value) VALUES
('allowed_service_terms', '["long distance", "interstate", "cross-country", "nationwide", "residential relocation", "commercial relocation", "auto transport", "vehicle shipping", "moving broker", "household goods shipping"]'),
('forbidden_terms', '["local", "local movers", "near me", "same-day local", "local moving", "local service", "local mover"]'),
('required_disclaimer', '""'),
('tone', '"professional"');
