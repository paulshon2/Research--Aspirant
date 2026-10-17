/* ════════════════════════════════════════════════════════════
   슈퍼관리자(super-admin) 지정 — 환경변수로만 정한다.
   SUPER_ADMIN_EMAILS (서버) / NEXT_PUBLIC_SUPER_ADMIN_EMAILS (화면 표시용), 콤마 구분.
   소스에 내장된 관리자는 없다. 값이 비어 있으면 관리자 화면에 아무도 들어갈 수 없다.
═══════════════════════════════════════════════════════════════ */

function fromEnv(v?: string | null): string[] {
  return (v || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const SUPER_ADMIN_EMAILS: string[] = Array.from(
  new Set([
    ...fromEnv(process.env.SUPER_ADMIN_EMAILS),
    ...fromEnv(process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS),
  ])
);

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/** 전체 마스킹 표시용: 이메일을 a***@domain 형태로 가린다(UI 표시 보조). */
export function maskEmail(email?: string | null): string {
  if (!email) return "";
  const [u, d] = email.split("@");
  if (!d) return "***";
  return `${u.slice(0, 1)}***@${d}`;
}
