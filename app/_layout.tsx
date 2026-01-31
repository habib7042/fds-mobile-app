import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      setInitialRoute(token ? "(tabs)" : "login");
    } catch {
      setInitialRoute("login");
    }
  };

  if (initialRoute === null) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
