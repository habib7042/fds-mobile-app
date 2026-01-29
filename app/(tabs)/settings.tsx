import { ScrollView, Text, View, TouchableOpacity, Switch, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  requestNotificationPermissions,
  sendImmediateStatementReminder,
  resetStatementReminder,
  type NotificationPreferences,
} from "@/lib/notification-service";

export default function SettingsScreen() {
  const colors = useColors();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error("Failed to load preferences:", error);
      Alert.alert("Error", "Failed to load notification settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReminders = async (value: boolean) => {
    if (!preferences) return;

    setSaving(true);
    try {
      if (value) {
        // Request permission if enabling
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
          Alert.alert(
            "Permission Required",
            "Please enable notifications in your device settings to receive statement reminders."
          );
          return;
        }
      }

      const updated = { ...preferences, statementReminders: value };
      await saveNotificationPreferences(updated);
      setPreferences(updated);
    } catch (error) {
      console.error("Failed to save preferences:", error);
      Alert.alert("Error", "Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeDay = async (day: number) => {
    if (!preferences) return;

    setSaving(true);
    try {
      const updated = { ...preferences, reminderDay: day };
      await saveNotificationPreferences(updated);
      setPreferences(updated);
    } catch (error) {
      console.error("Failed to save preferences:", error);
      Alert.alert("Error", "Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeHour = async (hour: number) => {
    if (!preferences) return;

    setSaving(true);
    try {
      const updated = { ...preferences, reminderHour: hour };
      await saveNotificationPreferences(updated);
      setPreferences(updated);
    } catch (error) {
      console.error("Failed to save preferences:", error);
      Alert.alert("Error", "Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendImmediateStatementReminder();
      Alert.alert("Success", "Test notification sent!");
    } catch (error) {
      console.error("Failed to send test notification:", error);
      Alert.alert("Error", "Failed to send test notification");
    }
  };

  const handleResetReminder = async () => {
    Alert.alert("Reset Reminder", "This will allow you to see the reminder again this month.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          try {
            await resetStatementReminder();
            Alert.alert("Success", "Reminder reset successfully");
          } catch (error) {
            Alert.alert("Error", "Failed to reset reminder");
          }
        },
      },
    ]);
  };

  if (loading || !preferences) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-foreground">Notifications</Text>
          <Text className="text-sm text-muted mt-1">Manage your notification preferences</Text>
        </View>

        {/* Statement Reminders Section */}
        <View className="px-6 mb-6">
          <View className="bg-surface rounded-xl border border-border p-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Statement Reminders</Text>
                <Text className="text-sm text-muted mt-1">Get reminded to download your monthly statement</Text>
              </View>
              <Switch
                value={preferences.statementReminders}
                onValueChange={handleToggleReminders}
                disabled={saving}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={preferences.statementReminders ? colors.primary : colors.muted}
              />
            </View>

            {preferences.statementReminders && (
              <View className="border-t border-border pt-4">
                {/* Reminder Day */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-foreground mb-2">Reminder Day</Text>
                  <View className="flex-row gap-2 flex-wrap">
                    {[1, 5, 10, 15, 20, 25].map((day) => (
                      <TouchableOpacity
                        key={day}
                        onPress={() => handleChangeDay(day)}
                        disabled={saving}
                        className={`px-3 py-2 rounded-lg border ${
                          preferences.reminderDay === day
                            ? "bg-primary border-primary"
                            : "bg-background border-border"
                        }`}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            preferences.reminderDay === day ? "text-white" : "text-foreground"
                          }`}
                        >
                          {day}th
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Reminder Hour */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-foreground mb-2">Reminder Time</Text>
                  <View className="flex-row gap-2 flex-wrap">
                    {[8, 9, 10, 12, 14, 18].map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        onPress={() => handleChangeHour(hour)}
                        disabled={saving}
                        className={`px-3 py-2 rounded-lg border ${
                          preferences.reminderHour === hour
                            ? "bg-primary border-primary"
                            : "bg-background border-border"
                        }`}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            preferences.reminderHour === hour ? "text-white" : "text-foreground"
                          }`}
                        >
                          {hour}:00
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Test Notification */}
                <TouchableOpacity
                  onPress={handleTestNotification}
                  className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex-row items-center justify-center"
                  activeOpacity={0.7}
                >
                  <IconSymbol name="bell.fill" size={18} color={colors.primary} />
                  <Text className="text-primary font-semibold ml-2">Send Test Notification</Text>
                </TouchableOpacity>

                {/* Reset Reminder */}
                <TouchableOpacity
                  onPress={handleResetReminder}
                  className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex-row items-center justify-center mt-2"
                  activeOpacity={0.7}
                >
                  <IconSymbol name="arrow.clockwise" size={18} color={colors.warning} />
                  <Text className="text-warning font-semibold ml-2">Reset This Month</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Info Section */}
        <View className="px-6">
          <View className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <View className="flex-row gap-3">
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground mb-1">About Reminders</Text>
                <Text className="text-xs text-muted leading-relaxed">
                  You will receive a notification on your selected day and time each month. You can change these
                  settings anytime. Make sure notifications are enabled in your device settings.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
