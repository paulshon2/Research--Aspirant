import { NextResponse } from "next/server";
import { getKiwi, missingModelFiles } from "@/lib/validation/kiwi-server";
import { morphIssues } from "@/lib/validation/ko-morph-rules";
import { splitSentences, type GrammarIssue } from "@/lib/validation/lang-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CHARS = 200_000;

/** GET: 형태소 엔진 사용 가능 여부 (모델 파일 설치 여부) */
export async function GET() {
  const missing = missingModelFiles();
  if (missing.length) return NextResponse.json({ available: false, reason: "model-missing", hint: "npm run kiwi:model" });
  try {
    const { version } = await getKiwi();
    return NextResponse.json({ available: true, version });
  } catch (e) {
    return NextResponse.json({ available: false, reason: "load-failed", detail: e instanceof Error ? e.message : String(e) });
  }
}

/** POST {text}: 문장별 형태소 규칙 검사 결과 */
export async function POST(req: Request) {
  let text = "";
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }
  if (text.length > MAX_CHARS) return NextResponse.json({ error: "too-long", max: MAX_CHARS }, { status: 413 });
  if (!text.trim()) return NextResponse.json({ available: true, issues: [] });

  let kiwi;
  try {
    ({ kiwi } = await getKiwi());
  } catch {
    return NextResponse.json({ available: false, issues: [], reason: missingModelFiles().length ? "model-missing" : "load-failed" });
  }

  const issues: GrammarIssue[] = [];
  for (const s of splitSentences(text)) {
    const tokens = kiwi.tokenize(s.text);
    for (const m of morphIssues(s.text, tokens)) {
      issues.push({
        sentenceId: s.id, page: s.page, paragraph: s.paragraph, sentence: s.sentence,
        category: m.category, severity: m.severity, original: m.original, suggestion: m.suggestion, reason: m.reason,
        context: s.text.length > 120 ? s.text.slice(0, 120) + "…" : s.text,
      });
    }
  }
  return NextResponse.json({ available: true, issues });
}
