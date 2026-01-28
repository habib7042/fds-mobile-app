import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/lib/auth-context";

/**
 * Root index - handles authentication routing
 * Redirects to login if not authenticated, otherwise to main app
 */
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/login" as any);
    } else if (isAuthenticated && !inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace("/(tabs)" as any);
    }
  }, [isAuthenticated, isLoading, segments]);

  // Show loading indicator while checking auth
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
