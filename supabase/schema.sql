-- ==========================================================================
-- CabiPilot — Schéma de base de données MVP
-- À copier-coller dans Supabase SQL Editor → Run
-- ==========================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- ==========================================================================
-- TABLES
-- ==========================================================================

-- Cabinets (tenant)
create table if not exists cabinets (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  siret text,
  plan text default 'trial' check (plan in ('trial', 'starter', 'pro', 'business', 'design_partner')),
  pennylane_connected boolean default false,
  tiime_connected boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Utilisateurs (collaborateurs du cabinet)
create table if not exists users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  cabinet_id uuid references cabinets(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text default 'collaborateur' check (role in ('admin', 'collaborateur')),
  created_at timestamptz default now()
);

-- Dossiers clients (les PME suivies par le cabinet)
create table if not exists dossiers (
  id uuid primary key default uuid_generate_v4(),
  cabinet_id uuid references cabinets(id) on delete cascade,
  client_name text not null,
  client_email text,
  client_phone text,
  siret text,
  regime_fiscal text,
  secteur text,
  last_relance_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents attachés à un dossier (factures, FEC, relevés)
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  dossier_id uuid references dossiers(id) on delete cascade,
  type text check (type in ('facture', 'releve', 'fec', 'contrat', 'devis', 'autre')),
  filename text,
  storage_path text,
  extracted_text text,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1536),
  uploaded_at timestamptz default now()
);

-- Relances générées par l'IA
create table if not exists relances (
  id uuid primary key default uuid_generate_v4(),
  dossier_id uuid references dossiers(id) on delete cascade,
  generated_by uuid references users_profile(id) on delete set null,
  reason text,
  content_email text,
  content_whatsapp text,
  email_subject text,
  status text default 'draft' check (status in ('draft', 'validated', 'sent', 'archived')),
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- Historique des questions Q&A sur un dossier
create table if not exists qa_log (
  id uuid primary key default uuid_generate_v4(),
  dossier_id uuid references dossiers(id) on delete cascade,
  asked_by uuid references users_profile(id) on delete set null,
  question text not null,
  answer text,
  sources jsonb default '[]'::jsonb,
  latency_ms int,
  created_at timestamptz default now()
);

-- Waitlist landing page
create table if not exists waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  full_name text,
  cabinet_name text,
  cabinet_size int,
  stack text,
  source text,
  utm_campaign text,
  notes text,
  created_at timestamptz default now()
);

-- ==========================================================================
-- INDEX
-- ==========================================================================

create index if not exists idx_dossiers_cabinet on dossiers(cabinet_id);
create index if not exists idx_documents_dossier on documents(dossier_id);
create index if not exists idx_relances_dossier on relances(dossier_id);
create index if not exists idx_relances_status on relances(status);
create index if not exists idx_qa_dossier on qa_log(dossier_id);

-- ==========================================================================
-- ROW LEVEL SECURITY
-- ==========================================================================

alter table cabinets enable row level security;
alter table users_profile enable row level security;
alter table dossiers enable row level security;
alter table documents enable row level security;
alter table relances enable row level security;
alter table qa_log enable row level security;
alter table waitlist enable row level security;

-- Cabinets : les users voient seulement leur cabinet
drop policy if exists "users_see_own_cabinet" on cabinets;
create policy "users_see_own_cabinet" on cabinets
  for select using (
    id in (select cabinet_id from users_profile where id = auth.uid())
  );

drop policy if exists "admins_update_own_cabinet" on cabinets;
create policy "admins_update_own_cabinet" on cabinets
  for update using (
    id in (select cabinet_id from users_profile where id = auth.uid() and role = 'admin')
  );

-- Users profile : chacun voit son profil + ceux de son cabinet
drop policy if exists "users_see_own_profile" on users_profile;
create policy "users_see_own_profile" on users_profile
  for select using (
    id = auth.uid() or
    cabinet_id in (select cabinet_id from users_profile where id = auth.uid())
  );

drop policy if exists "users_update_own_profile" on users_profile;
create policy "users_update_own_profile" on users_profile
  for update using (id = auth.uid());

-- Dossiers : isolés par cabinet
drop policy if exists "dossiers_same_cabinet" on dossiers;
create policy "dossiers_same_cabinet" on dossiers for all
  using (cabinet_id in (select cabinet_id from users_profile where id = auth.uid()));

-- Documents : via dossier
drop policy if exists "documents_same_cabinet" on documents;
create policy "documents_same_cabinet" on documents for all
  using (dossier_id in (
    select id from dossiers where cabinet_id in (
      select cabinet_id from users_profile where id = auth.uid()
    )
  ));

-- Relances : via dossier
drop policy if exists "relances_same_cabinet" on relances;
create policy "relances_same_cabinet" on relances for all
  using (dossier_id in (
    select id from dossiers where cabinet_id in (
      select cabinet_id from users_profile where id = auth.uid()
    )
  ));

-- Q&A log : via dossier
drop policy if exists "qa_same_cabinet" on qa_log;
create policy "qa_same_cabinet" on qa_log for all
  using (dossier_id in (
    select id from dossiers where cabinet_id in (
      select cabinet_id from users_profile where id = auth.uid()
    )
  ));

-- Waitlist : tout le monde peut insert (public), personne ne peut read (sauf service_role)
drop policy if exists "waitlist_insert_public" on waitlist;
create policy "waitlist_insert_public" on waitlist for insert
  with check (true);

-- ==========================================================================
-- TRIGGER : auto-update updated_at
-- ==========================================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trig_update_cabinets on cabinets;
create trigger trig_update_cabinets before update on cabinets
  for each row execute function update_updated_at();

drop trigger if exists trig_update_dossiers on dossiers;
create trigger trig_update_dossiers before update on dossiers
  for each row execute function update_updated_at();

-- ==========================================================================
-- FIN — Tout est prêt
-- ==========================================================================
