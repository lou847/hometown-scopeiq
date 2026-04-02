-- ScopeIQ Initial Schema
-- Version 1.0 — April 2026

-- ── Custom Types ───────────────────────────────────────────────────────────────

CREATE TYPE document_type AS ENUM ('blueprints', 'specs', 'equipment_schedule', 'reference_bid');
CREATE TYPE trade AS ENUM ('electrical', 'plumbing', 'hvac', 'civil', 'carpentry', 'glazing', 'masonry', 'fire_protection', 'elevator', 'other');
CREATE TYPE invitation_status AS ENUM ('not_started', 'link_opened', 'in_progress', 'submitted', 'submitted_incomplete');
CREATE TYPE scope_response AS ENUM ('included', 'excluded', 'clarify');
CREATE TYPE review_status AS ENUM ('pending', 'in_review', 'approved', 'rejected');
CREATE TYPE ai_confidence AS ENUM ('low', 'medium', 'high');

-- ── Projects ───────────────────────────────────────────────────────────────────

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  gc_name text NOT NULL,
  gc_user_id uuid REFERENCES auth.users(id),
  slug text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  pw_required boolean DEFAULT true,
  pw_county text DEFAULT 'Cook',
  created_at timestamptz DEFAULT now()
);

-- ── Project Documents ──────────────────────────────────────────────────────────

CREATE TABLE project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  document_type document_type NOT NULL,
  trade_hint text,
  ai_processed boolean DEFAULT false,
  ai_processed_at timestamptz,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  uploaded_at timestamptz DEFAULT now()
);

CREATE INDEX idx_project_documents_project ON project_documents(project_id);

-- ── Scope Items ────────────────────────────────────────────────────────────────

CREATE TABLE scope_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  trade trade NOT NULL,
  item_text text NOT NULL,
  drawing_ref text,
  notes text,
  is_fbo boolean DEFAULT false,
  is_by_others boolean DEFAULT false,
  lead_time_flag boolean DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by_ai boolean NOT NULL DEFAULT false,
  ai_confidence ai_confidence NOT NULL DEFAULT 'high',
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_scope_items_project_trade ON scope_items(project_id, trade);

-- ── Reference Bids ─────────────────────────────────────────────────────────────

CREATE TABLE reference_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES project_documents(id),
  trade trade NOT NULL,
  company_name text NOT NULL,
  total_bid_amount numeric,
  inclusions jsonb NOT NULL DEFAULT '[]',
  exclusions jsonb NOT NULL DEFAULT '[]',
  parsed_at timestamptz DEFAULT now()
);

-- ── Invitations ────────────────────────────────────────────────────────────────

CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  trade trade NOT NULL,
  il_license_number text,
  token text UNIQUE NOT NULL,
  token_expires_at timestamptz NOT NULL,
  invitation_sent_at timestamptz DEFAULT now(),
  link_opened_at timestamptz,
  draft_started_at timestamptz,
  submission_id uuid,
  status invitation_status NOT NULL DEFAULT 'not_started',
  reminder_sent_at timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_project ON invitations(project_id);

-- ── Bid Submissions ────────────────────────────────────────────────────────────

CREATE TABLE bid_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invitation_id uuid NOT NULL REFERENCES invitations(id),
  company_name text NOT NULL,
  il_license_number text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  trade trade NOT NULL,
  workers_comp_policy text,
  gl_carrier_policy text,
  total_labor numeric NOT NULL DEFAULT 0,
  total_material numeric NOT NULL DEFAULT 0,
  ohp_pct numeric NOT NULL DEFAULT 0,
  pw_labor_total numeric NOT NULL DEFAULT 0,
  non_pw_labor_total numeric NOT NULL DEFAULT 0,
  is_lump_sum boolean DEFAULT false,
  lump_sum_total numeric,
  exclusions_notes text,
  lead_time_notes text,
  signatory_name text NOT NULL,
  signatory_title text NOT NULL,
  signed_date date NOT NULL,
  review_status review_status DEFAULT 'pending',
  review_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  flagged_row_count integer NOT NULL DEFAULT 0,
  scope_gap_count integer NOT NULL DEFAULT 0,
  submitted_at timestamptz DEFAULT now()
);

CREATE INDEX idx_bid_submissions_project ON bid_submissions(project_id);

-- Add FK from invitations to bid_submissions (deferred because of circular reference)
ALTER TABLE invitations
  ADD CONSTRAINT fk_invitations_submission
  FOREIGN KEY (submission_id) REFERENCES bid_submissions(id);

-- ── Bid Scope Responses ────────────────────────────────────────────────────────

CREATE TABLE bid_scope_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES bid_submissions(id) ON DELETE CASCADE,
  scope_item_id uuid NOT NULL REFERENCES scope_items(id),
  response scope_response NOT NULL,
  note text
);

CREATE INDEX idx_bid_scope_responses_submission ON bid_scope_responses(submission_id);

-- ── Bid Labor Rows ─────────────────────────────────────────────────────────────

CREATE TABLE bid_labor_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES bid_submissions(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  classification text NOT NULL,
  worker_count integer NOT NULL,
  hours_per_worker numeric NOT NULL,
  base_wage_entered numeric NOT NULL,
  fringe_entered numeric NOT NULL,
  idol_base_minimum numeric NOT NULL,
  idol_fringe_minimum numeric NOT NULL,
  total_entered_rate numeric NOT NULL,
  idol_total_minimum numeric NOT NULL,
  below_minimum boolean NOT NULL DEFAULT false,
  variance numeric NOT NULL DEFAULT 0,
  row_total numeric NOT NULL DEFAULT 0
);

CREATE INDEX idx_bid_labor_rows_submission ON bid_labor_rows(submission_id);

-- ── Bid Drafts ─────────────────────────────────────────────────────────────────

CREATE TABLE bid_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  form_state jsonb NOT NULL DEFAULT '{}',
  last_saved_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  magic_link_sent_at timestamptz
);

CREATE UNIQUE INDEX idx_bid_drafts_invitation ON bid_drafts(invitation_id);

-- ── IDOL Rates ─────────────────────────────────────────────────────────────────

CREATE TABLE idol_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade text NOT NULL,
  classification text UNIQUE NOT NULL,
  base_wage numeric NOT NULL,
  fringe numeric NOT NULL,
  effective_date date NOT NULL,
  county text DEFAULT 'Cook',
  updated_at timestamptz DEFAULT now()
);

-- ── Notification Recipients ────────────────────────────────────────────────────

CREATE TABLE notification_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  created_at timestamptz DEFAULT now()
);

-- ── RLS Policies ───────────────────────────────────────────────────────────────

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE scope_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_scope_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_labor_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE idol_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all projects
CREATE POLICY "Authenticated users can read projects"
  ON projects FOR SELECT TO authenticated USING (true);

-- Authenticated users can manage project data
CREATE POLICY "Authenticated users can manage project_documents"
  ON project_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage scope_items"
  ON scope_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage reference_bids"
  ON reference_bids FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage invitations"
  ON invitations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage submissions"
  ON bid_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage scope responses"
  ON bid_scope_responses FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage labor rows"
  ON bid_labor_rows FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage notification_recipients"
  ON notification_recipients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public access for sub form (via token lookup)
CREATE POLICY "Public can read invitations by token"
  ON invitations FOR SELECT TO anon USING (true);

CREATE POLICY "Public can update invitation status"
  ON invitations FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Public can read published scope items"
  ON scope_items FOR SELECT TO anon USING (published = true);

CREATE POLICY "Public can insert submissions"
  ON bid_submissions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Public can insert scope responses"
  ON bid_scope_responses FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Public can insert labor rows"
  ON bid_labor_rows FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Public can manage drafts"
  ON bid_drafts FOR ALL TO anon USING (true) WITH CHECK (true);

-- IDOL rates are public read
CREATE POLICY "Anyone can read IDOL rates"
  ON idol_rates FOR SELECT TO anon, authenticated USING (true);

-- ── Storage Bucket ─────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can read documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents');
