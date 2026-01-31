import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "https://newfds.vercel.app/api";

export default function ProfileScreen() {
  const router = useRouter();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      const tokenStr = await AsyncStorage.getItem("token");
      if (!tokenStr) return;

      const member = JSON.parse(tokenStr);
      const response = await axios.get(`${API_URL}/member/${member.id}`);
      setMember(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>Profile</Text>

        {member && (
          <View style={{ backgroundColor: "#f5f5f5", padding: 20, borderRadius: 12, marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 15 }}>Member Information</Text>
            <Text style={{ fontSize: 14, marginBottom: 10 }}>Name: {member.name}</Text>
            <Text style={{ fontSize: 14, marginBottom: 10 }}>Mobile: {member.mobile}</Text>
            <Text style={{ fontSize: 14, marginBottom: 10 }}>Member ID: {member.id}</Text>
            <Text style={{ fontSize: 14, marginBottom: 10 }}>Balance: ৳{member.balance || 0}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: "#ef4444",
            padding: 15,
            borderRadius: 8,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
