-- Add scope_updated_at to projects for tracking when scope was last modified after publish
ALTER TABLE projects ADD COLUMN scope_updated_at timestamptz;
