import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      schoolId,
      tripDate,
      departure,
      destination,
      teacherCount,
      studentCount,
      busType,
      notes,
      applicantName,
      applicantPhone,
      usagePurpose,
      officialDocNumber,
      departureTime,
      returnTime,
    } = body;

    // 필수 필드 검증
    if (
      !schoolId ||
      !tripDate ||
      !departure ||
      !destination ||
      !busType ||
      !applicantName ||
      !applicantPhone ||
      !usagePurpose ||
      !officialDocNumber ||
      !departureTime ||
      !returnTime
    ) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해 주세요." },
        { status: 400 }
      );
    }

    if (teacherCount < 0 || studentCount < 0) {
      return NextResponse.json(
        { error: "탑승 인원은 0 이상이어야 합니다." },
        { status: 400 }
      );
    }

    if (teacherCount + studentCount === 0) {
      return NextResponse.json(
        { error: "탑승 인원(교사 또는 학생)을 1명 이상 입력해 주세요." },
        { status: 400 }
      );
    }

    if (!["중형", "대형"].includes(busType)) {
      return NextResponse.json(
        { error: "버스 규격은 중형 또는 대형만 선택 가능합니다." },
        { status: 400 }
      );
    }

    // 일반 학교 사용자는 자기 학교만 신청 가능
    const effectiveSchoolId =
      session.role === "admin" ? schoolId : session.schoolId;

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("bus_requests")
      .insert({
        school_id: effectiveSchoolId,
        trip_date: tripDate,
        departure,
        destination,
        departure_time: departureTime,
        return_time: returnTime,
        teacher_count: teacherCount,
        student_count: studentCount,
        bus_type: busType,
        notes: notes || null,
        applicant_name: applicantName,
        applicant_phone: applicantPhone,
        usage_purpose: usagePurpose,
        official_doc_number: officialDocNumber,
        status: "신청대기",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Bus request insert error:", error);
      return NextResponse.json(
        { error: "버스 신청 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId: data.id,
      message: "버스 신청이 성공적으로 접수되었습니다.",
    });
  } catch {
    return NextResponse.json(
      { error: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
