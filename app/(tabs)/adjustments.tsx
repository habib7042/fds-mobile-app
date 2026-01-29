import { ScrollView, Text, View, RefreshControl, ActivityIndicator } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import type { FundAdjustment } from "@/lib/api-client";

export default function AdjustmentsScreen() {
  const { member, isLoading, refreshMemberData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const colors = useColors();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMemberData();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading || !member) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  // Sort adjustments by date (newest first)
  const sortedAdjustments = [...(member.fundAdjustments || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate totals
  const totalCharges = sortedAdjustments
    .filter((adj) => adj.type === "CHARGE")
    .reduce((sum, adj) => sum + adj.amount, 0);

  const totalInterest = sortedAdjustments
    .filter((adj) => adj.type === "INTEREST")
    .reduce((sum, adj) => sum + adj.amount, 0);

  const netAdjustment = totalInterest - totalCharges;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-foreground">Adjustments</Text>
          <Text className="text-sm text-muted mt-1">Interest & charges history</Text>
        </View>

        {/* Summary Cards */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            {/* Interest Card */}
            <View className="flex-1 bg-success/10 rounded-xl p-4 border border-success/20">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs text-muted">Total Interest</Text>
                <IconSymbol name="arrow.right.circle.fill" size={16} color={colors.success} />
              </View>
              <Text className="text-2xl font-bold text-success">+৳{totalInterest.toFixed(2)}</Text>
            </View>

            {/* Charges Card */}
            <View className="flex-1 bg-error/10 rounded-xl p-4 border border-error/20">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs text-muted">Total Charges</Text>
                <IconSymbol name="arrow.right.circle.fill" size={16} color={colors.error} />
              </View>
              <Text className="text-2xl font-bold text-error">-৳{totalCharges.toFixed(2)}</Text>
            </View>
          </View>

          {/* Net Adjustment */}
          <View className="mt-3 bg-primary/10 rounded-xl p-4 border border-primary/20">
            <Text className="text-xs text-muted mb-1">Net Adjustment</Text>
            <Text className={`text-3xl font-bold ${netAdjustment >= 0 ? "text-success" : "text-error"}`}>
              {netAdjustment >= 0 ? "+" : ""}৳{netAdjustment.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Adjustments List */}
        {sortedAdjustments.length > 0 ? (
          <View className="px-6">
            <Text className="text-lg font-semibold text-foreground mb-3">All Adjustments</Text>
            <View className="bg-surface rounded-xl border border-border overflow-hidden">
              {sortedAdjustments.map((adjustment, index) => {
                const isInterest = adjustment.type === "INTEREST";
                const icon = isInterest ? "arrow.right.circle.fill" : "arrow.right.circle.fill";
                const color = isInterest ? colors.success : colors.error;
                const sign = isInterest ? "+" : "-";

                return (
                  <View
                    key={adjustment.id}
                    className={`p-4 flex-row items-center justify-between ${
                      index !== 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <View
                        className={`w-10 h-10 rounded-full items-center justify-center ${
                          isInterest ? "bg-success/10" : "bg-error/10"
                        }`}
                      >
                        <IconSymbol name={icon} size={20} color={color} />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-base font-medium text-foreground">
                          {adjustment.description || (isInterest ? "Interest" : "Charge")}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          {new Date(adjustment.date).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </Text>
                      </View>
                    </View>
                    <Text className={`text-lg font-bold ${isInterest ? "text-success" : "text-error"}`}>
                      {sign}৳{adjustment.amount.toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View className="px-6 py-12 items-center">
            <View className="w-20 h-20 bg-muted/20 rounded-full items-center justify-center mb-4">
              <IconSymbol name="list.bullet" size={40} color={colors.muted} />
            </View>
            <Text className="text-base font-medium text-foreground mb-2">No Adjustments</Text>
            <Text className="text-sm text-muted text-center">
              No interest or charges have been applied to your account yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
