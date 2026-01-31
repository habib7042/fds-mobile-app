import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "https://newfds.vercel.app/api";

export default function LoginScreen() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!mobile || !pin) {
      Alert.alert("Error", "Please enter mobile number and PIN");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        mobile,
        pin
      });

      if (response.data.member) {
        await AsyncStorage.setItem("token", JSON.stringify(response.data.member));
        router.replace("/(tabs)");
      }
    } catch (error) {
      Alert.alert("Login Failed", "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center" }}>
        FDS Member
      </Text>

      <TextInput
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          padding: 12,
          marginBottom: 15,
          borderRadius: 8
        }}
      />

      <TextInput
        placeholder="4-Digit PIN"
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        keyboardType="number-pad"
        maxLength={4}
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          padding: 12,
          marginBottom: 20,
          borderRadius: 8
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#ccc" : "#0a7ea4",
          padding: 15,
          borderRadius: 8,
          alignItems: "center"
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
