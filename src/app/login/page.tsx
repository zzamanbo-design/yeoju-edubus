import { createServerClient } from "@/lib/supabase";
import LoginClient from "./login-client";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = createServerClient();
  
  const { data: schools } = await supabase
    .from("bus_accounts")
    .select("login_id, school_name")
    .eq("role", "school")
    .order("school_name", { ascending: true });

  return <LoginClient schools={schools || []} />;
}
