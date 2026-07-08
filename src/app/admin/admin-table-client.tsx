"use client";

import { useState, useTransition } from "react";
import { toggleReportSubmitted, approveRequest } from "./actions";
import { deleteBusRequest } from "../actions/bus-requests";
import { CheckCircle2, Clock, Loader2, Info, Trash2, Printer, Bus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  report_data?: any;
}

interface Props {
  requests: BusRequestWithSchool[];
}

export default function AdminTableClient({ requests }: Props) {
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [contractCosts, setContractCosts] = useState<Record<number, string>>({});
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "SETTLEMENT">("ALL");
  const router = useRouter();

  const handleToggleReport = (id: number, isCurrentlyChecked: boolean) => {
    const isSubmitted = !isCurrentlyChecked;
    setLoadingId(id);
    startTransition(async () => {
      const result = await toggleReportSubmitted(id, isSubmitted);
      setLoadingId(null);
      if (!result.success) alert(result.error);
    });
  };

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

  const pendingCount = requests.filter((r) => r.status.includes("대기")).length;
  const settlementCount = requests.filter((r) => r.report_data?.admin_checked).length;
  const matchedCount = requests.filter((r) => (r.status === "승인" || r.status.includes("매칭")) && !r.report_data?.admin_checked).length;
  const totalRuns = requests.filter((r) => r.status === "승인" || r.status.includes("매칭")).length;

  const filteredRequests = requests.filter(req => {
    if (filterStatus === "PENDING") return req.status.includes("대기");
    if (filterStatus === "APPROVED") return (req.status === "승인" || req.status.includes("매칭")) && !req.report_data?.admin_checked;
    if (filterStatus === "SETTLEMENT") return req.report_data?.admin_checked;
    return true;
  });

  return (
    <div>
      {/* 4가지 주요 접수 통계 현황 */}
      <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilterStatus(filterStatus === "PENDING" ? "ALL" : "PENDING")}
          className={`bg-white border p-5 rounded-xl flex items-center gap-4 transition-all hover:shadow-md cursor-pointer ${filterStatus === "PENDING" ? "border-amber-500 ring-2 ring-amber-200" : "border-slate-200/60"}`}
        >
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">신청 대기</span>
            <span className="text-2xl font-bold text-slate-800">{pendingCount}<span className="text-xs font-normal ml-0.5">건</span></span>
          </div>
        </div>
        <div 
          onClick={() => setFilterStatus(filterStatus === "APPROVED" ? "ALL" : "APPROVED")}
          className={`bg-white border p-5 rounded-xl flex items-center gap-4 transition-all hover:shadow-md cursor-pointer ${filterStatus === "APPROVED" ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200/60"}`}
        >
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">매칭 완료</span>
            <span className="text-2xl font-bold text-slate-800">{matchedCount}<span className="text-xs font-normal ml-0.5">건</span></span>
          </div>
        </div>
        <div 
          onClick={() => setFilterStatus(filterStatus === "SETTLEMENT" ? "ALL" : "SETTLEMENT")}
          className={`bg-white border p-5 rounded-xl flex items-center gap-4 transition-all hover:shadow-md cursor-pointer ${filterStatus === "SETTLEMENT" ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-200/60"}`}
        >
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">완수검사조서 제출 완료</span>
            <span className="text-2xl font-bold text-slate-800">{settlementCount}<span className="text-xs font-normal ml-0.5">건</span></span>
          </div>
        </div>
        <div 
          onClick={() => setFilterStatus("ALL")}
          className={`bg-white border p-5 rounded-xl flex items-center gap-4 transition-all hover:shadow-md cursor-pointer ${filterStatus === "ALL" ? "border-emerald-500 ring-2 ring-emerald-200" : "border-slate-200/60"}`}
        >
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">누적 운행 (전체)</span>
            <span className="text-2xl font-bold text-slate-800">{requests.length}<span className="text-xs font-normal ml-0.5">건</span></span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Bus className="w-5 h-5 text-indigo-600" />
          관내 학교 버스 신청 내역
        </h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 text-xs font-bold shadow-sm">
            전체 {filteredRequests.length}건
          </span>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Info className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">조건에 맞는 신청 내역이 없습니다</h3>
          <p className="text-slate-500 text-sm">목록이 비어 있습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center break-keep">
          <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-600 font-semibold">
            <tr>
              <th className="px-3 py-4 min-w-[100px]">신청일자</th>
              <th className="px-3 py-4 min-w-[140px]">학교/담당자</th>
              <th className="px-3 py-4 min-w-[160px]">이용내용</th>
              <th className="px-3 py-4 min-w-[180px]">출발지 → 목적지</th>
              <th className="px-3 py-4 min-w-[90px]">탑승 인원</th>
              <th className="px-3 py-4 min-w-[80px]">버스 규격</th>
              <th className="px-3 py-4 min-w-[100px]">상태</th>
              <th className="px-3 py-4 min-w-[220px]">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRequests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-3 py-4 font-medium text-slate-700">
                  {new Date(req.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 whitespace-nowrap">
                        {req.schools?.school_name || "알 수 없음"}
                      </span>
                      {req.privacy_consent && (
                        <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap" title="개인정보 제공 동의 완료">
                          동의
                        </span>
                      )}
                    </div>
                    {(req.applicant_name || req.applicant_phone) && (
                      <div className="text-xs text-slate-500 whitespace-nowrap">
                        {req.applicant_name || "미입력"} {req.applicant_phone ? `(${req.applicant_phone})` : ""}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-4 text-slate-700">
                  <div className="line-clamp-2" title={req.usage_purpose || ""}>
                    {req.usage_purpose || "내용 없음"}
                  </div>
                </td>
                <td className="px-3 py-4 text-xs">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-slate-400">출발: {req.departure}</span>
                    <span className="font-medium text-slate-700">도착: {req.destination}</span>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-col items-center justify-center font-bold text-slate-800">
                    <span className="text-sm whitespace-nowrap">{req.teacher_count + req.student_count}명</span>
                    <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                      (교사 {req.teacher_count}, 학생 {req.student_count})
                    </span>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <span className="inline-flex items-center justify-center px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md whitespace-nowrap">
                    {req.bus_type}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center justify-center">
                  {req.status === "승인" ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${req.report_data?.admin_checked ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                      {req.report_data?.admin_checked ? <FileText className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {req.report_data?.admin_checked ? "완수검사조서 제출 완료" : "승인 완료"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                      <Clock className="w-3.5 h-3.5" />
                      {req.status}
                    </span>
                  )}
                  </div>
                </td>
                <td className="px-3 py-4 text-center">
                  {req.status === "승인" ? (
                    <div className="flex flex-col items-center gap-2">
                      {/* 완수검사조서 제출 체크박스 */}
                      <label className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors w-full">
                        <input
                          type="checkbox"
                          checked={req.report_data?.admin_checked || false}
                          onChange={() => handleToggleReport(req.id, req.report_data?.admin_checked || false)}
                          disabled={loadingId === req.id}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50 cursor-pointer"
                        />
                        완수검사조서 제출
                      </label>
                      <span className="text-xs font-bold text-slate-600">
                        계약: {req.contracted_cost?.toLocaleString()}원
                      </span>
                      <div className="flex flex-col gap-2 w-full mt-2">
                        <Link
                          href={`/admin/report/${req.id}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors border border-indigo-100"
                        >
                          <Info className="w-3.5 h-3.5" />
                          완수검사조서 작성
                        </Link>
                        <div className="flex w-full gap-2">
                          <Link
                            href={`/admin/print/${req.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors border border-blue-100"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            신청내역 출력
                          </Link>
                          <button
                            onClick={() => handleDelete(req.id)}
                            disabled={deletingId === req.id || loadingId === req.id}
                            className="shrink-0 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors disabled:opacity-50 border border-red-100"
                            title="신청 내역 삭제"
                          >
                            {deletingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            삭제
                          </button>
                        </div>
                      </div>
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
                      <div className="flex flex-col gap-2 w-full mt-2">
                        <Link
                          href={`/admin/report/${req.id}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors border border-indigo-100"
                        >
                          <Info className="w-3.5 h-3.5" />
                          완수검사조서 작성
                        </Link>
                        <div className="flex w-full gap-2">
                          <Link
                            href={`/admin/print/${req.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] sm:text-xs font-bold transition-colors border border-blue-100"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            신청내역 출력
                          </Link>
                          <button
                            onClick={() => handleDelete(req.id)}
                            disabled={deletingId === req.id || loadingId === req.id}
                            className="shrink-0 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors disabled:opacity-50 border border-red-100"
                            title="신청 내역 삭제"
                          >
                            {deletingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      )}
    </div>
  );
}
