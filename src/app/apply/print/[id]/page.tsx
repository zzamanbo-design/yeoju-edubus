import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import PrintTrigger from "./print-trigger";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function PrintPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const supabase = createServerClient();
  const { id } = await params;
  const requestId = parseInt(id, 10);

  if (isNaN(requestId)) {
    notFound();
  }

  const { data: request, error } = await supabase
    .from("bus_requests")
    .select(`
      *,
      schools (
        school_name,
        school_level,
        region
      )
    `)
    .eq("id", requestId)
    .single();

  if (error || !request) {
    notFound();
  }

  // 본인 학교의 신청건이거나 관리자만 볼 수 있음
  if (session.role === "school" && request.school_id !== session.schoolId) {
    redirect("/");
  }

  // 날짜 포맷 (YYYY.MM.DD.(요일))
  const printDate = new Date();
  const dayName = ["일", "월", "화", "수", "목", "금", "토"][printDate.getDay()];
  const formattedDate = `${printDate.getFullYear()}.${String(printDate.getMonth() + 1).padStart(2, "0")}.${String(printDate.getDate()).padStart(2, "0")}.(${dayName})`;

  const totalCountStr = `${request.teacher_count + request.student_count}명`; // (교사 ${request.teacher_count}명, 학생 ${request.student_count}명) 원하면 추가 가능, 양식엔 값만 있음

  return (
    <div className="min-h-screen bg-white text-black font-sans print:bg-white print:text-black">
      <div className="max-w-[210mm] mx-auto px-12 py-16 print:p-0 print:m-0 print:shadow-none">
        
        {/* Title */}
        <div className="text-center mb-10 pb-4 border-b border-black">
          <h1 className="text-3xl font-bold tracking-widest">여주 체험버스 신청서</h1>
        </div>

        {/* Content */}
        <div className="space-y-8">
          
          {/* 1. 학교 및 담당자 정보 */}
          <section>
            <h2 className="text-[15px] font-medium mb-2">1. 학교 및 담당자 정보</h2>
            <table className="w-full border-collapse border border-black text-sm">
              <tbody>
                <tr>
                  <th className="border border-black py-2 px-3 w-1/4 text-center font-normal">학교명</th>
                  <td className="border border-black py-2 px-3 w-3/4 text-black font-semibold">{request.schools?.school_name}</td>
                </tr>
                <tr>
                  <th className="border border-black py-2 px-3 w-1/4 text-center font-normal">담당자 이름</th>
                  <td className="border border-black py-2 px-3 w-3/4 text-black font-semibold">{request.applicant_name || ""}</td>
                </tr>
                <tr>
                  <th className="border border-black py-2 px-3 w-1/4 text-center font-normal">담당자 연락처</th>
                  <td className="border border-black py-2 px-3 w-3/4 text-black font-semibold">{request.applicant_phone || ""}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 2. 버스 이용 상세 정보 */}
          <section>
            <h2 className="text-[15px] font-medium mb-2">2. 버스 이용 상세 정보</h2>
            <table className="w-full border-collapse border border-black text-sm">
              <tbody>
                <tr>
                  <th className="border border-black py-2 px-3 w-1/4 text-center font-normal">이용 목적</th>
                  <td className="border border-black py-2 px-3 w-3/4 text-black font-semibold" colSpan={3}>{request.usage_purpose || ""}</td>
                </tr>
                <tr>
                  <th className="border border-black py-2 px-3 w-1/4 text-center font-normal">희망 날짜</th>
                  <td className="border border-black py-2 px-3 w-1/4 text-black font-semibold">{request.trip_date || ""}</td>
                  <th className="border border-black py-2 px-3 w-1/4 text-center font-normal">관련 공문번호</th>
                  <td className="border border-black py-2 px-3 w-1/4 text-black font-semibold">{request.official_doc_number || ""}</td>
                </tr>
                <tr>
                  <th className="border border-black py-2 px-3 w-1/4 text-center font-normal">출발지</th>
                  <td className="border border-black py-2 px-3 w-1/4 text-black font-semibold">{request.departure || ""}</td>
                  <th className="border border-black py-2 px-3 w-1/4 text-center font-normal">도착지</th>
                  <td className="border border-black py-2 px-3 w-1/4 text-black font-semibold">{request.destination || ""}</td>
                </tr>
                <tr>
                  <th className="border border-black py-2 px-3 w-1/4 text-center font-normal">출발시간</th>
                  <td className="border border-black py-2 px-3 w-1/4 text-black font-semibold">{request.departure_time || ""}</td>
                  <th className="border border-black py-2 px-3 w-1/4 text-center font-normal">복귀출발시간</th>
                  <td className="border border-black py-2 px-3 w-1/4 text-black font-semibold">{request.return_time || ""}</td>
                </tr>
                <tr>
                  <th className="border border-black py-2 px-3 w-1/4 text-center font-normal">탑승 인원</th>
                  <td className="border border-black py-2 px-3 w-1/4 text-black font-semibold">{totalCountStr}</td>
                  <th className="border border-black py-2 px-3 w-1/4 text-center font-normal">버스 규격</th>
                  <td className="border border-black py-2 px-3 w-1/4 text-black font-semibold">{request.bus_type || ""}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 3. 비고 */}
          <section>
            <h2 className="text-[15px] font-medium mb-2">3. 비고</h2>
            <table className="w-full border-collapse border border-black text-sm">
              <tbody>
                <tr>
                  <th className="border border-black py-2 px-3 w-1/4 text-center font-normal align-middle h-32">상세 운영내용</th>
                  <td className="border border-black py-2 px-3 w-3/4"></td>
                </tr>
                <tr>
                  <th className="border border-black py-2 px-3 w-1/4 text-center font-normal">안전 서약</th>
                  <td className="border border-black py-2 px-3 w-3/4 font-semibold text-black">버스 탑승과 관련한 안전사항을 사전 확인하고 관리하겠습니다.</td>
                </tr>
              </tbody>
            </table>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 grid grid-cols-3 text-[15px] items-end">
          <div className="text-left text-black font-semibold">
            <p>{formattedDate}</p>
          </div>
          <div className="text-center whitespace-nowrap">
            <p className="font-bold text-lg">위와 같이 여주 체험버스 이용을 신청합니다.</p>
          </div>
          <div className="text-right flex flex-col gap-2">
            <p>담당자: <span className="text-black font-semibold">{request.applicant_name || ""}</span></p>
            <p>서 명: <span className="inline-block w-12 text-right">(인)</span></p>
          </div>
        </div>

        {/* Bottom Signature */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-extrabold tracking-widest text-black">{request.schools?.school_name}장</h2>
        </div>

      </div>
      
      {/* Client Component to trigger print */}
      <PrintTrigger />
    </div>
  );
}
