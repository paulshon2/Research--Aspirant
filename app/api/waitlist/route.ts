import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

/** 랜딩페이지 대기 등록 — 브라우저에 DB 키를 두지 않고 서버가 대신 저장한다. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const stage = String(body.stage ?? "").trim();

  if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !stage || stage.length > 40) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const { error } = await supabase.from("waitlist").insert({ name, email, stage });
  if (error) {
    if (error.code === "23505") return NextResponse.json({ ok: true, duplicate: true }, { status: 409 });
    console.error("[waitlist] insert failed:", error.message);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
