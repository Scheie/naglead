import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../navigation";

type Props = NativeStackScreenProps<AppStackParamList, "UpgradeSuccess">;

export function UpgradeSuccessScreen({ navigation }: Props) {
  useEffect(() => {
    supabase.auth.refreshSession();
    const timer = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: "Inbox" }] });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>YOU'RE PRO</Text>
      <Text style={styles.subtitle}>Unlimited leads, email intake, and more.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontFamily: "Teko-Bold",
    fontSize: 48,
    color: colors.orange,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "WorkSans-Medium",
    fontSize: 16,
    color: colors.zinc[400],
    textAlign: "center",
  },
});
