"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateReportData } from "../../actions";
import { Loader2, Printer, Save, FileText } from "lucide-react";

interface ReportFormProps {
  request: any;
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

export default function ReportForm({ request }: ReportFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const existingData = request.report_data || {};

  const [formData, setFormData] = useState({
    service_name: existingData.service_name || "여주 체험버스 임차 용역",
    contractor_name: existingData.contractor_name || "",
    representative_name: existingData.representative_name || "",
    contract_date: existingData.contract_date || "",
    service_deadline: existingData.service_deadline || "",
    start_date: existingData.start_date || "",
    completion_date: existingData.completion_date || "",
    inspection_date_report: existingData.inspection_date_report || "",
    amount: existingData.amount || request.contracted_cost || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "amount" ? parseInt(value.replace(/[^0-9]/g, "")) || 0 : value
    }));
  };

  const handleSave = async () => {
    const { service_name, contractor_name, representative_name, contract_date, service_deadline, start_date, completion_date, inspection_date_report, amount } = formData;
    if (!service_name || !contractor_name || !representative_name || !contract_date || !service_deadline || !start_date || !completion_date || !inspection_date_report || !amount) {
      alert("모든 항목을 필수적으로 입력해주세요.");
      return;
    }

    setIsSaving(true);
    const result = await updateReportData(request.id, formData);
    setIsSaving(false);
    
    if (result.success) {
      alert("완수검사조서가 저장되었습니다. 이제 학교에서 출력할 수 있습니다.");
    } else {
      alert(result.error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const hanjaAmount = formData.amount ? numberToKoreanHanja(formData.amount) : "";
  const schoolName = request.schools?.school_name || "";
  const formattedTripDate = request.trip_date ? request.trip_date.replace(/-/g, ".") : "";

  const isFormValid = Boolean(
    formData.service_name &&
    formData.contractor_name &&
    formData.representative_name &&
    formData.contract_date &&
    formData.service_deadline &&
    formData.start_date &&
    formData.completion_date &&
    formData.inspection_date_report &&
    formData.amount
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* 폼 영역 (출력 시 숨김) */}
      <div className="print:hidden mb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            완수검사조서 작성
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !isFormValid}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-md font-bold hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              저장
            </button>
            <button
              onClick={handlePrint}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              출력
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">용역명</label>
              <input type="text" name="service_name" value={formData.service_name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">계약금액 (원)</label>
              <input type="text" name="amount" value={formData.amount} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">계약자</label>
              <input type="text" name="contractor_name" value={formData.contractor_name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="예: ㈜가나다관광" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">대표</label>
              <input type="text" name="representative_name" value={formData.representative_name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="예: 홍길동" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">계약일 (YYYY.MM.DD)</label>
              <input type="text" name="contract_date" value={formData.contract_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">용역기한 (YYYY.MM.DD)</label>
              <input type="text" name="service_deadline" value={formData.service_deadline} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">착수일 (YYYY.MM.DD)</label>
              <input type="text" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">완료일 (YYYY.MM.DD)</label>
              <input type="text" name="completion_date" value={formData.completion_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">최종 검수일자 표기 (YYYY년 MM월 DD일)</label>
              <input type="text" name="inspection_date_report" value={formData.inspection_date_report} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="예: 2026년 7월 7일" />
            </div>
          </div>
        </div>
      </div>

      {/* 미리보기 및 인쇄 영역 */}
      <div className="bg-white mx-auto print:shadow-none print:m-0 print:p-0 print:h-[290mm] print:overflow-hidden" style={{ maxWidth: '210mm', minHeight: '297mm', padding: '15mm' }}>
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
              <td colSpan={3} className="border border-black py-4 px-3 text-center">{formData.service_name || "　"}</td>
            </tr>
            <tr>
              <th className="border border-black py-4 px-2 text-center font-normal bg-orange-100/50 print:bg-orange-100/50">계 약 자</th>
              <td className="border border-black py-4 px-3 text-center bg-orange-100/50 print:bg-orange-100/50">{formData.contractor_name || "　"}</td>
              <th className="border border-black py-4 px-2 text-center font-normal bg-orange-100/50 print:bg-orange-100/50">대 표 :</th>
              <td className="border border-black py-4 px-3 text-center bg-orange-100/50 print:bg-orange-100/50">{formData.representative_name || "　"}</td>
            </tr>
            <tr>
              <th className="border border-black py-4 px-2 text-center font-normal bg-yellow-300/60 print:bg-yellow-300/60">계약금액</th>
              <td colSpan={2} className="border border-black py-4 px-3 text-left font-bold bg-yellow-300/60 print:bg-yellow-300/60">
                一金 : {hanjaAmount}원整
              </td>
              <td className="border border-black py-4 px-3 text-right bg-yellow-300/60 print:bg-yellow-300/60">
                (₩{formData.amount.toLocaleString()})
              </td>
            </tr>
            <tr>
              <th className="border border-black py-4 px-2 text-center font-normal">계 약 일</th>
              <td className="border border-black py-4 px-3 text-center">{formData.contract_date || "　"}</td>
              <th className="border border-black py-4 px-2 text-center font-normal">용역기한</th>
              <td className="border border-black py-4 px-3 text-center">{formData.service_deadline || "　"}</td>
            </tr>
            <tr>
              <th className="border border-black py-4 px-2 text-center font-normal">착 수 일</th>
              <td className="border border-black py-4 px-3 text-center">{formData.start_date || "　"}</td>
              <th className="border border-black py-4 px-2 text-center font-normal">완 료 일</th>
              <td className="border border-black py-4 px-3 text-center">{formData.completion_date || "　"}</td>
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
          <p>{formData.inspection_date_report || "　"}</p>
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
              <span className="text-red-600 print:text-black w-40">{schoolName}</span>
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
              <span className="text-red-600 print:text-black w-40">{schoolName}</span>
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
    </div>
  );
}
