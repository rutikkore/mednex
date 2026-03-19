-- SAFE SCHEMA SCRIPT
-- Run this to fix your database tables and policies.
-- It will drop existing policies to avoid "already exists" errors.

-- 1. Enable UUID
create extension if not exists "uuid-ossp";

-- 2. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('patient', 'admin', 'receptionist', 'doctor')),
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reset Profiles Policies
alter table public.profiles enable row level security;
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 3. HOSPITALS
create table if not exists public.hospitals (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  lat float not null,
  lng float not null,
  address text,
  contact text,
  icu_total int default 0,
  icu_available int default 0,
  general_total int default 0,
  general_available int default 0,
  cardiac_total int default 0,
  cardiac_available int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Reset Hospitals Policies
alter table public.hospitals enable row level security;
drop policy if exists "Hospitals are viewable by everyone." on public.hospitals;
create policy "Hospitals are viewable by everyone." on public.hospitals for select using (true);

drop policy if exists "Authenticated users can update hospitals." on public.hospitals;
create policy "Authenticated users can update hospitals." on public.hospitals for update using (auth.role() = 'authenticated');

-- 4. BLOOD BANKS
create table if not exists public.blood_banks (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  lat float not null,
  lng float not null,
  city text,
  stock jsonb default '{}'::jsonb, 
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Reset Blood Banks Policies
alter table public.blood_banks enable row level security;
drop policy if exists "Blood banks are viewable by everyone." on public.blood_banks;
create policy "Blood banks are viewable by everyone." on public.blood_banks for select using (true);

-- 5. TOKENS
create table if not exists public.tokens (
  id uuid default uuid_generate_v4() primary key,
  number text not null,
  patient_name text not null,
  service text,
  severity text check (severity in ('normal', 'priority', 'emergency')),
  status text check (status in ('waiting', 'called', 'completed', 'cancelled')),
  eta text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Reset Tokens Policies
alter table public.tokens enable row level security;
drop policy if exists "Tokens are viewable by everyone." on public.tokens;
create policy "Tokens are viewable by everyone." on public.tokens for select using (true);

drop policy if exists "Authenticated users can insert tokens." on public.tokens;
create policy "Authenticated users can insert tokens." on public.tokens for insert with check (auth.role() = 'authenticated');

-- 6. FUNCTIONS & TRIGGERS
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger logic loosely (only create if missing logic is complex in SQL, easiest to drop and recreate)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
