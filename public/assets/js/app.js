(function () {
  "use strict";

  /* ───── 커리큘럼 데이터 (64레슨) ───── */
  var CASE_SUB = "실제 논문 3편 사례";
  var MODULES = [
    { k: "basics", name: "Research Basics", sub: "연구 기초", c: "#14B8A6", icon: "<svg class='ic' viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path d='M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z'/><path d='M17.5 10.5c.88 0 1.73.09 2.5.26V9.24c-.79-.15-1.64-.24-2.5-.24-1.7 0-3.24.29-4.5.83v1.66c1.13-.64 2.7-.99 4.5-.99zM13 12.49v1.66c1.13-.64 2.7-.99 4.5-.99.88 0 1.73.09 2.5.26V11.9c-.79-.15-1.64-.24-2.5-.24-1.7 0-3.24.3-4.5.83zm4.5 1.84c-1.7 0-3.24.29-4.5.83v1.66c1.13-.64 2.7-.99 4.5-.99.88 0 1.73.09 2.5.26v-1.52c-.79-.16-1.64-.24-2.5-.24z'/></svg>",
      lead: "연구가 무엇인지부터 핵심 용어와 연구윤리까지, 쉬운 설명과 예시로 익히는 입문 모듈.",
      l: [["연구란 무엇인가", "학술 탐구의 본질"], ["연구문제·목적·질문", "세 가지의 위계"], ["조작적 정의", "추상 개념을 측정 가능하게"], ["연구의 일반화", "표본에서 모집단으로"], ["예비조사(Pilot)", "본조사 전 점검"], ["연구윤리와 IRB", "연구자의 책임"], ["좋은 연구문제의 조건", "독창성·실행가능성·가치"], ["연구배경 쓰기 입문", "왜 이 연구가 필요한가"], ["실제 논문 3편으로 보는 ‘연구의 구조’", CASE_SUB]] },
    { k: "structure", name: "논문 구조 학습", sub: "서론에서 결론까지", c: "#8B7CF6", icon: "<svg class='ic' viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path d='M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z'/></svg>",
      lead: "서론부터 결론까지 각 장이 맡은 질문과 서로의 호응 관계를 익힙니다.",
      l: [["연구배경 서술구조", "제1장 · Research Background"], ["연구목적 및 연구문제", "제2장 · Purpose & Questions"], ["이론적 배경 서술구조", "제3장 · Theoretical Background"], ["문헌연구 서술구조", "제4장 · Literature Review"], ["연구방법 서술구조", "제5장 · Research Methodology"], ["연구결과 서술구조", "제6장 · Research Results"], ["논의 서술구조", "제7장 · Discussion"], ["결론 서술구조", "제8장 · Conclusion"], ["IMRaD 전체 구조", "논문의 뼈대"], ["초록 작성", "250단어로 요약"]] },
    { k: "design", name: "연구설계 기초", sub: "좋은 질문이 좋은 연구를", c: "#E0A526", icon: "<svg class='ic' viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path d='M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z'/></svg>",
      lead: "연구문제를 세우고 다듬는 법 — 답할 수 있고, 물을 가치가 있는 질문으로.",
      l: [["연구문제와 연구공백", "무엇을 풀 것인가"], ["연구질문(RQ) 작성", "어떻게·왜·어떤 유형"], ["개념틀 설계", "개념 간의 지도"], ["조작적 정의", "측정 가능하게"], ["타당도", "측정이 맞는가"], ["신뢰도", "측정이 일관적인가"], ["표집", "누구를 조사할까"], ["예비조사·정합성", "설계 점검"], ["실제 논문 3편의 ‘연구설계’ 뜯어보기", CASE_SUB]] },
    { k: "method", name: "연구방법론 기초", sub: "양적·질적 개요", c: "#F08A24", icon: "<svg class='ic' viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path d='M7 19c-1.1 0-2 .9-2 2h14c0-1.1-.9-2-2-2h-4v-2h3c1.1 0 2-.9 2-2h-8c-1.66 0-3-1.34-3-3 0-1.09.59-2.04 1.46-2.56C8.17 9.03 8 8.54 8 8c0-.21.04-.42.09-.62A5.01 5.01 0 0 0 5 12c0 2.76 2.24 5 5 5v2H7z'/><path d='M10.56 5.51C11.91 5.54 13 6.64 13 8c0 .75-.33 1.41-.85 1.87l.59 1.62.94-.34.34.94 1.88-.68-.34-.94.94-.34-2.74-7.53-.94.34-.34-.94-1.88.68.34.94-.94.35.56 1.54z'/><circle cx='10.5' cy='8' r='1.5'/></svg>",
      lead: "양적·질적 연구의 전제와 절차를 비교하며, 내 질문에 맞는 길을 고르는 눈을 기릅니다.",
      l: [["연구 패러다임", "방법 뒤의 세계관"], ["인식론·존재론", "앎과 존재의 가정"], ["양적 연구 개관", "측정·통계·인과"], ["질적 연구 개관", "경험·의미·과정"], ["혼합 연구", "양적+질적 통합"], ["근거이론·현상학", "대표 질적 방법"], ["삼각검증·귀추", "타당성과 추론"], ["방법 선택의 정당화", "왜 이 방법인가"], ["실제 논문 3편의 ‘연구방법’ 비교", CASE_SUB]] },
    { k: "reading", name: "논문 읽기 훈련", sub: "비판적 읽기", c: "#10B981", icon: "<svg class='ic' viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path d='M19.3 16.9c.4-.7.7-1.5.7-2.4 0-2.5-2-4.5-4.5-4.5S11 12 11 14.5s2 4.5 4.5 4.5c.9 0 1.7-.3 2.4-.7l3.2 3.2 1.4-1.4-3.2-3.2zm-3.8.1c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zM12 20v2C6.48 22 2 17.52 2 12S6.48 2 12 2c4.84 0 8.87 3.44 9.8 8h-2.07A8 8 0 0 0 15 4.59V5c0 1.1-.9 2-2 2h-2v2c0 .55-.45 1-1 1H8v2h2v3H9l-4.79-4.79C4.08 10.79 4 11.38 4 12c0 4.41 3.59 8 8 8z'/></svg>",
      lead: "초록에서 결론까지, 논문을 해체해 읽는 순서와 비판적으로 받아들이는 기준을 익힙니다.",
      l: [["비판적 읽기 입문", "심사자의 눈으로"], ["약점 찾기 ① 배경·목적", "탈락 패턴 진단"], ["약점 찾기 ② 문헌·렌즈", "이론적 렌즈"], ["문헌 종합 유형", "리뷰의 네 방식"], ["질적 분석 읽기", "주제·담론"], ["포화·성찰성", "질적 신뢰성"], ["결과/논의 비판", "해석의 분리"], ["실제 논문 3편 ‘구조대로 읽기’", CASE_SUB]] },
    { k: "apa", name: "APA 학습", sub: "인용과 참고문헌", c: "#A78BFA", icon: "<svg class='ic' viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path d='M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z'/></svg>",
      lead: "본문 인용과 참고문헌 목록의 규칙을 실제 사례로 익히고, 흔한 실수를 미리 걸러냅니다.",
      l: [["본문 내 인용", "저자-연도"], ["참고문헌 목록", "References"], ["DOI·전자자료", "링크 표기"], ["직접·간접 인용", "따옴표와 페이지"], ["표·그림", "Tables·Figures"], ["기여·함의 인용", "논의 연결"]] },
    { k: "writing", name: "학술 글쓰기 훈련", sub: "한 문단은 하나의 주장", c: "#5B7CFA", icon: "<svg class='ic' viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path d='M3 10h11v2H3v-2zm0-2h11V6H3v2zm0 8h7v-2H3v2zm15.01-3.13.71-.71a.996.996 0 0 1 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-.71.71-2.12-2.12zm-.71.71-5.3 5.3V21h2.12l5.3-5.3-2.12-2.12z'/></svg>",
      lead: "주제문–근거–연결로 이어지는 학술 문단의 뼈대를 반복해 손에 익힙니다.",
      l: [["좋은 문장 ① 배경", "우수 논문의 문장"], ["좋은 문장 ② 목적·문제", "RQ를 부르는 문장"], ["결과는 사실만", "해석 배제"], ["논의: So what", "의미를 이론과 연결"], ["결론 쓰기", "요약·기여·후속"], ["연쇄 예비", "문장을 잇는 사슬"], ["두꺼운 기술·성찰성", "질적 글쓰기"], ["기여·함의 문장", "Theoretical/Practical"]] },
    { k: "tutor", name: "AI 튜터", sub: "막히면 물어보면 된다", c: "#14B8A6", icon: "<svg class='ic' viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path d='M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z'/></svg>",
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

  /* ───── 연구준비자 플랜(앱) 연동: data-app 링크를 RA_CONFIG.APP_URL 기준으로 치환 ───── */
  (function () {
    var raw = String((window.RA_CONFIG || {}).APP_URL || ""), base = raw.replace(/\/$/, "");
    document.querySelectorAll("a[data-app]").forEach(function (a) {
      a.setAttribute("href", raw ? base + a.getAttribute("data-app") : "#join"); /* 앱 주소 미설정 시 대기 등록으로 */
    });
  })();

  /* ───── 대기 등록 폼 (서버 API /api/waitlist 로 전송) ───── */
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
      say("등록 중…");
      fetch(cfg.WAITLIST_API || "/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, email: email.toLowerCase(), stage: stage })
      }).then(function (r) {
        if (r.ok) { form.reset(); say("등록되었습니다. 오픈 소식을 가장 먼저 보내드릴게요.", "is-ok"); }
        else if (r.status === 409) { say("이미 등록된 이메일입니다.", "is-ok"); }
        else { say("등록에 실패했습니다. 잠시 후 다시 시도해 주세요.", "is-err"); }
      }).catch(function () { say("네트워크 오류로 등록하지 못했습니다.", "is-err"); });
    });
  }
})();
