import * as Notifications from "expo-notifications";
import { Platform, Linking } from "react-native";
import Constants from "expo-constants";
import { supabase } from "./supabase";

// Notification action identifiers
export const NAG_CATEGORY = "nag_reminder";
export const NAG_CATEGORY_NO_PHONE = "nag_reminder_no_phone";
export const ACTION_CALL = "call_back";
export const ACTION_SNOOZE = "snooze_1hr";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Register notification categories with action buttons.
// Must be called before notifications arrive so the OS knows the actions.
export async function registerNotificationCategories(): Promise<void> {
  // Full actions for leads with phone numbers
  await Notifications.setNotificationCategoryAsync(NAG_CATEGORY, [
    {
      identifier: ACTION_CALL,
      buttonTitle: "Call Back",
      options: { opensAppToForeground: true },
    },
    {
      identifier: ACTION_SNOOZE,
      buttonTitle: "Snooze 1hr",
      options: { opensAppToForeground: false },
    },
  ]);

  // Snooze-only for leads without phone numbers
  await Notifications.setNotificationCategoryAsync(NAG_CATEGORY_NO_PHONE, [
    {
      identifier: ACTION_SNOOZE,
      buttonTitle: "Snooze 1hr",
      options: { opensAppToForeground: false },
    },
  ]);
}

export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (__DEV__) console.log("[push] existing permission:", existingStatus);

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    if (__DEV__) console.log("[push] requested permission, got:", status);
  }

  if (finalStatus !== "granted") {
    if (__DEV__) console.warn("[push] permission not granted:", finalStatus);
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("nags", {
      name: "Lead Reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
    });
    if (__DEV__) console.log("[push] android notification channel created");
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn("[push] Missing EAS projectId in app.json — push tokens will not work");
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    if (__DEV__) console.log("[push] got token:", tokenData.data);
    return tokenData.data;
  } catch (err) {
    console.error("[push] failed to get push token:", err);
    return null;
  }
}

export async function savePushToken(token: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("users")
    .update({ push_token: token })
    .eq("id", user.id);

  if (error) {
    console.warn("Failed to save push token:", error);
  }
}

export interface NotificationAction {
  leadId?: string;
  phone?: string;
  actionId: string;
}

export function addNotificationResponseListener(
  callback: (action: NotificationAction) => void
) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data ?? {};
    const leadId = typeof data.leadId === "string" ? data.leadId : undefined;
    const phone = typeof data.phone === "string" ? data.phone : undefined;
    const actionId = response.actionIdentifier ?? Notifications.DEFAULT_ACTION_IDENTIFIER;
    callback({ leadId, phone, actionId });
  });
}

// Handle the "snooze 1hr" action directly from the notification
export async function snoozeLeadFromNotification(leadId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const until = new Date(Date.now() + 3600000).toISOString();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("leads")
    .update({ snoozed_until: until, updated_at: now })
    .eq("id", leadId)
    .eq("user_id", user.id);
  if (error) {
    if (__DEV__) console.warn("[push] failed to snooze from notification:", error);
    return;
  }
  await supabase.from("lead_events").insert({
    lead_id: leadId,
    user_id: user.id,
    event_type: "snoozed",
    metadata: { until, source: "notification_action" },
  });
}
