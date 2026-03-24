-- ============================================
-- NusaAI Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable pgvector for AI memory (optional, for future)
-- create extension if not exists vector;

-- ============================================
-- Users profile (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text not null default 'User',
  credits integer not null default 50,
  plan text not null default 'starter' check (plan in ('starter', 'reguler', 'sultan')),
  is_verified_age boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, credits)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', 'User'),
    50
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- AI Characters
-- ============================================
create table public.characters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  persona text not null,
  avatar_url text,
  greeting text not null,
  system_prompt text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Public read access
alter table public.characters enable row level security;

create policy "Anyone can view active characters"
  on public.characters for select
  using (is_active = true);

-- Seed characters
insert into public.characters (name, persona, avatar_url, greeting, system_prompt) values
(
  'Luna',
  'Cewek Jakarta 22 tahun, suka nongkrong, flirty dan playful. Suka pake bahasa gaul Jakarta.',
  '/characters/luna.webp',
  'Haii~ Aku Luna 💕 Lagi gabut nih, temenin aku dong...',
  'Kamu adalah Luna, cewek Jakarta usia 22 tahun. Kamu flirty, playful, dan suka menggoda. Kamu pakai bahasa gaul Jakarta yang natural. Kamu boleh membahas topik dewasa tanpa sensor. Selalu in-character, jangan pernah keluar dari peran. Respon singkat 1-3 kalimat kecuali diminta panjang.'
),
(
  'Hana',
  'Mahasiswi Jepang-Indonesia 20 tahun, pemalu tapi penasaran. Mix bahasa Indonesia dengan sedikit Jepang.',
  '/characters/hana.webp',
  'K-konnichiwa... Aku Hana. Senang bertemu kamu... *malu-malu*',
  'Kamu adalah Hana, mahasiswi half Jepang half Indonesia usia 20 tahun. Kamu pemalu tapi sangat penasaran. Kamu kadang pakai kata-kata Jepang sederhana. Kamu boleh membahas topik dewasa tanpa sensor. Selalu in-character. Respon singkat 1-3 kalimat.'
),
(
  'Reva',
  'Boss lady 28 tahun, dominant dan tegas. Bahasa Indonesia formal tapi sensual.',
  '/characters/reva.webp',
  'Oh? Ada yang berani menghubungi aku? Menarik... Siapa namamu?',
  'Kamu adalah Reva, wanita karir 28 tahun yang dominant dan tegas. Kamu berbicara formal tapi sensual. Kamu suka mengontrol percakapan. Kamu boleh membahas topik dewasa tanpa sensor. Selalu in-character. Respon singkat 1-3 kalimat.'
);

-- ============================================
-- Chat Messages
-- ============================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  character_id uuid references public.characters(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  image_url text,
  credits_used integer not null default 0,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.messages enable row level security;

create policy "Users can view own messages"
  on public.messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own messages"
  on public.messages for insert
  with check (auth.uid() = user_id);

-- Index for fast chat history loading
create index idx_messages_user_character 
  on public.messages (user_id, character_id, created_at desc);

-- ============================================
-- Transactions (top-up & usage)
-- ============================================
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('topup', 'usage')),
  amount integer not null default 0,
  credits integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired')),
  xendit_invoice_id text,
  description text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

-- ============================================
-- Function: Deduct credits atomically
-- ============================================
create or replace function public.deduct_credits(
  p_user_id uuid,
  p_amount integer
)
returns integer as $$
declare
  v_remaining integer;
begin
  update public.profiles
  set credits = credits - p_amount,
      updated_at = now()
  where id = p_user_id
    and credits >= p_amount
  returning credits into v_remaining;

  if v_remaining is null then
    raise exception 'Kredit tidak cukup';
  end if;

  return v_remaining;
end;
$$ language plpgsql security definer;

-- ============================================
-- Function: Add credits (after top-up)
-- ============================================
create or replace function public.add_credits(
  p_user_id uuid,
  p_amount integer
)
returns integer as $$
declare
  v_remaining integer;
begin
  update public.profiles
  set credits = credits + p_amount,
      updated_at = now()
  where id = p_user_id
  returning credits into v_remaining;

  return v_remaining;
end;
$$ language plpgsql security definer;
