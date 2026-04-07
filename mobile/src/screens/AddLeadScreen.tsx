import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../navigation";

type Props = NativeStackScreenProps<AppStackParamList, "AddLead">;

export function AddLeadScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || !description.trim()) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Error", "Not logged in");
      setSaving(false);
      return;
    }

    // Check for duplicate active leads by name or email
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    let dupeQuery = supabase
      .from("leads")
      .select("name")
      .eq("user_id", user.id)
      .in("state", ["reply_now", "waiting"]);

    if (trimmedEmail) {
      dupeQuery = dupeQuery.or(`name.ilike."${trimmedName}",email.ilike."${trimmedEmail}"`);
    } else {
      dupeQuery = dupeQuery.ilike("name", trimmedName);
    }

    const { data: dupes } = await dupeQuery;
    if (dupes && dupes.length > 0) {
      const proceed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Possible duplicate",
          `You already have an active lead named "${dupes[0].name}". Add anyway?`,
          [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            { text: "Add Anyway", onPress: () => resolve(true) },
          ]
        );
      });
      if (!proceed) {
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase.from("leads").insert({
      user_id: user.id,
      name: trimmedName,
      description: description.trim(),
      phone: phone.trim() || null,
      email: trimmedEmail || null,
      state: "reply_now",
      source: "manual",
    });

    if (error) {
      Alert.alert(
        "Failed",
        error.message?.includes("Free tier")
          ? "Free tier limit reached (5 active leads). Mark some as won or lost to free up slots."
          : "Failed to add lead"
      );
      setSaving(false);
      return;
    }

    // Log event
    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", name.trim())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lead) {
      await supabase.from("lead_events").insert({
        lead_id: lead.id,
        user_id: user.id,
        event_type: "created",
        metadata: { source: "manual" },
      });
    }

    navigation.goBack();
  }

  const canSave = name.trim().length > 0 && description.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>+ NEW LEAD</Text>

        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Sarah M."
          placeholderTextColor={colors.zinc[500]}
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <Text style={styles.label}>What do they need? *</Text>
        <TextInput
          style={styles.input}
          placeholder="bathroom reno"
          placeholderTextColor={colors.zinc[500]}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional"
          placeholderTextColor={colors.zinc[500]}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional"
          placeholderTextColor={colors.zinc[500]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, (!canSave || saving) && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "SAVING..." : "SAVE LEAD"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  inner: {
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontFamily: "Teko-Bold",
    fontSize: 36,
    color: colors.white,
    marginBottom: 24,
  },
  label: {
    color: colors.zinc[500],
    fontSize: 11,
    fontFamily: "WorkSans-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.zinc[900],
    borderWidth: 2,
    borderColor: colors.zinc[700],
    borderRadius: 6,
    padding: 16,
    color: colors.white,
    fontSize: 16,
    marginBottom: 16,
    fontFamily: "WorkSans-Regular",
  },
  button: {
    backgroundColor: colors.orange,
    paddingVertical: 16,
    borderRadius: 4,
    marginTop: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: "Teko-Bold",
    fontSize: 28,
    color: colors.black,
    textAlign: "center",
  },
});
