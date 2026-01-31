import { ScrollView, Text, View, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const { member, isLoading, refreshMemberData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
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

  // Calculate statistics
  const totalContributions = member.contributions.reduce((sum, c) => sum + c.amount, 0);
  const contributionCount = member.contributions.length;
  const averageContribution = contributionCount > 0 ? totalContributions / contributionCount : 0;

  // Calculate adjustments from fundAdjustments
  // INTEREST adds to balance, CHARGE subtracts from balance
  const totalAdjustments = member.fundAdjustments?.reduce((sum, adj) => {
    if (adj.type === "INTEREST") {
      return sum + adj.amount;
    } else if (adj.type === "CHARGE") {
      return sum - adj.amount;
    }
    return sum;
  }, 0) || 0;

  const balance = totalContributions + totalAdjustments;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-sm text-muted">Welcome back,</Text>
          <Text className="text-2xl font-bold text-foreground mt-1">{member.name}</Text>
          <Text className="text-sm text-muted mt-1">Account #{member.accountNumber}</Text>
        </View>

        {/* Balance Card - Updated to use Primary Blue background */}
        <View className="mx-6 mb-6">
          <View className="bg-primary rounded-2xl p-6 shadow-lg">
            <View className="flex-row items-center mb-2">
              <IconSymbol name="dollarsign.circle.fill" size={24} color="#ffffff" />
              <Text className="text-white/90 text-sm ml-2 font-medium">Main Balance</Text>
            </View>
            <Text className="text-white text-4xl font-bold">৳{balance.toFixed(2)}</Text>
            <View className="flex-row items-center mt-4 pt-4 border-t border-white/20">
              <View className="flex-1">
                <Text className="text-white/80 text-xs font-medium uppercase tracking-wider">Contributions</Text>
                <Text className="text-white text-lg font-bold">৳{totalContributions.toFixed(2)}</Text>
              </View>
              {totalAdjustments !== 0 && (
                <View className="flex-1">
                  <Text className="text-white/80 text-xs font-medium uppercase tracking-wider">Adjustments</Text>
                  <Text className={`text-lg font-bold ${totalAdjustments >= 0 ? 'text-white' : 'text-red-300'}`}>
                    {totalAdjustments >= 0 ? '+' : ''}৳{totalAdjustments.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Quick Stats</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <IconSymbol name="calendar" size={20} color={colors.primary} />
              <Text className="text-2xl font-bold text-foreground mt-2">{contributionCount}</Text>
              <Text className="text-xs text-muted mt-1">Total Months</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <IconSymbol name="dollarsign.circle.fill" size={20} color={colors.success} />
              <Text className="text-2xl font-bold text-foreground mt-2">৳{averageContribution.toFixed(0)}</Text>
              <Text className="text-xs text-muted mt-1">Avg/Month</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Quick Actions</Text>
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/contributions" as any)}
              className="bg-surface rounded-xl p-4 flex-row items-center justify-between border border-border"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-success/10 rounded-full items-center justify-center">
                  <IconSymbol name="list.bullet" size={20} color={colors.success} />
                </View>
                <View className="ml-3">
                  <Text className="text-base font-semibold text-foreground">View Contributions</Text>
                  <Text className="text-xs text-muted">See your payment history</Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile" as any)}
              className="bg-surface rounded-xl p-4 flex-row items-center justify-between border border-border"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                  <IconSymbol name="person.fill" size={20} color={colors.primary} />
                </View>
                <View className="ml-3">
                  <Text className="text-base font-semibold text-foreground">My Profile</Text>
                  <Text className="text-xs text-muted">View account details</Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Contributions */}
        {member.contributions.length > 0 && (
          <View className="px-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Recent Contributions</Text>
            <View className="bg-surface rounded-xl border border-border overflow-hidden">
              {member.contributions.slice(0, 5).map((contribution, index) => (
                <View
                  key={contribution.id}
                  className={`p-4 flex-row items-center justify-between ${
                    index !== 0 ? 'border-t border-border' : ''
                  }`}
                >
                  <View>
                    <Text className="text-base font-medium text-foreground">
                      {new Date(contribution.paymentDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                    {contribution.description && (
                      <Text className="text-xs text-muted mt-1">{contribution.description}</Text>
                    )}
                  </View>
                  <Text className="text-base font-semibold text-success">৳{contribution.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
            {member.contributions.length > 5 && (
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/contributions" as any)}
                className="mt-3 py-2 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-medium text-primary">View All Contributions</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
