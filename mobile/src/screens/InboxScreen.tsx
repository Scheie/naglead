import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";
import type { Lead } from "../lib/types";
import { LeadCard } from "../components/LeadCard";
import { MonthlyScorecard } from "../components/MonthlyScorecard";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../navigation";

function snoozedUntilLabel(until: string): string {
  const untilTime = new Date(until).getTime();
  if (isNaN(untilTime)) return "snoozed";
  const diff = untilTime - Date.now();
  if (diff <= 0) return "expiring...";
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.ceil(diff / 60000)}m left`;
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d left`;
}

type Props = NativeStackScreenProps<AppStackParamList, "Inbox">;

import { getCurrencySymbol } from "../lib/country-codes";

export function InboxScreen({ navigation }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showScorecard, setShowScorecard] = useState(false);
  const [showSnoozed, setShowSnoozed] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("free");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setLeads(data);
  }, []);

  // Fetch user's currency and subscription status
  useEffect(() => {
    async function loadUserSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("users").select("country, subscription_status").eq("id", user.id).single();
      if (data?.country) setCurrencySymbol(getCurrencySymbol(data.country));
      if (data?.subscription_status) setSubscriptionStatus(data.subscription_status);
    }
    loadUserSettings();
  }, []);

  // Fetch on mount and refetch when screen regains focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchLeads().then(() => setLoading(false));
    });
    return unsubscribe;
  }, [navigation, fetchLeads]);

  // Poll every 30 seconds, but only while screen is focused
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const unsubFocus = navigation.addListener("focus", () => {
      interval = setInterval(fetchLeads, 30000);
    });
    const unsubBlur = navigation.addListener("blur", () => {
      if (interval) clearInterval(interval);
    });

    return () => {
      unsubFocus();
      unsubBlur();
      if (interval) clearInterval(interval);
    };
  }, [navigation, fetchLeads]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeads();
    setRefreshing(false);
  }, [fetchLeads]);

  const replyNow = useMemo(
    () =>
      leads
        .filter(
          (l) =>
            l.state === "reply_now" &&
            (!l.snoozed_until || new Date(l.snoozed_until) <= new Date())
        )
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
    [leads]
  );

  const snoozed = useMemo(
    () =>
      leads
        .filter(
          (l) =>
            l.state === "reply_now" &&
            l.snoozed_until &&
            new Date(l.snoozed_until) > new Date()
        )
        .sort(
          (a, b) =>
            new Date(a.snoozed_until!).getTime() - new Date(b.snoozed_until!).getTime()
        ),
    [leads]
  );

  const waiting = useMemo(
    () =>
      leads
        .filter((l) => l.state === "waiting")
        .sort(
          (a, b) =>
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        ),
    [leads]
  );

  async function logEvent(leadId: string, eventType: string, metadata?: Record<string, unknown>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("lead_events").insert({
      lead_id: leadId,
      user_id: user.id,
      event_type: eventType,
      metadata: metadata ?? null,
    });
  }

  async function markReplied(leadId: string) {
    if (actionInProgress) return;
    setActionInProgress(leadId);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("leads")
      .update({ state: "waiting", replied_at: now, updated_at: now })
      .eq("id", leadId);
    setActionInProgress(null);
    if (error) { Alert.alert("Error", "Failed to update lead. Check your connection."); return; }
    logEvent(leadId, "replied");
    fetchLeads();
  }

  async function markWon(leadId: string, valueCents?: number) {
    if (actionInProgress) return;
    setActionInProgress(leadId);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("leads")
      .update({
        state: "won",
        closed_at: now,
        updated_at: now,
        value_cents: valueCents ?? null,
      })
      .eq("id", leadId);
    setActionInProgress(null);
    if (error) { Alert.alert("Error", "Failed to update lead. Check your connection."); return; }
    logEvent(leadId, "won", valueCents ? { value_cents: valueCents } : undefined);
    fetchLeads();
  }

  async function markLost(leadId: string, reason?: string) {
    if (actionInProgress) return;
    setActionInProgress(leadId);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("leads")
      .update({
        state: "lost",
        closed_at: now,
        updated_at: now,
        lost_reason: reason ?? null,
      })
      .eq("id", leadId);
    setActionInProgress(null);
    if (error) { Alert.alert("Error", "Failed to update lead. Check your connection."); return; }
    logEvent(leadId, "lost", reason ? { reason } : undefined);
    fetchLeads();
  }

  async function snoozeLead(leadId: string, until: Date) {
    if (actionInProgress) return;
    setActionInProgress(leadId);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("leads")
      .update({ snoozed_until: until.toISOString(), updated_at: now })
      .eq("id", leadId);
    setActionInProgress(null);
    if (error) { Alert.alert("Error", "Failed to snooze lead. Check your connection."); return; }
    logEvent(leadId, "snoozed", { until: until.toISOString() });
    fetchLeads();
  }

  async function unsnoozeLead(leadId: string) {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("leads")
      .update({ snoozed_until: null, updated_at: now })
      .eq("id", leadId);
    if (error) { Alert.alert("Error", "Failed to unsnooze lead."); return; }
    fetchLeads();
  }

  async function callLead(phone: string) {
    try { await Linking.openURL(`tel:${phone}`); } catch { Alert.alert("Error", "Could not open phone app."); }
  }

  async function textLead(phone: string) {
    try { await Linking.openURL(`sms:${phone}`); } catch { Alert.alert("Error", "Could not open messaging app."); }
  }

  async function emailLead(email: string) {
    try { await Linking.openURL(`mailto:${email}`); } catch { Alert.alert("Error", "Could not open email app."); }
  }

  const wonThisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return leads.filter(
      (l) => l.state === "won" && l.closed_at && new Date(l.closed_at) >= monthStart
    );
  }, [leads]);

  const lostThisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return leads.filter(
      (l) => l.state === "lost" && l.closed_at && new Date(l.closed_at) >= monthStart
    );
  }, [leads]);

  const wonRevenue = useMemo(() => {
    return wonThisMonth.reduce((sum, l) => sum + (l.value_cents ?? 0), 0);
  }, [wonThisMonth]);

  const renderFooter = () => (
    <TouchableOpacity style={styles.statsRow} onPress={() => setShowScorecard(true)}>
      <View style={styles.statCard}>
        <View style={styles.statHeader}>
          <View style={[styles.statDot, { backgroundColor: colors.green[500] }]} />
          <Text style={styles.statLabel}>Won</Text>
        </View>
        <Text style={[styles.statValue, { color: colors.white }]}>
          {wonThisMonth.length}
        </Text>
        {wonRevenue > 0 && (
          <Text style={styles.revenueText}>
            {currencySymbol}{Math.round(wonRevenue / 100).toLocaleString()}
          </Text>
        )}
      </View>
      <View style={styles.statCard}>
        <View style={styles.statHeader}>
          <View style={[styles.statDot, { backgroundColor: colors.zinc[600] }]} />
          <Text style={styles.statLabel}>Lost</Text>
        </View>
        <Text style={[styles.statValue, { color: colors.zinc[400] }]}>
          {lostThisMonth.length}
        </Text>
      </View>
      <Text style={styles.tapHint}>Tap for scorecard</Text>
    </TouchableOpacity>
  );

  const activeCount = replyNow.length + snoozed.length + waiting.length;
  const isFree = subscriptionStatus === "free";
  const FREE_LIMIT = 5;

  const renderHeader = () => (
    <View>
      {/* Free tier warning */}
      {isFree && activeCount >= FREE_LIMIT - 1 && (
        <TouchableOpacity
          style={[
            styles.freeTierBanner,
            activeCount >= FREE_LIMIT && styles.freeTierBannerFull,
          ]}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={[
            styles.freeTierText,
            activeCount >= FREE_LIMIT && styles.freeTierTextFull,
          ]}>
            {activeCount >= FREE_LIMIT
              ? `You've hit the ${FREE_LIMIT}-lead limit. Mark some as won or lost to free up slots.`
              : `${activeCount}/${FREE_LIMIT} active leads used.`}
          </Text>
        </TouchableOpacity>
      )}

      {/* Reply Now */}
      <View style={styles.sectionHeader}>
        <View style={[styles.dot, { backgroundColor: colors.red[500] }]} />
        <Text style={[styles.sectionTitle, { color: colors.red[400] }]}>
          REPLY NOW ({replyNow.length})
        </Text>
      </View>

      {replyNow.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No leads waiting for a reply. Nice work!
          </Text>
        </View>
      )}
    </View>
  );

  const data = [
    ...replyNow.map((l) => ({ ...l, section: "reply_now" as const })),
    ...(snoozed.length > 0 ? [{ id: "__snoozed_header__", section: "snoozed_header" as const }] : []),
    ...(showSnoozed ? snoozed.map((l) => ({ ...l, section: "snoozed" as const })) : []),
    { id: "__waiting_header__", section: "waiting_header" as const },
    ...waiting.map((l) => ({ ...l, section: "waiting" as const })),
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (leads.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📢</Text>
        <Text style={styles.emptyTitle}>NO LEADS YET</Text>
        <Text style={styles.emptySubtitle}>
          Add your first lead and we&apos;ll make sure you never forget to follow up.
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddLead")}
        >
          <Text style={styles.addButtonText}>+ ADD YOUR FIRST LEAD</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.orange}
          />
        }
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => {
          if (item.section === "snoozed_header") {
            return (
              <TouchableOpacity
                style={styles.snoozedToggle}
                onPress={() => setShowSnoozed(!showSnoozed)}
              >
                <Text style={styles.snoozedToggleText}>
                  😴 {snoozed.length} snoozed
                </Text>
                <Text style={styles.snoozedChevron}>{showSnoozed ? "⌄" : "›"}</Text>
              </TouchableOpacity>
            );
          }

          if (item.section === "snoozed") {
            const lead = item as Lead & { section: string };
            return (
              <View style={styles.snoozedCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.snoozedName} numberOfLines={1}>{lead.name}</Text>
                  <Text style={styles.snoozedMeta}>
                    {snoozedUntilLabel(lead.snoozed_until!)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.unsnoozeBtn}
                  onPress={() => unsnoozeLead(lead.id)}
                >
                  <Text style={styles.unsnoozeBtnText}>Wake up</Text>
                </TouchableOpacity>
              </View>
            );
          }

          if (item.section === "waiting_header") {
            return (
              <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                <View style={[styles.dot, { backgroundColor: colors.yellow }]} />
                <Text style={[styles.sectionTitle, { color: colors.yellow }]}>
                  WAITING ({waiting.length})
                </Text>
              </View>
            );
          }

          const lead = item as Lead & { section: string };
          return (
            <LeadCard
              lead={lead}
              compact={lead.section === "waiting"}
              currencySymbol={currencySymbol}
              onMarkDone={(valueCents?: number) =>
                lead.section === "waiting"
                  ? markWon(lead.id, valueCents)
                  : markReplied(lead.id)
              }
              onMarkLost={(reason?: string) => markLost(lead.id, reason)}
              onSnooze={
                lead.section === "reply_now"
                  ? (until: Date) => snoozeLead(lead.id, until)
                  : undefined
              }
              onCall={lead.phone ? () => callLead(lead.phone!) : undefined}
              onText={lead.phone ? () => textLead(lead.phone!) : undefined}
              onEmail={lead.email ? () => emailLead(lead.email!) : undefined}
            />
          );
        }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddLead")}
      >
        <Text style={styles.fabText}>+ ADD LEAD</Text>
      </TouchableOpacity>

      <MonthlyScorecard
        leads={leads}
        visible={showScorecard}
        currencySymbol={currencySymbol}
        onClose={() => setShowScorecard(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontFamily: "Teko-Bold",
    fontSize: 36,
    color: colors.white,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: colors.zinc[400],
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "WorkSans-Medium",
  },
  loadingText: {
    color: colors.zinc[500],
    fontSize: 16,
    textAlign: "center",
    marginTop: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    fontFamily: "Teko-Bold",
    fontSize: 28,
  },
  emptyCard: {
    backgroundColor: colors.zinc[900],
    borderWidth: 1,
    borderColor: colors.zinc[800],
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: colors.zinc[500],
    fontFamily: "WorkSans-Medium",
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.zinc[900],
    borderWidth: 1,
    borderColor: colors.zinc[800],
    borderRadius: 12,
    padding: 16,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statLabel: {
    fontFamily: "WorkSans-Bold",
    fontSize: 11,
    color: colors.zinc[500],
    textTransform: "uppercase",
  },
  statValue: {
    fontFamily: "Teko-Bold",
    fontSize: 32,
  },
  freeTierBanner: {
    backgroundColor: colors.zinc[900],
    borderWidth: 1,
    borderColor: colors.zinc[800],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  freeTierBannerFull: {
    backgroundColor: "rgba(255, 69, 0, 0.1)",
    borderColor: colors.orange,
  },
  freeTierText: {
    fontFamily: "WorkSans-SemiBold",
    fontSize: 13,
    color: colors.zinc[400],
  },
  freeTierTextFull: {
    color: colors.orange,
  },
  snoozedToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.zinc[900],
    borderWidth: 1,
    borderColor: colors.zinc[800],
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  snoozedToggleText: {
    fontFamily: "WorkSans-SemiBold",
    fontSize: 13,
    color: colors.zinc[500],
  },
  snoozedChevron: {
    color: colors.zinc[500],
    fontSize: 16,
  },
  snoozedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc[900],
    borderWidth: 1,
    borderColor: colors.zinc[800],
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    gap: 8,
  },
  snoozedName: {
    fontFamily: "WorkSans-SemiBold",
    fontSize: 14,
    color: colors.zinc[400],
  },
  snoozedMeta: {
    fontFamily: "WorkSans-Regular",
    fontSize: 12,
    color: colors.zinc[600],
    marginTop: 2,
  },
  unsnoozeBtn: {
    backgroundColor: colors.zinc[800],
    borderWidth: 1,
    borderColor: colors.zinc[700],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unsnoozeBtnText: {
    fontFamily: "WorkSans-SemiBold",
    fontSize: 12,
    color: colors.zinc[300],
  },
  revenueText: {
    fontFamily: "WorkSans-SemiBold",
    fontSize: 12,
    color: colors.green[400],
    marginTop: 2,
  },
  tapHint: {
    position: "absolute",
    bottom: -18,
    alignSelf: "center",
    fontFamily: "WorkSans-Medium",
    fontSize: 11,
    color: colors.zinc[600],
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 20,
    left: 20,
    backgroundColor: colors.orange,
    paddingVertical: 16,
    borderRadius: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  fabText: {
    fontFamily: "Teko-Bold",
    fontSize: 26,
    color: colors.black,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: colors.orange,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 4,
  },
  addButtonText: {
    fontFamily: "Teko-Bold",
    fontSize: 24,
    color: colors.black,
  },
});
