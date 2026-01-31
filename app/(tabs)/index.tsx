import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "https://newfds.vercel.app/api";

export default function DashboardScreen() {
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMemberData();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>Dashboard</Text>

        {member && (
          <>
            <View style={{ backgroundColor: "#f5f5f5", padding: 20, borderRadius: 12, marginBottom: 20 }}>
              <Text style={{ fontSize: 14, color: "#666", marginBottom: 5 }}>Account Balance</Text>
              <Text style={{ fontSize: 32, fontWeight: "bold", color: "#0a7ea4" }}>
                ৳{member.balance || 0}
              </Text>
            </View>

            <View style={{ backgroundColor: "#f5f5f5", padding: 15, borderRadius: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Member Info</Text>
              <Text style={{ fontSize: 14, marginBottom: 8 }}>Name: {member.name}</Text>
              <Text style={{ fontSize: 14, marginBottom: 8 }}>Mobile: {member.mobile}</Text>
              <Text style={{ fontSize: 14 }}>Member ID: {member.id}</Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
