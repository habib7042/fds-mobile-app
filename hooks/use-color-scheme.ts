import { useColorScheme as useRNColorScheme } from "react-native";

export type ColorScheme = "light" | "dark" | null | undefined;

export function useColorScheme(): ColorScheme {
  return useRNColorScheme();
}
