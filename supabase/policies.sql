-- ============================================
-- 1. Colleges — public read, admin-only write
-- ============================================
create policy "Public can view colleges"
  on colleges for select
  using (true);

create policy "Admins can insert colleges"
  on colleges for insert
  with check (exists (select 1 from admins where auth_user_id = auth.uid()));

create policy "Admins can update colleges"
  on colleges for update
  using (exists (select 1 from admins where auth_user_id = auth.uid()));

create policy "Admins can delete colleges"
  on colleges for delete
  using (exists (select 1 from admins where auth_user_id = auth.uid()));


-- ============================================
-- 2. Departments — public read, admin-only write
-- ============================================
create policy "Public can view departments"
  on departments for select
  using (true);

create policy "Admins can insert departments"
  on departments for insert
  with check (exists (select 1 from admins where auth_user_id = auth.uid()));

create policy "Admins can update departments"
  on departments for update
  using (exists (select 1 from admins where auth_user_id = auth.uid()));

create policy "Admins can delete departments"
  on departments for delete
  using (exists (select 1 from admins where auth_user_id = auth.uid()));


-- ============================================
-- 3. Units — public read, admin-only write
-- ============================================
create policy "Public can view units"
  on units for select
  using (true);

create policy "Admins can insert units"
  on units for insert
  with check (exists (select 1 from admins where auth_user_id = auth.uid()));

create policy "Admins can update units"
  on units for update
  using (exists (select 1 from admins where auth_user_id = auth.uid()));

create policy "Admins can delete units"
  on units for delete
  using (exists (select 1 from admins where auth_user_id = auth.uid()));


-- ============================================
-- 4. Designations — public read, admin-only write
-- ============================================
create policy "Public can view designations"
  on designations for select
  using (true);

create policy "Admins can insert designations"
  on designations for insert
  with check (exists (select 1 from admins where auth_user_id = auth.uid()));

create policy "Admins can update designations"
  on designations for update
  using (exists (select 1 from admins where auth_user_id = auth.uid()));

create policy "Admins can delete designations"
  on designations for delete
  using (exists (select 1 from admins where auth_user_id = auth.uid()));