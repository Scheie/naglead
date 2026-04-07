import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  // Check permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  // Android needs a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("nags", {
      name: "Lead Reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
    });
  }

  // Get Expo Push Token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: "", // Set via app.json extra.eas.projectId
  });

  return tokenData.data;
}

export async function savePushToken(token: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("users")
    .update({ push_token: token })
    .eq("id", user.id);
}

export function addNotificationResponseListener(
  callback: (leadId: string) => void
) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const leadId = response.notification.request.content.data?.leadId;
    if (leadId && typeof leadId === "string") {
      callback(leadId);
    }
  });
}
