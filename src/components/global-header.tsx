"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bus, LogOut, Loader2, ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";

interface SessionUser {
  accountId: number;
  schoolId: number | null;
  schoolName: string;
  role: "school" | "admin";
  passwordChanged: boolean;
}

interface Props {
  session: SessionUser | null;
}

export default function GlobalHeader({ session }: Props) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 세션이 없으면 헤더 숨김
  if (!session) {
    return null;
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  }

  const displayName = session.role === "admin" ? "관리자" : session.schoolName.replace(/\s*행정실$/, '');

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 overflow-hidden flex items-center justify-center transition-all group-hover:scale-105">
              <img src="/logo.png" alt="여주교육지원청 마크" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-slate-800 tracking-tight">여주 체험버스</span>
            </div>
          </Link>
        </div>

        {/* Right: User Info & Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-700 border border-slate-200">
            {session.role === "admin" ? (
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            ) : (
              <FileText className="w-4 h-4 text-indigo-500" />
            )}
            {displayName}
          </div>

          {session.passwordChanged && session.role === "admin" && (
            <Link
              href="/admin"
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 hidden sm:block"
            >
              대시보드 가기
            </Link>
          )}

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span className="inline">로그아웃</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
