
-- Backlinks table
CREATE TABLE public.backlinks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_domain TEXT NOT NULL,
  source_url TEXT,
  target_url TEXT NOT NULL DEFAULT '/',
  anchor_text TEXT,
  domain_authority INTEGER NOT NULL DEFAULT 0,
  page_authority INTEGER NOT NULL DEFAULT 0,
  follow_type TEXT NOT NULL DEFAULT 'dofollow',
  status TEXT NOT NULL DEFAULT 'active',
  first_seen DATE,
  last_verified DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.backlinks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketing staff can view backlinks" ON public.backlinks
  FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));

CREATE POLICY "Marketing staff can insert backlinks" ON public.backlinks
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));

CREATE POLICY "Marketing staff can update backlinks" ON public.backlinks
  FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));

CREATE POLICY "Marketing staff can delete backlinks" ON public.backlinks
  FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));

-- Domain Authority History table
CREATE TABLE public.domain_authority_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  domain_authority INTEGER NOT NULL DEFAULT 0,
  page_authority INTEGER,
  trust_flow INTEGER,
  citation_flow INTEGER,
  total_backlinks INTEGER,
  referring_domains INTEGER,
  source_tool TEXT DEFAULT 'moz',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.domain_authority_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketing staff can view da history" ON public.domain_authority_history
  FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));

CREATE POLICY "Marketing staff can insert da history" ON public.domain_authority_history
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));

CREATE POLICY "Marketing staff can update da history" ON public.domain_authority_history
  FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));

CREATE POLICY "Marketing staff can delete da history" ON public.domain_authority_history
  FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));
