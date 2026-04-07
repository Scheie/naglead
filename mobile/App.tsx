import { useEffect, useRef } from "react";
import { StatusBar, TouchableOpacity, Text as RNText } from "react-native";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.zinc[900],
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RNText style={{ fontSize: 18 }}>⚙</RNText>
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
    </AppStack.Navigator>
  );
}

export default function App() {
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
      const token = await registerForPushNotifications();
      if (token) {
        await savePushToken(token);
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
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef} linking={session ? linking : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={colors.black} />
      {session ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
