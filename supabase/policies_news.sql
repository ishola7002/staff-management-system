-- Base grants
grant select on news to anon, authenticated;
grant insert, update, delete on news to authenticated;

-- Public can read all news
create policy "Public can view news"
  on news for select
  using (true);

-- Only admins can post/edit/delete
create policy "Admins can insert news"
  on news for insert
  with check (exists (select 1 from admins where auth_user_id = auth.uid()));

create policy "Admins can update news"
  on news for update
  using (exists (select 1 from admins where auth_user_id = auth.uid()));

create policy "Admins can delete news"
  on news for delete
  using (exists (select 1 from admins where auth_user_id = auth.uid()));