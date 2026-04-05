-- NagLead Initial Schema
-- 3 tables: users, leads, lead_events

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  trade text,
  business_name text,
  timezone text default 'America/New_York',
  nag_enabled boolean default true,
  nag_quiet_start time default '21:00',
  nag_quiet_end time default '07:00',
  push_token text,
  created_at timestamptz default now(),
  subscription_status text default 'free'
    check (subscription_status in ('free', 'pro', 'pro_annual'))
);

-- Leads
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text not null,
  phone text,
  email text,
  state text not null default 'reply_now'
    check (state in ('reply_now', 'waiting', 'won', 'lost')),
  value_cents integer,
  lost_reason text,
  source text default 'manual'
    check (source in ('manual', 'email', 'sms', 'missed_call', 'webhook')),
  snoozed_until timestamptz,
  last_nagged_at timestamptz,
  nag_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  replied_at timestamptz,
  closed_at timestamptz
);

-- Activity log
create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  event_type text not null
    check (event_type in (
      'created', 'called', 'texted', 'emailed',
      'replied', 'snoozed', 'won', 'lost', 'nagged'
    )),
  metadata jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index idx_leads_user_state on leads(user_id, state);
create index idx_leads_snoozed on leads(snoozed_until)
  where snoozed_until is not null;
create index idx_leads_nag on leads(user_id, state, last_nagged_at)
  where state in ('reply_now', 'waiting');
create index idx_events_lead on lead_events(lead_id, created_at);

-- Row-Level Security
alter table public.users enable row level security;
create policy "Users can read own profile"
  on public.users for select
  using (id = auth.uid());
create policy "Users can update own profile"
  on public.users for update
  using (id = auth.uid());

alter table public.leads enable row level security;
create policy "Users can manage own leads"
  on public.leads for all
  using (user_id = auth.uid());

alter table public.lead_events enable row level security;
create policy "Users can manage own events"
  on public.lead_events for all
  using (user_id = auth.uid());

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, trade)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'trade'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at on leads
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.update_updated_at();
