import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { loginId, password } = await request.json();

    if (!loginId || !password) {
      return NextResponse.json(
        { error: "로그인 ID와 비밀번호를 입력해 주세요." },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // DB의 verify_login RPC 호출 (pgcrypto로 비밀번호 검증)
    const { data, error } = await supabase.rpc("verify_login", {
      p_login_id: loginId,
      p_password: password,
    });

    if (error) {
      console.error("Login RPC error:", error);
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "학교명 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // JWT 세션 토큰 생성
    const token = await createSessionToken({
      accountId: data.account_id,
      schoolId: data.school_id,
      schoolName: data.school_name,
      schoolLevel: data.school_level,
      role: data.role,
      passwordChanged: data.password_changed ?? false,
    });

    const response = NextResponse.json({
      success: true,
      needsPasswordChange: !data.password_changed,
      user: {
        schoolName: data.school_name,
        schoolLevel: data.school_level,
        role: data.role,
      },
    });

    // httpOnly 쿠키로 세션 저장
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24시간
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
