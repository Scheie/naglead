import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors } from "../lib/theme";
import type { Lead } from "../lib/types";

interface MonthlyScorecardProps {
  leads: Lead[];
  visible: boolean;
  onClose: () => void;
}

export function MonthlyScorecard({ leads, visible, onClose }: MonthlyScorecardProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonth = leads.filter(
      (l) => new Date(l.created_at) >= monthStart
    );
    const won = leads.filter(
      (l) => l.state === "won" && l.closed_at && new Date(l.closed_at) >= monthStart
    );
    const lost = leads.filter(
      (l) => l.state === "lost" && l.closed_at && new Date(l.closed_at) >= monthStart
    );
    const active = leads.filter(
      (l) => l.state === "reply_now" || l.state === "waiting"
    );

    const revenue = won.reduce((sum, l) => sum + (l.value_cents ?? 0), 0);

    const closedCount = won.length + lost.length;
    const winRate = closedCount > 0 ? Math.round((won.length / closedCount) * 100) : 0;

    // Avg reply time: leads created this month that have replied_at
    const replied = thisMonth.filter((l) => l.replied_at);
    let avgReplyHours = 0;
    if (replied.length > 0) {
      const totalMs = replied.reduce((sum, l) => {
        return sum + (new Date(l.replied_at!).getTime() - new Date(l.created_at).getTime());
      }, 0);
      avgReplyHours = totalMs / replied.length / 3600000;
    }

    const followUpRate = thisMonth.length > 0
      ? Math.round((replied.length / thisMonth.length) * 100)
      : 0;

    return {
      newLeads: thisMonth.length,
      won: won.length,
      lost: lost.length,
      active: active.length,
      revenue,
      winRate,
      avgReplyHours,
      followUpRate,
      closedCount,
    };
  }, [leads]);

  function formatMoney(cents: number): string {
    if (cents === 0) return "$0";
    return "$" + (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>THIS MONTH</Text>

          {/* Activity */}
          <View style={styles.grid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>New Leads</Text>
              <Text style={styles.metricValue}>{stats.newLeads}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Won</Text>
              <Text style={[styles.metricValue, { color: colors.green[400] }]}>{stats.won}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Lost</Text>
              <Text style={[styles.metricValue, { color: colors.zinc[400] }]}>{stats.lost}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Active</Text>
              <Text style={styles.metricValue}>{stats.active}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Analytics */}
          <View style={styles.grid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Revenue</Text>
              <Text style={[styles.metricValue, { color: colors.green[400] }]}>
                {formatMoney(stats.revenue)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Win Rate</Text>
              <Text style={[styles.metricValue, {
                color: stats.closedCount === 0 ? colors.zinc[500] : stats.winRate >= 50 ? colors.green[400] : colors.yellow,
              }]}>
                {stats.closedCount === 0 ? "—" : `${stats.winRate}%`}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Avg Reply</Text>
              <Text style={[styles.metricValue, { fontSize: 22 }]}>
                {stats.avgReplyHours === 0 ? "—" : `${stats.avgReplyHours.toFixed(1)}h`}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Follow-up</Text>
              <Text style={[styles.metricValue, {
                color: stats.newLeads === 0 ? colors.zinc[500] : stats.followUpRate >= 80 ? colors.green[400] : colors.yellow,
              }]}>
                {stats.newLeads === 0 ? "—" : `${stats.followUpRate}%`}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.zinc[900],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.zinc[700],
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Teko-Bold",
    fontSize: 28,
    color: colors.white,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: "47%",
    backgroundColor: colors.zinc[800],
    borderRadius: 10,
    padding: 14,
  },
  metricLabel: {
    fontFamily: "WorkSans-Bold",
    fontSize: 11,
    color: colors.zinc[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: "Teko-Bold",
    fontSize: 28,
    color: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.zinc[700],
    marginVertical: 16,
  },
  closeBtn: {
    backgroundColor: colors.zinc[800],
    borderWidth: 1,
    borderColor: colors.zinc[700],
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 20,
    alignItems: "center",
  },
  closeBtnText: {
    fontFamily: "Teko-Bold",
    fontSize: 20,
    color: colors.zinc[400],
  },
});
