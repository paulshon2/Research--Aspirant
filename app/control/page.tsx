import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { isSuperAdminEmail } from "@/lib/admin-config";
import ControlHub from "@/components/admin/control-hub";
import { ensureSuperAdminApproved } from "@/lib/admin-approval";

export const dynamic = "force-dynamic";

/* 통합 관리자 허브 (v9) — 슈퍼관리자 전용.
   로그인 후 진입점. Research Aspirant 본페이지와
   각 관리자 페이지로 한 곳에서 이동한다. 비(非)슈퍼관리자는 대시보드로. */
export default async function ControlPage() {
  const user = await currentUser().catch(() => null);
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  if (!isSuperAdminEmail(email)) redirect("/rdos");
  // 관리자 자신이 승인 대기에 갇히지 않도록 (첫 로그인 시 자동 승인)
  if (user) await ensureSuperAdminApproved(user.id, email);
  const name = user?.firstName || (email ? email.split("@")[0] : null);
  return <ControlHub adminName={name} />;
}
