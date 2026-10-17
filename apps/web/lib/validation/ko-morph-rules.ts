/**
 * 한국어 맞춤법 — 형태소 기반 규칙 층 (Kiwi 분석 결과 위에서 동작)
 *
 * 순수 함수라 Kiwi 없이도 토큰 배열만 주면 시험할 수 있다.
 * 여기에는 "오탐이 거의 없는" 형태소 패턴만 둔다. Kiwi 의 space() 는
 * '설문조사 → 설문 조사' 처럼 올바른 학술 복합어까지 쪼개므로 규칙 층에서 쓰지 않는다.
 */

export interface MorphToken { str: string; tag: string; position: number; length: number }

export interface MorphIssue {
  category: "spacing" | "grammar" | "spelling";
  severity: "error" | "warning" | "info";
  original: string;
  suggestion: string;
  reason: string;
}

/** 관형사형 어미 뒤에 붙여 쓰면 안 되는 의존명사 */
const BOUND_NOUNS = new Set(["수", "것", "때", "바", "뿐", "줄"]);
/** 이미 피동인 동사 어간 — 뒤에 ‘-어지다’를 또 붙이면 이중 피동 */
const PASSIVE_STEMS = new Set(["되", "보이", "쓰이", "불리", "나뉘", "바뀌", "잊히", "읽히", "닫히", "열리", "놓이"]);

const isSpace = (c: string | undefined) => c === undefined || /\s/.test(c);

export function morphIssues(text: string, tokens: MorphToken[]): MorphIssue[] {
  const out: MorphIssue[] = [];
  const seen = new Set<string>();
  const add = (i: MorphIssue) => { const k = i.category + i.original; if (!seen.has(k)) { seen.add(k); out.push(i); } };

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const prev = tokens[i - 1];
    const next = tokens[i + 1];

    // 1) 관형사형 어미 + 의존명사가 붙어 있음: 할것, 볼수, 할때
    if (t.tag === "NNB" && BOUND_NOUNS.has(t.str) && prev?.tag === "ETM" && !isSpace(text[t.position - 1]) && !isSpace(text[t.position])) {
      const left = text.slice(Math.max(0, t.position - 1), t.position);
      add({ category: "spacing", severity: "warning", original: `${left}${t.str}`, suggestion: `${left} ${t.str}`, reason: `의존명사 ‘${t.str}’은(는) 앞말과 띄어 씁니다.` });
    }

    // 2) ‘수’ 뒤에 ‘있/없’이 붙음: 수있다, 수없다
    if (t.tag === "NNB" && t.str === "수" && (next?.tag === "VA" || next?.tag === "VV") && (next.str === "있" || next.str === "없") && next.position === t.position + t.length) {
      add({ category: "spacing", severity: "warning", original: `수${next.str}`, suggestion: `수 ${next.str}`, reason: "‘수 있다/없다’는 띄어 씁니다." });
    }

    // 3) 이중 피동: 보이어지다, 되어지다, 쓰이어지다 …
    if ((t.tag === "VV" || t.tag === "XSV") && PASSIVE_STEMS.has(t.str) && next?.tag === "EC" && (next.str === "어" || next.str === "아") && tokens[i + 2]?.tag === "VX" && tokens[i + 2].str === "지") {
      let end = tokens[i + 2].position + tokens[i + 2].length;
      while (end < text.length && !isSpace(text[end]) && !/[.,!?;:)]/.test(text[end])) end++; // 어절 끝까지(‘보여지는’)
      const word = text.slice(t.position, end);
      add({ category: "grammar", severity: "warning", original: word, suggestion: t.str === "되" ? "되다" : `${t.str}다`, reason: "이중 피동(피동 표현에 ‘-어지다’가 다시 붙음)입니다. 단순한 피동이나 능동으로 고치세요." });
    }

    // 4) ‘되’ + ‘요’ → ‘돼요’
    if (t.tag === "VV" && t.str === "되" && next && (next.tag === "EC" || next.tag === "EF") && next.str === "요" && next.position === t.position + t.length) {
      add({ category: "spelling", severity: "error", original: "되요", suggestion: "돼요", reason: "‘되어요’의 준말은 ‘돼요’입니다." });
    }
  }
  return out;
}
