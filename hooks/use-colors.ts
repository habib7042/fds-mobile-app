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
  primary: "#0a7ea4",
  background: "#ffffff",
  surface: "#f5f5f5",
  foreground: "#11181C",
  muted: "#687076",
  border: "#E5E7EB",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  tint: "#0a7ea4",
};

const darkColors: ThemeColorPalette = {
  primary: "#0a7ea4",
  background: "#151718",
  surface: "#1e2022",
  foreground: "#ECEDEE",
  muted: "#9BA1A6",
  border: "#334155",
  success: "#4ADE80",
  warning: "#FBBF24",
  error: "#F87171",
  tint: "#0a7ea4",
};

export function useColors(): ThemeColorPalette {
  const colorScheme = useColorScheme();
  return colorScheme === "dark" ? darkColors : lightColors;
}
