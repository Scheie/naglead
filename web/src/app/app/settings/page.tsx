import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/app/SettingsForm";
import { generateIntakeAlias } from "@/lib/intake-alias";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, name, trade, business_name, timezone, nag_enabled, nag_quiet_start, nag_quiet_end, intake_alias, country, subscription_status, created_at, push_token")
    .eq("id", user.id)
    .single();

  // Generate intake alias only for Pro subscribers
  if (profile && !profile.intake_alias && profile.subscription_status !== "free") {
    let alias = generateIntakeAlias();
    let retries = 0;
    while (retries < 5) {
      const { error } = await supabase
        .from("users")
        .update({ intake_alias: alias })
        .eq("id", user.id);
      if (!error) {
        profile.intake_alias = alias;
        break;
      }
      // Collision - try another
      alias = generateIntakeAlias();
      retries++;
    }
  }

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
          intake_alias: null,
          country: "US",
          created_at: "",
          subscription_status: "free",
        }
      }
    />
  );
}
