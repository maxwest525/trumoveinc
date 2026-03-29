
-- Add lead enrichment columns to leads table
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS ga_client_id text,
  ADD COLUMN IF NOT EXISTS consent_ad_storage text,
  ADD COLUMN IF NOT EXISTS consent_analytics_storage text,
  ADD COLUMN IF NOT EXISTS consent_ad_user_data text,
  ADD COLUMN IF NOT EXISTS consent_ad_personalization text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS gclid text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS enrichment_timestamp timestamptz,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS screen_resolution text,
  ADD COLUMN IF NOT EXISTS browser_language text,
  ADD COLUMN IF NOT EXISTS device_type text;
