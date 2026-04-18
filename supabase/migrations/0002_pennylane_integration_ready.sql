-- ==========================================================================
-- CabiPilot — Migration 0002 : Pennylane integration ready
-- Applied on 2026-04-17 via Supabase MCP
-- ==========================================================================
-- Ajoute toutes les structures nécessaires pour l'intégration OAuth Pennylane
-- (et Tiime à M+4) sans toucher aux features MVP existantes.

-- Extension pour chiffrement des tokens OAuth
create extension if not exists pgcrypto;

-- ==========================================================================
-- 1. CABINETS — colonnes OAuth Pennylane + Tiime
-- ==========================================================================
alter table cabinets add column if not exists pennylane_company_id text;
alter table cabinets add column if not exists pennylane_access_token_encrypted text;
alter table cabinets add column if not exists pennylane_refresh_token_encrypted text;
alter table cabinets add column if not exists pennylane_token_expires_at timestamptz;
alter table cabinets add column if not exists pennylane_scope text;
alter table cabinets add column if not exists pennylane_connected_at timestamptz;
alter table cabinets add column if not exists pennylane_last_sync_at timestamptz;

alter table cabinets add column if not exists tiime_company_id text;
alter table cabinets add column if not exists tiime_access_token_encrypted text;
alter table cabinets add column if not exists tiime_refresh_token_encrypted text;
alter table cabinets add column if not exists tiime_token_expires_at timestamptz;
alter table cabinets add column if not exists tiime_connected_at timestamptz;

-- ==========================================================================
-- 2. DOSSIERS — tracking de la source
-- ==========================================================================
alter table dossiers add column if not exists source text default 'manual'
  check (source in ('manual', 'pennylane', 'tiime', 'upload_fec'));
alter table dossiers add column if not exists pennylane_customer_id text;
alter table dossiers add column if not exists tiime_customer_id text;
alter table dossiers add column if not exists last_synced_at timestamptz;

create index if not exists idx_dossiers_pennylane on dossiers(pennylane_customer_id) where pennylane_customer_id is not null;
create index if not exists idx_dossiers_tiime on dossiers(tiime_customer_id) where tiime_customer_id is not null;
create index if not exists idx_dossiers_source on dossiers(source);

-- ==========================================================================
-- 3. DOCUMENTS — cache + mapping externe
-- ==========================================================================
alter table documents add column if not exists source text default 'manual'
  check (source in ('manual', 'pennylane', 'tiime', 'upload'));
alter table documents add column if not exists pennylane_document_id text;
alter table documents add column if not exists tiime_document_id text;
alter table documents add column if not exists cached_at timestamptz;
alter table documents add column if not exists cache_ttl_minutes int default 60;

-- ==========================================================================
-- 4. OAUTH_STATES — protection CSRF du flow OAuth
-- ==========================================================================
create table if not exists oauth_states (
  state_token text primary key,
  cabinet_id uuid references cabinets(id) on delete cascade,
  provider text not null check (provider in ('pennylane', 'tiime')),
  redirect_after text,
  created_at timestamptz default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes')
);

create index if not exists idx_oauth_states_expires on oauth_states(expires_at);

alter table oauth_states enable row level security;

drop policy if exists "oauth_states_service_only" on oauth_states;
create policy "oauth_states_service_only" on oauth_states
  for all using (false) with check (false);

-- ==========================================================================
-- 5. INTEGRATION_LOGS — audit trail des appels API externes
-- ==========================================================================
create table if not exists integration_logs (
  id uuid primary key default uuid_generate_v4(),
  cabinet_id uuid references cabinets(id) on delete cascade,
  provider text not null check (provider in ('pennylane', 'tiime', 'claude', 'other')),
  action text not null,
  method text,
  endpoint text,
  status_code int,
  latency_ms int,
  error_code text,
  error_message text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_integration_logs_cabinet on integration_logs(cabinet_id, created_at desc);
create index if not exists idx_integration_logs_provider on integration_logs(provider, created_at desc);
create index if not exists idx_integration_logs_errors on integration_logs(created_at desc) where error_code is not null;

alter table integration_logs enable row level security;

drop policy if exists "integration_logs_same_cabinet" on integration_logs;
create policy "integration_logs_same_cabinet" on integration_logs for select
  using (cabinet_id in (select cabinet_id from users_profile where id = auth.uid()));

-- ==========================================================================
-- 6. Fonctions utilitaires chiffrement
-- ==========================================================================
create or replace function encrypt_token(plaintext text, key text)
returns text language sql as $$
  select encode(pgp_sym_encrypt(plaintext, key), 'base64');
$$;

create or replace function decrypt_token(ciphertext text, key text)
returns text language sql as $$
  select pgp_sym_decrypt(decode(ciphertext, 'base64'), key);
$$;

-- ==========================================================================
-- 7. Vue : état d'intégration par cabinet
-- ==========================================================================
create or replace view cabinet_integrations_status as
select
  c.id as cabinet_id,
  c.name,
  c.plan,
  case when c.pennylane_access_token_encrypted is not null then true else false end as pennylane_connected,
  c.pennylane_connected_at,
  c.pennylane_last_sync_at,
  c.pennylane_token_expires_at,
  case
    when c.pennylane_token_expires_at is null then null
    when c.pennylane_token_expires_at < now() then 'expired'
    when c.pennylane_token_expires_at < now() + interval '5 minutes' then 'expiring_soon'
    else 'valid'
  end as pennylane_token_status,
  case when c.tiime_access_token_encrypted is not null then true else false end as tiime_connected,
  c.tiime_connected_at,
  (select count(*) from dossiers where cabinet_id = c.id and source = 'pennylane') as pennylane_dossiers_count,
  (select count(*) from dossiers where cabinet_id = c.id and source = 'tiime') as tiime_dossiers_count,
  (select count(*) from dossiers where cabinet_id = c.id and source = 'manual') as manual_dossiers_count
from cabinets c;

-- ==========================================================================
-- 8. Cleanup des oauth_states expirés
-- ==========================================================================
create or replace function cleanup_expired_oauth_states()
returns void language sql as $$
  delete from oauth_states where expires_at < now();
$$;
