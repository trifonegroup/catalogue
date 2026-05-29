-- ============================================================
-- Trifone Catalogue — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Tables ───────────────────────────────────────────────────

create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz default now()
);

create table if not exists products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  price        numeric(10, 2),
  category_id  uuid references categories(id) on delete set null,
  is_available boolean default true,
  is_featured  boolean default false,
  images       text[] default '{}',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table if not exists banners (
  id         uuid primary key default gen_random_uuid(),
  headline   text not null,
  sub        text,
  badge_text text default 'New Arrivals',
  cta_text   text default 'Browse Catalogue',
  cta_href   text default '#products',
  image_url  text,
  sort_order int default 0,
  is_active  boolean default true,
  created_at timestamptz default now()
);

create table if not exists settings (
  key   text primary key,
  value text not null
);

-- ── Seed settings ────────────────────────────────────────────

insert into settings (key, value)
values ('show_prices', 'true')
on conflict (key) do nothing;

-- ── updated_at trigger ───────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ── Row Level Security ───────────────────────────────────────

alter table categories enable row level security;
alter table products    enable row level security;
alter table settings    enable row level security;

-- categories
create policy "Public can read categories"
  on categories for select using (true);

create policy "Authenticated can insert categories"
  on categories for insert to authenticated with check (true);

create policy "Authenticated can update categories"
  on categories for update to authenticated using (true);

create policy "Authenticated can delete categories"
  on categories for delete to authenticated using (true);

-- products
create policy "Public can read products"
  on products for select using (true);

create policy "Authenticated can insert products"
  on products for insert to authenticated with check (true);

create policy "Authenticated can update products"
  on products for update to authenticated using (true);

create policy "Authenticated can delete products"
  on products for delete to authenticated using (true);

-- settings
create policy "Public can read settings"
  on settings for select using (true);

create policy "Authenticated can update settings"
  on settings for update to authenticated using (true);

-- banners
alter table banners enable row level security;

create policy "Public can read banners"
  on banners for select using (true);

create policy "Authenticated can insert banners"
  on banners for insert to authenticated with check (true);

create policy "Authenticated can update banners"
  on banners for update to authenticated using (true);

create policy "Authenticated can delete banners"
  on banners for delete to authenticated using (true);

-- ── Storage bucket ───────────────────────────────────────────
-- Run these in the Supabase Dashboard → Storage, or via SQL:

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public can read product images"
  on storage.objects for select using (bucket_id = 'product-images');

create policy "Authenticated can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images');

create policy "Authenticated can delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images');

insert into storage.buckets (id, name, public)
values ('banner-images', 'banner-images', true)
on conflict (id) do nothing;

create policy "Public can read banner images"
  on storage.objects for select using (bucket_id = 'banner-images');

create policy "Authenticated can upload banner images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'banner-images');

create policy "Authenticated can delete banner images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'banner-images');

-- ── Migration (run if tables already exist) ──────────────────
-- alter table products add column if not exists is_featured boolean default false;
