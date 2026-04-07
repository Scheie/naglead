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
} from "react-native";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);
    if (error) {
      Alert.alert("Login failed", error.message);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>NAGLEAD</Text>
        <Text style={styles.subtitle}>Stop losing leads.</Text>

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
          placeholder="Password"
          placeholderTextColor={colors.zinc[500]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "LOGGING IN..." : "LOG IN"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.link}>
            No account? <Text style={styles.linkOrange}>Sign up free</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  inner: {
    flex: 1,
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
