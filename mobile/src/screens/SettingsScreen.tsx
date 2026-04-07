"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";
import type { UserProfile } from "../lib/types";

export function SettingsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleNag(enabled: boolean) {
    if (!profile) return;
    setProfile({ ...profile, nag_enabled: enabled });
    await supabase
      .from("users")
      .update({ nag_enabled: enabled })
      .eq("id", profile.id);
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
              `${process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(".supabase.co", "")}.vercel.app/api/account/delete`,
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile */}
      <Text style={styles.sectionTitle}>PROFILE</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{profile?.name}</Text>
        {profile?.trade && (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>Trade</Text>
            <Text style={styles.value}>{profile.trade}</Text>
          </>
        )}
        <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
        <Text style={styles.valueSubtle}>{profile?.email}</Text>
      </View>

      {/* Plan */}
      <Text style={styles.sectionTitle}>PLAN</Text>
      <View style={styles.card}>
        <Text style={styles.value}>
          {profile?.subscription_status === "pro_annual"
            ? "Pro Annual"
            : profile?.subscription_status === "pro"
              ? "Pro"
              : "Free"}
        </Text>
        {profile?.subscription_status === "free" && (
          <Text style={styles.proHint}>
            Pro plans coming soon — unlimited leads
          </Text>
        )}
      </View>

      {/* Nag Settings */}
      <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.value}>Nag Notifications</Text>
            <Text style={styles.valueSubtle}>
              {profile?.nag_enabled
                ? "We'll nag you about unanswered leads"
                : "Nagging is paused"}
            </Text>
          </View>
          <Switch
            value={profile?.nag_enabled ?? true}
            onValueChange={toggleNag}
            trackColor={{ false: colors.zinc[700], true: colors.orange }}
            thumbColor={colors.white}
          />
        </View>
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

      {/* Actions */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>
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
    marginBottom: 2,
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
  proHint: {
    fontFamily: "WorkSans-SemiBold",
    fontSize: 13,
    color: colors.orange,
    marginTop: 8,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
});
