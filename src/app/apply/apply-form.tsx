"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bus,
  Calendar,
  MapPin,
  MapPinned,
  Clock,
  Users,
  GraduationCap,
  Send,
  Loader2,
  CircleAlert,
  CheckCircle2,
  ArrowLeft,
  StickyNote,
  FileText,
  School,
} from "lucide-react";

interface SchoolItem {
  id: number;
  school_name: string;
  school_level: string;
}

interface Props {
  session: {
    schoolId: number | null;
    schoolName: string;
    role: "school" | "admin";
  };
  schools: SchoolItem[];
}

export default function ApplyForm({ session, schools }: Props) {
  const router = useRouter();

  // 폼 상태
  const [schoolId, setSchoolId] = useState<number>(session.schoolId ?? 0);
  const [tripDate, setTripDate] = useState("");
  const [departure, setDeparture] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [destination, setDestination] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [teacherCount, setTeacherCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [busType, setBusType] = useState<"중형" | "대형">("대형");
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [usagePurpose, setUsagePurpose] = useState("");
  const [officialDocNumber, setOfficialDocNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);

  // UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  // 최소 날짜: 오늘 + 21일 (3주)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 21);
  const minDate = tomorrow.toISOString().split("T")[0];

  // 토스트 표시 후 리다이렉트
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!schoolId) {
      setError("학교를 선택해 주세요.");
      return;
    }
    if (!applicantName.trim()) {
      setError("담당자 이름을 입력해 주세요.");
      return;
    }
    if (!applicantPhone.trim()) {
      setError("담당자 연락처를 입력해 주세요.");
      return;
    }
    if (!usagePurpose.trim()) {
      setError("이용내용을 입력해 주세요.");
      return;
    }
    if (!tripDate) {
      setError("희망 날짜를 선택해 주세요.");
      return;
    }
    if (!departure.trim()) {
      setError("출발지를 입력해 주세요.");
      return;
    }
    if (!destination.trim()) {
      setError("도착지를 입력해 주세요.");
      return;
    }
    if (teacherCount + studentCount === 0) {
      setError("탑승 인원(교사 또는 학생)을 1명 이상 입력해 주세요.");
      return;
    }

    if (!privacyConsent) {
      setError("개인정보 수집 및 이용에 동의해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/bus-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId,
          tripDate,
          departure: departure.trim(),
          destination: destination.trim(),
          departureTime: departureTime.trim(),
          returnTime: returnTime.trim(),
          teacherCount,
          studentCount,
          busType,
          notes: notes.trim(),
          applicantName: applicantName.trim(),
          applicantPhone: applicantPhone.trim(),
          usagePurpose: usagePurpose.trim(),
          officialDocNumber: officialDocNumber.trim(),
          privacyConsent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "버스 신청에 실패했습니다.");
        setIsLoading(false);
        return;
      }

      // 성공 토스트 표시
      setShowToast(true);
    } catch {
      setError("서버 연결에 실패했습니다. 네트워크 상태를 확인해 주세요.");
      setIsLoading(false);
    }
  }

  // 학교 레벨별 그룹핑
  const groupedSchools = {
    초: schools.filter((s) => s.school_level === "초"),
    중: schools.filter((s) => s.school_level === "중"),
    고: schools.filter((s) => s.school_level === "고"),
    기타: schools.filter((s) => s.school_level === "기타"),
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* 성공 토스트 */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-[slideDown_0.4s_ease-out]">
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-600 text-white shadow-2xl shadow-emerald-600/30 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            신청이 성공적으로 접수되었습니다!
          </div>
        </div>
      )}



      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Send className="w-6 h-6" />
            </div>
            신규 체험버스 신청
          </h1>
          <p className="text-sm text-muted-foreground mt-2 ml-[52px]">
            체험학습 버스 배차를 신청합니다. 모든 필수 항목을 정확히 입력해 주세요.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 학교명 */}
          <div className="bg-card border border-border rounded-xl p-6">
            <label
              htmlFor="school"
              className="text-sm font-bold text-foreground flex items-center gap-2 mb-3"
            >
              <School className="w-4 h-4 text-primary" />
              학교명 <span className="text-destructive">*</span>
            </label>
            {session.role === "admin" ? (
              <select
                id="school"
                value={schoolId}
                onChange={(e) => setSchoolId(Number(e.target.value))}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
              >
                <option value={0}>학교를 선택하세요</option>
                {Object.entries(groupedSchools).map(([level, list]) =>
                  list.length > 0 ? (
                    <optgroup key={level} label={level === "기타" ? "기타기관" : `${level}등학교`}>
                      {list.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.school_name}
                        </option>
                      ))}
                    </optgroup>
                  ) : null
                )}
              </select>
            ) : (
              <div className="w-full px-4 py-3 rounded-xl border border-input bg-muted text-foreground text-sm font-semibold">
                {session.schoolName}
              </div>
            )}
          </div>

          {/* 담당자 이름 + 연락처 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <label
                htmlFor="applicantName"
                className="text-sm font-bold text-foreground flex items-center gap-2 mb-3"
              >
                <Users className="w-4 h-4 text-primary" />
                담당자 이름 <span className="text-destructive">*</span>
              </label>
              <input
                id="applicantName"
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="예: 홍길동"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
              />
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <label
                htmlFor="applicantPhone"
                className="text-sm font-bold text-foreground flex items-center gap-2 mb-3"
              >
                <Users className="w-4 h-4 text-primary" />
                담당자 연락처 <span className="text-destructive">*</span>
              </label>
              <input
                id="applicantPhone"
                type="tel"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                placeholder="예: 010-1234-5678"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* 이용내용 */}
          <div className="bg-card border border-border rounded-xl p-6">
            <label
              htmlFor="usagePurpose"
              className="text-sm font-bold text-foreground flex items-center gap-2 mb-3"
            >
              <StickyNote className="w-4 h-4 text-primary" />
              이용내용 <span className="text-destructive">*</span>
            </label>
            <input
              id="usagePurpose"
              type="text"
              value={usagePurpose}
              onChange={(e) => setUsagePurpose(e.target.value)}
              placeholder="예: 같이학교 교육과정 운영"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>

          {/* 관련 공문번호 */}
          <div className="bg-card border border-border rounded-xl p-6">
            <label
              htmlFor="officialDocNumber"
              className="text-sm font-bold text-foreground flex items-center gap-2 mb-3"
            >
              <FileText className="w-4 h-4 text-primary" />
              관련 공문번호 <span className="text-destructive">*</span>
            </label>
            <input
              id="officialDocNumber"
              type="text"
              value={officialDocNumber}
              onChange={(e) => setOfficialDocNumber(e.target.value)}
              placeholder="예: oo초등학교-1234(2026.6.1.) - 체험학습과 관련된 내부기안 번호"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>

          {/* 희망 날짜 + 버스 규격 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <label
                htmlFor="tripDate"
                className="text-sm font-bold text-foreground flex items-center gap-2 mb-3"
              >
                <Calendar className="w-4 h-4 text-primary" />
                희망 날짜 <span className="text-xs font-normal text-muted-foreground ml-1 hidden sm:inline">(버스 계약을 위해 최소 3주 전 신청)</span> <span className="text-destructive">*</span>
              </label>
              <input
                id="tripDate"
                type="date"
                style={{ colorScheme: "dark" }}
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                min={minDate}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
              />
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                <Bus className="w-4 h-4 text-primary" />
                버스 규격 <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBusType("중형")}
                  disabled={isLoading}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    busType === "중형"
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                      : "border-input bg-background text-muted-foreground hover:border-primary/30"
                  } disabled:opacity-50`}
                >
                  🚐 중형
                  <span className="block text-[10px] font-normal mt-0.5 opacity-70">
                    25인승 이하
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setBusType("대형")}
                  disabled={isLoading}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    busType === "대형"
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                      : "border-input bg-background text-muted-foreground hover:border-primary/30"
                  } disabled:opacity-50`}
                >
                  🚌 대형
                  <span className="block text-[10px] font-normal mt-0.5 opacity-70">
                    45인승
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 출발지 + 도착지 */}
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="departure"
                  className="text-sm font-bold text-foreground flex items-center gap-2 mb-3"
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  출발지 <span className="text-destructive">*</span>
                </label>
                <input
                  id="departure"
                  type="text"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  placeholder="예: OO초등학교 정문 앞 (버스 회차 가능 구역)"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
                />
              </div>
              <div>
                <label
                  htmlFor="departureTime"
                  className="text-sm font-bold text-foreground flex items-center gap-2 mb-3"
                >
                  <Clock className="w-4 h-4 text-emerald-600" />
                  출발시간 <span className="text-destructive">*</span>
                </label>
                <input
                  id="departureTime"
                  type="text"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  placeholder="예: 09:00"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* 화살표 구분선 */}
            <div className="flex items-center gap-3 px-2">
              <div className="flex-1 h-px bg-border" />
              <div className="text-muted-foreground text-xs font-bold flex items-center gap-1">
                ▼ 이동 ▼
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="destination"
                  className="text-sm font-bold text-foreground flex items-center gap-2 mb-3"
                >
                  <MapPinned className="w-4 h-4 text-red-500" />
                  도착지 <span className="text-destructive">*</span>
                </label>
                <input
                  id="destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="예: 신륵사 공영주차장(버스 회차 가능 구역)"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
                />
              </div>
              <div>
                <label
                  htmlFor="returnTime"
                  className="text-sm font-bold text-foreground flex items-center gap-2 mb-3"
                >
                  <Clock className="w-4 h-4 text-red-500" />
                  복귀출발시간 <span className="text-destructive">*</span>
                </label>
                <input
                  id="returnTime"
                  type="text"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  placeholder="예: 14:00"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* 탑승 인원 */}
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" />
              탑승 인원 <span className="text-destructive">*</span>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="teacherCount"
                  className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  교사 수
                </label>
                <input
                  id="teacherCount"
                  type="number"
                  value={teacherCount === 0 ? "" : teacherCount}
                  onChange={(e) => setTeacherCount(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  min={0}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
                />
              </div>
              <div>
                <label
                  htmlFor="studentCount"
                  className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2"
                >
                  <Users className="w-3.5 h-3.5" />
                  학생 수
                </label>
                <input
                  id="studentCount"
                  type="number"
                  value={studentCount === 0 ? "" : studentCount}
                  onChange={(e) => setStudentCount(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  min={0}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
                />
              </div>
            </div>
            {teacherCount + studentCount > 0 && (
              <p className="text-xs text-primary font-semibold mt-3 ml-1">
                총 탑승 인원: {teacherCount + studentCount}명
              </p>
            )}
          </div>

          {/* 특별 요청사항 */}
          <div className="bg-card border border-border rounded-xl p-6">
            <label
              htmlFor="notes"
              className="text-sm font-bold text-foreground flex items-center gap-2 mb-3"
            >
              <StickyNote className="w-4 h-4 text-primary" />
              특별 요청사항 (비고)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="휠체어 탑승, 중간 경유지 등 특이사항이 있으면 적어 주세요."
              rows={3}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-start gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <CircleAlert className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

        {/* 개인정보 동의 및 제출 버튼 영역 */}
        <div className="pt-8 border-t border-slate-200">
          <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
            <input
              type="checkbox"
              id="privacy"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="privacy" className="text-sm text-slate-700 cursor-pointer">
              <span className="font-bold text-blue-600">[필수]</span> 에듀버스 배차 및 안내를 위한 담당자 성명 및 연락처 수집·이용에 동의합니다.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || showToast}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                신청 접수 중...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                체험버스 신청하기
              </>
            )}
          </button>
        </div>
        </form>
      </main>

      {/* Toast 슬라이드 애니메이션 */}
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
