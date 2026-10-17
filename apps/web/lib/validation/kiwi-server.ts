import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Kiwi } from "kiwi-nlp";

/**
 * Kiwi 형태소 분석기(WebAssembly) 서버 싱글턴.
 *
 * - 모델 파일(≈88MB)은 저장소에 두지 않는다. `npm run kiwi:model` 로 내려받아
 *   KIWI_MODEL_DIR(기본 apps/web/.kiwi-model/models/cong/base)에 둔다.
 * - 아래 사전은 의도적으로 로드하지 않는다:
 *     default.dict — 위키백과·나무위키에서 뽑은 고유명사 사전(나무위키 이용 조건 미확인)
 *     multi.dict   — 위키데이터 고유명사 사전(필요 없음)
 *   → 형태소 규칙 층은 이 사전들 없이도 동작한다.
 * - 모델이 없으면 available=false 를 돌려주고, 호출 측은 정규식 규칙으로 되돌아간다.
 */

const REQUIRED = ["combiningRule.txt", "cong.mdl", "extract.mdl", "nounchr.mdl", "sj.morph", "typo.dict", "dialect.dict"];

export function modelDir(): string {
  return process.env.KIWI_MODEL_DIR || path.join(process.cwd(), ".kiwi-model", "models", "cong", "base");
}

export function missingModelFiles(): string[] {
  const dir = modelDir();
  return REQUIRED.filter((f) => !fs.existsSync(path.join(dir, f)));
}

/** kiwi-wasm.wasm 위치. Next 번들 안에서는 import.meta.url 이 믿을 수 없어 cwd 에서 위로 올라가며 찾는다. */
function wasmPath(): string {
  if (process.env.KIWI_WASM_PATH) return process.env.KIWI_WASM_PATH;
  for (let d = process.cwd(); ; d = path.dirname(d)) {
    const p = path.join(d, "node_modules", "kiwi-nlp", "dist", "kiwi-wasm.wasm");
    if (fs.existsSync(p)) return p;
    if (d === path.dirname(d)) throw new Error("KIWI_WASM_NOT_FOUND");
  }
}

let loading: Promise<{ kiwi: Kiwi; version: string }> | null = null;

export function getKiwi(): Promise<{ kiwi: Kiwi; version: string }> {
  if (!loading) {
    loading = (async () => {
      const missing = missingModelFiles();
      if (missing.length) throw new Error(`KIWI_MODEL_MISSING:${missing.join(",")}`);
      const { KiwiBuilder } = await import("kiwi-nlp");
      const wasm = wasmPath();
      const dir = modelDir();
      const modelFiles = Object.fromEntries(REQUIRED.map((n) => [n, new Uint8Array(fs.readFileSync(path.join(dir, n)))]));
      const builder = await KiwiBuilder.create(wasm);
      const kiwi = await builder.build({ modelFiles, loadDefaultDict: false, loadMultiDict: false, modelType: "cong" });
      return { kiwi, version: builder.version() };
    })().catch((e) => { loading = null; throw e; });
  }
  return loading;
}
