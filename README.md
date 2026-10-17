# Research Aspirant — 독립 SaaS (v2)

연구준비자(대학원 진학 예정자·석사과정생·연구 입문자)를 위한 단계형 학습 플랫폼입니다.
원본 `StudiumR--ove-LLB-v4`(AI-Research-OS)에서 **연구준비자 플랜만 떼어 낸 독립 제품**입니다.
원본과 코드·DB·로그인(Clerk)을 공유하지 않습니다.

## v1 과 무엇이 다른가

| | v1 (`Research Aspirant_SaaS/app`) | v2 (이 폴더) |
|---|---|---|
| 구조 | 모노레포(apps/web + packages/*) | **단일 Next.js 앱** (루트에서 바로 빌드) |
| 공유 패키지 | rdos-core·citation-core·editor-core 등 6개 | 없음 — 학습 상태 계산 커널만 `lib/rdos-core` 로 이식 |
| 연구자 플랜 잔재 | 인용·문서분석(uode)·형태소검증·권한카탈로그·연구자 승급 | 모두 제거 |
| DB | 원본 마이그레이션 18개 (연구자 플랜 테이블 포함) | **`supabase/schema.sql` 1개** (테이블 5개) |
| 승인 | `/rdos/admin` 승인이 로그인 게이트에 반영 안 됨 (회원이 "승인 대기"에 갇힘) | 승인 1번으로 **DB 두 곳 + Clerk 메타데이터** 동시 갱신 |
| 대기 등록 | 브라우저에서 다른 Supabase 프로젝트로 직접 전송 | 서버 API `/api/waitlist` → 같은 DB |
| 관리자 | 소스에 숨겨진 기본 관리자 이메일 | `SUPER_ADMIN_EMAILS` 환경변수로만 지정 |
| 의존 패키지 | 30여 개 | 8개 |

## 화면

| 주소 | 내용 | 접근 |
|---|---|---|
| `/` | 랜딩 (`public/landing.html`) | 누구나 |
| `/rdos-signup` | 가입 7단계: 플랜 → 정보 → 학위 → **이메일 코드 인증(Clerk)** → 신청서 제출 → 운영자 승인 → 입장 | 누구나 |
| `/login` | 로그인 (Clerk) | 누구나 |
| `/pending-approval` | 승인 대기 안내 | 로그인 |
| `/rdos` 및 `/rdos/*` | 본페이지 · 학습 메뉴 11개 · AI 튜터 · 로드맵 · 인증 | **승인된 회원** |
| `/control` → `/rdos/admin` | 가입 승인·회원·미션 현황·메뉴 관리 | **슈퍼관리자** |

## 회원 흐름

1. 랜딩 → "연구준비자 가입" → `/rdos-signup`
2. 4단계에서 Clerk 가 6자리 코드를 메일로 보냄 → 코드 확인 시 계정 생성·로그인
3. Clerk 웹훅이 `profiles` 에 `approval_status = pending` 행을 만듦
4. 5단계 제출 → `rdos_enrollment` 에 신청서 저장 (서버가 이메일 인증 여부를 다시 확인)
5. 관리자가 `/rdos/admin` 에서 승인 → `rdos_enrollment`, `profiles`, Clerk 메타데이터가 함께 `approved`
6. 회원이 로그인하면 `/rdos` 로 입장

## 설치 (새 Clerk · 새 Supabase)

**1. Supabase** — 새 프로젝트를 만들고 SQL Editor 에서 `supabase/schema.sql` 을 실행합니다.
   API Keys 에서 URL, publishable 키, secret 키를 복사합니다.

**2. Clerk** — 새 애플리케이션을 만듭니다.
   - User & Authentication → Email: **Email address 필수**, **Verify at sign-up**, **Email verification code** 켜기
   - Webhooks → Add Endpoint: `https://<도메인>/api/webhooks/clerk`, 이벤트 `user.created`, `user.deleted` → Signing Secret 복사
   - (권장) Sessions → Customize session token 에 `{"metadata": "{{user.public_metadata}}"}` 추가 — 페이지 이동마다 DB 조회를 하지 않습니다

**3. 환경변수** — `.env.example` 을 보고 채웁니다 (로컬은 `.env.local`, Vercel 은 Environment Variables).

**4. 로컬 실행**
```bash
npm install
npm run dev
```
http://localhost:3010

**5. Vercel 배포** — 저장소를 새 프로젝트로 가져옵니다. Framework Preset = Next.js, **Root Directory 비움**, Build/Output 기본값. 환경변수를 넣고 배포합니다.

## 검증 명령
```bash
npm run typecheck
npm run check:schema
npm run build
```
`check:schema` 는 코드가 쓰는 모든 테이블·컬럼(현재 27개 쿼리)이 `supabase/schema.sql` 에 있는지 대조합니다.

## 폴더
```
app/            화면·API (rdos, auth, control, api/*)
components/     rdos 셸·학습 화면·관리자·어시스턴트
lib/rdos/       메뉴·레슨 콘텐츠·서버 데이터·어시스턴트 인텐트
lib/rdos-core/  학습 상태 계산 커널 (원본 rdos-core 에서 이식, 23개 파일)
lib/i18n/       한·영·중 문구
public/         랜딩(landing.html, assets/, config.js, licenses/)·폰트·아이콘
supabase/       schema.sql
scripts/        check-schema.mjs
```

## 알려진 한계
- 실제 Clerk·Supabase 키로 가입→인증→승인→입장 전 과정을 아직 끝까지 시험하지 않았습니다 (키 없이 로컬에서 빌드·화면·라우팅·API 응답만 확인).
- 내부 경로·식별자는 원본과 맞추려고 `rdos` 를 유지합니다 (`/rdos`, `rdos_enrollment` 등). 화면 문구는 모두 Research Aspirant 입니다.
- 랜딩 원본 편집 도구(`tools/build.py`)는 포함하지 않았습니다. 랜딩은 `public/landing.html` 을 직접 고칩니다.
