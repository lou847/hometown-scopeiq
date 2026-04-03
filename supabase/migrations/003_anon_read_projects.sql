-- Allow anon users to read projects (needed for demo and sub form pages)
CREATE POLICY "Public can read projects" ON projects FOR SELECT TO anon USING (true);
