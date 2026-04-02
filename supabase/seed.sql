-- ScopeIQ Seed Data
-- Cook County IDOL Prevailing Wage Rates — Effective March 2, 2026

-- ── Electrical ─────────────────────────────────────────────────────────────────

INSERT INTO idol_rates (trade, classification, base_wage, fringe, effective_date, county) VALUES
('electrical', 'Electrician - Journeyman (Inside)', 57.75, 34.81, '2026-03-02', 'Cook'),
('electrical', 'Electrician - Apprentice 1st Year', 23.10, 14.98, '2026-03-02', 'Cook'),
('electrical', 'Electrician - Apprentice 2nd Year', 28.88, 18.02, '2026-03-02', 'Cook'),
('electrical', 'Electrician - Apprentice 3rd Year', 34.65, 21.06, '2026-03-02', 'Cook'),
('electrical', 'Electrician - Apprentice 4th Year', 40.43, 24.10, '2026-03-02', 'Cook');

-- ── Plumbing ───────────────────────────────────────────────────────────────────

INSERT INTO idol_rates (trade, classification, base_wage, fringe, effective_date, county) VALUES
('plumbing', 'Plumber - Journeyman', 55.00, 33.25, '2026-03-02', 'Cook'),
('plumbing', 'Plumber - Apprentice 1st Year', 22.00, 14.50, '2026-03-02', 'Cook'),
('plumbing', 'Plumber - Apprentice 2nd Year', 27.50, 17.60, '2026-03-02', 'Cook'),
('plumbing', 'Plumber - Apprentice 3rd Year', 33.00, 20.70, '2026-03-02', 'Cook'),
('plumbing', 'Plumber - Apprentice 4th Year', 38.50, 23.80, '2026-03-02', 'Cook');

-- ── HVAC ───────────────────────────────────────────────────────────────────────

INSERT INTO idol_rates (trade, classification, base_wage, fringe, effective_date, county) VALUES
('hvac', 'Pipefitter - Journeyman', 55.50, 33.60, '2026-03-02', 'Cook'),
('hvac', 'Pipefitter - Apprentice 1st Year', 22.20, 14.55, '2026-03-02', 'Cook'),
('hvac', 'Sheet Metal Worker - Journeyman', 52.80, 39.18, '2026-03-02', 'Cook'),
('hvac', 'Sheet Metal Worker - Apprentice 1st Year', 26.40, 22.63, '2026-03-02', 'Cook');

-- ── Carpentry ──────────────────────────────────────────────────────────────────

INSERT INTO idol_rates (trade, classification, base_wage, fringe, effective_date, county) VALUES
('carpentry', 'Carpenter - Journeyman', 52.15, 32.55, '2026-03-02', 'Cook'),
('carpentry', 'Carpenter - Apprentice 1st Year', 26.08, 17.70, '2026-03-02', 'Cook'),
('carpentry', 'Carpenter - Apprentice 2nd Year', 31.29, 20.40, '2026-03-02', 'Cook'),
('carpentry', 'Carpenter - Apprentice 3rd Year', 36.51, 23.10, '2026-03-02', 'Cook'),
('carpentry', 'Carpenter - Apprentice 4th Year', 41.72, 25.80, '2026-03-02', 'Cook');

-- ── Civil / Laborers ───────────────────────────────────────────────────────────

INSERT INTO idol_rates (trade, classification, base_wage, fringe, effective_date, county) VALUES
('civil', 'Laborer - General', 46.10, 22.76, '2026-03-02', 'Cook'),
('civil', 'Laborer - Landscape', 42.00, 20.50, '2026-03-02', 'Cook'),
('civil', 'Operating Engineer - Group 1', 56.40, 33.45, '2026-03-02', 'Cook'),
('civil', 'Cement Mason - Journeyman', 49.50, 29.00, '2026-03-02', 'Cook');

-- ── Masonry ────────────────────────────────────────────────────────────────────

INSERT INTO idol_rates (trade, classification, base_wage, fringe, effective_date, county) VALUES
('masonry', 'Bricklayer - Journeyman', 50.45, 27.87, '2026-03-02', 'Cook'),
('masonry', 'Bricklayer - Apprentice 1st Year', 25.23, 15.75, '2026-03-02', 'Cook');

-- ── Glazing ────────────────────────────────────────────────────────────────────

INSERT INTO idol_rates (trade, classification, base_wage, fringe, effective_date, county) VALUES
('glazing', 'Glazier - Journeyman', 48.90, 30.00, '2026-03-02', 'Cook'),
('glazing', 'Glazier - Apprentice 1st Year', 24.45, 16.20, '2026-03-02', 'Cook');

-- ── Fire Protection ────────────────────────────────────────────────────────────

INSERT INTO idol_rates (trade, classification, base_wage, fringe, effective_date, county) VALUES
('fire_protection', 'Sprinkler Fitter - Journeyman', 55.80, 31.65, '2026-03-02', 'Cook'),
('fire_protection', 'Sprinkler Fitter - Apprentice 1st Year', 22.32, 14.20, '2026-03-02', 'Cook');

-- ── Elevator ───────────────────────────────────────────────────────────────────

INSERT INTO idol_rates (trade, classification, base_wage, fringe, effective_date, county) VALUES
('elevator', 'Elevator Constructor - Journeyman', 62.54, 38.535, '2026-03-02', 'Cook'),
('elevator', 'Elevator Constructor - Apprentice 1st Year', 31.27, 22.27, '2026-03-02', 'Cook');

-- ── Seed: Northbrook Project ───────────────────────────────────────────────────

INSERT INTO projects (name, address, gc_name, slug, pw_required, pw_county) VALUES
('Hometown Coffee – Northbrook', '855 Willow Road, Northbrook, IL 60062', 'CoreBuilt Contracting', 'northbrook', true, 'Cook');
