-- ============================================
-- 1. Enable UUID generation
-- ============================================
create extension if not exists "pgcrypto";


-- ============================================
-- 2. Create colleges table
-- ============================================
create table colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);


-- ============================================
-- 3. Create departments table
-- ============================================
create table departments (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references colleges(id) on delete cascade,
  name text not null,
  hod_staff_id uuid, -- filled in later, references staff_profiles(id)
  created_at timestamptz not null default now(),
  unique (college_id, name)
);


-- ============================================
-- 4. Create units table
-- ============================================
create table units (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);


-- ============================================
-- 5. Create designations table
-- ============================================
create table designations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  staff_type text not null check (staff_type in ('teaching', 'non_teaching')),
  created_at timestamptz not null default now(),
  unique (title, staff_type)
);


-- ============================================
-- 6. Create admins table
-- ============================================
create table admins (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);


-- ============================================
-- 7. Create staff_profiles table
-- ============================================
create table staff_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  staff_type text not null check (staff_type in ('teaching', 'non_teaching')),
  college_id uuid references colleges(id) on delete set null,
  department_id uuid references departments(id) on delete set null,
  unit_id uuid references units(id) on delete set null,
  designation_id uuid references designations(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);


-- ============================================
-- 8. Link departments.hod_staff_id to staff_profiles
-- ============================================
alter table departments
  add constraint departments_hod_staff_id_fkey
  foreign key (hod_staff_id) references staff_profiles(id) on delete set null;


-- ============================================
-- 9. Create profile_versions table
-- ============================================
create table profile_versions (
  id uuid primary key default gen_random_uuid(),
  staff_profile_id uuid not null references staff_profiles(id) on delete cascade,
  full_name text not null,
  photo_url text,
  email text,
  phone text,
  bio_qualifications text,
  research_interests text,
  publications text,
  cv_storage_path text,
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'correction_required', 'approved')),
  reviewed_by uuid references admins(id) on delete set null,
  correction_notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);


-- ============================================
-- 10. Helpful indexes
-- ============================================
create index idx_departments_college_id on departments(college_id);
create index idx_staff_profiles_department_id on staff_profiles(department_id);
create index idx_staff_profiles_unit_id on staff_profiles(unit_id);
create index idx_profile_versions_staff_profile_id on profile_versions(staff_profile_id);
create index idx_profile_versions_status on profile_versions(status);