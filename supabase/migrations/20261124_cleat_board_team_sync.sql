-- Cleat Board: columns the app needs to sync teams across devices.
-- Run once in Supabase → SQL Editor → New query. Safe to run again.
-- Assumes the teams and players tables (with their RLS policies) already exist.

alter table public.teams add column if not exists level text not null default '7v7';
alter table public.teams add column if not exists formation jsonb not null default '[]'::jsonb;
alter table public.teams add column if not exists sort_order int not null default 0;
alter table public.teams add column if not exists updated_at timestamptz not null default now();

-- Ask the Supabase API to pick up the new columns right away.
notify pgrst, 'reload schema';
