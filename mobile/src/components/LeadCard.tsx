import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { colors } from "../lib/theme";
import type { Lead } from "../lib/types";

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function urgencyColor(createdAt: string): string {
  const hours = (Date.now() - new Date(createdAt).getTime()) / 3600000;
  if (hours < 2) return colors.zinc[800];
  if (hours < 6) return colors.yellow;
  if (hours < 24) return colors.orange;
  return colors.red[600];
}

interface LeadCardProps {
  lead: Lead;
  compact?: boolean;
  onMarkDone: () => void;
  onMarkLost: () => void;
  onCall?: () => void;
  onText?: () => void;
}

export function LeadCard({
  lead,
  compact,
  onMarkDone,
  onMarkLost,
  onCall,
  onText,
}: LeadCardProps) {
  const age = timeAgo(
    lead.state === "waiting" && lead.replied_at
      ? lead.replied_at
      : lead.created_at
  );
  const borderColor =
    lead.state === "reply_now" ? urgencyColor(lead.created_at) : colors.zinc[800];

  const isCritical = lead.state === "reply_now" && borderColor === colors.red[600];
  const isHigh = lead.state === "reply_now" && borderColor === colors.orange;

  // Pulse animation for critical leads
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isCritical) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [isCritical, pulseAnim]);

  if (compact) {
    return (
      <View style={[styles.compactCard, { borderColor: colors.zinc[800] }]}>
        <View style={styles.compactContent}>
          <Text style={styles.name} numberOfLines={1}>{lead.name}</Text>
          <Text style={styles.description} numberOfLines={1}>{lead.description}</Text>
        </View>
        <Text style={styles.age}>{age}</Text>
        <View style={styles.compactActions}>
          <TouchableOpacity style={styles.wonBtn} onPress={onMarkDone}>
            <Text style={styles.wonBtnText}>WON</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.lostBtn} onPress={onMarkLost}>
            <Text style={styles.lostBtnText}>LOST</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.card,
        { borderColor },
        isCritical && { borderWidth: 2, opacity: pulseAnim },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={styles.name}>{lead.name}</Text>
            {isCritical && <Text style={{ fontSize: 14 }}>🔴</Text>}
            {isHigh && <Text style={{ fontSize: 14 }}>🟠</Text>}
          </View>
          <Text style={styles.description}>{lead.description}</Text>
        </View>
        <Text style={[styles.age, { color: borderColor === colors.zinc[800] ? colors.zinc[500] : borderColor }]}>
          {age} ago
        </Text>
      </View>

      {(lead.phone || lead.email) && (
        <Text style={styles.contact}>
          {lead.phone ? `📞 ${lead.phone}` : ""}
          {lead.phone && lead.email ? "  ·  " : ""}
          {lead.email ? `📧 ${lead.email}` : ""}
        </Text>
      )}

      <View style={styles.actions}>
        {onCall && (
          <TouchableOpacity style={styles.actionBtn} onPress={onCall}>
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
        )}
        {onText && (
          <TouchableOpacity style={styles.actionBtn} onPress={onText}>
            <Text style={styles.actionText}>Text</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.doneBtn} onPress={onMarkDone}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onMarkLost}>
          <Text style={[styles.actionText, { color: colors.zinc[500] }]}>Lost</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.zinc[900],
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  compactCard: {
    backgroundColor: colors.zinc[900],
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  compactContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  name: {
    color: colors.white,
    fontFamily: "WorkSans-SemiBold",
    fontSize: 16,
  },
  description: {
    color: colors.zinc[400],
    fontFamily: "WorkSans-Regular",
    fontSize: 14,
    marginTop: 2,
  },
  age: {
    color: colors.zinc[500],
    fontFamily: "WorkSans-Medium",
    fontSize: 12,
  },
  contact: {
    color: colors.zinc[500],
    fontSize: 13,
    marginBottom: 12,
    fontFamily: "WorkSans-Regular",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  actionBtn: {
    backgroundColor: colors.zinc[800],
    borderWidth: 1,
    borderColor: colors.zinc[700],
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
  },
  actionText: {
    color: colors.white,
    fontFamily: "WorkSans-SemiBold",
    fontSize: 13,
  },
  doneBtn: {
    backgroundColor: "rgba(22, 101, 52, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(22, 101, 52, 0.5)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
  },
  doneBtnText: {
    color: colors.green[400],
    fontFamily: "WorkSans-Bold",
    fontSize: 13,
  },
  compactActions: {
    flexDirection: "row",
    gap: 4,
  },
  wonBtn: {
    backgroundColor: "rgba(22, 101, 52, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  wonBtnText: {
    color: colors.green[400],
    fontFamily: "WorkSans-Bold",
    fontSize: 12,
  },
  lostBtn: {
    backgroundColor: colors.zinc[800],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  lostBtnText: {
    color: colors.zinc[400],
    fontFamily: "WorkSans-Bold",
    fontSize: 12,
  },
});
