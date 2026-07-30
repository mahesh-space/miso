create type public.app_role as enum ('admin', 'driver', 'customer');
create type public.profile_status as enum ('online', 'offline');
create type public.order_status as enum ('placed', 'preparing', 'picked_up', 'delivered');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.app_role not null default 'customer',
  phone text,
  address text,
  dietary_preference text,
  vehicle_type text,
  vehicle_registration text,
  license_number text,
  coverage_area text,
  team_name text,
  employee_id text,
  status public.profile_status not null default 'offline',
  account_status text not null default 'active' check (account_status in ('active', 'frozen', 'deactivated')),
  created_at timestamptz not null default now()
);
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cuisine text not null,
  image_url text,
  rating numeric(2,1) default 0,
  address text not null,
  phone text,
  description text,
  delivery_fee integer not null default 0,
  min_order integer not null default 0,
  delivery_time text default '30–45 min',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  price integer not null check (price >= 0),
  description text,
  category text,
  is_available boolean not null default true,
  is_vegetarian boolean not null default false,
  is_spicy boolean not null default false
);
create table public.orders (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.profiles(id),
  restaurant_id uuid not null references public.restaurants(id), driver_id uuid references public.profiles(id),
  status public.order_status not null default 'placed', total_amount integer not null check (total_amount >= 0),
  delivery_address text not null, items jsonb not null default '[]'::jsonb, created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
-- SELECT: own row only, or admin (role read from JWT user_metadata — no self-referential sub-query)
create policy "profiles select"
  on public.profiles for select
  using (
    auth.uid() = id
    or (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- INSERT: a newly signed-up user may insert only their own profile row
create policy "profiles insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- UPDATE: a user may update only their own profile row
create policy "profiles update own"
  on public.profiles for update
  using (auth.uid() = id);
create policy "restaurants public read" on public.restaurants for select using (true);
-- Admin can create, update, and delete restaurants
create policy "restaurants admin write"
  on public.restaurants for all
  using      ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

create policy "menu public read" on public.menu_items for select using (true);
-- Admin can create, update, and delete menu items
create policy "menu_items admin write"
  on public.menu_items for all
  using      ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');
create policy "customers read own orders" on public.orders for select using (customer_id = auth.uid() or driver_id = auth.uid() or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "customers create orders" on public.orders for insert with check (customer_id = auth.uid());
create policy "drivers and admins update orders" on public.orders for update using (driver_id = auth.uid() or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
alter publication supabase_realtime add table public.orders;
