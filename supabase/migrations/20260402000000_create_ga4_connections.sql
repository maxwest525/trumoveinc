-- GA4 OAuth connections: stores persistent tokens so users only connect once
CREATE TABLE IF NOT EXISTS ga4_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz NOT NULL,
  property_id text,
  connected_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ga4_connections_user_id_idx ON ga4_connections(user_id);

ALTER TABLE ga4_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ga4 connections"
  ON ga4_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
