"use client";

import Link from "next/link";
import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { hasClerk } from "@/hooks/use-safe-clerk";
import { BrandLogo } from "@/components/ui/brand-logo";

/* ════════════════════════════════════════════════════════════
   Research Aspirant 회원가입 — 한 화면 입력 + 이메일 인증
   ① 가입 정보(이름·이메일·비밀번호·소속 대학·학과·핸드폰번호)
   ② 이메일로 받은 6자리 코드 확인(Clerk) → 계정 생성·로그인 → 가입 신청 자동 제출
   ③ 완료 — 운영자 승인 후 입장
═══════════════════════════════════════════════════════════════ */

const ACCENT = "#3ecfb2";
/** 랜딩(Research Aspirant) 주소 — 설정 시 가입 화면에서 소개 페이지로 돌아가는 링크를 노출 */
const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL || "";

type Form = {
  name: string; email: string; password: string;
  university: string; department: string; phone: string;
};
type Phase = "form" | "verify" | "done";

/** 숫자만 남긴 핸드폰번호가 9~15자리인지 (국내 010…·국제 +82… 모두 허용) */
const phoneDigits = (s: string) => s.replace(/\D/g, "");
const isPhone = (s: string) => /^[+\d][\d\s-]*$/.test(s.trim()) && phoneDigits(s).length >= 9 && phoneDigits(s).length <= 15;
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

/** 비밀번호 규칙 — 8자 이상, 대문자·소문자·숫자·특수문자 각 1개 이상, 공백 없음.
    Clerk 대시보드의 Password 설정도 같은 값으로 맞춰야 서버에서 거절되지 않는다. */
const PASSWORD_RULES: { key: string; label: string; test: (s: string) => boolean }[] = [
  { key: "len", label: "8자 이상", test: (s) => s.length >= 8 },
  { key: "upper", label: "영문 대문자 1개 이상 (A-Z)", test: (s) => /[A-Z]/.test(s) },
  { key: "lower", label: "영문 소문자 1개 이상 (a-z)", test: (s) => /[a-z]/.test(s) },
  { key: "digit", label: "숫자 1개 이상 (0-9)", test: (s) => /\d/.test(s) },
  { key: "special", label: "특수문자 1개 이상 (!@#$% 등)", test: (s) => /[!-/:-@[-`{-~]/.test(s) },
  { key: "space", label: "공백 없음", test: (s) => s.length > 0 && !/\s/.test(s) },
];
const missingPasswordRules = (s: string) => PASSWORD_RULES.filter((r) => !r.test(s)).map((r) => r.label);

/** Clerk 오류를 사용자가 고칠 수 있는 한국어 안내로 바꾼다 */
function clerkErrorKo(err: unknown, fallback: string): string {
  const e = (err as { errors?: { code?: string; message?: string; longMessage?: string }[] })?.errors?.[0];
  if (!e) return fallback;
  const n = (e.longMessage || e.message || "").match(/(\d+)/)?.[1];
  switch (e.code) {
    case "form_password_length_too_short":
      return `비밀번호가 너무 짧습니다${n ? ` (현재 인증 서버 설정: ${n}자 이상)` : ""}. 더 길게 입력하세요.`;
    case "form_password_length_too_long":
      return "비밀번호가 너무 깁니다. 더 짧게 입력하세요.";
    case "form_password_pwned":
      return "이 비밀번호는 다른 사이트에서 유출된 적이 있어 사용할 수 없습니다. 다른 비밀번호를 입력하세요.";
    case "form_password_not_strong_enough":
    case "form_password_validation_failed":
      return "비밀번호가 보안 기준을 충족하지 않습니다. 아래 체크리스트를 모두 채워 주세요.";
    case "form_identifier_exists":
      return "이미 가입된 이메일입니다. 로그인하거나 다른 이메일을 사용하세요.";
    case "form_param_format_invalid":
      return "입력 형식이 올바르지 않습니다. 이메일 주소를 확인하세요.";
    case "form_code_incorrect":
      return "인증 코드가 올바르지 않습니다. 메일의 6자리 코드를 다시 확인하세요.";
    case "verification_expired":
      return "인증 코드가 만료되었습니다. '코드 다시 받기'를 누르세요.";
    case "too_many_requests":
      return "요청이 너무 많습니다. 잠시 후 다시 시도하세요.";
    default:
      return e.longMessage || e.message || fallback;
  }
}

export default function RaSignupPage() {
  const [phase, setPhase] = useState<Phase>("form");
  const [form, setForm] = useState<Form>({ name: "", email: "", password: "", university: "", department: "", phone: "" });
  const [errors, setErrors] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [enrollFailed, setEnrollFailed] = useState(false);

  /* hasClerk 는 빌드 시점 상수이므로 훅 호출 순서는 렌더 간 변하지 않는다. */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const clerk = hasClerk ? useSignUp() : null;

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const clerkMsg = clerkErrorKo;
  const [showPw, setShowPw] = useState(false);
  const pwMissing = missingPasswordRules(form.password);

  function validate(): boolean {
    const e: string[] = [];
    if (!form.name.trim()) e.push("이름을 입력하세요");
    if (!isEmail(form.email)) e.push("올바른 이메일을 입력하세요");
    if (pwMissing.length) e.push(`비밀번호에 빠진 조건: ${pwMissing.join(", ")}`);
    if (!form.university.trim()) e.push("소속 대학을 입력하세요");
    if (!form.department.trim()) e.push("학과를 입력하세요");
    if (!isPhone(form.phone)) e.push("핸드폰번호를 확인하세요 (예: 010-1234-5678)");
    setErrors(e);
    return e.length === 0;
  }

  /** ① → ②: Clerk 계정 생성 + 인증 코드 메일 발송 */
  async function startSignup() {
    if (!validate()) return;
    if (!clerk?.isLoaded || !clerk.signUp) { setErrors(["인증 모듈을 불러오는 중입니다. 잠시 후 다시 시도하세요."]); return; }
    setBusy(true);
    try {
      await clerk.signUp.create({
        emailAddress: form.email.trim(),
        password: form.password,
        firstName: form.name.trim(),
        unsafeMetadata: { university: form.university.trim(), department: form.department.trim(), phone: phoneDigits(form.phone) },
      });
      await clerk.signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCode("");
      setPhase("verify");
    } catch (err) {
      setErrors([clerkMsg(err, "가입을 시작하지 못했습니다. 잠시 후 다시 시도하세요.")]);
    } finally { setBusy(false); }
  }

  async function resendCode() {
    if (!clerk?.isLoaded || !clerk.signUp) return;
    setBusy(true); setErrors([]);
    try {
      await clerk.signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setNotice("인증 코드를 다시 보냈습니다.");
    } catch (err) {
      setErrors([clerkMsg(err, "코드를 다시 보내지 못했습니다.")]);
    } finally { setBusy(false); }
  }

  /** 가입 신청서 저장 (인증·로그인 후). 실패하면 완료 화면에서 다시 시도할 수 있다. */
  async function submitEnrollment() {
    setBusy(true); setEnrollFailed(false); setNotice(null);
    try {
      const r = await fetch("/api/rdos/enroll", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(), university: form.university.trim(),
          department: form.department.trim(), phone: phoneDigits(form.phone),
        }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setEnrollFailed(true);
        setNotice(`가입 신청을 저장하지 못했습니다 (${j.error ?? r.status}). 아래 '다시 제출'을 눌러 주세요.`);
      }
    } catch {
      setEnrollFailed(true);
      setNotice("네트워크 오류로 가입 신청을 저장하지 못했습니다. 아래 '다시 제출'을 눌러 주세요.");
    } finally { setBusy(false); }
  }

  /** ② → ③: 코드 확인 → 세션 활성화 → 가입 신청 자동 제출 */
  async function confirmCode() {
    setErrors([]);
    if (!clerk?.isLoaded || !clerk.signUp) return;
    if (!/^\d{6}$/.test(code)) { setErrors(["메일로 받은 6자리 인증 코드를 입력하세요."]); return; }
    setBusy(true);
    try {
      const res = await clerk.signUp.attemptEmailAddressVerification({ code });
      if (res.status !== "complete" || !res.createdSessionId) {
        setErrors(["인증이 완료되지 않았습니다. 코드를 다시 확인하세요."]);
        return;
      }
      await clerk.setActive({ session: res.createdSessionId });
      setPhase("done");
      await submitEnrollment();
    } catch (err) {
      setErrors([clerkMsg(err, "인증 코드가 올바르지 않거나 만료되었습니다.")]);
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-[#070708] text-[#f4f4f5] font-nanum-gothic antialiased">
      <nav className="border-b border-white/[0.07]">
        <div className="max-w-[560px] mx-auto px-6 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo size={28} radius={8} />
            <span className="text-[15px] font-bold">Research Aspirant</span>
          </Link>
          {LANDING_URL && (
            <a href={LANDING_URL} className="text-[13px] text-white/45 hover:text-white/80 transition">← 소개</a>
          )}
        </div>
      </nav>

      <main className="max-w-[560px] mx-auto px-6 py-12">
        <h1 className="text-[24px] font-bold tracking-tight mb-2">
          {phase === "form" ? "회원가입" : phase === "verify" ? "이메일 인증" : "가입이 완료되었습니다"}
        </h1>
        <p className="text-[13px] text-white/50 mb-8">
          {phase === "form" && "정보를 입력하면 이메일로 인증 코드를 보내드립니다."}
          {phase === "verify" && <><span className="text-white/85">{form.email}</span> 으로 보낸 6자리 코드를 입력하세요.</>}
          {phase === "done" && "운영자 승인 후 학습을 시작할 수 있습니다. 승인되면 이메일로 안내드립니다."}
        </p>

        {errors.length > 0 && (
          <div role="alert" className="mb-6 p-4 rounded-[12px] bg-[#ff7066]/10 border border-[#ff7066]/25 text-[13px] text-[#ff9a92] space-y-1">
            {errors.map((e) => <p key={e}>• {e}</p>)}
          </div>
        )}
        {notice && <p className="mb-6 text-[12.5px] text-[#3ecfb2]">{notice}</p>}

        {phase === "form" && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void startSignup(); }} noValidate>
            <Field label="이름" autoComplete="name" value={form.name} onChange={(v) => set("name", v)} />
            <Field label="이메일" type="email" autoComplete="email" value={form.email} onChange={(v) => set("email", v)} />
            <div>
              <label className="block">
                <span className="block text-[13px] text-white/60 mb-1.5">비밀번호 <span className="text-[#3ecfb2]">*</span></span>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} autoComplete="new-password" value={form.password}
                    onChange={(e) => set("password", e.target.value)} aria-describedby="pw-rules"
                    className="w-full px-4 py-2.5 pr-16 rounded-[10px] bg-[#0c0c0e] border border-white/[0.1] text-[14px] text-white focus:border-[#3ecfb2] focus:outline-none transition-colors" />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[12px] text-white/50 hover:text-white/85">
                    {showPw ? "숨기기" : "보기"}
                  </button>
                </div>
              </label>
              <ul id="pw-rules" className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[12.5px]" aria-live="polite">
                {PASSWORD_RULES.map((r) => {
                  const ok = r.test(form.password);
                  return (
                    <li key={r.key} className={ok ? "text-[#3ecfb2]" : form.password ? "text-[#ff9a92]" : "text-white/40"}>
                      {ok ? "✓" : "○"} {r.label}
                    </li>
                  );
                })}
              </ul>
            </div>
            <Field label="소속 대학" autoComplete="organization" value={form.university} onChange={(v) => set("university", v)} />
            <Field label="학과" value={form.department} onChange={(v) => set("department", v)} />
            <Field label="핸드폰번호" type="tel" autoComplete="tel" inputMode="tel" placeholder="010-1234-5678" value={form.phone} onChange={(v) => set("phone", v)} />

            {!hasClerk && (
              <p className="p-4 rounded-[12px] bg-[#e8b84b]/10 border border-[#e8b84b]/25 text-[13px] text-[#e8b84b]">
                Clerk 키가 설정되지 않아 이메일 인증을 진행할 수 없습니다. (운영자: 환경변수를 확인하세요)
              </p>
            )}
            <div id="clerk-captcha" />
            <button type="submit" disabled={busy || !hasClerk}
              className="w-full mt-2 py-3.5 rounded-[12px] text-[15px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: ACCENT, color: "#070708" }}>
              {busy ? "처리 중…" : "가입하고 인증 코드 받기"}
            </button>
            <p className="text-center text-[13px] text-white/45 pt-2">
              이미 계정이 있나요? <Link href="/login" className="text-white/80 underline">로그인</Link>
            </p>
          </form>
        )}

        {phase === "verify" && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void confirmCode(); }}>
            <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000" aria-label="이메일 인증 코드"
              className="w-full px-4 py-3.5 rounded-[10px] bg-[#0c0c0e] border border-white/[0.1] text-center tracking-[0.5em] text-[22px] font-mono focus:border-[#3ecfb2] focus:outline-none" />
            <button type="submit" disabled={busy || code.length !== 6}
              className="w-full py-3.5 rounded-[12px] text-[15px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: ACCENT, color: "#070708" }}>
              {busy ? "확인 중…" : "인증 완료"}
            </button>
            <div className="flex justify-between text-[12.5px] text-white/45">
              <button type="button" onClick={() => { setPhase("form"); setErrors([]); setNotice(null); }} className="hover:text-white/80">← 정보 수정</button>
              <button type="button" onClick={resendCode} disabled={busy} className="hover:text-white/80">코드 다시 받기</button>
            </div>
            <p className="text-[12px] text-white/35">메일이 오지 않으면 스팸함을 확인하세요.</p>
          </form>
        )}

        {phase === "done" && (
          <div className="p-6 rounded-[16px] bg-[#0c0c0e] border border-white/[0.08] text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-[20px] font-bold" style={{ background: `${ACCENT}22`, color: ACCENT }}>✓</div>
            <p className="text-[14px] text-white/80 mb-1">{enrollFailed ? "이메일 인증 완료" : busy ? "가입 신청 저장 중…" : "이메일 인증 완료 · 가입 신청 접수"}</p>
            <p className="text-[13px] text-white/50 mb-6">승인이 끝나면 아래 버튼으로 바로 입장할 수 있습니다.</p>
            {enrollFailed && (
              <button type="button" onClick={submitEnrollment} disabled={busy}
                className="block mx-auto mb-4 px-6 py-2.5 rounded-[10px] text-[13px] font-semibold border border-[#3ecfb2]/50 text-[#3ecfb2] disabled:opacity-40">
                {busy ? "제출 중…" : "다시 제출"}
              </button>
            )}
            <Link href="/rdos" className="inline-flex items-center justify-center px-7 py-3 rounded-[12px] text-[14px] font-semibold" style={{ background: ACCENT, color: "#070708" }}>
              Research Aspirant 입장하기
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, autoComplete, inputMode }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
  autoComplete?: string; inputMode?: "tel" | "email" | "text";
}) {
  return (
    <label className="block">
      <span className="block text-[13px] text-white/60 mb-1.5">{label} <span className="text-[#3ecfb2]">*</span></span>
      <input
        type={type} value={value} placeholder={placeholder} autoComplete={autoComplete} inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-[10px] bg-[#0c0c0e] border border-white/[0.1] text-[14px] text-white placeholder-white/25 focus:border-[#3ecfb2] focus:outline-none transition-colors"
      />
    </label>
  );
}
