import { useEffect } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";

import { useAuth } from "./src/hooks/useAuth";
import { LoginScreen } from "./src/screens/LoginScreen";
import { SignupScreen } from "./src/screens/SignupScreen";
import { InboxScreen } from "./src/screens/InboxScreen";
import { AddLeadScreen } from "./src/screens/AddLeadScreen";
import {
  registerForPushNotifications,
  savePushToken,
  addNotificationResponseListener,
} from "./src/lib/notifications";
import { colors } from "./src/lib/theme";
import type { AuthStackParamList, AppStackParamList } from "./src/navigation";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const linking = {
  prefixes: [Linking.createURL("/"), "naglead://"],
  config: {
    screens: {
      Inbox: "",
      AddLead: "add",
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
        options={{
          headerTitle: "NAGLEAD",
          headerTitleStyle: {
            fontFamily: "Teko-Bold",
            fontSize: 28,
            color: colors.white,
          },
          headerStyle: {
            backgroundColor: colors.black,
          },
        }}
      />
      <AppStack.Screen
        name="AddLead"
        component={AddLeadScreen}
        options={{
          headerTitle: "",
          presentation: "modal",
        }}
      />
    </AppStack.Navigator>
  );
}

export default function App() {
  const { session, loading } = useAuth();

  const [fontsLoaded] = useFonts({
    "Teko-Bold": require("./assets/fonts/Teko-Bold.ttf"),
    "WorkSans-Regular": require("./assets/fonts/WorkSans-Regular.ttf"),
    "WorkSans-Medium": require("./assets/fonts/WorkSans-Medium.ttf"),
    "WorkSans-SemiBold": require("./assets/fonts/WorkSans-SemiBold.ttf"),
    "WorkSans-Bold": require("./assets/fonts/WorkSans-Bold.ttf"),
  });

  // Register for push notifications when logged in
  useEffect(() => {
    if (!session) return;

    async function setupPush() {
      const token = await registerForPushNotifications();
      if (token) {
        await savePushToken(token);
      }
    }

    setupPush();

    const sub = addNotificationResponseListener((leadId) => {
      console.log("Notification tapped for lead:", leadId);
    });

    return () => sub.remove();
  }, [session]);

  if (loading || !fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer linking={session ? linking : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={colors.black} />
      {session ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
