import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/app/SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <SettingsForm
      profile={
        profile ?? {
          id: user.id,
          email: user.email ?? "",
          name: user.user_metadata?.name ?? "",
          trade: user.user_metadata?.trade ?? null,
          business_name: null,
          timezone: "America/New_York",
          nag_enabled: true,
          nag_quiet_start: "21:00",
          nag_quiet_end: "07:00",
          push_token: null,
          country: "US",
          created_at: "",
          subscription_status: "free",
        }
      }
    />
  );
}
