-- FINAL REPAIR SCRIPT 2.0
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. RESET PROFILES TABLE
-- We drop it to ensure a clean slate (CAUTION: DELETES EXISTING USER DATA)
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('patient', 'admin', 'receptionist', 'doctor')),
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ENABLE ROW LEVEL SECURITY
alter table public.profiles enable row level security;

-- 4. CREATE POLICIES (Allow public read, user-only write)
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 5. AUTOMATIC PROFILE CREATION TRIGGER
-- This ensures that when a user signs up, a profile is AUTOMATICALLY created.
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'role', 
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. GRANT PERMISSIONS (Fixes 'permission denied' errors)
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;
