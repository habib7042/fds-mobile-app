import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "FDS Member",
  slug: "fds-member-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  plugins: ["expo-router"],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#ffffff"
    }
  }
};

export default config;
