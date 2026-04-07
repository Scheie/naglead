import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
  Alert,
} from "react-native";
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

const LOST_REASONS = ["Competitor", "No budget", "No response", "Other"] as const;

interface LeadCardProps {
  lead: Lead;
  compact?: boolean;
  onMarkDone: (valueCents?: number) => void;
  onMarkLost: (reason?: string) => void;
  onSnooze?: (until: Date) => void;
  onCall?: () => void;
  onText?: () => void;
  onEmail?: () => void;
}

export function LeadCard({
  lead,
  compact,
  onMarkDone,
  onMarkLost,
  onSnooze,
  onCall,
  onText,
  onEmail,
}: LeadCardProps) {
  const [showValueInput, setShowValueInput] = useState(false);
  const [valueInput, setValueInput] = useState("");
  const [showLostReasons, setShowLostReasons] = useState(false);
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

  function handleSnooze() {
    const now = new Date();
    const tomorrow8am = new Date(now);
    tomorrow8am.setDate(tomorrow8am.getDate() + 1);
    tomorrow8am.setHours(8, 0, 0, 0);

    const in3days = new Date(now);
    in3days.setDate(in3days.getDate() + 3);
    in3days.setHours(9, 0, 0, 0);

    const in1week = new Date(now);
    in1week.setDate(in1week.getDate() + 7);
    in1week.setHours(9, 0, 0, 0);

    Alert.alert(`Snooze "${lead.name}"`, "Pause nags until:", [
      { text: "1 hour", onPress: () => onSnooze?.(new Date(now.getTime() + 3600000)) },
      { text: "Tomorrow 8am", onPress: () => onSnooze?.(tomorrow8am) },
      { text: "3 days", onPress: () => onSnooze?.(in3days) },
      { text: "1 week", onPress: () => onSnooze?.(in1week) },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function handleWon() {
    if (showValueInput) {
      const cleaned = valueInput.replace(/[^0-9.]/g, "");
      const parsed = parseFloat(cleaned);
      const valueCents = !isNaN(parsed) && parsed > 0 ? Math.round(parsed * 100) : undefined;
      onMarkDone(valueCents);
      setShowValueInput(false);
      setValueInput("");
    } else {
      setShowValueInput(true);
      setShowLostReasons(false);
    }
  }

  function handleLostReason(reason: string) {
    onMarkLost(reason);
    setShowLostReasons(false);
  }

  // "Done" on reply_now cards means mark replied (no value needed)
  function markReplied() {
    onMarkDone();
  }

  if (compact) {
    return (
      <View style={[styles.compactCard, { borderColor: colors.zinc[800] }]}>
        <View style={styles.compactContent}>
          <Text style={styles.name} numberOfLines={1}>{lead.name}</Text>
          <Text style={styles.description} numberOfLines={1}>{lead.description}</Text>
          {showValueInput && (
            <View style={styles.valueRow}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.valueInput}
                value={valueInput}
                onChangeText={setValueInput}
                placeholder="Value"
                placeholderTextColor={colors.zinc[600]}
                keyboardType="decimal-pad"
                autoFocus
                onSubmitEditing={handleWon}
              />
              <TouchableOpacity style={styles.valueSubmit} onPress={handleWon}>
                <Text style={styles.valueSubmitText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { onMarkDone(); setShowValueInput(false); }}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>
          )}
          {showLostReasons && (
            <View style={styles.reasonRow}>
              {LOST_REASONS.map((r) => (
                <TouchableOpacity key={r} style={styles.reasonBtn} onPress={() => handleLostReason(r)}>
                  <Text style={styles.reasonBtnText}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {!showValueInput && !showLostReasons && (
          <>
            <Text style={styles.age}>{age}</Text>
            <View style={styles.compactActions}>
              <TouchableOpacity style={styles.wonBtn} onPress={handleWon}>
                <Text style={styles.wonBtnText}>🏆 WON</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.lostBtn} onPress={() => { setShowLostReasons(true); setShowValueInput(false); }}>
                <Text style={styles.lostBtnText}>✕ LOST</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
            <Text style={styles.actionText}>📞 Call</Text>
          </TouchableOpacity>
        )}
        {onText && (
          <TouchableOpacity style={styles.actionBtn} onPress={onText}>
            <Text style={styles.actionText}>💬 Text</Text>
          </TouchableOpacity>
        )}
        {onEmail && (
          <TouchableOpacity style={styles.actionBtn} onPress={onEmail}>
            <Text style={styles.actionText}>📧 Email</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.doneBtn} onPress={() => markReplied()}>
          <Text style={styles.doneBtnText}>✅ Replied</Text>
        </TouchableOpacity>
        {onSnooze && (
          <TouchableOpacity style={styles.actionBtn} onPress={handleSnooze}>
            <Text style={styles.actionText}>😴 Snooze</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={() => { setShowLostReasons(!showLostReasons); setShowValueInput(false); }}>
          <Text style={[styles.actionText, { color: colors.zinc[500] }]}>✕ Lost</Text>
        </TouchableOpacity>
      </View>

      {showLostReasons && (
        <View style={styles.reasonRow}>
          {LOST_REASONS.map((r) => (
            <TouchableOpacity key={r} style={styles.reasonBtn} onPress={() => handleLostReason(r)}>
              <Text style={styles.reasonBtnText}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
    flexWrap: "wrap",
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
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  currencySymbol: {
    color: colors.zinc[400],
    fontFamily: "WorkSans-Bold",
    fontSize: 16,
  },
  valueInput: {
    flex: 1,
    backgroundColor: colors.zinc[800],
    borderWidth: 1,
    borderColor: colors.zinc[700],
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.white,
    fontFamily: "WorkSans-Medium",
    fontSize: 14,
  },
  valueSubmit: {
    backgroundColor: colors.green[800],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  valueSubmitText: {
    color: colors.green[400],
    fontFamily: "WorkSans-Bold",
    fontSize: 14,
  },
  skipText: {
    color: colors.zinc[500],
    fontFamily: "WorkSans-Medium",
    fontSize: 12,
  },
  reasonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  reasonBtn: {
    backgroundColor: colors.zinc[800],
    borderWidth: 1,
    borderColor: colors.zinc[700],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reasonBtnText: {
    color: colors.zinc[400],
    fontFamily: "WorkSans-SemiBold",
    fontSize: 12,
  },
});
