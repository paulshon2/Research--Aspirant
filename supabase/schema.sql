-- ════════════════════════════════════════════════════════════════════
-- Research Aspirant — 전용 데이터베이스 스키마 (단일 파일, 새 Supabase 프로젝트에 1회 실행)
--
--   profiles          회원 (Clerk user id) · 로그인 게이트용 승인 상태
--   rdos_enrollment   연구준비자 가입 신청서 · 승인 기록
--   rdos_progress     메뉴별 완료 레슨 수 (학습 상태 계산의 원천 데이터)
--   rdos_menu_config  관리자가 끈 메뉴 (행이 없으면 켜짐)
--   waitlist          랜딩페이지 대기 등록
--
-- 모든 테이블은 RLS 를 켜고 정책을 두지 않는다 → 브라우저(anon)는 직접 접근 불가,
-- 서버 API 만 SUPABASE_SERVICE_ROLE_KEY 로 읽고 쓴다.
-- 다시 실행해도 안전하다 (if not exists).
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.profiles (
  id                text primary key,                        -- Clerk user id
  email             text,
  name              text,
  avatar_url        text,
  plan              text not null default 'free',
  role              text not null default 'student',
  approval_status   text not null default 'pending'
                      check (approval_status in ('pending', 'approved', 'rejected')),
  is_special_member boolean not null default false,
  gemini_model      text,
  language          text not null default 'ko',
  theme             text not null default 'dark',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists profiles_approval_idx on public.profiles (approval_status);

create table if not exists public.rdos_enrollment (
  user_id     text primary key,                              -- Clerk user id
  email       text,
  status      text not null default 'pending'
                check (status in ('pending', 'approved', 'active', 'rejected')),
  track       text not null default 'rdos',
  streak_days int  not null default 0,
  profile     jsonb,                                         -- 가입 신청서 (이름·대학·학과·관심분야·학번 등)
  created_at  timestamptz not null default now(),
  approved_at timestamptz,
  approved_by text
);
create index if not exists rdos_enrollment_status_idx on public.rdos_enrollment (status);

create table if not exists public.rdos_progress (
  user_id      text not null,
  menu_key     text not null,                                -- basics | structure | design | ...
  lessons_done int  not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (user_id, menu_key)
);
create index if not exists rdos_progress_user_idx on public.rdos_progress (user_id);

create table if not exists public.rdos_menu_config (
  key        text primary key,                               -- lib/rdos/menus.ts 의 key
  enabled    boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 80),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  stage      text not null check (char_length(stage) between 1 and 40),
  created_at timestamptz not null default now()
);
create unique index if not exists waitlist_email_key on public.waitlist (lower(email));

alter table public.profiles         enable row level security;
alter table public.rdos_enrollment  enable row level security;
alter table public.rdos_progress    enable row level security;
alter table public.rdos_menu_config enable row level security;
alter table public.waitlist         enable row level security;

-- PostgREST 스키마 캐시 갱신 (테이블을 막 만든 직후 API 가 인식하도록)
notify pgrst, 'reload schema';
