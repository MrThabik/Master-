-- THASEEN OS: run this once in Supabase > SQL Editor
-- Replace master@example.com with your Master login email before running.

create table sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  description text default '',
  tags text[] default '{}',
  screenshot_url text,
  live_preview boolean default true,
  hidden boolean default false,
  sort int default 0,
  created_at timestamptz default now()
);

create table artworks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  album text not null check (album in ('Photography','Digital Art','Drawings & Paintings')),
  image_path text not null,            -- path in the "gallery" storage bucket
  sort int default 0,
  likes int default 0,
  views int default 0,
  created_at timestamptz default now()
);

create table art_likes (
  art_id uuid references artworks(id) on delete cascade,
  visitor_id text not null,            -- random id kept in the visitor's browser
  primary key (art_id, visitor_id)
);

alter table sites enable row level security;
alter table artworks enable row level security;
alter table art_likes enable row level security;

create function is_master() returns boolean language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'master@example.com'
$$;

-- Public can read; only Master can change
create policy "public read sites" on sites for select using (not hidden or is_master());
create policy "master write sites" on sites for all using (is_master()) with check (is_master());
create policy "public read art" on artworks for select using (true);
create policy "master write art" on artworks for all using (is_master()) with check (is_master());
-- art_likes has no public policy: visitors only use the two functions below

-- Shared view counter (one call per visit)
create function add_view(p_art uuid) returns int
language sql security definer set search_path = public as $$
  update artworks set views = views + 1 where id = p_art returning views;
$$;

-- Shared like toggle (returns new like count)
create function toggle_like(p_art uuid, p_visitor text) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if exists (select 1 from art_likes where art_id = p_art and visitor_id = p_visitor) then
    delete from art_likes where art_id = p_art and visitor_id = p_visitor;
  else
    insert into art_likes values (p_art, p_visitor);
  end if;
  update artworks set likes = (select count(*) from art_likes where art_id = p_art)
    where id = p_art returning likes into n;
  return n;
end $$;

grant execute on function add_view(uuid), toggle_like(uuid, text) to anon, authenticated;

-- Storage: create two PUBLIC buckets in Supabase > Storage:
--   "screenshots" (hub previews) and "gallery" (artworks)
-- Then add these policies so only Master can upload:
create policy "master uploads" on storage.objects for insert
  with check (bucket_id in ('screenshots','gallery') and is_master());
create policy "master deletes" on storage.objects for delete
  using (bucket_id in ('screenshots','gallery') and is_master());

-- ===== Blog =====
create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  lang text not null default 'English' check (lang in ('English','Tamil')),
  topic text default 'General',
  body text default '',
  published boolean default false,
  created_at timestamptz default now()
);
alter table posts enable row level security;
create policy "public read posts" on posts for select using (published or is_master());
create policy "master write posts" on posts for all using (is_master()) with check (is_master());

-- ===== Visit counter on site cards =====
alter table sites add column if not exists visits int default 0;
create function add_site_visit(p_site uuid) returns int
language sql security definer set search_path = public as $$
  update sites set visits = visits + 1 where id = p_site returning visits;
$$;
grant execute on function add_site_visit(uuid) to anon, authenticated;

-- ===== Mood-board (photos are stored in the "gallery" bucket under mood/) =====
create table moods (
  id uuid primary key default gen_random_uuid(),
  caption text default '',
  image_path text not null,
  sort int default 0,
  created_at timestamptz default now()
);
alter table moods enable row level security;
create policy "public read moods" on moods for select using (true);
create policy "master write moods" on moods for all using (is_master()) with check (is_master());

-- ===== Admin login protection (failed-attempt log, used by /api/admin/login) =====
create table admin_attempts (
  id bigserial primary key,
  ip text not null,
  at timestamptz default now()
);
alter table admin_attempts enable row level security;  -- no policies: only the server (service role) can use it

-- ===== Update 2: photo shape and size options, editable site settings =====
alter table artworks add column if not exists width int;
alter table artworks add column if not exists height int;
alter table artworks add column if not exists fit text not null default 'auto' check (fit in ('auto','whole','fill'));
alter table artworks add column if not exists position text not null default 'center' check (position in ('top','center','bottom'));

create table if not exists settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);
alter table settings enable row level security;
create policy "public read settings" on settings for select using (true);
create policy "master write settings" on settings for all using (is_master()) with check (is_master());
insert into settings (id, data) values (1, '{}') on conflict (id) do nothing;
notify pgrst, 'reload schema';

-- ===== Update 4: contact messages, subscribers, form protection =====
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  read boolean not null default false,
  created_at timestamptz default now()
);
alter table messages enable row level security;
create policy "master reads messages" on messages for select using (is_master());
create policy "master updates messages" on messages for update using (is_master()) with check (is_master());
create policy "master deletes messages" on messages for delete using (is_master());

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now()
);
alter table subscribers enable row level security;
create policy "master reads subscribers" on subscribers for select using (is_master());
create policy "master deletes subscribers" on subscribers for delete using (is_master());

create table if not exists form_hits (
  id bigserial primary key,
  ip text not null,
  kind text not null,
  at timestamptz default now()
);
alter table form_hits enable row level security;  -- no policies: only the server can use it
notify pgrst, 'reload schema';

-- ===== Update 5: version history for Design and Settings =====
create table if not exists settings_versions (
  id bigserial primary key,
  data jsonb not null,
  created_at timestamptz default now()
);
alter table settings_versions enable row level security;
create policy "master reads versions" on settings_versions for select using (is_master());
create policy "master adds versions" on settings_versions for insert with check (is_master());
create policy "master deletes versions" on settings_versions for delete using (is_master());
notify pgrst, 'reload schema';

-- ===== Update 6: gallery captions/links/hide, free album names, mood-board hide, blog covers/excerpts/tags/featured =====
alter table artworks add column if not exists caption text;
alter table artworks add column if not exists link_url text;
alter table artworks add column if not exists hidden boolean not null default false;
alter table artworks drop constraint if exists artworks_album_check;
alter table moods add column if not exists hidden boolean not null default false;
alter table posts add column if not exists excerpt text;
alter table posts add column if not exists cover_path text;
alter table posts add column if not exists tags text;
alter table posts add column if not exists featured boolean not null default false;
notify pgrst, 'reload schema';
