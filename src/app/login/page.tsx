"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Bus, LogIn, Eye, EyeOff, CircleAlert, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "로그인에 실패했습니다.");
        setIsLoading(false);
        return;
      }

      // 최초 로그인(임시 비밀번호) → 비밀번호 변경 페이지로 리다이렉트
      if (data.needsPasswordChange) {
        router.push("/update-password");
      } else {
        // 정상 로그인 → 역할에 따라 리다이렉트
        if (data.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/apply");
        }
      }
      router.refresh();
    } catch {
      setError("서버 연결에 실패했습니다. 네트워크 상태를 확인해 주세요.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#1e3a8a]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl" />
        
        {/* Floating bus icons */}
        <div className="absolute top-[15%] left-[10%] text-white/5 animate-bounce [animation-duration:3s]">
          <Bus className="w-16 h-16" />
        </div>
        <div className="absolute top-[25%] right-[15%] text-white/5 animate-bounce [animation-duration:4s] [animation-delay:0.5s]">
          <Bus className="w-12 h-12" />
        </div>
        <div className="absolute bottom-[20%] left-[20%] text-white/5 animate-bounce [animation-duration:3.5s] [animation-delay:1s]">
          <Bus className="w-10 h-10" />
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white shadow-2xl shadow-blue-500/30 mb-5 ring-4 ring-white/20 p-3">
            <img src="/logo.png" alt="여주교육지원청 로고" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            여주 <span className="text-amber-400">체험버스</span>
          </h1>
          <p className="text-blue-200/70 text-sm mt-2 font-medium">
            관내 체험학습 버스 통합 지원 시스템
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">학교 로그인</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Login ID */}
            <div className="flex flex-col gap-2">
              <label htmlFor="loginId" className="text-sm font-semibold text-blue-200/80">
                학교명 (로그인 ID)
              </label>
              <input
                id="loginId"
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="예: OO초등학교"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.08] border border-white/[0.12] text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/40 transition-all disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-blue-200/80">
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.08] border border-white/[0.12] text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/40 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/20">
                <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-300 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/35 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-amber-500 disabled:hover:to-amber-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  로그인 중...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  로그인
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-5 border-t border-white/[0.08]">
            <p className="text-xs text-blue-200/40 text-center leading-relaxed">
              초기 비밀번호가 기억나지 않으시면<br />
              여주교육지원청 체험학습 담당자에게 문의하세요.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-blue-200/30 mt-6 font-medium">
          © 2026 여주 체험버스. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
