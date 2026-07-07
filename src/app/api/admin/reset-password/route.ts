import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { schoolIds } = await request.json();
    if (!Array.isArray(schoolIds) || schoolIds.length === 0) {
      return NextResponse.json({ error: "학교를 1개 이상 선택해 주세요." }, { status: 400 });
    }

    const supabase = createServerClient();
    
    const results = await Promise.all(
      schoolIds.map((id) =>
        supabase.rpc("admin_reset_school_password", { p_school_id: id })
      )
    );

    const hasError = results.some((r) => r.error || (r.data && !r.data.success));
    if (hasError) {
      console.error("Reset password RPC errors:", results);
      return NextResponse.json({ error: "일부 학교의 초기화 중 오류가 발생했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `${schoolIds.length}개 기관의 비밀번호가 성공적으로 초기화되었습니다.` });
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
