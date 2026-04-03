// ── Enums ──────────────────────────────────────────────────────────────────────

export const TRADES = [
  "electrical",
  "plumbing",
  "hvac",
  "civil",
  "carpentry",
  "glazing",
  "masonry",
  "fire_protection",
  "elevator",
  "painting",
  "drywall",
  "flooring",
  "roofing",
  "concrete",
  "demolition",
  "insulation",
  "signage",
  "other",
] as const;

export type Trade = (typeof TRADES)[number];

export const DOCUMENT_TYPES = [
  "blueprints",
  "specs",
  "equipment_schedule",
  "reference_bid",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const INVITATION_STATUSES = [
  "not_started",
  "link_opened",
  "in_progress",
  "submitted",
  "submitted_incomplete",
] as const;

export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export const SCOPE_RESPONSES = ["included", "excluded", "clarify"] as const;

export type ScopeResponse = (typeof SCOPE_RESPONSES)[number];

export const REVIEW_STATUSES = [
  "pending",
  "in_review",
  "approved",
  "rejected",
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const AI_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;

export type AiConfidence = (typeof AI_CONFIDENCE_LEVELS)[number];

// ── Database Row Types ─────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  address: string;
  gc_name: string;
  gc_user_id: string | null;
  slug: string;
  is_active: boolean;
  pw_required: boolean;
  pw_county: string;
  created_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  document_type: DocumentType;
  trade_hint: string | null;
  ai_processed: boolean;
  ai_processed_at: string | null;
  uploaded_by: string;
  uploaded_at: string;
}

export interface ScopeItem {
  id: string;
  project_id: string;
  trade: Trade;
  item_text: string;
  drawing_ref: string | null;
  notes: string | null;
  is_fbo: boolean;
  is_by_others: boolean;
  lead_time_flag: boolean;
  sort_order: number;
  created_by_ai: boolean;
  ai_confidence: AiConfidence;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface ReferenceBid {
  id: string;
  project_id: string;
  document_id: string;
  trade: Trade;
  company_name: string;
  total_bid_amount: number | null;
  inclusions: { item: string; drawing_ref?: string }[];
  exclusions: { item: string; note?: string }[];
  parsed_at: string;
}

export interface Invitation {
  id: string;
  project_id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  trade: Trade;
  il_license_number: string | null;
  token: string;
  token_expires_at: string;
  invitation_sent_at: string;
  link_opened_at: string | null;
  draft_started_at: string | null;
  submission_id: string | null;
  status: InvitationStatus;
  reminder_sent_at: string | null;
  created_by: string;
  created_at: string;
}

export interface BidSubmission {
  id: string;
  project_id: string;
  invitation_id: string;
  company_name: string;
  il_license_number: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  trade: Trade;
  workers_comp_policy: string | null;
  gl_carrier_policy: string | null;
  total_labor: number;
  total_material: number;
  ohp_pct: number;
  pw_labor_total: number;
  non_pw_labor_total: number;
  is_lump_sum: boolean;
  lump_sum_total: number | null;
  exclusions_notes: string | null;
  lead_time_notes: string | null;
  signatory_name: string;
  signatory_title: string;
  signed_date: string;
  review_status: ReviewStatus;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  flagged_row_count: number;
  scope_gap_count: number;
  submitted_at: string;
}

export interface BidScopeResponse {
  id: string;
  submission_id: string;
  scope_item_id: string;
  response: ScopeResponse;
  note: string | null;
}

export interface BidLaborRow {
  id: string;
  submission_id: string;
  sort_order: number;
  classification: string;
  worker_count: number;
  hours_per_worker: number;
  base_wage_entered: number;
  fringe_entered: number;
  idol_base_minimum: number;
  idol_fringe_minimum: number;
  total_entered_rate: number;
  idol_total_minimum: number;
  below_minimum: boolean;
  variance: number;
  row_total: number;
}

export interface BidDraft {
  id: string;
  invitation_id: string;
  form_state: Record<string, unknown>;
  last_saved_at: string;
  expires_at: string;
  magic_link_sent_at: string | null;
}

export interface IdolRate {
  id: string;
  trade: string;
  classification: string;
  base_wage: number;
  fringe: number;
  effective_date: string;
  county: string;
  updated_at: string;
}

export interface NotificationRecipient {
  id: string;
  project_id: string;
  email: string;
  name: string | null;
  created_at: string;
}

// ── AI Output Types ────────────────────────────────────────────────────────────

export interface AiScopeExtraction {
  trades: {
    trade: Trade;
    items: {
      item_text: string;
      drawing_ref: string | null;
      is_fbo: boolean;
      is_by_others: boolean;
      lead_time_flag: boolean;
      confidence: AiConfidence;
      notes: string | null;
    }[];
  }[];
  reference_bid?: {
    company_name: string;
    total_bid_amount: number | null;
    inclusions: { item: string; drawing_ref?: string }[];
    exclusions: { item: string; note?: string }[];
  };
}
