# Supabase Setup Guide

It seems you are facing authentication issues. This is likely due to one of two reasons:
1. **Invalid API Keys**: The key you provided (`sb_publishable_...`) looks incorrect.
2. **Missing Database Schema**: The tables required for the app don't exist yet.

Please follow these steps to fix your project.

## Step 1: correct your Credentials

Open `frontend/.env` and check your keys.

- **VITE_SUPABASE_URL**: Should look like `https://xyz.supabase.co`.
- **VITE_SUPABASE_ANON_KEY**: This is the important one. It typically **starts with `eyJ`** and is a long string (JWT).
  - ❌ `sb_publishable_...` (The key currently in your file looks like this, which is likely WRONG/Invalid for this client).
  - ✅ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Action:** Go to your [Supabase Dashboard](https://supabase.com/dashboard) -> Project Settings -> API, and copy the `anon` `public` key. Paste it into your `.env` file.

## Step 2: Run the Database Schema

I cannot access your Supabase account directly. You must run the SQL script to create the tables.

1. Copy the **SQL Code** below.
2. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
3. Go to the **SQL Editor** (Icon on the left).
4. Click **New Query**.
5. **Paste** the code and click **Run**.

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES for user data driven by Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('patient', 'admin', 'receptionist', 'doctor')),
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication error (optional)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- HOSPITALS
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

alter table public.hospitals enable row level security;
create policy "Hospitals are viewable by everyone." on public.hospitals for select using (true);
create policy "Authenticated users can update hospitals." on public.hospitals for update using (auth.role() = 'authenticated');

-- BLOOD BANKS
create table if not exists public.blood_banks (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  lat float not null,
  lng float not null,
  city text,
  stock jsonb default '{}'::jsonb, 
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.blood_banks enable row level security;
create policy "Blood banks are viewable by everyone." on public.blood_banks for select using (true);

-- TOKENS
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

alter table public.tokens enable row level security;
create policy "Tokens are viewable by everyone." on public.tokens for select using (true);
create policy "Authenticated users can insert tokens." on public.tokens for insert with check (auth.role() = 'authenticated');
```

## Step 3: Restart and Test

1. **Stop** the running terminal (`Ctrl+C`).
2. Run `npm run dev` again.
3. Try to **Initialize Profile** (Register) or **Access Grid** (Login).
