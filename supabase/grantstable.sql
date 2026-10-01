-- ============================================
-- Create news table
-- ============================================
create table news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  posted_by uuid references admins(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_news_created_at on news(created_at desc);