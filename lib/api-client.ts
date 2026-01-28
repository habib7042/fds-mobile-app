import * as SecureStore from "expo-secure-store";
import axios, { type AxiosInstance } from "axios";

const API_BASE_URL = "https://newfds.vercel.app";

// Token storage keys
const AUTH_TOKEN_KEY = "fds_auth_token";
const ACCOUNT_NUMBER_KEY = "fds_account_number";

/**
 * API client for FDS backend
 */
class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    // Add request interceptor to attach auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear auth
          await this.clearAuth();
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Store auth token securely
   */
  async setAuthToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  }

  /**
   * Get stored auth token
   */
  async getAuthToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  }

  /**
   * Store account number
   */
  async setAccountNumber(accountNumber: string): Promise<void> {
    await SecureStore.setItemAsync(ACCOUNT_NUMBER_KEY, accountNumber);
  }

  /**
   * Get stored account number
   */
  async getAccountNumber(): Promise<string | null> {
    return await SecureStore.getItemAsync(ACCOUNT_NUMBER_KEY);
  }

  /**
   * Clear all auth data
   */
  async clearAuth(): Promise<void> {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(ACCOUNT_NUMBER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    const accountNumber = await this.getAccountNumber();
    return !!(token && accountNumber);
  }

  /**
   * Login with mobile number and PIN
   */
  async login(phone: string, pin: string) {
    const response = await this.client.post("/api/auth/member-login", {
      phone,
      pin,
    });
    
    // API doesn't return a token, so we'll use a simple flag
    if (response.data.member) {
      // Store a dummy token to indicate authenticated state
      await this.setAuthToken("authenticated");
      await this.setAccountNumber(response.data.member.accountNumber);
      
      // Fetch full member data
      const memberData = await this.getMemberData(response.data.member.accountNumber);
      return { member: memberData };
    }
    
    throw new Error("Login failed");
  }

  /**
   * Get member data by account number
   */
  async getMemberData(accountNumber: string) {
    const response = await this.client.get(`/api/member/${accountNumber}`);
    return response.data;
  }

  /**
   * Logout
   */
  async logout() {
    await this.clearAuth();
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export types
export interface Member {
  id: string;
  accountNumber: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  dob?: string;
  nid?: string;
  fatherName?: string;
  motherName?: string;
  maritalStatus?: string;
  nomineeName?: string;
  nomineeNid?: string;
  nomineeRelation?: string;
  profileImage?: string;
  nomineeImage?: string;
  createdAt: string;
  updatedAt: string;
  contributions: Contribution[];
  adjustments: Adjustment[];
  fundAdjustments: FundAdjustment[];
}

export interface Contribution {
  id: string;
  memberId: string;
  month: string;
  year: number;
  amount: number;
  paymentDate: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Adjustment {
  id: string;
  memberId: string;
  type: "CHARGE" | "INTEREST";
  amount: number;
  date: string;
  description?: string;
  createdAt: string;
}

export interface FundAdjustment {
  id: string;
  type: "CHARGE" | "INTEREST";
  amount: number;
  date: string;
  description?: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  member: Member;
}
