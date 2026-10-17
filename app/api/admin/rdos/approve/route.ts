import { NextResponse } from "next/server";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { isSuperAdminEmail } from "@/lib/admin-config";
import { getServiceSupabase } from "@/lib/supabase";

/** 미들웨어는 세션 클레임(Clerk publicMetadata.approvalStatus)을 DB 보다 먼저 읽으므로 함께 갱신한다. */
async function syncClerkApproval(userId: string, approvalStatus: "approved" | "rejected" | "pending") {
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, { publicMetadata: { approvalStatus } });
  } catch (e) {
    console.warn("[approve] Clerk metadata update failed:", e);
  }
}

/** 슈퍼관리자: Research Aspirant 가입 승인/거절 → 승인 시 해당 회원이 Research Aspirant 진입 가능 */
export async function POST(req: Request) {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  if (!isSuperAdminEmail(email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { targetUserId, targetEmail, approve, remove } = await req.json().catch(() => ({}));
  if (!targetUserId) return NextResponse.json({ error: "targetUserId 필요" }, { status: 400 });

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ ok: true, persisted: false });

  // 테이블 부재/스키마 캐시 오류를 사용자가 이해할 수 있는 안내로 변환
  const friendly = (msg: string) =>
    /schema cache|could not find the table|relation .* does not exist/i.test(msg)
      ? "DB에 Research Aspirant 테이블이 없습니다. supabase/schema.sql 을 SQL Editor 에서 1회 실행하세요."
      : msg;

  // v6(과제 1): 완전 퇴출 — enrollment 행 삭제(재가입 시 다시 승인 필요)
  if (remove === true) {
    const { error } = await supabase.from("rdos_enrollment").delete().eq("user_id", targetUserId);
    if (error) return NextResponse.json({ error: friendly(error.message) }, { status: 500 });
    // 로그인 게이트(profiles.approval_status)도 승인 대기로 되돌린다
    await supabase.from("profiles").update({ approval_status: "pending" }).eq("id", targetUserId);
    await syncClerkApproval(targetUserId, "pending");
    return NextResponse.json({ ok: true, persisted: true, status: "removed" });
  }

  // v6: update → upsert. 자가 가입(enrollment) 행이 없는 일반 회원도
  // 슈퍼관리자가 Research Aspirant 접근을 직접 부여/차단할 수 있게 한다(회원 명부 연동).
  const status = approve ? "approved" : "rejected";
  const { error } = await supabase
    .from("rdos_enrollment")
    .upsert(
      {
        user_id: targetUserId,
        email: targetEmail ?? null,
        track: "rdos",
        status,
        approved_at: approve ? new Date().toISOString() : null,
        approved_by: email,
      },
      { onConflict: "user_id" }
    );
  if (error) return NextResponse.json({ error: friendly(error.message) }, { status: 500 });

  // 미들웨어의 로그인 게이트는 profiles.approval_status 를 본다. 두 값을 함께 맞춰야
  // 승인된 회원이 "승인 대기" 화면에 갇히지 않는다.
  const { error: pErr } = await supabase
    .from("profiles")
    .upsert(
      { id: targetUserId, email: targetEmail ?? null, approval_status: approve ? "approved" : "rejected", updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
  if (pErr) return NextResponse.json({ error: friendly(pErr.message) }, { status: 500 });
  await syncClerkApproval(targetUserId, approve ? "approved" : "rejected");
  return NextResponse.json({ ok: true, persisted: true, status });
}
