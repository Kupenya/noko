create table if not exists admins (
  id bigint generated always as identity primary key,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists site_settings (
  id smallint primary key default 1 check (id = 1),
  couple_names text not null default 'Our Wedding',
  wedding_date date,
  venue text,
  tagline text,
  hero_image text,
  currency text not null default '₦',
  bank_name text,
  account_name text,
  account_number text,
  dress_code text,
  music_url text,
  primary_color text not null default '#173f3b',
  accent_color text not null default '#b38a62',
  sage_color text not null default '#edf1ec',
  cream_color text not null default '#f8f5ef',
  updated_at timestamptz not null default now()
);

alter table site_settings add column if not exists music_url text;
alter table site_settings add column if not exists primary_color text;
alter table site_settings add column if not exists accent_color text;
alter table site_settings add column if not exists sage_color text;
alter table site_settings add column if not exists cream_color text;

create table if not exists story_sections (id bigint generated always as identity primary key, position int not null default 0, title text not null, body text not null default '', image text, created_at timestamptz not null default now());
create table if not exists events (id bigint generated always as identity primary key, position int not null default 0, title text not null, event_date date, start_time text, venue text, map_url text, description text, created_at timestamptz not null default now());
create table if not exists color_palette (id bigint generated always as identity primary key, position int not null default 0, role text, name text, hex text, note text, created_at timestamptz not null default now());
create table if not exists registry_items (id bigint generated always as identity primary key, position int not null default 0, name text not null, description text not null default '', price numeric(12,2) not null default 0, image text, active boolean not null default true, created_at timestamptz not null default now());
create table if not exists gallery_images (id bigint generated always as identity primary key, position int not null default 0, image text not null, caption text, created_at timestamptz not null default now());
create table if not exists faqs (id bigint generated always as identity primary key, position int not null default 0, question text not null, answer text not null, created_at timestamptz not null default now());
create table if not exists rsvps (id bigint generated always as identity primary key, name text not null, email text unique not null, attending boolean not null, guests int not null default 1 check (guests between 0 and 10), dietary text, message text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists reservations (id bigint generated always as identity primary key, item_id bigint not null references registry_items(id) on delete cascade, guest_name text, display_name text not null, status text not null default 'pending' check (status in ('pending','confirmed','removed')), created_at timestamptz not null default now());
create table if not exists password_reset_tokens (
  token_hash text primary key,
  email text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

update site_settings set
  primary_color=coalesce(primary_color,'#173f3b'),
  accent_color=coalesce(accent_color,'#b38a62'),
  sage_color=coalesce(sage_color,'#edf1ec'),
  cream_color=coalesce(cream_color,'#f8f5ef')
where id=1;

create table if not exists site_sections (
  id bigint generated always as identity primary key,
  section_key text unique not null,
  title text not null,
  enabled boolean not null default true,
  position int not null default 0
);

insert into site_sections (section_key,title,enabled,position) values
('story','Our Story',true,1),('schedule','Schedule',true,2),('colours','Colours of the day',true,3),
('rsvp','RSVP',true,4),('registry','Gift Registry',true,5),('gallery','Gallery',true,6),('faq','Questions',true,7)
on conflict (section_key) do nothing;

create table if not exists custom_sections (
  id bigint generated always as identity primary key,
  position int not null default 0,
  title text not null,
  body text not null default '',
  image text,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists invitations (
  id bigint generated always as identity primary key,
  code text unique not null,
  household_name text not null,
  email text,
  phone text,
  allowed_guests int not null default 1 check (allowed_guests between 1 and 10),
  expires_at timestamptz,
  status text not null default 'active' check (status in ('active','used','revoked','expired')),
  used_at timestamptz,
  rsvp_id bigint references rsvps(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists invitations_code_idx on invitations(code);
