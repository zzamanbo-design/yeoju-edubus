import { getSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { ShieldCheck, Bus, Calculator, CheckCircle2, TrendingDown, Clock, FileText } from "lucide-react";
import AdminTableClient, { BusRequestWithSchool } from "./admin-table-client";
import SchoolPasswordReset from "./school-password-reset";

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/");
  }
  if (!session.passwordChanged) {
    redirect("/update-password");
  }

  const supabase = createServerClient();

  // 전체 신청 내역 조회 (최신순)
  const { data: requests, error } = await supabase
    .from("bus_requests")
    .select(`
      id,
      request_date,
      departure,
      destination,
      departure_time,
      return_time,
      teacher_count,
      student_count,
      bus_type,
      status,
      created_at,
      contracted_cost,
      applicant_name,
      applicant_phone,
      usage_purpose,
      official_doc_number,
      schools(school_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("버스 신청 내역 조회 실패:", error);
  }

  const safeRequests = (requests as unknown as BusRequestWithSchool[]) || [];

  // 전체 학교 목록 조회 (비밀번호 초기화용)
  const { data: schoolsData } = await supabase
    .from("schools")
    .select("id, school_name")
    .order("school_name");

  // 예산 계산 로직
  const TOTAL_BUDGET = 50_000_000;

  // 상태가 '승인'인 내역들의 contracted_cost 합산
  const approvedRequests = safeRequests.filter((r) => r.status === "승인");
  const approvedCount = approvedRequests.length;
  const usedBudget = approvedRequests.reduce((sum, req) => sum + (req.contracted_cost || 0), 0);
  
  const remainingBudget = TOTAL_BUDGET - usedBudget;
  const usagePercentage = Math.min((usedBudget / TOTAL_BUDGET) * 100, 100);

  // 학교에서 이관된 4가지 주요 통계 계산
  const pendingCount = safeRequests.filter((r) => r.status.includes("대기")).length;
  const matchedCount = safeRequests.filter((r) => r.status === "승인" || r.status.includes("매칭")).length;
  const settlementCount = safeRequests.filter((r) => r.status.includes("정산")).length;
  // 임시로 승인/정산된 건을 누적 운행으로 계산 (실제로는 운행 완료된 건수)
  const totalRuns = safeRequests.filter((r) => r.status === "승인" || r.status.includes("정산")).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* 예산 대시보드 (Budget Tracking) */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            실시간 예산 현황
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 총 예산 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
              <p className="text-sm font-semibold text-slate-500 relative z-10">총 배정 예산</p>
              <p className="text-3xl font-extrabold text-slate-800 mt-2 relative z-10">
                {TOTAL_BUDGET.toLocaleString()} <span className="text-lg text-slate-500 font-bold">원</span>
              </p>
            </div>

            {/* 사용 금액 (배정 완료) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <p className="text-sm font-semibold text-slate-500">승인 완료 금액</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs font-bold">
                  <CheckCircle2 className="w-3 h-3" /> {approvedCount}대
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-800 relative z-10">
                {usedBudget.toLocaleString()} <span className="text-lg text-slate-500 font-bold">원</span>
              </p>
            </div>

            {/* 남은 잔액 */}
            <div className="bg-slate-800 rounded-2xl p-6 shadow-md relative overflow-hidden group border border-slate-700">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
              <p className="text-sm font-semibold text-blue-300 relative z-10">남은 예산 잔액</p>
              <p className="text-3xl font-extrabold text-white mt-2 relative z-10">
                {remainingBudget.toLocaleString()} <span className="text-lg text-blue-300 font-bold">원</span>
              </p>
              <div className="mt-4 h-2 w-full bg-slate-700 rounded-full overflow-hidden relative z-10">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4가지 주요 접수 통계 현황 */}
        <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/60 p-5 rounded-xl flex items-center gap-4 transition-all hover:shadow-md">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">신청 대기</span>
              <span className="text-2xl font-bold text-slate-800">{pendingCount}<span className="text-xs font-normal ml-0.5">건</span></span>
            </div>
          </div>
          <div className="bg-white border border-slate-200/60 p-5 rounded-xl flex items-center gap-4 transition-all hover:shadow-md">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">매칭 완료</span>
              <span className="text-2xl font-bold text-slate-800">{matchedCount}<span className="text-xs font-normal ml-0.5">건</span></span>
            </div>
          </div>
          <div className="bg-white border border-slate-200/60 p-5 rounded-xl flex items-center gap-4 transition-all hover:shadow-md">
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">정산 요청</span>
              <span className="text-2xl font-bold text-slate-800">{settlementCount}<span className="text-xs font-normal ml-0.5">건</span></span>
            </div>
          </div>
          <div className="bg-white border border-slate-200/60 p-5 rounded-xl flex items-center gap-4 transition-all hover:shadow-md">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">누적 운행</span>
              <span className="text-2xl font-bold text-slate-800">{totalRuns}<span className="text-xs font-normal ml-0.5">회</span></span>
            </div>
          </div>
        </div>

        {/* 학교 비밀번호 초기화 */}
        <SchoolPasswordReset schools={schoolsData || []} />

        {/* 버스 신청 내역 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Bus className="w-5 h-5 text-indigo-600" />
              관내 학교 버스 신청 내역
            </h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 text-xs font-bold shadow-sm">
                전체 {safeRequests.length}건
              </span>
            </div>
          </div>
          
          <AdminTableClient requests={safeRequests} />
        </div>
      </main>
    </div>
  );
}
