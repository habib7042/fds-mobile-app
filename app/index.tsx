import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/lib/auth-context";

/**
 * Root index - handles authentication routing
 * Redirects to login if not authenticated, otherwise to main app
 */
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Always redirect based on auth state
    if (isAuthenticated) {
      router.replace("/(tabs)" as any);
    } else {
      router.replace("/login" as any);
    }
  }, [isAuthenticated, isLoading]);

  // Show loading indicator while checking auth
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
