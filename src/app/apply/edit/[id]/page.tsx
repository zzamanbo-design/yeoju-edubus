import { getSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import ApplyForm from "../../apply-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBusRequestPage({ params }: Props) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const requestId = parseInt(id, 10);
  if (isNaN(requestId)) {
    redirect("/");
  }

  const supabase = createServerClient();

  // 1. Fetch schools data
  const { data: schoolsData } = await supabase
    .from("schools")
    .select("id, school_name, school_level")
    .order("school_name");

  // 2. Fetch specific request data
  const { data: requestData, error } = await supabase
    .from("bus_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (error || !requestData) {
    redirect("/");
  }

  // 3. Permission and status check
  const isAdmin = session.role === "admin";
  const isOwner = session.schoolId === requestData.school_id;

  if (!isAdmin && !isOwner) {
    redirect("/"); // Unauthorized
  }

  if (requestData.status !== "신청대기" && !isAdmin) {
    // Only admin can edit non-pending requests (or redirect school to history)
    redirect("/");
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <ApplyForm 
        session={session} 
        schools={schoolsData || []} 
        initialData={requestData} 
      />
    </div>
  );
}
