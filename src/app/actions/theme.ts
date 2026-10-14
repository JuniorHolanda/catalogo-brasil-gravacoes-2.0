"use server";

import { cookies } from "next/headers";
import { isThemePreference, THEME_COOKIE_NAME } from "@/lib/theme";
import type { ThemePreference } from "@/lib/theme";

/** Valida e persiste a preferência de tema em um cookie protegido. */
export async function saveThemePreference(value: ThemePreference) {
  if (!isThemePreference(value)) {
    throw new Error("Preferência de tema inválida.");
  }

  const cookieStore = await cookies();

  if (value === "system") {
    cookieStore.delete(THEME_COOKIE_NAME);
    return;
  }

  cookieStore.set(THEME_COOKIE_NAME, value, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
