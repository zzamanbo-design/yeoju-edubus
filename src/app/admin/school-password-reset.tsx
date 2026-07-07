"use client";
import { useState } from "react";
import { Loader2, KeyRound, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

export default function SchoolPasswordReset({ schools }: { schools: { id: number, school_name: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleToggleSchool = (id: number) => {
    setSelectedSchoolIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSchoolIds.length === schools.length) {
      setSelectedSchoolIds([]);
    } else {
      setSelectedSchoolIds(schools.map((s) => s.id));
    }
  };

  const handleReset = async () => {
    if (selectedSchoolIds.length === 0) return;
    if (!confirm(`선택한 ${selectedSchoolIds.length}개 기관의 비밀번호를 초기화하시겠습니까?\n(초기 비밀번호: yeoju2026!)`)) return;

    setIsLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolIds: selectedSchoolIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message || "비밀번호가 성공적으로 초기화되었습니다.");
      setSelectedSchoolIds([]); // 초기화 성공 시 선택 해제
      setIsOpen(false); // 닫기
    } catch (e: any) {
      alert(e.message || "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm mb-8 overflow-hidden">
      <div 
        className="p-6 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-600" />
          학교 비밀번호 초기화
        </h3>
        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {isOpen && (
        <div className="px-6 pb-6 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500 font-medium">초기화할 기관을 선택하세요.</p>
            <button 
              onClick={handleSelectAll}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-md"
            >
              {selectedSchoolIds.length === schools.length ? "전체 해제" : "전체 선택"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1 mb-6">
            {schools?.map((s) => (
              <label 
                key={s.id} 
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  selectedSchoolIds.includes(s.id) 
                    ? "bg-indigo-50 border-indigo-200 text-indigo-800" 
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSchoolIds.includes(s.id)}
                  onChange={() => handleToggleSchool(s.id)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-sm font-medium leading-none">{s.school_name}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-sm">
              선택된 기관: <span className="font-bold text-indigo-600">{selectedSchoolIds.length}</span>개
            </div>
            <button
              onClick={handleReset}
              disabled={selectedSchoolIds.length === 0 || isLoading}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "선택 기관 초기화 실행"}
            </button>
          </div>
        </div>
      )}

      {message && !isOpen && (
        <div className="px-6 pb-6 pt-0">
          <p className="text-sm text-emerald-600 font-bold flex items-center gap-1.5 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </p>
        </div>
      )}
    </div>
  );
}
