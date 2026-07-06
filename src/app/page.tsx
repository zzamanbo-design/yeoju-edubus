import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

import { createServerClient } from "@/lib/supabase";

export default async function Home() {
  const session = await getSession();

  // proxy.ts에서 이미 처리하지만, 이중 안전장치
  if (!session) {
    redirect("/login");
  }

  const supabase = createServerClient();
  const { data: recentRequests } = await supabase
    .from("bus_requests")
    .select("id, trip_date, destination, bus_type, status, created_at, teacher_count, student_count, usage_purpose, schools(school_name)")
    .eq("school_id", session.schoolId)
    .order("created_at", { ascending: false })
    .limit(5);

  return <DashboardClient session={session} recentRequests={recentRequests || []} />;
}
