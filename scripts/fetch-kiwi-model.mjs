// Kiwi 형태소 모델 내려받기: npm run kiwi:model  (apps/web 에서)
// 공식 릴리스 kiwi_model_v0.24.0_base.tgz(≈88MB)를 받아 sha256 을 확인하고,
// 필요한 파일만 apps/web/.kiwi-model/models/cong/base 에 푼다.
// default.dict / multi.dict 는 풀지 않는다(라이선스 미확인 사전, THIRD_PARTY_LICENSES.md 참고).
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const URL_ = "https://github.com/bab2min/Kiwi/releases/download/v0.24.0/kiwi_model_v0.24.0_base.tgz";
const SHA256 = "33188ba932bba4717bad5244bbec0ef8b1c9cbb47e26e68394a7976d8d779083";
const KEEP = ["combiningRule.txt", "cong.mdl", "extract.mdl", "nounchr.mdl", "sj.morph", "typo.dict", "dialect.dict"];

const here = path.dirname(fileURLToPath(import.meta.url));
const dest = path.resolve(here, "..", "apps", "web", ".kiwi-model");
const target = path.join(dest, "models", "cong", "base");

if (KEEP.every((f) => fs.existsSync(path.join(target, f)))) { console.log("이미 설치됨:", target); process.exit(0); }

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kiwi-"));
const tgz = path.join(tmp, "model.tgz");
console.log("내려받는 중:", URL_);
const res = await fetch(URL_);
if (!res.ok) { console.error("다운로드 실패", res.status); process.exit(1); }
fs.writeFileSync(tgz, Buffer.from(await res.arrayBuffer()));
const sha = createHash("sha256").update(fs.readFileSync(tgz)).digest("hex");
if (sha !== SHA256) { console.error(`sha256 불일치\n  기대 ${SHA256}\n  실제 ${sha}`); process.exit(1); }
execFileSync("tar", ["xzf", "model.tgz"], { cwd: tmp }); // 절대경로의 "C:" 를 tar 가 원격 호스트로 읽는 문제를 피하려 cwd 사용
fs.mkdirSync(target, { recursive: true });
for (const f of KEEP) fs.copyFileSync(path.join(tmp, "models", "cong", "base", f), path.join(target, f));
fs.rmSync(tmp, { recursive: true, force: true });
console.log("설치 완료:", target);
