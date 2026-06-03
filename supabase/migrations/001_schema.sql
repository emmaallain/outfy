-- ============================================================
-- Outfy — schéma Supabase initial
-- ============================================================

-- Extension pour UUID
create extension if not exists "uuid-ossp";

-- ─── Profiles ───────────────────────────────────────────────
create table public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  username      text unique not null,
  full_name     text,
  avatar_url    text,
  avatar_color  text default '#FC850F',
  created_at    timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Tout le monde peut voir les profils"
  on public.profiles for select using (true);

create policy "L'utilisateur gère son profil"
  on public.profiles for all using (auth.uid() = id);

-- Crée automatiquement un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Items (garde-robe) ──────────────────────────────────────
create table public.items (
  id             uuid default uuid_generate_v4() primary key,
  user_id        uuid references public.profiles(id) on delete cascade not null,
  name           text not null,
  brand          text,
  category       text not null check (category in ('vetements','chaussures','maquillage','bijoux')),
  subcategory    text,
  size           text,
  color          text,
  barcode        text,
  rating         integer check (rating between 1 and 5),
  purchase_year  integer,
  expiry_date    date,
  collection     text,
  link           text,
  notes          text,
  occasions      text[] default '{}',
  photo_url      text,
  is_wishlist    boolean default false,
  wishlist_price text,
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

alter table public.items enable row level security;

create policy "Lecture publique via amitié"
  on public.items for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.friendships
      where ((user_id = auth.uid() and friend_id = items.user_id)
          or (friend_id = auth.uid() and user_id = items.user_id))
      and status = 'accepted'
    )
  );

create policy "L'utilisateur gère ses items"
  on public.items for all using (auth.uid() = user_id);

-- Updated_at auto
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger items_updated_at
  before update on public.items
  for each row execute procedure public.set_updated_at();

-- ─── Outfits ──────────────────────────────────────────────────
create table public.outfits (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  name       text not null,
  date       date,
  occasion   text,
  notes      text,
  created_at timestamptz default now() not null
);

alter table public.outfits enable row level security;

create policy "L'utilisateur gère ses tenues"
  on public.outfits for all using (auth.uid() = user_id);

-- ─── Outfit items (liaison) ───────────────────────────────────
create table public.outfit_items (
  outfit_id uuid references public.outfits(id) on delete cascade,
  item_id   uuid references public.items(id) on delete cascade,
  primary key (outfit_id, item_id)
);

alter table public.outfit_items enable row level security;

create policy "L'utilisateur gère ses outfit_items"
  on public.outfit_items for all
  using (
    exists (select 1 from public.outfits where id = outfit_id and user_id = auth.uid())
  );

-- ─── Amitiés ─────────────────────────────────────────────────
create table public.friendships (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  friend_id  uuid references public.profiles(id) on delete cascade not null,
  status     text default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz default now() not null,
  unique (user_id, friend_id)
);

alter table public.friendships enable row level security;

create policy "Lecture des amitiés liées à l'utilisateur"
  on public.friendships for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Création de demande d'amitié"
  on public.friendships for insert
  with check (auth.uid() = user_id);

create policy "Accepter/Rejeter une demande"
  on public.friendships for update
  using (auth.uid() = friend_id);

-- ─── Fil d'activité ───────────────────────────────────────────
create table public.feed_activities (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  action     text not null,  -- ex: "a ajouté", "porte", "a composé"
  item_id    uuid references public.items(id) on delete set null,
  outfit_id  uuid references public.outfits(id) on delete set null,
  created_at timestamptz default now() not null
);

alter table public.feed_activities enable row level security;

create policy "Lecture du fil des amis"
  on public.feed_activities for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.friendships
      where ((user_id = auth.uid() and friend_id = feed_activities.user_id)
          or (friend_id = auth.uid() and user_id = feed_activities.user_id))
      and status = 'accepted'
    )
  );

create policy "L'utilisateur crée ses activités"
  on public.feed_activities for insert
  with check (auth.uid() = user_id);

-- ─── Storage bucket ───────────────────────────────────────────
-- À créer dans Supabase Dashboard > Storage :
-- Bucket "item-photos" : public = true, max file size = 5 MB
-- Policy : authenticated users can upload to their own folder (user_id/*)

-- ─── Index de performance ─────────────────────────────────────
create index items_user_id_idx on public.items(user_id);
create index items_category_idx on public.items(category);
create index items_barcode_idx on public.items(barcode) where barcode is not null;
create index outfits_user_id_idx on public.outfits(user_id);
create index outfits_date_idx on public.outfits(date) where date is not null;
create index feed_activities_user_id_idx on public.feed_activities(user_id);
create index feed_activities_created_at_idx on public.feed_activities(created_at desc);
create index friendships_user_id_idx on public.friendships(user_id);
create index friendships_friend_id_idx on public.friendships(friend_id);
