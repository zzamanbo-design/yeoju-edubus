"use client";

import { useRouter } from "next/navigation";
import {
  Bus,
  Calendar,
  ShieldCheck,
  MapPin,
  Users,
  ChevronRight,
  Plus,
  FileText,
  Printer,
  ArrowRight,
  LogIn,
  Edit3,
  CheckCircle2,
  ClipboardCheck,
  Calculator,
  AlertCircle,
  Clock
} from "lucide-react";
import Link from "next/link";

interface SessionUser {
  accountId: number;
  schoolId: number | null;
  schoolName: string;
  schoolLevel?: string | null;
  role: "school" | "admin";
  passwordChanged: boolean;
}

interface BusRequest {
  id: number;
  destination: string;
  usage_purpose: string;
  teacher_count: number;
  student_count: number;
  trip_date: string;
  bus_type: string;
  status: string;
  created_at: string;
  report_data?: any;
}

interface BudgetInfo {
  usedCount: number;
  availableCount: number;
}

export default function DashboardClient({ 
  session, 
  recentRequests = [],
  budgetInfo = { usedCount: 0, availableCount: 0 }
}: { 
  session: SessionUser;
  recentRequests?: any[];
  budgetInfo?: BudgetInfo;
}) {
  const router = useRouter();

  const pendingCount = recentRequests.filter((r) => r.status.includes("대기")).length;
  const settlementCount = recentRequests.filter((r) => r.report_data?.admin_checked).length;
  const matchedCount = recentRequests.filter((r) => (r.status === "승인" || r.status.includes("매칭")) && !r.report_data?.admin_checked).length;
  const totalRuns = recentRequests.filter((r) => r.status === "승인" || r.status.includes("매칭")).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Welcome Banner Card */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground p-8 md:p-10 shadow-xl shadow-primary/10">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
            <Bus className="w-96 h-96" />
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl flex flex-col gap-4">
              <span className="inline-flex self-start items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-secondary text-secondary-foreground shadow-sm">
                ✨ 2026학년도 체험학습 접수 중
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                여주 관내 학교들의<br className="sm:hidden" /> 안전한 체험학습 이동을 지원합니다.
              </h1>
              <p className="text-primary-foreground/90 text-base md:text-lg font-medium leading-relaxed">
                체험버스를 신청하고, 매칭 현황을 실시간으로 확인하며, 체험학습 종료 후 운행 보고까지 원스톱으로 편리하게 진행하세요.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => router.push("/apply")}
                  className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-bold px-8 py-4 rounded-xl text-lg shadow-md hover:bg-secondary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" />
                  여주 체험버스 신청
                </button>
              </div>
            </div>

            {/* 4가지 주요 접수 통계 현황 */}
            <div className="flex-shrink-0 grid grid-cols-2 gap-3 w-full max-w-sm">
              <div className="bg-white border border-slate-200/60 p-4 rounded-xl flex items-center gap-3 transition-all hover:shadow-md">
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">신청 대기</span>
                  <span className="text-xl font-bold text-slate-800">{pendingCount}<span className="text-[10px] font-normal ml-0.5">건</span></span>
                </div>
              </div>
              <div className="bg-white border border-slate-200/60 p-4 rounded-xl flex items-center gap-3 transition-all hover:shadow-md">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">매칭 완료</span>
                  <span className="text-xl font-bold text-slate-800">{matchedCount}<span className="text-[10px] font-normal ml-0.5">건</span></span>
                </div>
              </div>
              <div className="bg-white border border-slate-200/60 p-4 rounded-xl flex items-center gap-3 transition-all hover:shadow-md">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium flex flex-col leading-tight"><span>완수검사조서</span><span>제출 완료</span></span>
                  <span className="text-xl font-bold text-slate-800">{settlementCount}<span className="text-[10px] font-normal ml-0.5">건</span></span>
                </div>
              </div>
              <div className="bg-white border border-slate-200/60 p-4 rounded-xl flex items-center gap-3 transition-all hover:shadow-md">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium flex flex-col leading-tight"><span>누적 운행</span><span>(전체)</span></span>
                  <span className="text-xl font-bold text-slate-800">{totalRuns}<span className="text-[10px] font-normal ml-0.5">건</span></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 체험학습 지원 가이드 (Moved from sidebar) */}
        <section className="bg-card border border-border rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center shadow-sm">
          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 text-secondary">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">체험학습 지원 가이드</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              체험버스는 여주 관내 학교의 안전한 창의적 체험활동 지원을 위해 운영됩니다. 신청 전 아래 규정을 필독해 주세요.
            </p>
            <ul className="flex flex-col gap-3 text-sm font-medium">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-secondary shrink-0"></span>
                <span>체험학습 시행 전 최소 3주 전 웹페이지로 버스 신청</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-secondary shrink-0"></span>
                <span>체험학습 종료 후 완수검사조서 출력하여 서명 및 학교 관리자 결재 후 스캔하여 파일 제출</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-secondary shrink-0"></span>
                <span>제출은 GOE 메신저(GOE 메신저 종료 후 Britly 메신저)로 여주교육지원청 교육과 이수민 주무관에게 쪽지로 제출</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-secondary shrink-0"></span>
                <span className="text-amber-600 font-semibold break-keep">승인 전 취소는 웹페이지에서 가능하며, 승인 이후 웹페이지에서 취소가 불가능하니 담당 주무관에게 연락하여 취소하세요.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 체험버스 신청 단계 */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
              <ArrowRight className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold">신청부터 정산까지, 6단계면 끝</h2>
            <div className="ml-auto flex items-center gap-4 text-sm font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>학교</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-700"></span>지원청</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            
            {/* 1 */}
            <div className="relative bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-t-blue-600 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className="text-3xl font-serif font-bold text-blue-200">01</span>
                <LogIn className="w-5 h-5 text-blue-600" />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold w-max mb-3">학교</span>
              <h3 className="font-bold text-slate-800 mb-2">플랫폼 로그인</h3>
              <p className="text-sm text-slate-600 mb-4 flex-grow break-keep">발급받은 학교 계정으로 로그인합니다.</p>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <span className="font-bold text-blue-800 w-12 shrink-0">ID</span>
                  <span className="text-slate-600">학교명<br/>(##초등학교)</span>
                </div>
                <div className="flex gap-2 items-center mt-1">
                  <span className="font-bold text-blue-800 w-12 shrink-0">임시 PW</span>
                  <span className="text-slate-600">yeoju2026!</span>
                </div>
              </div>
              <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 z-10" />
            </div>

            {/* 2 */}
            <div className="relative bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-t-blue-600 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className="text-3xl font-serif font-bold text-blue-200">02</span>
                <Edit3 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold w-max mb-3">학교</span>
              <h3 className="font-bold text-slate-800 mb-2">신청서 작성</h3>
              <p className="text-sm text-slate-600 mb-4 flex-grow break-keep">날짜·인원·행선지를 입력해 체험버스 신청서를 제출합니다.</p>
              <div className="bg-amber-50 rounded-md p-2.5 text-xs text-amber-800 flex items-start gap-1.5 font-medium mt-auto border border-amber-200/50 break-keep">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                계약을 위해 최소 3주 전 신청
              </div>
              <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 z-10" />
            </div>

            {/* 3 */}
            <div className="relative bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-t-amber-700 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className="text-3xl font-serif font-bold text-amber-200">03</span>
                <CheckCircle2 className="w-5 h-5 text-amber-700" />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold w-max mb-3">지원청</span>
              <h3 className="font-bold text-slate-800 mb-2">확인 및 승인</h3>
              <p className="text-sm text-slate-600 flex-grow break-keep">지원청이 신청 내역을 확인하고 승인합니다.</p>
              <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 z-10" />
            </div>

            {/* 4 */}
            <div className="relative bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-t-amber-700 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className="text-3xl font-serif font-bold text-amber-200">04</span>
                <ClipboardCheck className="w-5 h-5 text-amber-700" />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold w-max mb-3">지원청</span>
              <h3 className="font-bold text-slate-800 mb-2">완수검사조서 작성</h3>
              <p className="text-sm text-slate-600 flex-grow break-keep mb-3">계약 이행 확인을 위한 완수검사조서를 작성합니다.</p>
              <div className="bg-amber-50 rounded-md p-2 text-[11px] text-amber-800 flex items-start gap-1 font-medium mt-auto border border-amber-200/50 break-keep">
                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5 text-amber-600" />
                완수검사조서는 체험버스 이용 2-3일 전 확인 가능하며 늦어질 수 있습니다.
              </div>
              <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 z-10" />
            </div>

            {/* 5 */}
            <div className="relative bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-t-blue-600 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className="text-3xl font-serif font-bold text-blue-200">05</span>
                <Printer className="w-5 h-5 text-blue-600" />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold w-max mb-3">학교</span>
              <h3 className="font-bold text-slate-800 mb-2">운영 후 조서 출력</h3>
              <p className="text-sm text-slate-600 mb-4 flex-grow break-keep">체험학습을 운영하고 완수검사조서를 출력해 제출합니다.</p>
              
              <div className="bg-blue-50/50 rounded-md p-2.5 text-xs text-blue-800 flex items-start gap-1.5 font-medium mt-auto border border-blue-100 break-keep">
                <span className="leading-snug">
                  <strong className="font-bold">제출:</strong> 여주교육지원청 교육과 이수민 주무관<br/>
                  <span className="text-[10px] text-blue-600/80">(GOE 메신저 또는 Britly 메신저)</span>
                </span>
              </div>
              
              <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 z-10" />
            </div>

            {/* 6 */}
            <div className="relative bg-[#2f5597] border border-[#2f5597] rounded-xl p-5 shadow-sm flex flex-col h-full text-white">
              <div className="flex justify-between items-start mb-3">
                <span className="text-3xl font-serif font-bold text-blue-300/40">06</span>
                <Calculator className="w-5 h-5 text-amber-400" />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#dca43b] text-[#1e3a8a] text-[11px] font-bold w-max mb-3">지원청</span>
              <h3 className="font-bold mb-2 text-white">정산 완료</h3>
              <p className="text-sm text-blue-100/90 flex-grow leading-relaxed break-keep">완수검사조서를 바탕으로 지원청이 정산을 마무리합니다.</p>
            </div>

          </div>
        </section>

        {/* Dashboard Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List: Applications */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                최근 신청 및 운행 내역
              </h2>
              <button 
                onClick={() => router.push(session.role === "admin" ? "/admin" : "/history")}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                전체보기
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {recentRequests.length === 0 ? (
                <div className="bg-card border border-border p-12 rounded-xl flex flex-col items-center justify-center text-center">
                  <FileText className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-semibold text-slate-700">신청 내역이 없습니다</p>
                  <p className="text-xs text-muted-foreground mt-1">상단의 신청 버튼을 눌러 체험버스를 신청해 보세요.</p>
                </div>
              ) : (
                recentRequests.map((req) => (
                  <div key={req.id} className="bg-card border border-border p-5 rounded-xl hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                        <Bus className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                          {session.role === "admin" && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-md">
                              {req.schools?.school_name || "알 수 없음"}
                            </span>
                          )}
                          {req.destination}
                        </h3>
                        <p className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-1 mt-1">
                          <span className="inline-flex items-center gap-0.5">
                            <Users className="w-3.5 h-3.5" /> 
                            {req.usage_purpose || "탑승 인원"} (총 {req.teacher_count + req.student_count}명)
                          </span>
                          <span className="inline-flex items-center gap-0.5">
                            <Calendar className="w-3.5 h-3.5" /> 
                            {req.trip_date}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                      <div className="flex items-center gap-2">
                        {session.role === "admin" ? (
                          <Link
                            href={`/admin/report/${req.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition-colors shadow-sm"
                          >
                            <Printer className="w-3 h-3" />
                            완수검사조서
                          </Link>
                        ) : req.report_data ? (
                          <Link
                            href={`/apply/report/${req.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition-colors shadow-sm"
                          >
                            <Printer className="w-3 h-3" />
                            완수검사조서
                          </Link>
                        ) : (
                          <button
                            onClick={() => alert("담당 주무관이 계약 작업중입니다.")}
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs font-bold transition-colors shadow-sm"
                          >
                            <Printer className="w-3 h-3" />
                            완수검사조서
                          </button>
                        )}
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                          {req.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{req.bus_type}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar: Info & Actions */}
          <div className="flex flex-col gap-6">
            {/* Support Desk Card */}
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" />
                여주교육지원청 공유학교팀
              </h3>
              <div className="text-sm flex flex-col gap-3 text-muted-foreground">
                <div>
                  <span className="block font-bold text-foreground text-xs mb-1">장학사 정지범 (031-880-2332)</span>
                  <span className="block font-bold text-foreground text-xs mb-1">주무관 이수민 (031-880-2331)</span>
                </div>
                <div>
                  <span className="block font-bold text-foreground text-xs mb-1">이메일</span>
                  <p className="text-xs">zamanbo@korea.kr (장학사 정지범)<br/>leesumin5643@korea.kr (주무관 이수민)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 여주 체험버스 (Yeoju EduBus). All Rights Reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">개인정보처리방침</a>
            <a href="#" className="hover:underline">이용약관</a>
            <a href="#" className="hover:underline">시스템 문의</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
