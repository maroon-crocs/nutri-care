create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  instagram_handle text not null default '',
  email text not null default '',
  age text not null default '',
  gender text not null default '',
  height text not null default '',
  weight text not null default '',
  diet_type text not null default '',
  allergies text not null default '',
  health_issues text not null default '',
  goal text not null default '',
  workout_status text not null default '',
  workout_type text not null default '',
  medicines_supplements text not null default '',
  preferences text not null default '',
  wake_sleep_time text not null default '',
  cuisine_preference text not null default '',
  budget_preference text not null default '',
  current_eating_pattern text not null default '',
  package_name text not null default '',
  amount numeric(10, 2),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid')),
  status text not null default 'new' check (
    status in (
      'new',
      'intakeReceived',
      'paymentPending',
      'planPending',
      'planSent',
      'followUpDue',
      'completed'
    )
  ),
  follow_up_date date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null default '',
  goal text not null default '',
  status text not null default 'draft' check (status in ('draft', 'final')),
  plan_json jsonb not null,
  pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.intake_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  token text not null unique,
  status text not null default 'active' check (status in ('active', 'submitted', 'expired', 'revoked')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  amount numeric(10, 2) not null default 0,
  method text not null default '',
  status text not null default 'unpaid' check (status in ('unpaid', 'partial', 'paid', 'refunded')),
  paid_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'done', 'missed')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists diet_plans_set_updated_at on public.diet_plans;
create trigger diet_plans_set_updated_at
before update on public.diet_plans
for each row execute function public.set_updated_at();

drop trigger if exists intake_links_set_updated_at on public.intake_links;
create trigger intake_links_set_updated_at
before update on public.intake_links
for each row execute function public.set_updated_at();

drop trigger if exists templates_set_updated_at on public.templates;
create trigger templates_set_updated_at
before update on public.templates
for each row execute function public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists followups_set_updated_at on public.followups;
create trigger followups_set_updated_at
before update on public.followups
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'admin'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.diet_plans enable row level security;
alter table public.intake_links enable row level security;
alter table public.templates enable row level security;
alter table public.payments enable row level security;
alter table public.followups enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "clients_owner_all" on public.clients;
create policy "clients_owner_all"
on public.clients for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "diet_plans_owner_all" on public.diet_plans;
create policy "diet_plans_owner_all"
on public.diet_plans for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "intake_links_owner_all" on public.intake_links;
create policy "intake_links_owner_all"
on public.intake_links for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "templates_owner_all" on public.templates;
create policy "templates_owner_all"
on public.templates for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "payments_owner_all" on public.payments;
create policy "payments_owner_all"
on public.payments for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "followups_owner_all" on public.followups;
create policy "followups_owner_all"
on public.followups for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create index if not exists clients_owner_status_idx on public.clients (owner_id, status);
create index if not exists clients_owner_updated_at_idx on public.clients (owner_id, updated_at desc);
create index if not exists diet_plans_owner_client_idx on public.diet_plans (owner_id, client_id);
create index if not exists diet_plans_owner_updated_at_idx on public.diet_plans (owner_id, updated_at desc);
create index if not exists intake_links_token_idx on public.intake_links (token);
create index if not exists payments_owner_client_idx on public.payments (owner_id, client_id);
create index if not exists followups_owner_due_idx on public.followups (owner_id, due_date);
