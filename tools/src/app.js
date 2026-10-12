(function () {
  "use strict";

  /* ───── 커리큘럼 데이터 (64레슨) ───── */
  var CASE_SUB = "실제 논문 3편 사례";
  var MODULES = [
    { k: "basics", name: "Research Basics", sub: "연구 기초", c: "#14B8A6", icon: "{{M:filled:menu_book}}",
      lead: "연구가 무엇인지부터 핵심 용어와 연구윤리까지, 쉬운 설명과 예시로 익히는 입문 모듈.",
      l: [["연구란 무엇인가", "학술 탐구의 본질"], ["연구문제·목적·질문", "세 가지의 위계"], ["조작적 정의", "추상 개념을 측정 가능하게"], ["연구의 일반화", "표본에서 모집단으로"], ["예비조사(Pilot)", "본조사 전 점검"], ["연구윤리와 IRB", "연구자의 책임"], ["좋은 연구문제의 조건", "독창성·실행가능성·가치"], ["연구배경 쓰기 입문", "왜 이 연구가 필요한가"], ["실제 논문 3편으로 보는 ‘연구의 구조’", CASE_SUB]] },
    { k: "structure", name: "논문 구조 학습", sub: "서론에서 결론까지", c: "#8B7CF6", icon: "{{M:filled:account_tree}}",
      lead: "서론부터 결론까지 각 장이 맡은 질문과 서로의 호응 관계를 익힙니다.",
      l: [["연구배경 서술구조", "제1장 · Research Background"], ["연구목적 및 연구문제", "제2장 · Purpose & Questions"], ["이론적 배경 서술구조", "제3장 · Theoretical Background"], ["문헌연구 서술구조", "제4장 · Literature Review"], ["연구방법 서술구조", "제5장 · Research Methodology"], ["연구결과 서술구조", "제6장 · Research Results"], ["논의 서술구조", "제7장 · Discussion"], ["결론 서술구조", "제8장 · Conclusion"], ["IMRaD 전체 구조", "논문의 뼈대"], ["초록 작성", "250단어로 요약"]] },
    { k: "design", name: "연구설계 기초", sub: "좋은 질문이 좋은 연구를", c: "#E0A526", icon: "{{M:filled:lightbulb}}",
      lead: "연구문제를 세우고 다듬는 법 — 답할 수 있고, 물을 가치가 있는 질문으로.",
      l: [["연구문제와 연구공백", "무엇을 풀 것인가"], ["연구질문(RQ) 작성", "어떻게·왜·어떤 유형"], ["개념틀 설계", "개념 간의 지도"], ["조작적 정의", "측정 가능하게"], ["타당도", "측정이 맞는가"], ["신뢰도", "측정이 일관적인가"], ["표집", "누구를 조사할까"], ["예비조사·정합성", "설계 점검"], ["실제 논문 3편의 ‘연구설계’ 뜯어보기", CASE_SUB]] },
    { k: "method", name: "연구방법론 기초", sub: "양적·질적 개요", c: "#F08A24", icon: "{{M:filled:biotech}}",
      lead: "양적·질적 연구의 전제와 절차를 비교하며, 내 질문에 맞는 길을 고르는 눈을 기릅니다.",
      l: [["연구 패러다임", "방법 뒤의 세계관"], ["인식론·존재론", "앎과 존재의 가정"], ["양적 연구 개관", "측정·통계·인과"], ["질적 연구 개관", "경험·의미·과정"], ["혼합 연구", "양적+질적 통합"], ["근거이론·현상학", "대표 질적 방법"], ["삼각검증·귀추", "타당성과 추론"], ["방법 선택의 정당화", "왜 이 방법인가"], ["실제 논문 3편의 ‘연구방법’ 비교", CASE_SUB]] },
    { k: "reading", name: "논문 읽기 훈련", sub: "비판적 읽기", c: "#10B981", icon: "{{M:filled:travel_explore}}",
      lead: "초록에서 결론까지, 논문을 해체해 읽는 순서와 비판적으로 받아들이는 기준을 익힙니다.",
      l: [["비판적 읽기 입문", "심사자의 눈으로"], ["약점 찾기 ① 배경·목적", "탈락 패턴 진단"], ["약점 찾기 ② 문헌·렌즈", "이론적 렌즈"], ["문헌 종합 유형", "리뷰의 네 방식"], ["질적 분석 읽기", "주제·담론"], ["포화·성찰성", "질적 신뢰성"], ["결과/논의 비판", "해석의 분리"], ["실제 논문 3편 ‘구조대로 읽기’", CASE_SUB]] },
    { k: "apa", name: "APA 학습", sub: "인용과 참고문헌", c: "#A78BFA", icon: "{{M:filled:format_quote}}",
      lead: "본문 인용과 참고문헌 목록의 규칙을 실제 사례로 익히고, 흔한 실수를 미리 걸러냅니다.",
      l: [["본문 내 인용", "저자-연도"], ["참고문헌 목록", "References"], ["DOI·전자자료", "링크 표기"], ["직접·간접 인용", "따옴표와 페이지"], ["표·그림", "Tables·Figures"], ["기여·함의 인용", "논의 연결"]] },
    { k: "writing", name: "학술 글쓰기 훈련", sub: "한 문단은 하나의 주장", c: "#5B7CFA", icon: "{{M:filled:edit_note}}",
      lead: "주제문–근거–연결로 이어지는 학술 문단의 뼈대를 반복해 손에 익힙니다.",
      l: [["좋은 문장 ① 배경", "우수 논문의 문장"], ["좋은 문장 ② 목적·문제", "RQ를 부르는 문장"], ["결과는 사실만", "해석 배제"], ["논의: So what", "의미를 이론과 연결"], ["결론 쓰기", "요약·기여·후속"], ["연쇄 예비", "문장을 잇는 사슬"], ["두꺼운 기술·성찰성", "질적 글쓰기"], ["기여·함의 문장", "Theoretical/Practical"]] },
    { k: "tutor", name: "AI 튜터", sub: "막히면 물어보면 된다", c: "#14B8A6", icon: "{{M:filled:smart_toy}}",
      lead: "지금 배우는 내용에 대해 언제든 묻고, 예시와 함께 다시 설명받습니다.",
      l: [["개념 질문하기", "모르는 용어 바로 체크"], ["글쓰기 피드백", "초안 코칭"], ["다음 학습 추천", "약점 기반 추천"], ["용어 자가 점검", "핵심 용어 복습"], ["신뢰도 점검", "Kappa·합의"]] }
  ];

  var tabs = document.getElementById("curTabs");
  var panel = document.getElementById("curPanel");
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]; }); };

  function render(i) {
    var m = MODULES[i];
    var items = m.l.map(function (x, j) {
      return '<li' + (x[1] === CASE_SUB ? ' class="is-case"' : "") + '><i>' + pad(j + 1) + '</i><div><b>' + esc(x[0]) + '</b><small>' + esc(x[1]) + '</small></div></li>';
    }).join("");
    panel.innerHTML = '<div class="pnl__h"><h3>' + esc(m.name) + '</h3><span class="pnl__tag">' + m.l.length + ' 레슨 · 퀴즈 20문항씩</span></div>' +
      '<p class="pnl__lead">' + esc(m.lead) + '</p><ul class="les">' + items + '</ul>';
    var btns = tabs.querySelectorAll(".tab");
    for (var b = 0; b < btns.length; b++) btns[b].setAttribute("aria-selected", b === i ? "true" : "false");
  }

  if (tabs && panel) {
    tabs.innerHTML = MODULES.map(function (m, i) {
      return '<button class="tab" role="tab" aria-selected="false" data-i="' + i + '" style="--c:' + m.c + '">' +
        '<span class="tab__i">' + m.icon + '</span><span><b>' + esc(m.name) + '</b><small>' + esc(m.sub) + '</small></span>' +
        '<span class="tab__n">' + m.l.length + '</span></button>';
    }).join("");
    tabs.addEventListener("click", function (e) {
      var t = e.target.closest(".tab");
      if (t) render(+t.getAttribute("data-i"));
    });
    render(0);
  }

  /* ───── 스크롤 등장 · 숫자 · XP 막대 ───── */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  var bar = document.querySelector("[data-bar]");
  if (bar) setTimeout(function () { bar.style.width = bar.getAttribute("data-bar") + "%"; }, 400);

  if (!reduce) {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var end = +el.getAttribute("data-count"), t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / 1200, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = v.toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(step); else el.textContent = end.toLocaleString("en-US");
      }
      requestAnimationFrame(step);
    });
  }

  /* ───── 모바일 메뉴 ───── */
  var burger = document.getElementById("burger"), links = document.getElementById("navLinks");
  if (burger && links) {
    burger.addEventListener("click", function () {
      var o = links.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { links.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ───── 대기 등록 폼 (Supabase REST, config.js 에 키가 있을 때만 전송) ───── */
  var form = document.getElementById("joinForm"), msg = document.getElementById("formMsg");
  function say(t, cls) { msg.textContent = t; msg.className = "form__msg " + (cls || ""); }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var name = String(fd.get("name") || "").trim(), email = String(fd.get("email") || "").trim(), stage = String(fd.get("stage") || "");
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !stage) { say("이름, 올바른 이메일, 현재 단계를 입력해 주세요.", "is-err"); return; }
      if (!fd.get("consent")) { say("수신 동의에 체크해 주세요.", "is-err"); return; }
      var cfg = window.RA_CONFIG || {};
      if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) { say("대기 등록 서버가 아직 연결되지 않았습니다. 연결 후 다시 시도해 주세요.", "is-err"); return; }
      say("등록 중…");
      fetch(cfg.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: cfg.SUPABASE_ANON_KEY, Authorization: "Bearer " + cfg.SUPABASE_ANON_KEY, Prefer: "return=minimal" },
        body: JSON.stringify({ name: name, email: email.toLowerCase(), stage: stage })
      }).then(function (r) {
        if (r.ok) { form.reset(); say("등록되었습니다. 오픈 소식을 가장 먼저 보내드릴게요.", "is-ok"); }
        else if (r.status === 409) { say("이미 등록된 이메일입니다.", "is-ok"); }
        else { say("등록에 실패했습니다. 잠시 후 다시 시도해 주세요.", "is-err"); }
      }).catch(function () { say("네트워크 오류로 등록하지 못했습니다.", "is-err"); });
    });
  }
})();
