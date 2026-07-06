import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production"
);

const COOKIE_NAME = "edubus-session";

// 인증 없이 접근 가능한 공개 경로
const publicRoutes = ["/login"];

// 비밀번호 미변경 사용자가 접근 가능한 경로 (로그인 상태)
const passwordChangeRoutes = ["/update-password"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API, 정적 자산은 보호 대상에서 제외
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isPasswordChangeRoute = passwordChangeRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 세션 토큰 검증
  const token = req.cookies.get(COOKIE_NAME)?.value;
  let session: Record<string, unknown> | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload as Record<string, unknown>;
    } catch {
      session = null;
    }
  }

  // ─── 1) 비인증 사용자가 보호 경로 접근 → /login ───
  if (!isPublicRoute && !isPasswordChangeRoute && !session) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 비인증 사용자가 /update-password 접근 → /login
  if (isPasswordChangeRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // ─── 2) 이미 로그인된 사용자가 /login 접근 → 적절한 곳으로 ───
  if (isPublicRoute && session) {
    // 비밀번호 미변경 → /update-password로
    if (!session.passwordChanged) {
      return NextResponse.redirect(new URL("/update-password", req.nextUrl));
    }
    const targetUrl = session.role === "admin" ? "/admin" : "/apply";
    return NextResponse.redirect(new URL(targetUrl, req.nextUrl));
  }

  // ─── 3) 비밀번호 미변경 사용자가 일반 페이지 접근 → /update-password 강제 ───
  if (session && !session.passwordChanged && !isPasswordChangeRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/update-password", req.nextUrl));
  }

  // ─── 4) 비밀번호 이미 변경한 사용자가 /update-password 접근 → 메인으로 ───
  if (session && session.passwordChanged && isPasswordChangeRoute) {
    const targetUrl = session.role === "admin" ? "/admin" : "/apply";
    return NextResponse.redirect(new URL(targetUrl, req.nextUrl));
  }

  // ─── 6) 루트 경로(/) 접근 시 역할에 따라 리다이렉트 ───
  if (pathname === "/" && session && session.passwordChanged) {
    const targetUrl = session.role === "admin" ? "/admin" : "/apply";
    return NextResponse.redirect(new URL(targetUrl, req.nextUrl));
  }

  // ─── 5) 관리자 페이지(/admin) 접근 권한 체크 ───
  if (pathname.startsWith("/admin") && session?.role !== "admin") {
    // 권한이 없으면 메인 페이지로 리다이렉트
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// proxy가 실행될 경로 필터 (API, 정적 파일 제외)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
