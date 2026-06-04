-- Allow anon role full access (demo auth uses cookies, not Supabase Auth)
CREATE POLICY "Anon full access" ON users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access" ON subjects FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access" ON teachers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access" ON groups FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access" ON students FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access" ON enrollments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access" ON payments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access" ON attendance FOR ALL TO anon USING (true) WITH CHECK (true);
