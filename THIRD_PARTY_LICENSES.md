# THIRD_PARTY_LICENSES

상업적 이용을 전제로, 이 저장소가 쓰는(또는 검토 후 쓰지 않기로 한) 외부 소스의 라이선스 기록입니다.
**확인 날짜: 2026-10-07.** 법률 자문이 아닙니다. "확인됨"은 아래 적힌 출처에서 읽은 내용이며, 출처를 못 읽은 항목은 "미확인"으로 적었습니다.

## 1. 라이선스 게이트 (새 외부 소스를 넣기 전에 반드시)

네 가지를 각각 확인하고 이 문서에 기록합니다. 하나라도 비어 있으면 도입하지 않습니다.

1. **코드** 라이선스 — LICENSE 파일 전문을 직접 읽는다 (README 요약만으로 판단하지 않는다).
2. **모델 가중치·데이터 파일** 라이선스 — 코드와 다를 수 있다.
3. **학습 데이터** 출처와 그 약관 — 비상업 데이터로 학습한 모델은 상업 이용이 안전하지 않다.
4. 배포 의무 — 고지문 포함, 소스 제공, 동일조건(copyleft) 전파 여부.

차단 대상: GPL/AGPL(앱 전체 공개 의무로 번질 수 있음), CC-BY-NC 계열, 저장소에 LICENSE가 없는 코드·데이터(기본값은 모든 권리 유보).
직접 의존성 점검: `node scripts/license-gate.mjs` (차단이 있으면 종료 코드 1).

## 2. 사용 중

### Kiwi 한국어 형태소 분석기 (kiwi-nlp 0.24.0, WebAssembly)
- 용도: 맞춤법 검사의 형태소 규칙 층 (`apps/web/lib/validation/kiwi-server.ts`, `ko-morph-rules.ts`)
- 라이선스: **Apache-2.0** — 코드와 모델 파일 모두. README 원문: "Kiwi는 Apache License 2.0 라이센스로 배포됩니다", "학습된 모델 파일 또한 동일한 라이센스로 배포됩니다."
  ([README](https://github.com/bab2min/Kiwi/blob/main/README.md), [npm](https://www.npmjs.com/package/kiwi-nlp), 확인됨)
- **버전 고정 필수:** 0.24.0 미만은 LGPL이다 ("0.23.2 이하 버전은 LGPL"). `apps/web/package.json`에 `0.24.0`으로 정확히 고정했다. 낮은 버전으로 되돌리지 말 것.
- 모델 파일: `kiwi_model_v0.24.0_base.tgz` (sha256 `33188ba932bba4717bad5244bbec0ef8b1c9cbb47e26e68394a7976d8d779083`).
  저장소에 커밋하지 않고 `npm run kiwi:model`로 내려받으며, 스크립트가 sha256을 검증한다.
- 라이선스 전문 대조: 사용자가 붙여 넣은 LICENSE 전문과 `licenses/kiwi-Apache-2.0.txt`가 일치함 (Apache-2.0, 저작권 "2017-2026 Minchul Lee and the Kiwi contributors", 2026-10-07).
- Apache-2.0 의무 이행: 라이선스 사본 `licenses/kiwi-Apache-2.0.txt`, NOTICE `licenses/kiwi-NOTICE.txt` (Kiwi 저장소 v0.24.0). **데스크톱·서버 배포물에 이 두 파일을 함께 넣을 것.**
- **로드하지 않는 사전:**
  - `default.dict` — 타입 정의 주석상 "위키백과·나무위키에서 추출한 고유명사". 나무위키 이용 조건은 **미확인** → 로드하지 않음.
  - `multi.dict` — 위키데이터 고유명사. 필요 없어 로드하지 않음.
  - `apps/web/.kiwi-model/`에는 위 두 파일을 풀지 않는다 (`scripts/fetch-kiwi-model.mjs`의 KEEP 목록).
- **미해결 (1건):** 모델 학습에 국립국어원 21세기 세종계획 말뭉치와 모두의 말뭉치가 쓰였다. NOTICE 원문(`licenses/kiwi-NOTICE.txt` §1, 전문 확인됨)은 다음과 같이 말한다:
  - 모델 파일은 코드와 함께 Apache-2.0으로 배포된다.
  - 모델은 "형태소 사전과 n-gram 통계"로 구성되며 "원본 말뭉치의 텍스트를 포함하지 않고 복원할 수도 없다" (저자의 설명).
  - 원본 말뭉치는 재배포되지 않으며 "각 제공자의 약관을 계속 따른다" (*remain subject to the terms of their respective providers*).
  → NOTICE는 말뭉치의 존재와 출처를 밝힐 뿐, **말뭉치 약관이 학습된 모델의 상업 배포를 허용하는지는 말하지 않는다.** 저자가 모델을 Apache-2.0으로 배포한다는 점이 근거이나 국립국어원 약관과의 관계는 **여전히 미확인**.
  → **상업 서비스 개시 전에 문의하고 답변을 아래에 기록할 것.** 분석기는 `kiwi-server.ts` 한 곳에 격리되어 있어, 문제가 되면 이 파일만 교체하면 된다 (형태소 규칙이 없을 때 정규식 규칙으로 자동 후퇴한다).

  | 문의처 | 문의 내용 | 상태 | 답변 요약·날짜 |
  |---|---|---|---|
  | Kiwi 저자 (GitHub 이슈, bab2min/Kiwi) | 세종·모두의 말뭉치로 학습한 모델 파일(Apache-2.0)을 상업 서비스에 포함해도 되는지 | **미문의** | — |
  | 국립국어원 | 위 말뭉치로 학습한 파생 모델의 상업 배포 조건 | **미문의** | — |

### Kiwi에 포함된 제3자 컴포넌트 (NOTICE §2 기준, 확인됨)
NOTICE는 "아래 각 컴포넌트의 저작권·라이선스 고지는 재배포 시 유지되어야 한다"고 명시한다. `licenses/kiwi-NOTICE.txt`를 배포물에 함께 넣으면 충족된다.

| 컴포넌트 | 라이선스 | 비고 |
|---|---|---|
| Eigen 3.4.0 | **MPL-2.0** | `EIGEN_MPL2_ONLY`로 빌드 (LGPL 모듈 미포함). MPL은 파일 단위 copyleft — 우리는 Eigen 파일을 수정하지 않으므로 소스 공개 의무는 발생하지 않는다. 수정하게 되면 해당 파일 공개 필요 |
| cpp-btree, streamvbyte | Apache-2.0 | |
| cpuinfo | BSD-2-Clause | |
| mimalloc, nlohmann/json | MIT | |
| TCLAP, GoogleTest | MIT, BSD-3-Clause | 명령줄 도구·테스트 전용, 라이브러리·WASM에는 미포함 |

### 직접 의존성 (apps/web, package.json 의 license 필드 기준)
한계: 하위 의존성(전이 의존성)과 패키지에 번들된 데이터의 별도 라이선스는 이 표에 포함되지 않는다.

| 패키지 | 버전 | 라이선스 | 분류 |
|---|---|---|---|
| @clerk/nextjs | 6.39.4 | MIT | 허용 |
| @supabase/ssr | 0.5.2 | MIT | 허용 |
| @supabase/supabase-js | 2.106.1 | MIT | 허용 |
| @tiptap/extension-collaboration | 2.27.2 | MIT | 허용 |
| @tiptap/extension-collaboration-cursor | 2.26.2 | MIT | 허용 |
| @tiptap/react | 2.27.2 | MIT | 허용 |
| @tiptap/starter-kit | 2.27.2 | MIT | 허용 |
| @types/node | 22.19.20 | MIT | 허용 |
| @types/react | 19.2.15 | MIT | 허용 |
| @types/react-dom | 19.2.3 | MIT | 허용 |
| autoprefixer | 10.5.0 | MIT | 허용 |
| class-variance-authority | 0.7.1 | Apache-2.0 | 허용 |
| clsx | 2.1.1 | MIT | 허용 |
| date-fns | 4.3.0 | MIT | 허용 |
| eslint | 9.39.4 | MIT | 허용 |
| eslint-config-next | 15.5.18 | MIT | 허용 |
| framer-motion | 11.18.2 | MIT | 허용 |
| kiwi-nlp | 0.24.0 | Apache-2.0 | 허용 |
| lucide-react | 0.460.0 | ISC | 허용 |
| next | 15.5.18 | MIT | 허용 |
| postcss | 8.5.15 | MIT | 허용 |
| react | 19.2.6 | MIT | 허용 |
| react-dom | 19.2.6 | MIT | 허용 |
| server-only | 0.0.1 | MIT | 허용 |
| svix | 1.94.0 | MIT | 허용 |
| tailwind-merge | 2.6.1 | MIT | 허용 |
| tailwindcss | 3.4.19 | MIT | 허용 |
| typescript | 5.9.3 | Apache-2.0 | 허용 |
| xlsx | 0.18.5 | Apache-2.0 | 허용 |
| y-websocket | 2.1.0 | MIT | 허용 |
| yjs | 13.6.30 | MIT | 허용 |
| zod | 3.25.76 | MIT | 허용 |
| zustand | 5.0.13 | MIT | 허용 |
| @ai-research-os/auth-core | (내부) | (자체 패키지) | 내부 |
| @ai-research-os/citation-core | (내부) | (자체 패키지) | 내부 |
| @ai-research-os/document-core | (내부) | (자체 패키지) | 내부 |
| @ai-research-os/editor-core | (내부) | (자체 패키지) | 내부 |
| @ai-research-os/rdos-core | (내부) | (자체 패키지) | 내부 |
| @ai-research-os/shared-types | (내부) | (자체 패키지) | 내부 |
| @ai-research-os/ui | (내부) | (자체 패키지) | 내부 |

## 3. 검토 후 사용하지 않기로 한 것

| 후보 | 확인된 내용 | 결정 |
|---|---|---|
| KAGAS / Standard_Korean_GEC ([저장소](https://github.com/soyoung97/Standard_Korean_GEC)) | 저장소 루트에 **LICENSE 파일 없음**(README에 "수정 MIT" 언급). Kor-Learner·Kor-Native는 "비상업적 목적으로만" 사용 가능. Kor-Lang8은 Lang8 약관 승계(명시 없음). 공개 체크포인트의 라이선스 명시 없음 | **사용 안 함** (비상업 데이터로 학습한 체크포인트 포함) |
| KatFish / KatFishNet ([저장소](https://github.com/Shinwoo-Park/katfishnet)) | 라이선스 명시 없음 → 모든 권리 유보가 기본 | **사용 안 함**. 사용하려면 저자 허락 필요 |
| hunspell-dict-ko ([저장소](https://github.com/spellcheck-ko/hunspell-dict-ko)) | 프로젝트 GPL-3.0, 일부 MPL 1.1/GPL 2.0/LGPL 2.1 3중, 어휘 데이터 상당수 CC BY-SA 4.0 | **사용 안 함** (copyleft 전파) |
| 부산대·나라인포테크 검사기, Bareun.ai | 이용 약관 미확인 | **사용 안 함**. 상업 이용은 업체와 계약 필요 |
| nlprule | 코드 Apache-2.0. 번들 규칙·데이터 바이너리의 라이선스 미확인 (LanguageTool 파생이면 LGPL 의무 가능) | 보류 |

## 4. 후보로 남아 있는 것 (아직 도입 안 함)

| 후보 | 확인된 내용 | 도입 전 남은 확인 |
|---|---|---|
| KoBART (SKT, [저장소](https://github.com/SKT-AI/KoBART)) | 저장소 수정 MIT(상업 이용 허용 문구 확인), HuggingFace `gogamza/kobart-base-v2` MIT 표기 | 수정 MIT 전문 직접 확인, 교정 모델로 만들 때의 학습 데이터 권리 |
| LanguageTool (영문) | LGPL-2.1 — 상업 배포 가능, 소스 제공·라이선스 사본·수정 공개 의무 | 앱에 포함해 배포하는 구조에서의 의무 이행 방식 |
| Binoculars (BSD-3-Clause) + Falcon-7B (Apache-2.0) | 코드·모델 모두 상업 이용 허용으로 확인 | 7B 모델 2개 구동 비용 |
| KoELECTRA | 저장소 Apache-2.0 | 모델 가중치 라이선스 별도 확인 |

## 5. 직접 작성한 코드
`apps/web/lib/validation/lang-engine.ts`, `ko-morph-rules.ts` 및 검증 페이지는 이 저장소에서 직접 작성했으며 외부 코드를 가져오지 않았다. 오타 사전·정형 표현 목록은 일반 지식에서 작성했다.
