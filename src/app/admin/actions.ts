"use server";

import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveRequest(requestId: number, contractedCost: number) {
  const session = await getSession();

  // 보안 처리: admin 권한 확인
  if (!session || session.role !== "admin") {
    return { success: false, error: "관리자 권한이 없습니다." };
  }

  const supabase = createServerClient();

  // 해당 요청의 상태를 '승인'으로 업데이트하고 계약 금액 저장
  const { error } = await supabase
    .from("bus_requests")
    .update({ 
      status: "승인", 
      contracted_cost: contractedCost,
      updated_at: new Date().toISOString() 
    })
    .eq("id", requestId);

  if (error) {
    console.error("승인 처리 중 오류 발생:", error);
    return { success: false, error: "승인 처리에 실패했습니다. 다시 시도해 주세요." };
  }

  // /admin 페이지의 데이터를 강제로 새로고침 (Revalidate)
  revalidatePath("/admin");

  return { success: true };
}

export async function toggleReportSubmitted(requestId: number, isSubmitted: boolean) {
  const session = await getSession();
  
  if (!session || session.role !== "admin") {
    return { success: false, error: "관리자 권한이 없습니다." };
  }

  const supabase = createServerClient();

  // 기존 report_data 조회
  const { data: request } = await supabase
    .from("bus_requests")
    .select("report_data")
    .eq("id", requestId)
    .single();

  const currentReportData = request?.report_data || {};
  const newReportData = { ...currentReportData, admin_checked: isSubmitted };

  const { error } = await supabase
    .from("bus_requests")
    .update({ 
      report_data: newReportData,
      updated_at: new Date().toISOString() 
    })
    .eq("id", requestId);

  if (error) {
    console.error("정산 요청 상태 업데이트 실패:", error);
    return { success: false, error: "상태 업데이트에 실패했습니다." };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function updateTotalBudget(amount: number) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return { success: false, error: "관리자 권한이 없습니다." };
  }

  const supabase = createServerClient();

  const { error } = await supabase
    .from("admin_settings")
    .update({ 
      total_budget: amount,
      updated_at: new Date().toISOString() 
    })
    .eq("id", 1);

  if (error) {
    console.error("예산 수정 중 오류 발생:", error);
    return { success: false, error: "예산 수정에 실패했습니다." };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function updateReportData(requestId: number, reportData: any) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return { success: false, error: "관리자 권한이 없습니다." };
  }

  const supabase = createServerClient();

  const { error } = await supabase
    .from("bus_requests")
    .update({ 
      report_data: reportData,
      updated_at: new Date().toISOString() 
    })
    .eq("id", requestId);

  if (error) {
    console.error("완수검사조서 업데이트 중 오류 발생:", error);
    return { success: false, error: "완수검사조서 저장에 실패했습니다." };
  }

  revalidatePath(`/admin/report/${requestId}`);
  revalidatePath("/admin");

  return { success: true };
}
