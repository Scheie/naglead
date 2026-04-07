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
import type { AuthStackParamList } from "../navigation";

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

export function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [trade, setTrade] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password) return;
    setLoading(true);

    const emailDomain = email.trim().split("@")[1]?.toLowerCase();
    if (emailDomain === "naglead.com" || emailDomain === "leads.naglead.com") {
      Alert.alert("Invalid email", "You cannot register with a naglead.com email address.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          trade: trade.trim() || null,
        },
      },
    });

    setLoading(false);
    if (error) {
      Alert.alert("Signup failed", error.message);
    } else {
      Alert.alert(
        "Check your email",
        "We sent you a confirmation link. Tap it to activate your account.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.logo}>NAGLEAD</Text>
        <Text style={styles.subtitle}>Start getting nagged.</Text>

        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={colors.zinc[500]}
          value={name}
          onChangeText={setName}
          textContentType="name"
        />

        <TextInput
          style={styles.input}
          placeholder="Your trade (e.g. Plumber, Electrician)"
          placeholderTextColor={colors.zinc[500]}
          value={trade}
          onChangeText={setTrade}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.zinc[500]}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
          placeholderTextColor={colors.zinc[500]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="newPassword"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "CREATING ACCOUNT..." : "START FREE"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>
            Already have an account? <Text style={styles.linkOrange}>Log in</Text>
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
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    fontFamily: "Teko-Bold",
    fontSize: 56,
    color: colors.white,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.zinc[400],
    textAlign: "center",
    marginBottom: 40,
    fontFamily: "WorkSans-Medium",
  },
  input: {
    backgroundColor: colors.zinc[900],
    borderWidth: 2,
    borderColor: colors.zinc[700],
    borderRadius: 6,
    padding: 16,
    color: colors.white,
    fontSize: 16,
    marginBottom: 12,
    fontFamily: "WorkSans-Regular",
  },
  button: {
    backgroundColor: colors.orange,
    paddingVertical: 16,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 24,
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
  link: {
    textAlign: "center",
    color: colors.zinc[400],
    fontSize: 14,
    fontFamily: "WorkSans-Medium",
  },
  linkOrange: {
    color: colors.orange,
  },
});
