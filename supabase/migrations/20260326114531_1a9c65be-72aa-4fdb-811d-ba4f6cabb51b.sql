
-- GSC OAuth connections (one per user)
CREATE TABLE public.gsc_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expires_at timestamp with time zone NOT NULL,
  selected_property text,
  connected_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gsc_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own GSC connection"
  ON public.gsc_connections FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own GSC connection"
  ON public.gsc_connections FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own GSC connection"
  ON public.gsc_connections FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own GSC connection"
  ON public.gsc_connections FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Service role needs full access for edge functions
CREATE POLICY "Service role full access gsc_connections"
  ON public.gsc_connections FOR ALL
  USING (auth.role() = 'service_role');

-- Cached GSC page performance data
CREATE TABLE public.gsc_page_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property text NOT NULL,
  page_url text NOT NULL,
  query text NOT NULL,
  clicks integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  ctr numeric NOT NULL DEFAULT 0,
  position numeric NOT NULL DEFAULT 0,
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  date_range_start date,
  date_range_end date
);

ALTER TABLE public.gsc_page_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read GSC page data"
  ON public.gsc_page_data FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service role manages GSC page data"
  ON public.gsc_page_data FOR ALL
  USING (auth.role() = 'service_role');

-- Index for fast lookup by page URL
CREATE INDEX idx_gsc_page_data_page_url ON public.gsc_page_data(page_url);
CREATE INDEX idx_gsc_page_data_property ON public.gsc_page_data(property);
