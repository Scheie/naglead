import { useEffect, useRef } from "react";
import { StatusBar, TouchableOpacity, Text as RNText, View, Alert } from "react-native";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Sentry from "@sentry/react-native";
import { Teko_700Bold } from "@expo-google-fonts/teko";
import {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
} from "@expo-google-fonts/work-sans";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";

import { useAuth } from "./src/hooks/useAuth";
import { LoginScreen } from "./src/screens/LoginScreen";
import { SignupScreen } from "./src/screens/SignupScreen";
import { InboxScreen } from "./src/screens/InboxScreen";
import { AddLeadScreen } from "./src/screens/AddLeadScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { UpgradeSuccessScreen } from "./src/screens/UpgradeSuccessScreen";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotifications,
  savePushToken,
  addNotificationResponseListener,
} from "./src/lib/notifications";
import { colors } from "./src/lib/theme";
import type { AuthStackParamList, AppStackParamList } from "./src/navigation";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const linking = {
  prefixes: [Linking.createURL("/"), "naglead://"],
  config: {
    screens: {
      Inbox: "",
      AddLead: "add",
      UpgradeSuccess: "upgrade-success",
    },
  },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.black },
        animation: "slide_from_right",
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.black,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontFamily: "Teko-Bold",
          fontSize: 24,
        },
        contentStyle: { backgroundColor: colors.black },
      }}
    >
      <AppStack.Screen
        name="Inbox"
        component={InboxScreen}
        options={({ navigation }) => ({
          headerTitle: "NAGLEAD",
          headerTitleStyle: {
            fontFamily: "Teko-Bold",
            fontSize: 28,
            color: colors.white,
          },
          headerStyle: {
            backgroundColor: colors.black,
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: colors.zinc[900],
                borderWidth: 1,
                borderColor: colors.zinc[800],
              }}
            >
              <RNText style={{ fontSize: 13, color: colors.zinc[400], fontFamily: "WorkSans-SemiBold" }}>Settings</RNText>
            </TouchableOpacity>
          ),
        })}
      />
      <AppStack.Screen
        name="AddLead"
        component={AddLeadScreen}
        options={{
          headerTitle: "NEW LEAD",
          headerBackTitle: "Back",
        }}
      />
      <AppStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "SETTINGS",
          headerTitleStyle: {
            fontFamily: "Teko-Bold",
            fontSize: 24,
            color: colors.white,
          },
          headerStyle: {
            backgroundColor: colors.black,
          },
          headerBackTitle: "Back",
        }}
      />
      <AppStack.Screen
        name="UpgradeSuccess"
        component={UpgradeSuccessScreen}
        options={{ headerShown: false }}
      />
    </AppStack.Navigator>
  );
}

function App() {
  const { session, loading } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<AppStackParamList>>(null);

  const [fontsLoaded] = useFonts({
    "Teko-Bold": Teko_700Bold,
    "WorkSans-Regular": WorkSans_400Regular,
    "WorkSans-Medium": WorkSans_500Medium,
    "WorkSans-SemiBold": WorkSans_600SemiBold,
    "WorkSans-Bold": WorkSans_700Bold,
  });

  // Register for push notifications when logged in
  useEffect(() => {
    if (!session) return;

    async function setupPush() {
      // Check if we already have permission
      const { status } = await Notifications.getPermissionsAsync();
      if (status === "granted") {
        const token = await registerForPushNotifications();
        if (token) await savePushToken(token);
        return;
      }

      // First time — show a friendly prompt before the system dialog
      if (status !== "denied") {
        Alert.alert(
          "Enable nag reminders?",
          "NagLead needs notifications to nag you about unanswered leads. That's the whole point.",
          [
            { text: "Not now", style: "cancel" },
            {
              text: "Enable",
              onPress: async () => {
                const token = await registerForPushNotifications();
                if (token) await savePushToken(token);
              },
            },
          ]
        );
      }
    }

    setupPush();

    const sub = addNotificationResponseListener(() => {
      // Navigate to inbox so it refetches leads on focus
      if (navigationRef.current?.isReady()) {
        navigationRef.current.navigate("Inbox");
      }
    });

    return () => sub.remove();
  }, [session]);

  if (loading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.black }} />
    );
  }

  return (
    <NavigationContainer ref={navigationRef} linking={session ? linking : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={colors.black} />
      {session ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default Sentry.wrap(App);
