import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFICATION_PREFERENCES_KEY = "notification_preferences";
const LAST_STATEMENT_REMINDER_KEY = "last_statement_reminder";

export interface NotificationPreferences {
  statementReminders: boolean;
  reminderDay: number; // 1-31, day of month
  reminderHour: number; // 0-23
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  statementReminders: true,
  reminderDay: 1, // First day of month
  reminderHour: 9, // 9 AM
};

/**
 * Request user permission for notifications
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.error("Failed to request notification permissions:", error);
    return false;
  }
}

/**
 * Get saved notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const saved = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error("Failed to get notification preferences:", error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save notification preferences
 */
export async function saveNotificationPreferences(
  preferences: NotificationPreferences
): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error("Failed to save notification preferences:", error);
    throw error;
  }
}

/**
 * Schedule monthly statement reminder notification
 */
export async function scheduleMonthlyStatementReminder(): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log("Notification permission not granted");
      return;
    }

    const preferences = await getNotificationPreferences();
    if (!preferences.statementReminders) {
      console.log("Statement reminders disabled");
      return;
    }

    // Cancel existing notification
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Calculate next reminder date
    const now = new Date();
    let nextReminder = new Date(now.getFullYear(), now.getMonth(), preferences.reminderDay);
    nextReminder.setHours(preferences.reminderHour, 0, 0, 0);

    // If the date has already passed this month, schedule for next month
    if (nextReminder < now) {
      nextReminder = new Date(now.getFullYear(), now.getMonth() + 1, preferences.reminderDay);
      nextReminder.setHours(preferences.reminderHour, 0, 0, 0);
    }

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Monthly Statement Ready",
        body: "Download your account statement for this month",
        data: {
          type: "statement_reminder",
          action: "download_statement",
        },
        sound: "default",
        badge: 1,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        year: nextReminder.getFullYear(),
        month: nextReminder.getMonth() + 1,
        day: nextReminder.getDate(),
        hour: nextReminder.getHours(),
        minute: nextReminder.getMinutes(),
        repeats: true, // Repeat monthly
      },
    });

    console.log("Monthly statement reminder scheduled for:", nextReminder);
  } catch (error) {
    console.error("Failed to schedule monthly reminder:", error);
    throw error;
  }
}

/**
 * Send immediate statement reminder notification
 */
export async function sendImmediateStatementReminder(): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log("Notification permission not granted");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your Statement is Ready",
        body: "Download your latest account statement from the profile screen",
        data: {
          type: "statement_reminder",
          action: "download_statement",
        },
        sound: "default",
        badge: 1,
      },
      trigger: null,
    });
  } catch (error) {
    console.error("Failed to send immediate reminder:", error);
    throw error;
  }
}

/**
 * Set up notification response handler
 */
export function setupNotificationResponseHandler(
  onStatementReminderTapped: () => void
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;

    if (data.type === "statement_reminder" && data.action === "download_statement") {
      onStatementReminderTapped();
    }
  });

  return () => subscription.remove();
}

/**
 * Check if it's time to show a statement reminder
 */
export async function shouldShowStatementReminder(): Promise<boolean> {
  try {
    const preferences = await getNotificationPreferences();
    if (!preferences.statementReminders) {
      return false;
    }

    const lastReminder = await AsyncStorage.getItem(LAST_STATEMENT_REMINDER_KEY);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;

    // Show reminder only once per month
    if (lastReminder !== currentMonth) {
      await AsyncStorage.setItem(LAST_STATEMENT_REMINDER_KEY, currentMonth);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Failed to check statement reminder:", error);
    return false;
  }
}

/**
 * Reset statement reminder for testing
 */
export async function resetStatementReminder(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LAST_STATEMENT_REMINDER_KEY);
    console.log("Statement reminder reset");
  } catch (error) {
    console.error("Failed to reset statement reminder:", error);
    throw error;
  }
}
