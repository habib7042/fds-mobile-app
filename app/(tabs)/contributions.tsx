import { ScrollView, Text, View, RefreshControl, ActivityIndicator } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import type { Contribution } from "@/lib/api-client";

export default function ContributionsScreen() {
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

  // Sort contributions by date (newest first)
  const sortedContributions = [...member.contributions].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  // Group contributions by year
  const contributionsByYear = sortedContributions.reduce((acc, contribution) => {
    const year = contribution.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(contribution);
    return acc;
  }, {} as Record<number, Contribution[]>);

  const years = Object.keys(contributionsByYear).sort((a, b) => Number(b) - Number(a));

  const totalContributions = member.contributions.reduce((sum, c) => sum + c.amount, 0);

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
          <Text className="text-2xl font-bold text-foreground">Contributions</Text>
          <Text className="text-sm text-muted mt-1">Your payment history</Text>
        </View>

        {/* Total Summary Card */}
        <View className="mx-6 mb-6">
          <View className="bg-primary/10 rounded-xl p-4 border border-primary/20">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-muted">Total Contributions</Text>
                <Text className="text-3xl font-bold text-foreground mt-1">৳{totalContributions.toFixed(2)}</Text>
              </View>
              <View className="w-16 h-16 bg-primary/20 rounded-full items-center justify-center">
                <IconSymbol name="dollarsign.circle.fill" size={32} color={colors.primary} />
              </View>
            </View>
            <View className="flex-row items-center mt-3 pt-3 border-t border-primary/20">
              <IconSymbol name="calendar" size={16} color={colors.muted} />
              <Text className="text-sm text-muted ml-2">
                {member.contributions.length} payment{member.contributions.length !== 1 ? 's' : ''} made
              </Text>
            </View>
          </View>
        </View>

        {/* Contributions by Year */}
        {years.length > 0 ? (
          <View className="px-6">
            {years.map((year) => {
              const yearContributions = contributionsByYear[Number(year)];
              const yearTotal = yearContributions.reduce((sum, c) => sum + c.amount, 0);

              return (
                <View key={year} className="mb-6">
                  {/* Year Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-semibold text-foreground">{year}</Text>
                    <Text className="text-sm font-medium text-muted">
                      {yearContributions.length} payment{yearContributions.length !== 1 ? 's' : ''} • ৳{yearTotal.toFixed(2)}
                    </Text>
                  </View>

                  {/* Contributions List */}
                  <View className="bg-surface rounded-xl border border-border overflow-hidden">
                    {yearContributions.map((contribution, index) => (
                      <View
                        key={contribution.id}
                        className={`p-4 ${index !== 0 ? 'border-t border-border' : ''}`}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text className="text-base font-medium text-foreground">
                              {new Date(contribution.paymentDate).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                              })}
                            </Text>
                            <Text className="text-xs text-muted mt-1">
                              Paid on {new Date(contribution.paymentDate).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </Text>
                            {contribution.description && (
                              <Text className="text-sm text-muted mt-2">{contribution.description}</Text>
                            )}
                          </View>
                          <View className="ml-4 items-end">
                            <Text className="text-lg font-bold text-success">৳{contribution.amount.toFixed(2)}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="px-6 py-12 items-center">
            <View className="w-20 h-20 bg-muted/20 rounded-full items-center justify-center mb-4">
              <IconSymbol name="list.bullet" size={40} color={colors.muted} />
            </View>
            <Text className="text-base font-medium text-foreground mb-2">No Contributions Yet</Text>
            <Text className="text-sm text-muted text-center">
              Your contribution history will appear here once you make your first payment.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
