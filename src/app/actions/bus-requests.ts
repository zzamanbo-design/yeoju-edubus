"use server";

import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteBusRequest(requestId: number) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const supabase = createServerClient();

  // 먼저 해당 요청의 정보를 조회하여 권한 확인
  const { data: requestData, error: fetchError } = await supabase
    .from("bus_requests")
    .select("school_id")
    .eq("id", requestId)
    .single();

  if (fetchError || !requestData) {
    return { success: false, error: "신청 내역을 찾을 수 없습니다." };
  }

  // 삭제 권한 검증: 관리자이거나 해당 신청을 한 학교여야 함
  const isAdmin = session.role === "admin";
  const isOwner = session.schoolId === requestData.school_id;

  if (!isAdmin && !isOwner) {
    return { success: false, error: "삭제 권한이 없습니다." };
  }

  // 삭제 실행
  const { error: deleteError } = await supabase
    .from("bus_requests")
    .delete()
    .eq("id", requestId);

  if (deleteError) {
    console.error("신청 내역 삭제 중 오류 발생:", deleteError);
    return { success: false, error: "삭제에 실패했습니다. 다시 시도해 주세요." };
  }

  // 관련된 페이지들의 캐시를 새로고침하여 즉시 반영
  revalidatePath("/admin");
  revalidatePath("/apply");
  revalidatePath("/");

  return { success: true };
}
