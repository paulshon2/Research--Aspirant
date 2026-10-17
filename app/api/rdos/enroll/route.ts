import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabase";

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/** 연구준비자 가입 신청 → enrollment(pending) 생성. 관리자 승인 전까지 Research Aspirant 진입 불가. */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await currentUser();
  // 이메일 인증을 통과하지 않은 계정은 신청 불가(클라이언트 우회 방지)
  const primary = user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId) ?? user?.emailAddresses?.[0];
  if (primary?.verification?.status !== "verified") {
    return NextResponse.json({ error: "이메일 인증이 필요합니다." }, { status: 403 });
  }
  const email = primary?.emailAddress ?? null;

  // 가입 화면이 보내는 항목만 저장한다
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const profile = {
    name: str(body.name, 80),
    university: str(body.university, 120),
    department: str(body.department, 120),
    phone: str(body.phone, 20).replace(/[^\d+]/g, ""),
  };
  if (!profile.name || !profile.university || !profile.department || profile.phone.replace(/\D/g, "").length < 9) {
    return NextResponse.json({ error: "가입 정보가 올바르지 않습니다." }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ ok: true, persisted: false, status: "pending" });

  // 이미 처리된 신청(승인·거절)은 상태를 되돌리지 않고 정보만 갱신한다
  const { data: existing } = await supabase
    .from("rdos_enrollment")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("rdos_enrollment").update({ email, profile }).eq("user_id", userId)
    : await supabase.from("rdos_enrollment").insert({
        user_id: userId, email, status: "pending", track: "rdos", profile, created_at: new Date().toISOString(),
      });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, persisted: true, status: existing?.status ?? "pending" });
}
