import { useColorScheme } from "react-native";

export interface ThemeColorPalette {
  primary: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  tint: string;
}

const lightColors: ThemeColorPalette = {
  primary: "#2563EB", // Blue
  background: "#ffffff",
  surface: "#f5f5f5",
  foreground: "#11181C",
  muted: "#687076",
  border: "#E5E7EB",
  success: "#16A34A", // Green
  warning: "#CA8A04", // Yellow
  error: "#DC2626", // Red
  tint: "#2563EB",
};

const darkColors: ThemeColorPalette = {
  primary: "#3B82F6", // Lighter Blue for dark mode
  background: "#151718",
  surface: "#1e2022",
  foreground: "#ECEDEE",
  muted: "#9BA1A6",
  border: "#334155",
  success: "#22C55E", // Lighter Green
  warning: "#EAB308", // Lighter Yellow
  error: "#EF4444", // Lighter Red
  tint: "#3B82F6",
};

export function useColors(): ThemeColorPalette {
  const colorScheme = useColorScheme();
  return colorScheme === "dark" ? darkColors : lightColors;
}
