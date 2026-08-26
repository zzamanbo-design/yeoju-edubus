import { getSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import ApplyForm from "./apply-form";


export default async function ApplyPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.passwordChanged) redirect("/update-password");
  if (session.role !== "admin") redirect("/");

  // schools 테이블에서 학교 목록 조회
  const supabase = createServerClient();
  const { data: schools } = await supabase
    .from("schools")
    .select("id, school_name, school_level")
    .order("school_level")
    .order("school_name");



  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ApplyForm
        session={{
          schoolId: session.schoolId,
          schoolName: session.schoolName,
          role: session.role,
        }}
        schools={schools ?? []}
      />
    </div>
  );
}
