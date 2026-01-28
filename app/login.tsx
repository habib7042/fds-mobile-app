import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const REMEMBER_ME_KEY = "fds_remember_mobile";

export default function LoginScreen() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const colors = useColors();

  useEffect(() => {
    loadRememberedMobile();
  }, []);

  const loadRememberedMobile = async () => {
    try {
      const saved = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      if (saved) {
        setMobileNumber(saved);
        setRememberMe(true);
      }
    } catch (error) {
      console.error("Failed to load remembered mobile:", error);
    }
  };

  const handleLogin = async () => {
    if (!mobileNumber.trim()) {
      Alert.alert("Error", "Please enter your mobile number");
      return;
    }

    if (pin.length !== 6) {
      Alert.alert("Error", "Please enter a 6-digit PIN");
      return;
    }

    setLoading(true);

    try {
      await login(mobileNumber, pin);

      // Save mobile number if remember me is checked
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_ME_KEY, mobileNumber);
      } else {
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
      }

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login failed:", error);
      Alert.alert(
        "Login Failed",
        error.response?.data?.error || "Invalid mobile number or PIN. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 6) {
      setPin(pin + digit);
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleClearMobile = () => {
    setMobileNumber("");
    setRememberMe(false);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 justify-center">
          {/* Logo and Title */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4">
              <IconSymbol name="house.fill" size={48} color="#ffffff" />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2">FDS Member</Text>
            <Text className="text-base text-muted text-center">
              Login to access your account
            </Text>
          </View>

          {/* Mobile Number Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">Mobile Number</Text>
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 h-12 px-4 bg-surface border border-border rounded-lg text-foreground"
                placeholder="017xxxxxxxx"
                placeholderTextColor={colors.muted}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
                maxLength={11}
                editable={!loading}
              />
              {mobileNumber.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearMobile}
                  className="ml-2 w-12 h-12 items-center justify-center"
                  activeOpacity={0.6}
                >
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Remember Me */}
          <TouchableOpacity
            onPress={() => setRememberMe(!rememberMe)}
            className="flex-row items-center mb-6"
            activeOpacity={0.6}
          >
            <View
              className="w-5 h-5 border-2 rounded mr-2 items-center justify-center"
              style={{ borderColor: colors.border }}
            >
              {rememberMe && (
                <View className="w-3 h-3 bg-primary rounded" />
              )}
            </View>
            <Text className="text-sm text-foreground">Remember mobile number</Text>
          </TouchableOpacity>

          {/* PIN Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">PIN</Text>
            <View className="flex-row justify-center gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <View
                  key={index}
                  className="w-12 h-12 bg-surface border border-border rounded-lg items-center justify-center"
                >
                  <Text className="text-2xl font-bold text-foreground">
                    {pin[index] ? "•" : ""}
                  </Text>
                </View>
              ))}
            </View>

            {/* Keypad */}
            <View className="gap-3">
              {/* Row 1 */}
              <View className="flex-row justify-center gap-3">
                {["1", "2", "3"].map((digit) => (
                  <TouchableOpacity
                    key={digit}
                    onPress={() => handlePinInput(digit)}
                    className="w-20 h-14 bg-surface rounded-lg items-center justify-center"
                    activeOpacity={0.6}
                    disabled={loading}
                  >
                    <Text className="text-2xl font-semibold text-foreground">{digit}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row 2 */}
              <View className="flex-row justify-center gap-3">
                {["4", "5", "6"].map((digit) => (
                  <TouchableOpacity
                    key={digit}
                    onPress={() => handlePinInput(digit)}
                    className="w-20 h-14 bg-surface rounded-lg items-center justify-center"
                    activeOpacity={0.6}
                    disabled={loading}
                  >
                    <Text className="text-2xl font-semibold text-foreground">{digit}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row 3 */}
              <View className="flex-row justify-center gap-3">
                {["7", "8", "9"].map((digit) => (
                  <TouchableOpacity
                    key={digit}
                    onPress={() => handlePinInput(digit)}
                    className="w-20 h-14 bg-surface rounded-lg items-center justify-center"
                    activeOpacity={0.6}
                    disabled={loading}
                  >
                    <Text className="text-2xl font-semibold text-foreground">{digit}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row 4 */}
              <View className="flex-row justify-center gap-3">
                <View className="w-20 h-14" />
                <TouchableOpacity
                  onPress={() => handlePinInput("0")}
                  className="w-20 h-14 bg-surface rounded-lg items-center justify-center"
                  activeOpacity={0.6}
                  disabled={loading}
                >
                  <Text className="text-2xl font-semibold text-foreground">0</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePinDelete}
                  className="w-20 h-14 bg-surface rounded-lg items-center justify-center"
                  activeOpacity={0.6}
                  disabled={loading}
                >
                  <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="h-14 bg-primary rounded-full items-center justify-center mt-6"
            activeOpacity={0.8}
            disabled={loading || mobileNumber.length === 0 || pin.length !== 6}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-semibold text-white">Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
