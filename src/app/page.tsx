import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

import { createServerClient } from "@/lib/supabase";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }
  if (!session.passwordChanged) {
    redirect("/update-password");
  }

  const supabase = createServerClient();
  
  // 1. Fetch recent requests
  let query = supabase
    .from("bus_requests")
    .select("id, trip_date, destination, bus_type, status, created_at, teacher_count, student_count, usage_purpose, report_data, schools(school_name)")
    .order("created_at", { ascending: false })
    .limit(5);

  if (session.role !== "admin") {
    query = query.eq("school_id", session.schoolId);
  }

  const { data: recentRequests } = await query;

  // 2. Fetch budget info and approved requests for pie chart
  const { data: settingsData } = await supabase
    .from("admin_settings")
    .select("total_budget")
    .eq("id", 1)
    .single();

  const TOTAL_BUDGET = settingsData?.total_budget ?? 50_000_000;

  const { data: allRequests } = await supabase
    .from("bus_requests")
    .select("status, contracted_cost");

  const approvedRequests = (allRequests || []).filter((r) => r.status === "승인" || r.status === "승인완료");
  const approvedCount = approvedRequests.length;
  const usedBudget = approvedRequests.reduce((sum, req) => sum + (req.contracted_cost || 0), 0);
  
  const remainingBudget = Math.max(TOTAL_BUDGET - usedBudget, 0);
  const availableCount = Math.floor(remainingBudget / 600000);

  const budgetInfo = {
    usedCount: approvedCount,
    availableCount: availableCount
  };

  return <DashboardClient session={session} recentRequests={recentRequests || []} budgetInfo={budgetInfo} />;
}
