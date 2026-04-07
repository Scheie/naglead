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

type Props = NativeStackScreenProps<AppStackParamList, "Inbox">;

export function InboxScreen({ navigation }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showScorecard, setShowScorecard] = useState(false);

  const fetchLeads = useCallback(async () => {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setLeads(data);
  }, []);

  // Fetch on mount and refetch when screen regains focus (e.g. after adding a lead)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchLeads().then(() => {
        if (loading) setLoading(false);
      });
    });
    return unsubscribe;
  }, [navigation, fetchLeads, loading]);

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
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("leads")
      .update({ state: "waiting", replied_at: now, updated_at: now })
      .eq("id", leadId);
    if (error) { Alert.alert("Error", "Failed to update lead. Check your connection."); return; }
    logEvent(leadId, "replied");
    fetchLeads();
  }

  async function markWon(leadId: string, valueCents?: number) {
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
    if (error) { Alert.alert("Error", "Failed to update lead. Check your connection."); return; }
    logEvent(leadId, "won", valueCents ? { value_cents: valueCents } : undefined);
    fetchLeads();
  }

  async function markLost(leadId: string, reason?: string) {
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
    if (error) { Alert.alert("Error", "Failed to update lead. Check your connection."); return; }
    logEvent(leadId, "lost", reason ? { reason } : undefined);
    fetchLeads();
  }

  async function snoozeLead(leadId: string, until: Date) {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("leads")
      .update({ snoozed_until: until.toISOString(), updated_at: now })
      .eq("id", leadId);
    if (error) { Alert.alert("Error", "Failed to snooze lead. Check your connection."); return; }
    logEvent(leadId, "snoozed", { until: until.toISOString() });
    fetchLeads();
  }

  function callLead(phone: string) {
    Linking.openURL(`tel:${phone}`);
  }

  function textLead(phone: string) {
    Linking.openURL(`sms:${phone}`);
  }

  function emailLead(email: string) {
    Linking.openURL(`mailto:${email}`);
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
            ${Math.round(wonRevenue / 100).toLocaleString()}
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

  const renderHeader = () => (
    <View>
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
