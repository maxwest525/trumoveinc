
-- PPC Campaigns table
CREATE TABLE public.ppc_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  platform text NOT NULL DEFAULT 'google',
  status text NOT NULL DEFAULT 'active',
  budget numeric NOT NULL DEFAULT 0,
  spend numeric NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  cpc numeric NOT NULL DEFAULT 0,
  start_date date,
  end_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ppc_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketing staff can view ppc_campaigns"
  ON public.ppc_campaigns FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));

CREATE POLICY "Marketing staff can insert ppc_campaigns"
  ON public.ppc_campaigns FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));

CREATE POLICY "Marketing staff can update ppc_campaigns"
  ON public.ppc_campaigns FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));

CREATE POLICY "Marketing staff can delete ppc_campaigns"
  ON public.ppc_campaigns FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));

-- Blog Posts table
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  slug text,
  content text,
  excerpt text,
  status text NOT NULL DEFAULT 'draft',
  author_id uuid,
  published_at timestamp with time zone,
  featured_image_url text,
  tags text[] DEFAULT '{}',
  meta_title text,
  meta_description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketing staff can view blog_posts"
  ON public.blog_posts FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));

CREATE POLICY "Marketing staff can insert blog_posts"
  ON public.blog_posts FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));

CREATE POLICY "Marketing staff can update blog_posts"
  ON public.blog_posts FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));

CREATE POLICY "Marketing staff can delete blog_posts"
  ON public.blog_posts FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner','admin','manager','marketing']::app_role[]));
