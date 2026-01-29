import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as Notifications from "expo-notifications";
import { apiClient, type Member } from "./api-client";
import {
  scheduleMonthlyStatementReminder,
  setupNotificationResponseHandler,
} from "./notification-service";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  member: Member | null;
  accountNumber: string | null;
  login: (phone: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMemberData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [accountNumber, setAccountNumber] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Set up notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setupNotifications();
    }
  }, [isAuthenticated, isLoading]);

  const setupNotifications = async () => {
    try {
      // Schedule monthly statement reminder
      await scheduleMonthlyStatementReminder();

      // Set up notification response handler
      setupNotificationResponseHandler(() => {
        console.log("Statement reminder tapped");
      });
    } catch (error) {
      console.error("Failed to setup notifications:", error);
    }
  };

  const checkAuth = async () => {
    try {
      const authenticated = await apiClient.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const storedAccountNumber = await apiClient.getAccountNumber();
        setAccountNumber(storedAccountNumber);
        
        if (storedAccountNumber) {
          try {
            await fetchMemberData(storedAccountNumber);
          } catch (fetchError) {
            // If fetching member data fails, clear auth and continue
            console.error("Failed to fetch member data, clearing auth:", fetchError);
            await apiClient.clearAuth();
            setIsAuthenticated(false);
            setAccountNumber(null);
          }
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMemberData = async (accNumber: string) => {
    try {
      const data = await apiClient.getMemberData(accNumber);
      setMember(data);
    } catch (error) {
      console.error("Failed to fetch member data:", error);
      throw error;
    }
  };

  const login = async (phone: string, pin: string) => {
    try {
      const response = await apiClient.login(phone, pin);
      setIsAuthenticated(true);
      setMember(response.member);
      setAccountNumber(response.member.accountNumber);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setIsAuthenticated(false);
      setMember(null);
      setAccountNumber(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const refreshMemberData = async () => {
    if (accountNumber) {
      await fetchMemberData(accountNumber);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        member,
        accountNumber,
        login,
        logout,
        refreshMemberData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { scheduleMonthlyStatementReminder };
