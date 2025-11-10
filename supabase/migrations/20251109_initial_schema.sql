-- SpiegelMatch Supabase Migration
-- Erstellt: 2025-11-09

-- Sicherstellen, dass UUID-Generierung verfügbar ist
create extension if not exists "pgcrypto";

-- ============================================================================
-- TABELLEN
-- ============================================================================

create table if not exists public.characters (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    username text not null,
    big5 jsonb not null check (jsonb_typeof(big5) = 'object'),
    tags jsonb not null check (jsonb_typeof(tags) = 'array'),
    lifestyle jsonb not null check (jsonb_typeof(lifestyle) = 'object'),
    archetype text not null,
    adjustments jsonb not null check (jsonb_typeof(adjustments) = 'object'),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.matches (
    id uuid primary key default gen_random_uuid(),
    user1_id uuid not null references auth.users(id) on delete cascade,
    user2_id uuid not null references auth.users(id) on delete cascade,
    score jsonb not null check (jsonb_typeof(score) = 'object'),
    compatibility_level text not null check (compatibility_level in (
        'Poor', 'Okay', 'Good', 'Excellent', 'Perfect'
    )),
    created_at timestamptz not null default timezone('utc', now())
);

-- ============================================================================
-- CONSTRAINTS & INDEXE
-- ============================================================================

alter table public.matches
    add constraint matches_user_pair_check
        check (user1_id <> user2_id);

create unique index if not exists characters_user_unique_idx
    on public.characters (user_id, username);

create index if not exists characters_user_idx
    on public.characters (user_id);

create index if not exists matches_user1_idx
    on public.matches (user1_id);

create index if not exists matches_user2_idx
    on public.matches (user2_id);

create index if not exists matches_compatibility_idx
    on public.matches (compatibility_level);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$ language plpgsql;

create trigger trg_characters_updated_at
    before update on public.characters
    for each row
    execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.characters enable row level security;
alter table public.matches enable row level security;

-- Characters: nur eigener Zugriff
drop policy if exists characters_self_access_select on public.characters;
create policy characters_self_access_select
    on public.characters
    for select
    using (auth.uid() = user_id);

drop policy if exists characters_self_access_insert on public.characters;
create policy characters_self_access_insert
    on public.characters
    for insert
    with check (auth.uid() = user_id);

drop policy if exists characters_self_access_update on public.characters;
create policy characters_self_access_update
    on public.characters
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists characters_self_access_delete on public.characters;
create policy characters_self_access_delete
    on public.characters
    for delete
    using (auth.uid() = user_id);

-- Matches: sichtbar für beide Partner
drop policy if exists matches_dual_access_select on public.matches;
create policy matches_dual_access_select
    on public.matches
    for select
    using (auth.uid() in (user1_id, user2_id));

drop policy if exists matches_dual_access_insert on public.matches;
create policy matches_dual_access_insert
    on public.matches
    for insert
    with check (auth.uid() in (user1_id, user2_id));

drop policy if exists matches_dual_access_update on public.matches;
create policy matches_dual_access_update
    on public.matches
    for update
    using (auth.uid() in (user1_id, user2_id))
    with check (auth.uid() in (user1_id, user2_id));

drop policy if exists matches_dual_access_delete on public.matches;
create policy matches_dual_access_delete
    on public.matches
    for delete
    using (auth.uid() in (user1_id, user2_id));
