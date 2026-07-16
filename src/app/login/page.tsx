import { createServerClient } from "@/lib/supabase";
import LoginClient from "./login-client";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = createServerClient();
  
  const { data: schools } = await supabase
    .from("schools")
    .select("school_name")
    .order("school_name", { ascending: true });

  const formattedSchools = schools?.map((s) => ({
    login_id: s.school_name,
    school_name: s.school_name,
  })) || [];

  return <LoginClient schools={formattedSchools} />;
}

