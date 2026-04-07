import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Linking,
  TextInput,
  Platform,
} from "react-native";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";
import { PickerModal } from "../components/PickerModal";
import type { UserProfile } from "../lib/types";

const COUNTRIES = [
  { code: "US", flag: "🇺🇸", currency: "USD", symbol: "$" },
  { code: "CA", flag: "🇨🇦", currency: "CAD", symbol: "C$" },
  { code: "GB", flag: "🇬🇧", currency: "GBP", symbol: "£" },
  { code: "AU", flag: "🇦🇺", currency: "AUD", symbol: "A$" },
  { code: "NZ", flag: "🇳🇿", currency: "NZD", symbol: "NZ$" },
  { code: "IE", flag: "🇮🇪", currency: "EUR", symbol: "€" },
  { code: "DE", flag: "🇩🇪", currency: "EUR", symbol: "€" },
  { code: "FR", flag: "🇫🇷", currency: "EUR", symbol: "€" },
  { code: "ES", flag: "🇪🇸", currency: "EUR", symbol: "€" },
  { code: "IT", flag: "🇮🇹", currency: "EUR", symbol: "€" },
  { code: "NL", flag: "🇳🇱", currency: "EUR", symbol: "€" },
  { code: "SE", flag: "🇸🇪", currency: "SEK", symbol: "kr" },
  { code: "NO", flag: "🇳🇴", currency: "NOK", symbol: "kr" },
  { code: "DK", flag: "🇩🇰", currency: "DKK", symbol: "kr" },
  { code: "FI", flag: "🇫🇮", currency: "EUR", symbol: "€" },
  { code: "CH", flag: "🇨🇭", currency: "CHF", symbol: "CHF" },
  { code: "IN", flag: "🇮🇳", currency: "INR", symbol: "₹" },
  { code: "ZA", flag: "🇿🇦", currency: "ZAR", symbol: "R" },
  { code: "MX", flag: "🇲🇽", currency: "MXN", symbol: "MX$" },
  { code: "BR", flag: "🇧🇷", currency: "BRL", symbol: "R$" },
  { code: "JP", flag: "🇯🇵", currency: "JPY", symbol: "¥" },
] as const;

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Toronto",
  "America/Sao_Paulo",
  "America/Mexico_City",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Oslo",
  "Europe/Stockholm",
  "Europe/Helsinki",
  "Europe/Amsterdam",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Australia/Perth",
  "Pacific/Auckland",
] as const;

// Detect if user's locale uses 12-hour clock
const is12Hour = (() => {
  try {
    const formatted = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).format(new Date(2000, 0, 1, 13));
    return /PM|AM/i.test(formatted);
  } catch {
    return true; // default to 12h
  }
})();

// Format "HH:MM" for display, respecting locale clock format
function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const mm = m.toString().padStart(2, "0");
  if (!is12Hour) return `${h.toString().padStart(2, "0")}:${mm}`;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${mm} ${ampm}`;
}

// Every hour for full quiet hours customization
const ALL_HOURS = Array.from({ length: 24 }, (_, i) => {
  const hh = i.toString().padStart(2, "0");
  return `${hh}:00`;
});

export function SettingsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [trade, setTrade] = useState("");
  const [nagEnabled, setNagEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState("21:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [country, setCountry] = useState("US");

  // Modal visibility
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);
  const [showQuietStartPicker, setShowQuietStartPicker] = useState(false);
  const [showQuietEndPicker, setShowQuietEndPicker] = useState(false);

  const countryOptions = useMemo(() =>
    COUNTRIES.map((c) => ({ label: `${c.flag} ${c.code} — ${c.symbol} (${c.currency})`, value: c.code })),
    []
  );

  const timezoneOptions = useMemo(() =>
    TIMEZONES.map((tz) => ({ label: tz.replace(/_/g, " "), value: tz })),
    []
  );

  const hourOptions = useMemo(() =>
    ALL_HOURS.map((h) => ({ label: formatTime(h), value: h })),
    []
  );

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile(data);
        setName(data.name ?? "");
        setBusinessName(data.business_name ?? "");
        setTrade(data.trade ?? "");
        setNagEnabled(data.nag_enabled ?? true);
        setQuietStart(data.nag_quiet_start ?? "21:00");
        setQuietEnd(data.nag_quiet_end ?? "07:00");
        setTimezone(data.timezone ?? "America/New_York");
        setCountry(data.country ?? "US");
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!profile || !name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({
        name: name.trim(),
        business_name: businessName.trim() || null,
        trade: trade.trim() || null,
        nag_enabled: nagEnabled,
        nag_quiet_start: quietStart,
        nag_quiet_end: quietEnd,
        timezone,
        country,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      Alert.alert("Error", "Failed to save settings");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleUpgrade(plan: "pro" | "pro_annual") {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      Alert.alert("Error", "Not logged in");
      return;
    }

    try {
      const res = await fetch(
        `https://naglead.com/api/mobile/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ plan }),
        }
      );
      const data = await res.json();
      if (data.url) {
        Linking.openURL(data.url);
      } else {
        Alert.alert("Error", data.error ?? "Failed to start checkout");
      }
    } catch {
      Alert.alert("Error", "Could not connect to server");
    }
  }

  async function handleManageSubscription() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const res = await fetch(
        `https://naglead.com/api/stripe/portal`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      const data = await res.json();
      if (data.url) {
        Linking.openURL(data.url);
      }
    } catch {
      Alert.alert("Error", "Could not connect to server");
    }
  }

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  }

  async function handleDeleteAccount() {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account, all leads, and all history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(
              `https://naglead.com/api/account/delete`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              }
            );

            if (res.ok) {
              await supabase.auth.signOut();
            } else {
              Alert.alert("Error", "Failed to delete account. Try from the web app.");
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const selectedCountry = COUNTRIES.find((c) => c.code === country);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile */}
      <Text style={styles.sectionTitle}>PROFILE</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.zinc[600]}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Business Name</Text>
        <TextInput
          style={styles.input}
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="Optional"
          placeholderTextColor={colors.zinc[600]}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Trade</Text>
        <TextInput
          style={styles.input}
          value={trade}
          onChangeText={setTrade}
          placeholder="Plumber, Electrician, etc."
          placeholderTextColor={colors.zinc[600]}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
        <Text style={styles.valueSubtle}>{profile?.email}</Text>
      </View>

      {/* Region */}
      <Text style={styles.sectionTitle}>REGION</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Country</Text>
        <TouchableOpacity
          style={styles.pickerBtn}
          onPress={() => setShowCountryPicker(true)}
        >
          <Text style={styles.pickerBtnText}>
            {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.code} — ${selectedCountry.symbol} (${selectedCountry.currency})` : country}
          </Text>
          <Text style={styles.pickerChevron}>›</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 14 }]}>Timezone</Text>
        <TouchableOpacity
          style={styles.pickerBtn}
          onPress={() => setShowTimezonePicker(true)}
        >
          <Text style={styles.pickerBtnText}>
            {timezone.replace(/_/g, " ")}
          </Text>
          <Text style={styles.pickerChevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Nag Settings */}
      <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.value}>Nag Notifications</Text>
            <Text style={styles.valueSubtle}>
              {nagEnabled
                ? "We'll nag you about unanswered leads"
                : "Nagging is paused"}
            </Text>
          </View>
          <Switch
            value={nagEnabled}
            onValueChange={setNagEnabled}
            trackColor={{ false: colors.zinc[700], true: colors.orange }}
            thumbColor={colors.white}
          />
        </View>

        {nagEnabled && (
          <>
            <View style={styles.quietRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { marginTop: 14 }]}>Quiet After</Text>
                <TouchableOpacity
                  style={styles.pickerBtn}
                  onPress={() => setShowQuietStartPicker(true)}
                >
                  <Text style={styles.pickerBtnText}>{formatTime(quietStart)}</Text>
                  <Text style={styles.pickerChevron}>›</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { marginTop: 14 }]}>Resume At</Text>
                <TouchableOpacity
                  style={styles.pickerBtn}
                  onPress={() => setShowQuietEndPicker(true)}
                >
                  <Text style={styles.pickerBtnText}>{formatTime(quietEnd)}</Text>
                  <Text style={styles.pickerChevron}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.quietHint}>No nags during quiet hours</Text>
          </>
        )}
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>
          {saving ? "SAVING..." : saved ? "SAVED" : "SAVE SETTINGS"}
        </Text>
      </TouchableOpacity>

      {/* Plan */}
      <Text style={styles.sectionTitle}>PLAN</Text>
      <View style={styles.card}>
        <Text style={styles.value}>
          {profile?.subscription_status === "pro_annual"
            ? "Pro Annual"
            : profile?.subscription_status === "pro"
              ? "Pro"
              : "Free (5 active leads)"}
        </Text>

        {profile?.subscription_status === "free" && (
          <View style={{ marginTop: 12, gap: 8 }}>
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => handleUpgrade("pro")}
            >
              <Text style={styles.upgradeBtnText}>UPGRADE TO PRO — $10/MO</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.upgradeAnnualBtn}
              onPress={() => handleUpgrade("pro_annual")}
            >
              <Text style={styles.upgradeAnnualText}>Go Annual — $89/yr (save $31)</Text>
            </TouchableOpacity>
          </View>
        )}

        {profile?.subscription_status !== "free" && (
          <TouchableOpacity
            style={{ marginTop: 12 }}
            onPress={handleManageSubscription}
          >
            <Text style={styles.proHint}>
              Manage subscription, billing, or cancel
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Intake Email */}
      {profile?.intake_alias && (
        <>
          <Text style={styles.sectionTitle}>EMAIL INTAKE</Text>
          <View style={styles.card}>
            <Text style={styles.valueSubtle}>Forward lead emails to:</Text>
            <Text style={[styles.value, { color: colors.orange, marginTop: 4 }]}>
              {profile.intake_alias}@leads.naglead.com
            </Text>
          </View>
        </>
      )}

      {/* Phone — coming soon */}
      <Text style={styles.sectionTitle}>PHONE & SMS</Text>
      <View style={styles.card}>
        <Text style={styles.value}>Dedicated Business Number</Text>
        <Text style={[styles.valueSubtle, { marginTop: 4 }]}>
          Auto-create leads from missed calls and texts. Coming soon as a Pro feature.
        </Text>
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>COMING SOON</Text>
        </View>
      </View>

      {/* Legal */}
      <Text style={styles.sectionTitle}>LEGAL</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.legalRow} onPress={() => Linking.openURL("https://naglead.com/terms")}>
          <Text style={styles.legalText}>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.legalRow} onPress={() => Linking.openURL("https://naglead.com/privacy")}>
          <Text style={styles.legalText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.legalRow, { borderBottomWidth: 0 }]} onPress={() => Linking.openURL("https://naglead.com/refunds")}>
          <Text style={styles.legalText}>Refund Policy</Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>

      <PickerModal
        visible={showCountryPicker}
        title="COUNTRY"
        options={countryOptions}
        selected={country}
        onSelect={setCountry}
        onClose={() => setShowCountryPicker(false)}
      />
      <PickerModal
        visible={showTimezonePicker}
        title="TIMEZONE"
        options={timezoneOptions}
        selected={timezone}
        onSelect={setTimezone}
        onClose={() => setShowTimezonePicker(false)}
      />
      <PickerModal
        visible={showQuietStartPicker}
        title="QUIET AFTER"
        options={hourOptions}
        selected={quietStart}
        onSelect={setQuietStart}
        onClose={() => setShowQuietStartPicker(false)}
      />
      <PickerModal
        visible={showQuietEndPicker}
        title="RESUME AT"
        options={hourOptions}
        selected={quietEnd}
        onSelect={setQuietEnd}
        onClose={() => setShowQuietEndPicker(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  loadingText: {
    color: colors.zinc[500],
    fontSize: 16,
    textAlign: "center",
    marginTop: 100,
  },
  sectionTitle: {
    fontFamily: "Teko-Bold",
    fontSize: 20,
    color: colors.zinc[400],
    marginTop: 24,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.zinc[900],
    borderWidth: 1,
    borderColor: colors.zinc[800],
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontFamily: "WorkSans-Bold",
    fontSize: 11,
    color: colors.zinc[500],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.zinc[800],
    borderWidth: 1,
    borderColor: colors.zinc[700],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    color: colors.white,
    fontFamily: "WorkSans-Medium",
    fontSize: 15,
  },
  value: {
    fontFamily: "WorkSans-SemiBold",
    fontSize: 16,
    color: colors.white,
  },
  valueSubtle: {
    fontFamily: "WorkSans-Regular",
    fontSize: 14,
    color: colors.zinc[500],
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quietRow: {
    flexDirection: "row",
    gap: 12,
  },
  quietHint: {
    fontFamily: "WorkSans-Regular",
    fontSize: 12,
    color: colors.zinc[600],
    marginTop: 8,
  },
  pickerBtn: {
    backgroundColor: colors.zinc[800],
    borderWidth: 1,
    borderColor: colors.zinc[700],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerBtnText: {
    color: colors.white,
    fontFamily: "WorkSans-Medium",
    fontSize: 14,
    flex: 1,
  },
  pickerChevron: {
    color: colors.zinc[500],
    fontSize: 18,
    fontFamily: "WorkSans-Bold",
    marginLeft: 8,
  },
  saveBtn: {
    backgroundColor: colors.orange,
    paddingVertical: 16,
    borderRadius: 4,
    marginTop: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  saveBtnText: {
    fontFamily: "Teko-Bold",
    fontSize: 24,
    color: colors.black,
    textAlign: "center",
  },
  proHint: {
    fontFamily: "WorkSans-SemiBold",
    fontSize: 13,
    color: colors.orange,
    marginTop: 8,
  },
  upgradeBtn: {
    backgroundColor: colors.orange,
    paddingVertical: 14,
    borderRadius: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  upgradeBtnText: {
    fontFamily: "Teko-Bold",
    fontSize: 22,
    color: colors.black,
    textAlign: "center",
  },
  upgradeAnnualBtn: {
    backgroundColor: colors.zinc[800],
    paddingVertical: 12,
    borderRadius: 8,
  },
  upgradeAnnualText: {
    fontFamily: "WorkSans-SemiBold",
    fontSize: 14,
    color: colors.zinc[300],
    textAlign: "center",
  },
  signOutBtn: {
    backgroundColor: colors.zinc[900],
    borderWidth: 1,
    borderColor: colors.zinc[800],
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 32,
    alignItems: "center",
  },
  signOutText: {
    fontFamily: "WorkSans-SemiBold",
    fontSize: 15,
    color: colors.zinc[400],
  },
  deleteBtn: {
    backgroundColor: colors.zinc[900],
    borderWidth: 1,
    borderColor: colors.red[900],
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 12,
    alignItems: "center",
  },
  deleteText: {
    fontFamily: "WorkSans-SemiBold",
    fontSize: 15,
    color: colors.red[400],
  },
  comingSoonBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.zinc[800],
    borderWidth: 1,
    borderColor: colors.zinc[700],
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 10,
  },
  comingSoonText: {
    fontFamily: "WorkSans-Bold",
    fontSize: 10,
    color: colors.zinc[500],
    letterSpacing: 1,
  },
  legalRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc[800],
  },
  legalText: {
    fontFamily: "WorkSans-Medium",
    fontSize: 15,
    color: colors.zinc[300],
  },
});
