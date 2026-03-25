
CREATE TABLE public.seo_audit_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  fetched_title TEXT,
  fetched_description TEXT,
  fetched_h1 TEXT,
  fetched_canonical TEXT,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_title TEXT,
  suggested_description TEXT,
  suggested_h1 TEXT,
  ai_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  audit_batch_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_audit_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view seo audit pages"
ON public.seo_audit_pages FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'marketing'::app_role]));

CREATE POLICY "Staff can insert seo audit pages"
ON public.seo_audit_pages FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'marketing'::app_role]));

CREATE POLICY "Staff can update seo audit pages"
ON public.seo_audit_pages FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'marketing'::app_role]));

CREATE POLICY "Staff can delete seo audit pages"
ON public.seo_audit_pages FOR DELETE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'marketing'::app_role]));
