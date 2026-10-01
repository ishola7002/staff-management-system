-- Reference tables — fully public read, admin write (already working)
grant select on colleges, departments, units, designations to anon, authenticated;
grant insert, update, delete on colleges, departments, units, designations to authenticated;

-- Staff/profile/admin tables — grants only, RLS policies still needed
grant select, insert, update, delete on staff_profiles to authenticated;
grant select, insert, update, delete on profile_versions to authenticated;
grant select, insert, update, delete on admins to authenticated;