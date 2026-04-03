CREATE TABLE IF NOT EXISTS legacy_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  trade text NOT NULL,
  vendor text NOT NULL,
  bid_amount numeric,
  file_type text,
  pw_confirmed boolean DEFAULT false,
  detail_score numeric,
  issues text,
  scope_notes text,
  exclusions text,
  source_file text,
  imported_at timestamptz DEFAULT now()
);

ALTER TABLE legacy_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read legacy bids" ON legacy_bids FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert legacy bids" ON legacy_bids FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete legacy bids" ON legacy_bids FOR DELETE TO authenticated USING (true);
