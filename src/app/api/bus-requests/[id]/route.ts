import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const requestId = parseInt(id, 10);
    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "잘못된 요청입니다." },
        { status: 400 }
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
      privacyConsent,
      processConsent,
      detailedOperationContent,
    } = body;

    // 필드 검증
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
      !returnTime ||
      privacyConsent !== true ||
      processConsent !== true
    ) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력하고 동의해 주세요." },
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

    const supabase = createServerClient();

    // 기존 데이터 확인 (권한 및 상태 검증)
    const { data: requestData, error: fetchError } = await supabase
      .from("bus_requests")
      .select("school_id, status")
      .eq("id", requestId)
      .single();

    if (fetchError || !requestData) {
      return NextResponse.json(
        { error: "신청 내역을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const isAdmin = session.role === "admin";
    const isOwner = session.schoolId === requestData.school_id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "수정 권한이 없습니다." },
        { status: 403 }
      );
    }

    if (requestData.status !== "신청대기" && !isAdmin) {
      return NextResponse.json(
        { error: "승인 완료된 신청은 웹페이지에서 수정할 수 없습니다." },
        { status: 403 }
      );
    }

    // 일반 학교 사용자는 자기 학교만 신청 가능
    const effectiveSchoolId = isAdmin ? schoolId : session.schoolId;

    const { data, error } = await supabase
      .from("bus_requests")
      .update({
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
        detailed_operation_content: detailedOperationContent,
      })
      .eq("id", requestId)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "수정 중 오류가 발생했습니다. 다시 시도해 주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
