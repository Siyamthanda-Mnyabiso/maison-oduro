-- Maison Oduro admin: run this once in Supabase > SQL Editor.

-- 1. Editable content (one row per section, JSON value)
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2. Who is an admin
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;  -- no policies: only is_admin() can read it

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 3. Row Level Security: everyone reads, only admins write
alter table public.site_content enable row level security;

drop policy if exists "public read" on public.site_content;
create policy "public read" on public.site_content for select to anon, authenticated using (true);

drop policy if exists "admin insert" on public.site_content;
create policy "admin insert" on public.site_content for insert to authenticated with check (public.is_admin());

drop policy if exists "admin update" on public.site_content;
create policy "admin update" on public.site_content for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin delete" on public.site_content;
create policy "admin delete" on public.site_content for delete to authenticated using (public.is_admin());

-- 3b. Table privileges. Newer Supabase projects do not grant these automatically,
--     and without them every request fails with "42501 permission denied".
--     (RLS above still decides WHICH rows each role may touch.)
grant usage on schema public to anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant execute on function public.is_admin() to authenticated;

notify pgrst, 'reload schema';

-- 4. Media storage (public bucket, admin-only writes)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 52428800,
        array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict (id) do update
  set public = true, file_size_limit = 52428800,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','video/mp4','video/webm'];

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'site-media' and public.is_admin());

-- 5. After creating your admin user (Authentication > Users > Add user),
--    make them an admin by running this with THEIR email:
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'you@example.com';
