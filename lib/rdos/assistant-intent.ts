/* ══════════════════════════════════════════════════════════════════════
   연구 어시스턴트 인텐트 분류기 — Research Aspirant 메뉴 전용.
   발화·입력을 Research Aspirant 학습 메뉴(/rdos/*)로 이어 준다.
   ① 정규화 → ② 동의어 정확/부분 매칭 → ③ 문자 겹침 유사도
   ══════════════════════════════════════════════════════════════════════ */

import { RDOS_MENUS } from "@/lib/rdos/menus";

/** 셸 사이드바 폭이 바뀔 때 오브 위치를 다시 잡도록 보내는 이벤트 이름 */
export const SIDEBAR_EVENT = "ra:sidebar-width";

export interface TaskItem {
  href: string;
  icon: string;
  labelKey: string;
  color: string;
  /** 발화·입력으로 이 메뉴를 부르는 말들 */
  triggers: string[];
}

const LABEL_KEY: Record<string, string> = {
  dashboard: "rdos.shell.menuDashboard",
  basics: "rdos.shell.menuBasics",
  structure: "rdos.shell.menuStructure",
  design: "rdos.shell.menuDesign",
  method: "rdos.shell.menuMethod",
  reading: "rdos.shell.menuReading",
  apa: "rdos.shell.menuApa",
  writing: "rdos.shell.menuWriting",
  tutor: "rdos.shell.menuTutor",
  knowledge: "rdos.shell.menuKnowledge",
  roadmap: "rdos.shell.menuRoadmap",
  scholar: "rdos.shell.menuScholar",
};

const EXTRA_TRIGGERS: Record<string, string[]> = {
  dashboard: ["대시보드", "홈", "학습 현황", "dashboard", "home"],
  basics: ["연구 기초", "연구기초", "research basics", "basics"],
  structure: ["논문 구조", "논문구조", "paper structure"],
  design: ["연구설계", "연구 설계", "연구문제", "research design"],
  method: ["연구방법론", "방법론", "양적", "질적", "methodology"],
  reading: ["논문 읽기", "논문읽기", "reading"],
  apa: ["apa", "인용", "참고문헌", "citation"],
  writing: ["학술 글쓰기", "글쓰기", "academic writing", "writing"],
  tutor: ["ai 튜터", "튜터", "질문", "tutor"],
  knowledge: ["지식 코어", "용어", "논문가이드", "knowledge"],
  roadmap: ["성장 로드맵", "로드맵", "roadmap"],
  scholar: ["인증", "research-ready", "졸업", "scholar"],
};

export const RA_TASK_ITEMS: TaskItem[] = RDOS_MENUS.map((m) => ({
  href: m.route,
  icon: m.icon,
  labelKey: LABEL_KEY[m.key] ?? m.label,
  color: m.color,
  triggers: [m.label, m.provides, ...(EXTRA_TRIGGERS[m.key] ?? [])],
}));

export interface IntentResult {
  item: TaskItem | null;
  confidence: number;
  /** 신뢰도가 애매할 때 되물을 후보 */
  candidates: TaskItem[];
}

function normalize(s: string): string {
  return s
    .normalize("NFC")
    .toLowerCase()
    .replace(/[.,!?~"'`()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** "연구설계메뉴" 처럼 끝에 메뉴가 붙으면 메뉴 이동 의도로 본다 */
function stripMenuSuffix(text: string): { core: string; menuIntent: boolean } {
  const t = text.trim();
  const menuIntent = /메뉴\s*$/.test(t) || /\bmenu\s*$/i.test(t);
  const core = t.replace(/\s*메뉴\s*$/u, "").replace(/\s*menu\s*$/i, "").replace(/\s+/g, " ").trim();
  return { core: core || t, menuIntent };
}

/** 두 문자열의 문자 단위 겹침 비율 (0~1) */
function overlap(a: string, b: string): number {
  const A = a.replace(/\s/g, "");
  const B = b.replace(/\s/g, "");
  if (!A || !B) return 0;
  const set = new Set(B.split(""));
  let hit = 0;
  for (const ch of A) if (set.has(ch)) hit += 1;
  return hit / Math.max(A.length, B.length);
}

export function classifyIntent(raw: string): IntentResult {
  const { core: text, menuIntent } = stripMenuSuffix(normalize(raw));
  if (!text) return { item: null, confidence: 0, candidates: [] };

  const scored = RA_TASK_ITEMS.map((item) => {
    let best = 0;
    for (const trg of item.triggers) {
      const tr = normalize(trg);
      if (!tr) continue;
      if (text === tr) best = Math.max(best, 0.99);
      else if (text.includes(tr)) best = Math.max(best, 0.95);
      else if (tr.includes(text) && text.length >= 2) best = Math.max(best, 0.88);
      else best = Math.max(best, overlap(text, tr) * 0.72);
    }
    if (menuIntent && best >= 0.55) best = Math.max(best, 0.92);
    return { item, score: best };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0];
  if (!top || top.score < 0.34) return { item: null, confidence: top?.score ?? 0, candidates: [] };
  const navigateAt = menuIntent ? 0.55 : 0.75;
  if (top.score >= navigateAt) return { item: top.item, confidence: top.score, candidates: [] };
  return { item: null, confidence: top.score, candidates: scored.slice(0, 3).map((s) => s.item) };
}
