-- Research Aspirant 대기 등록 테이블
-- Supabase 대시보드 > SQL Editor 에 붙여 넣어 실행하세요.

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 80),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  stage      text not null check (char_length(stage) between 1 and 40),
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_key on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

-- 방문자(anon)는 등록(insert)만 가능, 조회·수정·삭제는 불가
drop policy if exists "waitlist_insert_anon" on public.waitlist;
create policy "waitlist_insert_anon" on public.waitlist
  for insert to anon with check (true);
