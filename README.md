# TIL App

A minimal "Today I Learned" (TIL) web application built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.

## Database Schema

Create a `tils` table in your Supabase project with the following SQL:

```sql
create table tils (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  tags text[] default '{}',
  slug text unique not null,
  is_published boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Row Level Security (RLS)
alter table tils enable row level security;

-- Public read access for published TILs
create policy "Public can read published TILs"
  on tils for select
  using (is_published = true);

-- Authenticated users can manage all TILs (simplified for dummy auth)
create policy "Authenticated users can manage TILs"
  on tils for all
  using (true);
```

## Setup

1. Copy `.env.local` to `.env` and fill in your Supabase credentials.
2. Run `npm install`.
3. Run `npm run dev`.
