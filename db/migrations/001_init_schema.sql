-- 001_init_schema.sql
-- Creates core tables for multi-system RPG platform
-- Assumes Postgres (Supabase)

-- Enable extensions
create extension if not exists "uuid-ossp";

-- systems
create table if not exists systems (
  id text primary key,          -- e.g. 't20', 'dnd5e'
  name text not null,
  version text not null default '1.0',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- campaigns
create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null, -- auth.users.id
  system_id text not null references systems(id),
  title text not null,
  description text,
  public boolean not null default false,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- campaign_members
create table if not exists campaign_members (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_id uuid not null, -- auth.users.id
  role text not null check (role in ('player','gm','owner')),
  joined_at timestamptz default now(),
  active_character_id uuid null
);

-- characters (domain-level)
create table if not exists characters (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null,
  name text not null,
  system_id text not null references systems(id),
  avatar_url text,
  base_data jsonb default '{}'::jsonb,
  is_private boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- character_versions / sheets
create table if not exists character_versions (
  id uuid primary key default uuid_generate_v4(),
  character_id uuid not null references characters(id) on delete cascade,
  system_id text not null,
  sheet_data jsonb not null,
  created_by uuid not null,
  created_at timestamptz default now(),
  change_summary text
);

-- invite_links
create table if not exists invite_links (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  token text not null unique,
  created_by uuid not null,
  role_on_join text not null check (role_on_join in ('player','gm')) default 'player',
  expires_at timestamptz null,
  max_uses integer null,
  uses_count integer not null default 0,
  created_at timestamptz default now()
);

-- rolls / logs
create table if not exists rolls (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid null references campaigns(id),
  character_id uuid null references characters(id),
  user_id uuid null,
  type text not null, -- roll, note, action, system
  payload jsonb not null,
  created_at timestamptz default now()
);

-- audit logs
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  entity text not null,
  entity_id text not null,
  action text not null,
  performed_by uuid not null,
  diff jsonb,
  created_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_campaigns_owner on campaigns(owner_id);
create index if not exists idx_characters_owner on characters(owner_id);
create index if not exists idx_character_versions_char on character_versions(character_id);
create index if not exists idx_campaign_members_user on campaign_members(user_id);

-- ROW LEVEL SECURITY (RLS)
-- Enable RLS on the tables we must protect
alter table characters enable row level security;
alter table character_versions enable row level security;
alter table campaigns enable row level security;
alter table campaign_members enable row level security;
alter table invite_links enable row level security;
alter table rolls enable row level security;
alter table audit_logs enable row level security;

-- Helper function: user is member of campaign with a role
create or replace function is_campaign_member(p_campaign uuid, p_user uuid, p_role text default null) returns boolean as $$
  select exists (
    select 1 from campaign_members cm
    where cm.campaign_id = p_campaign
      and cm.user_id = p_user
      and (p_role is null or cm.role = p_role)
  );
$$ language sql stable;

-- Policies for characters
-- Owners can select/update/delete their characters
create policy "characters_owner_select" on characters
  for select using (owner_id = auth.uid());
create policy "characters_owner_insert" on characters
  for insert with check (owner_id = auth.uid());
create policy "characters_owner_update" on characters
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "characters_owner_delete" on characters
  for delete using (owner_id = auth.uid());

-- GMs of campaigns can select and update characters linked to their campaign.
-- We need a view or check to determine linkage: a character is linked if there exists a campaign_members entry where campaign_id in campaigns linking to the character.
-- For simplicity: allow GMs to select/update characters if they are GM of ANY campaign that has a campaign_member entry referencing a character via active_character_id OR character is linked by campaign_members (we expect link handled by characters_campaigns table but we used linkToCampaign on adapters—so implement linking by campaign_characters table next)

-- Create join table campaign_characters to record linking
create table if not exists campaign_characters (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  character_id uuid not null references characters(id) on delete cascade,
  linked_at timestamptz default now(),
  unique (campaign_id, character_id)
);
create index if not exists idx_campaign_characters_campaign on campaign_characters(campaign_id);
create index if not exists idx_campaign_characters_character on campaign_characters(character_id);

-- RLS: allow select if owner OR exists campaign_characters joined to a campaign where auth.uid() is gm/owner
create policy "characters_owner_or_gm_select" on characters
  for select using (
    owner_id = auth.uid()
    OR exists (
      select 1 from campaign_characters cc
      join campaign_members cm on cm.campaign_id = cc.campaign_id
      where cc.character_id = characters.id
        and cm.user_id = auth.uid()
        and cm.role in ('gm','owner')
    )
  );

create policy "characters_owner_or_gm_update" on characters
  for update using (
    owner_id = auth.uid()
    OR exists (
      select 1 from campaign_characters cc
      join campaign_members cm on cm.campaign_id = cc.campaign_id
      where cc.character_id = characters.id
        and cm.user_id = auth.uid()
        and cm.role in ('gm','owner')
    )
  ) with check (owner_id = auth.uid() OR true);

-- character_versions visibility follows characters' visibility
create policy "character_versions_select_if_character_visible" on character_versions
  for select using (
    exists (
      select 1 from characters c
      where c.id = character_versions.character_id
        and (
          c.owner_id = auth.uid()
          OR exists (
            select 1 from campaign_characters cc
            join campaign_members cm on cm.campaign_id = cc.campaign_id
            where cc.character_id = c.id
              and cm.user_id = auth.uid()
              and cm.role in ('gm','owner')
          )
        )
    )
  );

-- campaigns: owner and members can select; public campaigns selectable by any authenticated user
create policy "campaigns_select_for_owner_or_member_or_public" on campaigns
  for select using (
    public = true
    OR owner_id = auth.uid()
    OR exists (
      select 1 from campaign_members cm where cm.campaign_id = campaigns.id and cm.user_id = auth.uid()
    )
  );

create policy "campaigns_insert_owner" on campaigns
  for insert with check (owner_id = auth.uid());

create policy "campaigns_update_owner" on campaigns
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- campaign_members: only campaign members can see the list; inserts happen via invite/owner actions
create policy "campaign_members_select_member" on campaign_members
  for select using (
    exists (select 1 from campaign_members cm2 where cm2.campaign_id = campaign_members.campaign_id and cm2.user_id = auth.uid())
    OR campaigns.owner_id = auth.uid()
  );

-- invite_links: only campaign owner or gm can create/view their invites; invites consumable anonymously but require auth for consumption (handled by server)
create policy "invite_links_owner_campaign" on invite_links
  for select using (
    exists (select 1 from campaigns c where c.id = invite_links.campaign_id and c.owner_id = auth.uid())
    OR exists (select 1 from campaign_members cm where cm.campaign_id = invite_links.campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','owner'))
  );

create policy "invite_links_insert_owner_or_gm" on invite_links
  for insert with check (
    exists (select 1 from campaigns c where c.id = new_campaign_id and c.owner_id = auth.uid())
    OR exists (select 1 from campaign_members cm where cm.campaign_id = new_campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','owner'))
  );

-- rolls: visible to campaign members if linked to campaign; personal rolls visible to owner
create policy "rolls_select_campaign_member_or_owner" on rolls
  for select using (
    (campaign_id is not null and exists (select 1 from campaign_members cm where cm.campaign_id = rolls.campaign_id and cm.user_id = auth.uid()))
    OR (user_id = auth.uid())
  );

-- audit_logs: only accessible by admins or owners via backend; block public select
create policy "audit_logs_no_public" on audit_logs
  for select using (false);

-- End of migration
