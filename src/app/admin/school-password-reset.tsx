"use client";
import { useState } from "react";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";

export default function SchoolPasswordReset({ schools }: { schools: { id: number, school_name: string }[] }) {
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    if (!selectedSchoolId) return;
    if (!confirm("해당 학교의 비밀번호를 초기화하시겠습니까? (초기 비밀번호: yeoju2026!)")) return;

    setIsLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId: Number(selectedSchoolId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage("비밀번호가 성공적으로 초기화되었습니다.");
    } catch (e: any) {
      alert(e.message || "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/60 p-6 rounded-xl shadow-sm mb-8">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
        <KeyRound className="w-5 h-5 text-indigo-600" />
        학교 비밀번호 초기화
      </h3>
      <div className="flex items-center gap-3">
        <select
          value={selectedSchoolId}
          onChange={(e) => setSelectedSchoolId(e.target.value)}
          className="flex-1 px-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900"
        >
          <option value="">학교 선택 (비밀번호를 초기화할 학교를 선택하세요)</option>
          {schools?.map((s) => (
            <option key={s.id} value={s.id}>{s.school_name} (ID: {s.school_name})</option>
          ))}
        </select>
        <button
          onClick={handleReset}
          disabled={!selectedSchoolId || isLoading}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "초기화 실행"}
        </button>
      </div>
      {message && (
        <p className="mt-4 text-sm text-emerald-600 font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </p>
      )}
    </div>
  );
}
