"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Clock, Printer, FileText, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { deleteBusRequest } from "../actions/bus-requests";

interface RequestHistory {
  id: number;
  trip_date: string;
  destination: string;
  bus_type: string;
  status: string;
  created_at: string;
  usage_purpose: string;
}

interface Props {
  requests: RequestHistory[];
}

export default function HistoryTable({ requests }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    if (!confirm("신청을 취소하시겠습니까? 취소된 내역은 복구할 수 없습니다.")) {
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center flex flex-col items-center mt-12 max-w-3xl mx-auto">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">신청 내역이 없습니다</h3>
        <p className="text-slate-500 text-sm">에듀버스를 신청하시면 이곳에서 진행 상황을 확인할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          우리 학교 신청 현황
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-4">신청일자</th>
                <th className="px-6 py-4">이용내용</th>
                <th className="px-6 py-4">도착지</th>
                <th className="px-6 py-4 text-center">버스 규격</th>
                <th className="px-6 py-4 text-center">상태</th>
                <th className="px-6 py-4 text-center">결과 보고서 출력</th>
                <th className="px-6 py-4 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {new Date(req.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {req.usage_purpose || "내용 없음"}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {req.destination}
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
                    <Link
                      href={`/apply/print/${req.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 text-xs font-bold transition-colors shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      결과 보고서 출력
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(req.id)}
                      disabled={deletingId === req.id}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors disabled:opacity-50"
                      title="신청 취소"
                    >
                      {deletingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      취소
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
