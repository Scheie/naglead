import { createClient } from "@/lib/supabase/server";
import { LeadInbox } from "@/components/app/LeadInbox";

export default async function AppPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("users")
    .select("subscription_status, country")
    .eq("id", user!.id)
    .single();

  return (
    <LeadInbox
      initialLeads={leads ?? []}
      userId={user!.id}
      userName={user!.user_metadata?.name ?? "there"}
      subscriptionStatus={profile?.subscription_status ?? "free"}
      country={profile?.country ?? "US"}
    />
  );
}
