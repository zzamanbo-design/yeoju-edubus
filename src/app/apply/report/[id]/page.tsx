import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import PrintTrigger from "./print-trigger";

interface PageProps {
  params: {
    id: string;
  };
}

function numberToKoreanHanja(num: number): string {
  if (!num || isNaN(num) || num === 0) return "영";
  const hanjaDigits = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
  const hanjaUnits = ["", "십", "백", "천"];
  const hanjaBigUnits = ["", "만", "억", "조"];
  
  let result = "";
  let numStr = num.toString();
  
  let bigUnitIndex = 0;
  while (numStr.length > 0) {
    let chunk = numStr.slice(-4);
    numStr = numStr.slice(0, -4);
    
    let chunkResult = "";
    for (let i = 0; i < chunk.length; i++) {
      const digit = parseInt(chunk[chunk.length - 1 - i]);
      if (digit > 0) {
        chunkResult = hanjaDigits[digit] + hanjaUnits[i] + chunkResult;
      }
    }
    
    if (chunkResult !== "") {
      result = chunkResult + hanjaBigUnits[bigUnitIndex] + result;
    }
    bigUnitIndex++;
  }
  
  return result;
}

export default async function SchoolReportPage({ params }: PageProps) {
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
        school_name
      )
    `)
    .eq("id", requestId)
    .single();

  if (error || !request) {
    notFound();
  }

  if (session.role === "school" && request.school_id !== session.schoolId) {
    redirect("/");
  }

  const report = request.report_data || {};
  const hanjaAmount = report.amount ? numberToKoreanHanja(report.amount) : "";
  const schoolName = request.schools?.school_name || "";
  const formattedTripDate = request.trip_date ? request.trip_date.replace(/-/g, ".") : "";

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white flex items-center justify-center py-8 print:py-0">
      <div className="bg-white mx-auto print:shadow-none print:m-0 print:p-0 shadow-lg print:h-[290mm] print:overflow-hidden" style={{ maxWidth: '210mm', minHeight: '297mm', padding: '15mm', width: '210mm' }}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-[0.2em] mb-10">완수검사조서</h1>
        </div>

        <table className="w-full border-collapse border-2 border-black text-[15px] mb-10 text-black">
          <colgroup>
            <col className="w-[15%]" />
            <col className="w-[35%]" />
            <col className="w-[15%]" />
            <col className="w-[35%]" />
          </colgroup>
          <tbody>
            <tr>
              <th className="border border-black py-4 px-2 text-center font-normal">용 역 명</th>
              <td colSpan={3} className="border border-black py-4 px-3 text-center">{report.service_name || "　"}</td>
            </tr>
            <tr>
              <th className="border border-black py-4 px-2 text-center font-normal bg-orange-100/50 print:bg-orange-100/50">계 약 자</th>
              <td className="border border-black py-4 px-3 text-center bg-orange-100/50 print:bg-orange-100/50">{report.contractor_name || "　"}</td>
              <th className="border border-black py-4 px-2 text-center font-normal bg-orange-100/50 print:bg-orange-100/50">대 표 :</th>
              <td className="border border-black py-4 px-3 text-center bg-orange-100/50 print:bg-orange-100/50">{report.representative_name || "　"}</td>
            </tr>
            <tr>
              <th className="border border-black py-4 px-2 text-center font-normal bg-yellow-300/60 print:bg-yellow-300/60">계약금액</th>
              <td colSpan={2} className="border border-black py-4 px-3 text-left font-bold bg-yellow-300/60 print:bg-yellow-300/60">
                一金 : {hanjaAmount}원整
              </td>
              <td className="border border-black py-4 px-3 text-right bg-yellow-300/60 print:bg-yellow-300/60">
                (₩{(report.amount || 0).toLocaleString()})
              </td>
            </tr>
            <tr>
              <th className="border border-black py-4 px-2 text-center font-normal">계 약 일</th>
              <td className="border border-black py-4 px-3 text-center">{report.contract_date || "　"}</td>
              <th className="border border-black py-4 px-2 text-center font-normal">용역기한</th>
              <td className="border border-black py-4 px-3 text-center">{report.service_deadline || "　"}</td>
            </tr>
            <tr>
              <th className="border border-black py-4 px-2 text-center font-normal">착 수 일</th>
              <td className="border border-black py-4 px-3 text-center">{report.start_date || "　"}</td>
              <th className="border border-black py-4 px-2 text-center font-normal">완 료 일</th>
              <td className="border border-black py-4 px-3 text-center">{report.completion_date || "　"}</td>
            </tr>
            <tr>
              <th className="border border-black py-4 px-2 text-center font-normal">검 수 일</th>
              <td className="border border-black py-4 px-3 text-center">{formattedTripDate || "　"}</td>
              <th className="border border-black py-4 px-2 text-center font-normal">검수장소</th>
              <td className="border border-black py-4 px-3 text-center text-sm">{request.departure} / {request.destination}</td>
            </tr>
            <tr>
              <th className="border border-black py-4 px-2 text-center font-normal">비 고</th>
              <td colSpan={3} className="border border-black py-4 px-3">검사내용: 버스 승하차 안전 및 운행 중 안전 확인</td>
            </tr>
          </tbody>
        </table>

        <div className="text-center mb-16 text-black text-[15px]">
          <p className="mb-10 font-bold">위와 같이 검수 하였음.</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;년 &nbsp;월 &nbsp;일</p>
        </div>

        <div className="flex justify-center mb-20 text-black">
          <table className="border-collapse border border-black text-sm w-[400px]">
            <tbody>
              <tr>
                <th rowSpan={2} className="border border-black py-2 px-2 w-[40px] text-center font-normal">결<br/><br/>재</th>
                <th className="border border-black py-2 text-center font-normal w-[120px]">담 당 교 사</th>
                <th className="border border-black py-2 text-center font-normal w-[120px]">교 감</th>
                <th className="border border-black py-2 text-center font-normal w-[120px]">교 장</th>
              </tr>
              <tr>
                <td className="border border-black h-20"></td>
                <td className="border border-black h-20"></td>
                <td className="border border-black h-20"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-black text-[15px] space-y-6">
          <div className="flex justify-between px-10">
            <div className="flex gap-4">
              <span className="w-20 font-bold">검사원</span>
              <span className="text-black w-40">{schoolName}</span>
            </div>
            <div className="flex gap-12">
              <span>직)교 사</span>
              <div className="flex gap-16">
                <span>성명)</span>
                <span>(인)</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between px-10">
            <div className="flex gap-4">
              <span className="w-20 font-bold">입회자</span>
              <span className="text-black w-40">{schoolName}</span>
            </div>
            <div className="flex gap-12">
              <span>직)부 장</span>
              <div className="flex gap-16">
                <span>성명)</span>
                <span>(인)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <PrintTrigger />
    </div>
  );
}
