"use client";

import { useState, useTransition } from "react";
import { approveRequest } from "./actions";
import { deleteBusRequest } from "../actions/bus-requests";
import { CheckCircle2, Clock, Loader2, Info, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export interface BusRequestWithSchool {
  id: number;
  request_date: string;
  departure: string;
  departure_time: string | null;
  destination: string;
  return_time: string | null;
  teacher_count: number;
  student_count: number;
  bus_type: string;
  status: string;
  created_at: string;
  applicant_name: string | null;
  applicant_phone: string | null;
  usage_purpose: string | null;
  official_doc_number: string | null;
  privacy_consent: boolean;
  schools: {
    school_name: string;
  } | null;
  contracted_cost: number;
}

interface Props {
  requests: BusRequestWithSchool[];
}

export default function AdminTableClient({ requests }: Props) {
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [contractCosts, setContractCosts] = useState<Record<number, string>>({});
  const router = useRouter();

  const handleCostChange = (id: number, value: string) => {
    // 숫자만 입력 가능하도록 정규식 처리
    const numericValue = value.replace(/[^0-9]/g, "");
    setContractCosts((prev) => ({ ...prev, [id]: numericValue }));
  };

  const handleApprove = (id: number) => {
    const costValue = contractCosts[id] || "500000"; // 기본값 50만원
    const cost = parseInt(costValue, 10);
    
    if (isNaN(cost) || cost < 0) {
      alert("올바른 계약 금액을 입력해 주세요.");
      return;
    }

    if (!confirm(`이 신청을 ${cost.toLocaleString()}원으로 승인하시겠습니까? 승인 시 예산이 즉시 차감됩니다.`)) {
      return;
    }

    setLoadingId(id);
    startTransition(async () => {
      const result = await approveRequest(id, cost);
      setLoadingId(null);
      
      if (!result.success) {
        alert(result.error);
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("정말 삭제하시겠습니까? 삭제된 내역은 복구할 수 없습니다.")) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteBusRequest(id);
      setDeletingId(null);
      
      if (!result.success) {
        alert(result.error);
      }
    });
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Info className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">접수된 신청 내역이 없습니다</h3>
        <p className="text-slate-500 text-sm">관내 학교에서 접수한 버스 신청 내역이 이곳에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-600 font-semibold">
            <tr>
              <th className="px-6 py-4">신청일자</th>
              <th className="px-6 py-4">학교/담당자</th>
              <th className="px-6 py-4">이용내용</th>
              <th className="px-6 py-4">출발지 → 목적지</th>
              <th className="px-6 py-4 text-center">탑승 인원</th>
              <th className="px-6 py-4 text-center">버스 규격</th>
              <th className="px-6 py-4 text-center">상태</th>
              <th className="px-6 py-4 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-700">
                  {new Date(req.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {req.schools?.school_name || "알 수 없음"}
                    </span>
                    {req.privacy_consent && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700" title="개인정보 제공 동의 완료">
                        동의
                      </span>
                    )}
                  </div>
                  {(req.applicant_name || req.applicant_phone) && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {req.applicant_name || "미입력"} {req.applicant_phone ? `(${req.applicant_phone})` : ""}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-700 line-clamp-2 max-w-[150px]" title={req.usage_purpose || ""}>
                    {req.usage_purpose || "내용 없음"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 mb-0.5">출발: {req.departure}</span>
                    <span className="font-medium text-slate-700">도착: {req.destination}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-medium text-slate-700">
                  {req.teacher_count + req.student_count}명
                  <span className="block text-xs text-slate-400 font-normal">
                    (교사 {req.teacher_count}, 학생 {req.student_count})
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                    {req.bus_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {req.status === "승인" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      승인 완료
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                      <Clock className="w-3.5 h-3.5" />
                      {req.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {req.status === "승인" ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">
                        계약: {req.contracted_cost?.toLocaleString()}원
                      </span>
                      <button
                        onClick={() => handleDelete(req.id)}
                        disabled={deletingId === req.id || loadingId === req.id}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors disabled:opacity-50 border border-red-100"
                        title="신청 내역 삭제"
                      >
                        {deletingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        삭제
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={contractCosts[req.id] ?? "500000"}
                            onChange={(e) => handleCostChange(req.id, e.target.value)}
                            className="w-24 px-2 py-1.5 text-right text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 font-medium text-slate-700"
                            placeholder="금액"
                          />
                          <span className="absolute right-3 top-1.5 text-xs text-slate-400">원</span>
                        </div>
                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={isPending || loadingId === req.id}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-slate-200 shrink-0"
                        >
                          {loadingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          승인
                        </button>
                      </div>
                      <button
                        onClick={() => handleDelete(req.id)}
                        disabled={deletingId === req.id || loadingId === req.id}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors disabled:opacity-50 border border-red-100"
                        title="신청 내역 삭제"
                      >
                        {deletingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        삭제
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
