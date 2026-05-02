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
import * as Clipboard from "expo-clipboard";
import { supabase } from "../lib/supabase";
import { generateIntakeAlias } from "../lib/intake-alias";
import { colors } from "../lib/theme";
import { PickerModal } from "../components/PickerModal";
import type { UserProfile } from "../lib/types";
import { COUNTRIES, TIMEZONES } from "../lib/country-codes";

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

const SETUP_GUIDES: { provider: string; steps: string[] }[] = [
  {
    provider: "Gmail",
    steps: [
      'Open Gmail Settings (gear icon) → "See all settings"',
      'Go to the "Forwarding and POP/IMAP" tab',
      'Click "Add a forwarding address" and paste your NagLead address',
      "Gmail will send a confirmation — check your inbox for the code",
      'Create a filter for your lead sources, set action to "Forward to" your NagLead address',
    ],
  },
  {
    provider: "Outlook / Microsoft 365",
    steps: [
      "Go to Settings → Mail → Rules",
      'Click "Add new rule", name it "Forward leads to NagLead"',
      'Set condition: "From contains" your lead source domains',
      'Set action: "Forward to" → paste your NagLead address',
      "Save the rule",
    ],
  },
  {
    provider: "iPhone / iOS Mail",
    steps: [
      "iOS Mail doesn't support auto-forwarding rules",
      "When you get a lead email, tap the Forward button",
      "Forward it to your NagLead address",
      "For automatic forwarding, set up a rule in your email provider instead",
    ],
  },
  {
    provider: "Yahoo Mail",
    steps: [
      "Go to Settings → More Settings → Mailboxes",
      "Select your email address",
      'Under "Forwarding", enter your NagLead address',
      "Click Verify and follow the confirmation steps",
    ],
  },
  {
    provider: "Any Email (Manual)",
    steps: [
      "Open any email that contains a lead",
      "Tap Forward",
      "Send to your NagLead address",
      "We'll extract the name, phone, email, and what they need automatically",
    ],
  },
];

function EmailIntakeSection({ alias }: { alias: string }) {
  const [copied, setCopied] = useState(false);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const intakeEmail = `leads+${alias}@naglead.com`;

  async function copyEmail() {
    await Clipboard.setStringAsync(intakeEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Text style={styles.sectionTitle}>EMAIL INTAKE</Text>
      <View style={styles.card}>
        <Text style={styles.valueSubtle}>Forward lead emails to:</Text>
        <TouchableOpacity onPress={copyEmail} style={styles.copyRow}>
          <Text style={[styles.value, { color: colors.orange, flex: 1 }]} numberOfLines={1}>
            {intakeEmail}
          </Text>
          <Text style={styles.copyBtn}>{copied ? "COPIED" : "COPY"}</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 16, marginBottom: 8 }]}>SETUP GUIDES</Text>
        {SETUP_GUIDES.map((guide) => {
          const isOpen = expandedGuide === guide.provider;
          return (
            <View key={guide.provider}>
              <TouchableOpacity
                style={styles.guideHeader}
                onPress={() => setExpandedGuide(isOpen ? null : guide.provider)}
              >
                <Text style={styles.guideProvider}>{guide.provider}</Text>
                <Text style={styles.pickerChevron}>{isOpen ? "⌄" : "›"}</Text>
              </TouchableOpacity>
              {isOpen && (
                <View style={styles.guideSteps}>
                  {guide.steps.map((step, i) => (
                    <View key={i} style={styles.guideStep}>
                      <Text style={styles.guideStepNum}>{i + 1}.</Text>
                      <Text style={styles.guideStepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </>
  );
}

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
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
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
    COUNTRIES.map((c) => ({ label: `${c.flag} ${c.code} — ${c.currencySymbol} (${c.currency})`, value: c.code })),
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
        const qs = data.nag_quiet_start ?? "21:00";
        const qe = data.nag_quiet_end ?? "07:00";
        setQuietStart(qs);
        setQuietEnd(qe);
        // If start equals end, quiet hours are effectively disabled
        setQuietHoursEnabled(qs !== qe);
        setTimezone(data.timezone ?? "America/New_York");
        setCountry(data.country ?? "US");

        // Generate intake alias if user doesn't have one yet
        if (!data.intake_alias) {
          let alias = generateIntakeAlias();
          let retries = 0;
          while (retries < 5) {
            const { error } = await supabase
              .from("users")
              .update({ intake_alias: alias })
              .eq("id", user.id);
            if (!error) {
              data.intake_alias = alias;
              setProfile({ ...data, intake_alias: alias });
              break;
            }
            alias = generateIntakeAlias();
            retries++;
          }
        }
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
        nag_quiet_start: quietHoursEnabled ? quietStart : "00:00",
        nag_quiet_end: quietHoursEnabled ? quietEnd : "00:00",
        timezone,
        country,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      Alert.alert("Error", "Failed to save settings");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          // Clear push token so notifications stop after sign out
          if (profile?.id) {
            await supabase
              .from("users")
              .update({ push_token: null })
              .eq("id", profile.id);
          }
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

            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 15000);
              const res = await fetch(
                `https://naglead.com/api/account/delete`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${session.access_token}`,
                  },
                  signal: controller.signal,
                }
              );
              clearTimeout(timeout);

              if (res.ok) {
                await supabase.auth.signOut();
              } else {
                Alert.alert("Error", "Failed to delete account. Try from the web app.");
              }
            } catch {
              Alert.alert("Error", "Could not connect to server. Check your connection.");
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
          maxLength={255}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Business Name</Text>
        <TextInput
          style={styles.input}
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="Optional"
          placeholderTextColor={colors.zinc[600]}
          maxLength={255}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Trade</Text>
        <TextInput
          style={styles.input}
          value={trade}
          onChangeText={setTrade}
          placeholder="Plumber, Electrician, etc."
          placeholderTextColor={colors.zinc[600]}
          maxLength={255}
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
            {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.code} — ${selectedCountry.currencySymbol} (${selectedCountry.currency})` : country}
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
            <View style={[styles.toggleRow, { marginTop: 14 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.value}>Quiet Hours</Text>
                <Text style={styles.valueSubtle}>
                  {quietHoursEnabled
                    ? "Pause nags during set hours"
                    : "Nag me anytime, 24/7"}
                </Text>
              </View>
              <Switch
                value={quietHoursEnabled}
                onValueChange={setQuietHoursEnabled}
                trackColor={{ false: colors.zinc[700], true: colors.orange }}
                thumbColor={colors.white}
              />
            </View>

            {quietHoursEnabled && (
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
            )}
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

      {/* Intake Email — shown for users with an alias */}
      {profile?.intake_alias && (
        <EmailIntakeSection alias={profile.intake_alias} />
      )}

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
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  copyBtn: {
    fontFamily: "WorkSans-Bold",
    fontSize: 11,
    color: colors.orange,
    backgroundColor: "rgba(255, 69, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc[800],
  },
  guideProvider: {
    fontFamily: "WorkSans-SemiBold",
    fontSize: 14,
    color: colors.zinc[300],
  },
  guideSteps: {
    paddingVertical: 8,
    paddingLeft: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc[800],
  },
  guideStep: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  guideStepNum: {
    fontFamily: "WorkSans-Bold",
    fontSize: 12,
    color: colors.zinc[500],
    width: 16,
  },
  guideStepText: {
    fontFamily: "WorkSans-Regular",
    fontSize: 13,
    color: colors.zinc[400],
    flex: 1,
    lineHeight: 18,
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
