import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function ProfileScreen() {
  const { member, isLoading, logout } = useAuth();
  const router = useRouter();
  const colors = useColors();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/login" as any);
            } catch (error) {
              console.error("Logout failed:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
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

  const memberSince = new Date(member.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-foreground">Profile</Text>
          <Text className="text-sm text-muted mt-1">Your account information</Text>
        </View>

        {/* Profile Card */}
        <View className="mx-6 mb-6">
          <View className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 shadow-lg">
            <View className="items-center">
              {/* Profile Avatar */}
              <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4">
                {member.profileImage ? (
                  <Text className="text-4xl">👤</Text>
                ) : (
                  <IconSymbol name="person.fill" size={48} color="#ffffff" />
                )}
              </View>
              
              <Text className="text-2xl font-bold text-white text-center">{member.name}</Text>
              <Text className="text-white/80 text-sm mt-1">Account #{member.accountNumber}</Text>
              <Text className="text-white/70 text-xs mt-2">Member since {memberSince}</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Contact Information</Text>
          <View className="bg-surface rounded-xl border border-border overflow-hidden">
            {member.phone && (
              <View className="p-4 flex-row items-center">
                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                  <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-xs text-muted">Phone Number</Text>
                  <Text className="text-base font-medium text-foreground mt-1">{member.phone}</Text>
                </View>
              </View>
            )}
            
            {member.email && (
              <View className={`p-4 flex-row items-center ${member.phone ? 'border-t border-border' : ''}`}>
                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                  <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-xs text-muted">Email Address</Text>
                  <Text className="text-base font-medium text-foreground mt-1">{member.email}</Text>
                </View>
              </View>
            )}
            
            {member.address && (
              <View className={`p-4 flex-row items-start ${(member.phone || member.email) ? 'border-t border-border' : ''}`}>
                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                  <IconSymbol name="house.fill" size={20} color={colors.primary} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-xs text-muted">Address</Text>
                  <Text className="text-base font-medium text-foreground mt-1">{member.address}</Text>
                </View>
              </View>
            )}

            {!member.phone && !member.email && !member.address && (
              <View className="p-4">
                <Text className="text-sm text-muted text-center">No contact information available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Personal Information */}
        {(member.dob || member.nid || member.fatherName || member.motherName || member.maritalStatus) && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Personal Information</Text>
            <View className="bg-surface rounded-xl border border-border overflow-hidden">
              {member.dob && (
                <View className="p-4">
                  <Text className="text-xs text-muted">Date of Birth</Text>
                  <Text className="text-base font-medium text-foreground mt-1">{member.dob}</Text>
                </View>
              )}
              
              {member.nid && (
                <View className={`p-4 ${member.dob ? 'border-t border-border' : ''}`}>
                  <Text className="text-xs text-muted">National ID</Text>
                  <Text className="text-base font-medium text-foreground mt-1">{member.nid}</Text>
                </View>
              )}
              
              {member.fatherName && (
                <View className={`p-4 ${(member.dob || member.nid) ? 'border-t border-border' : ''}`}>
                  <Text className="text-xs text-muted">Father's Name</Text>
                  <Text className="text-base font-medium text-foreground mt-1">{member.fatherName}</Text>
                </View>
              )}
              
              {member.motherName && (
                <View className={`p-4 ${(member.dob || member.nid || member.fatherName) ? 'border-t border-border' : ''}`}>
                  <Text className="text-xs text-muted">Mother's Name</Text>
                  <Text className="text-base font-medium text-foreground mt-1">{member.motherName}</Text>
                </View>
              )}
              
              {member.maritalStatus && (
                <View className={`p-4 ${(member.dob || member.nid || member.fatherName || member.motherName) ? 'border-t border-border' : ''}`}>
                  <Text className="text-xs text-muted">Marital Status</Text>
                  <Text className="text-base font-medium text-foreground mt-1">{member.maritalStatus}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Nominee Information */}
        {(member.nomineeName || member.nomineeNid || member.nomineeRelation) && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Nominee Information</Text>
            <View className="bg-surface rounded-xl border border-border overflow-hidden">
              {member.nomineeName && (
                <View className="p-4">
                  <Text className="text-xs text-muted">Nominee Name</Text>
                  <Text className="text-base font-medium text-foreground mt-1">{member.nomineeName}</Text>
                </View>
              )}
              
              {member.nomineeRelation && (
                <View className={`p-4 ${member.nomineeName ? 'border-t border-border' : ''}`}>
                  <Text className="text-xs text-muted">Relationship</Text>
                  <Text className="text-base font-medium text-foreground mt-1">{member.nomineeRelation}</Text>
                </View>
              )}
              
              {member.nomineeNid && (
                <View className={`p-4 ${(member.nomineeName || member.nomineeRelation) ? 'border-t border-border' : ''}`}>
                  <Text className="text-xs text-muted">Nominee NID</Text>
                  <Text className="text-base font-medium text-foreground mt-1">{member.nomineeNid}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Logout Button */}
        <View className="px-6 mt-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-error/10 border border-error/20 rounded-xl p-4 flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <IconSymbol name="arrow.right.circle.fill" size={20} color={colors.error} />
            <Text className="text-base font-semibold text-error ml-2">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
