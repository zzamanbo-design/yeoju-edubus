import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { schoolId } = await request.json();
    if (!schoolId) {
      return NextResponse.json({ error: "학교 ID가 필요합니다." }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase.rpc("admin_reset_school_password", {
      p_school_id: schoolId,
    });

    if (error) {
      console.error("Reset password RPC error:", error);
      return NextResponse.json({ error: "초기화 중 오류가 발생했습니다." }, { status: 500 });
    }

    if (!data.success) {
      return NextResponse.json({ error: data.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: data.message });
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
