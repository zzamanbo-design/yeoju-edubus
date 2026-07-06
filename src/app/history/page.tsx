import { getSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import HistoryTable from "../apply/history-table";

export default async function HistoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // 현재 학교의 신청 내역 조회 (일반 학교인 경우에만)
  let requests: any[] = [];
  if (session.role === "school" && session.schoolId) {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("bus_requests")
      .select("id, trip_date, destination, bus_type, status, created_at, usage_purpose")
      .eq("school_id", session.schoolId)
      .order("created_at", { ascending: false });
    
    requests = data || [];
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {session.role === "school" && (
        <div className="pb-20 mt-8 bg-slate-50/50">
          <HistoryTable requests={requests} />
        </div>
      )}
    </div>
  );
}
