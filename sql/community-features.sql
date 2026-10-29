-- Navodayan Chat shared Memories + Creativity Corner
-- Safe additive migration: does not drop or rewrite existing tables.
create table if not exists public.nv_community_posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('memory','creation')),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default 'Navodayan',
  caption text not null default '',
  title text not null default '',
  category text not null default 'other',
  body text not null default '',
  media_path text not null default '',
  media_type text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists nv_community_posts_kind_created_idx on public.nv_community_posts(kind, created_at desc);
create index if not exists nv_community_posts_user_idx on public.nv_community_posts(user_id);
alter table public.nv_community_posts enable row level security;
drop policy if exists "community_posts_read_authenticated" on public.nv_community_posts;
create policy "community_posts_read_authenticated" on public.nv_community_posts for select to authenticated using (true);
drop policy if exists "community_posts_insert_own" on public.nv_community_posts;
create policy "community_posts_insert_own" on public.nv_community_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "community_posts_update_own" on public.nv_community_posts;
create policy "community_posts_update_own" on public.nv_community_posts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "community_posts_delete_own" on public.nv_community_posts;
create policy "community_posts_delete_own" on public.nv_community_posts for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.nv_community_reactions (
  post_id uuid not null references public.nv_community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.nv_community_reactions enable row level security;
drop policy if exists "community_reactions_read_authenticated" on public.nv_community_reactions;
create policy "community_reactions_read_authenticated" on public.nv_community_reactions for select to authenticated using (true);
drop policy if exists "community_reactions_insert_own" on public.nv_community_reactions;
create policy "community_reactions_insert_own" on public.nv_community_reactions for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "community_reactions_delete_own" on public.nv_community_reactions;
create policy "community_reactions_delete_own" on public.nv_community_reactions for delete to authenticated using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('navodayan-community', 'navodayan-community', true, 26214400, array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = 26214400,
  allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "community_media_public_read" on storage.objects;
create policy "community_media_public_read" on storage.objects for select using (bucket_id = 'navodayan-community');
drop policy if exists "community_media_insert_own_folder" on storage.objects;
create policy "community_media_insert_own_folder" on storage.objects for insert to authenticated with check (bucket_id = 'navodayan-community' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "community_media_update_own_folder" on storage.objects;
create policy "community_media_update_own_folder" on storage.objects for update to authenticated using (bucket_id = 'navodayan-community' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'navodayan-community' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "community_media_delete_own_folder" on storage.objects;
create policy "community_media_delete_own_folder" on storage.objects for delete to authenticated using (bucket_id = 'navodayan-community' and (storage.foldername(name))[1] = auth.uid()::text);

grant select, insert, update, delete on public.nv_community_posts to authenticated;
grant select, insert, delete on public.nv_community_reactions to authenticated;
