"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Bus,
  KeyRound,
  Eye,
  EyeOff,
  CircleAlert,
  Loader2,
  ShieldAlert,
  Check,
  X,
} from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 비밀번호 유효성 검증 조건들
  const validations = [
    { label: "6자 이상", valid: newPassword.length >= 6 },
  ];
  const allValid = validations.every((v) => v.valid);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!allValid) {
      setError("비밀번호 조건을 모두 충족해 주세요.");
      return;
    }

    if (!passwordsMatch) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "비밀번호 변경에 실패했습니다.");
        setIsLoading(false);
        return;
      }

      // 비밀번호 변경 성공 → 역할에 따라 리다이렉트
      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/apply");
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
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-2xl shadow-amber-500/30 mb-5 ring-4 ring-white/10">
            <KeyRound className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            새 비밀번호 설정
          </h1>
          <p className="text-blue-200/70 text-sm mt-2 font-medium">
            보안을 위해 비밀번호를 변경해 주세요
          </p>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
          <ShieldAlert className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">최초 로그인 비밀번호 변경</p>
            <p className="text-xs text-amber-200/60 mt-1 leading-relaxed">
              현재 임시 비밀번호로 로그인되어 있습니다. 시스템을 이용하려면 새로운 비밀번호를 설정해야 합니다.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="newPassword" className="text-sm font-semibold text-blue-200/80">
                새 비밀번호
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호를 입력하세요"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.08] border border-white/[0.12] text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/40 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Validation checklist */}
              {newPassword.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {validations.map((v) => (
                    <div
                      key={v.label}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        v.valid ? "text-emerald-400" : "text-white/30"
                      }`}
                    >
                      {v.valid ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      {v.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-blue-200/80">
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  disabled={isLoading}
                  className={`w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.08] border text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-emerald-500/40 focus:ring-emerald-400/60"
                        : "border-red-500/40 focus:ring-red-400/60"
                      : "border-white/[0.12] focus:ring-amber-400/60"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p className={`text-xs font-medium flex items-center gap-1 ${
                  passwordsMatch ? "text-emerald-400" : "text-red-400"
                }`}>
                  {passwordsMatch ? (
                    <><Check className="w-3.5 h-3.5" /> 비밀번호가 일치합니다</>
                  ) : (
                    <><X className="w-3.5 h-3.5" /> 비밀번호가 일치하지 않습니다</>
                  )}
                </p>
              )}
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
              disabled={isLoading || !allValid || !passwordsMatch}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/35 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-amber-500 disabled:hover:to-amber-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  변경 중...
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  비밀번호 변경하기
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-blue-200/30 mt-6 font-medium">
          © 2026 여주 체험버스. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
