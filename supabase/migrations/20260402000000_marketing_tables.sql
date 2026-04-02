-- Marketing tables migration for TruMove CRM
-- Run once in Supabase SQL editor

-- 1. SEO Meta Tag Overrides (controls live site meta tags)
CREATE TABLE IF NOT EXISTS seo_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url_path text NOT NULL,
  title text DEFAULT '',
  description text DEFAULT '',
  canonical_url text DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT seo_overrides_url_path_key UNIQUE (url_path)
);

-- 2. Marketing Activity Log (tracks last updated per section)
CREATE TABLE IF NOT EXISTS marketing_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  last_updated timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT 'user',
  CONSTRAINT marketing_activity_log_section_key UNIQUE (section)
);

INSERT INTO marketing_activity_log (section, last_updated) VALUES
  ('seo_meta', now() - interval '999 days'),
  ('keywords', now() - interval '999 days'),
  ('backlinks', now() - interval '999 days'),
  ('ppc_campaigns', now() - interval '999 days'),
  ('blog_posts', now() - interval '999 days'),
  ('competitor_intel', now() - interval '999 days')
ON CONFLICT (section) DO NOTHING;

-- 3. Integration credentials
CREATE TABLE IF NOT EXISTS integration_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  is_connected boolean DEFAULT false,
  property_id text DEFAULT '',
  account_id text DEFAULT '',
  credentials jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT integration_credentials_provider_key UNIQUE (provider)
);

INSERT INTO integration_credentials (provider, is_connected) VALUES
  ('ga4', false),
  ('gsc', false),
  ('google_ads', false),
  ('meta', false)
ON CONFLICT (provider) DO NOTHING;

-- 4. Keyword Rankings
CREATE TABLE IF NOT EXISTS keyword_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  position integer,
  previous_position integer,
  search_volume integer DEFAULT 0,
  difficulty integer DEFAULT 0,
  intent text DEFAULT 'informational',
  notes text DEFAULT '',
  is_tracked boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- 5. Backlinks
CREATE TABLE IF NOT EXISTS backlinks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_domain text NOT NULL,
  source_url text DEFAULT '',
  target_url text DEFAULT 'https://trumoveinc.com/',
  anchor_text text DEFAULT '',
  domain_authority integer DEFAULT 0,
  spam_score integer DEFAULT 0,
  status text DEFAULT 'active',
  first_seen date DEFAULT CURRENT_DATE,
  updated_at timestamptz DEFAULT now()
);

-- 6. Domain Authority History
CREATE TABLE IF NOT EXISTS domain_authority_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  da_score integer NOT NULL DEFAULT 0,
  pa_score integer DEFAULT 0,
  total_backlinks integer DEFAULT 0,
  referring_domains integer DEFAULT 0,
  recorded_date date NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT domain_authority_history_date_key UNIQUE (recorded_date)
);

INSERT INTO domain_authority_history (da_score, pa_score, total_backlinks, referring_domains, recorded_date)
VALUES (1, 1, 0, 0, CURRENT_DATE)
ON CONFLICT (recorded_date) DO NOTHING;

-- 7. PPC Campaigns
CREATE TABLE IF NOT EXISTS ppc_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  channel text DEFAULT 'google_ads',
  status text DEFAULT 'paused',
  daily_budget numeric DEFAULT 0,
  monthly_budget numeric DEFAULT 0,
  total_spend numeric DEFAULT 0,
  clicks integer DEFAULT 0,
  impressions integer DEFAULT 0,
  conversions integer DEFAULT 0,
  cpc numeric DEFAULT 0,
  cpa numeric DEFAULT 0,
  roas numeric DEFAULT 0,
  external_id text DEFAULT '',
  notes text DEFAULT '',
  start_date date,
  updated_at timestamptz DEFAULT now()
);

-- 8. Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text DEFAULT '',
  content text DEFAULT '',
  excerpt text DEFAULT '',
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  target_keyword text DEFAULT '',
  word_count integer DEFAULT 0,
  status text DEFAULT 'draft',
  author text DEFAULT 'TruMove Team',
  category text DEFAULT 'moving-tips',
  published_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT blog_posts_slug_key UNIQUE (slug)
);

-- Enable RLS
ALTER TABLE seo_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_authority_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppc_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "auth_all_seo_overrides" ON seo_overrides FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_activity_log" ON marketing_activity_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_integrations" ON integration_credentials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_keywords" ON keyword_rankings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_backlinks" ON backlinks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_da_history" ON domain_authority_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_ppc" ON ppc_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_blog" ON blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
