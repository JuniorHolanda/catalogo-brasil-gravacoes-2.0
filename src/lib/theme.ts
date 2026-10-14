export const THEME_COOKIE_NAME = "bg-theme";

export type ThemePreference = "system" | "light" | "dark";

/** Valida valores externos antes de tratá-los como uma preferência de tema. */
export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}
