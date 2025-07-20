-- Create conferences table
create table if not exists public.conferences (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    league_id uuid not null references public.leagues(id) on delete cascade,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint conferences_name_league_unique unique (name, league_id)
);

-- Create divisions table
create table if not exists public.divisions (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    conference_id uuid not null references public.conferences(id) on delete cascade,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint divisions_name_conference_unique unique (name, conference_id)
);

-- Add division_id to teams table if it doesn't exist
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name = 'teams' and column_name = 'division_id') then
        alter table public.teams add column division_id uuid references public.divisions(id) on delete set null;
    end if;
end $$;

-- Enable Row Level Security (RLS)
alter table public.conferences enable row level security;
alter table public.divisions enable row level security;

-- Create policies for conferences
create policy "Enable read access for all users" on public.conferences
    for select using (true);

create policy "Enable insert for authenticated users only" on public.conferences
    for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.conferences
    for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only" on public.conferences
    for delete using (auth.role() = 'authenticated');

-- Create policies for divisions
create policy "Enable read access for all users" on public.divisions
    for select using (true);

create policy "Enable insert for authenticated users only" on public.divisions
    for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.divisions
    for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only" on public.divisions
    for delete using (auth.role() = 'authenticated');

-- Create updated_at triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
    before update on public.conferences
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.divisions
    for each row
    execute procedure public.handle_updated_at();
