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
  const { data: recentRequests } = await supabase
    .from("bus_requests")
    .select("id, trip_date, destination, bus_type, status, created_at, teacher_count, student_count, usage_purpose, report_data, schools(school_name)")
    .eq("school_id", session.schoolId)
    .order("created_at", { ascending: false })
    .limit(5);

  return <DashboardClient session={session} recentRequests={recentRequests || []} />;
}
