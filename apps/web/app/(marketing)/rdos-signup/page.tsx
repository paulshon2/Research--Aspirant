"use client";

import Link from "next/link";
import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { hasClerk } from "@/hooks/use-safe-clerk";
import { BrandLogo } from "@/components/ui/brand-logo";

/* ════════════════════════════════════════════════════════════
   연구준비자(Research Aspirant) 회원가입 — 인증 프로세스 7단계 (사양서 4절)
   1 플랜선택 → 2 정보입력 → 3 학위/논문정보 → 4 이메일인증
   → 5 로그인(Google/GitHub/Email) → 6 관리자승인 → 7 서비스진입
═══════════════════════════════════════════════════════════════ */

const STEPS = [
  { n: 1, label: "플랜 선택" },
  { n: 2, label: "가입 정보 입력" },
  { n: 3, label: "학위 / 논문 정보" },
  { n: 4, label: "이메일 인증" },
  { n: 5, label: "로그인" },
  { n: 6, label: "관리자 승인" },
  { n: 7, label: "서비스 진입" },
];

const ACCENT = "#3ecfb2";
/** 랜딩(Research Aspirant) 주소 — 설정 시 가입 화면에서 소개 페이지로 돌아가는 링크를 노출 */
const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL || "";

type Form = {
  name: string; email: string; university: string; department: string;
  isMasters: "" | "재학" | "입학예정" | "아니오"; advisor: string; interest: string;
  degreeInfo: string; password: string;
};

export default function RdosSignupWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>({
    name: "", email: "", university: "", department: "",
    isMasters: "", advisor: "", interest: "", degreeInfo: "", password: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [emailSent, setEmailSent] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState<string | null>(null);

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const go = (n: number) => { setErrors([]); setStep(n); };

  /* 실제 Clerk 이메일 인증: 가입 생성 → 6자리 코드 메일 발송 → 코드 확인 → 세션 활성화.
     hasClerk 는 빌드 시점 상수이므로 훅 호출 순서는 렌더 간 변하지 않는다. */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const clerk = hasClerk ? useSignUp() : null;
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);
  const [approval, setApproval] = useState<string>("pending");

  const clerkMsg = (err: unknown, fallback: string) => {
    const m = (err as { errors?: { longMessage?: string; message?: string }[] })?.errors?.[0];
    return m?.longMessage || m?.message || fallback;
  };

  async function sendVerification() {
    setErrors([]);
    if (!clerk?.isLoaded || !clerk.signUp) { setErrors(["인증 모듈을 불러오는 중입니다. 잠시 후 다시 시도하세요."]); return; }
    setBusy(true);
    try {
      if (clerk.signUp.status === null || clerk.signUp.status === undefined || !clerk.signUp.emailAddress) {
        await clerk.signUp.create({
          emailAddress: form.email.trim(),
          password: form.password,
          firstName: form.name.trim(),
        });
      }
      await clerk.signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setEmailSent(true);
    } catch (err) {
      setErrors([clerkMsg(err, "인증 메일 발송에 실패했습니다.")]);
    } finally { setBusy(false); }
  }

  async function confirmVerification() {
    setErrors([]);
    if (!clerk?.isLoaded || !clerk.signUp) return;
    if (!/^\d{6}$/.test(code.trim())) { setErrors(["메일로 받은 6자리 인증 코드를 입력하세요."]); return; }
    setBusy(true);
    try {
      const res = await clerk.signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (res.status === "complete" && res.createdSessionId) {
        await clerk.setActive({ session: res.createdSessionId });
        setVerified(true);
        go(5);
      } else {
        setErrors(["인증이 완료되지 않았습니다. 코드를 다시 확인하세요."]);
      }
    } catch (err) {
      setErrors([clerkMsg(err, "인증 코드가 올바르지 않거나 만료되었습니다.")]);
    } finally { setBusy(false); }
  }

  /** 인증·로그인 완료 후 호출 — 승인 대기(pending) enrollment 생성(서버가 이메일 인증 여부를 다시 검사) */
  async function submitEnrollment() {
    setBusy(true);
    try {
      const { password: _pw, ...profile } = form;
      void _pw;
      const res = await fetch("/api/rdos/enroll", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) setEnrollMsg(json.error || "신청 전송 실패.");
      else setEnrollMsg(json.persisted ? "가입 신청이 접수되었습니다 (관리자 승인 대기)." : "신청 접수 — 서버 미연결(데모).");
    } catch {
      setEnrollMsg("신청 전송 실패 — 잠시 후 다시 시도하세요.");
    }
    setBusy(false);
    go(6);
  }

  async function checkApproval() {
    try {
      const r = await fetch("/api/membership/status", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      setApproval(j.approval_status || "pending");
      if (j.approval_status === "approved") go(7);
      else setEnrollMsg("아직 승인 대기 중입니다. 승인되면 안내 메일이 발송됩니다.");
    } catch { setEnrollMsg("승인 상태를 확인하지 못했습니다."); }
  }

  function validateInfo(): boolean {
    const e: string[] = [];
    if (!form.name) e.push("이름은 필수입니다");
    if (!form.email) e.push("이메일은 필수입니다");
    if (!form.university) e.push("소속 대학은 필수입니다");
    if (!form.department) e.push("학과는 필수입니다");
    // 석사과정 여부 = 선택(사양 A). 필수 아님.
    if (!form.interest) e.push("연구 관심 분야는 필수입니다");
    if (hasClerk && form.password.length < 8) e.push("비밀번호는 8자 이상이어야 합니다");
    setErrors(e);
    return e.length === 0;
  }
  function validateDegree(): boolean {
    const e: string[] = [];
    if (form.isMasters === "아니오") e.push("가입 조건: 석사과정 재학 또는 입학 예정이어야 합니다");
    if (!form.degreeInfo) e.push("학번(또는 재학증명/입학예정 확인)은 필수입니다");
    setErrors(e);
    return e.length === 0;
  }

  return (
    <div className="min-h-screen bg-[#070708] text-[#f4f4f5] font-nanum-gothic antialiased">
      {/* 상단 바 */}
      <nav className="border-b border-white/[0.07]">
        <div className="max-w-[760px] mx-auto px-6 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo size={28} radius={8} />
            <span className="text-[15px] font-bold">Research Aspirant <span className="text-[#3ecfb2]">연구준비자</span></span>
          </Link>
          <div className="flex items-center gap-4">
            {LANDING_URL && (
              <a href={LANDING_URL} className="text-[13px] text-white/45 hover:text-white/80 transition">← Research Aspirant 소개</a>
            )}
            <Link href="/#pricing" className="text-[13px] text-white/45 hover:text-white/80 transition">플랜 비교 →</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-[760px] mx-auto px-6 py-12">
        {/* 진행 표시기 */}
        <div className="flex items-center gap-1.5 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-1.5 flex-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 transition-colors"
                style={{
                  background: step >= s.n ? ACCENT : "rgba(255,255,255,0.06)",
                  color: step >= s.n ? "#070708" : "rgba(255,255,255,0.4)",
                }}
              >
                {step > s.n ? "✓" : s.n}
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-px flex-1 rounded" style={{ background: step > s.n ? ACCENT : "rgba(255,255,255,0.08)" }} />
              )}
            </div>
          ))}
        </div>
        <p className="text-[12px] uppercase tracking-[0.18em] text-white/35 font-mono mb-1">Step {step} / 7</p>
        <h1 className="text-[24px] font-bold tracking-tight mb-7">{STEPS[step - 1].label}</h1>

        {errors.length > 0 && (
          <div className="mb-6 p-4 rounded-[12px] bg-[#ff7066]/10 border border-[#ff7066]/25 text-[13px] text-[#ff9a92] space-y-1">
            {errors.map((e) => <p key={e}>• {e}</p>)}
          </div>
        )}

        {/* Step 1 — 플랜 선택 */}
        {step === 1 && (
          <div>
            <div className="p-6 rounded-[18px] border-2 bg-[#0c0c0e]" style={{ borderColor: ACCENT }}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[18px] font-bold">연구준비자 플랜 · Research Aspirant</h2>
                <span className="text-[11px] font-mono px-2 py-1 rounded" style={{ background: `${ACCENT}22`, color: ACCENT }}>선택됨</span>
              </div>
              <p className="text-[13px] text-white/55 leading-relaxed">
                대학원 진학 예정자 · 석사과정생 · 연구 입문자를 위한 교육 트랙.
                연구 기초부터 학술 글쓰기까지 단계적으로 학습합니다.
              </p>
            </div>
            <button onClick={() => go(2)} className="mt-7 w-full py-3.5 rounded-[12px] text-[15px] font-semibold" style={{ background: ACCENT, color: "#070708" }}>
              이 플랜으로 가입하기
            </button>
          </div>
        )}

        {/* Step 2 — 가입 정보 입력 */}
        {step === 2 && (
          <div className="space-y-4">
            <Field label="이름" required value={form.name} onChange={(v) => set("name", v)} />
            <Field label="이메일" required type="email" value={form.email} onChange={(v) => set("email", v)} />
            {hasClerk && <Field label="비밀번호 (8자 이상)" required type="password" value={form.password} onChange={(v) => set("password", v)} />}
            <Field label="소속 대학" required value={form.university} onChange={(v) => set("university", v)} />
            <Field label="학과" required value={form.department} onChange={(v) => set("department", v)} />
            <div>
              <label className="block text-[13px] text-white/60 mb-1.5">석사과정 여부 <span className="text-white/30">(선택)</span></label>
              <div className="flex gap-2">
                {(["재학", "입학예정", "아니오"] as const).map((opt) => (
                  <button key={opt} onClick={() => set("isMasters", opt)}
                    className={`flex-1 py-2.5 rounded-[10px] text-[13px] border transition-colors ${form.isMasters === opt ? "border-[#3ecfb2] bg-[#3ecfb2]/10 text-white" : "border-white/[0.1] text-white/55 hover:border-white/25"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <Field label="지도교수명 (선택)" value={form.advisor} onChange={(v) => set("advisor", v)} />
            <Field label="연구 관심 분야" required value={form.interest} onChange={(v) => set("interest", v)} />
            <div className="flex gap-3 pt-3">
              <BackBtn onClick={() => go(1)} />
              <NextBtn onClick={() => { if (validateInfo()) go(3); }} />
            </div>
          </div>
        )}

        {/* Step 3 — 학위/논문 정보 */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-[13px] text-white/55 leading-relaxed">
              연구준비자 가입 조건: <span className="text-white/80">현재 석사과정 재학 또는 입학 예정</span>.
              아래에 재학증명 또는 입학예정 확인 정보를 입력하세요. (학술논문 링크가 있다면 함께 기재 가능)
            </p>
            <Field label="학번 (또는 재학증명/입학예정 확인)" required value={form.degreeInfo} onChange={(v) => set("degreeInfo", v)} placeholder="예: 2025123456 (학번) 또는 2026학년도 ○○대 석사 입학예정" />
            <div className="flex gap-3 pt-3">
              <BackBtn onClick={() => go(2)} />
              <NextBtn onClick={() => { if (validateDegree()) go(4); }} />
            </div>
          </div>
        )}

        {/* Step 4 — 이메일 인증 (Clerk 이메일 코드 인증, 통과해야만 다음 단계) */}
        {step === 4 && (
          <div className="space-y-5">
            <p className="text-[13px] text-white/55 leading-relaxed">
              <span className="text-white/85">{form.email || "your@email.com"}</span> 으로 6자리 인증 코드를 보냅니다.
              이메일 인증을 마쳐야 서비스에 입장할 수 있습니다.
            </p>
            {!hasClerk ? (
              <div className="p-4 rounded-[12px] bg-[#e8b84b]/10 border border-[#e8b84b]/25 text-[13px] text-[#e8b84b] space-y-3">
                <p>Clerk 키가 설정되지 않은 로컬 시연 모드입니다. 운영 환경에서는 이메일 인증 없이 진행할 수 없습니다.</p>
                {process.env.NODE_ENV !== "production" && (
                  <button onClick={() => { setVerified(true); go(5); }} className="px-4 py-2 rounded-[10px] border border-[#e8b84b]/40 text-[13px]">시연용으로 건너뛰기(개발 전용)</button>
                )}
              </div>
            ) : !emailSent ? (
              <button onClick={sendVerification} disabled={busy} className="w-full py-3 rounded-[12px] text-[14px] font-semibold border border-white/[0.12] text-white/75 hover:border-white/30 disabled:opacity-40">
                {busy ? "발송 중…" : "인증 메일 보내기"}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-[12px] bg-[#3ecfb2]/10 border border-[#3ecfb2]/25 text-[13px] text-[#3ecfb2]">
                  ✓ 인증 메일을 발송했습니다. 메일함(스팸함 포함)에서 6자리 코드를 확인하세요.
                </div>
                <input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000" aria-label="이메일 인증 코드"
                  className="w-full px-4 py-3 rounded-[10px] bg-[#0c0c0e] border border-white/[0.1] text-center tracking-[0.5em] text-[20px] font-mono focus:border-[#3ecfb2] focus:outline-none" />
                <button onClick={sendVerification} disabled={busy} className="text-[12px] text-white/45 hover:text-white/80">코드 다시 받기</button>
              </div>
            )}
            <div id="clerk-captcha" />
            <div className="flex gap-3 pt-2">
              <BackBtn onClick={() => go(3)} />
              {hasClerk && <NextBtn label={busy ? "확인 중…" : "인증 완료"} disabled={!emailSent || code.length !== 6 || busy} onClick={confirmVerification} />}
            </div>
          </div>
        )}

        {/* Step 5 — 로그인 (이메일 인증과 함께 세션이 활성화됨 → 가입 신청서 제출) */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="p-4 rounded-[12px] bg-[#3ecfb2]/10 border border-[#3ecfb2]/25 text-[13px] text-[#3ecfb2]">
              {verified ? "✓ 이메일 인증이 완료되어 로그인되었습니다." : "이메일 인증이 필요합니다."}
            </div>
            <p className="text-[13px] text-white/55 leading-relaxed">아래 버튼으로 가입 신청서를 제출하면 운영자 승인 절차가 시작됩니다. (이미 계정이 있다면 <Link href="/login" className="underline">로그인</Link>)</p>
            <button onClick={submitEnrollment} disabled={!verified || busy} className="w-full py-3.5 rounded-[12px] text-[15px] font-semibold disabled:opacity-40" style={{ background: ACCENT, color: "#070708" }}>
              {busy ? "제출 중…" : "가입 신청서 제출"}
            </button>
          </div>
        )}

        {/* Step 6 — 관리자 승인 (승인 전에는 진입 불가, 우회 버튼 없음) */}
        {step === 6 && (
          <div className="space-y-5">
            <div className="p-6 rounded-[16px] bg-[#0c0c0e] border border-white/[0.08] text-center">
              <div className="w-12 h-12 rounded-full bg-[#e8b84b]/15 text-[#e8b84b] flex items-center justify-center mx-auto mb-4 text-[20px]">⏳</div>
              <h2 className="text-[16px] font-bold mb-2">관리자 승인 대기 중</h2>
              <p className="text-[13px] text-white/55 leading-relaxed">
                회원제로 운영되어 운영자 승인 후 서비스에 진입할 수 있습니다.
                승인되면 등록하신 이메일로 안내드립니다.
              </p>
              {enrollMsg && <p className="text-[12px] text-[#3ecfb2] mt-3">{enrollMsg}</p>}
              {approval !== "approved" && <p className="text-[11px] text-white/30 mt-2 font-mono">status: {approval}</p>}
            </div>
            <div className="flex gap-3">
              <NextBtn label="승인 상태 확인" onClick={checkApproval} />
            </div>
          </div>
        )}

        {/* Step 7 — 서비스 진입 */}
        {step === 7 && (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-[16px] flex items-center justify-center mx-auto mb-6 text-[24px] font-bold" style={{ background: `${ACCENT}22`, color: ACCENT }}>✓</div>
            <h2 className="text-[20px] font-bold mb-3">가입이 완료되었습니다</h2>
            <p className="text-[13px] text-white/55 leading-relaxed mb-8 max-w-[420px] mx-auto">
              Research Aspirant 연구준비자 트랙에 오신 것을 환영합니다. 아래 버튼으로 학습을 시작하세요.
              <br />(현재 Research Aspirant 진입은 승인된 회원에게만 허용됩니다.)
            </p>
            <Link href="/rdos" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[13px] text-[15px] font-semibold" style={{ background: ACCENT, color: "#070708" }}>
              Research Aspirant 입장하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[13px] text-white/60 mb-1.5">{label} {required && <span className="text-[#3ecfb2]">*</span>}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-[10px] bg-[#0c0c0e] border border-white/[0.1] text-[14px] text-white placeholder-white/25 focus:border-[#3ecfb2] focus:outline-none transition-colors"
      />
    </div>
  );
}
function BackBtn({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="px-6 py-3 rounded-[12px] text-[14px] font-medium border border-white/[0.12] text-white/65 hover:border-white/30 transition-colors">이전</button>;
}
function NextBtn({ onClick, label = "다음", disabled }: { onClick: () => void; label?: string; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex-1 py-3 rounded-[12px] text-[14px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: ACCENT, color: "#070708" }}>
      {label}
    </button>
  );
}
