import type { IdolRate } from "@/lib/types";

/**
 * Cook County IDOL Prevailing Wage Rates
 * Effective: March 2, 2026
 *
 * Source: Illinois Department of Labor — Cook County schedule
 * Updated manually each July when new rates are published.
 *
 * Used client-side for real-time comparison on the sub bid form.
 * On submission, rates are snapshotted into bid_labor_rows so
 * future updates don't retroactively change historical flagging.
 */
export const IDOL_RATES: Omit<IdolRate, "id" | "updated_at">[] = [
  // ── Electrical ───────────────────────────────────────────────────────────
  { trade: "electrical", classification: "Electrician - Journeyman (Inside)", base_wage: 57.75, fringe: 34.81, effective_date: "2026-03-02", county: "Cook" },
  { trade: "electrical", classification: "Electrician - Apprentice 1st Year", base_wage: 23.10, fringe: 14.98, effective_date: "2026-03-02", county: "Cook" },
  { trade: "electrical", classification: "Electrician - Apprentice 2nd Year", base_wage: 28.88, fringe: 18.02, effective_date: "2026-03-02", county: "Cook" },
  { trade: "electrical", classification: "Electrician - Apprentice 3rd Year", base_wage: 34.65, fringe: 21.06, effective_date: "2026-03-02", county: "Cook" },
  { trade: "electrical", classification: "Electrician - Apprentice 4th Year", base_wage: 40.43, fringe: 24.10, effective_date: "2026-03-02", county: "Cook" },

  // ── Plumbing ─────────────────────────────────────────────────────────────
  { trade: "plumbing", classification: "Plumber - Journeyman", base_wage: 55.00, fringe: 33.25, effective_date: "2026-03-02", county: "Cook" },
  { trade: "plumbing", classification: "Plumber - Apprentice 1st Year", base_wage: 22.00, fringe: 14.50, effective_date: "2026-03-02", county: "Cook" },
  { trade: "plumbing", classification: "Plumber - Apprentice 2nd Year", base_wage: 27.50, fringe: 17.60, effective_date: "2026-03-02", county: "Cook" },
  { trade: "plumbing", classification: "Plumber - Apprentice 3rd Year", base_wage: 33.00, fringe: 20.70, effective_date: "2026-03-02", county: "Cook" },
  { trade: "plumbing", classification: "Plumber - Apprentice 4th Year", base_wage: 38.50, fringe: 23.80, effective_date: "2026-03-02", county: "Cook" },

  // ── HVAC ─────────────────────────────────────────────────────────────────
  { trade: "hvac", classification: "Pipefitter - Journeyman", base_wage: 55.50, fringe: 33.60, effective_date: "2026-03-02", county: "Cook" },
  { trade: "hvac", classification: "Pipefitter - Apprentice 1st Year", base_wage: 22.20, fringe: 14.55, effective_date: "2026-03-02", county: "Cook" },
  { trade: "hvac", classification: "Sheet Metal Worker - Journeyman", base_wage: 52.80, fringe: 39.18, effective_date: "2026-03-02", county: "Cook" },
  { trade: "hvac", classification: "Sheet Metal Worker - Apprentice 1st Year", base_wage: 26.40, fringe: 22.63, effective_date: "2026-03-02", county: "Cook" },

  // ── Carpentry ────────────────────────────────────────────────────────────
  { trade: "carpentry", classification: "Carpenter - Journeyman", base_wage: 52.15, fringe: 32.55, effective_date: "2026-03-02", county: "Cook" },
  { trade: "carpentry", classification: "Carpenter - Apprentice 1st Year", base_wage: 26.08, fringe: 17.70, effective_date: "2026-03-02", county: "Cook" },
  { trade: "carpentry", classification: "Carpenter - Apprentice 2nd Year", base_wage: 31.29, fringe: 20.40, effective_date: "2026-03-02", county: "Cook" },
  { trade: "carpentry", classification: "Carpenter - Apprentice 3rd Year", base_wage: 36.51, fringe: 23.10, effective_date: "2026-03-02", county: "Cook" },
  { trade: "carpentry", classification: "Carpenter - Apprentice 4th Year", base_wage: 41.72, fringe: 25.80, effective_date: "2026-03-02", county: "Cook" },

  // ── Civil / Laborers ─────────────────────────────────────────────────────
  { trade: "civil", classification: "Laborer - General", base_wage: 46.10, fringe: 22.76, effective_date: "2026-03-02", county: "Cook" },
  { trade: "civil", classification: "Laborer - Landscape", base_wage: 42.00, fringe: 20.50, effective_date: "2026-03-02", county: "Cook" },
  { trade: "civil", classification: "Operating Engineer - Group 1", base_wage: 56.40, fringe: 33.45, effective_date: "2026-03-02", county: "Cook" },
  { trade: "civil", classification: "Cement Mason - Journeyman", base_wage: 49.50, fringe: 29.00, effective_date: "2026-03-02", county: "Cook" },

  // ── Masonry ──────────────────────────────────────────────────────────────
  { trade: "masonry", classification: "Bricklayer - Journeyman", base_wage: 50.45, fringe: 27.87, effective_date: "2026-03-02", county: "Cook" },
  { trade: "masonry", classification: "Bricklayer - Apprentice 1st Year", base_wage: 25.23, fringe: 15.75, effective_date: "2026-03-02", county: "Cook" },

  // ── Glazing ──────────────────────────────────────────────────────────────
  { trade: "glazing", classification: "Glazier - Journeyman", base_wage: 48.90, fringe: 30.00, effective_date: "2026-03-02", county: "Cook" },
  { trade: "glazing", classification: "Glazier - Apprentice 1st Year", base_wage: 24.45, fringe: 16.20, effective_date: "2026-03-02", county: "Cook" },

  // ── Fire Protection ──────────────────────────────────────────────────────
  { trade: "fire_protection", classification: "Sprinkler Fitter - Journeyman", base_wage: 55.80, fringe: 31.65, effective_date: "2026-03-02", county: "Cook" },
  { trade: "fire_protection", classification: "Sprinkler Fitter - Apprentice 1st Year", base_wage: 22.32, fringe: 14.20, effective_date: "2026-03-02", county: "Cook" },

  // ── Elevator ─────────────────────────────────────────────────────────────
  { trade: "elevator", classification: "Elevator Constructor - Journeyman", base_wage: 62.54, fringe: 38.535, effective_date: "2026-03-02", county: "Cook" },
  { trade: "elevator", classification: "Elevator Constructor - Apprentice 1st Year", base_wage: 31.27, fringe: 22.27, effective_date: "2026-03-02", county: "Cook" },

  // ── Painting ────────────────────────────────────────────────────────────
  { trade: "painting", classification: "Painter - Journeyman", base_wage: 47.25, fringe: 27.90, effective_date: "2026-03-02", county: "Cook" },
  { trade: "painting", classification: "Painter - Apprentice 1st Year", base_wage: 18.90, fringe: 12.50, effective_date: "2026-03-02", county: "Cook" },
  { trade: "painting", classification: "Painter - Apprentice 2nd Year", base_wage: 23.63, fringe: 15.20, effective_date: "2026-03-02", county: "Cook" },
  { trade: "painting", classification: "Painter - Apprentice 3rd Year", base_wage: 33.08, fringe: 19.60, effective_date: "2026-03-02", county: "Cook" },

  // ── Drywall ─────────────────────────────────────────────────────────────
  { trade: "drywall", classification: "Drywall Finisher - Journeyman", base_wage: 47.25, fringe: 27.90, effective_date: "2026-03-02", county: "Cook" },
  { trade: "drywall", classification: "Drywall Finisher - Apprentice 1st Year", base_wage: 18.90, fringe: 12.50, effective_date: "2026-03-02", county: "Cook" },
  { trade: "drywall", classification: "Carpenter (Drywall Framing) - Journeyman", base_wage: 52.15, fringe: 32.55, effective_date: "2026-03-02", county: "Cook" },

  // ── Flooring ────────────────────────────────────────────────────────────
  { trade: "flooring", classification: "Floor Layer - Journeyman", base_wage: 44.75, fringe: 26.30, effective_date: "2026-03-02", county: "Cook" },
  { trade: "flooring", classification: "Floor Layer - Apprentice 1st Year", base_wage: 22.38, fringe: 14.80, effective_date: "2026-03-02", county: "Cook" },
  { trade: "flooring", classification: "Tile Setter - Journeyman", base_wage: 49.00, fringe: 28.50, effective_date: "2026-03-02", county: "Cook" },

  // ── Roofing ─────────────────────────────────────────────────────────────
  { trade: "roofing", classification: "Roofer - Journeyman", base_wage: 48.50, fringe: 24.30, effective_date: "2026-03-02", county: "Cook" },
  { trade: "roofing", classification: "Roofer - Apprentice 1st Year", base_wage: 24.25, fringe: 13.50, effective_date: "2026-03-02", county: "Cook" },

  // ── Concrete ────────────────────────────────────────────────────────────
  { trade: "concrete", classification: "Cement Mason - Journeyman", base_wage: 49.50, fringe: 29.00, effective_date: "2026-03-02", county: "Cook" },
  { trade: "concrete", classification: "Cement Mason - Apprentice 1st Year", base_wage: 24.75, fringe: 16.00, effective_date: "2026-03-02", county: "Cook" },
  { trade: "concrete", classification: "Laborer - Concrete", base_wage: 46.10, fringe: 22.76, effective_date: "2026-03-02", county: "Cook" },

  // ── Demolition ──────────────────────────────────────────────────────────
  { trade: "demolition", classification: "Laborer - Demolition", base_wage: 46.10, fringe: 22.76, effective_date: "2026-03-02", county: "Cook" },
  { trade: "demolition", classification: "Operating Engineer - Demolition", base_wage: 56.40, fringe: 33.45, effective_date: "2026-03-02", county: "Cook" },

  // ── Insulation ──────────────────────────────────────────────────────────
  { trade: "insulation", classification: "Insulator - Journeyman (Heat & Frost)", base_wage: 54.90, fringe: 30.25, effective_date: "2026-03-02", county: "Cook" },
  { trade: "insulation", classification: "Insulator - Apprentice 1st Year", base_wage: 21.96, fringe: 13.50, effective_date: "2026-03-02", county: "Cook" },

  // ── Signage ─────────────────────────────────────────────────────────────
  { trade: "signage", classification: "Sign Hanger - Journeyman", base_wage: 38.50, fringe: 18.75, effective_date: "2026-03-02", county: "Cook" },
];

/** Get all IDOL rates for a specific trade */
export function getRatesForTrade(trade: string) {
  return IDOL_RATES.filter((r) => r.trade === trade);
}

/** Get IDOL minimum for a specific classification */
export function getRateForClassification(classification: string) {
  return IDOL_RATES.find((r) => r.classification === classification) ?? null;
}

/** PW below-minimum tolerance (per spec: $0.50 for rounding) */
export const PW_TOLERANCE = 0.5;

/** Check if entered rate is below IDOL minimum */
export function isBelowMinimum(
  baseEntered: number,
  fringeEntered: number,
  idolBase: number,
  idolFringe: number
): boolean {
  return baseEntered + fringeEntered < idolBase + idolFringe - PW_TOLERANCE;
}
