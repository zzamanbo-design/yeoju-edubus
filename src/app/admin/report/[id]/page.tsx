import { createServerClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import ReportForm from "./report-form";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ReportPage({ params }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/");
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

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <ReportForm request={request} />
    </div>
  );
}
