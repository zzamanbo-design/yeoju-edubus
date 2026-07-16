import { createServerClient } from "@/lib/supabase";
import LoginClient from "./login-client";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = createServerClient();
  
  const { data: schools } = await supabase
    .from("school_accounts")
    .select("login_id")
    .eq("role", "school")
    .order("login_id", { ascending: true });

  const formattedSchools = schools?.map((s) => ({
    login_id: s.login_id,
    school_name: s.login_id,
  })) || [];

  return <LoginClient schools={formattedSchools} />;
}

