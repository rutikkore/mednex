-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES for user data driven by Auth
create table public.profiles (
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

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- HOSPITALS
create table public.hospitals (
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
-- Only admins/staff can update (simplified for now)
create policy "Authenticated users can update hospitals." on public.hospitals for update using (auth.role() = 'authenticated');


-- BLOOD BANKS
create table public.blood_banks (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  lat float not null,
  lng float not null,
  city text,
  stock jsonb default '{}'::jsonb, -- Store blood group counts
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.blood_banks enable row level security;
create policy "Blood banks are viewable by everyone." on public.blood_banks for select using (true);


-- TOKENS
create table public.tokens (
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
