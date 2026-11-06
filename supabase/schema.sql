-- Run this whole file in Supabase SQL Editor.
create table admins (email text primary key);
create table site_settings (
  id int primary key default 1 check (id = 1),
  couple_names text, wedding_date date, venue text, tagline text, hero_image text,
  currency text default '₦', bank_name text, account_name text, account_number text, dress_code text);
create table story_sections (id bigint generated always as identity primary key, position int default 0, title text, body text, image text, created_at timestamptz default now());
create table events (id bigint generated always as identity primary key, position int default 0, title text, event_date date, start_time text, venue text, map_url text, description text, created_at timestamptz default now());
create table color_palette (id bigint generated always as identity primary key, position int default 0, role text, name text, hex text, note text, created_at timestamptz default now());
create table registry_items (id bigint generated always as identity primary key, position int default 0, name text, description text, price numeric, image text, created_at timestamptz default now());
create table gallery_images (id bigint generated always as identity primary key, position int default 0, image text, caption text, created_at timestamptz default now());
create table faqs (id bigint generated always as identity primary key, position int default 0, question text, answer text, created_at timestamptz default now());
create table rsvps (id bigint generated always as identity primary key, name text not null, email text not null, attending boolean not null, guests int default 1, dietary text, message text, created_at timestamptz default now());
create table reservations (id bigint generated always as identity primary key, item_id bigint references registry_items(id) on delete cascade, guest_name text, display_name text not null, status text default 'pending' check (status in ('pending','confirmed','removed')), created_at timestamptz default now());

-- Public view: only the display name, never the real name when anonymous.
create view public_reservations as select item_id, display_name from reservations where status <> 'removed';
grant select on public_reservations to anon, authenticated;

-- Row Level Security
create or replace function is_admin() returns boolean language sql security definer stable as
$$ select exists (select 1 from admins where email = auth.jwt()->>'email') $$;

do $$ declare t text; begin
  foreach t in array array['admins','site_settings','story_sections','events','color_palette','registry_items','gallery_images','faqs','rsvps','reservations'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "admin all" on %I for all using (is_admin()) with check (is_admin())', t);
  end loop;
  foreach t in array array['site_settings','story_sections','events','color_palette','registry_items','gallery_images','faqs'] loop
    execute format('create policy "public read" on %I for select using (true)', t);
  end loop;
end $$;
-- rsvps & reservations: guests write only through the API routes (service role). No public access.

-- Image storage
insert into storage.buckets (id, name, public) values ('images','images',true);
create policy "public read images" on storage.objects for select using (bucket_id = 'images');
create policy "admin write images" on storage.objects for all using (bucket_id='images' and is_admin()) with check (bucket_id='images' and is_admin());

-- Placeholder content (all editable in /admin)
insert into site_settings (id,couple_names,wedding_date,venue,tagline,bank_name,account_name,account_number,dress_code)
values (1,'Adaeze & Tunde','2027-03-20','The Grand Pavilion, Lagos','We are getting married','Your Bank Name','Adaeze Okafor','0123456789','Please dress in the colours of your family or role. See the palette below.');
insert into story_sections (position,title,body) values
(1,'How we met','We met at a friend''s housewarming in 2019. Tunde spilled jollof on Adaeze''s shoes and spent the evening apologising. She forgave him by dessert.'),
(2,'The first date','A rainy Sunday, a tiny suya spot, and four hours of conversation that felt like ten minutes.'),
(3,'The proposal','On a quiet beach at sunset, Tunde asked. Adaeze said yes before he finished the question.');
insert into events (position,title,event_date,start_time,venue,map_url,description) values
(1,'Traditional Wedding','2027-03-19','10:00 AM','Bride''s Family Home, Lagos','https://maps.google.com','Come in your traditional attire.'),
(2,'White Wedding','2027-03-20','11:00 AM','St. Mark''s Cathedral, Lagos','https://maps.google.com','Ceremony followed by photos.'),
(3,'Reception','2027-03-20','3:00 PM','The Grand Pavilion, Lagos','https://maps.google.com','Dinner, music and dancing.');
insert into color_palette (position,role,name,hex,note) values
(1,'Bride''s family','Sage','#9CAF88',''),(2,'Groom''s family','Copper','#B87333',''),
(3,'Parents','Dusty Rose','#D8A7A7','Traditional and white wedding'),(4,'Reception','Deep Teal','#0F5257',''),
(5,'Groomsmen','Taupe','#8B7E74',''),(6,'Bridesmaids','Mint Green','#A8DCC4',''),
(7,'Bride & Groom','Purple','#6B3FA0','Traditional wedding');
insert into registry_items (position,name,description,price) values
(1,'Air Fryer','For quick weeknight dinners',85000),(2,'Dinner Set (24 pcs)','Porcelain, white and gold',120000),
(3,'Bedding Set','Egyptian cotton, king size',95000),(4,'Blender','High-speed, 1.5L',60000),
(5,'Honeymoon Fund','Help us celebrate somewhere warm',200000);
insert into faqs (position,question,answer) values
(1,'Can I bring a plus one?','Please check your invitation. Guest count is on your RSVP card.'),
(2,'Is there parking?','Yes, free parking is available at the venue.');
