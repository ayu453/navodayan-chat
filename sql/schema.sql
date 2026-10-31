-- Navodayan Chat: minimal Supabase schema for cloud accounts, profiles, and live global chat.
-- Run this whole file in Supabase Dashboard -> SQL Editor -> New query.

create table if not exists public.nv_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  name text not null,
  school_code text not null default '',
  entry_year integer,
  jnv text not null default '',
  about text not null default '',
  photo text not null default '',
  flag_color text not null default '#22d3ee',
  updated_at timestamptz not null default now()
);

create table if not exists public.nv_messages (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  name text not null,
  photo text not null default '',
  status text not null default '',
  body text not null check (char_length(body) between 1 and 5000),
  reply jsonb,
  created_at timestamptz not null default now()
);

create index if not exists nv_messages_created_at_idx on public.nv_messages (created_at desc);
create index if not exists nv_messages_user_id_idx on public.nv_messages (user_id);

alter table public.nv_profiles enable row level security;
alter table public.nv_messages enable row level security;

drop policy if exists "profiles_select_own" on public.nv_profiles;
create policy "profiles_select_own" on public.nv_profiles
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "profiles_insert_own" on public.nv_profiles;
create policy "profiles_insert_own" on public.nv_profiles
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "profiles_update_own" on public.nv_profiles;
create policy "profiles_update_own" on public.nv_profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "messages_read_authenticated" on public.nv_messages;
create policy "messages_read_authenticated" on public.nv_messages
  for select to authenticated using (true);
drop policy if exists "messages_insert_own" on public.nv_messages;
create policy "messages_insert_own" on public.nv_messages
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "messages_delete_own" on public.nv_messages;
create policy "messages_delete_own" on public.nv_messages
  for delete to authenticated using (auth.uid() = user_id);

-- Enable Realtime delivery for new and deleted chat messages.
do $$
begin
  alter publication supabase_realtime add table public.nv_messages;
exception
  when duplicate_object then null;
  when undefined_object then
    raise notice 'Publication supabase_realtime was not found; enable Realtime for nv_messages in the Dashboard.';
end $$;

