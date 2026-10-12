# Research Aspirant — 랜딩페이지

연구준비자(대학원 진학 예정자·석사과정생·연구 입문자)를 위한 단계형 학습 플랫폼 **Research Aspirant** 의 랜딩페이지입니다.
정적 사이트(HTML/CSS/JS)이며 빌드 단계 없이 그대로 배포됩니다.

## 폴더
```
index.html            완성된 페이지
config.js             Supabase URL / anon key 입력 (공개용 키만)
vercel.json           Vercel 캐시·보안 헤더
assets/               css · js · fonts(woff2 41개) · icons(사용한 SVG 36개) · logo/favicon
supabase/waitlist.sql 대기 등록 테이블 + RLS
licenses/             아이콘·글꼴 라이선스 고지
tools/                원본(src)과 빌드 스크립트
```

## 미리보기
```bash
python -m http.server 5173
```
브라우저에서 http://127.0.0.1:5173 을 엽니다.

## 수정 후 다시 만들기
원본은 `tools/src/` 에 있습니다. 수정한 뒤 아래를 실행하면 아이콘 인라인, 글꼴 서브셋, 결과 파일 생성이 다시 이루어집니다.
```bash
pip install fonttools brotli
python tools/build.py
```
`tools/build.py` 는 `…\새 폴더 (2)\free icon` 과 `…\새 폴더 (2)\나눔 글꼴` 폴더를 원본으로 읽습니다.
페이지에 새 글자를 넣었다면 반드시 다시 빌드해야 글꼴에 그 글자가 포함됩니다.

## 배포 (GitHub → Vercel)
1. 이 폴더 내용을 `paulshon2/Research--Aspirant` 저장소에 올립니다.
2. Vercel 프로젝트(Framework: Other)에서 Build Command 와 Output Directory 는 비워 둡니다. 저장소 루트가 그대로 사이트입니다.

## 대기 등록 폼 연결 (Supabase)
1. Supabase 대시보드 > SQL Editor 에서 `supabase/waitlist.sql` 을 실행합니다.
2. Project Settings > API 의 **Project URL** 과 **anon public key** 를 `config.js` 에 넣고 다시 배포합니다.
   (`service_role` 키는 절대 넣지 마세요.)
3. 키를 넣기 전에는 폼이 “서버가 아직 연결되지 않았습니다”라고 안내하며 아무것도 저장하지 않습니다.

## 학습 앱 본체
이 저장소는 랜딩페이지만 포함합니다. 로그인(Clerk)과 학습 진도·가입 승인(Supabase)은 학습 앱을 만들 때 연결합니다.
