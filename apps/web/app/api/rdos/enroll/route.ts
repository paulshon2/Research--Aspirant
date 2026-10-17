import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabase";

/** 연구준비자 가입 → enrollment(pending) 생성. 관리자 승인 전까지 Research Aspirant 진입 불가. */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  // 이메일 인증을 통과하지 않은 계정은 신청 불가(클라이언트 우회 방지)
  const primary = user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId) ?? user?.emailAddresses?.[0];
  if (primary?.verification?.status !== "verified") {
    return NextResponse.json({ error: "이메일 인증이 필요합니다." }, { status: 403 });
  }
  const profile = await req.json().catch(() => ({}));

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ ok: true, persisted: false, status: "pending" });

  const { error } = await supabase.from("rdos_enrollment").upsert(
    { user_id: userId, email, status: "pending", track: "rdos", profile, created_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, persisted: true, status: "pending" });
}
