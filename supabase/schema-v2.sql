-- Fresh, idempotent setup for the wedding website.
-- Run this in Supabase SQL Editor before running the app.

create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
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
  updated_at timestamptz not null default now()
);

create table if not exists public.story_sections (id bigint generated always as identity primary key, position int not null default 0, title text not null, body text not null default '', image text, created_at timestamptz not null default now());
create table if not exists public.events (id bigint generated always as identity primary key, position int not null default 0, title text not null, event_date date, start_time text, venue text, map_url text, description text, created_at timestamptz not null default now());
create table if not exists public.color_palette (id bigint generated always as identity primary key, position int not null default 0, role text, name text, hex text, note text, created_at timestamptz not null default now());
create table if not exists public.registry_items (id bigint generated always as identity primary key, position int not null default 0, name text not null, description text not null default '', price numeric(12,2) not null default 0, image text, active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.gallery_images (id bigint generated always as identity primary key, position int not null default 0, image text not null, caption text, created_at timestamptz not null default now());
create table if not exists public.faqs (id bigint generated always as identity primary key, position int not null default 0, question text not null, answer text not null, created_at timestamptz not null default now());
create table if not exists public.rsvps (id bigint generated always as identity primary key, name text not null, email text not null, attending boolean not null, guests int not null default 1 check (guests between 0 and 10), dietary text, message text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (email));
create table if not exists public.reservations (id bigint generated always as identity primary key, item_id bigint not null references public.registry_items(id) on delete cascade, guest_name text, display_name text not null, status text not null default 'pending' check (status in ('pending','confirmed','removed')), created_at timestamptz not null default now());

alter table public.registry_items add column if not exists active boolean not null default true;

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

create or replace view public.public_reservations as
select item_id, display_name
from public.reservations
where status <> 'removed';

grant usage on schema public to anon, authenticated;
grant select on public.public_reservations to anon, authenticated;

drop policy if exists "public read" on public.site_settings;
drop policy if exists "public read" on public.story_sections;
drop policy if exists "public read" on public.events;
drop policy if exists "public read" on public.color_palette;
drop policy if exists "public read" on public.registry_items;
drop policy if exists "public read" on public.gallery_images;
drop policy if exists "public read" on public.faqs;

do $$ declare t text; begin
  foreach t in array array['admins','site_settings','story_sections','events','color_palette','registry_items','gallery_images','faqs','rsvps','reservations'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin all" on public.%I', t);
  end loop;
end $$;

create or replace function public.is_admin() returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.admins a where lower(a.email) = lower(coalesce(auth.jwt()->>'email','')))
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- One explicit admin policy per table prevents accidental broad access.
do $$ declare t text; begin
  foreach t in array array['admins','site_settings','story_sections','events','color_palette','registry_items','gallery_images','faqs','rsvps','reservations'] loop
    execute format('create policy "admin all" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

create policy "public read settings" on public.site_settings for select using (true);
create policy "public read story" on public.story_sections for select using (true);
create policy "public read events" on public.events for select using (true);
create policy "public read colors" on public.color_palette for select using (true);
create policy "public read registry" on public.registry_items for select using (active = true);
create policy "public read gallery" on public.gallery_images for select using (true);
create policy "public read faqs" on public.faqs for select using (true);

insert into storage.buckets (id, name, public) values ('images','images',true) on conflict (id) do update set public = true;
drop policy if exists "public read images" on storage.objects;
drop policy if exists "admin write images" on storage.objects;
create policy "public read images" on storage.objects for select using (bucket_id = 'images');
create policy "admin write images" on storage.objects for all using (bucket_id = 'images' and public.is_admin()) with check (bucket_id = 'images' and public.is_admin());

-- Helpful defaults, inserted only when no data exists.
insert into public.site_settings (id,couple_names,wedding_date,venue,tagline,currency,bank_name,account_name,account_number,dress_code)
values (1,'Adaeze & Tunde','2027-03-20','The Grand Pavilion, Lagos','We are getting married','₦','Your Bank Name','Adaeze Okafor','0123456789','Please dress in the colours of the wedding palette.')
on conflict (id) do nothing;
