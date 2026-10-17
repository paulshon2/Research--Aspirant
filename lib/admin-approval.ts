import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabase";
import { isSuperAdminEmail } from "@/lib/admin-config";

/**
 * 슈퍼관리자(SUPER_ADMIN_EMAILS) 계정은 승인 대기 없이 바로 승인 상태로 맞춘다.
 * 승인은 관리자만 할 수 있으므로, 관리자 자신이 "승인 대기"에 갇히면 아무도 첫 승인을 할 수 없다.
 * DB(profiles)와 Clerk 메타데이터(미들웨어가 먼저 읽는 값)를 함께 갱신한다. 이미 승인됐으면 아무것도 하지 않는다.
 */
export async function ensureSuperAdminApproved(userId: string, email: string | null): Promise<void> {
  if (!userId || !isSuperAdminEmail(email)) return;

  const supabase = getServiceSupabase();
  if (supabase) {
    const { data } = await supabase.from("profiles").select("approval_status").eq("id", userId).maybeSingle();
    if (data?.approval_status !== "approved") {
      await supabase
        .from("profiles")
        .upsert({ id: userId, email, role: "admin", approval_status: "approved", updated_at: new Date().toISOString() }, { onConflict: "id" });
    }
  }

  try {
    const client = await clerkClient();
    const u = await client.users.getUser(userId);
    if ((u.publicMetadata as { approvalStatus?: string } | undefined)?.approvalStatus !== "approved") {
      await client.users.updateUserMetadata(userId, { publicMetadata: { approvalStatus: "approved" } });
    }
  } catch (e) {
    console.warn("[ensureSuperAdminApproved] Clerk metadata update failed:", e);
  }
}
